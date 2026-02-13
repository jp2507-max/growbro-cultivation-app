import React from 'react';
import { type TextInputProps, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { Text, TextInput, View } from '@/src/tw';

type FormFieldProps = TextInputProps & {
  icon: React.ReactNode;
  inputClassName?: string;
  className?: string;
  error?: string;
};

export function FormField({
  icon,
  className: inputClassName,
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
          'border-border-light dark:border-dark-border dark:bg-dark-bg-card flex-row items-center overflow-hidden rounded-2xl border bg-white',
          error && 'border-danger dark:border-error-dark'
        )}
      >
        <View className="pl-[18px] pr-1">{icon}</View>
        <TextInput
          className={cn(
            'text-text dark:text-text-primary-dark flex-1 px-3 py-4 text-base',
            inputClassName
          )}
          style={[{ color: textColor }, style]}
          placeholderTextColor={placeholderColor}
          {...textInputProps}
        />
      </View>
      {error ? (
        <Text className="text-danger dark:text-error-dark mt-1.5 px-1 text-sm font-medium">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
