import { useMemo } from "react";

import { Platform } from "react-native";

import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

import { useTheme } from "~/theme";

import { useIsTabNavigator } from "./useIsTabNavigator";

type LargeTitleConfig = {
  headerLargeTitle?: NativeStackNavigationOptions["headerLargeTitle"];
  headerLargeStyle?: NativeStackNavigationOptions["headerLargeStyle"];
  headerLargeTitleStyle?: NativeStackNavigationOptions["headerLargeTitleStyle"];
  headerTitleStyle?: NativeStackNavigationOptions["headerTitleStyle"];
  headerShadowVisible?: NativeStackNavigationOptions["headerShadowVisible"];
  headerStyle?: NativeStackNavigationOptions["headerStyle"];
};
export const useHeaderLargeTitle = (): LargeTitleConfig => {
  const { colors, textVariants } = useTheme();
  const isTabNavigator = useIsTabNavigator();

  const result = useMemo(
    () =>
      isTabNavigator
        ? {
            headerLargeTitle: true,
            headerLargeStyle: {
              backgroundColor: colors.backgroundGradientStart,
            },
            headerLargeTitleStyle: {
              ...textVariants.largeTitle,
              color: colors.text,
            },
            // android specific treatments
            headerTitleStyle: Platform.select({
              android: {
                ...textVariants.largeTitle,
                color: colors.text,
              },
              default: undefined,
            }),
            headerShadowVisible: Platform.select({
              android: false,
              default: undefined,
            }),
            headerStyle: {
              backgroundColor: Platform.select({
                android: "transparent",
                default: undefined,
              }),
            },
          }
        : {},
    [
      isTabNavigator,
      colors.text,
      colors.backgroundGradientStart,
      textVariants.largeTitle,
    ]
  );

  return result;
};
