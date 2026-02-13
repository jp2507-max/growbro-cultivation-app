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
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import {
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
import { recordAiDiagnosisStartedMetric } from '@/src/lib/observability/sentry-metrics';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const SCAN_TRAVEL_DISTANCE = 220;

export default function ScanScreen() {
  const { t } = useTranslation('scan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pulseAnim = useSharedValue(1);
  const scanLineAnim = useSharedValue(0);
  const scanTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      cancelAnimation(pulseAnim);
      cancelAnimation(scanLineAnim);
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, [pulseAnim, scanLineAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.get() }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scanLineAnim.get(),
          [0, 1],
          [0, SCAN_TRAVEL_DISTANCE]
        ),
      },
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
      const startedAt = Date.now();
      recordAiDiagnosisStartedMetric({ diagnosisType: resultType });

      if (process.env.EXPO_OS !== 'web')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsAnalyzing(true);
      startScanAnimations();

      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }

      scanTimerRef.current = setTimeout(() => {
        setIsAnalyzing(false);
        stopScanAnimations();
        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push({
          pathname: '/ai-diagnosis',
          params: { type: resultType, startedAt: String(startedAt) },
        });
        scanTimerRef.current = null;
      }, 2500);
    },
    [startScanAnimations, stopScanAnimations]
  );

  return (
    <ScrollView
      className="bg-background dark:bg-dark-bg flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="text-textSecondary dark:text-text-secondary-dark mt-0.5 px-5 text-sm">
        {t('subtitle')}
      </Text>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          style={isAnalyzing ? pulseStyle : undefined}
          className="dark:bg-dark-bg-elevated size-70 rounded-[28px] bg-white shadow-lg"
        >
          <View className="bg-border dark:bg-dark-bg-card relative m-4 flex-1 overflow-hidden rounded-2xl">
            <View className="border-primary dark:border-primary-bright absolute left-0 top-0 size-7 rounded-tl-2xl border-l-[3px] border-t-[3px]" />
            <View className="border-primary dark:border-primary-bright absolute right-0 top-0 size-7 rounded-tr-2xl border-r-[3px] border-t-[3px]" />
            <View className="border-primary dark:border-primary-bright absolute bottom-0 left-0 size-7 rounded-bl-2xl border-b-[3px] border-l-[3px]" />
            <View className="border-primary dark:border-primary-bright absolute bottom-0 right-0 size-7 rounded-br-2xl border-b-[3px] border-r-[3px]" />

            <View className="flex-1 items-center justify-center gap-3">
              {isAnalyzing ? (
                <>
                  <Animated.View
                    style={scanLineStyle}
                    className="bg-primary dark:bg-primary-bright absolute inset-x-2.5 top-2.5 h-0.75 rounded-sm opacity-70"
                  />
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text className="text-primary dark:text-primary-bright text-[15px] font-semibold">
                    {t('analyzing')}
                  </Text>
                </>
              ) : (
                <>
                  <View className="dark:bg-dark-bg-elevated size-20 items-center justify-center rounded-full bg-white shadow-sm">
                    <Camera size={48} color={Colors.primary} />
                  </View>
                  <Text className="text-text dark:text-text-primary-dark text-base font-bold">
                    {t('pointCamera')}
                  </Text>
                  <Text className="text-textMuted dark:text-text-muted-dark text-center text-[13px]">
                    {t('clearPhoto')}
                  </Text>
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      <View className="px-5 pb-6">
        <View className="mb-5 flex-row gap-2.5">
          <View className="dark:bg-dark-bg-card flex-1 items-center gap-1.5 rounded-[14px] bg-white py-3 shadow-sm">
            <ScanLine size={20} color={Colors.primary} />
            <Text className="text-textSecondary dark:text-text-secondary-dark text-[11px] font-semibold">
              {t('tips.focusLeaves')}
            </Text>
          </View>
          <View className="dark:bg-dark-bg-card flex-1 items-center gap-1.5 rounded-[14px] bg-white py-3 shadow-sm">
            <Zap size={20} color={Colors.warning} />
            <Text className="text-textSecondary dark:text-text-secondary-dark text-[11px] font-semibold">
              {t('tips.goodLighting')}
            </Text>
          </View>
          <View className="dark:bg-dark-bg-card flex-1 items-center gap-1.5 rounded-[14px] bg-white py-3 shadow-sm">
            <Leaf size={20} color={Colors.primaryLight} />
            <Text className="text-textSecondary dark:text-text-secondary-dark text-[11px] font-semibold">
              {t('tips.closeUp')}
            </Text>
          </View>
        </View>

        <Text className="text-textMuted dark:text-text-muted-dark mb-2.5 text-xs font-bold uppercase tracking-widest">
          {t('demoScans')}
        </Text>

        <Pressable
          accessibilityRole="button"
          className="bg-primaryDark dark:bg-primary-bright mb-2.5 flex-row items-center justify-center gap-2.5 rounded-[18px] py-4 shadow-md active:opacity-80 disabled:opacity-50"
          onPress={() => handleScan('healthy')}
          disabled={isAnalyzing}
          testID="scan-healthy-btn"
        >
          <Heart size={20} color={Colors.white} />
          <Text className="text-base font-bold text-white">
            {t('scanHealthy')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="mb-2.5 flex-row items-center justify-center gap-2.5 rounded-[18px] py-4 shadow-md active:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: Colors.issue }}
          onPress={() => handleScan('issue')}
          disabled={isAnalyzing}
          testID="scan-issue-btn"
        >
          <AlertTriangle size={20} color={Colors.white} />
          <Text className="text-base font-bold text-white">
            {t('scanIssue')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
