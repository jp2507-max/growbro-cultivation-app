import type { ResolveTaskCopy } from '@/src/lib/task-engine/task-generator';
import type { MilestonePhase, TaskType } from '@/src/lib/task-engine/types';

type Translate = (key: string, options?: Record<string, unknown>) => string;

function translatePhase(t: Translate, phase: MilestonePhase): string {
  if (phase === 'vegetative') return t('add-plant:step2.phase.vegetative');
  if (phase === 'flowering') return t('add-plant:step2.phase.flowering');
  return t('add-plant:step2.phase.seedling');
}

function translateMedium(t: Translate, medium: string): string {
  if (medium === 'Coco') return t('add-plant:step2.mediumOptions.coco');
  if (medium === 'Hydro') return t('add-plant:step2.mediumOptions.hydro');
  if (medium === 'Soilless') return t('add-plant:step2.mediumOptions.soilless');
  if (medium === 'Other') return t('add-plant:step2.mediumOptions.other');
  return t('add-plant:step2.mediumOptions.soil');
}

function translateEnvironment(t: Translate, environment: string): string {
  if (environment === 'Outdoor') return t('add-plant:step2.outdoor');
  if (environment === 'Greenhouse') return t('add-plant:step2.greenhouse');
  return t('add-plant:step2.indoor');
}

function translateTaskEngineCopy(
  t: Translate,
  type: TaskType
): { title: string; subtitle: string } {
  switch (type) {
    case 'health-check-reminder':
      return {
        title: t('garden:healthCheck.taskCopy.healthcheckreminder.title'),
        subtitle: t('garden:healthCheck.taskCopy.healthcheckreminder.subtitle'),
      };
    case 'ph-check':
      return {
        title: t('garden:healthCheck.taskCopy.phcheck.title'),
        subtitle: t('garden:healthCheck.taskCopy.phcheck.subtitle'),
      };
    case 'cycle-switch':
      return {
        title: t('garden:healthCheck.taskCopy.cycleswitch.title'),
        subtitle: t('garden:healthCheck.taskCopy.cycleswitch.subtitle'),
      };
    case 'weather-protection':
      return {
        title: t('garden:healthCheck.taskCopy.weatherprotection.title'),
        subtitle: t('garden:healthCheck.taskCopy.weatherprotection.subtitle'),
      };
    case 'pest-check':
      return {
        title: t('garden:healthCheck.taskCopy.pestcheck.title'),
        subtitle: t('garden:healthCheck.taskCopy.pestcheck.subtitle'),
      };
    case 'sativa-stretch-warning':
      return {
        title: t('garden:healthCheck.taskCopy.sativastretchwarning.title'),
        subtitle: t(
          'garden:healthCheck.taskCopy.sativastretchwarning.subtitle'
        ),
      };
    case 'recovery-dryout':
      return {
        title: t('garden:healthCheck.taskCopy.recoverydryout.title'),
        subtitle: t('garden:healthCheck.taskCopy.recoverydryout.subtitle'),
      };
    case 'flush-water-only':
      return {
        title: t('garden:healthCheck.taskCopy.flushwateronly.title'),
        subtitle: t('garden:healthCheck.taskCopy.flushwateronly.subtitle'),
      };
    case 'health-warning':
      return {
        title: t('garden:healthCheck.taskCopy.healthwarning.title'),
        subtitle: t('garden:healthCheck.taskCopy.healthwarning.subtitle'),
      };
    default:
      return {
        title: t('add-plant:tasks.environment.title'),
        subtitle: t('add-plant:tasks.environment.subtitle', {
          environment: t('add-plant:step2.indoor'),
        }),
      };
  }
}

export function createTaskCopyResolver(t: Translate): ResolveTaskCopy {
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
