import { Platform } from "react-native";

import * as RNLocalize from "react-native-localize";
import { I18n } from "i18n-js";

import moment from "moment";

import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";

const i18n = new I18n();

(i18n as any).defaultLocale = "en";
(i18n as any).fallbacks = true;
(i18n as any).translations = {
  en,
  'en-US': en,
  'en-SG': en,
  'en-GB': en,
  'en-AU': en,
  'en-CA': en,
  fr,
  'fr-CA': fr,
  es,
  'es-MX': es,
};

const locales = RNLocalize.getLocales();
let locale = locales.length > 0 ? locales[0].languageTag : "en";

// ✅ Normalize locale if not supported
const supportedLocales = Object.keys(i18n.translations);
if (!supportedLocales.includes(locale)) {
  const baseLang = locale.split("-")[0];
  locale = supportedLocales.includes(baseLang) ? baseLang : "en";
}

i18n.locale = locale;
(i18n as any).globals = { appName: "IntelliComfort" };

moment.locale(i18n.locale);

const bestGuessRegionForAndroid = (locale: string): string => {
  // can't grab country code on Android using Localization.region
  if (locale.includes("-")) {
    // es-US, fr-CA, de-DE etc.
    return locale.split("-")[1];
  }
  return "US";
};

export const usersCurrentRegion =
  Platform.OS === "ios"
    ? RNLocalize.getCountry()
    : bestGuessRegionForAndroid((i18n as any).locale);

export default i18n;
