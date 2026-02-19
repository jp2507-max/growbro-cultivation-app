import React from 'react';
import { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { motion, withRM } from '@/src/lib/animations/motion';
import { Animated } from '@/src/tw/animated';

type AnimatedSectionProps = Omit<
  React.ComponentProps<typeof Animated.View>,
  'entering' | 'exiting'
> & {
  delayMs?: number;
  durationMs?: number;
  animation?: 'fade-up' | 'none';
  exiting?: boolean;
};

export function AnimatedSection({
  delayMs = 0,
  durationMs = motion.dur.md,
  animation = 'fade-up',
  exiting: enableExiting = true,
  ...props
}: AnimatedSectionProps) {
  const entering =
    animation === 'fade-up'
      ? withRM(FadeInUp.duration(durationMs).delay(delayMs))
      : undefined;
  const exiting = enableExiting
    ? withRM(FadeOutUp.duration(motion.dur.sm))
    : undefined;

  return <Animated.View entering={entering} exiting={exiting} {...props} />;
}
