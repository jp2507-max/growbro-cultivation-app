import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Plant } from '@/src/lib/instant';
import { recordRollingWindowGeneratedMetric } from '@/src/lib/observability/sentry-metrics';
import { toTaskEnginePlantInput } from '@/src/lib/task-engine/plant-normalization';
import { createTaskCopyResolver } from '@/src/lib/task-engine/task-copy-resolver';
import { buildInitializationTransactions } from '@/src/lib/task-engine/task-engine';
import type { ResolveTaskCopy } from '@/src/lib/task-engine/task-generator';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type TransactionChunk = Unpacked<Parameters<typeof db.transact>[0]>;

type AddPlantInput = {
  name: string;
  strainName: string;
  strainId?: string;
  strainType: string;
  sourceType: string;
  seedType: 'autoflower' | 'photoperiod';
  environment: string;
  currentPhase: string;
  startDate: string;
  medium: string;
  containerSize: number;
  containerUnit: string;
  lightType?: string;
  lightSchedulePreset?: string;
  targetTempDay?: number;
  targetTempNight?: number;
  targetHumidity?: number;
  targetPhMin?: number;
  targetPhMax?: number;
  autoCreateTasks: boolean;
  wateringCadenceDays: number;
  feedingCadenceDays: number;
  reminderTimeLocal: string;
  notes?: string;
  imageUrl?: string;
  estimatedFloweringWeeks?: number;
};

export function usePlants(): {
  plants: Plant[];
  isLoading: boolean;
  error: { message: string } | undefined;
  addPlant: (data: AddPlantInput) => Promise<unknown>;
  updatePlant: (
    plantId: string,
    data: Partial<Omit<Plant, 'id'>>
  ) => Promise<unknown>;
  deletePlant: (plantId: string) => Promise<unknown>;
} {
  const { profile } = useAuth();
  const { t } = useTranslation('add-plant');

  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          plants: {
            $: {
              where: {
                'owner.id': profile.id,
              },
            },
          },
        }
      : null
  );

  const addPlant = useCallback(
    (plantData: AddPlantInput) => {
      if (!profile) return Promise.reject(new Error('No profile'));

      const plantId = id();
      const transactions: TransactionChunk[] = [
        db.tx.plants[plantId].update({
          name: plantData.name,
          strainName: plantData.strainName,
          strainId: plantData.strainId,
          strainType: plantData.strainType,
          sourceType: plantData.sourceType,
          seedType: plantData.seedType,
          environment: plantData.environment,
          medium: plantData.medium,
          containerSize: plantData.containerSize,
          containerUnit: plantData.containerUnit,
          lightType: plantData.lightType,
          lightSchedulePreset: plantData.lightSchedulePreset,
          sourceStartDate: plantData.startDate,
          day: 0,
          phase: plantData.currentPhase,
          weeksLeft: plantData.estimatedFloweringWeeks ?? 12,
          readyPercent: 0,
          tempDay: plantData.targetTempDay,
          tempNight: plantData.targetTempNight,
          temp:
            plantData.targetTempDay && plantData.targetTempNight
              ? (plantData.targetTempDay + plantData.targetTempNight) / 2
              : undefined,
          humidity: plantData.targetHumidity,
          phMin: plantData.targetPhMin,
          phMax: plantData.targetPhMax,
          ph:
            plantData.targetPhMin && plantData.targetPhMax
              ? (plantData.targetPhMin + plantData.targetPhMax) / 2
              : undefined,
          autoCreateTasks: plantData.autoCreateTasks,
          wateringCadenceDays: plantData.wateringCadenceDays,
          feedingCadenceDays: plantData.feedingCadenceDays,
          reminderTimeLocal: plantData.reminderTimeLocal,
          notes: plantData.notes,
          imageUrl: plantData.imageUrl,
          createdAt: Date.now(),
        }),
        db.tx.plants[plantId].link({ owner: profile.id }),
      ];

      if (plantData.autoCreateTasks) {
        const resolveTaskCopy: ResolveTaskCopy = createTaskCopyResolver(
          t as unknown as (
            key: string,
            options?: Record<string, unknown>
          ) => string
        );

        const { taskDrafts, txns } = buildInitializationTransactions({
          plant: toTaskEnginePlantInput({
            plantId,
            ownerId: profile.id,
            startDate: plantData.startDate,
            reminderTimeLocal: plantData.reminderTimeLocal,
            seedType: plantData.seedType,
            medium: plantData.medium,
            potSize: plantData.containerSize,
            environment: plantData.environment,
            strainType: plantData.strainType,
          }),
          resolveTaskCopy,
          daysAhead: 14,
        });

        if (Array.isArray(txns)) {
          transactions.push(...txns);
        } else {
          transactions.push(txns);
        }
        recordRollingWindowGeneratedMetric({
          createdCount: taskDrafts.length,
        });
      }

      return db.transact(transactions);
    },
    [profile, t]
  );

  const updatePlant = useCallback(
    (plantId: string, updates: Partial<Omit<Plant, 'id'>>) => {
      return db.transact(db.tx.plants[plantId].update(updates));
    },
    []
  );

  const deletePlant = useCallback((plantId: string) => {
    return db.transact(db.tx.plants[plantId].delete());
  }, []);

  return {
    plants: data?.plants ?? [],
    isLoading,
    error,
    addPlant,
    updatePlant,
    deletePlant,
  };
}
