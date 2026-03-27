import { type LucideIcon } from 'lucide-react-native';
import React from 'react';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type SectionHeaderProps = {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  rightAction?: React.ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  icon: Icon,
  iconColor = Colors.primary,
  rightAction,
  className,
}: SectionHeaderProps) {
  return (
    <View
      className={cn('mb-3.5 flex-row items-center justify-between', className)}
    >
      <View className="flex-row items-center gap-2.5">
        <Icon size={18} color={iconColor} />
        <Text className="text-text dark:text-text-primary-dark text-[17px] font-bold">
          {title}
        </Text>
      </View>
      {rightAction}
    </View>
  );
}
