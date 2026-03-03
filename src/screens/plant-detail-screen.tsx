import * as Sentry from '@sentry/react-native';
import {
  type Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { MoreVertical } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import {
  BottomActionBar,
  CareSchedule,
  EnvironmentGrid,
  HeroCard,
  LatestNote,
  SetupPills,
  TaskList,
} from '@/src/components/plant-detail';
import { HeaderAction } from '@/src/components/ui/header-action';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import {
  GARDEN_PENDING_ACTION_STORAGE_KEY,
  GARDEN_PENDING_ACTIONS,
  SELECTED_PLANT_STORAGE_KEY,
} from '@/src/constants/garden';
import { useNotes } from '@/src/hooks/use-notes';
import { usePlants } from '@/src/hooks/use-plants';
import { useTaskEngine } from '@/src/hooks/use-task-engine';
import { useTasks } from '@/src/hooks/use-tasks';
import { ROUTES } from '@/src/lib/routes';
import { storage } from '@/src/lib/storage';
import { Pressable, ScrollView, Text, View } from '@/src/tw';

const CTA_TAB_BAR_SAFE_OFFSET = 56;

function toRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function PlantDetailScreen(): React.ReactElement {
  const { t } = useTranslation('garden');
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const plantId = toRouteParam(id);

  const { plants, isLoading: plantsLoading } = usePlants();
  const plant = useMemo(
    () => plants.find((item) => item.id === plantId) ?? null,
    [plants, plantId]
  );
  const { tasks, isLoading: tasksLoading, toggleTask } = useTasks(plant?.id);
  const { ensureRollingWindow } = useTaskEngine(plantId);
  const { notes } = useNotes(plantId);
  const latestNote = notes.length > 0 ? notes[0] : null;

  const handleToggleTask = useCallback(
    (taskId: string, completed: boolean) => {
      toggleTask(taskId, completed);
    },
    [toggleTask]
  );

  const handleAddPhoto = useCallback(() => {
    if (!plant) return;

    storage.set(SELECTED_PLANT_STORAGE_KEY, plant.id);
    storage.set(
      GARDEN_PENDING_ACTION_STORAGE_KEY,
      GARDEN_PENDING_ACTIONS.UPDATE_PHOTO
    );
    router.replace(ROUTES.GARDEN);
  }, [plant]);

  const handleLogEntry = useCallback(() => {
    if (!plantId) return;
    router.push(ROUTES.ADD_NOTE(plantId) as Href);
  }, [plantId]);

  const handleHealthCheck = useCallback(() => {
    if (!plantId) return;
    router.push(ROUTES.PLANT_HEALTH_CHECK(plantId) as Href);
  }, [plantId]);

  const lastRefreshRef = useRef<number>(0);
  const COOLDOWN_MS = 30_000;

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastRefreshRef.current < COOLDOWN_MS) return;
      lastRefreshRef.current = now;

      ensureRollingWindow(14).catch((error: unknown) => {
        console.error('Failed to ensure rolling task window:', error);
        Sentry.captureException(error, {
          tags: {
            component: 'PlantDetailScreen',
            action: 'ensureRollingWindow',
          },
        });
      });
    }, [ensureRollingWindow])
  );

  // Loading state
  if (plantsLoading || (plant && tasksLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-bg">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not found state
  if (!plant) {
    return (
      <View
        className="flex-1 bg-background px-5 dark:bg-dark-bg"
        style={{ paddingTop: insets.top + 10 }}
      >
        <ScreenHeader
          title={t('plantDetail.title')}
          backTestID="back-plant-detail-missing"
        />
        <View className="mt-8 items-center rounded-2xl bg-card p-5 dark:bg-dark-bg-card">
          <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
            {t('plantDetail.notFoundTitle')}
          </Text>
          <Text className="mt-2 text-center text-text-secondary dark:text-text-secondary-dark">
            {t('plantDetail.notFoundSubtitle')}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-5 rounded-xl bg-primary px-5 py-3 dark:bg-primary-bright"
            onPress={() => router.replace(ROUTES.GARDEN)}
            testID="go-home-from-plant-detail"
          >
            <Text className="font-bold text-white dark:text-on-primary-dark">
              {t('plantDetail.goBackHome')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={plant.name}
          backTestID="back-plant-detail"
          rightAction={
            <HeaderAction
              variant="icon"
              accessibilityLabel={t('plantDetail.moreOptionsLabel')}
              accessibilityHint={t('plantDetail.moreOptionsHint')}
              testID="plant-detail-more"
            >
              <MoreVertical
                size={22}
                color={isDark ? Colors.textPrimaryDark : Colors.text}
              />
            </HeaderAction>
          }
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5"
        contentContainerStyle={{
          paddingBottom: 100 + CTA_TAB_BAR_SAFE_OFFSET,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <HeroCard
          imageUrl={plant.imageUrl}
          strainType={plant.strainType}
          sourceType={plant.sourceType}
          phase={plant.phase}
          day={plant.day}
          readyPercent={plant.readyPercent}
          testID="plant-detail-hero"
        />

        {/* Environment grid */}
        <EnvironmentGrid
          temp={plant.temp}
          humidity={plant.humidity}
          lightSchedule={plant.lightSchedulePreset}
          ph={plant.ph}
          testID="plant-detail-environment"
        />

        {/* Setup pills */}
        <SetupPills
          environment={plant.environment}
          medium={plant.medium}
          containerSize={plant.containerSize}
          containerUnit={plant.containerUnit}
          testID="plant-detail-setup"
        />

        {/* Care schedule */}
        <CareSchedule
          wateringCadenceDays={plant.wateringCadenceDays}
          feedingCadenceDays={plant.feedingCadenceDays}
          testID="plant-detail-care"
        />

        {/* Tasks */}
        <TaskList
          tasks={tasks}
          onToggle={handleToggleTask}
          testID="plant-detail-tasks"
        />

        {/* Latest note */}
        <LatestNote
          note={latestNote?.body ?? plant.notes}
          testID="plant-detail-note"
        />
      </ScrollView>

      {/* Bottom action bar */}
      <View
        className="absolute inset-x-0 bottom-0 border-t border-border px-3 pt-2 dark:border-dark-border-bright"
        style={{
          backgroundColor: isDark
            ? Colors.detailOverlayDark
            : Colors.detailOverlayLight,
          paddingBottom: Math.max(insets.bottom, 12) + 40,
        }}
      >
        <BottomActionBar
          onAddPhoto={handleAddPhoto}
          onHealthCheck={handleHealthCheck}
          onLogEntry={handleLogEntry}
          testID="plant-detail-actions"
        />
      </View>
    </View>
  );
}
