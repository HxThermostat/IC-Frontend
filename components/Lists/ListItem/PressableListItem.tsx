import React, { ReactNode } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle, Platform } from "react-native";
import { useTheme } from "~/theme";

export type PressableListItemProps = Omit<
  PressableProps,
  "onPress" | "onLongPress" | "style" | "children"
> & {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  delayLongPress?: number | null;
  disabled?: boolean;
};

const PressableListItem: React.FC<PressableListItemProps> = ({
  style,
  onPress,
  onLongPress,
  disabled,
  children,
  delayLongPress,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      {...props}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress ?? undefined}
      disabled={disabled}
      //android_ripple={Platform.OS === "android" ? { color: colors.listItemRipple } : undefined}
      style={({ pressed }) => [
        style,
        {
          backgroundColor: pressed
            ? colors.listItemHighlightUnderlay
            : colors.listItemBackground,
        },
      ]}
    >
      {children}
    </Pressable>
  );
};

export default PressableListItem;


// import React from "react";

// import {
//   Platform,
//   PressableProps,
//   ViewStyle,
//   StyleProp,
//   Pressable,
// } from "react-native";

// import {
//   RectButton,
//   LongPressGestureHandler,
//   State,
// } from "react-native-gesture-handler";

// import { useTheme } from "~/theme";

// export type PressableListItemProps = Omit<
//   PressableProps,
//   "hitSlop" | "onPress" | "style" | "onLongPress"
// > & {
//   onPress?: () => void;
//   onLongPress?: () => void;
//   style?: StyleProp<ViewStyle>;
// };

// function PressableHighlight({
//   style,
//   ...props
// }: PressableListItemProps): JSX.Element {
//   const { colors } = useTheme();
//   return (
//     <Pressable
//       {...props}
//       style={({ pressed }) => [
//         style,
//         {
//           backgroundColor: pressed
//             ? colors.listItemHighlightUnderlay
//             : colors.listItemBackground,
//         },
//       ]}
//     />
//   );
// }
// function PressableRipple({
//   disabled,
//   onLongPress,
//   delayLongPress,
//   ...props
// }: PressableListItemProps): JSX.Element {
//   const { colors } = useTheme();
//   const enabled = disabled !== true;

//   return (
//     <LongPressGestureHandler
//       onHandlerStateChange={(e) => {
//         if (e.nativeEvent.state === State.ACTIVE) {
//           onLongPress && onLongPress();
//         }
//       }}
//       minDurationMs={delayLongPress ?? undefined}
//     >
//       <RectButton
//         enabled={enabled}
//         rippleColor={colors.listItemRipple}
//         {...props}
//       />
//     </LongPressGestureHandler>
//   );
// }

// function PressableListItem(props: PressableListItemProps): JSX.Element {
//   const { children, ...rest } = props;

//   const PressableComponent = Platform.select<
//     React.ComponentType<PressableListItemProps>
//   >({
//     android: PressableRipple,
//     default: PressableHighlight,
//   });

//   return <PressableComponent {...rest}>{children}</PressableComponent>;
// }

// export default PressableListItem;


// import React from "react";
// import {
//   Platform,
//   Pressable,
//   PressableProps,
//   StyleProp,
//   ViewStyle,
// } from "react-native";

// import {
//   Gesture,
//   GestureDetector,
//   RectButton,
// } from "react-native-gesture-handler";

// import { useTheme } from "~/theme";

// export type PressableListItemProps = Omit<
//   PressableProps,
//   "hitSlop" | "onPress" | "style" | "onLongPress" | "children"
// > & {
//   onPress?: () => void;
//   onLongPress?: () => void;
//   style?: StyleProp<ViewStyle>;
//   children?: React.ReactNode; // 👈 only ReactNode, not render prop
// };

// /**
//  * iOS / default pressable: uses RN's Pressable with highlight effect
//  */
// function PressableHighlight({
//   style,
//   ...props
// }: PressableListItemProps): JSX.Element {
//   const { colors } = useTheme();

//   return (
//     <Pressable
//       {...props}
//       style={({ pressed }) => [
//         style,
//         {
//           backgroundColor: pressed
//             ? colors.listItemHighlightUnderlay
//             : colors.listItemBackground,
//         },
//       ]}
//     >
//       {props.children}
//     </Pressable>
//   );
// }

// /**
//  * Android pressable: uses RNGH's RectButton with ripple + new Gesture API for long press
//  */
// function PressableRipple({
//   disabled,
//   onLongPress,
//   delayLongPress,
//   children,
//   ...props
// }: PressableListItemProps): JSX.Element {
//   const { colors } = useTheme();
//   const enabled = disabled !== true;

//   const longPress = Gesture.LongPress()
//     .minDuration(delayLongPress ?? 600)
//     .onStart(() => {
//       onLongPress?.();
//     });

//   return (
//     <GestureDetector gesture={longPress}>
//       <RectButton enabled={enabled} rippleColor={colors.listItemRipple} {...props}>
//         {children}
//       </RectButton>
//     </GestureDetector>
//   );
// }

// /**
//  * Cross-platform PressableListItem
//  */
// export default function PressableListItem(
//   props: PressableListItemProps
// ): JSX.Element {
//   const { children, ...rest } = props;

//   const PressableComponent = Platform.select<
//     React.ComponentType<PressableListItemProps>
//   >({
//     android: PressableRipple,
//     default: PressableHighlight,
//   });

//   return <PressableComponent {...rest}>{children}</PressableComponent>;
// }


