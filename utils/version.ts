import Constants from "expo-constants"

import { version } from "../package.json";

export const nativeVersion = Constants.nativeAppVersion ?? version?? "0.0.0";
export const nativeBuild = Constants.nativeBuildVersion ?? "0";
export const appVersion = version ?? "0.0.0";
