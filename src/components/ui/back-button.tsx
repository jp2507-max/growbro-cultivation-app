import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';

import Colors from '@/constants/colors';

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
      className="size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
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
    <Pressable
      accessibilityRole="button"
      className="size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
      pointerEvents="none"
    />
  );
}
