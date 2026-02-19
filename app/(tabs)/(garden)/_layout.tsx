import Stack from 'expo-router/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { getThemedStackOptions } from '@/src/lib/navigation-theme';

export default function GardenLayout() {
  const { t } = useTranslation('garden');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    </Stack>
  );
}
