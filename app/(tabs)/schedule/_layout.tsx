import Stack from 'expo-router/stack';
import React from 'react';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';

export default function ScheduleLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? Colors.darkBg : Colors.background,
        },
      }}
    />
  );
}
