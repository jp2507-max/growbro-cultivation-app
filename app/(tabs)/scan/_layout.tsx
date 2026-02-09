import Stack from 'expo-router/stack';
import React from 'react';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';

export default function ScanLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBlurEffect: isDark ? 'systemMaterialDark' : 'systemMaterial',
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: {
          backgroundColor: isDark ? Colors.darkBg : Colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'AI Scan' }} />
    </Stack>
  );
}
