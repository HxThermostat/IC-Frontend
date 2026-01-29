/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import "./patches/TextPatch";
import React, { JSX, useCallback, useEffect } from 'react';
import 'react-native-get-random-values';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './navigators/RootNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { client } from "~/graph";
import { initUpdates } from "~/utils/updates";

import { initializeKohort, KohortProvider } from "./utils/kohort";

import { ApolloProvider } from '@apollo/client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { AppStateProvider, DeviceProvider } from './contexts';
import AppThemeProvider from './theme/AppThemeProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RNBootSplash from "react-native-bootsplash";

initializeKohort();

initUpdates();

export default function App(): JSX.Element {

  React.useEffect(() => {
    RNBootSplash.hide({ fade: true });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApolloProvider client={client}>
        <ActionSheetProvider>
          <DeviceProvider>
            <AppStateProvider>
              <AppThemeProvider>
                <KohortProvider>
                  <AuthProvider>
                    <SafeAreaProvider>
                      <RootNavigator />
                    </SafeAreaProvider>
                  </AuthProvider>
                </KohortProvider>
              </AppThemeProvider>
            </AppStateProvider>
          </DeviceProvider>
        </ActionSheetProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
