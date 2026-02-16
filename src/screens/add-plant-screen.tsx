import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  ArrowRight,
  FlaskConical,
  Leaf,
  Sun,
  TreePine,
  Warehouse,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import {
  AnimatedProgressBar,
  AnimatedSection,
  Button,
  Card,
  Divider,
  IconCircle,
  ScreenContainer,
  ScreenHeader,
  SelectionCard,
  Subtitle,
  Title,
} from '@/src/components/ui';
import { usePlants } from '@/src/hooks/use-plants';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { type AddPlantFormData, addPlantSchema } from '@/src/lib/forms';
import { ControlledFormField } from '@/src/lib/forms';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import { KeyboardAvoidingView, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type StrainType = 'Indica' | 'Sativa' | 'Hybrid';

const strainOptions: {
  type: StrainType | null;
  labelKey: 'step1.indica.label' | 'step1.sativa.label' | 'step1.hybrid.label';
  subtitleKey:
    | 'step1.indica.subtitle'
    | 'step1.sativa.subtitle'
    | 'step1.hybrid.subtitle';
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    type: 'Indica',
    labelKey: 'step1.indica.label',
    subtitleKey: 'step1.indica.subtitle',
    icon: Leaf,
    color: Colors.primary,
    bg: Colors.border,
  },
  {
    type: 'Sativa',
    labelKey: 'step1.sativa.label',
    subtitleKey: 'step1.sativa.subtitle',
    icon: Sun,
    color: Colors.warning,
    bg: Colors.warningLight,
  },
  {
    type: 'Hybrid',
    labelKey: 'step1.hybrid.label',
    subtitleKey: 'step1.hybrid.subtitle',
    icon: FlaskConical,
    color: Colors.primary,
    bg: Colors.border,
  },
];

const environmentOptions: {
  type: 'Indoor' | 'Outdoor';
  labelKey: 'step2.indoor' | 'step2.outdoor';
  descriptionKey: 'step2.indoorDesc' | 'step2.outdoorDesc';
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    type: 'Indoor',
    labelKey: 'step2.indoor',
    descriptionKey: 'step2.indoorDesc',
    icon: Warehouse,
    color: Colors.indoorAccent,
    bg: Colors.indoorAccentLight,
  },
  {
    type: 'Outdoor',
    labelKey: 'step2.outdoor',
    descriptionKey: 'step2.outdoorDesc',
    icon: TreePine,
    color: Colors.primary,
    bg: Colors.border,
  },
];

export default function AddPlantScreen() {
  const { t } = useTranslation('add-plant');
  const tCommon = useTranslation('common').t;
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { addPlant } = usePlants();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<AddPlantFormData>({
    resolver: zodResolver(addPlantSchema),
    defaultValues: {
      plantName: '',
      strainType: undefined,
      environment: undefined,
    },
    mode: 'onBlur',
  });

  const plantName = watch('plantName');
  const strainType = watch('strainType');
  const environment = watch('environment');
  const totalSteps = 3;
  const fadeAnim = useSharedValue(1);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.get(),
  }));

  const applyStepChange = useCallback((next: number) => {
    setStep(next);
  }, []);

  const animateTransition = useCallback(
    (next: number) => {
      fadeAnim.set(
        withTiming(0, rmTiming(motion.dur.xs), (finished) => {
          if (finished) {
            scheduleOnRN(applyStepChange, next);
          }
        })
      );
    },
    [fadeAnim, applyStepChange]
  );

  useEffect(() => {
    fadeAnim.set(withTiming(1, rmTiming(motion.dur.sm)));
  }, [step, fadeAnim]);

  const canProceed =
    step === 1
      ? plantName.trim().length > 0 && strainType !== undefined
      : step === 2
        ? environment !== undefined
        : true;

  const onFinalSubmit = useCallback(
    async (data: AddPlantFormData) => {
      setIsSubmitting(true);
      try {
        await addPlant({
          name: data.plantName.trim(),
          strainType: data.strainType,
          environment: data.environment,
        });
        router.replace(ROUTES.ADD_PLANT_SUCCESS);
      } catch {
        Alert.alert(tCommon('error'), t('errors.failedAddPlant'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [addPlant, t, tCommon]
  );

  const handleNext = useCallback(async () => {
    if (isSubmitting) return;

    if (step === 1) {
      const valid = await trigger(['plantName', 'strainType']);
      if (!valid) return;
    } else if (step === 2) {
      const valid = await trigger(['environment']);
      if (!valid) return;
    }

    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (step < totalSteps) {
      animateTransition(step + 1);
    } else {
      handleSubmit(onFinalSubmit)();
    }
  }, [
    isSubmitting,
    step,
    trigger,
    animateTransition,
    handleSubmit,
    onFinalSubmit,
  ]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      animateTransition(step - 1);
    } else {
      router.back();
    }
  }, [step, animateTransition]);

  const handleSelectStrain = useCallback(
    (nextType: StrainType) => {
      if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
      setValue('strainType', nextType, { shouldValidate: true });
    },
    [setValue]
  );

  const handleSelectEnvironment = useCallback(
    (nextEnvironment: 'Indoor' | 'Outdoor') => {
      if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
      setValue('environment', nextEnvironment, { shouldValidate: true });
    },
    [setValue]
  );

  return (
    <ScreenContainer withTopInset>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[0]}
          contentInsetAdjustmentBehavior="automatic"
        >
          <ScreenHeader
            className="bg-background dark:bg-dark-bg"
            showBack={step > 1}
            onBackPress={handleBack}
            backTestID="back-add-plant"
            title={`${step} ${t('stepOf', { total: totalSteps })}`}
            titleClassName="text-text-muted dark:text-text-muted-dark text-[15px] font-semibold"
          />

          <Animated.View style={fadeStyle} className="flex-1 px-6 pt-2.5">
            <AnimatedProgressBar
              className="mb-6"
              value={step / totalSteps}
              label={t('stepProgress', { step, total: totalSteps })}
            />

            {step === 1 && (
              <AnimatedSection>
                <Title className="mb-2">{t('step1.title')}</Title>
                <Subtitle className="mb-8">{t('step1.subtitle')}</Subtitle>

                <Text className="text-text dark:text-text-primary-dark mb-2.5 text-[15px] font-bold">
                  {t('step1.plantName')}
                </Text>
                <ControlledFormField
                  name="plantName"
                  control={control}
                  icon={<Leaf size={18} color={Colors.textMuted} />}
                  accessibilityLabel={t('step1.plantName')}
                  accessibilityHint={t('step1.plantNameHint')}
                  placeholder={t('step1.plantNamePlaceholder')}
                  testID="plant-name-input"
                />

                <Text className="text-text dark:text-text-primary-dark mb-2.5 mt-7 text-[15px] font-bold">
                  {t('step1.strainType')}
                </Text>
                {strainOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = strainType === opt.type;
                  return (
                    <SelectionCard
                      key={opt.type}
                      label={t(opt.labelKey)}
                      subtitle={t(opt.subtitleKey)}
                      selected={selected}
                      icon={
                        <IconCircle
                          size="md"
                          className="bg-border"
                          style={{ backgroundColor: opt.bg }}
                        >
                          <Icon size={22} color={opt.color} />
                        </IconCircle>
                      }
                      onPress={() => {
                        if (opt.type) handleSelectStrain(opt.type);
                      }}
                      testID={`strain-type-${opt.type}`}
                    />
                  );
                })}
                {errors.strainType?.message ? (
                  <Text className="text-danger mt-1.5 text-sm dark:text-error-dark">
                    {tCommon(
                      errors.strainType.message as 'validation.required'
                    )}
                  </Text>
                ) : null}
              </AnimatedSection>
            )}

            {step === 2 && (
              <AnimatedSection>
                <Title className="mb-2">{t('step2.title')}</Title>
                <Subtitle className="mb-8">{t('step2.subtitle')}</Subtitle>

                {environmentOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectionCard
                      key={option.type}
                      label={t(option.labelKey)}
                      description={t(option.descriptionKey)}
                      selected={environment === option.type}
                      icon={
                        <IconCircle
                          size="lg"
                          className="bg-border"
                          style={{ backgroundColor: option.bg }}
                        >
                          <Icon size={24} color={option.color} />
                        </IconCircle>
                      }
                      labelClassName="text-xl font-extrabold"
                      descriptionClassName="text-sm leading-5"
                      onPress={() => handleSelectEnvironment(option.type)}
                      testID={`env-${option.type.toLowerCase()}`}
                    />
                  );
                })}
                {errors.environment?.message ? (
                  <Text className="text-danger mt-1.5 text-sm dark:text-error-dark">
                    {tCommon(
                      errors.environment.message as 'validation.required'
                    )}
                  </Text>
                ) : null}
              </AnimatedSection>
            )}

            {step === 3 && (
              <AnimatedSection>
                <Title className="mb-2">{t('step3.title')}</Title>
                <Subtitle className="mb-8">{t('step3.subtitle')}</Subtitle>

                <Card className="p-5">
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-text-secondary text-[15px] dark:text-text-secondary-dark">
                      {t('step3.name')}
                    </Text>
                    <Text
                      className="text-text dark:text-text-primary-dark text-base font-bold"
                      selectable
                    >
                      {plantName}
                    </Text>
                  </View>
                  <Divider />
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-text-secondary text-[15px] dark:text-text-secondary-dark">
                      {t('step3.strain')}
                    </Text>
                    <Text
                      className="text-text dark:text-text-primary-dark text-base font-bold"
                      selectable
                    >
                      {strainType
                        ? t(
                            `step1.${strainType.toLowerCase() as Lowercase<StrainType>}.label`
                          )
                        : ''}
                    </Text>
                  </View>
                  <Divider />
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-text-secondary text-[15px] dark:text-text-secondary-dark">
                      {t('step3.environment')}
                    </Text>
                    <Text
                      className="text-text dark:text-text-primary-dark text-base font-bold"
                      selectable
                    >
                      {environment
                        ? t(
                            `step2.${environment.toLowerCase() as 'indoor' | 'outdoor'}`
                          )
                        : ''}
                    </Text>
                  </View>
                </Card>
              </AnimatedSection>
            )}
          </Animated.View>

          <View className="px-6 pt-3">
            <Button
              className={cn(
                'rounded-[20px] py-4.5',
                !canProceed && 'opacity-40'
              )}
              onPress={handleNext}
              disabled={!canProceed || isSubmitting}
              testID="next-step-btn"
              rightIcon={
                step < totalSteps ? (
                  <ArrowRight size={20} color={Colors.white} />
                ) : undefined
              }
            >
              {step === totalSteps ? t('startGrowing') : t('nextStep')}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
