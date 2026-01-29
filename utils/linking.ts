import { Linking, Platform } from "react-native";
import { openInbox } from "react-native-email-link";

import { URI_SCHEME } from "~/config/constants";

import { addExceptionBreadcrumb, captureMessage } from "~/utils/sentry";

export const attemptToOpenURL = (url: string): void => {
  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        void Linking.openURL(url);
      }
      return null;
    })
    .catch((error: Error) => {
      captureMessage(error?.message);
      addExceptionBreadcrumb(error);
    });
};

export function attemptToOpenEmail(): void {
  // openInbox().catch((error) => {
  //   captureMessage(`openInbox failed: ${error?.message}`);
  //   addExceptionBreadcrumb(error);
  //   // If openInbox() fails, let's just do the next best thing:
  //   const url = Platform.OS === "android" ? "mailto:" : "message:";
  //   attemptToOpenURL(url);
  // });
  openInbox({
    message: "Whatcha wanna do?",
    cancelLabel: "Go back!",
  })
    .then(() => {
      console.log("Tried to open inbox");
    })
    .catch((error) => {
      console.warn("openInbox failed:", error);

      const fallbackUrl = "mailto:support@example.com";
      attemptToOpenURL(fallbackUrl);
    });

  // Optional: Also fallback if nothing happens in 1.5s
  setTimeout(() => {
    console.log("openInbox appears to have done nothing — trying fallback");
    attemptToOpenURL("mailto:support@example.com");
  }, 1500);
}

export function clearLink(): void {
  attemptToOpenURL(`${URI_SCHEME}://nowhere`);
}

export const deepLinkInitialURL = (url: string): void => {
  attemptToOpenURL(
    url.replace(`https://${URI_SCHEME}.kraftful.app/`, `${URI_SCHEME}://`)
  );
};
