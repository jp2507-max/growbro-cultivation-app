import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type StrainDetailPillProps = {
  label: string;
  icon?: LucideIcon;
  /** JS color token for Lucide icon (e.g. from Colors via useColorScheme). */
  iconColor?: string;
  /** Tailwind bg + dark pair, e.g. "bg-emerald-100 dark:bg-emerald-900" */
  bgColorClass: string;
  /** Tailwind border + dark pair, e.g. "border-emerald-300 dark:border-emerald-700" */
  borderColorClass: string;
  /** Tailwind text + dark pair, e.g. "text-emerald-800 dark:text-emerald-200" */
  textColorClass: string;
  className?: string;
  testID?: string;
};

export function StrainDetailPill({
  label,
  icon: Icon,
  iconColor,
  bgColorClass,
  borderColorClass,
  textColorClass,
  className,
  testID,
}: StrainDetailPillProps): React.ReactElement {
  return (
    <View
      testID={testID}
      className={cn(
        'flex-row items-center gap-2 rounded-full border px-5 py-3',
        bgColorClass,
        borderColorClass,
        className
      )}
    >
      {Icon ? <Icon size={16} color={iconColor} /> : null}
      <Text className={cn('text-base font-semibold', textColorClass)}>
        {label}
      </Text>
    </View>
  );
}
