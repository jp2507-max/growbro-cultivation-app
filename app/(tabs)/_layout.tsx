import { MaterialIcons } from '@expo/vector-icons';
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from 'expo-router/unstable-native-tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { getTabIcon, type TabRouteName } from '@/src/lib/navigation/tab-icons';

function renderTabIcon(routeName: TabRouteName): React.ReactElement {
  const { sf, androidName } = getTabIcon(routeName);

  return (
    <Icon
      sf={sf}
      androidSrc={<VectorIcon family={MaterialIcons} name={androidName} />}
    />
  );
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
        <Label>{t('tabs.garden')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        {renderTabIcon('schedule')}
        <Label>{t('tabs.schedule')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scan">
        {renderTabIcon('scan')}
        <Label>{t('tabs.scan')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="strains">
        {renderTabIcon('strains')}
        <Label>{t('tabs.strains')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        {renderTabIcon('community')}
        <Label>{t('tabs.community')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
