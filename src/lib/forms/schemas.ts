import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.required')
    .email('validation.invalidEmail'),
});

export type EmailFormData = z.infer<typeof emailSchema>;

export const codeSchema = z.object({
  code: z
    .string()
    .min(1, 'validation.required')
    .length(6, 'validation.codeLength'),
});

export type CodeFormData = z.infer<typeof codeSchema>;

export const nameSchema = z.object({
  name: z
    .string()
    .min(1, 'validation.required')
    .max(50, 'validation.nameTooLong'),
});

export type NameFormData = z.infer<typeof nameSchema>;

// ---------------------------------------------------------------------------
// Harvest schema
// ---------------------------------------------------------------------------

const QUALITY_OPTIONS = ['poor', 'good', 'great', 'premium'] as const;
const POST_HASHTAGS_PATTERN =
  /^$|^(?:#?[A-Za-z0-9_]{1,30})(?:\s+#?[A-Za-z0-9_]{1,30})*$/;

export const harvestSchema = z.object({
  wetWeight: z
    .string()
    .min(1, 'validation.required')
    .refine(
      (v) => {
        const n = Number(v);
        return !isNaN(n) && Number.isFinite(n) && n > 0;
      },
      { error: 'validation.invalidWeight' }
    ),
  dryWeight: z.string().optional(),
  notes: z.string().optional(),
  quality: z.enum(QUALITY_OPTIONS, {
    error: 'validation.required',
  }),
});

export type HarvestFormData = z.infer<typeof harvestSchema>;

// ---------------------------------------------------------------------------
// Create Post schema
// ---------------------------------------------------------------------------

export const createPostSchema = z.object({
  caption: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(500, 'validation.postCaptionTooLong'),
  hashtags: z
    .string()
    .trim()
    .max(120, 'validation.postHashtagsTooLong')
    .regex(POST_HASHTAGS_PATTERN, 'validation.postHashtagsInvalid')
    .optional(),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;

// ---------------------------------------------------------------------------
// Add Plant schema
// ---------------------------------------------------------------------------

export const STRAIN_TYPES = ['Indica', 'Sativa', 'Hybrid'] as const;
export const ENVIRONMENTS = ['Indoor', 'Outdoor', 'Greenhouse'] as const;
export const SOURCE_TYPES = ['Seed', 'Clone'] as const;
export const PHASE_TYPES = [
  'Germination',
  'Seedling',
  'Vegetative',
  'Flowering',
  'Drying',
  'Curing',
] as const;
export const MEDIUM_TYPES = [
  'Soil',
  'Coco',
  'Hydro',
  'Soilless',
  'Other',
] as const;
export const CONTAINER_UNITS = ['L', 'gal'] as const;
export const LIGHT_TYPES = [
  'LED',
  'HPS',
  'CMH',
  'Sun',
  'Mixed',
  'Unknown',
] as const;
export const LIGHT_SCHEDULE_PRESETS = [
  'Auto',
  '18-6',
  '20-4',
  '12-12',
  'Custom',
] as const;

function toMaybeNumber(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;

  return Number(trimmed);
}

const requiredPositiveNumberFromText = z.preprocess(
  toMaybeNumber,
  z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? 'validation.required'
          : 'validation.invalidNumber',
    })
    .positive('validation.invalidNumber')
);

const optionalNumberFromText = z.preprocess(
  toMaybeNumber,
  z.number({ error: 'validation.invalidNumber' }).optional()
);

const optionalPositiveIntFromText = z.preprocess(
  toMaybeNumber,
  z.number({ error: 'validation.invalidNumber' }).int().positive().optional()
);

export const addPlantStep1Schema = z.object({
  plantName: z
    .string()
    .trim()
    .min(2, 'validation.required')
    .max(40, 'validation.nameTooLong'),
  strainName: z.string().trim().min(1, 'validation.required'),
  strainId: z.string().optional(),
  estimatedFloweringWeeks: z.number().int().positive().optional(),
  strainType: z.enum(STRAIN_TYPES, {
    error: 'validation.required',
  }),
  sourceType: z.enum(SOURCE_TYPES, {
    error: 'validation.required',
  }),
});

export type AddPlantStep1Data = z.infer<typeof addPlantStep1Schema>;

export const addPlantStep2Schema = z.object({
  environment: z.enum(ENVIRONMENTS, {
    error: 'validation.required',
  }),
  currentPhase: z.enum(PHASE_TYPES, {
    error: 'validation.required',
  }),
  startDate: z.string().min(1, 'validation.required'),
  medium: z.enum(MEDIUM_TYPES, {
    error: 'validation.required',
  }),
  containerSize: requiredPositiveNumberFromText,
  containerUnit: z.enum(CONTAINER_UNITS, {
    error: 'validation.required',
  }),
});

export type AddPlantStep2Data = z.infer<typeof addPlantStep2Schema>;

export const addPlantStep3Schema = z.object({
  lightType: z.enum(LIGHT_TYPES).optional(),
  lightSchedulePreset: z.enum(LIGHT_SCHEDULE_PRESETS).optional(),
  targetTempDay: optionalNumberFromText,
  targetTempNight: optionalNumberFromText,
  targetHumidity: optionalNumberFromText,
  targetPhMin: optionalNumberFromText,
  targetPhMax: optionalNumberFromText,
});

export type AddPlantStep3Data = z.infer<typeof addPlantStep3Schema>;

export const addPlantStep4Schema = z.object({
  autoCreateTasks: z.boolean(),
  wateringCadenceDays: optionalPositiveIntFromText,
  feedingCadenceDays: optionalPositiveIntFromText,
  reminderTimeLocal: z.string().optional(),
  notes: z.string().max(500, 'validation.postCaptionTooLong').optional(),
  imageUrl: z.string().optional(),
});

export type AddPlantStep4Data = z.infer<typeof addPlantStep4Schema>;

export const addPlantSchema = addPlantStep1Schema
  .merge(addPlantStep2Schema)
  .merge(addPlantStep3Schema)
  .merge(addPlantStep4Schema)
  .superRefine((data, ctx) => {
    const needsLightFields =
      data.environment === 'Indoor' || data.environment === 'Greenhouse';

    if (needsLightFields && !data.lightType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.required',
        path: ['lightType'],
      });
    }

    if (needsLightFields && !data.lightSchedulePreset) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.required',
        path: ['lightSchedulePreset'],
      });
    }

    if (data.targetPhMin !== undefined && data.targetPhMax !== undefined) {
      if (data.targetPhMax < data.targetPhMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.invalidRange',
          path: ['targetPhMax'],
        });
      }
    }

    if (data.autoCreateTasks) {
      if (!data.wateringCadenceDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.required',
          path: ['wateringCadenceDays'],
        });
      }

      if (!data.feedingCadenceDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.required',
          path: ['feedingCadenceDays'],
        });
      }

      if (!data.reminderTimeLocal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'validation.required',
          path: ['reminderTimeLocal'],
        });
      }
    }
  });

export type AddPlantFormData = z.infer<typeof addPlantSchema>;
export type AddPlantFormInputData = z.input<typeof addPlantSchema>;
export type AddPlantSubmitData = z.output<typeof addPlantSchema>;
