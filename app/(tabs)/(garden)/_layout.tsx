import Stack from 'expo-router/stack';
import { useColorScheme } from 'nativewind';
import React from 'react';

import Colors from '@/constants/colors';

export default function GardenLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect: isDark ? 'systemMaterialDark' : 'systemMaterial',
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: {
          backgroundColor: isDark ? Colors.darkBg : Colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Garden' }} />
    </Stack>
  );
}
