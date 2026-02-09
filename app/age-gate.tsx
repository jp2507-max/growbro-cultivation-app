import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ShieldCheck, Sprout, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { BackHandler, Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnUI } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { motion, rmTiming } from '@/src/lib/animations/motion';

export default function AgeGateScreen() {
  const insets = useSafeAreaInsets();
  const { confirmAge } = useAuth();
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(40);
  const [denied, setDenied] = React.useState<boolean>(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const animateIn = useCallback(() => {
    fadeAnim.set(withTiming(1, rmTiming(motion.dur.xl)));
    slideAnim.set(withTiming(0, rmTiming(motion.dur.xl)));
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    scheduleOnUI(animateIn);
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
    }
  };

  return (
    <View
      className="flex-1 bg-primaryDark"
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
              Welcome to GrowBro
            </Text>
            <Text className="mb-8 text-center text-[15px] leading-[22px] text-white/75">
              This app contains content related to cannabis cultivation and is
              intended for adults only.
            </Text>

            <View className="mb-8 items-center rounded-3xl bg-white p-7 shadow-lg dark:bg-dark-bg-card">
              <ShieldCheck size={28} color={Colors.primary} />
              <Text className="mt-3.5 text-center text-[22px] font-extrabold text-text dark:text-text-primary-dark">
                Are you 18 years or older?
              </Text>
              <Text className="mt-2 text-center text-[13px] leading-5 text-textSecondary dark:text-text-secondary-dark">
                You must be of legal age in your jurisdiction to use this
                application.
              </Text>
            </View>

            <View className="gap-3">
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-2.5 rounded-[20px] bg-primary py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright"
                onPress={handleConfirm}
                testID="age-confirm-btn"
              >
                <ShieldCheck size={20} color={Colors.white} />
                <Text className="text-[17px] font-bold text-white">
                  I am 18+
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="flex-row items-center justify-center gap-2.5 rounded-[20px] bg-white py-[18px] active:opacity-80 dark:bg-dark-bg-elevated"
                onPress={handleDeny}
                testID="age-deny-btn"
              >
                <XCircle size={20} color={Colors.red} />
                <Text className="text-[17px] font-bold text-red">
                  I am under 18
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View className="items-center">
            <View className="mb-6 size-[100px] items-center justify-center rounded-full bg-white/15">
              <XCircle size={56} color={Colors.red} />
            </View>
            <Text className="mb-3 text-[28px] font-black text-white">
              Access Denied
            </Text>
            <Text className="mb-9 text-center text-[15px] leading-[22px] text-white/75">
              You must be 18 years or older to use GrowBro. Please come back
              when you meet the age requirement.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="rounded-[20px] border border-white/30 bg-white/20 px-12 py-4 active:opacity-80"
              onPress={handleExit}
              testID="exit-btn"
            >
              <Text className="text-base font-bold text-white">Exit App</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
