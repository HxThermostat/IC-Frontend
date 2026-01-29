import React, { JSX } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import NotificationsHandler from "~/components/NotificationsHandler";

import AppActiveTrackingHandler from "~/components/AppActiveTrackingHandler";

import { ControllerProvider } from "~/contexts";

import Home from "~/screens/Authenticated/Home";

import { useIsTabNavigator } from "~/hooks";

import ConnectNavigator from "./ConnectNavigator";
import SettingsNavigator, {
  SettingsNavigatorRouteList,
} from "./SettingsNavigator";
import TabNavigator, { TabNavigatorRouteList } from "./TabNavigator";
import { Platform } from "react-native";

export type AuthenticatedNavigatorRouteList = {
  Home: {
    showModeModal?: boolean;
    showControllerModal?: boolean;
  };
  Tabs?: NavigatorScreenParams<TabNavigatorRouteList>;
  Settings: NavigatorScreenParams<SettingsNavigatorRouteList>;
  Connect: undefined;
};

const Stack = createNativeStackNavigator<AuthenticatedNavigatorRouteList>();

export default function AuthenticatedNavigator(): JSX.Element {
  const usesTabNavigator = useIsTabNavigator();

  return (
    <ControllerProvider>
      <NotificationsHandler />
      <AppActiveTrackingHandler />
      <BottomSheetModalProvider>
        <Stack.Navigator initialRouteName={"Home"}>
          {usesTabNavigator ? (
            <Stack.Screen
              options={{ title: "", headerShown: false }}
              name="Tabs"
              component={TabNavigator}
            />
          ) : (
            <>
              <Stack.Screen
                options={{ title: "", headerShown: false }}
                name="Home"
                initialParams={{
                  showControllerModal: false,
                  showModeModal: false,
                }}
                component={Home}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsNavigator}
                options={{
                  headerShown: false,
                }}
              />
            </>
          )}
          <Stack.Screen
            name={"Connect"}
            component={ConnectNavigator}
            options={{ presentation : Platform.OS === "ios" ? "card" : "formSheet", headerShown: false }}
          />
        </Stack.Navigator>
      </BottomSheetModalProvider>
    </ControllerProvider>
  );
}
