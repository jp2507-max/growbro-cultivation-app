import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
  Camera,
  CheckCircle2,
  Heart,
  Leaf,
  Pill,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  Button,
  Card,
  IconCircle,
  ScreenContainer,
  ScreenHeader,
  SectionHeader,
} from '@/src/components/ui';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import {
  recordAiDiagnosisResultMetric,
  recordAiTreatmentAddedMetric,
  recordTaskCompletionMetric,
} from '@/src/lib/observability/sentry-metrics';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

interface DiagnosisResult {
  status: 'healthy' | 'issue';
  title: string;
  confidence: number;
  explanation: string;
  treatmentSteps: string[];
}

export default function AIDiagnosisScreen() {
  const { t } = useTranslation('scan');
  const { back } = useRouter();
  const insets = useSafeAreaInsets();
  const { type, startedAt, imageUri } = useLocalSearchParams<{
    type?: string;
    startedAt?: string;
    imageUri?: string;
  }>();

  const diagnosisResults = useMemo<Record<string, DiagnosisResult>>(
    () => ({
      healthy: {
        status: 'healthy',
        title: t('diagnosis.healthy.title'),
        confidence: 94,
        explanation: t('diagnosis.healthy.explanation'),
        treatmentSteps: [
          t('diagnosis.healthy.steps.step1'),
          t('diagnosis.healthy.steps.step2'),
          t('diagnosis.healthy.steps.step3'),
          t('diagnosis.healthy.steps.step4'),
        ],
      },
      issue: {
        status: 'issue',
        title: t('diagnosis.issue.title'),
        confidence: 87,
        explanation: t('diagnosis.issue.explanation'),
        treatmentSteps: [
          t('diagnosis.issue.steps.step1'),
          t('diagnosis.issue.steps.step2'),
          t('diagnosis.issue.steps.step3'),
          t('diagnosis.issue.steps.step4'),
          t('diagnosis.issue.steps.step5'),
        ],
      },
    }),
    [t]
  );

  const result = diagnosisResults[type === 'issue' ? 'issue' : 'healthy'];
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);
  const progressAnim = useSharedValue(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const toastAnim = useSharedValue(0);
  const isMounted = React.useRef(true);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.get(),
    transform: [{ translateY: slideAnim.get() }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressAnim.get() }],
    transformOrigin: 'left center',
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

    return () => {
      cancelAnimation(fadeAnim);
      cancelAnimation(slideAnim);
      cancelAnimation(progressAnim);
      cancelAnimation(toastAnim);
      isMounted.current = false;
    };
  }, [animateIn, fadeAnim, progressAnim, slideAnim, toastAnim]);

  useEffect(() => {
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
  }, [result.confidence, result.status, startedAt]);

  const dismissToast = useCallback(() => {
    if (!isMounted.current) return;
    setShowToast(false);
    back();
  }, [back]);

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
  const statusColor = isHealthy ? Colors.primary : Colors.issue;
  const statusBg = isHealthy ? Colors.border : Colors.warningLight;

  return (
    <ScreenContainer withTopInset>
      <ScreenHeader title={t('diagnosis.title')} backTestID="back-diagnosis" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View style={contentStyle}>
          <Card
            className="mb-4 items-center rounded-3xl p-7 shadow-md"
            style={{ borderLeftWidth: 5, borderLeftColor: statusColor }}
          >
            <IconCircle
              size="xl"
              className="mb-4"
              style={{ backgroundColor: statusBg }}
            >
              {isHealthy ? (
                <Heart size={32} color={statusColor} />
              ) : (
                <AlertTriangle size={32} color={statusColor} />
              )}
            </IconCircle>
            <Text
              className="mb-5 text-center text-2xl font-black"
              style={{ color: statusColor }}
              selectable
            >
              {result.title}
            </Text>

            <View className="w-full">
              <View className="mb-2 flex-row justify-between">
                <Text className="text-text-secondary dark:text-text-secondary-dark text-[13px] font-semibold">
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
              <View className="bg-border-light dark:bg-dark-border h-2 overflow-hidden rounded">
                <Animated.View
                  style={[progressBarStyle, { backgroundColor: statusColor }]}
                  className="h-full w-full self-start rounded"
                />
              </View>
            </View>
          </Card>

          <Card className="mb-4 p-5">
            <SectionHeader title={t('diagnosis.analysis')} icon={Leaf} />
            <Text
              className="text-text-secondary dark:text-text-secondary-dark text-[15px] leading-6"
              selectable
            >
              {result.explanation}
            </Text>
          </Card>

          {imageUri ? (
            <Card className="mb-4 p-5">
              <SectionHeader title={t('diagnosis.image')} icon={Camera} />
              <Image
                source={{ uri: imageUri }}
                className="h-52 w-full rounded-2xl"
                contentFit="cover"
                transition={150}
              />
            </Card>
          ) : null}

          <Card className="mb-4 p-5">
            <SectionHeader
              title={
                isHealthy
                  ? t('diagnosis.maintenancePlan')
                  : t('diagnosis.treatmentPlan')
              }
              icon={Pill}
              iconColor={Colors.warning}
            />
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
          </Card>

          <Button
            className="mb-3 py-4.5"
            onPress={handleAddToTasks}
            testID="add-treatment-tasks-btn"
            leftIcon={<CalendarPlus size={20} color={Colors.white} />}
            rightIcon={<ArrowRight size={18} color={Colors.white} />}
          >
            {t('diagnosis.addToSchedule')}
          </Button>

          <Pressable
            accessibilityRole="button"
            className="border-primary dark:border-primary-bright items-center rounded-[20px] border-2 py-4 active:opacity-80"
            onPress={back}
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
          className="bg-primary-dark dark:bg-primary-bright absolute inset-x-5 flex-row items-center gap-2.5 rounded-2xl px-5 py-3.5 shadow-lg"
        >
          <CheckCircle2 size={20} color={Colors.white} />
          <Text className="text-[15px] font-semibold text-white">
            {t('diagnosis.treatmentAdded')}
          </Text>
        </Animated.View>
      )}
    </ScreenContainer>
  );
}
