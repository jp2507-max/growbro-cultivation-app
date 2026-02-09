import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';

import Colors from '@/constants/colors';
import { Pressable, View } from '@/src/tw';

type BackButtonProps = {
  onPress?: () => void;
  testID?: string;
  color?: string;
};

export function BackButton({
  onPress,
  testID,
  color = Colors.text,
}: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="dark:bg-dark-bg-card size-10 items-center justify-center rounded-full bg-white"
      onPress={onPress ?? (() => router.back())}
      testID={testID}
    >
      <ChevronLeft size={22} color={color} />
    </Pressable>
  );
}

/** Invisible spacer matching BackButton dimensions for header alignment */
export function BackButtonSpacer() {
  return (
    <View
      className="dark:bg-dark-bg-card size-10 items-center justify-center rounded-full bg-white"
      pointerEvents="none"
    />
  );
}
