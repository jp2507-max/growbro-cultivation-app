import React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type LatestNoteProps = {
  note?: string;
  className?: string;
  testID?: string;
};

export function LatestNote({
  note,
  className,
  testID,
}: LatestNoteProps): React.ReactElement | null {
  const { t } = useTranslation('garden');

  if (!note) return null;

  return (
    <View
      className={cn(
        'relative overflow-hidden rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm dark:border-yellow-900/30 dark:bg-yellow-900/20',
        className
      )}
      testID={testID}
    >
      {/* Left accent bar */}
      <View className="absolute bottom-0 left-0 top-0 w-1 bg-yellow-400" />

      <Text className="mb-3 text-lg font-bold uppercase tracking-wider text-yellow-800 dark:text-yellow-200">
        {t('plantDetail.latestNote')}
      </Text>
      <Text className="text-lg leading-8 text-text dark:text-yellow-100">
        {note}
      </Text>
    </View>
  );
}
