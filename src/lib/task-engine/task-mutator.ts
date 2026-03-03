import type { Task } from '@/src/lib/instant';
import {
  addDays,
  computeDueAt,
  parseIsoDate,
  toIsoDate,
} from '@/src/lib/task-engine/date-utils';
import {
  buildTaskDedupeKey,
  resolvePhaseForDate,
  type ResolveTaskCopy,
} from '@/src/lib/task-engine/task-generator';
import {
  type DiagnosisCode,
  type MilestonePhase,
  type PhaseMilestoneDraft,
  type SeedType,
  type SkippedDiagnosis,
  type TaskDraft,
  type TaskEnginePlantInput,
  type TaskMetadata,
  type TaskMutationPlan,
  type TaskType,
  type WeeklyHealthCheckInput,
} from '@/src/lib/task-engine/types';

type MutableTask = Pick<
  Task,
  'id' | 'title' | 'date' | 'dueAt' | 'completed' | 'status' | 'type'
>;

type MutationResult = TaskMutationPlan & {
  shiftedMilestones: PhaseMilestoneDraft[] | null;
};

function activeFutureTasks(
  tasks: MutableTask[],
  checkDate: string
): MutableTask[] {
  return tasks.filter((task) => {
    if (task.completed) return false;
    if (task.status === 'cancelled' || task.status === 'superseded')
      return false;
    if (!task.date) return false;
    return task.date >= checkDate;
  });
}

function inferTaskType(task: MutableTask): TaskType | null {
  if (task.type) return task.type as TaskType;
  const title = task.title.toLowerCase();
  if (title.includes('water') || title.includes('gie')) return 'water';
  if (title.includes('feed') || title.includes('nutrient')) return 'feed';
  if (title.includes('ph')) return 'ph-check';
  if (title.includes('pest') || title.includes('aphid')) return 'pest-check';
  return null;
}

function firstTaskByType(
  tasks: MutableTask[],
  type: TaskType,
  checkDate: string
): MutableTask | null {
  const resolveDueAt = (task: MutableTask): number =>
    task.dueAt ?? parseIsoDate(task.date ?? checkDate).getTime();

  const sorted = [...tasks]
    .filter(
      (task) => inferTaskType(task) === type && (task.date ?? '') >= checkDate
    )
    .sort((a, b) => {
      const diff = resolveDueAt(a) - resolveDueAt(b);
      if (diff !== 0) return diff;
      return a.id.localeCompare(b.id);
    });
  return sorted[0] ?? null;
}

function tasksByType(tasks: MutableTask[], type: TaskType): MutableTask[] {
  return tasks.filter((task) => inferTaskType(task) === type);
}

function buildMutatedTask(input: {
  plant: TaskEnginePlantInput;
  dueDate: string;
  phase: MilestonePhase;
  type: TaskType;
  actionGroupId: string;
  healthCheckId: string;
  reasonCode: DiagnosisCode;
  resolveTaskCopy: ResolveTaskCopy;
  dosageAdjustmentPct?: number;
}): TaskDraft {
  const copy = input.resolveTaskCopy({
    type: input.type,
    phase: input.phase,
    medium: input.plant.medium,
    environment: input.plant.environment,
  });

  const metadata: TaskMetadata = {
    phase: input.phase,
    source: 'mutator',
    reasonCode: input.reasonCode,
    healthCheckId: input.healthCheckId,
    actionGroupId: input.actionGroupId,
    dosageAdjustmentPct: input.dosageAdjustmentPct,
  };

  return {
    title: copy.title,
    subtitle: copy.subtitle,
    dueDate: input.dueDate,
    dueAt: computeDueAt(input.dueDate, input.plant.reminderTimeLocal),
    dueTime: input.plant.reminderTimeLocal,
    icon: copy.icon,
    type: input.type,
    status: 'planned',
    source: 'mutator',
    metadata,
    dedupeKey: buildTaskDedupeKey({
      plantId: input.plant.plantId,
      type: input.type,
      dueDate: input.dueDate,
      source: 'mutator',
      reasonCode: input.reasonCode,
    }),
  };
}

export function deriveDiagnoses(
  input: WeeklyHealthCheckInput,
  _seedType: SeedType
): DiagnosisCode[] {
  const diagnoses: DiagnosisCode[] = [];

  if (
    input.wateringIssues.hasDroopingLeaves &&
    input.wateringIssues.potWeightState
  ) {
    diagnoses.push(
      input.wateringIssues.potWeightState === 'heavy-wet'
        ? 'overwatering'
        : 'underwatering'
    );
  }

  if (input.nutrientIssues.yellowingBottomLeaves) {
    diagnoses.push('nitrogen-deficiency');
  }

  if (input.nutrientIssues.burntCrispyTips) {
    diagnoses.push('nutrient-burn');
  }

  if (input.developmentIssues.hasStuntedGrowth) {
    diagnoses.push('stunted-growth');
  }

  return diagnoses;
}

export function shiftMilestonesForStuntedGrowth(input: {
  milestones: PhaseMilestoneDraft[];
  seedType: SeedType;
  delayDays: number;
}): PhaseMilestoneDraft[] | null {
  if (input.seedType !== 'photoperiod') return null;
  if (input.delayDays <= 0) return null;

  return input.milestones.map((milestone) => {
    if (milestone.phase === 'seedling' || milestone.phase === 'vegetative') {
      return milestone;
    }

    return {
      ...milestone,
      projectedStartDate: toIsoDate(
        addDays(parseIsoDate(milestone.projectedStartDate), input.delayDays)
      ),
      projectedEndDate: toIsoDate(
        addDays(parseIsoDate(milestone.projectedEndDate), input.delayDays)
      ),
      version: milestone.version + 1,
    };
  });
}

export function buildTaskMutationPlan(input: {
  plant: TaskEnginePlantInput;
  seedType: SeedType;
  check: WeeklyHealthCheckInput;
  healthCheckId: string;
  actionGroupId: string;
  tasks: MutableTask[];
  milestones: PhaseMilestoneDraft[];
  resolveTaskCopy: ResolveTaskCopy;
}): MutationResult {
  const diagnoses = deriveDiagnoses(input.check, input.seedType);
  if (diagnoses.length === 0) {
    diagnoses.push('all-clear');
  }
  const futureTasks = activeFutureTasks(input.tasks, input.check.checkDate);
  const currentPhase = resolvePhaseForDate(
    input.milestones,
    input.check.checkDate
  );

  const supersedeTaskIds: string[] = [];
  const createTasks: TaskDraft[] = [];
  const skippedDiagnoses: SkippedDiagnosis[] = [];
  const conflictingDiagnoses: DiagnosisCode[] = [];
  let milestoneShiftDays = 0;

  if (!currentPhase) {
    return {
      diagnoses,
      supersedeTaskIds: [],
      createTasks: [],
      milestoneShiftDays: 0,
      skippedDiagnoses: [
        ...skippedDiagnoses,
        ...diagnoses
          .filter((d) => d !== 'all-clear')
          .map((code) => ({
            code,
            reason:
              'No active phase found for the given check date (e.g. post-harvest)',
          })),
      ],
      conflictingDiagnoses,
      shiftedMilestones: null,
    };
  }

  // --- Priority 1: Water issues (highest severity) ---

  if (diagnoses.includes('overwatering')) {
    const waterTasks = tasksByType(futureTasks, 'water');
    if (waterTasks.length > 0) {
      supersedeTaskIds.push(...waterTasks.map((task) => task.id));
    }
    createTasks.push(
      buildMutatedTask({
        plant: input.plant,
        dueDate: input.check.checkDate,
        phase: currentPhase,
        type: 'recovery-dryout',
        actionGroupId: input.actionGroupId,
        healthCheckId: input.healthCheckId,
        reasonCode: 'overwatering',
        resolveTaskCopy: input.resolveTaskCopy,
      })
    );
  }

  if (diagnoses.includes('underwatering')) {
    createTasks.push(
      buildMutatedTask({
        plant: input.plant,
        dueDate: input.check.checkDate,
        phase: currentPhase,
        type: 'water',
        actionGroupId: input.actionGroupId,
        healthCheckId: input.healthCheckId,
        reasonCode: 'underwatering',
        resolveTaskCopy: input.resolveTaskCopy,
      })
    );
  }

  // --- Priority 2: Nutrient issues (nutrient-burn > nitrogen-deficiency) ---

  const hasNutrientBurn = diagnoses.includes('nutrient-burn');
  const hasNitrogenDeficiency = diagnoses.includes('nitrogen-deficiency');

  if (hasNutrientBurn && hasNitrogenDeficiency) {
    conflictingDiagnoses.push('nitrogen-deficiency');
    skippedDiagnoses.push({
      code: 'nitrogen-deficiency',
      reason: 'Superseded by higher-severity nutrient-burn diagnosis',
    });
  }

  if (hasNutrientBurn) {
    const nextFeed = firstTaskByType(
      futureTasks,
      'feed',
      input.check.checkDate
    );
    if (nextFeed && !supersedeTaskIds.includes(nextFeed.id)) {
      supersedeTaskIds.push(nextFeed.id);
      createTasks.push(
        buildMutatedTask({
          plant: input.plant,
          dueDate: nextFeed.date ?? input.check.checkDate,
          phase: currentPhase,
          type: 'flush-water-only',
          actionGroupId: input.actionGroupId,
          healthCheckId: input.healthCheckId,
          reasonCode: 'nutrient-burn',
          resolveTaskCopy: input.resolveTaskCopy,
        })
      );
    } else if (!nextFeed) {
      skippedDiagnoses.push({
        code: 'nutrient-burn',
        reason: 'No future feed task found to supersede',
      });
    }
  } else if (hasNitrogenDeficiency) {
    const nextFeed = firstTaskByType(
      futureTasks,
      'feed',
      input.check.checkDate
    );
    if (nextFeed && !supersedeTaskIds.includes(nextFeed.id)) {
      supersedeTaskIds.push(nextFeed.id);
      createTasks.push(
        buildMutatedTask({
          plant: input.plant,
          dueDate: nextFeed.date ?? input.check.checkDate,
          phase: currentPhase,
          type: 'feed',
          actionGroupId: input.actionGroupId,
          healthCheckId: input.healthCheckId,
          reasonCode: 'nitrogen-deficiency',
          resolveTaskCopy: input.resolveTaskCopy,
          dosageAdjustmentPct: 15,
        })
      );
    } else if (!nextFeed) {
      skippedDiagnoses.push({
        code: 'nitrogen-deficiency',
        reason: 'No future feed task found to supersede',
      });
    }
  }

  // --- Priority 3: Growth issues (lowest severity) ---

  if (
    diagnoses.includes('stunted-growth') &&
    input.seedType === 'photoperiod'
  ) {
    milestoneShiftDays = 7;
  }

  if (diagnoses.includes('stunted-growth') && input.seedType === 'autoflower') {
    createTasks.push(
      buildMutatedTask({
        plant: input.plant,
        dueDate: input.check.checkDate,
        phase: currentPhase,
        type: 'health-warning',
        actionGroupId: input.actionGroupId,
        healthCheckId: input.healthCheckId,
        reasonCode: 'stunted-growth',
        resolveTaskCopy: input.resolveTaskCopy,
      })
    );
  }

  const shiftedMilestones = shiftMilestonesForStuntedGrowth({
    milestones: input.milestones,
    seedType: input.seedType,
    delayDays: milestoneShiftDays,
  });

  return {
    diagnoses,
    supersedeTaskIds: Array.from(new Set(supersedeTaskIds)),
    createTasks,
    milestoneShiftDays,
    skippedDiagnoses,
    conflictingDiagnoses,
    shiftedMilestones,
  };
}
