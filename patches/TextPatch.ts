import { Text as RNText } from "react-native";

// Cast to any so TS stops complaining
const Text: any = RNText;

if (Text.defaultProps == null) {
  Text.defaultProps = {};
}

Text.defaultProps.includeFontPadding = false;
Text.defaultProps.textAlignVertical = "center";