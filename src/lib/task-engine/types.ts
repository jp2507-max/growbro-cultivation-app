import { z } from 'zod';

export const TASK_TYPES = [
  'water',
  'feed',
  'environment-check',
  'health-check-reminder',
  'ph-check',
  'cycle-switch',
  'weather-protection',
  'pest-check',
  'sativa-stretch-warning',
  'recovery-dryout',
  'flush-water-only',
  'health-warning',
] as const;

export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = [
  'planned',
  'completed',
  'cancelled',
  'superseded',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_SOURCES = ['generator', 'mutator', 'manual'] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];

export const MILESTONE_PHASES = [
  'seedling',
  'vegetative',
  'flowering',
  'harvest',
] as const;

export type MilestonePhase = (typeof MILESTONE_PHASES)[number];

export const DIAGNOSIS_CODES = [
  'all-clear',
  'overwatering',
  'underwatering',
  'nitrogen-deficiency',
  'nutrient-burn',
  'stunted-growth',
  'sativa-prep',
] as const;

export type DiagnosisCode = (typeof DIAGNOSIS_CODES)[number];

export const HEALTH_CHECK_OUTCOMES = ['all-clear', 'issues-found'] as const;
export type HealthCheckOutcome = (typeof HEALTH_CHECK_OUTCOMES)[number];

export const SEED_TYPES = ['autoflower', 'photoperiod'] as const;
export type SeedType = (typeof SEED_TYPES)[number];

export const WATERING_STATES = ['heavy-wet', 'light-dry'] as const;
export type WateringState = (typeof WATERING_STATES)[number];

export const GROW_ENVIRONMENTS = ['Indoor', 'Outdoor', 'Greenhouse'] as const;
export type GrowEnvironment = (typeof GROW_ENVIRONMENTS)[number];

export const GROW_MEDIA = [
  'Soil',
  'Coco',
  'Hydro',
  'Soilless',
  'Other',
] as const;
export type GrowMedium = (typeof GROW_MEDIA)[number];

export const STRAIN_DOMINANCE_VALUES = ['Indica', 'Sativa', 'Hybrid'] as const;
export type StrainDominance = (typeof STRAIN_DOMINANCE_VALUES)[number];

export type TaskMetadata = {
  phase?: MilestonePhase;
  source: TaskSource;
  reasonCode?: DiagnosisCode;
  dosageAdjustmentPct?: number;
  actionGroupId?: string;
  healthCheckId?: string;
};

export type TaskDraft = {
  title: string;
  subtitle?: string;
  dueDate: string;
  dueAt: number;
  dueTime?: string;
  icon?: string;
  type: TaskType;
  status: TaskStatus;
  source: TaskSource;
  metadata: TaskMetadata;
  dedupeKey: string;
};

export type PhaseMilestoneDraft = {
  phase: MilestonePhase;
  actualStartDate?: string;
  projectedStartDate: string;
  projectedEndDate: string;
  isFlexible: boolean;
  version: number;
};

export const PHASE_CADENCE_MULTIPLIERS: Record<MilestonePhase, number> = {
  seedling: 0.3,
  vegetative: 1,
  flowering: 1.5,
  harvest: 0.5,
};

export type CadenceProfile = {
  wateringEveryDays: number;
  feedingEveryDays: number;
  includePhChecks: boolean;
  phCheckEveryDays: number;
  environmentEveryDays: number;
  pestEveryDays: number;
};

export type TaskEnginePlantInput = {
  plantId: string;
  ownerId: string;
  startDate: string;
  reminderTimeLocal: string;
  seedType: SeedType;
  medium: GrowMedium;
  potSize: number;
  environment: GrowEnvironment;
  strainDominance: StrainDominance;
};

export type WeeklyHealthCheckInput = {
  checkDate: string;
  wateringIssues: {
    hasDroopingLeaves: boolean;
    potWeightState?: WateringState;
  };
  nutrientIssues: {
    yellowingBottomLeaves: boolean;
    burntCrispyTips: boolean;
  };
  developmentIssues: {
    hasStuntedGrowth: boolean;
  };
};

export type SkippedDiagnosis = {
  code: DiagnosisCode;
  reason: string;
};

export type TaskMutationPlan = {
  diagnoses: DiagnosisCode[];
  supersedeTaskIds: string[];
  createTasks: TaskDraft[];
  milestoneShiftDays: number;
  /** Diagnoses that couldn't produce mutations (no target task found, or superseded by higher-priority diagnosis). */
  skippedDiagnoses: SkippedDiagnosis[];
  /** Diagnosis codes that competed for the same target task; higher-severity won. */
  conflictingDiagnoses: DiagnosisCode[];
};

export const taskMetadataSchema = z.object({
  phase: z.enum(MILESTONE_PHASES).optional(),
  source: z.enum(TASK_SOURCES),
  reasonCode: z.enum(DIAGNOSIS_CODES).optional(),
  dosageAdjustmentPct: z.number().finite().optional(),
  actionGroupId: z.string().min(1).optional(),
  healthCheckId: z.string().min(1).optional(),
});

export const weeklyHealthCheckInputSchema = z
  .object({
    checkDate: z.string().min(1, 'validation.required'),
    wateringIssues: z.object({
      hasDroopingLeaves: z.boolean(),
      potWeightState: z.enum(WATERING_STATES).optional(),
    }),
    nutrientIssues: z.object({
      yellowingBottomLeaves: z.boolean(),
      burntCrispyTips: z.boolean(),
    }),
    developmentIssues: z.object({
      hasStuntedGrowth: z.boolean(),
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.wateringIssues.hasDroopingLeaves &&
      !data.wateringIssues.potWeightState
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.required',
        path: ['wateringIssues', 'potWeightState'],
      });
    }
  });

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskTypeSchema = z.enum(TASK_TYPES);
