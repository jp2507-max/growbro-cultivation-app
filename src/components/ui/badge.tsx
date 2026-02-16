import React from 'react';

import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type BadgeVariant = 'primary' | 'danger' | 'muted';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  textClassName?: string;
  variant?: BadgeVariant;
};

const CONTAINER_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-border dark:bg-dark-bg-card',
  danger: 'bg-danger-light dark:bg-error-dark/20',
  muted: 'bg-border-light dark:bg-dark-bg-elevated',
};

const TEXT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'text-primary dark:text-primary-bright',
  danger: 'text-danger dark:text-error-dark',
  muted: 'text-text-secondary dark:text-text-secondary-dark',
};

export function Badge({
  children,
  className,
  textClassName,
  variant = 'primary',
}: BadgeProps) {
  return (
    <View
      className={cn(
        'rounded-xl px-2.5 py-1',
        CONTAINER_CLASSES[variant],
        className
      )}
    >
      <Text
        className={cn(
          'text-xs font-bold',
          TEXT_CLASSES[variant],
          textClassName
        )}
      >
        {children}
      </Text>
    </View>
  );
}
