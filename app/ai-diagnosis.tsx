import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Heart,
  Leaf,
  Pill,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { BackButton, BackButtonSpacer } from '@/src/components/ui/back-button';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import {
  recordAiDiagnosisResultMetric,
  recordAiTreatmentAddedMetric,
  recordTaskCompletionMetric,
} from '@/src/lib/observability/sentry-metrics';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

interface DiagnosisResult {
  status: 'healthy' | 'issue';
  title: string;
  confidence: number;
  explanation: string;
  treatmentSteps: string[];
}

const diagnosisResults: Record<string, DiagnosisResult> = {
  healthy: {
    status: 'healthy',
    title: 'Plant Looks Healthy!',
    confidence: 94,
    explanation:
      'Your plant appears to be in excellent condition. Leaves show vibrant green color with no signs of nutrient deficiency, pest damage, or disease. The overall structure and growth pattern indicate a well-maintained plant.',
    treatmentSteps: [
      'Continue current watering schedule',
      'Maintain nutrient mix as planned',
      'Monitor new growth for any changes',
      'Keep environmental conditions stable',
    ],
  },
  issue: {
    status: 'issue',
    title: 'Nitrogen Deficiency Detected',
    confidence: 87,
    explanation:
      'The lower leaves are showing yellowing patterns characteristic of nitrogen deficiency. This typically starts from the bottom of the plant and progresses upward. The older leaves turn pale green then yellow because nitrogen is a mobile nutrient that the plant redirects to new growth.',
    treatmentSteps: [
      'Increase nitrogen in next feeding by 20%',
      'Use a balanced N-P-K fertilizer (higher N ratio)',
      'Check pH levels — nitrogen uptake is best at pH 6.0-6.5',
      'Monitor affected leaves over the next 5-7 days',
      'Consider foliar spray for quick absorption',
    ],
  },
};

export default function AIDiagnosisScreen() {
  const { t } = useTranslation('scan');
  const insets = useSafeAreaInsets();
  const { type, startedAt } = useLocalSearchParams<{
    type?: string;
    startedAt?: string;
  }>();
  const result = diagnosisResults[type === 'issue' ? 'issue' : 'healthy'];
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);
  const progressAnim = useSharedValue(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const toastAnim = useSharedValue(0);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.get(),
    transform: [{ translateY: slideAnim.get() }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.get() * 100}%` as `${number}%`,
  }));

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastAnim.get(),
  }));

  const animateIn = useCallback(() => {
    fadeAnim.set(withTiming(1, rmTiming(motion.dur.xl)));
    slideAnim.set(withTiming(0, rmTiming(motion.dur.xl)));
    progressAnim.set(
      withDelay(
        motion.dur.lg,
        withTiming(result.confidence / 100, rmTiming(1200))
      )
    );
  }, [result.confidence, fadeAnim, slideAnim, progressAnim]);

  useEffect(() => {
    animateIn();

    const parsedStartedAt = Number(startedAt);
    const durationMs =
      Number.isFinite(parsedStartedAt) && parsedStartedAt > 0
        ? Date.now() - parsedStartedAt
        : undefined;

    recordAiDiagnosisResultMetric({
      diagnosisType: result.status,
      confidence: result.confidence,
      durationMs,
    });

    return () => {
      cancelAnimation(fadeAnim);
      cancelAnimation(slideAnim);
      cancelAnimation(progressAnim);
    };
  }, [
    animateIn,
    fadeAnim,
    progressAnim,
    result.confidence,
    result.status,
    slideAnim,
    startedAt,
  ]);

  const dismissToast = useCallback(() => {
    setShowToast(false);
    router.back();
  }, []);

  const handleAddToTasks = useCallback(() => {
    recordAiTreatmentAddedMetric({ diagnosisType: result.status });
    recordTaskCompletionMetric({ source: 'diagnosis' });

    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowToast(true);
    toastAnim.set(
      withSequence(
        withTiming(1, rmTiming(motion.dur.lg)),
        withDelay(
          2000,
          withTiming(0, rmTiming(motion.dur.lg), (finished) => {
            if (finished) {
              scheduleOnRN(dismissToast);
            }
          })
        )
      )
    );
  }, [dismissToast, result.status, toastAnim]);

  const isHealthy = result.status === 'healthy';
  const statusColor = isHealthy ? Colors.primary : '#E65100';
  const statusBg = isHealthy ? Colors.border : '#FFF3E0';

  return (
    <View
      className="bg-background dark:bg-dark-bg flex-1"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-2.5">
        <BackButton testID="back-diagnosis" />
        <Text className="text-text dark:text-text-primary-dark text-[17px] font-bold">
          {t('diagnosis.title')}
        </Text>
        <BackButtonSpacer />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View style={contentStyle}>
          <View
            className="dark:bg-dark-bg-elevated mb-4 items-center rounded-3xl bg-white p-7 shadow-md"
            style={{ borderLeftWidth: 5, borderLeftColor: statusColor }}
          >
            <View
              className="mb-4 size-18 items-center justify-center rounded-full"
              style={{ backgroundColor: statusBg }}
            >
              {isHealthy ? (
                <Heart size={32} color={statusColor} />
              ) : (
                <AlertTriangle size={32} color={statusColor} />
              )}
            </View>
            <Text
              className="mb-5 text-center text-2xl font-black"
              style={{ color: statusColor }}
              selectable
            >
              {result.title}
            </Text>

            <View className="w-full">
              <View className="mb-2 flex-row justify-between">
                <Text className="text-textSecondary dark:text-text-secondary-dark text-[13px] font-semibold">
                  {t('diagnosis.confidence')}
                </Text>
                <Text
                  className="text-[15px] font-extrabold"
                  style={{ color: statusColor, fontVariant: ['tabular-nums'] }}
                  selectable
                >
                  {result.confidence}%
                </Text>
              </View>
              <View className="bg-borderLight dark:bg-dark-border h-2 overflow-hidden rounded">
                <Animated.View
                  style={[progressBarStyle, { backgroundColor: statusColor }]}
                  className="h-full rounded"
                />
              </View>
            </View>
          </View>

          <View className="dark:bg-dark-bg-elevated mb-4 rounded-[20px] bg-white p-5 shadow-sm">
            <View className="mb-3.5 flex-row items-center gap-2.5">
              <Leaf size={18} color={Colors.primary} />
              <Text className="text-text dark:text-text-primary-dark text-[17px] font-bold">
                {t('diagnosis.analysis')}
              </Text>
            </View>
            <Text
              className="text-textSecondary dark:text-text-secondary-dark text-[15px] leading-6"
              selectable
            >
              {result.explanation}
            </Text>
          </View>

          <View className="dark:bg-dark-bg-elevated mb-4 rounded-[20px] bg-white p-5 shadow-sm">
            <View className="mb-3.5 flex-row items-center gap-2.5">
              <Pill size={18} color={Colors.warning} />
              <Text className="text-text dark:text-text-primary-dark text-[17px] font-bold">
                {isHealthy
                  ? t('diagnosis.maintenancePlan')
                  : t('diagnosis.treatmentPlan')}
              </Text>
            </View>
            {result.treatmentSteps.map((step, index) => (
              <View key={index} className="mb-3.5 flex-row items-start gap-3.5">
                <View className="bg-border dark:bg-dark-bg-card size-7 items-center justify-center rounded-full">
                  <Text className="text-primary dark:text-primary-bright text-[13px] font-extrabold">
                    {index + 1}
                  </Text>
                </View>
                <Text className="text-text dark:text-text-primary-dark flex-1 pt-0.5 text-[15px] leading-5.5">
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            className="bg-primaryDark dark:bg-primary-bright mb-3 flex-row items-center justify-center gap-2.5 rounded-[20px] py-4.5 shadow-md active:opacity-80"
            onPress={handleAddToTasks}
            testID="add-treatment-tasks-btn"
          >
            <CalendarPlus size={20} color={Colors.white} />
            <Text className="text-[17px] font-bold text-white">
              {t('diagnosis.addToSchedule')}
            </Text>
            <ArrowRight size={18} color={Colors.white} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="border-primary dark:border-primary-bright items-center rounded-[20px] border-2 py-4 active:opacity-80"
            onPress={() => router.back()}
            testID="scan-again-btn"
          >
            <Text className="text-primary dark:text-primary-bright text-base font-bold">
              {t('diagnosis.scanAgain')}
            </Text>
          </Pressable>

          <View className="h-10" />
        </Animated.View>
      </ScrollView>

      {showToast && (
        <Animated.View
          style={[toastStyle, { bottom: insets.bottom + 20 }]}
          className="bg-primaryDark dark:bg-primary-bright absolute inset-x-5 flex-row items-center gap-2.5 rounded-2xl px-5 py-3.5 shadow-lg"
        >
          <CheckCircle2 size={20} color={Colors.white} />
          <Text className="text-[15px] font-semibold text-white">
            {t('diagnosis.treatmentAdded')}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
