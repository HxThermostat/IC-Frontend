import { AppState, AppStateStatus } from "react-native";

import { captureException } from "~/utils/sentry";

import { trackSegmentEvent } from "~/utils/kohort";

let updateAvailable = false;

export const initUpdates = (): void => {
  if (__DEV__) return;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  AppState.addEventListener("change", async (appState: AppStateStatus) => {
    if (appState === "active") {
      let isAvailable: boolean;
      try {
        const Updates = require("expo-updates");
        ({ isAvailable } = await Updates.checkForUpdateAsync());
      } catch (e) {
        captureException(e);
        isAvailable = false;
      }

      if (isAvailable) {
        trackSegmentEvent("Update available");
        try {
          const Updates = require("expo-updates");
          await Updates.fetchUpdateAsync();
          updateAvailable = true;
          trackSegmentEvent("Update downloaded");
        } catch (e) {
          captureException(e);
        }
      }
    }

    if (appState === "background") {
      try {
        if (updateAvailable) {
          const Updates = require("expo-updates");
          trackSegmentEvent("Reloading with update");
          await Updates.reloadAsync();
        }
      } catch (e) {
        captureException(e);
      }
    }
  });
};

export const reloadIfAvailable = async (): Promise<void> => {
  if (__DEV__) return;

  try {
    const Updates = require("expo-updates");
    const { isAvailable } = await Updates.checkForUpdateAsync();

    if (!isAvailable) return;

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  } catch (e) {
    captureException(e);
  }
};
