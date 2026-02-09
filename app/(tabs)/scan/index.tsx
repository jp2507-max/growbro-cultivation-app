import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  AlertTriangle,
  Camera,
  Heart,
  Leaf,
  ScanLine,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { rmTiming } from '@/src/lib/animations/motion';

export default function ScanScreen() {
  const [scanning, setScanning] = useState<boolean>(false);
  const pulseAnim = useSharedValue(1);
  const scanLineAnim = useSharedValue(0);

  useEffect(() => {
    return () => {
      cancelAnimation(pulseAnim);
      cancelAnimation(scanLineAnim);
    };
  }, [pulseAnim, scanLineAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scanLineAnim.value, [0, 1], [0, 220]) },
    ],
  }));

  const startScanAnimations = useCallback(() => {
    pulseAnim.set(
      withRepeat(
        withSequence(
          withTiming(1.15, rmTiming(800)),
          withTiming(1, rmTiming(800))
        ),
        -1,
        true
      )
    );
    scanLineAnim.set(
      withRepeat(
        withSequence(
          withTiming(1, rmTiming(2000)),
          withTiming(0, rmTiming(2000))
        ),
        -1,
        true
      )
    );
  }, [pulseAnim, scanLineAnim]);

  const stopScanAnimations = useCallback(() => {
    cancelAnimation(pulseAnim);
    cancelAnimation(scanLineAnim);
    pulseAnim.set(1);
    scanLineAnim.set(0);
  }, [pulseAnim, scanLineAnim]);

  const handleScan = useCallback(
    (resultType: 'healthy' | 'issue') => {
      if (process.env.EXPO_OS !== 'web')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setScanning(true);
      startScanAnimations();

      setTimeout(() => {
        setScanning(false);
        stopScanAnimations();
        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push({
          pathname: '/ai-diagnosis',
          params: { type: resultType },
        });
      }, 2500);
    },
    [startScanAnimations, stopScanAnimations]
  );

  return (
    <ScrollView
      className="flex-1 bg-background dark:bg-dark-bg"
      contentContainerStyle={{ flexGrow: 1 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="mt-0.5 px-5 text-sm text-textSecondary dark:text-text-secondary-dark">
        Diagnose plant health instantly
      </Text>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          style={scanning ? pulseStyle : undefined}
          className="size-[280px] rounded-[28px] bg-white shadow-lg dark:bg-dark-bg-elevated"
        >
          <View className="relative m-4 flex-1 overflow-hidden rounded-2xl bg-border dark:bg-dark-bg-card">
            <View className="absolute left-0 top-0 size-7 rounded-tl-2xl border-l-[3px] border-t-[3px] border-primary dark:border-primary-bright" />
            <View className="absolute right-0 top-0 size-7 rounded-tr-2xl border-r-[3px] border-t-[3px] border-primary dark:border-primary-bright" />
            <View className="absolute bottom-0 left-0 size-7 rounded-bl-2xl border-b-[3px] border-l-[3px] border-primary dark:border-primary-bright" />
            <View className="absolute bottom-0 right-0 size-7 rounded-br-2xl border-b-[3px] border-r-[3px] border-primary dark:border-primary-bright" />

            <View className="flex-1 items-center justify-center gap-3">
              {scanning ? (
                <>
                  <Animated.View
                    style={scanLineStyle}
                    className="absolute inset-x-2.5 top-2.5 h-[3px] rounded-sm bg-primary opacity-70 dark:bg-primary-bright"
                  />
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text className="text-[15px] font-semibold text-primary dark:text-primary-bright">
                    Analyzing plant...
                  </Text>
                </>
              ) : (
                <>
                  <View className="size-20 items-center justify-center rounded-full bg-white shadow-sm dark:bg-dark-bg-elevated">
                    <Camera size={48} color={Colors.primary} />
                  </View>
                  <Text className="text-base font-bold text-text dark:text-text-primary-dark">
                    Point camera at your plant
                  </Text>
                  <Text className="px-5 text-center text-[13px] text-textSecondary dark:text-text-secondary-dark">
                    Take a clear photo of leaves for best results
                  </Text>
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      <View className="px-5 pb-6">
        <View className="mb-5 flex-row gap-2.5">
          <View className="flex-1 items-center gap-1.5 rounded-[14px] bg-white py-3 shadow-sm dark:bg-dark-bg-card">
            <ScanLine size={20} color={Colors.primary} />
            <Text className="text-[11px] font-semibold text-textSecondary dark:text-text-secondary-dark">
              Focus on leaves
            </Text>
          </View>
          <View className="flex-1 items-center gap-1.5 rounded-[14px] bg-white py-3 shadow-sm dark:bg-dark-bg-card">
            <Zap size={20} color={Colors.amber} />
            <Text className="text-[11px] font-semibold text-textSecondary dark:text-text-secondary-dark">
              Good lighting
            </Text>
          </View>
          <View className="flex-1 items-center gap-1.5 rounded-[14px] bg-white py-3 shadow-sm dark:bg-dark-bg-card">
            <Leaf size={20} color={Colors.primaryLight} />
            <Text className="text-[11px] font-semibold text-textSecondary dark:text-text-secondary-dark">
              Close-up shot
            </Text>
          </View>
        </View>

        <Text className="mb-2.5 text-xs font-bold uppercase tracking-widest text-textMuted dark:text-text-muted-dark">
          Demo Scans
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mb-2.5 flex-row items-center justify-center gap-2.5 rounded-[18px] bg-primaryDark py-4 shadow-md active:opacity-80 dark:bg-primary-bright"
          onPress={() => handleScan('healthy')}
          disabled={scanning}
          testID="scan-healthy-btn"
        >
          <Heart size={20} color={Colors.white} />
          <Text className="text-base font-bold text-white">
            Scan — Healthy Result
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="mb-2.5 flex-row items-center justify-center gap-2.5 rounded-[18px] bg-[#E65100] py-4 shadow-md active:opacity-80"
          onPress={() => handleScan('issue')}
          disabled={scanning}
          testID="scan-issue-btn"
        >
          <AlertTriangle size={20} color={Colors.white} />
          <Text className="text-base font-bold text-white">
            Scan — Issue Detected
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
