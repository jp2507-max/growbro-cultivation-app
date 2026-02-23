import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  Bug,
  Calendar,
  CheckCircle2,
  Clock3,
  Droplets,
  FlaskConical,
  Leaf,
  PencilLine,
  Save,
  Scissors,
  X,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { Button, ScreenContainer } from '@/src/components/ui';
import { cn } from '@/src/lib/utils';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from '@/src/tw';

type CareEntryType = 'water' | 'feed' | 'prune' | 'pest';
type VolumeUnit = 'L' | 'gal';
type PickerMode = 'date' | 'time' | null;
type EntryTypeLabelKey =
  | 'careLog.entryTypes.water'
  | 'careLog.entryTypes.feed'
  | 'careLog.entryTypes.prune'
  | 'careLog.entryTypes.pest';
type EntryTypeOption = {
  id: CareEntryType;
  labelKey: EntryTypeLabelKey;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  idleIconColor: string;
  idleIconBgClassName: string;
};

const ENTRY_TYPE_OPTIONS: readonly EntryTypeOption[] = [
  {
    id: 'water',
    labelKey: 'careLog.entryTypes.water',
    icon: Droplets,
    idleIconColor: '#3B82F6',
    idleIconBgClassName: 'bg-blue-100 dark:bg-blue-950/35',
  },
  {
    id: 'feed',
    labelKey: 'careLog.entryTypes.feed',
    icon: Leaf,
    idleIconColor: Colors.primary,
    idleIconBgClassName: 'bg-primary/15 dark:bg-primary/25',
  },
  {
    id: 'prune',
    labelKey: 'careLog.entryTypes.prune',
    icon: Scissors,
    idleIconColor: '#D97706',
    idleIconBgClassName: 'bg-amber-100 dark:bg-amber-950/35',
  },
  {
    id: 'pest',
    labelKey: 'careLog.entryTypes.pest',
    icon: Bug,
    idleIconColor: '#EF4444',
    idleIconBgClassName: 'bg-red-100 dark:bg-red-950/35',
  },
];

function sanitizeDecimalInput(nextValue: string): string {
  return nextValue.replace(/[^0-9.]/g, '');
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatEntryTime(value: Date): string {
  return value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function resolveNextDate(baseDate: Date, selected: Date): Date {
  const nextDate = new Date(baseDate);
  nextDate.setFullYear(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate()
  );
  return nextDate;
}

function resolveNextTime(baseDate: Date, selected: Date): Date {
  const nextDate = new Date(baseDate);
  nextDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
  return nextDate;
}

export function CareLogEntryScreen(): React.ReactElement {
  const { t } = useTranslation('garden');
  const tCommon = useTranslation('common').t;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [entryType, setEntryType] = useState<CareEntryType>('feed');
  const [amount, setAmount] = useState<string>('2.5');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('L');
  const [nutrientN, setNutrientN] = useState<string>('5');
  const [nutrientP, setNutrientP] = useState<string>('3');
  const [nutrientK, setNutrientK] = useState<string>('4');
  const [phValue, setPhValue] = useState<string>('6.2');
  const [ecValue, setEcValue] = useState<string>('1200');
  const [note, setNote] = useState<string>('');
  const [entryDateTime, setEntryDateTime] = useState<Date>(new Date());
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const amountNumber = Number(amount);
  const isAmountValid = Number.isFinite(amountNumber) && amountNumber > 0;
  const phNumber = Number(phValue);
  const isPhValueValid = Number.isFinite(phNumber) && phNumber > 0;
  const amountProgress = useMemo(() => {
    if (!amount.trim().length) return 0;
    if (!isAmountValid) return 20;
    return Math.max(24, Math.min(100, amountNumber * 20));
  }, [amount, amountNumber, isAmountValid]);
  const dateLabel = useMemo(() => {
    if (isSameDay(entryDateTime, new Date())) return tCommon('today');
    return entryDateTime.toLocaleDateString();
  }, [entryDateTime, tCommon]);
  const timeLabel = useMemo(
    () => formatEntryTime(entryDateTime),
    [entryDateTime]
  );

  const handleClose = useCallback((): void => {
    router.back();
  }, []);

  const handleOpenDatePicker = useCallback((): void => {
    setPickerMode('date');
  }, []);

  const handleOpenTimePicker = useCallback((): void => {
    setPickerMode('time');
  }, []);

  const handleClosePicker = useCallback((): void => {
    setPickerMode(null);
  }, []);

  const handlePickerChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date): void => {
      if (Platform.OS === 'android') setPickerMode(null);
      if (event.type === 'dismissed' || !selected || !pickerMode) return;

      const nextDate =
        pickerMode === 'date'
          ? resolveNextDate(entryDateTime, selected)
          : resolveNextTime(entryDateTime, selected);

      setEntryDateTime(nextDate);
    },
    [entryDateTime, pickerMode]
  );

  const handleSave = useCallback((): void => {
    if (!isAmountValid) {
      Alert.alert(tCommon('error'), t('careLog.errors.invalidAmount'));
      return;
    }

    if (process.env.EXPO_OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    router.back();
  }, [isAmountValid, t, tCommon]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pb-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
          >
            <View className="flex-row items-center justify-between pt-3">
              <Text className="text-text text-[30px] font-extrabold tracking-tight dark:text-text-primary-dark">
                {t('careLog.title')}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('careLog.a11y.closeLabel')}
                accessibilityHint={t('careLog.a11y.closeHint')}
                className="border-border-light dark:border-dark-border size-10 items-center justify-center rounded-full border bg-card dark:bg-dark-bg-card"
                onPress={handleClose}
                testID="close-care-log-sheet"
              >
                <X
                  size={18}
                  color={isDark ? Colors.textPrimaryDark : Colors.textSecondary}
                />
              </Pressable>
            </View>

            <View className="mt-5 flex-row gap-3">
              {ENTRY_TYPE_OPTIONS.map((option) => {
                const isSelected = option.id === entryType;
                const OptionIcon = option.icon;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    className={cn(
                      'flex-1 items-center rounded-2xl border p-2.5',
                      isSelected
                        ? 'border-primary bg-primary/10 dark:border-primary-bright dark:bg-primary/20'
                        : 'border-transparent bg-transparent'
                    )}
                    onPress={() => setEntryType(option.id)}
                    testID={`care-log-type-${option.id}`}
                  >
                    <View
                      className={cn(
                        'size-12 items-center justify-center rounded-xl',
                        isSelected
                          ? 'bg-primary dark:bg-primary-bright'
                          : option.idleIconBgClassName
                      )}
                    >
                      <OptionIcon
                        size={23}
                        color={isSelected ? Colors.white : option.idleIconColor}
                      />
                    </View>
                    <Text
                      className={cn(
                        'mt-2 text-xs font-semibold',
                        isSelected
                          ? 'text-primary dark:text-primary-bright'
                          : 'text-text-secondary dark:text-text-secondary-dark'
                      )}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-7">
              <Text className="text-text text-[18px] font-bold dark:text-text-primary-dark">
                {t('careLog.amount')}
              </Text>
              <View className="mt-2 flex-row items-end gap-3">
                <View className="flex-1">
                  <TextInput
                    accessibilityLabel={t('careLog.a11y.amountLabel')}
                    accessibilityHint={t('careLog.a11y.amountHint')}
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(next) =>
                      setAmount(sanitizeDecimalInput(next))
                    }
                    placeholder={t('careLog.amountPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    className="text-text dark:text-text-primary-dark text-[44px] font-black tracking-tight"
                    testID="care-log-amount-input"
                  />
                  <View className="bg-border-light dark:bg-dark-border mt-1 h-[2px] rounded-full">
                    <View
                      className="h-[2px] rounded-full bg-primary dark:bg-primary-bright"
                      style={{ width: `${amountProgress}%` }}
                    />
                  </View>
                </View>

                <View className="border-border-light dark:border-dark-border flex-row rounded-xl border bg-card p-1 dark:bg-dark-bg-card">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: volumeUnit === 'L' }}
                    className={cn(
                      'rounded-lg px-3.5 py-2.5',
                      volumeUnit === 'L'
                        ? 'bg-background dark:bg-dark-bg'
                        : 'bg-transparent'
                    )}
                    onPress={() => setVolumeUnit('L')}
                    testID="care-log-unit-liters"
                  >
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        volumeUnit === 'L'
                          ? 'text-text dark:text-text-primary-dark'
                          : 'text-text-muted dark:text-text-muted-dark'
                      )}
                    >
                      {t('careLog.units.liters')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: volumeUnit === 'gal' }}
                    className={cn(
                      'rounded-lg px-3 py-2.5',
                      volumeUnit === 'gal'
                        ? 'bg-background dark:bg-dark-bg'
                        : 'bg-transparent'
                    )}
                    onPress={() => setVolumeUnit('gal')}
                    testID="care-log-unit-gal"
                  >
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        volumeUnit === 'gal'
                          ? 'text-text dark:text-text-primary-dark'
                          : 'text-text-muted dark:text-text-muted-dark'
                      )}
                    >
                      {t('careLog.units.gallons')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {entryType === 'feed' ? (
              <View className="border-border-light dark:border-dark-border mt-6 rounded-3xl border bg-card p-4 dark:bg-dark-bg-card">
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <FlaskConical size={18} color={Colors.primary} />
                    <Text className="text-text text-[20px] font-bold dark:text-text-primary-dark">
                      {t('careLog.nutrients.title')}
                    </Text>
                  </View>
                  <Text className="text-text-muted text-[10px] font-black uppercase tracking-wide dark:text-text-muted-dark">
                    {t('careLog.nutrients.analysis')}
                  </Text>
                </View>

                <View className="flex-row items-end gap-2">
                  <View className="flex-1">
                    <Text className="text-text-muted mb-1 text-center text-xs font-semibold dark:text-text-muted-dark">
                      {t('careLog.nutrients.n')}
                    </Text>
                    <TextInput
                      accessibilityLabel={t('careLog.a11y.nutrientNLabel')}
                      accessibilityHint={t('careLog.a11y.nutrientNHint')}
                      keyboardType="number-pad"
                      value={nutrientN}
                      onChangeText={(next) =>
                        setNutrientN(sanitizeDecimalInput(next))
                      }
                      className="border-border-light dark:border-dark-border bg-background dark:bg-dark-bg text-text dark:text-text-primary-dark h-11 rounded-2xl border text-center text-[26px] font-black"
                      testID="care-log-nutrient-n"
                    />
                  </View>
                  <Text className="text-text-muted pb-2 text-xl font-bold dark:text-text-muted-dark">
                    -
                  </Text>
                  <View className="flex-1">
                    <Text className="text-text-muted mb-1 text-center text-xs font-semibold dark:text-text-muted-dark">
                      {t('careLog.nutrients.p')}
                    </Text>
                    <TextInput
                      accessibilityLabel={t('careLog.a11y.nutrientPLabel')}
                      accessibilityHint={t('careLog.a11y.nutrientPHint')}
                      keyboardType="number-pad"
                      value={nutrientP}
                      onChangeText={(next) =>
                        setNutrientP(sanitizeDecimalInput(next))
                      }
                      className="border-border-light dark:border-dark-border bg-background dark:bg-dark-bg text-text dark:text-text-primary-dark h-11 rounded-2xl border text-center text-[26px] font-black"
                      testID="care-log-nutrient-p"
                    />
                  </View>
                  <Text className="text-text-muted pb-2 text-xl font-bold dark:text-text-muted-dark">
                    -
                  </Text>
                  <View className="flex-1">
                    <Text className="text-text-muted mb-1 text-center text-xs font-semibold dark:text-text-muted-dark">
                      {t('careLog.nutrients.k')}
                    </Text>
                    <TextInput
                      accessibilityLabel={t('careLog.a11y.nutrientKLabel')}
                      accessibilityHint={t('careLog.a11y.nutrientKHint')}
                      keyboardType="number-pad"
                      value={nutrientK}
                      onChangeText={(next) =>
                        setNutrientK(sanitizeDecimalInput(next))
                      }
                      className="border-border-light dark:border-dark-border bg-background dark:bg-dark-bg text-text dark:text-text-primary-dark h-11 rounded-2xl border text-center text-[26px] font-black"
                      testID="care-log-nutrient-k"
                    />
                  </View>
                </View>

                <View className="mt-3 flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-text-muted mb-1 text-xs font-semibold dark:text-text-muted-dark">
                      {t('careLog.nutrients.ph')}
                    </Text>
                    <View className="relative">
                      <TextInput
                        accessibilityLabel={t('careLog.a11y.phLabel')}
                        accessibilityHint={t('careLog.a11y.phHint')}
                        keyboardType="decimal-pad"
                        value={phValue}
                        onChangeText={(next) =>
                          setPhValue(sanitizeDecimalInput(next))
                        }
                        className={cn(
                          'bg-background dark:bg-dark-bg text-text dark:text-text-primary-dark h-11 rounded-2xl border px-3 pr-9 text-[22px] font-black',
                          isPhValueValid
                            ? 'border-primary dark:border-primary-bright'
                            : 'border-border-light dark:border-dark-border'
                        )}
                        testID="care-log-ph-input"
                      />
                      {isPhValueValid ? (
                        <CheckCircle2
                          size={16}
                          color={Colors.primary}
                          style={{
                            position: 'absolute',
                            right: 11,
                            top: 14,
                          }}
                        />
                      ) : null}
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-text-muted mb-1 text-xs font-semibold dark:text-text-muted-dark">
                      {t('careLog.nutrients.ec')}
                    </Text>
                    <TextInput
                      accessibilityLabel={t('careLog.a11y.ecLabel')}
                      accessibilityHint={t('careLog.a11y.ecHint')}
                      keyboardType="number-pad"
                      value={ecValue}
                      onChangeText={(next) =>
                        setEcValue(sanitizeDecimalInput(next))
                      }
                      className="border-border-light dark:border-dark-border bg-background dark:bg-dark-bg text-text dark:text-text-primary-dark h-11 rounded-2xl border px-3 text-[22px] font-black"
                      testID="care-log-ec-input"
                    />
                  </View>
                </View>
              </View>
            ) : null}

            <View className="mt-6">
              <View className="relative">
                <PencilLine
                  size={18}
                  color={isDark ? Colors.textMutedDark : Colors.textMuted}
                  style={{ position: 'absolute', left: 13, top: 14 }}
                />
                <TextInput
                  accessibilityLabel={t('careLog.a11y.noteLabel')}
                  accessibilityHint={t('careLog.a11y.noteHint')}
                  multiline
                  value={note}
                  onChangeText={setNote}
                  placeholder={t('careLog.quickNotePlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  className="border-border-light dark:border-dark-border bg-card dark:bg-dark-bg-card text-text dark:text-text-primary-dark min-h-14 rounded-2xl border py-3 pl-10 pr-4 text-sm"
                  textAlignVertical="top"
                  testID="care-log-note-input"
                />
              </View>

              <View className="mt-3 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary/15 px-3 py-3 dark:bg-primary/25"
                  onPress={handleOpenDatePicker}
                  testID="care-log-date-button"
                >
                  <Calendar size={16} color={Colors.primary} />
                  <Text className="text-primary dark:text-primary-bright text-[15px] font-semibold">
                    {dateLabel}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary/15 px-3 py-3 dark:bg-primary/25"
                  onPress={handleOpenTimePicker}
                  testID="care-log-time-button"
                >
                  <Clock3 size={16} color={Colors.primary} />
                  <Text className="text-primary dark:text-primary-bright text-[15px] font-semibold">
                    {timeLabel}
                  </Text>
                </Pressable>
              </View>

              {pickerMode ? (
                <View className="border-border-light dark:border-dark-border mt-3 rounded-3xl border bg-card p-4 dark:bg-dark-bg-card">
                  <DateTimePicker
                    value={entryDateTime}
                    mode={pickerMode}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handlePickerChange}
                    maximumDate={pickerMode === 'date' ? new Date() : undefined}
                  />
                  {Platform.OS === 'ios' ? (
                    <Button
                      onPress={handleClosePicker}
                      variant="secondary"
                      className="mt-3 rounded-2xl py-3"
                      textClassName="text-base"
                    >
                      {tCommon('done')}
                    </Button>
                  ) : null}
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View
            className="border-border-light dark:border-dark-border border-t bg-background px-5 pt-4 dark:bg-dark-bg"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Button
              className="rounded-[22px]"
              onPress={handleSave}
              disabled={!isAmountValid}
              leftIcon={<Save size={19} color={Colors.white} />}
              testID="care-log-save-btn"
            >
              {t('careLog.saveEntry')}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
