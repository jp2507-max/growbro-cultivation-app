import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
        <Icon
          sf={{ default: 'leaf', selected: 'leaf.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="spa" />}
        />
        <Label>{t('tabs.garden')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <Icon
          sf="calendar"
          androidSrc={
            <VectorIcon family={MaterialIcons} name="calendar-today" />
          }
        />
        <Label>{t('tabs.schedule')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scan">
        <Icon
          sf="viewfinder"
          androidSrc={
            <VectorIcon family={MaterialIcons} name="center-focus-weak" />
          }
        />
        <Label>{t('tabs.scan')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="strains">
        <Icon
          sf={{ default: 'book', selected: 'book.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="menu-book" />}
        />
        <Label>{t('tabs.strains')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <Icon
          sf={{ default: 'person.2', selected: 'person.2.fill' }}
          androidSrc={<VectorIcon family={MaterialIcons} name="people" />}
        />
        <Label>{t('tabs.community')}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
