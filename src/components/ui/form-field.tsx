import React from 'react';
import { type TextInputProps } from 'react-native';

import Colors from '@/constants/colors';
import { TextInput, View } from '@/src/tw';

type FormFieldProps = TextInputProps & {
  icon: React.ReactNode;
};

export function FormField({ icon, ...textInputProps }: FormFieldProps) {
  return (
    <View className="border-borderLight dark:border-dark-border dark:bg-dark-bg-card mb-3.5 flex-row items-center overflow-hidden rounded-2xl border bg-white">
      <View className="pl-[18px] pr-1">{icon}</View>
      <TextInput
        className="text-text dark:text-text-primary-dark flex-1 px-3 py-4 text-base"
        placeholderTextColor={Colors.textMuted}
        {...textInputProps}
      />
    </View>
  );
}
