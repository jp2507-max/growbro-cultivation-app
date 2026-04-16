import { db, id, type Task } from '@/src/lib/instant';
import {
  addDays,
  parseIsoDate,
  toIsoDate,
} from '@/src/lib/task-engine/date-utils';
import { stringifyTaskMetadata } from '@/src/lib/task-engine/serialization';
import {
  buildPhaseMilestones,
  generateRollingTasks,
  rebuildMilestonesFromAnchor,
  type ResolveTaskCopy,
} from '@/src/lib/task-engine/task-generator';
import {
  MILESTONE_PHASES,
  type MilestonePhase,
  type PhaseMilestoneDraft,
  type TaskDraft,
  type TaskEnginePlantInput,
} from '@/src/lib/task-engine/types';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type TransactionChunk = Unpacked<Parameters<typeof db.transact>[0]>;
type Transactions = TransactionChunk[];

export type MilestoneEntity = {
  id: string;
  phase: string;
  actualStartDate?: string;
  projectedStartDate: string;
  projectedEndDate: string;
  isFlexible: boolean;
  version: number;
};

function normalizeIsoDate(value: Date): string {
  return toIsoDate(
    new Date(value.getFullYear(), value.getMonth(), value.getDate())
  );
}

function maxIsoDate(a: string, b: string): string {
  return a > b ? a : b;
}

export function buildRollingWindowRange(input: {
  plantStartDate: string;
  now?: Date;
  daysAhead?: number;
}): { rangeStart: string; rangeEnd: string } {
  const daysAhead = Math.max(1, Math.trunc(input.daysAhead ?? 14));
  const todayIsoDate = normalizeIsoDate(input.now ?? new Date());
  const rangeStart = maxIsoDate(todayIsoDate, input.plantStartDate);
  const rangeEnd = toIsoDate(addDays(parseIsoDate(rangeStart), daysAhead - 1));
  return { rangeStart, rangeEnd };
}

function milestoneTransactions(input: {
  milestones: PhaseMilestoneDraft[];
  plantId: string;
  ownerId: string;
}): Transactions {
  const transactions: Transactions = [];
  const now = Date.now();

  for (const milestone of input.milestones) {
    const milestoneId = id();
    transactions.push(
      db.tx.phaseMilestones[milestoneId].update({
        actualStartDate: milestone.actualStartDate,
        phase: milestone.phase,
        projectedStartDate: milestone.projectedStartDate,
        projectedEndDate: milestone.projectedEndDate,
        isFlexible: milestone.isFlexible,
        version: milestone.version,
        createdAt: now,
        updatedAt: now,
      })
    );
    transactions.push(
      db.tx.phaseMilestones[milestoneId].link({ owner: input.ownerId })
    );
    transactions.push(
      db.tx.phaseMilestones[milestoneId].link({ plant: input.plantId })
    );
  }

  return transactions;
}

export function taskDraftsToTransactions(input: {
  taskDrafts: TaskDraft[];
  taskIds?: string[];
  plantId: string;
  ownerId: string;
}): Transactions {
  if (input.taskIds && input.taskIds.length !== input.taskDrafts.length) {
    throw new Error('taskIds length must match taskDrafts length');
  }

  const transactions: Transactions = [];
  const now = Date.now();

  for (const [index, task] of input.taskDrafts.entries()) {
    const taskId = input.taskIds?.[index] ?? id();
    transactions.push(
      db.tx.tasks[taskId].update({
        title: task.title,
        subtitle: task.subtitle ?? '',
        completed: false,
        date: task.dueDate,
        dueAt: task.dueAt,
        dueTime: task.dueTime,
        time: task.dueTime ?? '',
        icon: task.icon ?? '',
        type: task.type,
        status: task.status,
        source: task.source,
        metadataJson: stringifyTaskMetadata(task.metadata),
        dedupeKey: task.dedupeKey,
        createdAt: now,
      })
    );
    transactions.push(db.tx.tasks[taskId].link({ owner: input.ownerId }));
    transactions.push(db.tx.tasks[taskId].link({ plant: input.plantId }));
  }

  return transactions;
}

export function buildInitializationTransactions(input: {
  plant: TaskEnginePlantInput;
  resolveTaskCopy?: ResolveTaskCopy;
  daysAhead?: number;
  now?: Date;
}): {
  milestones: PhaseMilestoneDraft[];
  taskDrafts: TaskDraft[];
  txns: Transactions;
} {
  const milestones = buildPhaseMilestones({
    startDate: input.plant.startDate,
    seedType: input.plant.seedType,
  });

  const { rangeStart, rangeEnd } = buildRollingWindowRange({
    plantStartDate: input.plant.startDate,
    now: input.now,
    daysAhead: input.daysAhead,
  });

  const taskDrafts = generateRollingTasks({
    plant: input.plant,
    milestones,
    rangeStart,
    rangeEnd,
    resolveTaskCopy: input.resolveTaskCopy,
  });

  const txns: Transactions = [];
  txns.push(
    ...milestoneTransactions({
      milestones,
      plantId: input.plant.plantId,
      ownerId: input.plant.ownerId,
    })
  );
  txns.push(
    ...taskDraftsToTransactions({
      taskDrafts,
      plantId: input.plant.plantId,
      ownerId: input.plant.ownerId,
    })
  );

  return { milestones, taskDrafts, txns };
}

export function buildMissingRollingTaskDrafts(input: {
  plant: TaskEnginePlantInput;
  milestones: PhaseMilestoneDraft[];
  existingTasks: Pick<Task, 'status' | 'dedupeKey'>[];
  resolveTaskCopy?: ResolveTaskCopy;
  daysAhead?: number;
  now?: Date;
}): TaskDraft[] {
  const { rangeStart, rangeEnd } = buildRollingWindowRange({
    plantStartDate: input.plant.startDate,
    now: input.now,
    daysAhead: input.daysAhead,
  });

  const generated = generateRollingTasks({
    plant: input.plant,
    milestones: input.milestones,
    rangeStart,
    rangeEnd,
    resolveTaskCopy: input.resolveTaskCopy,
  });

  const existingKeys = new Set(
    input.existingTasks
      .filter(
        (task) => task.status !== 'cancelled' && task.status !== 'superseded'
      )
      .map((task) => task.dedupeKey)
      .filter((key): key is string => typeof key === 'string' && key.length > 0)
  );

  return generated.filter((task) => !existingKeys.has(task.dedupeKey));
}

const VALID_PHASES = new Set<MilestonePhase>(MILESTONE_PHASES);

export function buildAnchorTransactions(input: {
  milestoneEntities: MilestoneEntity[];
  anchoredPhase: MilestonePhase;
  actualStartDate: string;
}): { milestones: PhaseMilestoneDraft[]; txns: Transactions } {
  const milestones = input.milestoneEntities.flatMap((milestone) => {
    if (!VALID_PHASES.has(milestone.phase as MilestonePhase)) return [];
    return [
      {
        phase: milestone.phase as MilestonePhase,
        actualStartDate: milestone.actualStartDate,
        projectedStartDate: milestone.projectedStartDate,
        projectedEndDate: milestone.projectedEndDate,
        isFlexible: milestone.isFlexible,
        version: milestone.version,
      },
    ];
  });

  const rebuilt = rebuildMilestonesFromAnchor({
    milestones,
    anchoredPhase: input.anchoredPhase,
    actualStartDate: input.actualStartDate,
  });

  const txns: Transactions = [];
  const updatedAt = Date.now();
  for (const milestone of rebuilt) {
    const existing = input.milestoneEntities.find(
      (entity) => entity.phase === milestone.phase
    );
    if (!existing) continue;
    txns.push(
      db.tx.phaseMilestones[existing.id].update({
        actualStartDate: milestone.actualStartDate,
        projectedStartDate: milestone.projectedStartDate,
        projectedEndDate: milestone.projectedEndDate,
        version: milestone.version,
        updatedAt,
      })
    );
  }

  return {
    milestones: rebuilt,
    txns,
  };
}
