import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

import { Text, View } from '@/src/tw';

type StrainDetailMetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor: string;
};

export function StrainDetailMetricCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: StrainDetailMetricCardProps): React.ReactElement {
  return (
    <View className="flex-1 items-center gap-2 rounded-3xl border border-metric-card-border bg-card px-2 py-4 dark:border-metric-card-border-dark dark:bg-dark-bg-card">
      <View className="size-11 items-center justify-center rounded-full bg-metric-card-icon-bg dark:bg-metric-card-icon-bg-dark">
        <Icon size={19} color={iconColor} />
      </View>

      <View className="items-center px-1">
        <Text
          className="text-[11px] font-semibold text-text-muted dark:text-text-muted-dark"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {label}
        </Text>
        <Text className="mt-1 text-[21px] font-semibold text-text dark:text-text-primary-dark">
          {value}
        </Text>
      </View>
    </View>
  );
}
