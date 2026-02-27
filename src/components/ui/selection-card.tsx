import { Check } from 'lucide-react-native';
import React from 'react';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';

type SelectionCardProps = {
  label: string;
  subtitle?: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  showCheck?: boolean;
  className?: string;
  labelClassName?: string;
  subtitleClassName?: string;
  descriptionClassName?: string;
  testID?: string;
};

export function SelectionCard({
  label,
  subtitle,
  description,
  selected,
  onPress,
  icon,
  rightSlot,
  showCheck = true,
  className,
  labelClassName,
  subtitleClassName,
  descriptionClassName,
  testID,
}: SelectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        'mb-3 flex-row items-center gap-3.5 rounded-3xl border border-border-light bg-white px-4.5 py-4 dark:border-dark-border dark:bg-dark-bg-card',
        selected &&
          'border-primary bg-background shadow-sm dark:border-primary-bright dark:bg-dark-bg-elevated',
        className
      )}
      onPress={onPress}
      testID={testID}
    >
      {icon ? <View className="shrink-0">{icon}</View> : null}
      <View className="flex-1">
        <Text
          className={cn(
            'text-text text-[17px] font-bold dark:text-text-primary-dark',
            labelClassName
          )}
        >
          {label}
        </Text>
        {subtitle ? (
          <Text
            className={cn(
              'text-text-muted mt-0.5 text-[11px] font-semibold tracking-wide uppercase dark:text-text-muted-dark',
              subtitleClassName
            )}
          >
            {subtitle}
          </Text>
        ) : null}
        {description ? (
          <Text
            className={cn(
              'text-text-secondary mt-1 text-[13px] leading-4.5 dark:text-text-secondary-dark',
              descriptionClassName
            )}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {rightSlot}
      {selected && showCheck ? (
        <View className="bg-primary dark:bg-primary-bright size-6.5 items-center justify-center rounded-full">
          <Check size={14} color={Colors.white} />
        </View>
      ) : null}
    </Pressable>
  );
}
