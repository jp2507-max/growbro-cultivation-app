import { Camera, FileEdit, Heart } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';

type BottomActionBarProps = {
  onAddPhoto: () => void;
  onHealthCheck: () => void;
  onLogEntry: () => void;
  className?: string;
  testID?: string;
};

export function BottomActionBar({
  onAddPhoto,
  onHealthCheck,
  onLogEntry,
  className,
  testID,
}: BottomActionBarProps): React.ReactElement {
  const { t } = useTranslation('garden');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className={cn('flex-row items-center gap-2.5 px-4 pb-1', className)}
      testID={testID}
    >
      {/* Add Photo — compact icon button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('plantDetail.addPhoto')}
        accessibilityHint={t('plantDetail.addPhoto')}
        className="size-11 items-center justify-center rounded-xl border border-border bg-white active:opacity-80 dark:border-dark-border dark:bg-dark-bg-elevated"
        onPress={onAddPhoto}
        testID="plant-detail-add-photo"
      >
        <Camera
          size={20}
          color={isDark ? Colors.textSecondaryDark : Colors.textSecondary}
        />
      </Pressable>

      {/* Health Check — secondary action */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('plantDetail.healthCheck')}
        accessibilityHint={t('plantDetail.healthCheck')}
        className="size-11 items-center justify-center rounded-xl border border-border bg-white active:opacity-80 dark:border-dark-border dark:bg-dark-bg-elevated"
        onPress={onHealthCheck}
        testID="plant-detail-health-check"
      >
        <Heart
          size={20}
          color={isDark ? Colors.textSecondaryDark : Colors.textSecondary}
        />
      </Pressable>

      {/* Log Entry — primary CTA */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('plantDetail.logEntry')}
        accessibilityHint={t('plantDetail.logEntry')}
        className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-80 dark:bg-primary-bright"
        onPress={onLogEntry}
        testID="plant-detail-log-entry"
      >
        <FileEdit size={18} color={isDark ? Colors.darkBg : '#ffffff'} />
        <Text className="text-base font-bold text-white dark:text-on-primary-dark">
          {t('plantDetail.logEntry')}
        </Text>
      </Pressable>
    </View>
  );
}
