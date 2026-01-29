import { useFocusEffect } from "@react-navigation/core";
import { useCallback } from "react";
import { BackHandler } from "react-native";

export function useBackHandler(
  handler: () => boolean | null | undefined
): void {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", handler);

      return () =>
        subscription.remove();
    }, [handler])
  );
}
