import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { useThemeColor } from '@/src/components/ui/use-theme-color';
import { Pressable, View } from '@/src/tw';

type BackButtonProps = {
  onPress?: () => void;
  testID?: string;
  color?: string;
};

export function BackButton({ onPress, testID, color }: BackButtonProps) {
  const { t } = useTranslation('common');
  const { back } = useRouter();
  const iconColor = useThemeColor('text');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('goBack')}
      accessibilityHint={t('a11y.goBackHint')}
      className="dark:bg-dark-bg-card size-10 items-center justify-center rounded-full bg-white"
      onPress={onPress ?? back}
      testID={testID}
    >
      <PlatformIcon
        sfName="chevron.left"
        fallbackIcon={ChevronLeft}
        size={22}
        color={color ?? iconColor}
      />
    </Pressable>
  );
}

/** Invisible spacer matching BackButton dimensions for header alignment */
export function BackButtonSpacer() {
  return <View className="size-10 opacity-0" pointerEvents="none" />;
}
