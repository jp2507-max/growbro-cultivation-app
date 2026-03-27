import Stack from 'expo-router/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { getFormSheetPresets } from '@/src/lib/navigation/form-sheet-options';
import { getThemedStackOptions } from '@/src/lib/navigation-theme';

export default function CommunityLayout() {
  const { t } = useTranslation(['common', 'community']);
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
        options={{ title: t('common:tabs.community') }}
      />
      <Stack.Screen
        name="create-post"
        options={{
          ...formSheetPresets.editorSheet,
          headerShown: true,
          title: t('community:createPost.title'),
        }}
      />
    </Stack>
  );
}
