import { Droplets, FlaskConical, Sun, Thermometer } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type EnvironmentCardProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

function EnvironmentCard({
  icon,
  value,
  label,
}: EnvironmentCardProps): React.ReactElement {
  return (
    <View className="flex-1 flex-col gap-1 p-3.5 rounded-2xl bg-white shadow-sm dark:bg-dark-bg-elevated">
      <View className="mb-1">{icon}</View>
      <Text className="text-2xl font-bold leading-tight text-text dark:text-text-primary-dark">
        {value}
      </Text>
      <Text className="text-xs text-text-muted dark:text-text-muted-dark">
        {label}
      </Text>
    </View>
  );
}

type EnvironmentGridProps = {
  temp?: number;
  humidity?: number;
  lightSchedule?: string;
  ph?: number;
  className?: string;
  testID?: string;
};

export function EnvironmentGrid({
  temp,
  humidity,
  lightSchedule,
  ph,
  className,
  testID,
}: EnvironmentGridProps): React.ReactElement | null {
  const { t } = useTranslation('garden');

  // Hide entire section if no target values exist
  const hasLightSchedule = Boolean(lightSchedule?.trim());
  const hasValues =
    temp != null || humidity != null || hasLightSchedule || ph != null;

  if (!hasValues) return null;

  return (
    <View className={cn(className)} testID={testID}>
      {/* Section header — no fake "Live" indicator */}
      <View className="mb-3 px-1">
        <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
          {t('plantDetail.targetConditions')}
        </Text>
      </View>

      {/* 2x2 grid */}
      <View className="flex-row gap-3">
        <View className="flex-1 gap-3">
          {temp != null ? (
            <EnvironmentCard
              icon={<Thermometer size={20} color={Colors.tempOrange} />}
              value={`${temp}°C`}
              label={t('plantDetail.temperature')}
            />
          ) : null}
          {hasLightSchedule ? (
            <EnvironmentCard
              icon={<Sun size={20} color="#EAB308" />}
              value={lightSchedule!}
              label={t('plantDetail.lightCycle')}
            />
          ) : null}
        </View>
        <View className="flex-1 gap-3">
          {humidity != null ? (
            <EnvironmentCard
              icon={<Droplets size={20} color="#60A5FA" />}
              value={`${humidity}%`}
              label={t('plantDetail.humidity')}
            />
          ) : null}
          {ph != null ? (
            <EnvironmentCard
              icon={<FlaskConical size={20} color={Colors.phPurple} />}
              value={`${ph}`}
              label={t('plantDetail.phLevel')}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}
