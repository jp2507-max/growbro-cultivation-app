import React from 'react';

import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

import { Card } from './card';

type SplitSummaryCardProps = {
  eyebrow: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  className?: string;
  testID?: string;
};

export function SplitSummaryCard({
  eyebrow,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  className,
  testID,
}: SplitSummaryCardProps): React.JSX.Element {
  return (
    <Card
      className={cn(
        'rounded-3xl border border-border-light p-4 dark:border-dark-border-bright',
        className
      )}
      testID={testID}
    >
      <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-text-muted-dark">
        {eyebrow}
      </Text>
      <View className="mt-1 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-xs font-semibold uppercase text-text-secondary dark:text-text-secondary-dark">
            {leftLabel}
          </Text>
          <Text className="text-text mt-1 text-[16px] font-bold dark:text-text-primary-dark">
            {leftValue}
          </Text>
        </View>
        <View className="h-10 w-px bg-borderLight dark:bg-dark-border-bright" />
        <View className="flex-1 pl-4">
          <Text className="text-xs font-semibold uppercase text-text-secondary dark:text-text-secondary-dark">
            {rightLabel}
          </Text>
          <Text className="text-text mt-1 text-[16px] font-bold dark:text-text-primary-dark">
            {rightValue}
          </Text>
        </View>
      </View>
    </Card>
  );
}
