import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  ArrowRight,
  Calendar,
  Camera,
  CameraOff,
  Check,
  Clock3,
  Droplets,
  Leaf,
  Minus,
  Pencil,
  Plus,
  Scissors,
  Search,
  Sprout,
  Sun,
  Thermometer,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  type TextInputProps,
  useColorScheme,
} from 'react-native';
import { Switch } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { Button, ScreenContainer, ScreenHeader } from '@/src/components/ui';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { usePlants } from '@/src/hooks/use-plants';
import { useStrains } from '@/src/hooks/use-strains';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import {
  type AddPlantFormInputData,
  addPlantSchema,
  type AddPlantSubmitData,
  ENVIRONMENTS,
  type MEDIUM_TYPES,
  STRAIN_TYPES,
} from '@/src/lib/forms';
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
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

type Step = 1 | 2 | 3 | 4;
type PickerField = 'startDate' | 'reminderTimeLocal' | null;
type StrainType = (typeof STRAIN_TYPES)[number];
type MediumType = (typeof MEDIUM_TYPES)[number];
type LightType = 'LED' | 'HPS' | 'Sun';
type LightPresetType = '18-6' | '12-12' | '20-4';

const TOTAL_STEPS = 4;

const lightTypeMap = {
  LED: 'LED',
  HPS: 'HPS',
  Sun: 'Sun',
} as const;

const lightPresetMap = {
  '18-6': '18-6',
  '12-12': '12-12',
  '20-4': '20-4',
} as const;

const lightPresetLabelKeys: Record<
  LightPresetType,
  'preset18_6' | 'preset12_12' | 'preset20_4'
> = {
  '18-6': 'preset18_6',
  '12-12': 'preset12_12',
  '20-4': 'preset20_4',
};

const lightPresetSubtitleKeys: Record<
  LightPresetType,
  'veg' | 'flower' | 'auto'
> = {
  '18-6': 'veg',
  '12-12': 'flower',
  '20-4': 'auto',
};

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date {
  const parsed = value ? new Date(`${value}T12:00:00`) : new Date();
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseTimeValue(value: string): Date {
  const date = new Date();
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number(hoursRaw ?? '8');
  const minutes = Number(minutesRaw ?? '0');

  date.setHours(Number.isFinite(hours) ? hours : 8);
  date.setMinutes(Number.isFinite(minutes) ? minutes : 0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function toTimeValue(value: Date): string {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDateLabel(value: string): string {
  const parsed = parseIsoDate(value);
  return parsed.toLocaleDateString();
}

function formatTimeLabel(value: string): string {
  const parsed = parseTimeValue(value);
  return parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStepPercent(step: Step): number {
  return Math.round((step / TOTAL_STEPS) * 100);
}

function toInputString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function StepFieldLabel({ label }: { label: string }): React.ReactElement {
  return (
    <Text className="mb-1.5 ml-1 text-[11px] font-black uppercase tracking-[0.6px] text-text dark:text-text-primary-dark">
      {label}
    </Text>
  );
}

function PillButton({
  label,
  selected,
  onPress,
  className,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        'rounded-full px-3 py-2',
        selected
          ? 'bg-primary dark:bg-primary-bright'
          : 'bg-transparent dark:bg-transparent',
        className
      )}
    >
      <Text
        className={cn(
          'text-sm font-semibold',
          selected
            ? 'text-white dark:text-on-primary-dark'
            : 'text-text-secondary dark:text-text-secondary-dark'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function NumberStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}): React.ReactElement {
  return (
    <View className="flex-row items-center rounded-full bg-background px-2 py-1 dark:bg-dark-bg">
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(Math.max(1, value - 1))}
        className="size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
      >
        <Minus size={20} color={Colors.text} />
      </Pressable>
      <Text className="w-12 text-center text-[24px] font-bold text-text dark:text-text-primary-dark">
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(Math.min(60, value + 1))}
        className="size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
      >
        <Plus size={20} color={Colors.text} />
      </Pressable>
    </View>
  );
}

function BaseInput({
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType,
  multiline,
  numberOfLines,
  rightAddon,
}: {
  placeholder: string;
  value: string;
  onChangeText: (next: string) => void;
  icon: React.ReactNode;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
  numberOfLines?: number;
  rightAddon?: React.ReactNode;
}): React.ReactElement {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-3.5 rounded-[30px] border border-border bg-card px-4 py-3 dark:border-dark-border-bright dark:bg-dark-bg-card">
      <View className="flex-row items-center">
        <TextInput
          accessibilityRole="text"
          accessibilityLabel={placeholder}
          accessibilityHint={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            isDark ? Colors.textMutedDark : Colors.textMuted
          }
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          className={cn(
            'flex-1 text-[14px] text-text dark:text-text-primary-dark',
            multiline ? 'min-h-20 pt-1' : 'py-2'
          )}
          style={{ color: isDark ? Colors.textPrimaryDark : Colors.text }}
        />
        {rightAddon ?? <View className="ml-2">{icon}</View>}
      </View>
    </View>
  );
}

export default function AddPlantScreen(): React.ReactElement {
  const { t } = useTranslation('add-plant');
  const tCommon = useTranslation('common').t;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { addPlant } = usePlants();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pickerField, setPickerField] = useState<PickerField>(null);
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);

  const fadeAnim = useSharedValue(1);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AddPlantFormInputData, undefined, AddPlantSubmitData>({
    resolver: zodResolver(addPlantSchema),
    defaultValues: {
      plantName: '',
      strainName: '',
      strainId: undefined,
      estimatedFloweringWeeks: undefined,
      strainType: 'Indica',
      sourceType: 'Seed',
      environment: 'Indoor',
      currentPhase: 'Seedling',
      startDate: todayIsoDate(),
      medium: 'Soil',
      containerSize: '5',
      containerUnit: 'gal',
      lightType: 'LED',
      lightSchedulePreset: '18-6',
      targetTempDay: '25',
      targetTempNight: '20',
      targetHumidity: '60',
      targetPhMin: '6.0',
      targetPhMax: '6.5',
      autoCreateTasks: true,
      wateringCadenceDays: '3',
      feedingCadenceDays: '7',
      reminderTimeLocal: '09:00',
      notes: '',
      imageUrl: '',
    },
    mode: 'onBlur',
  });

  const strainName = useWatch({ control, name: 'strainName' }) ?? '';
  const strainType = useWatch({ control, name: 'strainType' });
  const sourceType = useWatch({ control, name: 'sourceType' });
  const environment = useWatch({ control, name: 'environment' });
  const currentPhase = useWatch({ control, name: 'currentPhase' });
  const medium = useWatch({ control, name: 'medium' });
  const containerSize = toInputString(
    useWatch({ control, name: 'containerSize' }),
    ''
  );
  const containerUnit = useWatch({ control, name: 'containerUnit' });
  const lightType = useWatch({ control, name: 'lightType' });
  const lightSchedulePreset = useWatch({
    control,
    name: 'lightSchedulePreset',
  });
  const targetTempDay = toInputString(
    useWatch({ control, name: 'targetTempDay' }),
    ''
  );
  const targetTempNight = toInputString(
    useWatch({ control, name: 'targetTempNight' }),
    ''
  );
  const targetHumidity = toInputString(
    useWatch({ control, name: 'targetHumidity' }),
    ''
  );
  const targetPhMin = toInputString(
    useWatch({ control, name: 'targetPhMin' }),
    ''
  );
  const targetPhMax = toInputString(
    useWatch({ control, name: 'targetPhMax' }),
    ''
  );
  const autoCreateTasks =
    useWatch({ control, name: 'autoCreateTasks' }) ?? true;
  const wateringCadenceDays = toInputString(
    useWatch({ control, name: 'wateringCadenceDays' }),
    '3'
  );
  const feedingCadenceDays = toInputString(
    useWatch({ control, name: 'feedingCadenceDays' }),
    '7'
  );
  const reminderTimeLocal = toInputString(
    useWatch({ control, name: 'reminderTimeLocal' }),
    '09:00'
  );
  const imageUrl = toInputString(useWatch({ control, name: 'imageUrl' }), '');
  const selectedStrainId = useWatch({ control, name: 'strainId' });
  const startDate = useWatch({ control, name: 'startDate' }) ?? todayIsoDate();

  const { strains } = useStrains(
    strainName.trim().length > 0 ? { search: strainName.trim() } : {}
  );

  const suggestedStrains = useMemo(() => strains.slice(0, 4), [strains]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.get(),
  }));

  const applyStepChange = useCallback((nextStep: Step): void => {
    setStep(nextStep);
  }, []);

  const animateStepChange = useCallback(
    (nextStep: Step): void => {
      fadeAnim.set(
        withTiming(0, rmTiming(motion.dur.xs), (finished) => {
          if (finished) scheduleOnRN(applyStepChange, nextStep);
        })
      );
    },
    [fadeAnim, applyStepChange]
  );

  useEffect(() => {
    fadeAnim.set(withTiming(1, rmTiming(motion.dur.sm)));
  }, [fadeAnim, step]);

  const getPickerValue = useCallback((): Date => {
    if (pickerField === 'startDate') return parseIsoDate(startDate);
    return parseTimeValue(reminderTimeLocal);
  }, [pickerField, reminderTimeLocal, startDate]);

  const openPicker = useCallback((field: PickerField): void => {
    if (!field) return;
    setPickerField(field);
    setIsPickerVisible(true);
  }, []);

  const closePicker = useCallback((): void => {
    setIsPickerVisible(false);
    setPickerField(null);
  }, []);

  const onPickerChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date): void => {
      if (Platform.OS === 'android') {
        setIsPickerVisible(false);
        setPickerField(null);
      }

      if (event.type === 'dismissed' || !selected || !pickerField) return;

      if (pickerField === 'startDate') {
        setValue('startDate', toIsoDate(selected), {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      setValue('reminderTimeLocal', toTimeValue(selected), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [pickerField, setValue]
  );

  const pickPlantImage = useCallback(async (): Promise<void> => {
    Alert.alert(t('step4.initialPhoto'), t('step4.photoHint'), [
      {
        text: t('step4.photoTake'),
        onPress: async () => {
          const cameraPermission =
            await ImagePicker.requestCameraPermissionsAsync();

          if (!cameraPermission.granted) {
            Alert.alert(tCommon('error'), t('step4.cameraPermissionDenied'));
            return;
          }

          try {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]?.uri) {
              setValue('imageUrl', result.assets[0].uri, {
                shouldDirty: true,
                shouldValidate: false,
              });
            }
          } catch {
            Alert.alert(tCommon('error'), t('step4.photoFailed'));
          }
        },
      },
      {
        text: t('step4.photoLibrary'),
        onPress: async () => {
          const photoPermission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (!photoPermission.granted) {
            Alert.alert(tCommon('error'), t('step4.photoPermissionDenied'));
            return;
          }

          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]?.uri) {
              setValue('imageUrl', result.assets[0].uri, {
                shouldDirty: true,
                shouldValidate: false,
              });
            }
          } catch {
            Alert.alert(tCommon('error'), t('step4.photoFailed'));
          }
        },
      },
      { text: tCommon('cancel'), style: 'cancel' },
    ]);
  }, [setValue, t, tCommon]);

  const onSelectSuggestedStrain = useCallback(
    (strain: (typeof strains)[number]): void => {
      const matchedType = STRAIN_TYPES.find(
        (candidate) => candidate === strain.type
      );

      setValue('strainName', strain.name, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue('strainId', strain.id, { shouldDirty: true });
      setValue('estimatedFloweringWeeks', strain.floweringWeeksMax, {
        shouldDirty: false,
      });

      if (matchedType) {
        setValue('strainType', matchedType, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (strain.isAutoflower === true) {
        setValue('lightSchedulePreset', '20-4', {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

  const handleFinalSubmit = useCallback(
    async (data: AddPlantSubmitData): Promise<void> => {
      setIsSubmitting(true);
      try {
        await addPlant({
          name: data.plantName.trim(),
          strainName: data.strainName.trim(),
          strainId: data.strainId,
          strainType: data.strainType,
          sourceType: data.sourceType,
          environment: data.environment,
          currentPhase: data.currentPhase,
          startDate: data.startDate,
          medium: data.medium,
          containerSize: data.containerSize,
          containerUnit: data.containerUnit,
          lightType: data.lightType,
          lightSchedulePreset: data.lightSchedulePreset,
          targetTempDay: data.targetTempDay,
          targetTempNight: data.targetTempNight,
          targetHumidity: data.targetHumidity,
          targetPhMin: data.targetPhMin,
          targetPhMax: data.targetPhMax,
          autoCreateTasks: data.autoCreateTasks,
          wateringCadenceDays: data.autoCreateTasks
            ? (data.wateringCadenceDays ?? 2)
            : 0,
          feedingCadenceDays: data.autoCreateTasks
            ? (data.feedingCadenceDays ?? 3)
            : 0,
          reminderTimeLocal: data.autoCreateTasks
            ? (data.reminderTimeLocal ?? '08:00')
            : '08:00',
          notes: data.notes,
          imageUrl: data.imageUrl?.trim() || undefined,
          estimatedFloweringWeeks: data.estimatedFloweringWeeks,
          starterTasks: data.autoCreateTasks
            ? [
                {
                  title: t('tasks.water.title'),
                  subtitle: t('tasks.water.subtitle', {
                    medium: t(
                      `step2.mediumOptions.${data.medium.toLowerCase() as Lowercase<MediumType>}`
                    ),
                  }),
                  icon: 'droplets',
                  offsetDays: data.wateringCadenceDays ?? 2,
                },
                {
                  title: t('tasks.feed.title'),
                  subtitle: t('tasks.feed.subtitle', {
                    phase: t(
                      `step2.phase.${
                        data.currentPhase === 'Vegetative'
                          ? 'vegetative'
                          : data.currentPhase === 'Flowering'
                            ? 'flowering'
                            : data.currentPhase === 'Curing'
                              ? 'harvest'
                              : 'seedling'
                      }`
                    ),
                  }),
                  icon: 'flask',
                  offsetDays: data.feedingCadenceDays ?? 3,
                },
                {
                  title: t('tasks.environment.title'),
                  subtitle: t('tasks.environment.subtitle', {
                    environment: t(
                      `step2.${data.environment.toLowerCase() as 'indoor' | 'outdoor' | 'greenhouse'}`
                    ),
                  }),
                  icon: 'sun',
                  offsetDays: 1,
                },
                {
                  title: t('tasks.log.title'),
                  subtitle: t('tasks.log.subtitle'),
                  icon: 'leaf',
                  offsetDays: 7,
                },
              ]
            : undefined,
        });

        const localizedStrainType = t(
          `step1.strainTypeOptions.${data.strainType.toLowerCase() as Lowercase<StrainType>}`
        );
        const localizedEnvironment = t(
          `step2.${data.environment.toLowerCase() as 'indoor' | 'outdoor' | 'greenhouse'}`
        );

        router.replace({
          pathname: ROUTES.ADD_PLANT_SUCCESS,
          params: {
            plantName: data.plantName.trim(),
            strainType: localizedStrainType,
            environment: localizedEnvironment,
          },
        });
      } catch {
        Alert.alert(tCommon('error'), t('errors.failedAddPlant'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [addPlant, t, tCommon]
  );

  const handleNext = useCallback(async (): Promise<void> => {
    if (isSubmitting) return;

    if (step === 1) {
      const isValid = await trigger([
        'plantName',
        'strainName',
        'strainType',
        'sourceType',
      ]);
      if (!isValid) return;
    }

    if (step === 2) {
      const isValid = await trigger([
        'environment',
        'currentPhase',
        'medium',
        'startDate',
        'containerSize',
        'containerUnit',
      ]);
      if (!isValid) return;
    }

    if (step === 3) {
      const lightFields: (keyof AddPlantFormInputData)[] =
        environment === 'Outdoor' ? [] : ['lightType', 'lightSchedulePreset'];

      const isValid = await trigger([
        ...lightFields,
        'targetTempDay',
        'targetTempNight',
        'targetHumidity',
        'targetPhMin',
        'targetPhMax',
      ]);
      if (!isValid) return;
    }

    if (step === 4) {
      const step4Fields: (keyof AddPlantFormInputData)[] = !autoCreateTasks
        ? [
            'autoCreateTasks',
            'wateringCadenceDays',
            'feedingCadenceDays',
            'reminderTimeLocal',
            'notes',
            'imageUrl',
          ]
        : ['autoCreateTasks', 'notes', 'imageUrl'];

      const isValid = await trigger(step4Fields);
      if (!isValid) return;
    }

    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (step < TOTAL_STEPS) {
      animateStepChange((step + 1) as Step);
      return;
    }

    handleSubmit(handleFinalSubmit)();
  }, [
    animateStepChange,
    autoCreateTasks,
    environment,
    handleFinalSubmit,
    handleSubmit,
    isSubmitting,
    step,
    trigger,
  ]);

  const handleBack = useCallback((): void => {
    if (step > 1) {
      animateStepChange((step - 1) as Step);
      return;
    }

    router.back();
  }, [animateStepChange, step]);

  const getStepTitle = useMemo((): string => {
    if (step === 1) return t('step1.title');
    if (step === 2) return t('step2.title');
    if (step === 3) return t('step3.title');
    return t('step4.title');
  }, [step, t]);

  const getStepSubtitle = useMemo((): string => {
    if (step === 1) return t('step1.subtitle');
    if (step === 2) return t('step2.subtitle');
    if (step === 3) return t('step3.subtitle');
    return t('step4.subtitle');
  }, [step, t]);

  const ctaLabel =
    step === 4
      ? t('startGrowing')
      : step === 3
        ? t('reviewSetup')
        : t('nextStep');

  return (
    <ScreenContainer withTopInset>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <View collapsable={false}>
          <ScreenHeader
            title={t('headerTitle')}
            onBackPress={handleBack}
            showBack
            className="bg-background px-6 pb-2.5 dark:bg-dark-bg"
            backTestID="back-add-plant"
          />
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          collapsable={false}
          contentContainerStyle={{
            paddingBottom: Math.max(32, insets.bottom + 20),
          }}
        >
          <Animated.View style={fadeStyle}>
            <View className="mt-2 mb-6 gap-3">
              <View className="flex-row items-end justify-between">
                <Text className="text-[24px] font-semibold text-text dark:text-text-primary-dark">
                  {t('stepProgress', { step, total: TOTAL_STEPS })}
                </Text>
                <Text className="text-[22px] font-extrabold text-primary dark:text-primary-bright">
                  {getStepPercent(step)}%
                </Text>
              </View>
              <View className="h-3 overflow-hidden rounded-full bg-border dark:bg-dark-border">
                <View
                  className="h-full rounded-full bg-primary dark:bg-primary-bright"
                  style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
              </View>
            </View>

            <Text className="mb-2 whitespace-pre-line text-[34px] font-black leading-10 tracking-tight text-text dark:text-text-primary-dark">
              {getStepTitle}
            </Text>
            <Text className="mb-6 text-[17px] leading-6 text-text-secondary dark:text-text-secondary-dark">
              {getStepSubtitle}
            </Text>

            {step === 1 ? (
              <>
                <StepFieldLabel label={t('step1.plantName')} />
                <Controller
                  name="plantName"
                  control={control}
                  render={({ field }) => (
                    <BaseInput
                      placeholder={t('step1.plantNamePlaceholder')}
                      value={field.value ?? ''}
                      onChangeText={field.onChange}
                      icon={<Pencil size={20} color={Colors.primary} />}
                    />
                  )}
                />

                <StepFieldLabel label={t('step1.strain')} />
                <Controller
                  name="strainName"
                  control={control}
                  render={({ field }) => (
                    <BaseInput
                      placeholder={t('step1.strainPlaceholder')}
                      value={field.value ?? ''}
                      onChangeText={(next) => {
                        field.onChange(next);
                        setValue('strainId', undefined, { shouldDirty: true });
                        setValue('estimatedFloweringWeeks', undefined, {
                          shouldDirty: false,
                        });
                      }}
                      icon={<Search size={20} color={Colors.primaryLight} />}
                    />
                  )}
                />

                {strainName.trim().length > 0 && suggestedStrains.length > 0 ? (
                  <View className="mb-3">
                    <Text className="mb-2 text-xs font-semibold text-text-secondary dark:text-text-secondary-dark">
                      {t('step1.strainSuggestions')}
                    </Text>
                    {suggestedStrains.map((strain) => (
                      <Pressable
                        key={strain.id}
                        accessibilityRole="button"
                        onPress={() => onSelectSuggestedStrain(strain)}
                        className={cn(
                          'mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3',
                          selectedStrainId === strain.id
                            ? 'border-primary bg-primary-alpha-15 dark:border-primary-bright dark:bg-primary-alpha-15'
                            : 'border-border bg-card dark:border-dark-border dark:bg-dark-bg-card'
                        )}
                      >
                        <View>
                          <Text className="text-sm font-bold text-text dark:text-text-primary-dark">
                            {strain.name}
                          </Text>
                          <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">
                            {strain.type}
                          </Text>
                        </View>
                        {selectedStrainId === strain.id ? (
                          <Check size={18} color={Colors.primary} />
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                <StepFieldLabel label={t('step1.strainType')} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4"
                >
                  <View className="flex-row rounded-full border border-border bg-card p-1 dark:border-dark-border dark:bg-dark-bg-card">
                    {STRAIN_TYPES.map((option) => {
                      const selected = strainType === option;
                      return (
                        <PillButton
                          key={option}
                          label={t(
                            `step1.strainTypeOptions.${option.toLowerCase() as Lowercase<StrainType>}`
                          )}
                          selected={selected}
                          onPress={() => {
                            setValue('strainType', option, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        />
                      );
                    })}
                  </View>
                </ScrollView>

                <StepFieldLabel label={t('step1.sourceType')} />
                <View className="mb-4 flex-row rounded-full border border-border bg-card p-1 dark:border-dark-border dark:bg-dark-bg-card">
                  {(
                    [
                      {
                        key: 'Seed',
                        icon: Sprout,
                        label: t('step1.sourceSeed'),
                      },
                      {
                        key: 'Clone',
                        icon: Scissors,
                        label: t('step1.sourceClone'),
                      },
                    ] as const
                  ).map((option) => {
                    const Icon = option.icon;
                    const selected = sourceType === option.key;

                    return (
                      <Pressable
                        key={option.key}
                        accessibilityRole="button"
                        onPress={() => {
                          setValue('sourceType', option.key, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className={cn(
                          'flex-1 flex-row items-center justify-center gap-2 rounded-full py-2.5',
                          selected
                            ? 'bg-primary dark:bg-primary-bright'
                            : 'bg-transparent'
                        )}
                      >
                        <Icon
                          size={18}
                          color={selected ? Colors.white : Colors.textSecondary}
                        />
                        <Text
                          className={cn(
                            'text-[13px] font-bold',
                            selected
                              ? 'text-white dark:text-on-primary-dark'
                              : 'text-text-secondary dark:text-text-secondary-dark'
                          )}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <StepFieldLabel label={t('step2.environment')} />
                <View className="mb-5 flex-row rounded-full border border-border bg-card p-1 dark:border-dark-border dark:bg-dark-bg-card">
                  {ENVIRONMENTS.map((option) => (
                    <PillButton
                      key={option}
                      label={t(
                        `step2.${option.toLowerCase() as 'indoor' | 'outdoor' | 'greenhouse'}`
                      )}
                      selected={environment === option}
                      onPress={() => {
                        setValue('environment', option, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      className="flex-1"
                    />
                  ))}
                </View>

                <StepFieldLabel label={t('step2.currentPhase')} />
                <View className="mb-5 flex-row flex-wrap gap-3">
                  {(
                    [
                      { value: 'Seedling', icon: Sprout },
                      { value: 'Vegetative', icon: Leaf },
                      { value: 'Flowering', icon: Sun },
                      { value: 'Curing', icon: Scissors },
                    ] as const
                  ).map((option) => {
                    const Icon = option.icon;
                    const selected = currentPhase === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        onPress={() => {
                          setValue('currentPhase', option.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className={cn(
                          'w-[48%] rounded-3xl border p-3.5',
                          selected
                            ? 'border-primary bg-card dark:border-primary-bright dark:bg-dark-bg-card'
                            : 'border-border bg-card dark:border-dark-border dark:bg-dark-bg-card'
                        )}
                      >
                        <View className="mb-3 flex-row items-center justify-between">
                          <View className="size-10 items-center justify-center rounded-full bg-border dark:bg-dark-bg-elevated">
                            <Icon
                              size={22}
                              color={
                                selected ? Colors.primary : Colors.textSecondary
                              }
                            />
                          </View>
                          <View
                            className={cn(
                              'size-7 rounded-full border-2',
                              selected
                                ? 'border-primary bg-primary dark:border-primary-bright dark:bg-primary-bright'
                                : 'border-border dark:border-dark-border-bright'
                            )}
                          >
                            {selected ? (
                              <Check size={16} color={Colors.white} />
                            ) : null}
                          </View>
                        </View>
                        <Text className="text-[16px] font-extrabold text-text dark:text-text-primary-dark">
                          {t(
                            `step2.phase.${
                              option.value === 'Curing'
                                ? 'harvest'
                                : (option.value.toLowerCase() as
                                    | 'seedling'
                                    | 'vegetative'
                                    | 'flowering')
                            }`
                          )}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <StepFieldLabel label={t('step2.medium')} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-5"
                >
                  <View className="flex-row gap-3 pr-6">
                    {(['Soil', 'Coco', 'Hydro', 'Other'] as const).map(
                      (option) => {
                        const selected = medium === option;
                        return (
                          <Pressable
                            key={option}
                            accessibilityRole="button"
                            onPress={() => {
                              setValue('medium', option, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            className={cn(
                              'w-24 rounded-3xl border p-3.5',
                              selected
                                ? 'border-primary bg-card dark:border-primary-bright dark:bg-dark-bg-card'
                                : 'border-border bg-card dark:border-dark-border dark:bg-dark-bg-card'
                            )}
                          >
                            <View className="mb-2 size-12 items-center justify-center rounded-full bg-border dark:bg-dark-bg-elevated">
                              {option === 'Hydro' ? (
                                <Droplets
                                  size={20}
                                  color={
                                    selected
                                      ? Colors.primary
                                      : Colors.textSecondary
                                  }
                                />
                              ) : option === 'Soil' ? (
                                <Sprout
                                  size={20}
                                  color={
                                    selected
                                      ? Colors.primary
                                      : Colors.textSecondary
                                  }
                                />
                              ) : option === 'Coco' ? (
                                <Leaf
                                  size={20}
                                  color={
                                    selected
                                      ? Colors.primary
                                      : Colors.textSecondary
                                  }
                                />
                              ) : (
                                <Sun
                                  size={20}
                                  color={
                                    selected
                                      ? Colors.primary
                                      : Colors.textSecondary
                                  }
                                />
                              )}
                            </View>
                            <Text className="text-[14px] font-bold text-text dark:text-text-primary-dark">
                              {t(
                                `step2.mediumOptions.${option.toLowerCase() as Lowercase<MediumType>}`
                              )}
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                </ScrollView>

                <View className="mb-4 flex-row gap-4">
                  <View className="flex-1">
                    <StepFieldLabel label={t('step2.startDate')} />
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => openPicker('startDate')}
                      className="flex-row items-center justify-between rounded-[28px] border border-border bg-card px-4 py-4 dark:border-dark-border dark:bg-dark-bg-card"
                    >
                      <Text className="text-[18px] font-semibold text-text dark:text-text-primary-dark">
                        {formatDateLabel(startDate)}
                      </Text>
                      <Calendar size={22} color={Colors.primary} />
                    </Pressable>
                  </View>

                  <View className="w-[45%]">
                    <StepFieldLabel label={t('step2.potSize')} />
                    <View className="flex-row items-center rounded-[28px] border border-border bg-card px-4 py-2 dark:border-dark-border dark:bg-dark-bg-card">
                      <TextInput
                        accessibilityRole="text"
                        accessibilityLabel={t('step2.potSize')}
                        accessibilityHint={t('step2.potSize')}
                        keyboardType="numeric"
                        className="flex-1 py-2 text-[18px] text-text dark:text-text-primary-dark"
                        style={{
                          color: isDark ? Colors.textPrimaryDark : Colors.text,
                        }}
                        value={containerSize}
                        onChangeText={(next) => {
                          setValue('containerSize', next, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        placeholder={t('step2.containerSizePlaceholder')}
                        placeholderTextColor={
                          isDark ? Colors.textMutedDark : Colors.textMuted
                        }
                      />
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          const next = containerUnit === 'gal' ? 'L' : 'gal';
                          setValue('containerUnit', next, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className="rounded-full bg-border px-3 py-3 dark:bg-dark-bg-elevated"
                      >
                        <Text className="text-xs font-black uppercase text-text dark:text-text-primary-dark">
                          {t(
                            `step2.containerUnits.${containerUnit.toLowerCase() as 'l' | 'gal'}`
                          )}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <StepFieldLabel label={t('step3.lightType')} />
                <View className="mb-5 flex-row gap-3">
                  {(Object.keys(lightTypeMap) as LightType[]).map((option) => {
                    const selected = lightType === option;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        onPress={() => {
                          setValue('lightType', option, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className={cn(
                          'flex-1 rounded-3xl border p-3.5',
                          selected
                            ? 'border-primary bg-card dark:border-primary-bright dark:bg-dark-bg-card'
                            : 'border-border bg-card dark:border-dark-border dark:bg-dark-bg-card'
                        )}
                      >
                        <View className="mb-2 size-12 items-center justify-center rounded-full bg-border dark:bg-dark-bg-elevated">
                          <Sun
                            size={20}
                            color={selected ? Colors.primary : Colors.warning}
                          />
                        </View>
                        <Text className="text-center text-[16px] font-bold text-text dark:text-text-primary-dark">
                          {t(
                            `step3.lightTypeOptions.${option.toLowerCase() as Lowercase<LightType>}`
                          )}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <StepFieldLabel label={t('step3.lightSchedule')} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-5"
                >
                  <View className="flex-row gap-3 pr-6">
                    {(Object.keys(lightPresetMap) as LightPresetType[]).map(
                      (option) => {
                        const selected = lightSchedulePreset === option;
                        const subtitleKey = lightPresetSubtitleKeys[option];
                        const labelKey = lightPresetLabelKeys[option];

                        return (
                          <Pressable
                            key={option}
                            accessibilityRole="button"
                            onPress={() => {
                              setValue('lightSchedulePreset', option, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            className={cn(
                              'w-28 rounded-3xl border p-3.5',
                              selected
                                ? 'border-primary bg-card dark:border-primary-bright dark:bg-dark-bg-card'
                                : 'border-border bg-card dark:border-dark-border dark:bg-dark-bg-card'
                            )}
                          >
                            <Text className="text-center text-[22px] font-black text-text dark:text-text-primary-dark">
                              {t(`step3.lightScheduleOptions.${labelKey}`)}
                            </Text>
                            <Text className="mt-1 text-center text-xs text-text-secondary dark:text-text-secondary-dark">
                              {t(`step3.lightScheduleOptions.${subtitleKey}`)}
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                </ScrollView>

                <StepFieldLabel label={t('step3.targets')} />
                <View className="mb-4 flex-row gap-3">
                  <View className="flex-1 rounded-[28px] border border-border bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card">
                    <View className="mb-1 flex-row items-center gap-2">
                      <Thermometer size={16} color={Colors.warning} />
                      <Text className="text-xs font-black uppercase text-text-secondary dark:text-text-secondary-dark">
                        {t('step3.tempDay')}
                      </Text>
                    </View>
                    <TextInput
                      accessibilityRole="text"
                      accessibilityLabel={t('step3.tempDay')}
                      accessibilityHint={t('step3.tempDay')}
                      keyboardType="numeric"
                      value={targetTempDay}
                      onChangeText={(next) =>
                        setValue('targetTempDay', next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="py-1 text-[22px] font-black text-text dark:text-text-primary-dark"
                      style={{
                        color: isDark ? Colors.textPrimaryDark : Colors.text,
                      }}
                    />
                  </View>

                  <View className="flex-1 rounded-[28px] border border-border bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card">
                    <View className="mb-1 flex-row items-center gap-2">
                      <Thermometer size={16} color={Colors.indoorAccent} />
                      <Text className="text-xs font-black uppercase text-text-secondary dark:text-text-secondary-dark">
                        {t('step3.tempNight')}
                      </Text>
                    </View>
                    <TextInput
                      accessibilityRole="text"
                      accessibilityLabel={t('step3.tempNight')}
                      accessibilityHint={t('step3.tempNight')}
                      keyboardType="numeric"
                      value={targetTempNight}
                      onChangeText={(next) =>
                        setValue('targetTempNight', next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="py-1 text-[22px] font-black text-text dark:text-text-primary-dark"
                      style={{
                        color: isDark ? Colors.textPrimaryDark : Colors.text,
                      }}
                    />
                  </View>
                </View>

                <View className="mb-4 rounded-[28px] border border-border bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="mb-1 flex-row items-center gap-2">
                    <Droplets size={16} color={Colors.indoorAccent} />
                    <Text className="text-xs font-black uppercase text-text-secondary dark:text-text-secondary-dark">
                      {t('step3.humidity')}
                    </Text>
                  </View>
                  <TextInput
                    accessibilityRole="text"
                    accessibilityLabel={t('step3.humidity')}
                    accessibilityHint={t('step3.humidity')}
                    keyboardType="numeric"
                    value={targetHumidity}
                    onChangeText={(next) =>
                      setValue('targetHumidity', next, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="py-1 text-[22px] font-black text-text dark:text-text-primary-dark"
                    style={{
                      color: isDark ? Colors.textPrimaryDark : Colors.text,
                    }}
                  />
                </View>

                <View className="mb-4 rounded-[28px] border border-border bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="mb-2 flex-row items-center gap-2">
                    <Leaf size={16} color={Colors.phPurple} />
                    <Text className="text-xs font-black uppercase text-text-secondary dark:text-text-secondary-dark">
                      {t('step3.phRange')}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <TextInput
                      accessibilityRole="text"
                      accessibilityLabel={t('step3.phRange')}
                      accessibilityHint={t('step3.phRange')}
                      keyboardType="numeric"
                      value={targetPhMin}
                      onChangeText={(next) =>
                        setValue('targetPhMin', next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="flex-1 rounded-xl bg-background px-3 py-2 text-center text-[20px] font-black text-text dark:bg-dark-bg dark:text-text-primary-dark"
                      style={{
                        color: isDark ? Colors.textPrimaryDark : Colors.text,
                      }}
                    />
                    <Text className="text-2xl font-bold text-text-secondary dark:text-text-secondary-dark">
                      -
                    </Text>
                    <TextInput
                      accessibilityRole="text"
                      accessibilityLabel={t('step3.phRange')}
                      accessibilityHint={t('step3.phRange')}
                      keyboardType="numeric"
                      value={targetPhMax}
                      onChangeText={(next) =>
                        setValue('targetPhMax', next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="flex-1 rounded-xl bg-background px-3 py-2 text-center text-[20px] font-black text-text dark:bg-dark-bg dark:text-text-primary-dark"
                      style={{
                        color: isDark ? Colors.textPrimaryDark : Colors.text,
                      }}
                    />
                  </View>
                </View>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <View className="mb-4 rounded-[28px] border border-border bg-card p-5 dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-[22px] font-black text-text dark:text-text-primary-dark">
                        {t('step4.autoCreateTasks')}
                      </Text>
                      <Text className="mt-1 text-[15px] text-text-secondary dark:text-text-secondary-dark">
                        {t('step4.autoCreateTasksHint')}
                      </Text>
                    </View>
                    <Switch
                      value={autoCreateTasks}
                      onValueChange={(next) => {
                        setValue('autoCreateTasks', next, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      trackColor={{
                        false: isDark ? Colors.darkBorderBright : Colors.border,
                        true: Colors.primary,
                      }}
                      thumbColor={Colors.white}
                    />
                  </View>
                </View>

                {!autoCreateTasks ? (
                  <>
                    <View className="mb-4 rounded-3xl border border-border bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card">
                      <View className="mb-4 flex-row items-center gap-3">
                        <Droplets size={20} color={Colors.indoorAccent} />
                        <Text className="text-[18px] font-black text-text dark:text-text-primary-dark">
                          {t('step4.wateringCadence')}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between gap-4">
                        <Text className="text-[15px] text-text-secondary dark:text-text-secondary-dark">
                          {t('step4.every')}
                        </Text>
                        <NumberStepper
                          value={Number(wateringCadenceDays || '1') || 1}
                          onChange={(next) => {
                            setValue('wateringCadenceDays', String(next), {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        />
                        <Text className="text-[15px] text-text-secondary dark:text-text-secondary-dark">
                          {t('step4.days')}
                        </Text>
                      </View>
                    </View>

                    <View className="mb-4 rounded-3xl border border-border bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card">
                      <View className="mb-4 flex-row items-center gap-3">
                        <Leaf size={20} color={Colors.warning} />
                        <Text className="text-[18px] font-black text-text dark:text-text-primary-dark">
                          {t('step4.feedingCadence')}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between gap-4">
                        <Text className="text-[15px] text-text-secondary dark:text-text-secondary-dark">
                          {t('step4.every')}
                        </Text>
                        <NumberStepper
                          value={Number(feedingCadenceDays || '1') || 1}
                          onChange={(next) => {
                            setValue('feedingCadenceDays', String(next), {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        />
                        <Text className="text-[15px] text-text-secondary dark:text-text-secondary-dark">
                          {t('step4.days')}
                        </Text>
                      </View>
                    </View>

                    <StepFieldLabel label={t('step4.reminderTime')} />
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        openPicker('reminderTimeLocal');
                      }}
                      className="mb-4 flex-row items-center justify-between rounded-3xl border border-border bg-card px-5 py-4 dark:border-dark-border dark:bg-dark-bg-card"
                    >
                      <Text className="text-[18px] font-semibold text-text dark:text-text-primary-dark">
                        {formatTimeLabel(reminderTimeLocal)}
                      </Text>
                      <View className="flex-row items-center gap-3">
                        <Clock3 size={20} color={Colors.text} />
                        <PlatformIcon
                          sfName="clock"
                          fallbackIcon={Clock3}
                          size={18}
                          color={isDark ? Colors.textPrimaryDark : Colors.text}
                        />
                      </View>
                    </Pressable>
                  </>
                ) : null}

                <StepFieldLabel label={t('step4.notes')} />
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <BaseInput
                      placeholder={t('step4.notesPlaceholder')}
                      value={field.value ?? ''}
                      onChangeText={field.onChange}
                      multiline
                      numberOfLines={4}
                      icon={<Pencil size={20} color={Colors.textMuted} />}
                    />
                  )}
                />

                <StepFieldLabel label={t('step4.initialPhoto')} />
                <Pressable
                  accessibilityRole="button"
                  onPress={pickPlantImage}
                  className="mb-2 min-h-40 items-center justify-center rounded-4xl border-2 border-dashed border-border bg-card px-4 py-5 dark:border-dark-border-bright dark:bg-dark-bg-card"
                >
                  {imageUrl ? (
                    <View className="w-full">
                      <Image
                        source={{ uri: imageUrl }}
                        className="h-52 w-full rounded-2xl"
                        contentFit="cover"
                      />
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          setValue('imageUrl', '', {
                            shouldDirty: true,
                            shouldValidate: false,
                          })
                        }
                        className="absolute right-3 top-3 rounded-full bg-black/45 p-2"
                      >
                        <CameraOff size={16} color={Colors.white} />
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <View className="mb-3 size-14 items-center justify-center rounded-full bg-border dark:bg-dark-bg-elevated">
                        <Camera size={24} color={Colors.textMuted} />
                      </View>
                      <Text className="text-center text-[16px] text-text-secondary dark:text-text-secondary-dark">
                        {t('step4.photoHint')}
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            ) : null}

            {Object.values(errors).length > 0 ? (
              <Text className="mt-2 text-sm font-semibold text-danger dark:text-error-dark">
                {tCommon('validation.required')}
              </Text>
            ) : null}

            {pickerField && isPickerVisible ? (
              <View className="border-border bg-card mt-3 rounded-3xl border p-4 shadow-sm dark:border-dark-border dark:bg-dark-bg-card">
                <DateTimePicker
                  value={getPickerValue()}
                  mode={pickerField === 'startDate' ? 'date' : 'time'}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onPickerChange}
                  maximumDate={
                    pickerField === 'startDate' ? new Date() : undefined
                  }
                />
                {Platform.OS === 'ios' ? (
                  <Button
                    onPress={closePicker}
                    className="mt-3 rounded-2xl"
                    textClassName="text-base"
                  >
                    {t('done')}
                  </Button>
                ) : null}
              </View>
            ) : null}

            <View
              className="pt-3"
              style={{
                paddingBottom: Math.max(insets.bottom, 12),
              }}
            >
              <Button
                onPress={handleNext}
                loading={isSubmitting}
                className="rounded-full py-4"
                rightIcon={<ArrowRight size={20} color={Colors.white} />}
                testID="next-step-btn"
              >
                {ctaLabel}
              </Button>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
