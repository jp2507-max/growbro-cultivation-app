import { Flower, Home, Sprout } from 'lucide-react-native';
import React from 'react';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { ScrollView, Text, View } from '@/src/tw';

type SetupPillsProps = {
  environment?: string;
  medium?: string;
  containerSize?: number;
  containerUnit?: string;
  className?: string;
  testID?: string;
};

function Pill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}): React.ReactElement {
  return (
    <View className="flex-row items-center gap-2.5 rounded-full border border-border bg-white px-5 py-2.5 shadow-sm dark:border-dark-border dark:bg-dark-bg-elevated">
      {icon}
      <Text className="text-lg font-medium text-text dark:text-text-primary-dark">
        {label}
      </Text>
    </View>
  );
}

export function SetupPills({
  environment,
  medium,
  containerSize,
  containerUnit,
  className,
  testID,
}: SetupPillsProps): React.ReactElement {
  const iconColor = Colors.textMuted;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn('', className)}
      contentContainerClassName="gap-3 px-1"
      testID={testID}
    >
      {environment ? (
        <Pill icon={<Home size={18} color={iconColor} />} label={environment} />
      ) : null}
      {medium ? (
        <Pill icon={<Sprout size={18} color={iconColor} />} label={medium} />
      ) : null}
      {containerSize ? (
        <Pill
          icon={<Flower size={18} color={iconColor} />}
          label={`${containerSize}${containerUnit ?? 'L'}`}
        />
      ) : null}
    </ScrollView>
  );
}
