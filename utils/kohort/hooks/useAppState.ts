import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";

// As per https://facebook.github.io/react-native/docs/appstate#app-states
// just remember that only iOS has the 'inactive' state
// so we should usually just detect on 'active' and 'background'

export const useAppState = (): AppStateStatus => {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  const onChangeAppState = useCallback((newAppState: AppStateStatus) => {
    setAppState(newAppState);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onChangeAppState);
    return () => {
      subscription.remove();
    };
  }, [onChangeAppState]);

  return appState;
};
