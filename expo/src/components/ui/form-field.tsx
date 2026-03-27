import React from 'react';
import { type TextInputProps, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { Text, TextInput, View } from '@/src/tw';

type FormFieldProps = TextInputProps & {
  icon: React.ReactNode;
  className?: string;
  error?: string;
};

export function FormField({
  icon,
  className,
  error,
  style,
  ...textInputProps
}: FormFieldProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const placeholderColor = isDark ? Colors.textMutedDark : Colors.textMuted;
  const textColor = isDark ? Colors.textPrimaryDark : Colors.text;

  return (
    <View className="mb-3.5">
      <View
        className={cn(
          'flex-row items-center overflow-hidden rounded-2xl border border-border-light bg-white dark:border-dark-border-bright dark:bg-dark-bg-card',
          error && 'border-danger dark:border-error-dark'
        )}
      >
        <View className="pl-[18px] pr-1">{icon}</View>
        <TextInput
          className={cn(
            'text-text dark:text-text-primary-dark flex-1 px-3 py-4 text-base',
            className
          )}
          style={[{ color: textColor }, style]}
          placeholderTextColor={placeholderColor}
          {...textInputProps}
        />
      </View>
      {error ? (
        <Text className="mt-1.5 px-1 text-sm font-medium text-danger dark:text-error-dark">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
