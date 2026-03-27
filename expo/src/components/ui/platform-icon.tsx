import { type SFSymbol, SymbolView } from 'expo-symbols';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

type PlatformIconProps = {
  sfName: SFSymbol;
  fallbackIcon: LucideIcon;
  size?: number;
  color: string;
  strokeWidth?: number;
};

export function PlatformIcon({
  sfName,
  fallbackIcon: FallbackIcon,
  size = 20,
  color,
  strokeWidth = 2,
}: PlatformIconProps): React.ReactElement {
  if (process.env.EXPO_OS === 'ios') {
    return (
      <SymbolView
        name={sfName}
        size={size}
        tintColor={color}
        resizeMode="scaleAspectFit"
      />
    );
  }

  return <FallbackIcon size={size} color={color} strokeWidth={strokeWidth} />;
}
