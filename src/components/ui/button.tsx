import React from 'react';
import { ActivityIndicator } from 'react-native';

import { useThemeColor } from '@/src/components/ui/use-theme-color';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = Omit<React.ComponentProps<typeof Pressable>, 'children'> & {
  children: string;
  className?: string;
  textClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
};

const CONTAINER_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary dark:bg-primary-bright rounded-[20px] py-[18px] shadow-md active:opacity-80',
  secondary:
    'bg-white dark:bg-dark-bg-elevated rounded-[20px] py-[18px] active:opacity-80',
  danger:
    'bg-danger dark:bg-error-dark rounded-[20px] py-[18px] shadow-md active:opacity-80',
  ghost:
    'rounded-[20px] border border-border dark:border-dark-border-bright py-[18px] active:opacity-80',
};

const TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-[17px] font-bold text-white dark:text-dark-bg',
  secondary: 'text-[17px] font-bold text-text dark:text-text-primary-dark',
  danger: 'text-[17px] font-bold text-white',
  ghost: 'text-[17px] font-bold text-text dark:text-text-primary-dark',
};

export function Button({
  children,
  className,
  textClassName,
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const primaryColor = useThemeColor('primary');
  const onPrimaryColor = useThemeColor('onPrimary');

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'flex-row items-center justify-center gap-2.5 px-5',
        CONTAINER_CLASSES[variant],
        isDisabled && 'opacity-60',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? primaryColor : onPrimaryColor}
        />
      ) : (
        <>
          {leftIcon ? <View className="shrink-0">{leftIcon}</View> : null}
          <Text className={cn(TEXT_CLASSES[variant], textClassName)}>
            {children}
          </Text>
          {rightIcon ? <View className="shrink-0">{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}
