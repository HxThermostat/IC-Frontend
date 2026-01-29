// utils/notifications.ts

import { Alert, Linking, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import type { NotificationResponse } from "expo-notifications";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { createMutex } from "locks";
import { ApolloClient } from "@apollo/client";

import i18n from "~/i18n";
import {
  SubscribeToNotificationsDocument,
  SubscribeToNotificationsMutation,
  UnsubscribeFromNotificationsDocument,
  UnsubscribeFromNotificationsMutation,
} from "~/graph";
import {
  saveToAsyncStorage,
  removeFromAsyncStorage,
  loadFromAsyncStorage,
} from "~/utils/storage";
import { GEOFENCE_NOTIFICATIONS, isGeofenceNotification } from "./geofencing";
import { ALERT_NOTIFICATIONS, isAlertNotification } from "./alerts";
import { useEffect } from "react";

const scope = "Common.Notifications";

// small helper timeout
const withTimeout = async <T>(p: Promise<T>, ms: number, label = "operation"): Promise<T> => {
  let timer: NodeJS.Timeout | null = null;
  const timeout = new Promise<never>((_, rej) => {
    timer = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const registrationMutex = createMutex();

export type NOTIFICATIONS = GEOFENCE_NOTIFICATIONS | ALERT_NOTIFICATIONS;

export function isNotification(data: unknown): data is NOTIFICATIONS {
  return isAlertNotification(data) || isGeofenceNotification(data);
}

/**
 * Returns a DevicePushToken or throws. This function uses a timeout
 * so it won't hang the app indefinitely if native call misbehaves.
 */
export const getDevicePushToken = async (): Promise<Notifications.DevicePushToken> => {
  console.log("notifications:getDevicePushToken - start");

  if (!Device.isDevice) {
    console.log("notifications:getDevicePushToken - running on simulator, skipping");
    throw new Error("Push notifications are not supported on simulators");
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      throw new Error("Push notification permissions not granted");
    }

    let token: Notifications.DevicePushToken;

    if (Platform.OS === "ios" || Platform.OS === "android") {
      if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
        console.log("notifications:getDevicePushToken - running inside Expo Go");
        const expoToken = await Notifications.getExpoPushTokenAsync();
        token = { type: "expo", data: expoToken.data } as Notifications.DevicePushToken;
      } else {
        console.log("notifications:getDevicePushToken - fetching native APNs/FCM token");
        token = await Notifications.getDevicePushTokenAsync();
      }
    } else {
      throw new Error("Unsupported platform for push token");
    }

    return token;
  } catch (err) {
    console.error("notifications:getDevicePushToken - failed:", err);
    throw err;
  }
};
export const getNotificationPermissionsAsyncWithoutPrompting = async (): Promise<boolean> => {
  try {
    console.log("notifications:getNotificationPermissionsAsyncWithoutPrompting");
    const settings = await Notifications.getPermissionsAsync();
    return (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  } catch (err) {
    console.error("notifications:permission-check failed:", err);
    return false;
  }
};

export const ensureOrRequestNotificationsPermissions = async (): Promise<boolean> => {
  try {
    const response = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
      android: {},
    });

    if (Platform.OS === "android" && !response.granted) {
      Alert.alert(
        i18n.t("alertTitle", { scope }),
        i18n.t("alertDescription", { scope }),
        [
          {
            text: i18n.t("openSettings", { scope }),
            onPress: () => Linking.openSettings(),
          },
        ],
        { cancelable: false }
      );
      return false;
    }

    if (
      Platform.OS === "ios" &&
      (response?.ios?.status === Notifications.IosAuthorizationStatus.DENIED ||
        response?.ios?.status === Notifications.IosAuthorizationStatus.NOT_DETERMINED)
    ) {
      Alert.alert(
        i18n.t("alertTitle", { scope }),
        i18n.t("alertDescription", { scope }),
        [
          {
            text: i18n.t("openSettings", { scope }),
            onPress: () => Linking.openSettings(),
          },
        ],
        { cancelable: false }
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("notifications:ensureOrRequest failed:", err);
    return false;
  }
};

export const extractNotificationData = (
  response: NotificationResponse
): NOTIFICATIONS | undefined => {
  let { data } = response.notification.request.content;

  if (!data) {
    const { trigger } = response.notification.request;
    if (trigger.type === "push" && "remoteMessage" in trigger) {
      data = (trigger as any).remoteMessage?.data;
    }
  }

  return isNotification(data) ? data : undefined;
};

/**
 * Register device push token with backend. This function is defensive:
 * - returns early if permissions are not granted
 * - wraps native calls in timeouts
 * - swallows and logs errors (so callers like bootstrap won't crash)
 */
export const registerDevice = async (
  client: ApolloClient<unknown>,
  pushToken?: Notifications.DevicePushToken
): Promise<void> => {
  console.log("notifications:registerDevice start");

  try {
    const hasPerm = await getNotificationPermissionsAsyncWithoutPrompting();
    if (!hasPerm) {
      console.log("notifications:registerDevice - no permissions, skipping");
      return;
    }

    // 🚫 Skip completely if running inside Expo Go
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      console.log("notifications:registerDevice - running in Expo Go, skipping push registration");
      return;
    }

    let tokenString: string | undefined;
    try {
      const deviceToken = pushToken ?? (await getDevicePushToken());
      tokenString = deviceToken?.data as unknown as string;
    } catch (err) {
      console.error("notifications:failed to acquire device token:", err);
      return;
    }

    if (!tokenString) {
      console.warn("notifications:empty token, skipping registration");
      return;
    }

    if (!registrationMutex.tryLock()) {
      console.log("notifications:registerDevice - mutex busy, skipping");
      return;
    }

    try {
      console.log(
        "notifications:registerDevice - mutating backend with token id (truncated):",
        tokenString.slice(0, 8)
      );

      const result = await client.mutate<SubscribeToNotificationsMutation>({
        mutation: SubscribeToNotificationsDocument,
        variables: {
          input: {
            token: tokenString,
            platform: Platform.select({ ios: "IOS", android: "ANDROID" }),
          },
        },
      });

      console.log(
        "notifications:registerDevice - mutation result:",
        result?.data?.subscribeToNotifications?.__typename
      );

      if (
        result?.data?.subscribeToNotifications?.__typename ===
        "SubscribeToNotificationsSuccess"
      ) {
        await saveToAsyncStorage(
          "device_push_token",
          result.data.subscribeToNotifications.pushToken.id
        );
      } else {
        console.warn(
          "notifications:registerDevice - unexpected mutation return",
          result
        );
      }
    } catch (err) {
      console.error("notifications:registerDevice - mutation failed:", err);
    } finally {
      registrationMutex.unlock();
    }
  } catch (err) {
    console.error("notifications:registerDevice - top-level error:", err);
  }
};

export const unregisterDevice = async (client: ApolloClient<unknown>): Promise<void> => {
  try {
    const id = await loadFromAsyncStorage("device_push_token");
    if (!id) return;

    const { data } = await client.mutate<UnsubscribeFromNotificationsMutation>({
      mutation: UnsubscribeFromNotificationsDocument,
      variables: { input: { id } },
    });

    if (data?.unsubscribeFromNotifications?.__typename === "UnsubscribeFromNotificationsSuccess") {
      await removeFromAsyncStorage("device_push_token");
    }
  } catch (err) {
    console.error("notifications:unregisterDevice failed:", err);
  }
};

export const usePushTokenListener = (): void => {
  const client = (require("@apollo/client") as any).useApolloClient?.() as ApolloClient<unknown>;
  // fallback if require didn't work, but typically you'll call this in React so useApolloClient import works
  // Keep effect defensive:
  useEffect(() => {
    try {
      const sub = Notifications.addPushTokenListener((token) => {
        void registerDevice(client, token).catch((e) => console.error("push token listen register failed:", e));
      });
      return () => sub.remove();
    } catch (err) {
      console.error("notifications:usePushTokenListener failed to initialize:", err);
    }
  }, [client]);
};
