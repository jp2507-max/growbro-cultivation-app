import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  Circle,
  Clock,
  Droplets,
  FlaskConical,
  Thermometer,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
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

const defaultSteps: TaskStep[] = [
  {
    id: '1',
    label: 'STEP 1',
    title: 'Preparation',
    description:
      'Fill your reservoir with fresh, pH-balanced water. Ensure the temperature is approx 20°C.',
    tags: [
      { icon: 'droplets', text: '10 Liters Water' },
      { icon: 'thermometer', text: '20°C' },
    ],
    completed: false,
  },
  {
    id: '2',
    label: 'STEP 2',
    title: 'Micro-Nutrients',
    description:
      'Shake the bottle well before use. Add FloraMicro directly to the water reservoir.',
    tags: [{ icon: 'flask', text: '5ml FloraMicro' }],
    completed: false,
  },
  {
    id: '3',
    label: 'STEP 3',
    title: 'Stir Solution',
    description:
      'Stir the solution thoroughly using a clean mixing stick before adding the next nutrient to prevent lockout.',
    tags: [{ icon: 'clock', text: '2 Minutes' }],
    completed: false,
  },
  {
    id: '4',
    label: 'STEP 4',
    title: 'pH Check',
    description:
      'Test the final pH of the solution. It should be between 5.5 and 6.5.',
    tags: [],
    completed: false,
  },
];

export default function TaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const { title: taskTitle } = useLocalSearchParams<{ title?: string }>();
  const [steps, setSteps] = useState<TaskStep[]>(defaultSteps);
  const progressAnim = useSharedValue(0);

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? completedCount / steps.length : 0;

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%` as `${number}%`,
  }));

  useEffect(() => {
    progressAnim.set(withTiming(progress, rmTiming(motion.dur.lg)));
  }, [progress, progressAnim]);

  const toggleStep = useCallback((id: string) => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  }, []);

  const [showToast, setShowToast] = useState<boolean>(false);
  const toastAnim = useSharedValue(0);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastAnim.value,
    transform: [{ translateY: interpolate(toastAnim.value, [0, 1], [40, 0]) }],
  }));

  const dismissToast = useCallback(() => {
    setShowToast(false);
    router.back();
  }, []);

  const handleMarkComplete = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSteps((prev) => prev.map((s) => ({ ...s, completed: true })));
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
  }, [toastAnim, dismissToast]);

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
          {taskTitle ?? 'Nutrient Mix A'}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mb-6">
          <Text className="text-primary dark:text-primary-bright mb-1 text-xs font-extrabold tracking-widest">
            TASK PROGRESS
          </Text>
          <View className="mb-2.5 flex-row items-baseline justify-between">
            <Text className="text-text dark:text-text-primary-dark text-[22px] font-extrabold">
              Keep it growing!
            </Text>
            <Text
              className="text-text dark:text-text-primary-dark text-[28px] font-black"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View className="bg-borderLight dark:bg-dark-border h-2 overflow-hidden rounded">
            <Animated.View
              style={progressBarStyle}
              className="bg-primary dark:bg-primary-bright h-full rounded"
            />
          </View>
        </View>

        {steps.map((step) => (
          <Pressable
            accessibilityRole="button"
            key={step.id}
            className={cn(
              'bg-white dark:bg-dark-bg-card rounded-[18px] p-[18px] mb-3 overflow-hidden shadow-sm',
              step.completed && 'border-primaryLight dark:border-primary-bright'
            )}
            onPress={() => toggleStep(step.id)}
            testID={`step-${step.id}`}
          >
            {step.completed && (
              <View className="absolute inset-x-0 top-0 h-1 bg-[#4ADE80]" />
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
                    step.completed && 'text-primary dark:text-primary-bright'
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
            <Text className="text-textSecondary dark:text-text-secondary-dark mb-2.5 text-sm leading-5">
              {step.description}
            </Text>
            {step.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {step.tags.map((tag) => {
                  const TagIcon = iconMap[tag.icon];
                  return (
                    <View
                      key={tag.text}
                      className="bg-background dark:bg-dark-bg flex-row items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                    >
                      <TagIcon size={14} color={Colors.textSecondary} />
                      <Text className="text-textSecondary dark:text-text-secondary-dark text-xs font-semibold">
                        {tag.text}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Pressable>
        ))}
        <View className="h-[100px]" />
      </ScrollView>

      <View
        className="bg-background dark:bg-dark-bg absolute inset-x-0 bottom-0 px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          accessibilityRole="button"
          className="bg-primaryDark dark:bg-primary-bright flex-row items-center justify-center gap-2.5 rounded-[20px] py-[18px] shadow-md active:opacity-80"
          onPress={handleMarkComplete}
          disabled={showToast}
          testID="mark-complete-btn"
        >
          <CheckCircle size={20} color={Colors.white} />
          <Text className="text-[17px] font-bold text-white">
            Mark as Complete
          </Text>
        </Pressable>
      </View>

      {showToast && (
        <Animated.View
          style={[toastStyle, { bottom: Math.max(insets.bottom, 16) + 80 }]}
          className="bg-primaryDark dark:bg-primary-bright absolute inset-x-5 flex-row items-center gap-2.5 rounded-2xl px-5 py-4 shadow-lg"
        >
          <CheckCircle size={18} color={Colors.white} />
          <Text className="text-[15px] font-bold text-white">
            Task Completed! Good job. 🌱
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
