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
              headerBlurEffect: undefined,
              headerTransparent: false,
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
      <Stack.Screen
        name="saved"
        options={{
          title: t('community:saved.title'),
        }}
      />
      <Stack.Screen
        name="comments"
        options={{
          title: t('community:comments.title'),
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          ...formSheetPresets.filtersSheet,
          title: t('community:report.title'),
        }}
      />
      <Stack.Screen
        name="profile/[id]"
        options={{
          title: t('community:profile.title'),
        }}
      />
    </Stack>
  );
}
