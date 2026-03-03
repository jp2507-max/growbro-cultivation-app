import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Switch, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { Button } from '@/src/components/ui/button';
import { ScreenHeader } from '@/src/components/ui/screen-header';
import {
  AlreadySubmittedHealthCheckError,
  useWeeklyHealthCheck,
} from '@/src/hooks/use-weekly-health-check';
import {
  type WeeklyHealthCheckFormData,
  weeklyHealthCheckSchema,
} from '@/src/lib/forms/schemas';
import { todayIsoDate } from '@/src/lib/task-engine/date-utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';

function FieldCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <View className="rounded-2xl border border-border-light bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card">
      <Text className="mb-3 text-base font-bold text-text dark:text-text-primary-dark">
        {title}
      </Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  hint,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  hint: string;
}): React.ReactElement {
  const isDark = useColorScheme() === 'dark';
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-border-light px-3 py-3 dark:border-dark-border">
      <Text className="text-sm font-medium text-text dark:text-text-primary-dark">
        {label}
      </Text>
      <Switch
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: isDark ? Colors.darkBorderBright : Colors.borderLight,
          true: isDark ? Colors.primaryBright : Colors.primary,
        }}
        thumbColor={Colors.white}
      />
    </View>
  );
}

function WeightOption({
  label,
  selected,
  onPress,
  hint,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  hint: string;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`rounded-xl border px-3 py-2 ${selected ? 'border-primary bg-primary-alpha-15 dark:border-primary-bright dark:bg-primary-alpha-30' : 'border-border-light dark:border-dark-border'}`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-semibold ${selected ? 'text-primary dark:text-primary-bright' : 'text-text dark:text-text-primary-dark'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function WeeklyHealthCheckScreen(): React.ReactElement {
  const { t } = useTranslation('garden');
  const tCommon = useTranslation('common').t;
  const insets = useSafeAreaInsets();
  const { plantId } = useLocalSearchParams<{ plantId?: string }>();
  const { submitWeeklyHealthCheck } = useWeeklyHealthCheck(plantId);

  const { control, handleSubmit, watch } = useForm<WeeklyHealthCheckFormData>({
    resolver: zodResolver(weeklyHealthCheckSchema),
    defaultValues: {
      checkDate: todayIsoDate(),
      wateringIssues: {
        hasDroopingLeaves: false,
        potWeightState: undefined,
      },
      nutrientIssues: {
        yellowingBottomLeaves: false,
        burntCrispyTips: false,
      },
      developmentIssues: {
        hasStuntedGrowth: false,
      },
    },
    mode: 'onBlur',
  });

  const hasDroopingLeaves = watch('wateringIssues.hasDroopingLeaves');

  const onSubmit = useCallback(
    async (values: WeeklyHealthCheckFormData): Promise<void> => {
      if (!plantId) {
        Alert.alert(tCommon('error'), t('healthCheck.errors.missingPlant'));
        return;
      }

      try {
        const result = await submitWeeklyHealthCheck(values);
        const isAllClear = result.outcome === 'all-clear';
        Alert.alert(
          isAllClear
            ? t('healthCheck.allClearTitle')
            : t('healthCheck.successTitle'),
          isAllClear
            ? t('healthCheck.allClearSubtitle')
            : t('healthCheck.successSubtitle'),
          [{ text: tCommon('close'), onPress: () => router.back() }]
        );
      } catch (error) {
        if (error instanceof AlreadySubmittedHealthCheckError) {
          Alert.alert(
            tCommon('error'),
            t('healthCheck.errors.alreadySubmittedThisWeek')
          );
          return;
        }
        Alert.alert(tCommon('error'), t('healthCheck.errors.submitFailed'));
      }
    },
    [plantId, submitWeeklyHealthCheck, t, tCommon]
  );

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={t('healthCheck.title')}
          backTestID="back-weekly-health-check"
        />
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-10"
        contentInsetAdjustmentBehavior="automatic"
      >
        <FieldCard title={t('healthCheck.sections.watering')}>
          <Controller
            control={control}
            name="wateringIssues.hasDroopingLeaves"
            render={({ field: { value, onChange } }) => (
              <ToggleRow
                label={t('healthCheck.watering.hasDroopingLeaves')}
                hint={tCommon('a11y.toggleHint')}
                value={value}
                onValueChange={onChange}
              />
            )}
          />
          {hasDroopingLeaves ? (
            <View className="mt-3 flex-row gap-2">
              <Controller
                control={control}
                name="wateringIssues.potWeightState"
                render={({ field: { value, onChange } }) => (
                  <>
                    <WeightOption
                      label={t('healthCheck.watering.potWeightHeavyWet')}
                      hint={tCommon('a11y.selectOptionHint')}
                      selected={value === 'heavy-wet'}
                      onPress={() => onChange('heavy-wet')}
                    />
                    <WeightOption
                      label={t('healthCheck.watering.potWeightLightDry')}
                      hint={tCommon('a11y.selectOptionHint')}
                      selected={value === 'light-dry'}
                      onPress={() => onChange('light-dry')}
                    />
                  </>
                )}
              />
            </View>
          ) : null}
        </FieldCard>

        <FieldCard title={t('healthCheck.sections.nutrients')}>
          <Controller
            control={control}
            name="nutrientIssues.yellowingBottomLeaves"
            render={({ field: { value, onChange } }) => (
              <ToggleRow
                label={t('healthCheck.nutrients.yellowingBottomLeaves')}
                hint={tCommon('a11y.toggleHint')}
                value={value}
                onValueChange={onChange}
              />
            )}
          />
          <View className="mt-2" />
          <Controller
            control={control}
            name="nutrientIssues.burntCrispyTips"
            render={({ field: { value, onChange } }) => (
              <ToggleRow
                label={t('healthCheck.nutrients.burntCrispyTips')}
                hint={tCommon('a11y.toggleHint')}
                value={value}
                onValueChange={onChange}
              />
            )}
          />
        </FieldCard>

        <FieldCard title={t('healthCheck.sections.development')}>
          <Controller
            control={control}
            name="developmentIssues.hasStuntedGrowth"
            render={({ field: { value, onChange } }) => (
              <ToggleRow
                label={t('healthCheck.development.hasStuntedGrowth')}
                hint={tCommon('a11y.toggleHint')}
                value={value}
                onValueChange={onChange}
              />
            )}
          />
        </FieldCard>

        <Button
          onPress={handleSubmit(onSubmit)}
          testID="submit-health-check-btn"
        >
          {t('healthCheck.submit')}
        </Button>
      </ScrollView>
    </View>
  );
}
