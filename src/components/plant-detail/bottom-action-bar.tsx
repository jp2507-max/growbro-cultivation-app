import { Camera, FileEdit } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';

type BottomActionBarProps = {
  onAddPhoto: () => void;
  onLogEntry: () => void;
  className?: string;
  testID?: string;
};

export function BottomActionBar({
  onAddPhoto,
  onLogEntry,
  className,
  testID,
}: BottomActionBarProps): React.ReactElement {
  const { t } = useTranslation('garden');

  return (
    <View
      className={cn('flex-row gap-4 px-6 pb-2 pt-3', className)}
      testID={testID}
    >
      {/* Add Photo */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('plantDetail.addPhoto')}
        className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-white shadow-sm active:opacity-80 dark:border-dark-border dark:bg-dark-bg-elevated"
        onPress={onAddPhoto}
        testID="plant-detail-add-photo"
      >
        <Camera size={20} color="#6b7280" />
        <Text className="font-bold text-text dark:text-text-primary-dark">
          {t('plantDetail.addPhoto')}
        </Text>
      </Pressable>

      {/* Log Entry */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('plantDetail.logEntry')}
        className="h-14 flex-[2] flex-row items-center justify-center gap-2 rounded-xl bg-primary shadow-lg active:opacity-80 dark:bg-primary-bright"
        onPress={onLogEntry}
        testID="plant-detail-log-entry"
      >
        <FileEdit size={20} color="#ffffff" />
        <Text className="font-bold text-white dark:text-on-primary-dark">
          {t('plantDetail.logEntry')}
        </Text>
      </Pressable>
    </View>
  );
}
