import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Camera, FileEdit, Leaf } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { IconCircle } from '@/src/components/ui/icon-circle';
import {
  GARDEN_PENDING_ACTION_STORAGE_KEY,
  GARDEN_PENDING_ACTIONS,
  SELECTED_PLANT_STORAGE_KEY,
} from '@/src/constants/garden';
import { usePlants } from '@/src/hooks/use-plants';
import { ROUTES } from '@/src/lib/routes';
import { storage } from '@/src/lib/storage';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';

type ActionItem = {
  id: 'create-post' | 'update-photo' | 'open-scan';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  testID: string;
  onPress: () => void;
};

export function GardenLogActivitySheetScreen(): React.ReactElement {
  const { t } = useTranslation('garden');
  const { t: tCommon } = useTranslation('common');
  const { plants } = usePlants();
  const selectedPlantId = storage.getString(SELECTED_PLANT_STORAGE_KEY) ?? null;
  const activePlant =
    plants.find((plant) => plant.id === selectedPlantId) ?? plants[0] ?? null;

  const triggerLightHaptics = React.useCallback(() => {
    if (process.env.EXPO_OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const actionItems = useMemo<ActionItem[]>(
    () => [
      {
        id: 'create-post',
        title: t('logActivityActions.createPost'),
        subtitle: t('logActivityActions.createPostHint'),
        icon: <FileEdit size={18} color={Colors.primary} />,
        testID: 'log-action-create-post',
        onPress: () => {
          triggerLightHaptics();
          router.replace(ROUTES.COMMUNITY_CREATE_POST);
        },
      },
      {
        id: 'update-photo',
        title: t('logActivityActions.updatePhoto'),
        subtitle: t('logActivityActions.updatePhotoHint'),
        icon: <Camera size={18} color={Colors.primary} />,
        testID: 'log-action-update-photo',
        onPress: () => {
          triggerLightHaptics();
          storage.set(
            GARDEN_PENDING_ACTION_STORAGE_KEY,
            GARDEN_PENDING_ACTIONS.UPDATE_PHOTO
          );
          router.back();
        },
      },
      {
        id: 'open-scan',
        title: t('logActivityActions.openScan'),
        subtitle: t('logActivityActions.openScanHint'),
        icon: <Leaf size={18} color={Colors.primary} />,
        testID: 'log-action-open-scan',
        onPress: () => {
          triggerLightHaptics();
          router.replace(ROUTES.SCAN);
        },
      },
    ],
    [t, triggerLightHaptics]
  );

  return (
    <View
      className="bg-background px-5 pb-8 pt-8 dark:bg-dark-bg"
      testID="log-activity-sheet"
    >
      <View className="flex-row items-start gap-3">
        <View className="bg-primary-alpha-15 dark:bg-primary-alpha-30 size-16 items-center justify-center rounded-full">
          <IconCircle size="lg" className="bg-transparent">
            <FileEdit size={22} color={Colors.primary} />
          </IconCircle>
        </View>
        <View className="flex-1 pr-1">
          <Text className="text-text dark:text-text-primary-dark text-[30px] font-extrabold tracking-tight">
            {t('logActivityActions.title')}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark mt-1 text-base">
            {t('logActivityActions.message', {
              plantName: activePlant?.name ?? '',
            })}
          </Text>
        </View>
      </View>

      <View className="mt-6 gap-2.5">
        {actionItems.map((action) => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            className={cn(
              'rounded-2xl border border-border-light bg-card px-4 py-3.5 dark:border-dark-border dark:bg-dark-bg-card',
              'active:opacity-85'
            )}
            onPress={action.onPress}
            testID={action.testID}
          >
            <View className="flex-row items-center gap-3">
              <IconCircle
                size="md"
                className="bg-primary-alpha-15 dark:bg-primary-alpha-30"
              >
                {action.icon}
              </IconCircle>
              <View className="flex-1">
                <Text className="text-text dark:text-text-primary-dark text-[19px] font-bold">
                  {action.title}
                </Text>
                <Text className="text-text-secondary dark:text-text-secondary-dark mt-0.5 text-sm">
                  {action.subtitle}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
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
