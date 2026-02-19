import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import {
  CheckCircle,
  Circle,
  Leaf,
  ListTodo,
  Plus,
  Scissors,
  Settings,
  Sprout,
  Waves,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import {
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import Colors from '@/constants/colors';
import { Badge } from '@/src/components/ui/badge';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useThemeColor } from '@/src/components/ui/use-theme-color';
import { usePlants } from '@/src/hooks/use-plants';
import { useTasks } from '@/src/hooks/use-tasks';
import { motion, rmTiming, withRM } from '@/src/lib/animations/motion';
import { type Plant, type Task } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

const LIST_CONTENT_STYLE = {
  paddingBottom: 40,
} as const;

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const HARVEST_MIN_DAY = 56;

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="bg-card dark:bg-dark-bg-card flex-1 items-center gap-1 rounded-2xl border border-border-light px-2 py-3 shadow-sm dark:border-dark-border">
      {icon}
      <Text className="text-text-muted dark:text-text-muted-dark mt-1 text-[10px] font-semibold tracking-wide">
        {label}
      </Text>
      <Text
        className="text-text dark:text-text-primary-dark text-center text-lg font-bold"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function TaskRow({
  task,
  index,
  onToggle,
}: {
  task: Task;
  index: number;
  onToggle: (id: string, completed: boolean) => void;
}) {
  const { t } = useTranslation('garden');
  const scale = useSharedValue(1);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

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
      style={scaleStyle}
      entering={withRM(FadeInUp.delay(index * 60).duration(motion.dur.md))}
      layout={withRM(LinearTransition.duration(motion.dur.md))}
    >
      <View
        className={cn(
          'mx-4 mb-3 flex-row items-center rounded-2xl border px-4 py-4',
          task.completed
            ? 'border-transparent bg-border-light/60 opacity-70 dark:bg-dark-bg-card'
            : 'bg-card dark:bg-dark-bg-card border-border-light shadow-sm dark:border-dark-border'
        )}
        testID={`task-${task.id}`}
      >
        <Pressable
          accessibilityRole="button"
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
              {!task.completed && task.dueTime ? (
                <View className="bg-danger-light dark:bg-error-dark/20 rounded-lg px-2.5 py-1">
                  <Text className="text-danger dark:text-error-dark text-[11px] font-bold">
                    {task.dueTime}
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
  );
}

function GardenLoadingSkeleton(): React.ReactElement {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={LIST_CONTENT_STYLE}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="dark:bg-dark-bg-elevated mb-6 rounded-3xl bg-white p-6 shadow-md">
        <View className="items-center">
          <Skeleton className="mb-4 size-45 rounded-full" />
          <Skeleton className="mb-3 h-7 w-32 rounded-full" />
          <Skeleton className="mb-2 h-10 w-24 rounded-lg" />
          <Skeleton className="mb-5 h-4 w-44 rounded-md" />
        </View>

        <View className="flex-row gap-2.5">
          <Skeleton className="h-24 flex-1 rounded-2xl" />
          <Skeleton className="h-24 flex-1 rounded-2xl" />
          <Skeleton className="h-24 flex-1 rounded-2xl" />
        </View>
      </View>

      <View className="mb-3.5 flex-row items-center justify-between">
        <Skeleton className="h-7 w-36 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-xl" />
      </View>

      <View className="gap-2.5">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            key={`garden-task-skeleton-${index}`}
            className="h-20 rounded-2xl"
          />
        ))}
      </View>

      <Skeleton className="mt-3 h-14 rounded-2xl" />
      <Skeleton className="mt-2.5 h-14 rounded-2xl" />
      <View className="h-5" />
    </ScrollView>
  );
}

function GardenListHeader({
  activePlant,
  hasPlantImageError,
  setHasPlantImageError,
  pendingCount,
}: {
  activePlant: Plant | null;
  hasPlantImageError: boolean;
  setHasPlantImageError: (value: boolean) => void;
  pendingCount: number;
}) {
  const { t } = useTranslation('garden');
  const ringProgress = activePlant?.readyPercent ?? 0;
  const ringOffset =
    RING_CIRCUMFERENCE * (1 - Math.min(ringProgress, 100) / 100);
  const phaseInfo = activePlant
    ? t('phaseInfo', {
        phase: activePlant.phase,
        weeksLeft: activePlant.weeksLeft,
      })
    : t('noPlantsSubtitle');

  return (
    <>
      <View className="rounded-b-[40px] bg-background px-4 pb-12 pt-3 dark:bg-dark-bg-elevated">
        <View className="mb-2.5 flex-row items-start justify-between">
          <View>
            <Text className="text-primary dark:text-primary-bright text-xs font-semibold tracking-wide uppercase">
              {activePlant?.environment ?? t('title')}
            </Text>
            <Text className="text-text dark:text-text-primary-dark text-4xl font-black leading-10">
              {activePlant?.name ?? t('noPlantsTitle')}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              className="size-10 items-center justify-center rounded-full bg-white/70 dark:bg-black/30"
              testID="add-plant-btn"
              onPress={() => router.push(ROUTES.ADD_PLANT)}
            >
              <Plus size={20} color={Colors.primary} />
            </Pressable>

            <Link href={ROUTES.PROFILE}>
              <Link.Trigger>
                <Pressable
                  accessibilityRole="button"
                  className="size-10 items-center justify-center rounded-full bg-white/70 dark:bg-black/30"
                  testID="profile-btn"
                >
                  <Settings size={20} color={Colors.text} />
                </Pressable>
              </Link.Trigger>
              <Link.Preview />
              <Link.Menu>
                <Link.MenuAction
                  title={t('openProfile')}
                  icon="person.circle"
                  onPress={() => router.push(ROUTES.PROFILE)}
                />
              </Link.Menu>
            </Link>
          </View>
        </View>

        <View className="items-center px-2">
          <View className="relative size-64 items-center justify-center">
            <Svg
              viewBox="0 0 120 120"
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            >
              <SvgCircle
                cx={60}
                cy={60}
                r={RING_RADIUS}
                fill="transparent"
                stroke={Colors.border}
                strokeWidth={6}
              />
              <SvgCircle
                cx={60}
                cy={60}
                r={RING_RADIUS}
                fill="transparent"
                stroke={Colors.primary}
                strokeLinecap="round"
                strokeWidth={6}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                originX={60}
                originY={60}
                rotation={-90}
              />
            </Svg>

            <View className="absolute inset-4 overflow-hidden rounded-full border-4 border-white bg-white shadow-inner dark:border-dark-border dark:bg-dark-bg-card">
              {activePlant?.imageUrl && !hasPlantImageError ? (
                <Image
                  source={{ uri: activePlant.imageUrl }}
                  className="size-full rounded-full"
                  contentFit="cover"
                  transition={200}
                  onError={() => setHasPlantImageError(true)}
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                  priority="high"
                />
              ) : (
                <View className="bg-border dark:bg-dark-bg-card size-full items-center justify-center rounded-full">
                  <Leaf size={62} color={Colors.primary} />
                </View>
              )}
            </View>

            <View className="border-border dark:border-dark-border bg-card dark:bg-dark-bg-card absolute -bottom-2 rounded-full border px-4 py-1 shadow-sm">
              <Text className="text-primary dark:text-primary-bright text-xs font-bold">
                {t('readyPercent', { percent: ringProgress })}
              </Text>
            </View>
          </View>

          <Text
            className="text-text dark:text-text-primary-dark mt-4 text-[48px] font-black leading-[54px]"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {activePlant ? t('dayCount', { day: activePlant.day }) : '--'}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark text-center text-lg">
            {phaseInfo}
          </Text>
        </View>
      </View>

      <View className="-mt-7 px-4">
        <View className="flex-row gap-3">
          <MetricCard
            icon={<Sprout size={18} color={Colors.primary} />}
            label={t('metrics.strainType')}
            value={activePlant?.strainType?.toString() ?? '--'}
          />
          <MetricCard
            icon={<Waves size={18} color={Colors.primaryLight} />}
            label={t('metrics.environment')}
            value={activePlant?.environment?.toString() ?? '--'}
          />
          <MetricCard
            icon={<ListTodo size={18} color={Colors.phPurple} />}
            label={t('metrics.pending')}
            value={activePlant ? pendingCount.toString() : '--'}
          />
        </View>
      </View>

      <View className="mb-3 mt-7 flex-row items-end justify-between gap-3 px-4">
        <Text className="text-text dark:text-text-primary-dark flex-1 pr-2 text-[32px] font-black leading-9">
          {t('todaysTasks')}
        </Text>
        <Badge
          className="bg-primary-alpha-15 dark:bg-primary-alpha-30 mb-0.5 shrink-0 rounded-lg px-2 py-1"
          textClassName="text-[13px]"
        >
          {t('pendingCount', { count: pendingCount })}
        </Badge>
      </View>
    </>
  );
}

export default function GardenScreen() {
  const { t: tGarden } = useTranslation('garden');
  const { t: tCommon } = useTranslation('common');
  const onPrimaryColor = useThemeColor('onPrimary');
  const { plants, isLoading: plantsLoading, error: plantsError } = usePlants();
  const activePlant = plants[0] ?? null;
  const [hasPlantImageError, setHasPlantImageError] = useState(false);
  const {
    tasks,
    isLoading: tasksLoading,
    toggleTask: toggleTaskDb,
    error: tasksError,
  } = useTasks(activePlant?.id);

  const pendingCount = tasks.filter((task) => !task.completed).length;

  React.useEffect(() => {
    setHasPlantImageError(false);
  }, [activePlant?.id, activePlant?.imageUrl]);

  const toggleTask = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        await toggleTaskDb(taskId, completed);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : tGarden('errors.failedUpdateTask');
        Alert.alert(tCommon('error'), errorMessage);
      }
    },
    [toggleTaskDb, tGarden, tCommon]
  );

  // Show error alerts for data loading errors
  React.useEffect(() => {
    if (plantsError) {
      Alert.alert(tGarden('errors.loadingPlants'), plantsError.message);
    }
  }, [plantsError, tGarden]);

  React.useEffect(() => {
    if (tasksError) {
      Alert.alert(tGarden('errors.loadingTasks'), tasksError.message);
    }
  }, [tasksError, tGarden]);

  const renderTaskRow = useCallback(
    ({ item, index }: { item: Task; index: number }) => (
      <TaskRow task={item} index={index} onToggle={toggleTask} />
    ),
    [toggleTask]
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);
  const getTaskItemType = useCallback(() => 'garden-task', []);

  const listHeader = useMemo(
    () => (
      <GardenListHeader
        activePlant={activePlant}
        hasPlantImageError={hasPlantImageError}
        setHasPlantImageError={setHasPlantImageError}
        pendingCount={pendingCount}
      />
    ),
    [activePlant, hasPlantImageError, setHasPlantImageError, pendingCount]
  );

  const listEmpty = useMemo(
    () => (
      <Text className="text-text-muted dark:text-text-muted-dark py-6 text-center text-[15px]">
        {tGarden('noTasks')}
      </Text>
    ),
    [tGarden]
  );

  const listFooter = useMemo(
    () => (
      <View className="px-4 pb-3">
        {activePlant && activePlant.day >= HARVEST_MIN_DAY && (
          <Link
            href={{
              pathname: ROUTES.HARVEST,
              params: { plantName: activePlant.name },
            }}
          >
            <Link.Trigger>
              <Pressable
                accessibilityRole="button"
                className="bg-warning dark:bg-warning-dark mt-2.5 flex-row items-center justify-center gap-2.5 rounded-2xl py-4 shadow-md active:opacity-80"
                testID="harvest-btn"
              >
                <Scissors size={20} color={Colors.white} />
                <Text
                  className="text-[17px] font-bold"
                  style={{ color: Colors.white }}
                >
                  {tGarden('harvestPlant')}
                </Text>
              </Pressable>
            </Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction
                title={tGarden('harvestPlant')}
                icon="scissors"
                onPress={() =>
                  router.push({
                    pathname: ROUTES.HARVEST,
                    params: { plantName: activePlant.name },
                  })
                }
              />
            </Link.Menu>
          </Link>
        )}

        <Pressable
          accessibilityRole="button"
          className="bg-primary dark:bg-primary-bright mt-4 flex-row items-center justify-center gap-2.5 rounded-2xl py-4 shadow-lg shadow-primary-alpha-30 active:opacity-80"
          testID="log-activity-btn"
          onPress={() => {
            // TODO: Implement log activity
          }}
        >
          <ListTodo size={20} color={onPrimaryColor} />
          <Text
            className="text-[17px] font-bold"
            style={{ color: onPrimaryColor }}
          >
            {tGarden('logActivity')}
          </Text>
        </Pressable>
      </View>
    ),
    [activePlant, onPrimaryColor, tGarden]
  );

  if (plantsLoading || tasksLoading) {
    return (
      <View className="flex-1 bg-border-light dark:bg-dark-bg">
        <GardenLoadingSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-border-light dark:bg-dark-bg">
      <FlashList
        data={tasks}
        renderItem={renderTaskRow}
        keyExtractor={keyExtractor}
        getItemType={getTaskItemType}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={LIST_CONTENT_STYLE}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
