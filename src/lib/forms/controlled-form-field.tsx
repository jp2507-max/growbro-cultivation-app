import React from 'react';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type TextInputProps } from 'react-native';

import { FormField } from '@/src/components/ui/form-field';

type ControlledFormFieldProps<T extends FieldValues> = Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onBlur'
> & {
  name: FieldPath<T>;
  control: Control<T>;
  icon: React.ReactNode;
  className?: string;
};

export function ControlledFormField<T extends FieldValues>({
  name,
  control,
  icon,
  className,
  ...textInputProps
}: ControlledFormFieldProps<T>): React.ReactElement {
  const { t } = useTranslation('common');

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        // Validation messages are i18n keys from zod schemas.
        <FormField
          {...textInputProps}
          icon={icon}
          className={className}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={
            error?.message
              ? t(error.message, { defaultValue: error.message })
              : undefined
          }
        />
      )}
    />
  );
}
