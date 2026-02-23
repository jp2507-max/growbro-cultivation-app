import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Plant } from '@/src/lib/instant';

type AddPlantInput = {
  name: string;
  strainName: string;
  strainId?: string;
  strainType: string;
  sourceType: string;
  environment: string;
  currentPhase: string;
  startDate: string;
  medium: string;
  containerSize: number;
  containerUnit: string;
  lightType?: string;
  lightSchedulePreset?: string;
  targetTempDay?: number;
  targetTempNight?: number;
  targetHumidity?: number;
  targetPhMin?: number;
  targetPhMax?: number;
  autoCreateTasks: boolean;
  wateringCadenceDays: number;
  feedingCadenceDays: number;
  reminderTimeLocal: string;
  notes?: string;
  imageUrl?: string;
  estimatedFloweringWeeks?: number;
  starterTasks?: {
    title: string;
    subtitle: string;
    icon: string;
    offsetDays: number;
  }[];
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function usePlants(): {
  plants: Plant[];
  isLoading: boolean;
  error: { message: string } | undefined;
  addPlant: (data: AddPlantInput) => Promise<unknown>;
  updatePlant: (
    plantId: string,
    data: Partial<Omit<Plant, 'id'>>
  ) => Promise<unknown>;
  deletePlant: (plantId: string) => Promise<unknown>;
} {
  const { profile } = useAuth();
  const { t } = useTranslation('add-plant');

  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          plants: {
            $: {
              where: {
                'owner.id': profile.id,
              },
            },
          },
        }
      : null
  );

  const addPlant = useCallback(
    (plantData: AddPlantInput) => {
      if (!profile) return Promise.reject(new Error('No profile'));

      const plantId = id();
      const transactions: Parameters<typeof db.transact>[0] = [
        db.tx.plants[plantId].update({
          name: plantData.name,
          strainName: plantData.strainName,
          strainId: plantData.strainId,
          strainType: plantData.strainType,
          sourceType: plantData.sourceType,
          environment: plantData.environment,
          medium: plantData.medium,
          containerSize: plantData.containerSize,
          containerUnit: plantData.containerUnit,
          lightType: plantData.lightType,
          lightSchedulePreset: plantData.lightSchedulePreset,
          sourceStartDate: plantData.startDate,
          day: 0,
          phase: plantData.currentPhase,
          weeksLeft: plantData.estimatedFloweringWeeks ?? 12,
          readyPercent: 0,
          tempDay: plantData.targetTempDay,
          tempNight: plantData.targetTempNight,
          temp:
            plantData.targetTempDay && plantData.targetTempNight
              ? (plantData.targetTempDay + plantData.targetTempNight) / 2
              : undefined,
          humidity: plantData.targetHumidity,
          phMin: plantData.targetPhMin,
          phMax: plantData.targetPhMax,
          ph:
            plantData.targetPhMin && plantData.targetPhMax
              ? (plantData.targetPhMin + plantData.targetPhMax) / 2
              : undefined,
          autoCreateTasks: plantData.autoCreateTasks,
          wateringCadenceDays: plantData.wateringCadenceDays,
          feedingCadenceDays: plantData.feedingCadenceDays,
          reminderTimeLocal: plantData.reminderTimeLocal,
          notes: plantData.notes,
          imageUrl: plantData.imageUrl,
          createdAt: Date.now(),
        }),
        db.tx.plants[plantId].link({ owner: profile.id }),
      ];

      if (plantData.autoCreateTasks) {
        const today = new Date();
        const starterTasks = plantData.starterTasks ?? [
          {
            title: t('tasks.water.title'),
            subtitle: t('tasks.water.subtitle', { medium: plantData.medium }),
            icon: 'droplets',
            offsetDays: plantData.wateringCadenceDays,
          },
          {
            title: t('tasks.feed.title'),
            subtitle: t('tasks.feed.subtitle', {
              phase: plantData.currentPhase,
            }),
            icon: 'flask',
            offsetDays: plantData.feedingCadenceDays,
          },
          {
            title: t('tasks.environment.title'),
            subtitle: t('tasks.environment.subtitle', {
              environment: plantData.environment,
            }),
            icon: 'sun',
            offsetDays: 1,
          },
          {
            title: t('tasks.log.title'),
            subtitle: t('tasks.log.subtitle'),
            icon: 'leaf',
            offsetDays: 7,
          },
        ];

        for (const task of starterTasks) {
          const taskId = id();
          const date = toIsoDate(addDays(today, task.offsetDays));
          transactions.push(
            db.tx.tasks[taskId].update({
              title: task.title,
              subtitle: task.subtitle,
              dueTime: plantData.reminderTimeLocal,
              completed: false,
              time: plantData.reminderTimeLocal,
              icon: task.icon,
              date,
              createdAt: Date.now(),
            })
          );
          transactions.push(db.tx.tasks[taskId].link({ owner: profile.id }));
          transactions.push(db.tx.tasks[taskId].link({ plant: plantId }));
        }
      }

      return db.transact(transactions);
    },
    [profile, t]
  );

  const updatePlant = useCallback(
    (plantId: string, updates: Partial<Omit<Plant, 'id'>>) => {
      return db.transact(db.tx.plants[plantId].update(updates));
    },
    []
  );

  const deletePlant = useCallback((plantId: string) => {
    return db.transact(db.tx.plants[plantId].delete());
  }, []);

  return {
    plants: data?.plants ?? [],
    isLoading,
    error,
    addPlant,
    updatePlant,
    deletePlant,
  };
}
