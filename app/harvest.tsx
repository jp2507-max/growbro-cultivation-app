import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import type { Href } from 'expo-router';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  CheckCircle2,
  PartyPopper,
  Pill,
  Scale,
  Scissors,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
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
import { motion, rmTiming } from '@/src/lib/animations/motion';
import type { HarvestFormData } from '@/src/lib/forms';
import { harvestSchema } from '@/src/lib/forms';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View,
} from '@/src/tw';
import { Animated } from '@/src/tw/animated';

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
  const displayPlantName = plantName || t('thisPlant');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const scaleAnim = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

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

  const modalAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.get() }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.get(),
  }));

  const showOverlay = useCallback(() => {
    overlayOpacity.set(withTiming(1, rmTiming(motion.dur.md)));
    scaleAnim.set(withSpring(1, motion.spring.bouncy));
  }, [overlayOpacity, scaleAnim]);

  const applyHideSuccessOverlay = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const applyHideAndNavigate = useCallback((route: Href) => {
    setShowSuccess(false);
    router.replace(route);
  }, []);

  const handleDismissOverlay = useCallback(() => {
    scaleAnim.set(withTiming(0, rmTiming(motion.dur.sm)));
    overlayOpacity.set(
      withTiming(0, rmTiming(motion.dur.sm), (finished) => {
        if (finished) {
          scheduleOnRN(applyHideSuccessOverlay);
        }
      })
    );
  }, [overlayOpacity, scaleAnim, applyHideSuccessOverlay]);

  const onValidSubmit = useCallback(
    (_data: HarvestFormData) => {
      if (process.env.EXPO_OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
      showOverlay();
    },
    [showOverlay]
  );

  const onInvalidSubmit = useCallback(() => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const dismissAndNavigate = useCallback(
    (route: Href) => {
      overlayOpacity.set(
        withTiming(0, rmTiming(motion.dur.sm), (finished) => {
          if (finished) {
            scheduleOnRN(applyHideAndNavigate, route);
          }
        })
      );
      scaleAnim.set(withTiming(0, rmTiming(motion.dur.sm)));
    },
    [overlayOpacity, scaleAnim, applyHideAndNavigate]
  );

  const handleGoToGarden = useCallback(
    () => dismissAndNavigate(ROUTES.GARDEN),
    [dismissAndNavigate]
  );

  const handleGoToProfile = useCallback(
    () => dismissAndNavigate(ROUTES.PROFILE),
    [dismissAndNavigate]
  );

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

      {showSuccess && (
        <Animated.Pressable
          accessibilityRole="button"
          accessibilityLabel={t('a11y.dismissOverlayLabel')}
          accessibilityHint={t('a11y.dismissOverlayHint')}
          style={overlayStyle}
          className="absolute inset-0 z-10 items-center justify-center bg-black/50 px-8"
          onPress={handleDismissOverlay}
        >
          <Animated.View
            onStartShouldSetResponder={() => true}
            style={modalAnimStyle}
            className="dark:bg-dark-bg-elevated w-full items-center rounded-[28px] bg-white p-8 shadow-2xl"
          >
            <View className="bg-border dark:bg-dark-bg-card mb-4 size-22 items-center justify-center rounded-full">
              <CheckCircle2 size={56} color={Colors.primary} />
            </View>
            <View className="mb-2.5 flex-row items-center gap-2">
              <PartyPopper size={24} color={Colors.warning} />
              <Text className="text-text dark:text-text-primary-dark text-2xl font-black">
                {t('success.title')}
              </Text>
              <PartyPopper size={24} color={Colors.warning} />
            </View>
            <Text className="text-text-secondary dark:text-text-secondary-dark mb-7 text-center text-[15px] leading-5.5">
              {t('success.message', { weight: wetWeight })}
            </Text>

            <Button
              className="mb-2.5 w-full rounded-[18px] py-4"
              onPress={handleGoToGarden}
              testID="go-garden-btn"
            >
              {t('success.startNewGrow')}
            </Button>
            <Button
              variant="ghost"
              className="border-primary dark:border-primary-bright w-full rounded-[18px] py-3.5"
              textClassName="text-primary dark:text-primary-bright"
              onPress={handleGoToProfile}
              testID="go-profile-btn"
            >
              {t('success.viewInventory')}
            </Button>
          </Animated.View>
        </Animated.Pressable>
      )}
    </ScreenContainer>
  );
}
