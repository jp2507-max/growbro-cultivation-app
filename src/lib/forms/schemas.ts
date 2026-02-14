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
      { message: 'validation.invalidWeight' }
    ),
  dryWeight: z.string().optional(),
  notes: z.string().optional(),
  quality: z.enum(QUALITY_OPTIONS),
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

const STRAIN_TYPES = ['Indica', 'Sativa', 'Hybrid'] as const;
const ENVIRONMENTS = ['Indoor', 'Outdoor'] as const;

export const addPlantStep1Schema = z.object({
  plantName: z.string().min(1, 'validation.required'),
  strainType: z.enum(STRAIN_TYPES, {
    error: 'validation.required',
  }),
});

export type AddPlantStep1Data = z.infer<typeof addPlantStep1Schema>;

export const addPlantStep2Schema = z.object({
  environment: z.enum(ENVIRONMENTS, {
    error: 'validation.required',
  }),
});

export type AddPlantStep2Data = z.infer<typeof addPlantStep2Schema>;

export const addPlantSchema = addPlantStep1Schema.merge(addPlantStep2Schema);

export type AddPlantFormData = z.infer<typeof addPlantSchema>;
