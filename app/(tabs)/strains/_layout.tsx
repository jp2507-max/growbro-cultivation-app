import Stack from 'expo-router/stack';
import React from 'react';
import { Platform, useColorScheme } from 'react-native';

import { getThemedStackOptions } from '@/src/lib/navigation-theme';

export default function StrainsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        ...getThemedStackOptions(isDark),
        ...(Platform.OS === 'ios'
          ? {
              headerLargeTitle: true,
              headerLargeTitleShadowVisible: false,
            }
          : {}),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Strain Library' }} />
    </Stack>
  );
}
