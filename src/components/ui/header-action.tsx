import React from 'react';

import { cn } from '@/src/lib/utils';
import { Pressable } from '@/src/tw';

type HeaderActionVariant = 'text' | 'icon';

type HeaderActionProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  className?: string;
  hitSlop?: number;
  accessibilityRole?: 'button';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  variant?: HeaderActionVariant;
};

const VARIANT_CLASSES: Record<HeaderActionVariant, string> = {
  text: 'min-h-8 px-1 py-1',
  icon: 'size-10',
};

export function HeaderAction({
  children,
  onPress,
  disabled,
  testID,
  className,
  hitSlop = 8,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  variant = 'text',
}: HeaderActionProps): React.ReactElement {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      hitSlop={hitSlop}
      className={cn(
        'items-center justify-center active:opacity-80 disabled:opacity-40',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </Pressable>
  );
}
