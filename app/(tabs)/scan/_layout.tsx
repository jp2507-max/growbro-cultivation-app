import Stack from 'expo-router/stack';
import React from 'react';
import { useColorScheme } from 'react-native';

import { getThemedStackOptions } from '@/src/lib/navigation-theme';

export default function ScanLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack screenOptions={getThemedStackOptions(isDark)}>
      <Stack.Screen name="index" options={{ title: 'AI Scan' }} />
    </Stack>
  );
}
