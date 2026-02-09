import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import {
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  FlaskConical,
  Moon,
  Sun,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import {
  type ScheduleTask,
  scheduleTasks,
  weekDates,
  weekDays,
} from '@/mocks/schedule';
import { AnimatedFab } from '@/src/components/ui/fab';
import { motion, withRM } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';

const iconMap = {
  sun: Sun,
  droplets: Droplets,
  flask: FlaskConical,
  moon: Moon,
};

function StatusIndicator({ status }: { status: ScheduleTask['status'] }) {
  if (status === 'completed')
    return (
      <CheckCircle size={28} color={Colors.primary} fill={Colors.primary} />
    );
  if (status === 'current')
    return (
      <View className="size-7 items-center justify-center rounded-full border-2 border-primary dark:border-primary-bright">
        <View className="size-2.5 rounded-full bg-primary dark:bg-primary-bright" />
      </View>
    );
  return <Clock size={24} color={Colors.textMuted} />;
}

function DayPill({
  day,
  date,
  isSelected,
  onPress,
}: {
  day: string;
  date: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.set(withSpring(isSelected ? 1.1 : 1, motion.spring.stiff));
    return () => cancelAnimation(scale);
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      className="items-center gap-1.5"
      onPress={onPress}
    >
      <Text className="text-xs font-semibold text-textMuted dark:text-text-muted-dark">
        {day}
      </Text>
      <Animated.View
        style={animatedStyle}
        className={cn(
          'w-[38px] h-[38px] rounded-full items-center justify-center',
          isSelected && 'bg-primary dark:bg-primary-bright'
        )}
      >
        <Text
          className={cn(
            'text-base font-bold text-text dark:text-text-primary-dark',
            isSelected && 'text-white dark:text-dark-bg'
          )}
        >
          {date}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function ScheduleCard({
  task,
  index,
  isLast,
  onComplete,
}: {
  task: ScheduleTask;
  index: number;
  isLast: boolean;
  onComplete: (id: string) => void;
}) {
  const IconComponent = iconMap[task.icon];
  const isCurrent = task.status === 'current';
  const isCompleted = task.status === 'completed';

  return (
    <Animated.View
      className="mb-2 flex-row gap-3.5"
      entering={withRM(FadeInUp.delay(index * 80).duration(motion.dur.md))}
      layout={withRM(LinearTransition.duration(motion.dur.md))}
    >
      <View className="w-8 items-center">
        <StatusIndicator status={task.status} />
        {!isLast && (
          <View
            className={cn(
              'w-0.5 flex-1 bg-borderLight dark:bg-dark-border mt-1',
              isCurrent && 'bg-primary dark:bg-primary-bright'
            )}
          />
        )}
      </View>
      <View
        className={cn(
          'flex-1 bg-white dark:bg-dark-bg-card rounded-2xl p-4 mb-2 shadow-sm',
          isCurrent &&
            'border-[1.5px] border-primary dark:border-primary-bright shadow-md'
        )}
      >
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className={cn(
                'bg-background dark:bg-dark-bg px-2 py-0.5 rounded-md',
                isCurrent && 'bg-primary dark:bg-primary-bright'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-bold text-textSecondary dark:text-text-secondary-dark',
                  isCurrent && 'text-white dark:text-dark-bg'
                )}
              >
                {task.time}
              </Text>
            </View>
            {isCompleted && (
              <Text className="text-xs font-semibold text-primary dark:text-primary-bright">
                Completed
              </Text>
            )}
            {isCurrent && (
              <Text className="text-xs font-extrabold text-primary dark:text-primary-bright">
                UP NEXT
              </Text>
            )}
          </View>
          <IconComponent
            size={20}
            color={isCompleted ? Colors.textMuted : Colors.primary}
          />
        </View>
        <Link
          href={{ pathname: '/task-detail', params: { title: task.title } }}
          asChild
        >
          <Pressable accessibilityRole="button">
            <Text
              className={cn(
                'text-[17px] font-bold text-text dark:text-text-primary-dark',
                isCompleted &&
                  'line-through text-textMuted dark:text-text-muted-dark'
              )}
            >
              {task.title}
            </Text>
          </Pressable>
        </Link>
        <Text
          className={cn(
            'text-[13px] text-textSecondary dark:text-text-secondary-dark mt-0.5',
            isCompleted &&
              'line-through text-textMuted dark:text-text-muted-dark'
          )}
        >
          {task.subtitle}
        </Text>
        {isCurrent && (
          <Pressable
            accessibilityRole="button"
            className="mt-3.5 items-center rounded-[10px] border-[1.5px] border-textSecondary py-2.5 active:opacity-80 dark:border-text-secondary-dark"
            onPress={() => {
              if (process.env.EXPO_OS !== 'web')
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onComplete(task.id);
            }}
            testID={`complete-${task.id}`}
          >
            <Text className="text-sm font-bold text-text dark:text-text-primary-dark">
              Mark Complete
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(4);
  const [tasks, setTasks] = useState<ScheduleTask[]>(scheduleTasks);

  const handleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'completed' as const } : t
      )
    );
  }, []);

  const taskCount = tasks.length;

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-bg"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-5 py-3">
        <CalendarDays size={22} color={Colors.primary} />
        <Text className="text-lg font-extrabold text-text dark:text-text-primary-dark">
          October 2023
        </Text>
        <Pressable
          accessibilityRole="button"
          className="rounded-2xl bg-border px-3.5 py-1.5 dark:bg-dark-bg-card"
        >
          <Text className="text-[13px] font-bold text-primary dark:text-primary-bright">
            Today
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 100,
        }}
      >
        <View className="mb-3 flex-row items-center justify-between px-5">
          <Pressable accessibilityRole="button">
            <ChevronLeft size={20} color={Colors.textSecondary} />
          </Pressable>
          <Text className="text-sm font-semibold text-textSecondary dark:text-text-secondary-dark">
            Week 4
          </Text>
          <Pressable accessibilityRole="button">
            <ChevronRight size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View className="flex-row justify-around px-3">
          {weekDays.map((day, i) => (
            <DayPill
              key={`${day}-${i}`}
              day={day}
              date={weekDates[i]}
              isSelected={selectedDay === i}
              onPress={() => setSelectedDay(i)}
            />
          ))}
        </View>

        <View className="mx-5 mt-4 h-px bg-borderLight dark:bg-dark-border" />

        <View className="mb-6 flex-row items-baseline gap-2.5">
          <Text className="text-2xl font-black text-text dark:text-text-primary-dark">
            {"Today's Schedule"}
          </Text>
          <Text className="text-sm font-medium text-textMuted dark:text-text-muted-dark">
            {taskCount} Tasks
          </Text>
        </View>

        {tasks.map((task, index) => (
          <ScheduleCard
            key={task.id}
            task={task}
            index={index}
            isLast={index === tasks.length - 1}
            onComplete={handleComplete}
          />
        ))}

        <Text className="mt-2.5 text-center text-[13px] text-textMuted dark:text-text-muted-dark">
          End of schedule for today
        </Text>
        <View className="h-20" />
      </ScrollView>

      <AnimatedFab testID="add-schedule-btn" />
    </View>
  );
}
