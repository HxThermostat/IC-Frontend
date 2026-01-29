import React, { useState } from "react";
import {
  StyleProp,
  TextStyle,
  Insets,
  useWindowDimensions,
} from "react-native";

import ActivityIndicator from "~/components/ActivityIndicator";
import Text from "~/components/Text";

import { useLazyEffect } from "~/hooks";

import Touchable from "./Touchable";
import { defaultPalette } from "~/theme/color";

interface HeaderButtonProps {
  children?: JSX.Element;
  text?: string;
  textStyle?: StyleProp<TextStyle>;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  hitSlop?: Insets;
}

export default function HeaderButton({
  children,
  text,
  textStyle,
  onPress,
  disabled,
  loading,
  hitSlop,
}: HeaderButtonProps): JSX.Element {
  const [renderButton, setRenderButton] = useState(true);
  // We don't actually care about the dimensions, this is just a
  // convenient way to respond to orientation changes / multitasking
  // changes which may require a header button to layout again
  const { width } = useWindowDimensions();

  useLazyEffect(() => {
    setRenderButton(false);
    const handle = setTimeout(() => setRenderButton(true), 200);
    return () => clearTimeout(handle);
  }, [width]);

  if (!renderButton) {
    return <></>;
  }

  if (loading) {
    console.log("inside headerbutton");
    return <ActivityIndicator size={"small"} />;
  }

  const finalTextStyle = [
    textStyle,
    // When disabled is true, use a muted color (e.g., grey).
    // When disabled is false, use the bright, primary action color.
    { color: disabled ? defaultPalette.disabled : defaultPalette.tint }, // Use your actual theme keys!
  ];

  return (
    <Touchable onPress={onPress} disabled={disabled} hitSlop={hitSlop}>
      {children ? (
        children
      ) : (
        <Text variant={"headerButton"} style={finalTextStyle}>
          {text ?? " "}
        </Text>
      )}
    </Touchable>
  );
}
