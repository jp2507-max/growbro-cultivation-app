import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { getTabIcon, type TabRouteName } from '@/src/lib/navigation/tab-icons';

function renderTabIcon(routeName: TabRouteName): React.ReactElement {
  const { sf, androidName } = getTabIcon(routeName);

  return <NativeTabs.Trigger.Icon sf={sf} md={androidName} />;
}

export default function TabLayout() {
  const { t } = useTranslation('common');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={isDark ? Colors.primaryBright : Colors.primary}
    >
      <NativeTabs.Trigger name="(garden)">
        {renderTabIcon('(garden)')}
        <NativeTabs.Trigger.Label>{t('tabs.garden')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        {renderTabIcon('schedule')}
        <NativeTabs.Trigger.Label>
          {t('tabs.schedule')}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scan">
        {renderTabIcon('scan')}
        <NativeTabs.Trigger.Label>{t('tabs.scan')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="strains">
        {renderTabIcon('strains')}
        <NativeTabs.Trigger.Label>{t('tabs.strains')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        {renderTabIcon('community')}
        <NativeTabs.Trigger.Label>
          {t('tabs.community')}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
