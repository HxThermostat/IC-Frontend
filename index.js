/**
 * @format
 */
import {AppRegistry} from 'react-native';
// import App from './App';
import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);

import "react-native-gesture-handler";

import { LogBox } from "react-native";

// import * as SplashScreen from "expo-splash-screen";

// void SplashScreen.preventAutoHideAsync();

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
// registerRootComponent(App);
// AppRegistry.registerComponent('main', () => App);

registerRootComponent(App);


import { startBackgroundTasks } from "./utils/background-tasks";
startBackgroundTasks();

// This is triggered from react-navigation by the bottom sheet: see https://github.com/kraftful/klimate/issues/193
if (__DEV__) {
  const earlyJuly = new Date("2021-07-06");
  // Ignore the warning for until July, and circle back then to see if it's still an issue.
  if (new Date() < earlyJuly) {
    LogBox.ignoreLogs([
      "Accessing the 'state' property of the 'route' object is not supported.",
    ]);
  }
}

