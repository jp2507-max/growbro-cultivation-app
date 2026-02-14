import { Link as RouterLink } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView as RNKeyboardAvoidingView,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  View as RNView,
} from 'react-native';
import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from 'react-native-css';
import { GestureHandlerRootView as RNGestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

// CSS-enabled Link
export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string }
) => {
  return useCssElement(RouterLink, props, { className: 'style' });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
/**
 * Resolves a CSS variable value based on the platform.
 *
 * - On **Native**: Returns the resolved value (number/string) using `useNativeVariable`.
 * - On **Web**: Returns a CSS variable reference string (`var(--name)`), as CSS variables are handled by the browser.
 *
 * @param variable The CSS variable name (e.g., `--my-color`).
 * @returns The resolved value on native, or `var(...)` string on web.
 */
export const useCSSVariable =
  process.env.EXPO_OS !== 'web'
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: 'style' });
};
View.displayName = 'CSS(View)';

// Text
export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string }
) => {
  return useCssElement(RNText, props, { className: 'style' });
};
Text.displayName = 'CSS(Text)';

// ScrollView
export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
) => {
  return useCssElement(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
};
ScrollView.displayName = 'CSS(ScrollView)';

// Pressable
export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string }
) => {
  return useCssElement(RNPressable, props, { className: 'style' });
};
Pressable.displayName = 'CSS(Pressable)';

// TextInput
export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string }
) => {
  return useCssElement(RNTextInput, props, { className: 'style' });
};
TextInput.displayName = 'CSS(TextInput)';

// AnimatedScrollView
export const AnimatedScrollView = (
  props: React.ComponentProps<typeof Animated.ScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  }
) => {
  // @ts-expect-error: Type instantiation can become excessively deep with AnimatedScrollView + useCssElement
  return useCssElement(Animated.ScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
};

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: React.ComponentProps<typeof RNTouchableHighlight>
) {
  // @ts-expect-error: underlayColor is extracted from flattened style
  const { underlayColor, ...style } = StyleSheet.flatten(props.style) || {};
  return (
    <RNTouchableHighlight
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}

export const TouchableHighlight = (
  props: React.ComponentProps<typeof RNTouchableHighlight>
) => {
  return useCssElement(XXTouchableHighlight, props, { className: 'style' });
};

/**
 * @deprecated Prefer `Pressable` from `@/src/tw` for new code.
 */
TouchableHighlight.displayName = 'CSS(TouchableHighlight)';

// KeyboardAvoidingView
export const KeyboardAvoidingView = (
  props: React.ComponentProps<typeof RNKeyboardAvoidingView> & {
    className?: string;
  }
) => {
  return useCssElement(RNKeyboardAvoidingView, props, { className: 'style' });
};
KeyboardAvoidingView.displayName = 'CSS(KeyboardAvoidingView)';

// GestureHandlerRootView
export const GestureHandlerRootView = (
  props: React.ComponentProps<typeof RNGestureHandlerRootView> & {
    className?: string;
  }
) => {
  return useCssElement(RNGestureHandlerRootView, props, {
    className: 'style',
  });
};
GestureHandlerRootView.displayName = 'CSS(GestureHandlerRootView)';
