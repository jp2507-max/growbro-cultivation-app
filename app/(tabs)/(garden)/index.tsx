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
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert } from 'react-native';
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
import { usePlants } from '@/src/hooks/use-plants';
import { useTasks } from '@/src/hooks/use-tasks';
import { motion, rmTiming, withRM } from '@/src/lib/animations/motion';
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
    <View className="bg-background dark:bg-dark-bg-card flex-1 items-center gap-1 rounded-2xl py-3.5">
      {icon}
      <Text className="text-textMuted dark:text-text-muted-dark mt-1 text-[10px] font-bold tracking-wide">
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
          'bg-white dark:bg-dark-bg-card rounded-2xl flex-row items-center justify-between mb-2.5 shadow-sm overflow-hidden',
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

        <Pressable
          accessibilityRole="button"
          className="flex-1 flex-row items-center gap-3 py-4 pr-4 pl-2"
          onPress={() => {
            router.push({
              pathname: '/task-detail',
              params: { title: task.title },
            });
          }}
        >
          <View className="flex-1">
            <Text
              className={cn(
                'text-base font-bold text-text dark:text-text-primary-dark',
                task.completed &&
                  'line-through text-textMuted dark:text-text-muted-dark'
              )}
            >
              {task.title}
            </Text>
            <Text className="text-textSecondary dark:text-text-secondary-dark mt-0.5 text-[13px]">
              {task.subtitle}
            </Text>
          </View>
          {task.dueTime && !task.completed && (
            <View className="bg-danger-light dark:bg-error-dark/20 rounded-lg px-2.5 py-1">
              <Text className="text-danger dark:text-error-dark text-[11px] font-bold">
                {task.dueTime}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

function HeaderRight() {
  const { userName, profile } = useAuth();
  const userAvatar = profile?.avatarUrl;
  const displayName = userName || 'User';

  return (
    <View className="flex-row items-center gap-2.5">
      <Link href="/add-plant" asChild>
        <Pressable
          accessibilityRole="button"
          className="bg-primary dark:bg-primary-bright size-[38px] items-center justify-center rounded-full"
          testID="add-plant-btn"
        >
          <Plus size={20} color={Colors.white} />
        </Pressable>
      </Link>
      <Link href="/profile" asChild>
        <Pressable
          accessibilityRole="button"
          className="border-primary dark:border-primary-bright size-[42px] overflow-hidden rounded-full border-2"
          testID="profile-btn"
        >
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              className="size-full rounded-full"
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          ) : (
            <View className="bg-primary dark:bg-primary-bright size-[42px] items-center justify-center rounded-full">
              <Text className="text-lg font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );
}

export default function GardenScreen() {
  const { t } = useTranslation('garden');
  const { plants, isLoading: plantsLoading, error: plantsError } = usePlants();
  const activePlant = plants[0] ?? null;
  const {
    tasks,
    isLoading: tasksLoading,
    toggleTask: toggleTaskDb,
    error: tasksError,
  } = useTasks(activePlant?.id);

  const pendingCount = tasks.filter((t) => !t.completed).length;

  const toggleTask = useCallback(
    async (taskId: string, completed: boolean) => {
      try {
        await toggleTaskDb(taskId, completed);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('errors.failedUpdateTask');
        Alert.alert(t('common:error'), errorMessage);
      }
    },
    [toggleTaskDb, t]
  );

  // Show error alerts for data loading errors
  React.useEffect(() => {
    if (plantsError) {
      Alert.alert(t('errors.loadingPlants'), plantsError.message);
    }
  }, [plantsError, t]);

  React.useEffect(() => {
    if (tasksError) {
      Alert.alert(t('errors.loadingTasks'), tasksError.message);
    }
  }, [tasksError, t]);

  if (plantsLoading || tasksLoading) {
    return (
      <View className="bg-background dark:bg-dark-bg flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {activePlant ? (
          <View className="dark:bg-dark-bg-elevated mb-6 items-center rounded-3xl bg-white p-6 shadow-md">
            <View className="mb-3">
              <View className="border-primary bg-border dark:border-primary-bright dark:bg-dark-bg-card size-[180px] rounded-full border-4 p-1.5">
                {activePlant.imageUrl ? (
                  <Image
                    source={{ uri: activePlant.imageUrl }}
                    style={{ width: '100%', height: '100%', borderRadius: 84 }}
                    contentFit="cover"
                    transition={200}
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
            <Text className="text-textSecondary dark:text-text-secondary-dark mb-5 mt-1 text-[15px]">
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
            <Text className="text-textSecondary dark:text-text-secondary-dark mt-2 text-center text-[15px]">
              {t('noPlantsSubtitle')}
            </Text>
            <Link href="/add-plant" asChild>
              <Pressable
                accessibilityRole="button"
                className="bg-primary dark:bg-primary-bright mt-5 rounded-2xl px-8 py-3 active:opacity-80"
              >
                <Text className="dark:text-dark-bg text-[15px] font-bold text-white">
                  {t('addPlant')}
                </Text>
              </Pressable>
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

        {tasks.length === 0 && (
          <Text className="text-textMuted dark:text-text-muted-dark py-6 text-center text-[15px]">
            {t('noTasks')}
          </Text>
        )}

        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            index={index}
            onToggle={toggleTask}
          />
        ))}

        {activePlant && activePlant.day >= HARVEST_MIN_DAY && (
          <Link
            href={{
              pathname: '/harvest',
              params: { plantName: activePlant.name },
            }}
            asChild
          >
            <Pressable
              accessibilityRole="button"
              className="bg-warning dark:bg-warning-dark mt-2.5 flex-row items-center justify-center gap-2.5 rounded-2xl py-4 shadow-md active:opacity-80"
              testID="harvest-btn"
            >
              <Scissors size={20} color={Colors.white} />
              <Text className="text-[17px] font-bold text-white">
                {t('harvestPlant')}
              </Text>
            </Pressable>
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
          <ListTodo size={20} color={Colors.white} />
          <Text className="text-[17px] font-bold text-white">
            {t('logActivity')}
          </Text>
        </Pressable>

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}
