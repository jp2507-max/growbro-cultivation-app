import Stack from 'expo-router/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { getFormSheetPresets } from '@/src/lib/navigation/form-sheet-options';
import { getThemedStackOptions } from '@/src/lib/navigation-theme';

export default function GardenLayout() {
  const { t } = useTranslation('garden');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const formSheetPresets = getFormSheetPresets(isDark);

  return (
    <Stack
      screenOptions={{
        ...getThemedStackOptions(isDark),
        headerLargeTitle: false,
        headerLargeTitleShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: t('title'), headerShown: false }}
      />
      <Stack.Screen name="tasks/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="plant-selector"
        options={{
          ...formSheetPresets.editorSheet,
          sheetAllowedDetents: 'fitToContents',
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="log-activity-actions"
        options={{
          ...formSheetPresets.editorSheet,
          sheetAllowedDetents: 'fitToContents',
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
    </Stack>
  );
}
