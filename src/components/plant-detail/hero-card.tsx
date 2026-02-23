import React from 'react';
import { useTranslation } from 'react-i18next';

import { AnimatedProgressBar } from '@/src/components/ui/animated-progress-bar';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';
import { Image } from '@/src/tw/image';

type HeroCardProps = {
  imageUrl?: string;
  strainType: string;
  sourceType?: string;
  phase: string;
  day: number;
  readyPercent: number;
  estHarvestDate?: string;
  className?: string;
  testID?: string;
};

export function HeroCard({
  imageUrl,
  strainType,
  sourceType,
  phase,
  day,
  readyPercent,
  estHarvestDate,
  className,
  testID,
}: HeroCardProps): React.ReactElement {
  const { t } = useTranslation('garden');

  return (
    <View
      className={cn(
        'overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-dark-bg-elevated',
        className
      )}
      testID={testID}
    >
      {/* Hero image */}
      {imageUrl ? (
        <View className="relative h-56 w-full">
          <Image
            source={imageUrl}
            className="h-full w-full object-cover"
            accessibilityLabel={phase}
          />
          <View className="absolute left-4 top-4 flex-row gap-2">
            <View className="rounded-full bg-white/90 px-3 py-1 dark:bg-black/60">
              <Text className="text-xs font-bold uppercase tracking-wider text-text dark:text-white">
                {strainType}
              </Text>
            </View>
            {sourceType ? (
              <View className="rounded-full bg-primary/90 px-3 py-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-white">
                  {sourceType}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Info section */}
      <View className="p-5">
        <View className="mb-2 flex-row items-end justify-between">
          <View>
            <Text className="text-sm font-medium uppercase tracking-wide text-text-muted dark:text-text-muted-dark">
              {t('plantDetail.floweringStage')}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-text dark:text-text-primary-dark">
              {t('plantDetail.dayCount', { day })}
            </Text>
          </View>
          <Text className="text-lg font-bold text-primary dark:text-primary-bright">
            {readyPercent}%
          </Text>
        </View>

        <AnimatedProgressBar
          value={readyPercent / 100}
          trackClassName="h-3"
          durationMs={600}
        />

        {estHarvestDate ? (
          <Text className="mt-2 text-right text-xs font-medium text-text-muted dark:text-text-muted-dark">
            {t('plantDetail.estHarvest', { date: estHarvestDate })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
