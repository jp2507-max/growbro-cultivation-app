import React from 'react';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type TextInputProps } from 'react-native';

import { cn } from '@/src/lib/utils';
import { Text, TextInput, View } from '@/src/tw';

type ControlledTextInputProps<T extends FieldValues> = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur'
> & {
  name: FieldPath<T>;
  control: Control<T>;
  inputClassName?: string;
  containerClassName?: string;
};

export function ControlledTextInput<T extends FieldValues>({
  name,
  control,
  inputClassName,
  containerClassName,
  style,
  ...textInputProps
}: ControlledTextInputProps<T>): React.ReactElement {
  const { t } = useTranslation('common');

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View className={containerClassName}>
          <TextInput
            className={cn(
              'text-text dark:text-text-primary-dark text-base',
              inputClassName
            )}
            style={style}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...textInputProps}
          />
          {error?.message ? (
            <Text className="mt-1.5 px-1 text-sm font-medium text-danger dark:text-error-dark">
              {t(error.message, { defaultValue: error.message })}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}
