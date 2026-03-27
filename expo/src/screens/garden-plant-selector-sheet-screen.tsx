import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { CheckCircle2, Leaf, Sprout } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { IconCircle } from '@/src/components/ui/icon-circle';
import {
  GARDEN_PENDING_ACTION_STORAGE_KEY,
  SELECTED_PLANT_STORAGE_KEY,
} from '@/src/constants/garden';
import { usePlants } from '@/src/hooks/use-plants';
import { storage } from '@/src/lib/storage';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';

function getStoredPlantId(): string | null {
  return storage.getString(SELECTED_PLANT_STORAGE_KEY) ?? null;
}

export function GardenPlantSelectorSheetScreen(): React.ReactElement {
  const { t } = useTranslation('garden');
  const { t: tCommon } = useTranslation('common');
  const { plants } = usePlants();

  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(
    getStoredPlantId
  );

  React.useEffect(() => {
    if (plants.length === 0) return;

    const hasCurrentSelection = plants.some(
      (plant) => plant.id === selectedPlantId
    );
    if (hasCurrentSelection) return;

    const fallbackId = plants[0]?.id ?? null;
    setSelectedPlantId(fallbackId);
    if (fallbackId) {
      storage.set(SELECTED_PLANT_STORAGE_KEY, fallbackId);
    }
  }, [plants, selectedPlantId]);

  const activePlantId = useMemo(
    () => selectedPlantId ?? plants[0]?.id ?? null,
    [plants, selectedPlantId]
  );

  const handleSelectPlant = useCallback((plantId: string) => {
    setSelectedPlantId(plantId);
    storage.set(SELECTED_PLANT_STORAGE_KEY, plantId);
    const pendingAction = storage.getString(GARDEN_PENDING_ACTION_STORAGE_KEY);
    if (pendingAction) {
      storage.remove(GARDEN_PENDING_ACTION_STORAGE_KEY);
    }

    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, []);

  return (
    <View
      className="bg-background px-5 pb-8 pt-8 dark:bg-dark-bg"
      testID="plant-selector-sheet"
    >
      <View className="flex-row items-start gap-3">
        <View className="bg-primary-alpha-15 dark:bg-primary-alpha-30 size-16 items-center justify-center rounded-full">
          <IconCircle size="lg" className="bg-transparent">
            <Leaf size={22} color={Colors.primary} />
          </IconCircle>
        </View>
        <View className="flex-1 pr-1">
          <Text className="text-text dark:text-text-primary-dark text-[30px] font-extrabold tracking-tight">
            {t('plantSelector.title')}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark mt-1 text-base">
            {t('plantSelector.message')}
          </Text>
        </View>
      </View>

      <View className="mt-6 gap-2.5">
        {plants.map((plant) => {
          const isSelected = plant.id === activePlantId;

          return (
            <Pressable
              key={plant.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={cn(
                'rounded-2xl border px-4 py-3.5',
                isSelected
                  ? 'border-primary bg-primary-alpha-15 dark:bg-primary-alpha-30'
                  : 'border-border-light bg-card dark:border-dark-border dark:bg-dark-bg-card'
              )}
              onPress={() => handleSelectPlant(plant.id)}
              testID={`select-plant-${plant.id}`}
            >
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-text dark:text-text-primary-dark text-[17px] font-bold">
                    {plant.name}
                  </Text>
                  <Text className="text-text-secondary dark:text-text-secondary-dark mt-0.5 text-sm">
                    {t('phaseInfo', {
                      phase: plant.phase,
                      weeksLeft: plant.weeksLeft,
                    })}
                  </Text>
                </View>

                {isSelected ? (
                  <View className="items-center gap-1.5">
                    <CheckCircle2 size={20} color={Colors.primary} />
                    <Text className="text-primary dark:text-primary-bright text-[11px] font-bold">
                      {t('plantSelector.selectedLabel')}
                    </Text>
                  </View>
                ) : (
                  <IconCircle
                    size="sm"
                    className="bg-background dark:bg-dark-bg"
                  >
                    <Sprout size={16} color={Colors.textSecondary} />
                  </IconCircle>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        className="mt-5 items-center rounded-2xl border border-border-light px-3 py-3.5 dark:border-dark-border"
        onPress={() => router.back()}
      >
        <Text className="text-text dark:text-text-primary-dark text-base font-semibold">
          {tCommon('cancel')}
        </Text>
      </Pressable>
    </View>
  );
}
