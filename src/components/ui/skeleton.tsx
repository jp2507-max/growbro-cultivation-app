import React, { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';
import { Animated } from '@/src/tw/animated';

type SkeletonProps = {
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Skeleton({
  className,
  style,
  testID,
}: SkeletonProps): React.ReactElement {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.set(
      withRepeat(
        withSequence(
          withTiming(0.9, {
            duration: motion.dur.lg,
            reduceMotion: ReduceMotion.System,
          }),
          withTiming(0.45, {
            duration: motion.dur.lg,
            reduceMotion: ReduceMotion.System,
          })
        ),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  return (
    <Animated.View
      className={cn('bg-border dark:bg-dark-border rounded-xl', className)}
      style={[animatedStyle, style]}
      testID={testID}
    />
  );
}
