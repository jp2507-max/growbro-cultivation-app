import React from 'react';

import { cn } from '@/src/lib/utils';
import { Text } from '@/src/tw';

type TextProps = React.ComponentProps<typeof Text>;

export function Title({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        'text-text text-[32px] font-black leading-[38px] dark:text-text-primary-dark',
        className
      )}
      {...props}
    />
  );
}

export function Subtitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        'text-base text-text-secondary dark:text-text-secondary-dark',
        className
      )}
      {...props}
    />
  );
}

export function Body({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        'text-base text-text dark:text-text-primary-dark',
        className
      )}
      {...props}
    />
  );
}

export function Caption({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn(
        'text-xs font-medium text-text-muted dark:text-text-muted-dark',
        className
      )}
      {...props}
    />
  );
}
