import React from 'react';
import { type TextInputProps, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { TextInput, View } from '@/src/tw';

type FormFieldProps = TextInputProps & {
  icon: React.ReactNode;
  inputClassName?: string;
  className?: string;
};

export function FormField({
  icon,
  className: inputClassName,
  ...textInputProps
}: FormFieldProps) {
  const colorScheme = useColorScheme();
  const placeholderColor =
    colorScheme === 'dark' ? Colors.textMutedDark : Colors.textMuted;

  // Ensure className is not spread to avoid override
  const cleanTextInputProps = textInputProps;

  return (
    <View className="border-border-light dark:border-dark-border dark:bg-dark-bg-card mb-3.5 flex-row items-center overflow-hidden rounded-2xl border bg-white">
      <View className="pl-[18px] pr-1">{icon}</View>
      <TextInput
        className={cn(
          'text-text dark:text-text-primary-dark flex-1 px-3 py-4 text-base',
          inputClassName
        )}
        placeholderTextColor={placeholderColor}
        {...cleanTextInputProps}
      />
    </View>
  );
}
