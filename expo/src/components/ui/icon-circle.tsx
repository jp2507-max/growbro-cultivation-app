import React from 'react';

import { cn } from '@/src/lib/utils';
import { View } from '@/src/tw';

type IconCircleSize = 'sm' | 'md' | 'lg' | 'xl';

type IconCircleProps = React.ComponentProps<typeof View> & {
  children: React.ReactNode;
  size?: IconCircleSize;
};

const SIZE_CLASS_MAP: Record<IconCircleSize, string> = {
  sm: 'size-10',
  md: 'size-12',
  lg: 'size-14',
  xl: 'size-16',
};

export function IconCircle({
  children,
  className,
  size = 'md',
  ...props
}: IconCircleProps) {
  return (
    <View
      className={cn(
        'items-center justify-center rounded-full',
        SIZE_CLASS_MAP[size],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
