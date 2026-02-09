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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
  cancelAnimation,
  FadeInUp,
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { AnimatedFab } from '@/src/components/ui/fab';
import { useTasks } from '@/src/hooks/use-tasks';
import { motion, withRM } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DAY_PILL_BG = {
  light: Colors.primary,
  dark: Colors.primaryBright,
} as const;

function getWeekDates(baseDate: Date): number[] {
  const day = baseDate.getDay(); // 0 (Sun) - 6 (Sat)
  const mondayOffset = (day + 6) % 7; // 0 when Monday
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

type ScheduleTask = {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  status?: string;
  icon?: string;
  completed: boolean;
};

const iconMap = {
  sun: Sun,
  droplets: Droplets,
  flask: FlaskConical,
  moon: Moon,
};

function StatusIndicator({ status }: { status: string | undefined }) {
  if (status === 'completed')
    return (
      <CheckCircle size={28} color={Colors.primary} fill={Colors.primary} />
    );
  if (status === 'current')
    return (
      <View className="border-primary dark:border-primary-bright size-7 items-center justify-center rounded-full border-2">
        <View className="bg-primary dark:bg-primary-bright size-2.5 rounded-full" />
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
  const colorScheme = useColorScheme() ?? 'light';
  const selectedBgColor = DAY_PILL_BG[colorScheme];
  const scale = useSharedValue(1);
  const bgProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    scale.set(withSpring(isSelected ? 1.1 : 1, motion.spring.stiff));
    bgProgress.set(withSpring(isSelected ? 1 : 0, motion.spring.stiff));
    return () => {
      cancelAnimation(scale);
      cancelAnimation(bgProgress);
    };
  }, [isSelected, scale, bgProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      bgProgress.value,
      [0, 1],
      ['transparent', selectedBgColor]
    ),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      className="items-center gap-1.5"
      onPress={onPress}
    >
      <Text className="text-textMuted dark:text-text-muted-dark text-xs font-semibold">
        {day}
      </Text>
      <Animated.View
        style={animatedStyle}
        className="size-[38px] items-center justify-center rounded-full"
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
  const IconComponent = iconMap[task.icon as keyof typeof iconMap] ?? Sun;
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
              <Text className="text-primary dark:text-primary-bright text-xs font-semibold">
                Completed
              </Text>
            )}
            {isCurrent && (
              <Text className="text-primary dark:text-primary-bright text-xs font-extrabold">
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
            className="border-textSecondary dark:border-text-secondary-dark mt-3.5 items-center rounded-[10px] border-[1.5px] py-2.5 active:opacity-80"
            onPress={() => {
              if (process.env.EXPO_OS !== 'web')
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onComplete(task.id);
            }}
            testID={`complete-${task.id}`}
          >
            <Text className="text-text dark:text-text-primary-dark text-sm font-bold">
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
  const today = useMemo(() => new Date(), []);
  const todayIndex = useMemo(() => (today.getDay() + 6) % 7, [today]);
  const weekDates = useMemo(() => getWeekDates(today), [today]);
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const { tasks, toggleTask } = useTasks();

  const handleComplete = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) toggleTask(id, task.completed);
    },
    [tasks, toggleTask]
  );

  const taskCount = tasks.length;

  return (
    <View
      className="bg-background dark:bg-dark-bg flex-1"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-5 py-3">
        <CalendarDays size={22} color={Colors.primary} />
        <Text className="text-text dark:text-text-primary-dark text-lg font-extrabold">
          {new Date().toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="bg-border dark:bg-dark-bg-card rounded-2xl px-3.5 py-1.5"
        >
          <Text className="text-primary dark:text-primary-bright text-[13px] font-bold">
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
          <View>
            <ChevronLeft size={20} color={Colors.textSecondary} />
          </View>
          <Text className="text-textSecondary dark:text-text-secondary-dark text-sm font-semibold">
            Week 4
          </Text>
          <View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </View>
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

        <View className="bg-borderLight dark:bg-dark-border mx-5 mt-4 h-px" />

        <View className="mb-6 flex-row items-baseline gap-2.5">
          <Text className="text-text dark:text-text-primary-dark text-2xl font-black">
            {"Today's Schedule"}
          </Text>
          <Text className="text-textMuted dark:text-text-muted-dark text-sm font-medium">
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

        <Text className="text-textMuted dark:text-text-muted-dark mt-2.5 text-center text-[13px]">
          End of schedule for today
        </Text>
        <View className="h-20" />
      </ScrollView>

      <AnimatedFab testID="add-schedule-btn" />
    </View>
  );
}
