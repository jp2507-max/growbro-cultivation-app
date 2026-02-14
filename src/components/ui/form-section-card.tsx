import { type LucideIcon } from 'lucide-react-native';
import React from 'react';

import { cn } from '@/src/lib/utils';
import { View } from '@/src/tw';

import { Card } from './card';
import { SectionHeader } from './section-header';

type FormSectionCardProps = {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  testID?: string;
};

export function FormSectionCard({
  title,
  icon,
  iconColor,
  rightAction,
  children,
  className,
  contentClassName,
  testID,
}: FormSectionCardProps) {
  return (
    <Card className={cn('mb-4 p-5', className)} testID={testID}>
      <SectionHeader
        title={title}
        icon={icon}
        iconColor={iconColor}
        rightAction={rightAction}
      />
      <View className={contentClassName}>{children}</View>
    </Card>
  );
}
