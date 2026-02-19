import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ShieldCheck, Sprout, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler } from 'react-native';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Body, Subtitle } from '@/src/components/ui/typography';
import { useThemeColor } from '@/src/components/ui/use-theme-color';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { ROUTES } from '@/src/lib/routes';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const scrollContentStyle = { flexGrow: 1, justifyContent: 'center' } as const;

export default function AgeGateScreen() {
  const { t } = useTranslation('auth');
  const { confirmAge } = useAuth();
  const onPrimaryColor = useThemeColor('onPrimary');
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(40);
  const [denied, setDenied] = React.useState<boolean>(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.get(),
    transform: [{ translateY: slideAnim.get() }],
  }));

  const animateIn = useCallback(() => {
    fadeAnim.set(withTiming(1, rmTiming(motion.dur.xl)));
    slideAnim.set(withTiming(0, rmTiming(motion.dur.xl)));
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    animateIn();
    return () => {
      cancelAnimation(fadeAnim);
      cancelAnimation(slideAnim);
    };
  }, [animateIn, fadeAnim, slideAnim]);

  const handleConfirm = () => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    confirmAge();
    router.replace(ROUTES.WELCOME);
  };

  const handleDeny = () => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setDenied(true);
  };

  const handleExit = () => {
    if (process.env.EXPO_OS !== 'web') {
      BackHandler.exitApp();
    } else if (typeof window !== 'undefined') {
      // On web, navigate to a blank page or show a message
      window.location.href = 'about:blank';
    }
  };

  return (
    <ScreenContainer
      className="bg-primary-dark dark:bg-dark-bg"
      withTopInset
      withBottomInset
    >
      <Animated.View style={animatedStyle} className="flex-1 px-7">
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {!denied ? (
            <>
              <View className="mb-8 items-center">
                <View className="bg-white/12 dark:bg-dark-bg-card/70 size-30 items-center justify-center rounded-full">
                  <View className="size-22 items-center justify-center rounded-full bg-white/20 dark:bg-dark-bg-elevated/90">
                    <Sprout size={44} color={Colors.white} />
                  </View>
                </View>
              </View>

              <Text className="mb-2.5 text-center text-[30px] font-black text-white dark:text-text-primary-dark">
                {t('ageGate.welcomeTitle')}
              </Text>
              <Subtitle className="mb-8 text-center text-[15px] leading-5.5 text-white/75 dark:text-text-secondary-dark">
                {t('ageGate.welcomeSubtitle')}
              </Subtitle>

              <Card className="mb-8 items-center p-7 shadow-lg">
                <ShieldCheck size={28} color={Colors.primary} />
                <Text className="mt-3.5 text-center text-[22px] font-extrabold text-text dark:text-text-primary-dark">
                  {t('ageGate.question')}
                </Text>
                <Body className="mt-2 text-center text-[13px] leading-5 text-text-secondary dark:text-text-secondary-dark">
                  {t('ageGate.legalNotice')}
                </Body>
              </Card>

              <View className="gap-3">
                <Button
                  onPress={handleConfirm}
                  rightIcon={<ShieldCheck size={20} color={onPrimaryColor} />}
                  testID="age-confirm-btn"
                >
                  {t('ageGate.confirmButton')}
                </Button>

                <Button
                  variant="secondary"
                  onPress={handleDeny}
                  rightIcon={<XCircle size={20} color={Colors.danger} />}
                  textClassName="text-danger"
                  testID="age-deny-btn"
                >
                  {t('ageGate.denyButton')}
                </Button>
              </View>
            </>
          ) : (
            <View className="items-center">
              <View className="mb-6 size-25 items-center justify-center rounded-full bg-white/15 dark:bg-dark-bg-card/75">
                <XCircle size={56} color={Colors.danger} />
              </View>
              <Text className="mb-3 text-[28px] font-black text-white dark:text-text-primary-dark">
                {t('ageGate.deniedTitle')}
              </Text>
              <Subtitle className="mb-9 text-center text-[15px] leading-5.5 text-white/75 dark:text-text-secondary-dark">
                {t('ageGate.deniedMessage')}
              </Subtitle>
              <Pressable
                accessibilityRole="button"
                className="rounded-[20px] border border-white/30 bg-white/20 px-12 py-4 active:opacity-80 dark:border-dark-border-bright dark:bg-dark-bg-card"
                onPress={handleExit}
                testID="exit-btn"
              >
                <Text className="text-base font-bold text-white dark:text-text-primary-dark">
                  {t('ageGate.exitApp')}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </ScreenContainer>
  );
}
