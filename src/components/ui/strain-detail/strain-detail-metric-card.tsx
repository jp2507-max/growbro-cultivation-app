import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

import Colors from '@/constants/colors';
import { Text, View } from '@/src/tw';

type StrainDetailMetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor: string;
  isDark: boolean;
};

export function StrainDetailMetricCard({
  icon: Icon,
  label,
  value,
  iconColor,
  isDark,
}: StrainDetailMetricCardProps): React.ReactElement {
  return (
    <View
      className="flex-1 items-center gap-2 rounded-3xl border bg-card px-2 py-4 dark:bg-dark-bg-card"
      style={{
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : Colors.borderLight,
      }}
    >
      <View
        className="size-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: isDark
            ? 'rgba(0,255,136,0.12)'
            : 'rgba(46,125,50,0.12)',
        }}
      >
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
