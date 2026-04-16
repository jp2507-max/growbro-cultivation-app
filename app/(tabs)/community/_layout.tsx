import Stack from 'expo-router/stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
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
        options={{
          title: t('common:tabs.community'),
          ...(process.env.EXPO_OS === 'ios'
            ? {
                headerLargeTitle: false,
                headerTitleStyle: {
                  fontSize: 28,
                  fontWeight: '700',
                },
              }
            : {}),
        }}
      />
      <Stack.Screen
        name="create-post"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTransparent: false,
          headerLargeTitle: false,
          animation: 'slide_from_bottom',
          title: t('community:createPost.title'),
          contentStyle: {
            backgroundColor: isDark ? Colors.darkBg : Colors.background,
            height: '100%',
          },
        }}
      />
      <Stack.Screen
        name="post-success"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
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
