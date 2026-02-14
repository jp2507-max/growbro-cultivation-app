import React from 'react';

import { cn } from '@/src/lib/utils';
import { View } from '@/src/tw';

type CardProps = React.ComponentProps<typeof View> & {
  elevated?: boolean;
};

export function Card({ className, elevated = true, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-[20px] bg-white dark:bg-dark-bg-elevated',
        elevated && 'shadow-sm',
        className
      )}
      {...props}
    />
  );
}
