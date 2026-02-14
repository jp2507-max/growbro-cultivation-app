import { router } from 'expo-router';
import { CheckCircle, X } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { Button, ScreenContainer } from '@/src/components/ui';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { ROUTES } from '@/src/lib/routes';
import { Pressable, Text, View } from '@/src/tw';

export default function AddPlantSuccessScreen() {
  const { t } = useTranslation('add-plant');
  const tCommon = useTranslation('common').t;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleClose = useCallback(() => {
    router.replace(ROUTES.GARDEN);
  }, []);

  return (
    <ScreenContainer withTopInset>
      <View className="flex-1 px-5 pt-1">
        <View className="mb-3 items-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeSuccessLabel')}
            accessibilityHint={t('a11y.closeSuccessHint')}
            className="bg-card dark:bg-dark-bg-card size-10 items-center justify-center rounded-full"
            onPress={handleClose}
            testID="close-add-plant-success"
          >
            <PlatformIcon
              sfName="xmark"
              fallbackIcon={X}
              size={20}
              color={isDark ? Colors.textPrimaryDark : Colors.text}
            />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-3 pb-4">
          <View className="bg-primary dark:bg-primary-bright mb-5 size-20 items-center justify-center rounded-full">
            <PlatformIcon
              sfName="checkmark.circle.fill"
              fallbackIcon={CheckCircle}
              size={48}
              color={Colors.white}
            />
          </View>
          <Text className="text-text dark:text-text-primary-dark mb-2.5 text-center text-[26px] font-black">
            {t('success.title')}
          </Text>
          <Text className="text-text-secondary mb-7 text-center text-[15px] leading-5.5 dark:text-text-secondary-dark">
            {t('success.message')}
          </Text>
        </View>

        <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <Button
            accessibilityLabel={tCommon('goToGarden')}
            accessibilityHint={t('a11y.closeSuccessHint')}
            className="w-full rounded-[18px] py-4"
            onPress={handleClose}
            testID="go-to-garden-btn"
          >
            {t('success.goToGarden')}
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}
