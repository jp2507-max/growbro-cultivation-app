import { Droplets, FlaskConical, Sun, Thermometer } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type StatusVariant = 'good' | 'ideal' | 'check';

const STATUS_BG: Record<StatusVariant, string> = {
  good: 'bg-border dark:bg-dark-bg-card',
  ideal: 'bg-border dark:bg-dark-bg-card',
  check: 'bg-warning/15 dark:bg-warning-dark/20',
};

const STATUS_TEXT: Record<StatusVariant, string> = {
  good: 'text-primary dark:text-primary-bright',
  ideal: 'text-primary dark:text-primary-bright',
  check: 'text-warning dark:text-warning-dark',
};

type EnvironmentCardProps = {
  icon: React.ReactNode;
  status: string;
  statusVariant: StatusVariant;
  value: string;
  label: string;
};

function EnvironmentCard({
  icon,
  status,
  statusVariant,
  value,
  label,
}: EnvironmentCardProps): React.ReactElement {
  return (
    <View className="aspect-[1.4] flex-col justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-dark-bg-elevated">
      <View className="flex-row items-start justify-between">
        {icon}
        <View className={cn('rounded px-2 py-0.5', STATUS_BG[statusVariant])}>
          <Text className={cn('text-xs font-bold', STATUS_TEXT[statusVariant])}>
            {status}
          </Text>
        </View>
      </View>
      <View>
        <Text className="text-2xl font-bold text-text dark:text-text-primary-dark">
          {value}
        </Text>
        <Text className="text-xs text-text-muted dark:text-text-muted-dark">
          {label}
        </Text>
      </View>
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
}: EnvironmentGridProps): React.ReactElement {
  const { t } = useTranslation('garden');

  return (
    <View className={cn('', className)} testID={testID}>
      {/* Section header */}
      <View className="mb-3 flex-row items-center justify-between px-1">
        <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
          {t('plantDetail.environment')}
        </Text>
        <View className="flex-row items-center gap-1">
          <View className="size-2 rounded-full bg-primary dark:bg-primary-bright" />
          <Text className="text-xs text-text-muted dark:text-text-muted-dark">
            {t('plantDetail.live')}
          </Text>
        </View>
      </View>

      {/* 2x2 grid */}
      <View className="flex-row gap-3">
        <View className="flex-1 gap-3">
          <EnvironmentCard
            icon={<Thermometer size={22} color={Colors.tempOrange} />}
            status={t('plantDetail.statusGood')}
            statusVariant="good"
            value={temp != null ? `${temp}°C` : '—'}
            label={t('plantDetail.temperature')}
          />
          <EnvironmentCard
            icon={<Sun size={22} color="#EAB308" />}
            status={t('plantDetail.statusOn')}
            statusVariant="good"
            value={lightSchedule ?? '—'}
            label={t('plantDetail.lightCycle')}
          />
        </View>
        <View className="flex-1 gap-3">
          <EnvironmentCard
            icon={<Droplets size={22} color="#60A5FA" />}
            status={t('plantDetail.statusIdeal')}
            statusVariant="ideal"
            value={humidity != null ? `${humidity}%` : '—'}
            label={t('plantDetail.humidity')}
          />
          <EnvironmentCard
            icon={<FlaskConical size={22} color={Colors.phPurple} />}
            status={t('plantDetail.statusCheck')}
            statusVariant="check"
            value={ph != null ? `${ph}` : '—'}
            label={t('plantDetail.phLevel')}
          />
        </View>
      </View>
    </View>
  );
}
