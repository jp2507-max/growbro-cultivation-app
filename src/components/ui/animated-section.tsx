import React from 'react';
import { FadeInUp } from 'react-native-reanimated';

import { motion, withRM } from '@/src/lib/animations/motion';
import { Animated } from '@/src/tw/animated';

type AnimatedSectionProps = Omit<
  React.ComponentProps<typeof Animated.View>,
  'entering'
> & {
  delayMs?: number;
  durationMs?: number;
  animation?: 'fade-up' | 'none';
};

export function AnimatedSection({
  delayMs = 0,
  durationMs = motion.dur.md,
  animation = 'fade-up',
  ...props
}: AnimatedSectionProps) {
  const entering =
    animation === 'fade-up'
      ? withRM(FadeInUp.duration(durationMs).delay(delayMs))
      : undefined;

  return <Animated.View entering={entering} {...props} />;
}
