import React from 'react';
import { FadeInUp, LinearTransition } from 'react-native-reanimated';

import { Skeleton } from '@/src/components/ui/skeleton';
import { motion, withRM } from '@/src/lib/animations/motion';
import { View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type FeedPostSkeletonProps = {
  index: number;
};

export function FeedPostSkeleton({
  index,
}: FeedPostSkeletonProps): React.ReactElement {
  return (
    <Animated.View
      className="mx-3 overflow-hidden rounded-3xl border border-border-light bg-card p-4 shadow-sm dark:border-dark-border dark:bg-dark-bg-card"
      entering={withRM(FadeInUp.delay(index * 80).duration(motion.dur.lg))}
      layout={withRM(LinearTransition.duration(motion.dur.lg))}
    >
      <View className="mb-3 flex-row items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <View className="gap-2">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-2 w-16 rounded" />
        </View>
      </View>

      <Skeleton className="h-64 w-full rounded-xl" />
    </Animated.View>
  );
}
