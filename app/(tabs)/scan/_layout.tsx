import Stack from 'expo-router/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { getThemedStackOptions } from '@/src/lib/navigation-theme';

export default function ScanLayout() {
  const { t } = useTranslation('common');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack screenOptions={getThemedStackOptions(isDark)}>
      <Stack.Screen name="index" options={{ title: t('tabs.scan') }} />
    </Stack>
  );
}
