import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/providers/auth-provider';
import { db, type Plant } from '@/src/lib/instant';
import {
  recordMilestoneAnchoredMetric,
  recordRollingWindowGeneratedMetric,
} from '@/src/lib/observability/sentry-metrics';
import { toTaskEnginePlantInput } from '@/src/lib/task-engine/plant-normalization';
import { createTaskCopyResolver } from '@/src/lib/task-engine/task-copy-resolver';
import {
  buildAnchorTransactions,
  buildMissingRollingTaskDrafts,
  taskDraftsToTransactions,
} from '@/src/lib/task-engine/task-engine';
import type { MilestonePhase } from '@/src/lib/task-engine/types';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type TransactionChunk = Unpacked<Parameters<typeof db.transact>[0]>;

type PlantWithTaskData = Plant & {
  phaseMilestones?: {
    id: string;
    phase: string;
    actualStartDate?: string;
    projectedStartDate: string;
    projectedEndDate: string;
    isFlexible: boolean;
    version: number;
  }[];
  tasks?: {
    id: string;
    date?: string;
    source?: string;
    status?: string;
    dedupeKey?: string;
  }[];
};

export function useTaskEngine(plantId?: string) {
  const { profile } = useAuth();
  const { t } = useTranslation(['add-plant', 'garden']);

  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          plants: {
            $: {
              where: {
                'owner.id': profile.id,
                ...(plantId ? { id: plantId } : {}),
              },
            },
            phaseMilestones: {},
            tasks: {},
          },
        }
      : null
  );

  const plants = useMemo(
    () => (data?.plants ?? []) as PlantWithTaskData[],
    [data?.plants]
  );

  const resolveTaskCopy = useMemo(
    () =>
      createTaskCopyResolver(
        t as unknown as (
          key: string,
          options?: Record<string, unknown>
        ) => string
      ),
    [t]
  );

  const ensureRollingWindow = useCallback(
    async (daysAhead = 14): Promise<void> => {
      if (!profile) return;

      const txns: TransactionChunk[] = [];
      let createdCount = 0;
      for (const plant of plants) {
        const milestones = (plant.phaseMilestones ?? []).map((milestone) => ({
          phase: milestone.phase as MilestonePhase,
          actualStartDate: milestone.actualStartDate,
          projectedStartDate: milestone.projectedStartDate,
          projectedEndDate: milestone.projectedEndDate,
          isFlexible: milestone.isFlexible,
          version: milestone.version,
        }));
        if (milestones.length === 0) continue;

        const missingDrafts = buildMissingRollingTaskDrafts({
          plant: toTaskEnginePlantInput({
            plantId: plant.id,
            ownerId: profile.id,
            startDate: plant.sourceStartDate,
            reminderTimeLocal: plant.reminderTimeLocal,
            seedType: plant.seedType,
            medium: plant.medium,
            potSize: plant.containerSize,
            environment: plant.environment,
            strainType: plant.strainType,
          }),
          milestones,
          existingTasks: (plant.tasks ?? []).map((task) => ({
            status: task.status,
            dedupeKey: task.dedupeKey,
          })),
          daysAhead,
          resolveTaskCopy,
        });

        if (missingDrafts.length === 0) continue;
        createdCount += missingDrafts.length;
        const createTxns = taskDraftsToTransactions({
          taskDrafts: missingDrafts,
          ownerId: profile.id,
          plantId: plant.id,
        });
        if (Array.isArray(createTxns)) {
          txns.push(...createTxns);
        } else {
          txns.push(createTxns);
        }
      }

      if (txns.length === 0) return;
      await db.transact(txns);
      recordRollingWindowGeneratedMetric({ createdCount });
    },
    [plants, profile, resolveTaskCopy]
  );

  const anchorMilestone = useCallback(
    async (input: {
      anchoredPhase: MilestonePhase;
      actualStartDate: string;
      daysAhead?: number;
    }): Promise<void> => {
      if (!profile || !plantId) return;

      const plant = plants.find((entry) => entry.id === plantId);
      if (!plant) return;

      const milestoneEntities = plant.phaseMilestones ?? [];
      if (milestoneEntities.length === 0) return;

      const { milestones: anchoredMilestones, txns: milestoneTxns } =
        buildAnchorTransactions({
          milestoneEntities,
          anchoredPhase: input.anchoredPhase,
          actualStartDate: input.actualStartDate,
        });

      const cancelledTaskIds = new Set<string>();
      const txns: TransactionChunk[] = [...milestoneTxns];
      for (const task of plant.tasks ?? []) {
        if (!task.date || task.date < input.actualStartDate) continue;
        if (task.source !== 'generator') continue;
        if (task.status === 'completed' || task.status === 'superseded')
          continue;
        if (task.status === 'cancelled') continue;

        cancelledTaskIds.add(task.id);
        txns.push(
          db.tx.tasks[task.id].update({
            status: 'cancelled',
          })
        );
      }

      const missingDrafts = buildMissingRollingTaskDrafts({
        plant: toTaskEnginePlantInput({
          plantId: plant.id,
          ownerId: profile.id,
          startDate: plant.sourceStartDate,
          reminderTimeLocal: plant.reminderTimeLocal,
          seedType: plant.seedType,
          medium: plant.medium,
          potSize: plant.containerSize,
          environment: plant.environment,
          strainType: plant.strainType,
        }),
        milestones: anchoredMilestones,
        existingTasks: (plant.tasks ?? []).map((task) => ({
          status: cancelledTaskIds.has(task.id) ? 'cancelled' : task.status,
          dedupeKey: task.dedupeKey,
        })),
        daysAhead: input.daysAhead,
        resolveTaskCopy,
      });

      const createTaskTxns = taskDraftsToTransactions({
        taskDrafts: missingDrafts,
        ownerId: profile.id,
        plantId: plant.id,
      });
      if (Array.isArray(createTaskTxns)) {
        txns.push(...createTaskTxns);
      } else {
        txns.push(createTaskTxns);
      }

      if (txns.length === 0) return;
      await db.transact(txns);

      recordMilestoneAnchoredMetric({ phase: input.anchoredPhase });
      if (missingDrafts.length > 0) {
        recordRollingWindowGeneratedMetric({
          createdCount: missingDrafts.length,
        });
      }
    },
    [plantId, plants, profile, resolveTaskCopy]
  );

  return {
    isLoading,
    error,
    ensureRollingWindow,
    anchorMilestone,
  };
}
