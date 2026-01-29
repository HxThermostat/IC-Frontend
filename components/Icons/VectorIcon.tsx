// import { color, useRestyle, composeRestyleFunctions } from "@shopify/restyle";
// import React, { ComponentProps, JSX } from "react";

// import Feather from "react-native-vector-icons/Feather";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// import { ColorProps } from "~/theme";

// const restyleFunctions = composeRestyleFunctions([color]);

// type VectorIconProps = ComponentProps<typeof Ionicons>;
// export type IconProps = Omit<VectorIconProps, "name" | "color"> & ColorProps;

// const RsFeather = ({
//   name,
//   color,
//   ...rest
// }: IconProps & { name: string }): JSX.Element => {
//   const props = useRestyle(restyleFunctions, { color });

//   return <Feather name={name} {...props} {...rest} />;
// };

// const RsIonicons = ({
//   name,
//   color,
//   ...rest
// }: IconProps & { name: string }): JSX.Element => {
//   const props = useRestyle(colorFn, { color });

//   return <Ionicons name={name} {...props} {...rest} />;
// };

// const RsMaterialIcons = ({
//   name,
//   color,
//   ...rest
// }: IconProps & { name: string }): JSX.Element => {
//   const props = useRestyle(colorFn, { color });

//   return <MaterialIcons name={name} {...props} {...rest} />;
// };

// export const ChatIcon = (props: IconProps): JSX.Element => (
//   <RsMaterialIcons name="message" {...props} />
// );

// export const CheckmarkIcon = (props: IconProps): JSX.Element => (
//   <RsIonicons name="checkmark" {...props} />
// );

// export const ChevronIcon = ({
//   direction = "chevron-forward",
//   ...props
// }: IconProps & {
//   direction?: "chevron-forward" | "chevron-down";
// }): JSX.Element => <RsIonicons name={direction} {...props} />;

// export const MinusIcon = (props: IconProps): JSX.Element => (
//   <RsMaterialIcons name="remove" {...props} />
// );

// export const SettingsIcon = (props: IconProps): JSX.Element => (
//   <RsFeather name="settings" {...props} />
// );

// export const PlusIcon = (props: IconProps): JSX.Element => (
//   <RsMaterialIcons name="add" {...props} />
// );

import { useTheme } from "@shopify/restyle";
import React, { ComponentProps, JSX } from "react";

import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import { ColorProps } from "~/theme";

type VectorIconProps = ComponentProps<typeof Ionicons>;
export type IconProps = Omit<VectorIconProps, "name" | "color"> & ColorProps;

// Helper function to resolve color from theme
const useResolvedColor = (color?: ColorProps['color']) => {
  const theme = useTheme();
  
  if (!color) return undefined;
  
  // If it's a theme color key, resolve it from theme
  if (typeof color === 'string' && theme.colors[color as keyof typeof theme.colors]) {
    return theme.colors[color as keyof typeof theme.colors];
  }
  
  // Otherwise return as-is (for hex codes, etc.)
  return color;
};

const RsFeather = ({
  name,
  color,
  ...rest
}: IconProps & { name: string }): JSX.Element => {
  const resolvedColor = useResolvedColor(color);

  return <Feather name={name} color={resolvedColor} {...rest} />;
};

const RsIonicons = ({
  name,
  color,
  ...rest
}: IconProps & { name: string }): JSX.Element => {
  const resolvedColor = useResolvedColor(color);

  return <Ionicons name={name} color={resolvedColor} {...rest} />;
};

const RsMaterialIcons = ({
  name,
  color,
  ...rest
}: IconProps & { name: string }): JSX.Element => {
  const resolvedColor = useResolvedColor(color);

  return <MaterialIcons name={name} color={resolvedColor} {...rest} />;
};

export const ChatIcon = (props: IconProps): JSX.Element => (
  <RsMaterialIcons name="message" {...props} />
);

export const CheckmarkIcon = (props: IconProps): JSX.Element => (
  <RsIonicons name="checkmark" {...props} />
);

export const ChevronIcon = ({
  direction = "chevron-forward",
  ...props
}: IconProps & {
  direction?: "chevron-forward" | "chevron-down";
}): JSX.Element => <RsIonicons name={direction} {...props} />;

export const MinusIcon = (props: IconProps): JSX.Element => (
  <RsMaterialIcons name="remove" {...props} />
);

export const SettingsIcon = (props: IconProps): JSX.Element => (
  <RsFeather name="settings" {...props} />
);

export const PlusIcon = (props: IconProps): JSX.Element => (
  <RsMaterialIcons name="add" {...props} />
);