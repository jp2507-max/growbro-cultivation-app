import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Link, useFocusEffect } from 'expo-router';
import Stack from 'expo-router/stack';
import i18next from 'i18next';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Moon,
  Sun,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  FadeInUp,
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { Badge } from '@/src/components/ui/badge';
import { HeaderAction } from '@/src/components/ui/header-action';
import { useTaskEngine } from '@/src/hooks/use-task-engine';
import { useTasks } from '@/src/hooks/use-tasks';
import { motion, withRM } from '@/src/lib/animations/motion';
import type { Task } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const DAY_PILL_BG = {
  light: Colors.primary,
  dark: Colors.primaryBright,
} as const;

const iconMap = {
  sun: Sun,
  droplets: Droplets,
  flask: FlaskConical,
  moon: Moon,
} as const;

const PILL_W = 56;
const PILL_W_SELECTED = 64;
const PILL_H = 80;
const PILL_H_SELECTED = 96;
const PILL_GAP = 12;
const TIMELINE_RAIL_WIDTH = 28;
const WEEK_SWIPE_THRESHOLD = 48;
const WEEK_SWIPE_MAX_VERTICAL = 56;

const SCHEDULE_CONTENT_CONTAINER_STYLE = {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 100,
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
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

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskWithStatus = Task & {
  status: 'completed' | 'current' | 'upcoming';
};

// ─── Day Pill (Horizontal Calendar Strip) ────────────────────────────────────

function DayPill({
  dayKey,
  dayIndex,
  date,
  isSelected,
  isPast,
  onPress,
}: {
  dayKey: (typeof WEEKDAY_KEYS)[number];
  dayIndex: number;
  date: number;
  isSelected: boolean;
  isPast: boolean;
  onPress: (index: number) => void;
}): React.ReactElement {
  const { t } = useTranslation('schedule');
  const colorScheme = useColorScheme() ?? 'light';
  const resolvedColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const selectedBgColor = DAY_PILL_BG[resolvedColorScheme];
  const scale = useSharedValue(1);
  const bgProgress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    scale.set(withSpring(isSelected ? 1.05 : 1, motion.spring.stiff));
    bgProgress.set(withSpring(isSelected ? 1 : 0, motion.spring.stiff));
    return () => {
      cancelAnimation(scale);
      cancelAnimation(bgProgress);
    };
  }, [isSelected, scale, bgProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    backgroundColor: interpolateColor(
      bgProgress.get(),
      [0, 1],
      ['transparent', selectedBgColor]
    ),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dayLabel = t(`weekdays.${dayKey}` as any).toUpperCase();

  return (
    <Pressable
      accessibilityRole="button"
      className="items-center"
      onPress={() => onPress(dayIndex)}
      style={{ opacity: isPast && !isSelected ? 0.6 : 1 }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: isSelected ? PILL_W_SELECTED : PILL_W,
            height: isSelected ? PILL_H_SELECTED : PILL_H,
            marginTop: isSelected ? -8 : 0,
          },
        ]}
        className={cn(
          'items-center justify-center',
          isSelected ? 'rounded-full' : 'rounded-2xl',
          !isSelected &&
            'bg-white dark:bg-dark-bg-card border border-border-light dark:border-dark-border'
        )}
      >
        <Text
          className={cn(
            'text-[11px] font-bold mb-1',
            isSelected
              ? 'text-dark-bg'
              : 'text-text-muted dark:text-text-muted-dark'
          )}
          style={isSelected ? { color: Colors.darkBg } : undefined}
        >
          {dayLabel}
        </Text>
        <Text
          className={cn('font-black', isSelected ? 'text-[22px]' : 'text-lg')}
          style={{
            color: isSelected
              ? Colors.darkBg
              : colorScheme === 'dark'
                ? Colors.textPrimaryDark
                : Colors.text,
          }}
        >
          {date}
        </Text>
        {isSelected && (
          <View
            className="mt-1 size-1.5 rounded-full"
            style={{ backgroundColor: Colors.darkBg }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Timeline Dot ────────────────────────────────────────────────────────────

function TimelineDot({
  status,
}: {
  status: TaskWithStatus['status'];
}): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (status === 'completed') {
    return (
      <View
        className="size-4 items-center justify-center rounded-full border-2"
        style={{
          backgroundColor: isDark ? Colors.darkBgCard : Colors.borderLight,
          borderColor: isDark ? Colors.textMutedDark : Colors.textMuted,
        }}
      >
        <CheckCircle2
          size={10}
          color={isDark ? Colors.textMutedDark : Colors.textMuted}
        />
      </View>
    );
  }

  if (status === 'current') {
    return (
      <View
        className="size-4 rounded-full border-2"
        style={{
          backgroundColor: Colors.primaryBright,
          borderColor: Colors.darkBg,
          shadowColor: Colors.primaryBright,
          shadowOpacity: 0.6,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        }}
      />
    );
  }

  // upcoming
  return (
    <View
      className="size-4 rounded-full border-2"
      style={{
        backgroundColor: isDark ? Colors.darkBgCard : Colors.borderLight,
        borderColor: isDark ? Colors.textMutedDark : Colors.textMuted,
      }}
    />
  );
}

// ─── Completed Task Card ─────────────────────────────────────────────────────

function CompletedTaskCard({
  task,
}: {
  task: TaskWithStatus;
}): React.ReactElement {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View className="bg-card dark:bg-dark-bg-card rounded-2xl border border-border-light p-5 dark:border-dark-border">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-text dark:text-text-primary-dark text-lg font-bold line-through decoration-text-muted dark:decoration-text-muted-dark">
          {task.title}
        </Text>
        <View className="rounded-full bg-border-light p-1 dark:bg-dark-bg-elevated">
          <CheckCircle2
            size={18}
            color={
              colorScheme === 'dark' ? Colors.textMutedDark : Colors.textMuted
            }
          />
        </View>
      </View>
      <Text className="text-text-secondary dark:text-text-secondary-dark text-sm line-through">
        {task.subtitle}
      </Text>
    </View>
  );
}

// ─── Active Task Card ────────────────────────────────────────────────────────

function ActiveTaskCard({
  task,
  onComplete,
}: {
  task: TaskWithStatus;
  onComplete: (id: string, completed: boolean) => void;
}): React.ReactElement {
  const { t } = useTranslation('schedule');
  const colorScheme = useColorScheme() ?? 'light';
  const accentColor =
    colorScheme === 'dark' ? Colors.primaryBright : Colors.primary;
  const accentOnColor = colorScheme === 'dark' ? Colors.darkBg : Colors.white;
  const IconComponent =
    iconMap[task.icon as keyof typeof iconMap] ?? FlaskConical;

  return (
    <View
      className="bg-card dark:bg-dark-bg-card overflow-hidden rounded-2xl border-[1.5px] p-5"
      style={{
        borderColor: accentColor,
        shadowColor: accentColor,
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
      }}
    >
      {/* Glow background effect */}
      <View
        className="absolute -right-10 -top-10 size-32 rounded-full opacity-10"
        style={{ backgroundColor: accentColor }}
      />

      <View className="relative z-10">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-text dark:text-text-primary-dark mb-1 text-xl font-black">
              {task.title}
            </Text>
            <View className="flex-row items-center gap-1">
              <IconComponent
                size={16}
                color={
                  colorScheme === 'dark'
                    ? Colors.textMutedDark
                    : Colors.textMuted
                }
              />
              <Text className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
                {task.subtitle}
              </Text>
            </View>
          </View>

          {/* Priority badge */}
          <View
            className="bg-primary-alpha-15 dark:bg-primary-alpha-30 rounded-full border px-3 py-1"
            style={{
              borderColor: accentColor,
            }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              {t('highPriority')}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <Pressable
          accessibilityRole="button"
          className="mt-4 flex-row items-center justify-center gap-2 rounded-xl py-3.5 active:opacity-90"
          style={{
            backgroundColor: accentColor,
            shadowColor: accentColor,
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
          onPress={() => {
            if (process.env.EXPO_OS !== 'web')
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onComplete(task.id, task.completed);
          }}
          testID={`complete-${task.id}`}
        >
          <CheckCircle2 size={20} color={accentOnColor} />
          <Text className="text-sm font-bold" style={{ color: accentOnColor }}>
            {t('markAsCompleted')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Upcoming Task Card ──────────────────────────────────────────────────────

function UpcomingTaskCard({
  task,
}: {
  task: TaskWithStatus;
}): React.ReactElement {
  return (
    <View className="bg-card dark:bg-dark-bg-card rounded-2xl border border-dashed border-border-light p-5 dark:border-dark-border">
      <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
        {task.title}
      </Text>
      <Text className="text-text-secondary dark:text-text-secondary-dark text-sm">
        {task.subtitle}
      </Text>
    </View>
  );
}

// ─── Timeline Item ───────────────────────────────────────────────────────────

// ─── Timeline Item ───────────────────────────────────────────────────────────

function TimelineItemWithHandler({
  task,
  index,
  onComplete,
}: {
  task: TaskWithStatus;
  index: number;
  onComplete: (id: string, completed: boolean) => void;
}): React.ReactElement {
  const isCurrent = task.status === 'current';
  const colorScheme = useColorScheme() ?? 'light';
  const railColor = colorScheme === 'dark' ? Colors.darkBorder : Colors.border;

  return (
    <View style={{ opacity: task.status === 'upcoming' ? 0.4 : 1 }}>
      <Animated.View
        className="flex-row"
        entering={withRM(
          FadeInUp.delay(Math.min(index * 80, 300)).duration(motion.dur.md)
        )}
        layout={withRM(LinearTransition.duration(motion.dur.md))}
      >
        {/* Timeline rail + dot */}
        <View
          className="relative"
          style={{ width: TIMELINE_RAIL_WIDTH, minHeight: 120 }}
        >
          <View
            className="absolute left-1/2"
            style={{
              top: 0,
              bottom: 0,
              width: 1,
              marginLeft: -0.5,
              backgroundColor: railColor,
            }}
          />

          {isCurrent && (
            <View
              className="absolute left-1/2 opacity-35"
              style={{
                top: 0,
                bottom: 0,
                width: 2,
                marginLeft: -1,
                backgroundColor: Colors.primaryBright,
              }}
            />
          )}

          <View
            className="absolute left-1/2"
            style={{ top: 24, marginLeft: -8 }}
          >
            <TimelineDot status={task.status} />
          </View>
        </View>

        <View className="flex-1">
          {/* Time label */}
          <Text
            className={cn(
              'mb-2 text-sm font-medium',
              isCurrent
                ? 'font-bold'
                : 'text-text-muted dark:text-text-muted-dark'
            )}
            style={isCurrent ? { color: Colors.primaryBright } : undefined}
          >
            {task.time || task.dueTime}
          </Text>

          {/* Card */}
          {task.status === 'completed' && (
            <Link
              href={{
                pathname: ROUTES.TASK_DETAIL_SCHEDULE_PATHNAME,
                params: { id: task.id, title: task.title },
              }}
            >
              <Link.Trigger>
                <Pressable accessibilityRole="button">
                  <CompletedTaskCard task={task} />
                </Pressable>
              </Link.Trigger>
              <Link.Preview />
            </Link>
          )}

          {task.status === 'current' && (
            <ActiveTaskCard task={task} onComplete={onComplete} />
          )}

          {task.status === 'upcoming' && (
            <Link
              href={{
                pathname: ROUTES.TASK_DETAIL_SCHEDULE_PATHNAME,
                params: { id: task.id, title: task.title },
              }}
            >
              <Link.Trigger>
                <Pressable accessibilityRole="button">
                  <UpcomingTaskCard task={task} />
                </Pressable>
              </Link.Trigger>
              <Link.Preview />
            </Link>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ScheduleScreen(): React.ReactElement {
  const { t } = useTranslation(['schedule', 'common']);
  const colorScheme = useColorScheme() ?? 'light';

  const [today, setToday] = useState(() => new Date());
  const { ensureRollingWindow } = useTaskEngine();
  useFocusEffect(
    useCallback(() => {
      setToday(new Date());
      ensureRollingWindow(14).catch((error: unknown) => {
        console.error('Failed to ensure rolling task window:', error);
      });
    }, [ensureRollingWindow])
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
    const dayTasks = allTasks.filter((task) => task.date === selectedDateStr);
    const sortedDayTasks = [...dayTasks].sort((a, b) => {
      const timeA = parseTimeToMinutes(a.time || a.dueTime || '12:00 AM');
      const timeB = parseTimeToMinutes(b.time || b.dueTime || '12:00 AM');
      if (timeA !== timeB) return timeA - timeB;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
    const firstUncompletedIndex = sortedDayTasks.findIndex(
      (task) => !task.completed
    );
    return sortedDayTasks.map((task, index) => ({
      ...task,
      status: task.completed
        ? 'completed'
        : index === firstUncompletedIndex
          ? 'current'
          : 'upcoming',
    }));
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

  const onWeekSwipeHaptic = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const weekSwipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-16, 16])
        .failOffsetY([-12, 12])
        .onEnd((event) => {
          const absX = Math.abs(event.translationX);
          const absY = Math.abs(event.translationY);

          if (absX < WEEK_SWIPE_THRESHOLD || absY > WEEK_SWIPE_MAX_VERTICAL)
            return;

          if (event.translationX < 0) {
            scheduleOnRN(nextWeek);
            scheduleOnRN(onWeekSwipeHaptic);
            return;
          }

          scheduleOnRN(prevWeek);
          scheduleOnRN(onWeekSwipeHaptic);
        }),
    [nextWeek, onWeekSwipeHaptic, prevWeek]
  );

  const taskCount = tasks.length;
  const isToday = selectedDay === todayIndex && weekOffset === 0;
  const currentLanguage = i18next.language;

  const monthYearLabel = useMemo(
    () =>
      baseDate.toLocaleString(currentLanguage, {
        month: 'long',
        year: 'numeric',
      }),
    [baseDate, currentLanguage]
  );

  const selectedDateLabel = useMemo(
    () =>
      isToday
        ? t('common:today').toLowerCase()
        : weekDates[selectedDay].toLocaleDateString(currentLanguage, {
            weekday: 'long',
          }),
    [isToday, selectedDay, weekDates, t, currentLanguage]
  );

  const handleSelectDay = useCallback((index: number) => {
    setSelectedDay(index);
  }, []);

  const renderTask = useCallback(
    ({ item, index }: { item: TaskWithStatus; index: number }) => (
      <TimelineItemWithHandler
        task={item}
        index={index}
        onComplete={handleComplete}
      />
    ),
    [handleComplete]
  );

  const keyExtractor = useCallback((item: TaskWithStatus) => item.id, []);
  const getTaskItemType = useCallback(() => 'schedule-task', []);

  // Determine which days are "past" relative to selected day
  const todayDateStr = useMemo(() => {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [today]);

  // ─── List Header ─────────────────────────────────────────────────────────

  const listHeader = useMemo(
    () => (
      <>
        <GestureDetector gesture={weekSwipeGesture}>
          <View>
            {/* Week navigation */}
            <View className="mb-3 flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('previousWeek')}
                accessibilityHint={t('a11y.previousWeekHint')}
                className="rounded-full border border-border-light p-2 active:opacity-70 dark:border-dark-border"
                onPress={prevWeek}
              >
                <ChevronLeft
                  size={20}
                  color={
                    colorScheme === 'dark'
                      ? Colors.textSecondaryDark
                      : Colors.textSecondary
                  }
                />
              </Pressable>
              <Text className="text-text-secondary dark:text-text-secondary-dark text-base font-bold">
                {t('weekLabel', { number: weekNumber })}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('nextWeek')}
                accessibilityHint={t('a11y.nextWeekHint')}
                className="rounded-full border border-border-light p-2 active:opacity-70 dark:border-dark-border"
                onPress={nextWeek}
              >
                <ChevronRight
                  size={20}
                  color={
                    colorScheme === 'dark'
                      ? Colors.textSecondaryDark
                      : Colors.textSecondary
                  }
                />
              </Pressable>
            </View>

            {/* Horizontal Calendar Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="py-3"
              contentContainerClassName="px-4"
            >
              <View className="flex-row" style={{ gap: PILL_GAP }}>
                {WEEKDAY_KEYS.map((dayKey, index) => {
                  const dateObj = weekDates[index];
                  const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                  const isPast = dateStr < todayDateStr;

                  return (
                    <DayPill
                      key={`${dayKey}-${index}`}
                      dayKey={dayKey}
                      dayIndex={index}
                      date={dateObj.getDate()}
                      isSelected={selectedDay === index}
                      isPast={isPast}
                      onPress={handleSelectDay}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </GestureDetector>

        {/* Section Header */}
        <View className="mb-8 mt-5 flex-row items-end justify-between gap-3">
          <Text className="text-text dark:text-text-primary-dark flex-1 pr-2 text-[32px] font-black leading-9">
            {isToday
              ? t('todaysSchedule')
              : t('scheduleFor', { day: selectedDateLabel })}
          </Text>
          <Badge
            className="bg-primary-alpha-15 dark:bg-primary-alpha-30 mb-0.5 shrink-0 rounded-lg px-2 py-1"
            textClassName="text-[13px]"
          >
            {t('taskCount', { count: taskCount })}
          </Badge>
        </View>
      </>
    ),
    [
      handleSelectDay,
      isToday,
      nextWeek,
      prevWeek,
      selectedDay,
      selectedDateLabel,
      t,
      taskCount,
      todayDateStr,
      colorScheme,
      weekDates,
      weekSwipeGesture,
      weekNumber,
    ]
  );

  // ─── Empty State ─────────────────────────────────────────────────────────

  const listEmpty = useMemo(
    () => (
      <View className="items-center py-10">
        <View className="mb-4 size-16 items-center justify-center rounded-full bg-border dark:bg-dark-bg-card">
          <Sun size={28} color={Colors.primary} />
        </View>
        <Text className="text-lg font-extrabold text-text dark:text-text-primary-dark">
          {t('noTasksTitle')}
        </Text>
        <Text className="mt-2 text-center text-[15px] text-text-secondary dark:text-text-secondary-dark">
          {t('noTasksSubtitle', { day: selectedDateLabel })}
        </Text>
      </View>
    ),
    [selectedDateLabel, t]
  );

  // ─── Footer ──────────────────────────────────────────────────────────────

  const listFooter = useMemo(
    () =>
      tasks.length > 0 ? (
        <Text className="mt-2.5 text-center text-[13px] text-text-muted dark:text-text-muted-dark">
          {t('endOfSchedule', { day: selectedDateLabel })}
        </Text>
      ) : (
        <View />
      ),
    [selectedDateLabel, t, tasks.length]
  );

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen
        options={{
          title: monthYearLabel,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 30,
            color:
              colorScheme === 'dark' ? Colors.textPrimaryDark : Colors.text,
          },
          ...(process.env.EXPO_OS === 'ios'
            ? {}
            : {
                headerRight: () => (
                  <HeaderAction
                    accessibilityLabel={t('common:today')}
                    accessibilityHint={t('a11y.jumpToTodayHint')}
                    onPress={goToToday}
                  >
                    <Text className="text-sm font-bold text-primary dark:text-primary-bright">
                      {t('common:today')}
                    </Text>
                  </HeaderAction>
                ),
              }),
        }}
      />

      {process.env.EXPO_OS === 'ios' ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            accessibilityLabel={t('common:today')}
            accessibilityHint={t('a11y.jumpToTodayHint')}
            onPress={goToToday}
            variant="plain"
          >
            {t('common:today')}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}

      <FlashList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={keyExtractor}
        getItemType={getTaskItemType}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={SCHEDULE_CONTENT_CONTAINER_STYLE}
        contentInsetAdjustmentBehavior="automatic"
        ItemSeparatorComponent={() => <View style={{ height: 40 }} />}
      />
    </View>
  );
}
