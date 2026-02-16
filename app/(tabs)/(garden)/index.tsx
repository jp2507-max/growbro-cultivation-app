import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import Stack from 'expo-router/stack';
import {
  CheckCircle,
  Circle,
  Droplets,
  FlaskConical,
  Leaf,
  ListTodo,
  Plus,
  Scissors,
  Thermometer,
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

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useThemeColor } from '@/src/components/ui/use-theme-color';
import { usePlants } from '@/src/hooks/use-plants';
import { useTasks } from '@/src/hooks/use-tasks';
import { motion, rmTiming, withRM } from '@/src/lib/animations/motion';
import { type Plant } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

const HARVEST_MIN_DAY = 56;

type Task = {
  id: string;
  title: string;
  subtitle?: string;
  dueTime?: string;
  completed: boolean;
};

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
    <View className="bg-card dark:bg-dark-bg-card flex-1 items-center gap-1 rounded-2xl py-3.5">
      {icon}
      <Text className="text-text-muted dark:text-text-muted-dark mt-1 text-[10px] font-bold tracking-wide">
        {label}
      </Text>
      <Text
        className="text-text dark:text-text-primary-dark text-lg font-extrabold"
        style={{ fontVariant: ['tabular-nums'] }}
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
        withTiming(0.95, rmTiming(motion.dur.xs)),
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
          'bg-card dark:bg-dark-bg-card rounded-2xl flex-row items-center justify-between mb-2.5 shadow-sm overflow-hidden',
          task.completed && 'opacity-60'
        )}
        testID={`task-${task.id}`}
      >
        <Pressable
          accessibilityRole="button"
          onPress={handlePress}
          className="pl-4 py-4 pr-2 justify-center"
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
              className="flex-1 flex-row items-center gap-3 py-4 pr-4 pl-2"
            >
              <View className="flex-1">
                <Text
                  className={cn(
                    'text-base font-bold text-text dark:text-text-primary-dark',
                    task.completed &&
                      'line-through text-text-muted dark:text-text-muted-dark'
                  )}
                >
                  {task.title}
                </Text>
                <Text className="text-text-secondary dark:text-text-secondary-dark mt-0.5 text-[13px]">
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

function HeaderRight() {
  const { t } = useTranslation('garden');
  const onPrimaryColor = useThemeColor('onPrimary');
  const { userName, profile } = useAuth();
  const userAvatar = profile?.avatarUrl;
  const displayName = userName || t('unknownUser');
  const [hasAvatarError, setHasAvatarError] = useState(false);

  React.useEffect(() => {
    setHasAvatarError(false);
  }, [userAvatar]);

  return (
    <View className="flex-row items-center gap-2.5">
      <Link href={ROUTES.ADD_PLANT}>
        <Link.Trigger>
          <Pressable
            accessibilityRole="button"
            className="bg-primary dark:bg-primary-bright size-9.5 items-center justify-center rounded-full"
            testID="add-plant-btn"
          >
            <Plus size={20} color={Colors.white} />
          </Pressable>
        </Link.Trigger>
        <Link.Preview />
        <Link.Menu>
          <Link.MenuAction
            title={t('addPlant')}
            icon="plus"
            onPress={() => router.push(ROUTES.ADD_PLANT)}
          />
        </Link.Menu>
      </Link>

      <Link href={ROUTES.PROFILE}>
        <Link.Trigger>
          <Pressable
            accessibilityRole="button"
            className="border-primary dark:border-primary-bright size-10.5 overflow-hidden rounded-full border-2"
            testID="profile-btn"
          >
            {userAvatar && !hasAvatarError ? (
              <Image
                source={{ uri: userAvatar }}
                className="size-full rounded-full"
                transition={200}
                onError={() => setHasAvatarError(true)}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />
            ) : (
              <View className="bg-primary dark:bg-primary-bright size-10.5 items-center justify-center rounded-full">
                <Text
                  className="text-lg font-bold"
                  style={{ color: onPrimaryColor }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
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
  );
}

function GardenLoadingSkeleton(): React.ReactElement {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
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
  const onPrimaryColor = useThemeColor('onPrimary');

  return (
    <>
      {activePlant ? (
        <View className="dark:bg-dark-bg-elevated mb-6 items-center rounded-3xl bg-white p-6 shadow-md">
          <View className="mb-3">
            <View className="border-primary bg-border dark:border-primary-bright dark:bg-dark-bg-card size-45 rounded-full border-4 p-1.5">
              {activePlant.imageUrl && !hasPlantImageError ? (
                <Image
                  source={{ uri: activePlant.imageUrl }}
                  style={{ width: '100%', height: '100%', borderRadius: 84 }}
                  contentFit="cover"
                  transition={200}
                  onError={() => setHasPlantImageError(true)}
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                  priority="high"
                />
              ) : (
                <View className="bg-border dark:bg-dark-bg-card flex-1 items-center justify-center rounded-full">
                  <Leaf size={60} color={Colors.primary} />
                </View>
              )}
            </View>
          </View>
          <View className="bg-border dark:bg-dark-bg-card mb-2.5 rounded-full px-3.5 py-1.5">
            <Text className="text-primary dark:text-primary-bright text-[13px] font-bold">
              {t('readyPercent', { percent: activePlant.readyPercent })}
            </Text>
          </View>
          <Text
            className="text-text dark:text-text-primary-dark text-[32px] font-black"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {t('dayCount', { day: activePlant.day })}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark mb-5 mt-1 text-[15px]">
            {t('phaseInfo', {
              phase: activePlant.phase,
              weeksLeft: activePlant.weeksLeft,
            })}
          </Text>

          <View className="w-full flex-row gap-2.5">
            <MetricCard
              icon={<Thermometer size={18} color="#FF7043" />}
              label={t('metrics.temp')}
              value={activePlant.temp?.toString() ?? '--'}
            />
            <MetricCard
              icon={<Droplets size={18} color={Colors.primaryLight} />}
              label={t('metrics.humidity')}
              value={activePlant.humidity?.toString() ?? '--'}
            />
            <MetricCard
              icon={<FlaskConical size={18} color="#AB47BC" />}
              label={t('metrics.ph')}
              value={activePlant.ph?.toString() ?? '--'}
            />
          </View>
        </View>
      ) : (
        <View className="dark:bg-dark-bg-elevated mb-6 items-center rounded-3xl bg-white p-8 shadow-md">
          <View className="bg-border dark:bg-dark-bg-card mb-4 size-20 items-center justify-center rounded-full">
            <Leaf size={40} color={Colors.primary} />
          </View>
          <Text className="text-text dark:text-text-primary-dark text-xl font-extrabold">
            {t('noPlantsTitle')}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark mt-2 text-center text-[15px]">
            {t('noPlantsSubtitle')}
          </Text>
          <Link href={ROUTES.ADD_PLANT}>
            <Link.Trigger>
              <Pressable
                accessibilityRole="button"
                className="bg-primary dark:bg-primary-bright mt-5 rounded-2xl px-8 py-3 active:opacity-80"
              >
                <Text
                  className="text-[15px] font-bold"
                  style={{ color: onPrimaryColor }}
                >
                  {t('addPlant')}
                </Text>
              </Pressable>
            </Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction
                title={t('addPlant')}
                icon="plus"
                onPress={() => router.push(ROUTES.ADD_PLANT)}
              />
            </Link.Menu>
          </Link>
        </View>
      )}

      <View className="mb-3.5 flex-row items-center justify-between">
        <Text className="text-text dark:text-text-primary-dark text-xl font-extrabold">
          {t('todaysTasks')}
        </Text>
        <View className="bg-border dark:bg-dark-bg-card rounded-xl px-2.5 py-1">
          <Text className="text-primary dark:text-primary-bright text-xs font-bold">
            {t('pendingCount', { count: pendingCount })}
          </Text>
        </View>
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
      <>
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
          className="bg-primary dark:bg-primary-bright mt-2.5 flex-row items-center justify-center gap-2.5 rounded-2xl py-4 shadow-md active:opacity-80"
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

        <View className="h-5" />
      </>
    ),
    [activePlant, onPrimaryColor, tGarden]
  );

  if (plantsLoading || tasksLoading) {
    return (
      <View className="bg-background dark:bg-dark-bg flex-1">
        <Stack.Screen
          options={{
            headerRight: () => <HeaderRight />,
          }}
        />
        <GardenLoadingSkeleton />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <Stack.Screen
        options={{
          headerRight: () => <HeaderRight />,
        }}
      />
      <FlashList
        data={tasks}
        renderItem={renderTaskRow}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
