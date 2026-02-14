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
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('title') }} />
      <Stack.Screen name="tasks/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
