import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { HeaderAction } from '@/src/components/ui/header-action';
import { SelectionCard } from '@/src/components/ui/selection-card';
import type { CommunityReportTargetType } from '@/src/hooks/use-community-navigation';
import { useReports } from '@/src/hooks/use-reports';
import {
  REPORT_REASONS,
  type ReportFormData,
  reportSchema,
} from '@/src/lib/forms';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from '@/src/tw';

function toRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toReportTargetType(
  value: string | undefined
): CommunityReportTargetType {
  if (value === 'comment' || value === 'user') return value;
  return 'post';
}

export function ReportScreen(): React.ReactElement {
  const { t } = useTranslation(['community', 'common']);
  const { back } = useRouter();
  const { submitReport } = useReports();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const params = useLocalSearchParams<{
    targetType?: string | string[];
    targetId?: string | string[];
  }>();

  const targetType = toReportTargetType(toRouteParam(params.targetType));
  const targetId = toRouteParam(params.targetId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: 'spam',
      details: '',
    },
    mode: 'onBlur',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const detailsErrorKey =
    errors.details?.message ?? 'validation.reportDetailsTooLong';

  const targetLabel = useMemo(() => {
    if (targetType === 'comment') return t('report.targets.comment');
    if (targetType === 'user') return t('report.targets.user');
    return t('report.targets.post');
  }, [t, targetType]);

  const onValidSubmit = useCallback(
    async (data: ReportFormData) => {
      if (!targetId) {
        Alert.alert(t('common:error'), t('report.errors.missingTarget'));
        return;
      }

      setIsSubmitting(true);

      try {
        await submitReport({
          targetType,
          targetId,
          reason: data.reason,
          details: data.details,
        });

        Alert.alert(t('common:success'), t('report.success'), [
          {
            text: t('common:done'),
            onPress: back,
          },
        ]);
      } catch {
        Alert.alert(t('common:error'), t('report.errors.submit'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [back, submitReport, t, targetId, targetType]
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background dark:bg-dark-bg"
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1 px-5 pt-4"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="mb-4 flex-row items-center gap-2">
          <View className="size-9 items-center justify-center rounded-full bg-warning/20 dark:bg-warning-dark/20">
            <ShieldAlert
              size={18}
              color={isDark ? Colors.warningDark : Colors.warning}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[12px] font-semibold uppercase tracking-wide text-text-secondary dark:text-text-secondary-dark">
              {t('report.reporting')}
            </Text>
            <Text className="text-[15px] font-bold text-text dark:text-text-primary-dark">
              {targetLabel}
            </Text>
          </View>
        </View>

        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-text-secondary-dark">
          {t('report.reasonTitle')}
        </Text>

        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, value } }) => (
            <>
              {REPORT_REASONS.map((reason) => (
                <SelectionCard
                  key={reason}
                  label={t(`report.reasons.${reason}`)}
                  selected={value === reason}
                  onPress={() => onChange(reason)}
                  testID={`report-reason-${reason}`}
                />
              ))}
            </>
          )}
        />

        {errors.reason ? (
          <Text className="text-danger dark:text-error-dark mt-1 text-xs">
            {t(`common:${errors.reason.message ?? 'validation.required'}`, {
              defaultValue: errors.reason.message ?? 'validation.required',
            })}
          </Text>
        ) : null}

        <View className="mt-4">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary dark:text-text-secondary-dark">
            {t('report.detailsTitle')}
          </Text>
          <Controller
            control={control}
            name="details"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                accessibilityRole="text"
                className="min-h-28 rounded-2xl border border-border bg-white p-3 text-[14px] text-text dark:border-dark-border dark:bg-dark-bg-card dark:text-text-primary-dark"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                textAlignVertical="top"
                placeholder={t('report.detailsPlaceholder')}
                placeholderTextColor={
                  isDark ? Colors.textMutedDark : Colors.textMuted
                }
                testID="report-details"
              />
            )}
          />
          {errors.details ? (
            <Text className="text-danger dark:text-error-dark mt-1 text-xs">
              {t(`common:${detailsErrorKey}`, {
                defaultValue: detailsErrorKey,
              })}
            </Text>
          ) : null}
        </View>

        <View className="mt-6 flex-row items-center gap-3">
          <Pressable
            className="flex-1 items-center justify-center rounded-xl border border-border py-3 dark:border-dark-border"
            accessibilityRole="button"
            onPress={back}
            testID="report-cancel"
          >
            <Text className="text-sm font-semibold text-text-secondary dark:text-text-secondary-dark">
              {t('common:cancel')}
            </Text>
          </Pressable>
          <HeaderAction
            className="flex-1 rounded-xl bg-danger py-3 dark:bg-error-dark"
            onPress={handleSubmit(onValidSubmit)}
            disabled={isSubmitting}
            testID="report-submit"
          >
            <Text className="text-sm font-semibold text-white dark:text-on-primary-dark">
              {t('report.submit')}
            </Text>
          </HeaderAction>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
