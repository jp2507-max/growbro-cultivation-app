import * as Haptics from 'expo-haptics';
import { Link, useFocusEffect } from 'expo-router';
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
import { useTranslation } from 'react-i18next';
import { Alert, useColorScheme } from 'react-native';
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
import { WEEK_DAYS } from '@/src/constants/time';
import { useTasks } from '@/src/hooks/use-tasks';
import { motion, withRM } from '@/src/lib/animations/motion';
import type { Task } from '@/src/lib/instant';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const DAY_PILL_BG = {
  light: Colors.primary,
  dark: Colors.primaryBright,
} as const;

function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay(); // 0 (Sun) - 6 (Sat)
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

type TaskWithStatus = Task & {
  status: 'completed' | 'current' | 'upcoming';
};

const iconMap = {
  sun: Sun,
  droplets: Droplets,
  flask: FlaskConical,
  moon: Moon,
};

function StatusIndicator({ status }: { status: TaskWithStatus['status'] }) {
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
      <Text className="text-text-muted dark:text-text-muted-dark text-xs font-semibold">
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
  task: TaskWithStatus;
  index: number;
  isLast: boolean;
  onComplete: (id: string, completed: boolean) => void;
}) {
  const { t } = useTranslation('schedule');
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
              'w-0.5 flex-1 bg-border-light dark:bg-dark-border mt-1',
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
                  'text-xs font-bold text-text-secondary dark:text-text-secondary-dark',
                  isCurrent && 'text-white dark:text-dark-bg'
                )}
              >
                {task.time}
              </Text>
            </View>
            {isCompleted && (
              <Text className="text-primary dark:text-primary-bright text-xs font-semibold">
                {t('completed')}
              </Text>
            )}
            {isCurrent && (
              <Text className="text-primary dark:text-primary-bright text-xs font-extrabold">
                {t('upNext')}
              </Text>
            )}
          </View>
          <IconComponent
            size={20}
            color={isCompleted ? Colors.textMuted : Colors.primary}
          />
        </View>
        <Link
          href={{
            pathname: '/task-detail',
            params: { id: task.id, title: task.title },
          }}
          asChild
        >
          <Pressable accessibilityRole="button">
            <Text
              className={cn(
                'text-[17px] font-bold text-text dark:text-text-primary-dark',
                isCompleted &&
                  'line-through text-text-muted dark:text-text-muted-dark'
              )}
            >
              {task.title}
            </Text>
          </Pressable>
        </Link>
        <Text
          className={cn(
            'text-[13px] text-text-secondary dark:text-text-secondary-dark mt-0.5',
            isCompleted &&
              'line-through text-text-muted dark:text-text-muted-dark'
          )}
        >
          {task.subtitle}
        </Text>
        {isCurrent && (
          <Pressable
            accessibilityRole="button"
            className="border-text-secondary dark:border-text-secondary-dark mt-3.5 items-center rounded-[10px] border-[1.5px] py-2.5 active:opacity-80"
            onPress={() => {
              if (process.env.EXPO_OS !== 'web')
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onComplete(task.id, task.completed);
            }}
            testID={`complete-${task.id}`}
          >
            <Text className="text-text dark:text-text-primary-dark text-sm font-bold">
              {t('markComplete')}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const { t } = useTranslation('schedule');
  const insets = useSafeAreaInsets();
  const [today, setToday] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setToday(new Date());
    }, [])
  );
  const todayIndex = useMemo(() => today.getDay(), [today]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const baseDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [today, weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const weekNumber = useMemo(() => getISOWeekNumber(baseDate), [baseDate]);
  const { tasks: allTasks, toggleTask } = useTasks();

  const selectedDateStr = useMemo(() => {
    const d = weekDates[selectedDay];
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [weekDates, selectedDay]);

  const tasks = useMemo((): TaskWithStatus[] => {
    const dayTasks = [...allTasks].filter((t) => t.date === selectedDateStr);

    // Sort by time
    dayTasks.sort((a, b) => {
      const timeA = parseTimeToMinutes(a.time || a.dueTime || '12:00 AM');
      const timeB = parseTimeToMinutes(b.time || b.dueTime || '12:00 AM');
      if (timeA !== timeB) return timeA - timeB;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

    let foundCurrent = false;
    return dayTasks.map((t) => {
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
      if (t.completed) {
        status = 'completed';
      } else if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
      }
      return { ...t, status };
    });
  }, [allTasks, selectedDateStr]);

  const handleComplete = useCallback(
    (id: string, completed: boolean) => {
      toggleTask(id, completed);
    },
    [toggleTask]
  );

  const goToToday = useCallback(() => {
    setWeekOffset(0);
    setSelectedDay(todayIndex);
  }, [todayIndex]);

  const prevWeek = useCallback(() => {
    setWeekOffset((o) => o - 1);
  }, []);

  const nextWeek = useCallback(() => {
    setWeekOffset((o) => o + 1);
  }, []);

  const onAddSchedulePress = useCallback(() => {
    Alert.alert(t('comingSoon'), t('scheduleCreating'));
  }, [t]);

  const taskCount = tasks.length;
  const isToday = selectedDay === todayIndex && weekOffset === 0;

  const selectedDateLabel = useMemo(
    () =>
      isToday
        ? t('common:today').toLowerCase()
        : weekDates[selectedDay].toLocaleDateString('en-US', {
            weekday: 'long',
          }),
    [isToday, selectedDay, weekDates, t]
  );

  const headerTitle = isToday
    ? t('todaysSchedule')
    : t('daySchedule', { day: selectedDateLabel });

  return (
    <View
      className="bg-background dark:bg-dark-bg flex-1"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-5 py-3">
        <CalendarDays size={22} color={Colors.primary} />
        <Text className="text-text dark:text-text-primary-dark text-lg font-extrabold">
          {baseDate.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="bg-border dark:bg-dark-bg-card rounded-2xl px-3.5 py-1.5"
          accessibilityHint="Jump to today"
          onPress={goToToday}
        >
          <Text className="text-primary dark:text-primary-bright text-[13px] font-bold">
            {t('common:today')}
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
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            accessibilityHint="Navigate to the previous week"
            className="p-1 active:opacity-70"
            onPress={prevWeek}
          >
            <ChevronLeft size={20} color={Colors.textSecondary} />
          </Pressable>
          <Text className="text-text-secondary dark:text-text-secondary-dark text-sm font-semibold">
            {t('weekLabel', { number: weekNumber })}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next week"
            accessibilityHint="Navigate to the next week"
            className="p-1 active:opacity-70"
            onPress={nextWeek}
          >
            <ChevronRight size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View className="flex-row justify-around px-3">
          {WEEK_DAYS.map((day, i) => (
            <DayPill
              key={`${day}-${i}`}
              day={day}
              date={weekDates[i].getDate()}
              isSelected={selectedDay === i}
              onPress={() => setSelectedDay(i)}
            />
          ))}
        </View>

        <View className="bg-border-light dark:bg-dark-border mt-4 h-px" />

        <View className="mb-6 mt-5 flex-row items-baseline gap-2.5">
          <Text className="text-text dark:text-text-primary-dark text-2xl font-black">
            {headerTitle}
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark text-sm font-medium">
            {t('taskCount', { count: taskCount })}
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

        {tasks.length > 0 ? (
          <Text className="text-text-muted dark:text-text-muted-dark mt-2.5 text-center text-[13px]">
            {t('endOfSchedule', { day: selectedDateLabel })}
          </Text>
        ) : (
          <View className="items-center py-10">
            <View className="bg-border dark:bg-dark-bg-card mb-4 size-16 items-center justify-center rounded-full">
              <CalendarDays size={28} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark text-lg font-extrabold">
              {t('noTasksTitle')}
            </Text>
            <Text className="text-text-secondary dark:text-text-secondary-dark mt-2 text-center text-[15px]">
              {t('noTasksSubtitle', { day: selectedDateLabel })}
            </Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      <AnimatedFab testID="add-schedule-btn" onPress={onAddSchedulePress} />
    </View>
  );
}
