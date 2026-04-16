import type { ResolveTaskCopy } from '@/src/lib/task-engine/task-generator';
import type { MilestonePhase, TaskType } from '@/src/lib/task-engine/types';

export type TranslateFn = (
  key: string,
  options?: Record<string, unknown>
) => string;

function translatePhase(t: TranslateFn, phase: MilestonePhase): string {
  if (phase === 'vegetative') return t('add-plant:step2.phase.vegetative');
  if (phase === 'flowering') return t('add-plant:step2.phase.flowering');
  if (phase === 'harvest') return t('add-plant:step2.phase.harvest');
  return t('add-plant:step2.phase.seedling');
}

function translateMedium(t: TranslateFn, medium: string): string {
  if (medium === 'Coco') return t('add-plant:step2.mediumOptions.coco');
  if (medium === 'Hydro') return t('add-plant:step2.mediumOptions.hydro');
  if (medium === 'Soilless') return t('add-plant:step2.mediumOptions.soilless');
  if (medium === 'Other') return t('add-plant:step2.mediumOptions.other');
  return t('add-plant:step2.mediumOptions.soil');
}

function translateEnvironment(t: TranslateFn, environment: string): string {
  if (environment === 'Outdoor') return t('add-plant:step2.outdoor');
  if (environment === 'Greenhouse') return t('add-plant:step2.greenhouse');
  return t('add-plant:step2.indoor');
}

function translateTaskEngineCopy(
  t: TranslateFn,
  type: TaskType
): { title: string; subtitle: string } {
  switch (type) {
    case 'health-check-reminder':
      return {
        title: t('garden:healthCheck.taskCopy.healthCheckReminder.title'),
        subtitle: t('garden:healthCheck.taskCopy.healthCheckReminder.subtitle'),
      };
    case 'ph-check':
      return {
        title: t('garden:healthCheck.taskCopy.phCheck.title'),
        subtitle: t('garden:healthCheck.taskCopy.phCheck.subtitle'),
      };
    case 'cycle-switch':
      return {
        title: t('garden:healthCheck.taskCopy.cycleSwitch.title'),
        subtitle: t('garden:healthCheck.taskCopy.cycleSwitch.subtitle'),
      };
    case 'weather-protection':
      return {
        title: t('garden:healthCheck.taskCopy.weatherProtection.title'),
        subtitle: t('garden:healthCheck.taskCopy.weatherProtection.subtitle'),
      };
    case 'pest-check':
      return {
        title: t('garden:healthCheck.taskCopy.pestCheck.title'),
        subtitle: t('garden:healthCheck.taskCopy.pestCheck.subtitle'),
      };
    case 'sativa-stretch-warning':
      return {
        title: t('garden:healthCheck.taskCopy.sativaStretchWarning.title'),
        subtitle: t(
          'garden:healthCheck.taskCopy.sativaStretchWarning.subtitle'
        ),
      };
    case 'recovery-dryout':
      return {
        title: t('garden:healthCheck.taskCopy.recoveryDryout.title'),
        subtitle: t('garden:healthCheck.taskCopy.recoveryDryout.subtitle'),
      };
    case 'flush-water-only':
      return {
        title: t('garden:healthCheck.taskCopy.flushWaterOnly.title'),
        subtitle: t('garden:healthCheck.taskCopy.flushWaterOnly.subtitle'),
      };
    case 'health-warning':
      return {
        title: t('garden:healthCheck.taskCopy.healthWarning.title'),
        subtitle: t('garden:healthCheck.taskCopy.healthWarning.subtitle'),
      };
    default: {
      console.warn(
        '[task-copy-resolver] Unhandled task type, using generic fallback:',
        type
      );
      return {
        title: t('add-plant:tasks.generic.title'),
        subtitle: t('add-plant:tasks.generic.subtitle'),
      };
    }
  }
}

export function createTaskCopyResolver(t: TranslateFn): ResolveTaskCopy {
  return ({ type, phase, medium, environment }) => {
    if (type === 'water') {
      return {
        title: t('add-plant:tasks.water.title'),
        subtitle: t('add-plant:tasks.water.subtitle', {
          medium: translateMedium(t, medium),
        }),
        icon: 'droplets',
      };
    }

    if (type === 'feed') {
      return {
        title: t('add-plant:tasks.feed.title'),
        subtitle: t('add-plant:tasks.feed.subtitle', {
          phase: translatePhase(t, phase),
        }),
        icon: 'flask',
      };
    }

    if (type === 'environment-check') {
      return {
        title: t('add-plant:tasks.environment.title'),
        subtitle: t('add-plant:tasks.environment.subtitle', {
          environment: translateEnvironment(t, environment),
        }),
        icon: 'sun',
      };
    }

    const fallback = translateTaskEngineCopy(t, type);
    return {
      title: fallback.title,
      subtitle: fallback.subtitle,
      icon:
        type === 'pest-check' ||
        type === 'health-warning' ||
        type === 'health-check-reminder'
          ? 'leaf'
          : 'sun',
    };
  };
}
