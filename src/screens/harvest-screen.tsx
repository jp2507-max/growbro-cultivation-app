import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  CheckCircle2,
  Pill,
  Scale,
  Scissors,
  X,
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import {
  AnimatedSection,
  Button,
  Card,
  FormSectionCard,
  IconCircle,
  ScreenContainer,
  SelectionCard,
  SplitSummaryCard,
  Subtitle,
  Title,
} from '@/src/components/ui';
import { type HarvestFormData, harvestSchema } from '@/src/lib/forms';
import { db, id } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from '@/src/tw';

const QUALITY_KEYS = [
  {
    id: 'poor',
    labelKey: 'quality.poor',
    descriptionKey: 'qualityDescriptions.poor',
    emoji: '😐',
  },
  {
    id: 'good',
    labelKey: 'quality.good',
    descriptionKey: 'qualityDescriptions.good',
    emoji: '😊',
  },
  {
    id: 'great',
    labelKey: 'quality.great',
    descriptionKey: 'qualityDescriptions.great',
    emoji: '🤩',
  },
  {
    id: 'premium',
    labelKey: 'quality.premium',
    descriptionKey: 'qualityDescriptions.premium',
    emoji: '🏆',
  },
] as const;

export default function HarvestScreen() {
  const { t } = useTranslation('harvest');
  const tCommon = useTranslation('common').t;
  const { plantName } = useLocalSearchParams<{ plantName?: string }>();
  const { profile } = useAuth();
  const displayPlantName = plantName || t('thisPlant');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HarvestFormData>({
    resolver: zodResolver(harvestSchema),
    defaultValues: { wetWeight: '', dryWeight: '', notes: '', quality: 'good' },
    mode: 'onBlur',
  });

  const wetWeight = watch('wetWeight');
  const quality = watch('quality');
  const isWeightValid =
    wetWeight.trim().length > 0 &&
    !isNaN(Number(wetWeight)) &&
    Number(wetWeight) > 0;

  const onValidSubmit = useCallback(
    async (data: HarvestFormData) => {
      if (!profile) {
        Alert.alert(tCommon('error'), tCommon('errors.signInRequired'));
        return;
      }

      try {
        const harvestId = id();
        await db.transact([
          db.tx.harvests[harvestId].update({
            wetWeight: Number(data.wetWeight),
            dryWeight: data.dryWeight ? Number(data.dryWeight) : undefined,
            notes: data.notes,
            quality: data.quality,
            plantName,
            createdAt: Date.now(),
          }),
          db.tx.harvests[harvestId].link({ owner: profile.id }),
        ]);

        if (process.env.EXPO_OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.push({
          pathname: ROUTES.HARVEST_SUCCESS,
          params: { weight: data.wetWeight.trim() },
        });
      } catch (error) {
        console.error('Failed to save harvest:', error);
        if (process.env.EXPO_OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert(tCommon('error'), t('errors.saveFailed'));
      }
    },
    [profile, plantName, t, tCommon]
  );

  const onInvalidSubmit = useCallback(() => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const handleSelectQuality = useCallback(
    (
      nextQuality: (typeof QUALITY_KEYS)[number]['id'],
      onChange: (value: (typeof QUALITY_KEYS)[number]['id']) => void
    ) => {
      if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
      onChange(nextQuality);
    },
    []
  );

  const selectedQualityLabel = t(
    QUALITY_KEYS.find((opt) => opt.id === quality)?.labelKey ?? 'quality.good'
  );

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-10"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View className="items-end pt-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('a11y.closeSheetLabel')}
              accessibilityHint={t('a11y.closeSheetHint')}
              className="border-border-light dark:border-dark-border size-10 items-center justify-center rounded-full border"
              onPress={() => router.back()}
              testID="close-harvest-sheet"
            >
              <X
                size={18}
                color={isDark ? Colors.textPrimaryDark : Colors.text}
              />
            </Pressable>
          </View>

          <View className="items-center py-6">
            <IconCircle
              size="xl"
              className="bg-border dark:bg-dark-bg-card mb-4"
            >
              <Scissors size={32} color={Colors.primary} />
            </IconCircle>
            <Title className="text-[26px]">{t('title')}</Title>
            <Subtitle className="mt-1 text-[15px]">
              {t('subtitle', { plantName: displayPlantName })}
            </Subtitle>
          </View>

          <AnimatedSection>
            <Card className="mb-4 rounded-3xl border border-border-light p-4 dark:border-dark-border">
              <Text className="text-text-muted mb-1 text-xs font-semibold uppercase tracking-wide dark:text-text-muted-dark">
                {t('plantSummaryLabel')}
              </Text>
              <Text className="text-text text-[18px] font-extrabold dark:text-text-primary-dark">
                {displayPlantName}
              </Text>
              <View className="mt-3 flex-row items-center gap-2">
                <Calendar size={16} color={Colors.textSecondary} />
                <Text className="text-text-secondary text-sm font-medium dark:text-text-secondary-dark">
                  {t('harvestDateToday')}
                </Text>
              </View>
            </Card>
          </AnimatedSection>

          <SplitSummaryCard
            className="mb-4"
            eyebrow={t('saveHarvest')}
            leftLabel={t('yieldWeight')}
            leftValue={wetWeight.trim().length > 0 ? wetWeight : '—'}
            rightLabel={t('qualityRating')}
            rightValue={selectedQualityLabel}
          />

          <AnimatedSection delayMs={40}>
            <FormSectionCard
              title={t('yieldWeight')}
              icon={Scale}
              contentClassName="gap-3"
            >
              <Controller
                name="wetWeight"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View className="border-border-light bg-background dark:border-dark-border dark:bg-dark-bg flex-row items-center overflow-hidden rounded-[14px] border">
                      <View className="pl-4 pr-1.5">
                        <Scale size={18} color={Colors.primary} />
                      </View>
                      <TextInput
                        accessibilityLabel={t('a11y.wetWeightLabel')}
                        accessibilityHint={t('a11y.wetWeightHint')}
                        className="text-text dark:text-text-primary-dark flex-1 px-2.5 py-3.5 text-[15px]"
                        placeholder={t('wetWeightPlaceholder')}
                        placeholderTextColor={Colors.textMuted}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="numeric"
                        testID="wet-weight-input"
                      />
                    </View>
                    {errors.wetWeight?.message ? (
                      <Text className="text-danger dark:text-error-dark mt-1.5 px-1 text-sm font-medium">
                        {tCommon(
                          errors.wetWeight.message as 'validation.required'
                        )}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
              <Controller
                name="dryWeight"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="border-border-light bg-background dark:border-dark-border dark:bg-dark-bg flex-row items-center overflow-hidden rounded-[14px] border">
                    <View className="pl-4 pr-1.5">
                      <Scale size={18} color={Colors.warning} />
                    </View>
                    <TextInput
                      accessibilityLabel={t('a11y.dryWeightLabel')}
                      accessibilityHint={t('a11y.dryWeightHint')}
                      className="text-text dark:text-text-primary-dark flex-1 px-2.5 py-3.5 text-[15px]"
                      placeholder={t('dryWeightPlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      testID="dry-weight-input"
                    />
                  </View>
                )}
              />
            </FormSectionCard>
          </AnimatedSection>

          <AnimatedSection delayMs={80}>
            <FormSectionCard
              title={t('qualityRating')}
              icon={CheckCircle2}
              iconColor={Colors.warning}
            >
              <Controller
                name="quality"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <>
                    {QUALITY_KEYS.map((opt) => (
                      <SelectionCard
                        key={opt.id}
                        label={t(opt.labelKey)}
                        description={t(opt.descriptionKey)}
                        selected={value === opt.id}
                        icon={
                          <IconCircle
                            size="md"
                            className="bg-border dark:bg-dark-border"
                          >
                            <Text className="text-[20px]">{opt.emoji}</Text>
                          </IconCircle>
                        }
                        labelClassName="text-base"
                        descriptionClassName="text-xs"
                        onPress={() => handleSelectQuality(opt.id, onChange)}
                        testID={`quality-${opt.id}`}
                      />
                    ))}
                  </>
                )}
              />
            </FormSectionCard>
          </AnimatedSection>

          <AnimatedSection delayMs={120}>
            <FormSectionCard
              title={t('harvestNotes')}
              icon={Pill}
              iconColor={Colors.primary}
            >
              <Controller
                name="notes"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    accessibilityLabel={t('harvestNotes')}
                    accessibilityHint={t('notesHint')}
                    className="border-border-light bg-background text-text dark:border-dark-border dark:bg-dark-bg dark:text-text-primary-dark min-h-25 rounded-[14px] border p-3.5 text-[15px]"
                    placeholder={t('notesPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    testID="harvest-notes-input"
                  />
                )}
              />
            </FormSectionCard>
          </AnimatedSection>

          <Button
            className={cn(
              'rounded-[20px] py-4.5',
              !isWeightValid && 'opacity-50'
            )}
            onPress={handleSubmit(onValidSubmit, onInvalidSubmit)}
            disabled={!isWeightValid}
            testID="save-harvest-btn"
            leftIcon={<Scissors size={20} color={Colors.white} />}
          >
            {t('saveHarvest')}
          </Button>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
