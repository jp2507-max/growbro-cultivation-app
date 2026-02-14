import React from 'react';

import { cn } from '@/src/lib/utils';
import { View } from '@/src/tw';

type DividerProps = React.ComponentProps<typeof View> & {
  inset?: boolean;
  vertical?: boolean;
};

export function Divider({
  className,
  inset = false,
  vertical = false,
  ...props
}: DividerProps) {
  return (
    <View
      className={cn(
        'bg-borderLight dark:bg-dark-border',
        vertical ? 'h-full w-px' : 'h-px w-full',
        inset && !vertical && 'mx-4',
        className
      )}
      {...props}
    />
  );
}
