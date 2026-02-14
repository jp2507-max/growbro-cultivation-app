import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import React from 'react';
import {
  type StyleProp,
  useColorScheme,
  View,
  type ViewStyle,
} from 'react-native';

type AdaptiveGlassSurfaceProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isInteractive?: boolean;
};

export function AdaptiveGlassSurface({
  children,
  style,
  isInteractive = false,
}: AdaptiveGlassSurfaceProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const liquidGlassReady = isLiquidGlassAvailable();

  if (process.env.EXPO_OS === 'ios' && liquidGlassReady) {
    return (
      <GlassView style={style} isInteractive={isInteractive}>
        {children}
      </GlassView>
    );
  }

  if (process.env.EXPO_OS === 'ios') {
    return (
      <BlurView
        style={style}
        intensity={80}
        tint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
      >
        {children}
      </BlurView>
    );
  }

  return <View style={style}>{children}</View>;
}
