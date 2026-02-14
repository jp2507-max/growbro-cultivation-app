import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { getTabIcon } from '@/src/lib/navigation/tab-icons';

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={isDark ? Colors.primaryBright : Colors.primary}
    >
      <NativeTabs.Trigger name="(garden)">
        <Icon {...getTabIcon('(garden)')} />
        <Label>{t('tabs.garden')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <Icon {...getTabIcon('schedule')} />
        <Label>{t('tabs.schedule')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scan">
        <Icon {...getTabIcon('scan')} />
        <Label>{t('tabs.scan')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="strains">
        <Icon {...getTabIcon('strains')} />
        <Label>{t('tabs.strains')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <Icon {...getTabIcon('community')} />
        <Label>{t('tabs.community')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
