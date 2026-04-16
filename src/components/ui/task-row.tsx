import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { CheckCircle, Circle } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { motion, rmTiming, withRM } from '@/src/lib/animations/motion';
import { type Task } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import { parseHourMinute } from '@/src/lib/task-engine/date-utils';
import { cn } from '@/src/lib/utils';
import { Link, Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

// Derives accent color for task card left stripe. Prefers task.type; falls back to title keywords for legacy/manual tasks.
export function getTaskAccentColor(
  task: { type?: string; title: string },
  isDark: boolean
): string {
  const type = task.type?.toLowerCase();
  const t = task.title.toLowerCase();

  if (type === 'water' || t.includes('gieß') || t.includes('water'))
    return isDark ? Colors.accentSky : Colors.indoorAccent;
  if (
    type === 'environment-check' ||
    type === 'ph-check' ||
    t.includes('umgebung') ||
    t.includes('environment') ||
    t.includes('prüf')
  )
    return isDark ? Colors.accentAmber : Colors.intermediateAccent;
  if (
    type === 'feed' ||
    t.includes('nährstoff') ||
    t.includes('nutrient') ||
    t.includes('feed')
  )
    return isDark ? Colors.primaryBright : Colors.primary;
  if (
    type === 'health-check-reminder' ||
    type === 'health-warning' ||
    t.includes('foto') ||
    t.includes('photo') ||
    t.includes('log')
  )
    return isDark ? Colors.accentRose : Colors.liked;
  return isDark ? Colors.primaryBright : Colors.primary;
}

export function formatTaskTime(time: string, language: string): string {
  const locale = language.toLowerCase();
  const parsed = parseHourMinute(time);

  if (!parsed) {
    if (locale.startsWith('de') && !/uhr$/i.test(time.trim())) {
      return `${time} Uhr`;
    }
    return time;
  }

  const date = new Date(Date.UTC(2000, 0, 1, parsed.hour, parsed.minute));

  if (locale.startsWith('de')) {
    const formatted = new Intl.DateTimeFormat('de-DE', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(date);
    return `${formatted} Uhr`;
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(date);
}

type TaskRowProps = {
  task: Task;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
  isDark: boolean;
};

export function TaskRow({
  task,
  index,
  onToggle,
  isDark,
}: TaskRowProps): React.ReactElement {
  const { t, i18n } = useTranslation('garden');
  const { t: tCommon } = useTranslation('common');
  const scale = useSharedValue(1);
  const formattedTime = useMemo(
    () =>
      task.time
        ? formatTaskTime(task.time, i18n.resolvedLanguage ?? i18n.language)
        : '',
    [task.time, i18n.language, i18n.resolvedLanguage]
  );

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const accentColor = useMemo(
    () => getTaskAccentColor(task, isDark),
    [task, isDark]
  );

  const handlePress = useCallback(() => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.set(
      withSequence(
        withTiming(0.96, rmTiming(motion.dur.xs)),
        withTiming(1, rmTiming(motion.dur.xs))
      )
    );
    onToggle(task.id, task.completed);
  }, [task.id, task.completed, onToggle, scale]);

  return (
    <Animated.View
      entering={withRM(
        FadeInUp.delay(Math.min(index * 60, 300)).duration(motion.dur.md)
      )}
      layout={withRM(LinearTransition.duration(motion.dur.md))}
      className="mx-4 mb-3"
    >
      <Animated.View
        style={scaleStyle}
        className={cn(
          'overflow-hidden rounded-2xl border',
          task.completed
            ? 'border-transparent bg-border-light/60 opacity-70 dark:bg-dark-bg-card'
            : 'bg-card dark:bg-dark-bg-card border-border-light shadow-sm dark:border-dark-border'
        )}
        testID={`task-${task.id}`}
      >
        <View className="flex-row items-center px-4 py-4">
          {!task.completed && (
            <View
              className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
            accessibilityLabel={t(
              task.completed
                ? 'taskToggleLabelIncomplete'
                : 'taskToggleLabelComplete',
              { title: task.title }
            )}
            accessibilityHint={tCommon('a11y.toggleHint')}
            onPress={handlePress}
            className="mr-3.5 items-center justify-center"
            hitSlop={8}
            testID={`toggle-${task.id}`}
          >
            {task.completed ? (
              <CheckCircle size={26} color={Colors.primary} />
            ) : (
              <Circle size={26} color={Colors.textMuted} />
            )}
          </Pressable>

          <Link
            href={{
              pathname: ROUTES.TASK_DETAIL_GARDEN_PATHNAME,
              params: { id: task.id },
            }}
          >
            <Link.Trigger>
              <Pressable
                accessibilityRole="button"
                className="flex-1 flex-row items-center gap-2.5"
              >
                <View className="flex-1">
                  <Text
                    className={cn(
                      'text-text dark:text-text-primary-dark text-base font-bold',
                      task.completed &&
                        'line-through text-text-muted dark:text-text-muted-dark'
                    )}
                  >
                    {task.title}
                  </Text>
                  <Text className="text-text-secondary dark:text-text-secondary-dark mt-0.5 text-sm">
                    {task.subtitle}
                  </Text>
                </View>
                {!task.completed && task.time ? (
                  <View className="bg-danger-light dark:bg-error-dark/20 ml-2 shrink-0 self-start rounded-lg px-2.5 py-1">
                    <Text className="text-danger dark:text-error-dark min-w-14.5 text-center text-[11px] font-bold">
                      {formattedTime}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            </Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction
                title={t('openTask')}
                icon="arrow.up.right"
                onPress={() =>
                  router.push({
                    pathname: ROUTES.TASK_DETAIL_GARDEN_PATHNAME,
                    params: { id: task.id },
                  })
                }
              />
            </Link.Menu>
          </Link>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
