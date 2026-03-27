import { Droplets, FlaskConical } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type CareScheduleProps = {
  wateringCadenceDays?: number;
  feedingCadenceDays?: number;
  className?: string;
  testID?: string;
};

export function CareSchedule({
  wateringCadenceDays,
  feedingCadenceDays,
  className,
  testID,
}: CareScheduleProps): React.ReactElement {
  const { t } = useTranslation('garden');

  return (
    <View className={cn('', className)} testID={testID}>
      <Text className="mb-4 px-1 text-2xl font-bold text-text dark:text-text-primary-dark">
        {t('plantDetail.careSchedule')}
      </Text>
      <View className="flex-row gap-4">
        {/* Water card */}
        <View className="flex-1 rounded-2xl border-l-4 border-l-blue-400 bg-white p-5 shadow-sm dark:bg-dark-bg-elevated">
          <View className="mb-1 flex-row items-center gap-2">
            <Droplets size={20} color="#60A5FA" />
            <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
              {t('plantDetail.water')}
            </Text>
          </View>
          <Text className="text-base font-bold text-danger dark:text-error-dark">
            {t('plantDetail.dueToday')}
          </Text>
          {wateringCadenceDays ? (
            <Text className="mt-1 text-base text-text-muted dark:text-text-muted-dark">
              {t('plantDetail.inDays', { count: wateringCadenceDays })}
            </Text>
          ) : null}
        </View>

        {/* Feed card */}
        <View className="flex-1 rounded-2xl border-l-4 border-l-green-400 bg-white p-5 shadow-sm dark:bg-dark-bg-elevated">
          <View className="mb-1 flex-row items-center gap-2">
            <FlaskConical size={20} color="#4ADE80" />
            <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
              {t('plantDetail.feed')}
            </Text>
          </View>
          <Text className="text-base font-bold text-text dark:text-text-secondary-dark">
            {feedingCadenceDays
              ? t('plantDetail.inDays', { count: feedingCadenceDays })
              : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}
