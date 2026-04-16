import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';
import {
  recordHealthCheckAllClearMetric,
  recordHealthCheckSubmittedMetric,
  recordMilestoneShiftMetric,
  recordRollingWindowGeneratedMetric,
  recordTaskMutationsAppliedMetric,
} from '@/src/lib/observability/sentry-metrics';
import { toIsoWeekKey } from '@/src/lib/task-engine/date-utils';
import {
  normalizeSeedType,
  toTaskEnginePlantInput,
} from '@/src/lib/task-engine/plant-normalization';
import {
  stringifyHealthCheckPayload,
  stringifyTaskMetadata,
} from '@/src/lib/task-engine/serialization';
import { createTaskCopyResolver } from '@/src/lib/task-engine/task-copy-resolver';
import {
  buildMissingRollingTaskDrafts,
  taskDraftsToTransactions,
} from '@/src/lib/task-engine/task-engine';
import { buildTaskMutationPlan } from '@/src/lib/task-engine/task-mutator';
import type {
  HealthCheckOutcome,
  PhaseMilestoneDraft,
  WeeklyHealthCheckInput,
} from '@/src/lib/task-engine/types';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type TransactionChunk = Unpacked<Parameters<typeof db.transact>[0]>;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_WEEK_KEY_REGEX = /^\d{4}-W\d{2}$/;

export const ALREADY_SUBMITTED_THIS_WEEK = 'ALREADY_SUBMITTED_THIS_WEEK';

export class AlreadySubmittedHealthCheckError extends Error {
  readonly code = ALREADY_SUBMITTED_THIS_WEEK;
  constructor(weekKey: string) {
    super(`Health check already exists for week ${weekKey}`);
    this.name = 'AlreadySubmittedHealthCheckError';
  }
}

function isHealthCheckUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('healthchecks') &&
    message.includes('uniquekey') &&
    (message.includes('unique') || message.includes('constraint'))
  );
}

function resolveStoredHealthCheckWeekKey(input: {
  weekKey?: string;
  checkDate?: string;
}): string | null {
  if (input.weekKey) {
    if (ISO_WEEK_KEY_REGEX.test(input.weekKey)) return input.weekKey;
    if (ISO_DATE_REGEX.test(input.weekKey)) return toIsoWeekKey(input.weekKey);
  }
  if (input.checkDate && ISO_DATE_REGEX.test(input.checkDate)) {
    return toIsoWeekKey(input.checkDate);
  }
  return null;
}

export function useWeeklyHealthCheck(plantId: string | undefined) {
  const { profile } = useAuth();
  const { t } = useTranslation(['add-plant', 'garden']);

  const { data, isLoading, error } = db.useQuery(
    profile && plantId
      ? {
          plants: {
            $: {
              where: {
                id: plantId,
                'owner.id': profile.id,
              },
            },
            phaseMilestones: {},
            tasks: {},
            healthChecks: {},
          },
        }
      : null
  );

  const plant = data?.plants?.[0];
  const milestoneEntities = useMemo(
    () => plant?.phaseMilestones ?? [],
    [plant?.phaseMilestones]
  );
  const milestones = useMemo<PhaseMilestoneDraft[]>(
    () =>
      milestoneEntities.map((milestone) => ({
        phase: milestone.phase as PhaseMilestoneDraft['phase'],
        actualStartDate: milestone.actualStartDate,
        projectedStartDate: milestone.projectedStartDate,
        projectedEndDate: milestone.projectedEndDate,
        isFlexible: milestone.isFlexible,
        version: milestone.version,
      })),
    [milestoneEntities]
  );
  const tasks = useMemo(() => plant?.tasks ?? [], [plant?.tasks]);
  const rawHealthChecks = (plant as Record<string, unknown> | undefined)
    ?.healthChecks as
    | { id: string; weekKey?: string; checkDate?: string }[]
    | undefined;
  const healthChecks = useMemo(() => rawHealthChecks ?? [], [rawHealthChecks]);

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

  const submitWeeklyHealthCheck = useCallback(
    async (
      check: WeeklyHealthCheckInput
    ): Promise<{ outcome: HealthCheckOutcome }> => {
      if (!profile) throw new Error('No profile');
      if (!plantId || !plant) throw new Error('No plant');
      const checkWeekKey = toIsoWeekKey(check.checkDate);
      const healthCheckUniqueKey = `${plantId}:${checkWeekKey}`;

      const existingCheck = healthChecks.find(
        (hc) => resolveStoredHealthCheckWeekKey(hc) === checkWeekKey
      );
      if (existingCheck) {
        throw new AlreadySubmittedHealthCheckError(checkWeekKey);
      }

      const seedType = normalizeSeedType(plant.seedType);
      const taskEnginePlantInput = toTaskEnginePlantInput({
        plantId,
        ownerId: profile.id,
        startDate: plant.sourceStartDate,
        reminderTimeLocal: plant.reminderTimeLocal,
        seedType: plant.seedType,
        medium: plant.medium,
        potSize: plant.containerSize,
        environment: plant.environment,
        strainType: plant.strainType,
        fallbackStartDate: check.checkDate,
      });
      const healthCheckId = id();
      const actionGroupId = `${healthCheckId}-actions`;

      const plan = buildTaskMutationPlan({
        plant: taskEnginePlantInput,
        seedType,
        check,
        healthCheckId,
        actionGroupId,
        tasks,
        milestones,
        resolveTaskCopy,
      });
      const outcome: HealthCheckOutcome =
        plan.diagnoses.length === 1 && plan.diagnoses[0] === 'all-clear'
          ? 'all-clear'
          : 'issues-found';

      const txns: TransactionChunk[] = [];
      const createdAt = Date.now();

      txns.push(
        db.tx.healthChecks[healthCheckId].update({
          checkDate: check.checkDate,
          weekKey: checkWeekKey,
          uniqueKey: healthCheckUniqueKey,
          reasonCode: plan.diagnoses[0],
          payloadJson: stringifyHealthCheckPayload(check),
          diagnosisJson: JSON.stringify({
            diagnoses: plan.diagnoses,
            skippedDiagnoses: plan.skippedDiagnoses,
            conflictingDiagnoses: plan.conflictingDiagnoses,
          }),
          mutationBatchId: actionGroupId,
          createdAt,
        })
      );
      txns.push(db.tx.healthChecks[healthCheckId].link({ owner: profile.id }));
      txns.push(db.tx.healthChecks[healthCheckId].link({ plant: plantId }));

      const createdTasks = plan.createTasks.map((taskDraft) => ({
        id: id(),
        taskDraft,
      }));
      const createTaskTxns = taskDraftsToTransactions({
        taskDrafts: createdTasks.map((entry) => entry.taskDraft),
        taskIds: createdTasks.map((entry) => entry.id),
        ownerId: profile.id,
        plantId,
      });
      if (Array.isArray(createTaskTxns)) {
        txns.push(...createTaskTxns);
      } else {
        txns.push(createTaskTxns);
      }

      const fallbackSupersededByTaskId = createdTasks[0]?.id;
      for (const taskId of plan.supersedeTaskIds) {
        txns.push(
          db.tx.tasks[taskId].update({
            status: 'superseded',
            source: 'mutator',
            supersededByTaskId: fallbackSupersededByTaskId,
            metadataJson: stringifyTaskMetadata({
              source: 'mutator',
              actionGroupId,
              healthCheckId,
              reasonCode: plan.diagnoses[0],
            }),
          })
        );
      }

      if (plan.shiftedMilestones) {
        for (const shifted of plan.shiftedMilestones) {
          const existing = milestoneEntities.find(
            (item) => item.phase === shifted.phase
          );
          if (!existing) continue;
          txns.push(
            db.tx.phaseMilestones[existing.id].update({
              actualStartDate: shifted.actualStartDate,
              projectedStartDate: shifted.projectedStartDate,
              projectedEndDate: shifted.projectedEndDate,
              version: shifted.version,
              updatedAt: Date.now(),
            })
          );
        }
      }

      try {
        await db.transact(txns);
      } catch (error) {
        if (isHealthCheckUniqueConstraintError(error)) {
          throw new AlreadySubmittedHealthCheckError(checkWeekKey);
        }
        throw error;
      }
      recordHealthCheckSubmittedMetric({
        diagnosisCount: plan.diagnoses.length,
      });
      recordTaskMutationsAppliedMetric({
        supersededCount: plan.supersedeTaskIds.length,
        createdCount: plan.createTasks.length,
      });
      if (plan.milestoneShiftDays > 0) {
        recordMilestoneShiftMetric({
          shiftDays: plan.milestoneShiftDays,
        });
      }
      if (outcome === 'all-clear') {
        recordHealthCheckAllClearMetric();
      }

      const shiftedOrCurrentMilestones = plan.shiftedMilestones ?? milestones;

      const supersededSet = new Set(plan.supersedeTaskIds);
      const mergedExistingTasks = [
        ...tasks.map((task) => ({
          status: supersededSet.has(task.id) ? 'superseded' : task.status,
          dedupeKey: task.dedupeKey,
        })),
        ...createdTasks.map((entry) => ({
          status: 'planned',
          dedupeKey: entry.taskDraft.dedupeKey,
        })),
      ];

      const missingDrafts = buildMissingRollingTaskDrafts({
        plant: taskEnginePlantInput,
        milestones: shiftedOrCurrentMilestones,
        existingTasks: mergedExistingTasks,
        resolveTaskCopy,
        daysAhead: 14,
      });

      if (missingDrafts.length > 0) {
        await db.transact(
          taskDraftsToTransactions({
            taskDrafts: missingDrafts,
            ownerId: profile.id,
            plantId,
          })
        );
        try {
          recordRollingWindowGeneratedMetric({
            createdCount: missingDrafts.length,
          });
        } catch (error) {
          console.error('Failed to record rolling window metric:', error);
        }
      }

      return { outcome };
    },
    [
      healthChecks,
      milestoneEntities,
      milestones,
      plant,
      plantId,
      profile,
      resolveTaskCopy,
      tasks,
    ]
  );

  return {
    isLoading,
    error,
    plant,
    milestones,
    tasks,
    submitWeeklyHealthCheck,
  };
}
