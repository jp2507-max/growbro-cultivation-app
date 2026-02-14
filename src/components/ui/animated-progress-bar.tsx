import React, { useEffect } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { rmTiming } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type AnimatedProgressBarProps = {
  value: number;
  label?: string;
  durationMs?: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  labelClassName?: string;
  testID?: string;
};

function clampProgress(value: number): number {
  return Math.max(0, Math.min(value, 1));
}

export function AnimatedProgressBar({
  value,
  label,
  durationMs = 260,
  className,
  trackClassName,
  fillClassName,
  labelClassName,
  testID,
}: AnimatedProgressBarProps) {
  const progress = useSharedValue(clampProgress(value));

  useEffect(() => {
    progress.set(withTiming(clampProgress(value), rmTiming(durationMs)));
  }, [durationMs, progress, value]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.get() * 100}%` as `${number}%`,
  }));

  return (
    <View className={cn('gap-3.5', className)} testID={testID}>
      <View
        className={cn(
          'h-2 overflow-hidden rounded-full bg-border dark:bg-dark-border',
          trackClassName
        )}
      >
        <Animated.View
          style={fillStyle}
          className={cn(
            'h-full rounded-full bg-primary dark:bg-primary-bright',
            fillClassName
          )}
        />
      </View>
      {label ? (
        <Text
          className={cn(
            'text-sm font-semibold text-text-secondary dark:text-text-secondary-dark',
            labelClassName
          )}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}
