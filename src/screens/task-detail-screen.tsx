import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import type { TFunction } from 'i18next';
import {
  CheckCircle,
  Circle,
  Clock,
  Droplets,
  FlaskConical,
  Thermometer,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';
import {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { BackButton } from '@/src/components/ui/back-button';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { db } from '@/src/lib/instant';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

interface TaskStep {
  id: string;
  label: string;
  title: string;
  description: string;
  tags: {
    icon: 'droplets' | 'thermometer' | 'clock' | 'flask';
    text: string;
  }[];
  completed: boolean;
}

const iconMap = {
  droplets: Droplets,
  thermometer: Thermometer,
  clock: Clock,
  flask: FlaskConical,
};

function buildDefaultSteps(
  t: TFunction<['task-detail', 'common']>
): TaskStep[] {
  return [
    {
      id: '1',
      label: t('steps.step1.label'),
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
      tags: [
        {
          icon: 'droplets',
          text: t('steps.step1.tags.water', { amount: 10 }),
        },
        {
          icon: 'thermometer',
          text: t('steps.step1.tags.temperature', { temperature: 20 }),
        },
      ],
      completed: false,
    },
    {
      id: '2',
      label: t('steps.step2.label'),
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      tags: [
        {
          icon: 'flask',
          text: t('steps.step2.tags.micro', { amount: 5 }),
        },
      ],
      completed: false,
    },
    {
      id: '3',
      label: t('steps.step3.label'),
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      tags: [
        {
          icon: 'clock',
          text: t('steps.step3.tags.duration', { duration: 2 }),
        },
      ],
      completed: false,
    },
    {
      id: '4',
      label: t('steps.step4.label'),
      title: t('steps.step4.title'),
      description: t('steps.step4.description'),
      tags: [],
      completed: false,
    },
  ];
}

export function TaskDetailScreen(): React.ReactElement {
  const { t } = useTranslation(['task-detail', 'common']);
  const insets = useSafeAreaInsets();
  const { id, title: taskTitle } = useLocalSearchParams<{
    id?: string;
    title?: string;
  }>();

  const { data, isLoading, error } = db.useQuery(
    id ? { tasks: { $: { where: { id } } } } : null
  );
  const task = data?.tasks?.[0];
  const taskNotFound = id && !isLoading && !task;

  const displayTitle = task?.title ?? taskTitle ?? t('defaultTitle');

  const defaultSteps = useMemo(() => buildDefaultSteps(t), [t]);
  const [steps, setSteps] = useState<TaskStep[]>(defaultSteps);

  useEffect(() => {
    setSteps(defaultSteps);
  }, [defaultSteps]);
  const progressAnim = useSharedValue(0);

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? completedCount / steps.length : 0;

  const progressBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressAnim.get() }],
    transformOrigin: 'left center',
  }));

  useEffect(() => {
    progressAnim.set(withTiming(progress, rmTiming(motion.dur.lg)));
  }, [progress, progressAnim]);

  const toggleStep = useCallback((stepId: string) => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s))
    );
  }, []);

  const [showToast, setShowToast] = useState<boolean>(false);
  const toastAnim = useSharedValue(0);
  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cancelAnimation(toastAnim);
    };
  }, [toastAnim]);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastAnim.get(),
    transform: [{ translateY: interpolate(toastAnim.get(), [0, 1], [40, 0]) }],
  }));

  const dismissToast = useCallback(() => {
    if (!isMounted.current) return;
    setShowToast(false);
    router.back();
  }, []);

  const handleMarkComplete = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const prevSteps = steps;
    setSteps((prev) => prev.map((s) => ({ ...s, completed: true })));
    if (id) {
      db.transact(
        db.tx.tasks[id].update({
          completed: true,
        })
      ).catch((e) => {
        console.error('Failed to complete task:', e);
        setSteps(prevSteps);
        setShowToast(false);
        cancelAnimation(toastAnim);
        toastAnim.set(0);
      });
    }

    setShowToast(true);
    toastAnim.set(
      withSequence(
        withTiming(1, rmTiming(motion.dur.lg)),
        withDelay(
          2000,
          withTiming(0, rmTiming(motion.dur.lg), (finished) => {
            if (finished) scheduleOnRN(dismissToast);
          })
        )
      )
    );
  }, [id, toastAnim, dismissToast, steps]);

  return (
    <View
      className="bg-background dark:bg-dark-bg flex-1"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center gap-2.5 px-4 py-2.5">
        <BackButton testID="back-task" />
        <Text
          className="text-text dark:text-text-primary-dark flex-1 text-center text-[17px] font-bold"
          numberOfLines={1}
        >
          {displayTitle}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {isLoading && !task ? (
          <View className="mb-8 items-center justify-center pt-20">
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text className="text-text-secondary dark:text-text-secondary-dark mt-4 font-medium">
              {t('loading')}
            </Text>
          </View>
        ) : error || taskNotFound ? (
          <View className="mb-8 items-center justify-center pt-20">
            <Text className="text-danger dark:text-error-dark text-center font-bold">
              {error ? t('errors.failedToLoad') : t('errors.notFound')}
            </Text>
            <Text className="text-text-secondary dark:text-text-secondary-dark mt-2 text-center">
              {error?.message ?? t('errors.mightBeDeleted')}
            </Text>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              className="mt-6 rounded-xl bg-primary px-6 py-3 dark:bg-primary-bright"
            >
              <Text className="font-bold text-white dark:text-dark-bg">
                {t('common:goBack')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="mb-6">
              <Text className="text-primary dark:text-primary-bright mb-1 text-xs font-extrabold tracking-widest">
                {t('taskProgress')}
              </Text>
              <View className="mb-2.5 flex-row items-baseline justify-between">
                <Text className="text-text dark:text-text-primary-dark text-[22px] font-extrabold">
                  {t('keepGrowing')}
                </Text>
                <Text
                  className="text-text dark:text-text-primary-dark text-[28px] font-black"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View className="bg-border-light dark:bg-dark-border h-2 overflow-hidden rounded">
                <Animated.View
                  style={progressBarStyle}
                  className="bg-primary dark:bg-primary-bright h-full w-full self-start rounded"
                />
              </View>
            </View>

            {steps.map((step) => (
              <Pressable
                accessibilityRole="button"
                key={step.id}
                className={cn(
                  'bg-white dark:bg-dark-bg-card rounded-[18px] p-4.5 mb-3 overflow-hidden shadow-sm border border-transparent',
                  step.completed &&
                    'border-primary-light dark:border-primary-bright'
                )}
                onPress={() => toggleStep(step.id)}
                testID={`step-${step.id}`}
              >
                {step.completed && (
                  <View className="absolute inset-x-0 top-0 h-1 bg-primary dark:bg-primary-bright" />
                )}
                <View className="mb-2 flex-row items-start justify-between">
                  <View className="flex-1">
                    {!step.completed && (
                      <Text className="text-primary dark:text-primary-bright mb-1 text-[11px] font-extrabold tracking-wide">
                        {step.label}
                      </Text>
                    )}
                    <Text
                      className={cn(
                        'text-lg font-bold text-text dark:text-text-primary-dark',
                        step.completed &&
                          'text-primary dark:text-primary-bright'
                      )}
                    >
                      {step.title}
                    </Text>
                  </View>
                  {step.completed ? (
                    <CheckCircle size={28} color={Colors.primary} />
                  ) : (
                    <Circle size={28} color={Colors.borderLight} />
                  )}
                </View>
                <Text className="text-text-secondary dark:text-text-secondary-dark mb-2.5 text-sm leading-5">
                  {step.description}
                </Text>
                {step.tags.length > 0 && (
                  <View className="flex-row flex-wrap gap-2">
                    {step.tags.map((tag) => {
                      const TagIcon = iconMap[tag.icon];
                      return (
                        <View
                          key={`${tag.icon}-${tag.text}`}
                          className="bg-background dark:bg-dark-bg flex-row items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                        >
                          <TagIcon size={14} color={Colors.textSecondary} />
                          <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-semibold">
                            {tag.text}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Pressable>
            ))}
            <View className="h-25" />
          </>
        )}
      </ScrollView>

      <View
        className="bg-background dark:bg-dark-bg absolute inset-x-0 bottom-0 px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          accessibilityRole="button"
          className={cn(
            'bg-primary-dark dark:bg-primary-bright flex-row items-center justify-center gap-2.5 rounded-[20px] py-4.5 shadow-md active:opacity-80',
            showToast && 'opacity-50'
          )}
          onPress={handleMarkComplete}
          disabled={showToast}
          testID="mark-complete-btn"
        >
          <CheckCircle size={20} color={Colors.white} />
          <Text className="text-[17px] font-bold text-white">
            {t('markComplete')}
          </Text>
        </Pressable>
      </View>

      {showToast && (
        <Animated.View
          style={[toastStyle, { bottom: Math.max(insets.bottom, 16) + 80 }]}
          className="bg-primary-dark dark:bg-primary-bright absolute inset-x-5 flex-row items-center gap-2.5 rounded-2xl px-5 py-4 shadow-lg"
          accessibilityLiveRegion="polite"
          accessibilityLabel={t('taskCompletedSuccess')}
          accessibilityHint={t('taskCompletedHint')}
        >
          <CheckCircle size={18} color={Colors.white} />
          <Text className="text-[15px] font-bold text-white">
            {t('taskCompleted')}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
