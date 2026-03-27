import { Link as RouterLink } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  View as RNView,
} from 'react-native';
import { GestureHandlerRootView as RNGestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useCSSVariable as useUniwindCSSVariable, withUniwind } from 'uniwind';

const StyledLink = withUniwind(RouterLink);

// Uniwind-enabled Link
export const Link = (
  props: React.ComponentProps<typeof StyledLink> & { className?: string }
) => <StyledLink {...props} />;

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS variable hook
export const useCSSVariable = useUniwindCSSVariable;

export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = RNView;
export const Text = RNText;

type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string;
  contentContainerClassName?: string;
  endFillColorClassName?: string;
};

export const ScrollView = RNScrollView as React.ComponentType<ScrollViewProps>;

export const Pressable = RNPressable;
export const TextInput = RNTextInput;
export const AnimatedScrollView = Animated.ScrollView;
export const TouchableHighlight = RNTouchableHighlight;

/**
 * @deprecated Prefer `Pressable` from `@/src/tw` for new code.
 */
TouchableHighlight.displayName = 'TW(TouchableHighlight)';

export const KeyboardAvoidingView = RNKeyboardAvoidingView;

export const GestureHandlerRootView = withUniwind(RNGestureHandlerRootView);
