import i18n from '@/src/lib/i18n';
import {
  addDays,
  computeDueAt,
  daysBetween,
  parseIsoDate,
  startOfIsoDate,
  toIsoDate,
} from '@/src/lib/task-engine/date-utils';
import {
  createTaskCopyResolver,
  type TranslateFn,
} from '@/src/lib/task-engine/task-copy-resolver';
import {
  type CadenceProfile,
  type GrowEnvironment,
  type MilestonePhase,
  PHASE_CADENCE_MULTIPLIERS,
  type PhaseMilestoneDraft,
  type SeedType,
  type TaskDraft,
  type TaskEnginePlantInput,
  type TaskMetadata,
  type TaskType,
} from '@/src/lib/task-engine/types';

type TaskCopy = {
  title: string;
  subtitle: string;
  icon: string;
};

type TaskCopyContext = {
  type: TaskType;
  phase: MilestonePhase;
  medium: TaskEnginePlantInput['medium'];
  environment: GrowEnvironment;
};

export type ResolveTaskCopy = (context: TaskCopyContext) => TaskCopy;

const FLUSH_WINDOW_DAYS = 14;
const MAX_WATERING_INTERVAL_DAYS = 7;
const HEALTH_CHECK_REMINDER_EVERY_DAYS = 7;

const t: TranslateFn = (key, options) =>
  (i18n.t as (k: string, o?: Record<string, unknown>) => string)(key, options);
const resolveDefaultTaskCopy = createTaskCopyResolver(t);

function isCadenceHit(daysFromStart: number, everyDays: number): boolean {
  if (everyDays <= 0) return false;
  return daysFromStart % everyDays === 0;
}

function phaseStartDate(milestone: PhaseMilestoneDraft): string {
  return milestone.actualStartDate ?? milestone.projectedStartDate;
}

function phaseDurationDaysFromMilestone(
  milestone: PhaseMilestoneDraft
): number {
  return (
    daysBetween(milestone.projectedStartDate, milestone.projectedEndDate) + 1
  );
}

function resolvePhaseMilestoneForDate(
  milestones: PhaseMilestoneDraft[],
  isoDate: string
): PhaseMilestoneDraft | null {
  const dateMs = startOfIsoDate(isoDate).getTime();

  for (const milestone of milestones) {
    const startMs = startOfIsoDate(phaseStartDate(milestone)).getTime();
    const endMs = startOfIsoDate(milestone.projectedEndDate).getTime();
    if (dateMs >= startMs && dateMs <= endMs) return milestone;
  }

  return null;
}

function resolvePhaseAdjustedCadenceEveryDays(input: {
  baseEveryDays: number;
  phase: MilestonePhase;
  maxEveryDays?: number;
}): number {
  const multiplier = PHASE_CADENCE_MULTIPLIERS[input.phase] ?? 1;
  const scaledEveryDays = Math.max(
    1,
    Math.round(input.baseEveryDays / multiplier)
  );
  if (typeof input.maxEveryDays === 'number') {
    return Math.min(input.maxEveryDays, scaledEveryDays);
  }
  return scaledEveryDays;
}

function resolveHarvestMilestoneDate(
  milestones: PhaseMilestoneDraft[]
): string | null {
  const harvestMilestone = milestones.find(
    (milestone) => milestone.phase === 'harvest'
  );
  if (!harvestMilestone) return null;
  return (
    harvestMilestone.actualStartDate ?? harvestMilestone.projectedStartDate
  );
}

function isInFlushWindow(input: {
  milestones: PhaseMilestoneDraft[];
  dueDate: string;
}): boolean {
  const harvestDate = resolveHarvestMilestoneDate(input.milestones);
  if (!harvestDate) return false;
  if (input.dueDate > harvestDate) return false;

  const daysUntilHarvest = daysBetween(input.dueDate, harvestDate);
  return daysUntilHarvest <= FLUSH_WINDOW_DAYS;
}

export function buildTaskDedupeKey(input: {
  plantId: string;
  type: TaskType;
  dueDate: string;
  source: TaskMetadata['source'];
  reasonCode?: TaskMetadata['reasonCode'];
}): string {
  return [
    input.plantId,
    input.type,
    input.dueDate,
    input.source,
    input.reasonCode ?? 'none',
  ].join(':');
}

export function computeCadenceProfile(input: {
  medium: TaskEnginePlantInput['medium'];
  potSize: number;
  environment: TaskEnginePlantInput['environment'];
}): CadenceProfile {
  const isHydroLike = input.medium === 'Coco' || input.medium === 'Hydro';
  const isSoilLike = input.medium === 'Soil' || input.medium === 'Soilless';

  const sizeAdjustment = input.potSize <= 5 ? -1 : input.potSize >= 20 ? 1 : 0;

  const baseWatering = isHydroLike ? 1 : isSoilLike ? 3 : 2;
  const baseFeeding = isHydroLike ? 1 : isSoilLike ? 7 : 5;

  const wateringEveryDays = Math.max(1, baseWatering + sizeAdjustment);
  const feedingEveryDays = Math.max(1, baseFeeding + sizeAdjustment);
  const includePhChecks = isHydroLike;
  const phCheckEveryDays = isHydroLike ? 2 : 0;

  const environmentEveryDays = input.environment === 'Outdoor' ? 2 : 1;
  const pestEveryDays = input.environment === 'Outdoor' ? 2 : 4;

  return {
    wateringEveryDays,
    feedingEveryDays,
    includePhChecks,
    phCheckEveryDays,
    environmentEveryDays,
    pestEveryDays,
  };
}

function phaseDurationDays(seedType: SeedType): Record<MilestonePhase, number> {
  if (seedType === 'autoflower') {
    return {
      seedling: 14,
      vegetative: 14,
      flowering: 42,
      harvest: 7,
    };
  }

  return {
    seedling: 14,
    vegetative: 35,
    flowering: 56,
    harvest: 7,
  };
}

export function buildPhaseMilestones(input: {
  startDate: string;
  seedType: SeedType;
}): PhaseMilestoneDraft[] {
  const durations = phaseDurationDays(input.seedType);
  const order: MilestonePhase[] = [
    'seedling',
    'vegetative',
    'flowering',
    'harvest',
  ];
  const start = parseIsoDate(input.startDate);
  const milestones: PhaseMilestoneDraft[] = [];
  let cursor = start;

  for (const phase of order) {
    const phaseStart = new Date(cursor);
    const phaseEnd = addDays(phaseStart, durations[phase] - 1);
    milestones.push({
      phase,
      projectedStartDate: toIsoDate(phaseStart),
      projectedEndDate: toIsoDate(phaseEnd),
      isFlexible: phase === 'vegetative' && input.seedType === 'photoperiod',
      version: 1,
    });
    cursor = addDays(phaseEnd, 1);
  }

  return milestones;
}

export function rebuildMilestonesFromAnchor(input: {
  milestones: PhaseMilestoneDraft[];
  anchoredPhase: MilestonePhase;
  actualStartDate: string;
}): PhaseMilestoneDraft[] {
  const phaseOrder: MilestonePhase[] = [
    'seedling',
    'vegetative',
    'flowering',
    'harvest',
  ];
  const sortedMilestones = [...input.milestones].sort(
    (a, b) => phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase)
  );
  const anchorIndex = sortedMilestones.findIndex(
    (milestone) => milestone.phase === input.anchoredPhase
  );
  if (anchorIndex === -1) return sortedMilestones;

  const rebuilt: PhaseMilestoneDraft[] = [];

  for (const [index, milestone] of sortedMilestones.entries()) {
    if (index < anchorIndex) {
      rebuilt.push(milestone);
      continue;
    }

    const durationDays = phaseDurationDaysFromMilestone(milestone);
    const startDate =
      index === anchorIndex
        ? input.actualStartDate
        : toIsoDate(
            addDays(parseIsoDate(rebuilt[index - 1].projectedEndDate), 1)
          );
    const endDate = toIsoDate(
      addDays(parseIsoDate(startDate), durationDays - 1)
    );

    rebuilt.push({
      ...milestone,
      actualStartDate:
        index === anchorIndex ? input.actualStartDate : undefined,
      projectedStartDate: startDate,
      projectedEndDate: endDate,
      version: milestone.version + 1,
    });
  }

  return rebuilt;
}

export function resolvePhaseForDate(
  milestones: PhaseMilestoneDraft[],
  isoDate: string
): MilestonePhase | undefined {
  const milestone = resolvePhaseMilestoneForDate(milestones, isoDate);
  if (milestone) return milestone.phase;
  return undefined;
}

function buildTaskDraft(input: {
  plant: TaskEnginePlantInput;
  type: TaskType;
  dueDate: string;
  phase: MilestonePhase;
  source: TaskMetadata['source'];
  resolveTaskCopy: ResolveTaskCopy;
  reasonCode?: TaskMetadata['reasonCode'];
}): TaskDraft {
  const copy = input.resolveTaskCopy({
    type: input.type,
    phase: input.phase,
    medium: input.plant.medium,
    environment: input.plant.environment,
  });

  const metadata: TaskMetadata = {
    phase: input.phase,
    source: input.source,
    reasonCode: input.reasonCode,
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
    source: input.source,
    metadata,
    dedupeKey: buildTaskDedupeKey({
      plantId: input.plant.plantId,
      type: input.type,
      dueDate: input.dueDate,
      source: input.source,
      reasonCode: input.reasonCode,
    }),
  };
}

function schedulePhotoperiodSwitchTask(input: {
  plant: TaskEnginePlantInput;
  milestones: PhaseMilestoneDraft[];
  rangeStart: string;
  rangeEnd: string;
  resolveTaskCopy: ResolveTaskCopy;
}): TaskDraft[] {
  if (input.plant.seedType !== 'photoperiod') return [];
  const floweringMilestone = input.milestones.find(
    (item) => item.phase === 'flowering'
  );
  if (!floweringMilestone) return [];
  if (floweringMilestone.actualStartDate) return [];

  const dueDate = floweringMilestone.projectedStartDate;
  if (dueDate < input.rangeStart || dueDate > input.rangeEnd) return [];

  return [
    buildTaskDraft({
      plant: input.plant,
      type: 'cycle-switch',
      dueDate,
      phase: 'vegetative',
      source: 'generator',
      resolveTaskCopy: input.resolveTaskCopy,
    }),
  ];
}

function scheduleSativaWarningTask(input: {
  plant: TaskEnginePlantInput;
  milestones: PhaseMilestoneDraft[];
  rangeStart: string;
  rangeEnd: string;
  resolveTaskCopy: ResolveTaskCopy;
}): TaskDraft[] {
  if (input.plant.strainDominance !== 'Sativa') return [];
  const floweringMilestone = input.milestones.find(
    (item) => item.phase === 'flowering'
  );
  if (!floweringMilestone) return [];

  const dueDate = toIsoDate(
    addDays(parseIsoDate(floweringMilestone.projectedStartDate), -7)
  );
  if (dueDate < input.rangeStart || dueDate > input.rangeEnd) return [];

  return [
    buildTaskDraft({
      plant: input.plant,
      type: 'sativa-stretch-warning',
      dueDate,
      phase: 'vegetative',
      source: 'generator',
      resolveTaskCopy: input.resolveTaskCopy,
      reasonCode: 'sativa-prep',
    }),
  ];
}

function uniqueTaskDrafts(tasks: TaskDraft[]): TaskDraft[] {
  const seen = new Set<string>();
  const deduped: TaskDraft[] = [];

  for (const task of tasks) {
    if (seen.has(task.dedupeKey)) continue;
    seen.add(task.dedupeKey);
    deduped.push(task);
  }

  return deduped;
}

export function generateRollingTasks(input: {
  plant: TaskEnginePlantInput;
  milestones: PhaseMilestoneDraft[];
  rangeStart: string;
  rangeEnd: string;
  resolveTaskCopy?: ResolveTaskCopy;
}): TaskDraft[] {
  const resolveTaskCopy = input.resolveTaskCopy ?? resolveDefaultTaskCopy;
  const cadence = computeCadenceProfile({
    medium: input.plant.medium,
    potSize: input.plant.potSize,
    environment: input.plant.environment,
  });

  const start = parseIsoDate(input.rangeStart);
  const end = parseIsoDate(input.rangeEnd);
  const tasks: TaskDraft[] = [];

  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor = addDays(cursor, 1)
  ) {
    const dueDate = toIsoDate(cursor);
    const daysFromStart = daysBetween(input.plant.startDate, dueDate);
    const phaseMilestone = resolvePhaseMilestoneForDate(
      input.milestones,
      dueDate
    );
    if (!phaseMilestone) continue;
    const phase = phaseMilestone.phase;
    const phaseStartIsoDate = phaseStartDate(phaseMilestone);
    const daysFromPhaseStart = daysBetween(phaseStartIsoDate, dueDate);
    const wateringEveryDays = resolvePhaseAdjustedCadenceEveryDays({
      baseEveryDays: cadence.wateringEveryDays,
      phase,
      maxEveryDays: MAX_WATERING_INTERVAL_DAYS,
    });
    const feedingEveryDays = resolvePhaseAdjustedCadenceEveryDays({
      baseEveryDays: cadence.feedingEveryDays,
      phase,
    });
    const flushWindow = isInFlushWindow({
      milestones: input.milestones,
      dueDate,
    });

    if (isCadenceHit(daysFromPhaseStart, wateringEveryDays)) {
      tasks.push(
        buildTaskDraft({
          plant: input.plant,
          type: flushWindow ? 'flush-water-only' : 'water',
          dueDate,
          phase,
          source: 'generator',
          resolveTaskCopy,
        })
      );
    }

    if (
      daysFromStart > 0 &&
      isCadenceHit(daysFromStart, HEALTH_CHECK_REMINDER_EVERY_DAYS)
    ) {
      tasks.push(
        buildTaskDraft({
          plant: input.plant,
          type: 'health-check-reminder',
          dueDate,
          phase,
          source: 'generator',
          resolveTaskCopy,
        })
      );
    }

    if (!flushWindow && isCadenceHit(daysFromPhaseStart, feedingEveryDays)) {
      tasks.push(
        buildTaskDraft({
          plant: input.plant,
          type: 'feed',
          dueDate,
          phase,
          source: 'generator',
          resolveTaskCopy,
        })
      );
    }

    if (input.plant.environment === 'Outdoor') {
      if (isCadenceHit(daysFromStart, cadence.environmentEveryDays)) {
        tasks.push(
          buildTaskDraft({
            plant: input.plant,
            type: 'weather-protection',
            dueDate,
            phase,
            source: 'generator',
            resolveTaskCopy,
          })
        );
      }
      if (isCadenceHit(daysFromStart, cadence.pestEveryDays)) {
        tasks.push(
          buildTaskDraft({
            plant: input.plant,
            type: 'pest-check',
            dueDate,
            phase,
            source: 'generator',
            resolveTaskCopy,
          })
        );
      }
    } else if (isCadenceHit(daysFromStart, cadence.environmentEveryDays)) {
      tasks.push(
        buildTaskDraft({
          plant: input.plant,
          type: 'environment-check',
          dueDate,
          phase,
          source: 'generator',
          resolveTaskCopy,
        })
      );
    }

    if (
      cadence.includePhChecks &&
      isCadenceHit(daysFromPhaseStart, cadence.phCheckEveryDays)
    ) {
      tasks.push(
        buildTaskDraft({
          plant: input.plant,
          type: 'ph-check',
          dueDate,
          phase,
          source: 'generator',
          resolveTaskCopy,
        })
      );
    }
  }

  tasks.push(
    ...schedulePhotoperiodSwitchTask({
      plant: input.plant,
      milestones: input.milestones,
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
      resolveTaskCopy,
    }),
    ...scheduleSativaWarningTask({
      plant: input.plant,
      milestones: input.milestones,
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
      resolveTaskCopy,
    })
  );

  return uniqueTaskDrafts(tasks);
}
