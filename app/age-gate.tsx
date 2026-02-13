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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

export default function AgeGateScreen() {
  const { t } = useTranslation('auth');
  const insets = useSafeAreaInsets();
  const { confirmAge } = useAuth();
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
    router.replace('/welcome');
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
    <View
      className="bg-primaryDark flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Animated.View
        style={animatedStyle}
        className="flex-1 justify-center px-7"
      >
        {!denied ? (
          <>
            <View className="mb-8 items-center">
              <View className="bg-white/12 size-[120px] items-center justify-center rounded-full">
                <View className="size-[88px] items-center justify-center rounded-full bg-white/20">
                  <Sprout size={44} color={Colors.white} />
                </View>
              </View>
            </View>

            <Text className="mb-2.5 text-center text-[30px] font-black text-white">
              {t('ageGate.welcomeTitle')}
            </Text>
            <Text className="mb-8 text-center text-[15px] leading-[22px] text-white/75">
              {t('ageGate.welcomeSubtitle')}
            </Text>

            <View className="dark:bg-dark-bg-card mb-8 items-center rounded-3xl bg-white p-7 shadow-lg">
              <ShieldCheck size={28} color={Colors.primary} />
              <Text className="text-text dark:text-text-primary-dark mt-3.5 text-center text-[22px] font-extrabold">
                {t('ageGate.question')}
              </Text>
              <Text className="text-textSecondary dark:text-text-secondary-dark mt-2 text-center text-[13px] leading-5">
                {t('ageGate.legalNotice')}
              </Text>
            </View>

            <View className="gap-3">
              <Pressable
                accessibilityRole="button"
                className="bg-primary dark:bg-primary-bright flex-row items-center justify-center gap-2.5 rounded-[20px] py-[18px] shadow-md active:opacity-80"
                onPress={handleConfirm}
                testID="age-confirm-btn"
              >
                <ShieldCheck size={20} color={Colors.white} />
                <Text className="text-[17px] font-bold text-white">
                  {t('ageGate.confirmButton')}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="dark:bg-dark-bg-elevated flex-row items-center justify-center gap-2.5 rounded-[20px] bg-white py-[18px] active:opacity-80"
                onPress={handleDeny}
                testID="age-deny-btn"
              >
                <XCircle size={20} color={Colors.danger} />
                <Text className="text-danger text-[17px] font-bold">
                  {t('ageGate.denyButton')}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="items-center">
            <View className="mb-6 size-[100px] items-center justify-center rounded-full bg-white/15">
              <XCircle size={56} color={Colors.danger} />
            </View>
            <Text className="mb-3 text-[28px] font-black text-white">
              {t('ageGate.deniedTitle')}
            </Text>
            <Text className="mb-9 text-center text-[15px] leading-[22px] text-white/75">
              {t('ageGate.deniedMessage')}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="rounded-[20px] border border-white/30 bg-white/20 px-12 py-4 active:opacity-80"
              onPress={handleExit}
              testID="exit-btn"
            >
              <Text className="text-base font-bold text-white">
                {t('ageGate.exitApp')}
              </Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
