import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import Stack from 'expo-router/stack';
import {
  CheckCircle,
  Circle,
  Droplets,
  FlaskConical,
  ListTodo,
  Plus,
  Scissors,
  Thermometer,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { plantData, type Task, todayTasks } from '@/mocks/garden';
import { motion, rmTiming, withRM } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';

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
    <View className="flex-1 items-center gap-1 rounded-2xl bg-background py-3.5 dark:bg-dark-bg-card">
      {icon}
      <Text className="mt-1 text-[10px] font-bold tracking-wide text-textMuted dark:text-text-muted-dark">
        {label}
      </Text>
      <Text
        className="text-lg font-extrabold text-text dark:text-text-primary-dark"
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
  onToggle: (id: string) => void;
}) {
  const scale = useSharedValue(1);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
    onToggle(task.id);
  }, [task.id, onToggle, scale]);

  return (
    <Animated.View
      style={scaleStyle}
      entering={withRM(FadeInUp.delay(index * 60).duration(motion.dur.md))}
      layout={withRM(LinearTransition.duration(motion.dur.md))}
    >
      <Pressable
        accessibilityRole="button"
        className={cn(
          'bg-white dark:bg-dark-bg-card rounded-2xl p-4 flex-row items-center justify-between mb-2.5 shadow-sm',
          task.completed && 'opacity-60'
        )}
        onPress={() => {
          router.push({
            pathname: '/task-detail',
            params: { title: task.title },
          });
        }}
        testID={`task-${task.id}`}
      >
        <View className="flex-1 flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={handlePress}
            hitSlop={8}
            testID={`toggle-${task.id}`}
          >
            {task.completed ? (
              <CheckCircle size={26} color={Colors.primary} />
            ) : (
              <Circle size={26} color={Colors.textMuted} />
            )}
          </Pressable>
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
            <Text className="mt-0.5 text-[13px] text-textSecondary dark:text-text-secondary-dark">
              {task.subtitle}
            </Text>
          </View>
        </View>
        {task.dueTime && !task.completed && (
          <View className="rounded-lg bg-redLight px-2.5 py-1 dark:bg-error-dark/20">
            <Text className="text-[11px] font-bold text-red dark:text-error-dark">
              {task.dueTime}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function HeaderRight() {
  return (
    <View className="flex-row items-center gap-2.5">
      <Link href="/add-plant" asChild>
        <Pressable
          accessibilityRole="button"
          className="size-[38px] items-center justify-center rounded-full bg-primary dark:bg-primary-bright"
          testID="add-plant-btn"
        >
          <Plus size={20} color={Colors.white} />
        </Pressable>
      </Link>
      <Link href="/profile" asChild>
        <Pressable
          accessibilityRole="button"
          className="size-[42px] overflow-hidden rounded-full border-2 border-primary dark:border-primary-bright"
          testID="profile-btn"
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
            }}
            style={{ width: '100%', height: '100%', borderRadius: 21 }}
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        </Pressable>
      </Link>
    </View>
  );
}

export default function GardenScreen() {
  const [tasks, setTasks] = useState<Task[]>(todayTasks);
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
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
        <View className="mb-6 items-center rounded-3xl bg-white p-6 shadow-md dark:bg-dark-bg-elevated">
          <View className="mb-3">
            <View className="size-[180px] rounded-full border-4 border-primary bg-border p-1.5 dark:border-primary-bright dark:bg-dark-bg-card">
              <Image
                source={{ uri: plantData.imageUrl }}
                style={{ width: '100%', height: '100%', borderRadius: 84 }}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                priority="high"
              />
            </View>
          </View>
          <View className="mb-2.5 rounded-full bg-border px-3.5 py-1.5 dark:bg-dark-bg-card">
            <Text className="text-[13px] font-bold text-primary dark:text-primary-bright">
              {plantData.readyPercent}% Ready
            </Text>
          </View>
          <Text
            className="text-[32px] font-black text-text dark:text-text-primary-dark"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            Day {plantData.day}
          </Text>
          <Text className="mb-5 mt-1 text-[15px] text-textSecondary dark:text-text-secondary-dark">
            {plantData.phase} • {plantData.weeksLeft} weeks left
          </Text>

          <View className="w-full flex-row gap-2.5">
            <MetricCard
              icon={<Thermometer size={18} color="#FF7043" />}
              label="TEMP"
              value={plantData.temp}
            />
            <MetricCard
              icon={<Droplets size={18} color={Colors.primaryLight} />}
              label="HUMIDITY"
              value={plantData.humidity}
            />
            <MetricCard
              icon={<FlaskConical size={18} color="#AB47BC" />}
              label="PH"
              value={plantData.ph}
            />
          </View>
        </View>

        <View className="mb-3.5 flex-row items-center justify-between">
          <Text className="text-xl font-extrabold text-text dark:text-text-primary-dark">
            {"Today's Tasks"}
          </Text>
          <View className="rounded-xl bg-border px-2.5 py-1 dark:bg-dark-bg-card">
            <Text className="text-xs font-bold text-primary dark:text-primary-bright">
              {pendingCount} Pending
            </Text>
          </View>
        </View>

        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            index={index}
            onToggle={toggleTask}
          />
        ))}

        {plantData.day >= 56 && (
          <Link href="/harvest" asChild>
            <Pressable
              accessibilityRole="button"
              className="mt-2.5 flex-row items-center justify-center gap-2.5 rounded-2xl bg-amber py-4 shadow-md active:opacity-80 dark:bg-warning-dark"
              testID="harvest-btn"
            >
              <Scissors size={20} color={Colors.white} />
              <Text className="text-[17px] font-bold text-white">
                Harvest Plant
              </Text>
            </Pressable>
          </Link>
        )}

        <Pressable
          accessibilityRole="button"
          className="mt-2.5 flex-row items-center justify-center gap-2.5 rounded-2xl bg-primary py-4 shadow-md active:opacity-80 dark:bg-primary-bright"
          testID="log-activity-btn"
        >
          <ListTodo size={20} color={Colors.white} />
          <Text className="text-[17px] font-bold text-white">Log Activity</Text>
        </Pressable>

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}
