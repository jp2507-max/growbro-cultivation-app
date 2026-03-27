import Stack from 'expo-router/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { getFormSheetPresets } from '@/src/lib/navigation/form-sheet-options';
import { getThemedStackOptions } from '@/src/lib/navigation-theme';

export default function StrainsLayout(): React.ReactElement {
  const { t } = useTranslation(['common', 'strains']);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const formSheetPresets = getFormSheetPresets(isDark);

  return (
    <Stack
      screenOptions={{
        ...getThemedStackOptions(isDark),
        ...(process.env.EXPO_OS === 'ios'
          ? {
              headerLargeTitle: true,
              headerLargeTitleShadowVisible: false,
            }
          : {}),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('strains:libraryTitle', {
            defaultValue: t('common:tabs.strains'),
          }),
        }}
      />
      <Stack.Screen
        name="favorites"
        options={{
          title: t('strains:favorites.title'),
        }}
      />
      <Stack.Screen
        name="[id]"
        dangerouslySingular={(_name, params) => String(params?.id ?? '')}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="filters" options={formSheetPresets.filtersSheet} />
    </Stack>
  );
}
