import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, PartyPopper, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { Button, ScreenContainer } from '@/src/components/ui';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { ROUTES } from '@/src/lib/routes';
import { Pressable, Text, View } from '@/src/tw';

export default function HarvestSuccessScreen(): React.ReactElement {
  const { t } = useTranslation('harvest');
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { weight } = useLocalSearchParams<{ weight?: string }>();

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const handleGoToGarden = useCallback(() => {
    router.replace(ROUTES.GARDEN);
  }, []);

  const handleGoToProfile = useCallback(() => {
    router.replace(ROUTES.PROFILE);
  }, []);

  return (
    <ScreenContainer withTopInset>
      <View className="flex-1 px-5 pt-1">
        <View className="mb-3 items-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeSuccessLabel')}
            accessibilityHint={t('a11y.closeSuccessHint')}
            className="size-10 items-center justify-center rounded-full bg-card dark:bg-dark-bg-card"
            onPress={handleClose}
            testID="close-harvest-success"
          >
            <PlatformIcon
              sfName="xmark"
              fallbackIcon={X}
              size={20}
              color={isDark ? Colors.textPrimaryDark : Colors.text}
            />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-2 pb-4">
          <View className="mb-4 size-22 items-center justify-center rounded-full bg-border dark:bg-dark-bg-card">
            <PlatformIcon
              sfName="checkmark.circle.fill"
              fallbackIcon={CheckCircle2}
              size={56}
              color={Colors.primary}
            />
          </View>
          <View className="mb-2.5 flex-row items-center gap-2">
            <PartyPopper size={24} color={Colors.warning} />
            <Text className="text-2xl font-black text-text dark:text-text-primary-dark">
              {t('success.title')}
            </Text>
            <PartyPopper size={24} color={Colors.warning} />
          </View>
          <Text className="mb-7 text-center text-[15px] leading-5.5 text-text-secondary dark:text-text-secondary-dark">
            {t('success.message', { weight: weight ?? '0' })}
          </Text>
        </View>

        <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <Button
            className="mb-2.5 w-full rounded-[18px] py-4"
            onPress={handleGoToGarden}
            testID="go-garden-btn"
          >
            {t('success.startNewGrow')}
          </Button>
          <Button
            variant="ghost"
            className="border-primary dark:border-primary-bright w-full rounded-[18px] py-3.5"
            textClassName="text-primary dark:text-primary-bright"
            onPress={handleGoToProfile}
            testID="go-profile-btn"
          >
            {t('success.viewInventory')}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}
