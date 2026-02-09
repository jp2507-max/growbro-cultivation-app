import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'nativewind';
import React from 'react';

import Colors from '@/constants/colors';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={isDark ? Colors.primaryBright : Colors.primary}
    >
      <NativeTabs.Trigger name="(garden)">
        <Icon sf={{ default: 'leaf', selected: 'leaf.fill' }} />
        <Label>Garden</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedule">
        <Icon sf="calendar" />
        <Label>Schedule</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scan">
        <Icon sf="viewfinder" />
        <Label>AI Scan</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="strains">
        <Icon sf={{ default: 'book', selected: 'book.fill' }} />
        <Label>Strains</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
        <Label>Community</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
