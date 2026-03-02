import type {
  GrowEnvironment,
  GrowMedium,
  SeedType,
  StrainDominance,
  TaskEnginePlantInput,
} from '@/src/lib/task-engine/types';

export function normalizeSeedType(seedType: string | undefined): SeedType {
  if (seedType === 'autoflower' || seedType === 'photoperiod') return seedType;
  return 'photoperiod';
}

export function normalizeGrowMedium(medium: string | undefined): GrowMedium {
  if (medium === 'Coco') return 'Coco';
  if (medium === 'Hydro') return 'Hydro';
  if (medium === 'Soilless') return 'Soilless';
  if (medium === 'Other') return 'Other';
  return 'Soil';
}

export function normalizeGrowEnvironment(
  environment: string | undefined
): GrowEnvironment {
  if (environment === 'Outdoor') return 'Outdoor';
  if (environment === 'Greenhouse') return 'Greenhouse';
  return 'Indoor';
}

export function normalizeStrainDominance(
  strainType: string | undefined
): StrainDominance {
  if (strainType === 'Indica') return 'Indica';
  if (strainType === 'Sativa') return 'Sativa';
  return 'Hybrid';
}

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTaskEnginePlantInput(input: {
  plantId: string;
  ownerId: string;
  startDate?: string;
  reminderTimeLocal?: string;
  seedType?: string;
  medium?: string;
  potSize?: number;
  environment?: string;
  strainType?: string;
  fallbackStartDate?: string;
  fallbackReminderTimeLocal?: string;
  fallbackPotSize?: number;
}): TaskEnginePlantInput {
  return {
    plantId: input.plantId,
    ownerId: input.ownerId,
    startDate: input.startDate ?? input.fallbackStartDate ?? todayIsoDate(),
    reminderTimeLocal:
      input.reminderTimeLocal ?? input.fallbackReminderTimeLocal ?? '09:00',
    seedType: normalizeSeedType(input.seedType),
    medium: normalizeGrowMedium(input.medium),
    potSize: input.potSize ?? input.fallbackPotSize ?? 10,
    environment: normalizeGrowEnvironment(input.environment),
    strainDominance: normalizeStrainDominance(input.strainType),
  };
}
