import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import {
  type FloweringType,
  useStrainFilters,
} from '@/src/hooks/use-strain-filters';
import { useStrains } from '@/src/hooks/use-strains';
import { ALL_DIFFICULTIES, ALL_EFFECTS } from '@/src/lib/strain-helpers';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'rounded-xl border px-5 py-2.5',
        active
          ? 'border-primary bg-primary/10 dark:border-primary-bright dark:bg-primary-bright/15'
          : 'border-border-light bg-transparent dark:border-dark-border'
      )}
      onPress={onPress}
    >
      <Text
        className={cn(
          'text-[13px] font-semibold',
          active
            ? 'text-primary dark:text-primary-bright'
            : 'text-text-secondary dark:text-text-secondary-dark'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function EffectChip({
  label,
  active,
  accentColor,
  onPress,
}: {
  label: string;
  active: boolean;
  accentColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'flex-row items-center gap-1.5 rounded-xl border px-4 py-2.5',
        active
          ? 'border-primary bg-primary/10 dark:border-primary-bright dark:bg-primary-bright/15'
          : 'border-border-light bg-transparent dark:border-dark-border'
      )}
      onPress={onPress}
    >
      {active && <Check size={14} color={accentColor} strokeWidth={3} />}
      <Text
        className={cn(
          'text-[13px] font-semibold',
          active
            ? 'text-primary dark:text-primary-bright'
            : 'text-text-secondary dark:text-text-secondary-dark'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({
  children,
  accentColor,
}: {
  children: string;
  accentColor: string;
}) {
  return (
    <View className="mb-3 flex-row items-center gap-2">
      <View
        className="h-4 w-0.5 rounded-full"
        style={{ backgroundColor: accentColor }}
      />
      <Text className="text-sm font-bold text-text dark:text-text-primary-dark">
        {children}
      </Text>
    </View>
  );
}

const FLOWERING_TYPES: FloweringType[] = ['autoflower', 'photoperiod'];

export default function StrainFiltersScreen() {
  const { t } = useTranslation('strains');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const accentColor = isDark ? Colors.primaryBright : Colors.primary;

  const {
    filters,
    toggleEffect,
    setDifficulty,
    setFloweringType,
    resetAdvanced,
  } = useStrainFilters();

  const { strains } = useStrains(filters);
  const resultCount = strains.length;

  const hasActiveFilters =
    filters.effects.length > 0 ||
    !!filters.difficulty ||
    !!filters.floweringType;

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="flex-row items-center justify-between bg-background pb-3 pt-5 dark:bg-dark-bg">
          <Text className="text-xl font-bold text-text dark:text-text-primary-dark">
            {t('filters.title')}
          </Text>
          {hasActiveFilters && (
            <Pressable
              accessibilityRole="button"
              onPress={resetAdvanced}
              className="flex-row items-center gap-1 rounded-lg px-2 py-1"
            >
              <X size={14} color={accentColor} />
              <Text className="text-sm font-semibold text-primary dark:text-primary-bright">
                {t('filters.reset')}
              </Text>
            </Pressable>
          )}
        </View>

        <SectionLabel accentColor={accentColor}>
          {t('filters.floweringType')}
        </SectionLabel>
        <View className="mb-8 flex-row flex-wrap gap-2.5">
          {FLOWERING_TYPES.map((ft) => (
            <FilterChip
              key={ft}
              label={t(`filters.${ft}`)}
              active={filters.floweringType === ft}
              onPress={() =>
                setFloweringType(filters.floweringType === ft ? undefined : ft)
              }
            />
          ))}
        </View>

        <SectionLabel accentColor={accentColor}>
          {t('filters.difficulty')}
        </SectionLabel>
        <View className="mb-8 flex-row flex-wrap gap-2.5">
          {ALL_DIFFICULTIES.map((d) => (
            <FilterChip
              key={d}
              label={t(`difficulties.${d}`)}
              active={filters.difficulty === d}
              onPress={() =>
                setDifficulty(filters.difficulty === d ? undefined : d)
              }
            />
          ))}
        </View>

        <SectionLabel accentColor={accentColor}>
          {t('filters.effects')}
        </SectionLabel>
        <View className="flex-row flex-wrap gap-2.5">
          {ALL_EFFECTS.map((effect) => {
            const active = filters.effects.includes(effect);
            return (
              <EffectChip
                key={effect}
                label={t(`effectsList.${effect}`)}
                active={active}
                accentColor={accentColor}
                onPress={() => toggleEffect(effect)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View className="relative">
        <LinearGradient
          colors={['transparent', isDark ? Colors.darkBg : Colors.background]}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -24,
            height: 24,
          }}
          pointerEvents="none"
        />
        <View
          className="px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            accessibilityRole="button"
            className="h-14 items-center justify-center rounded-2xl bg-primary active:opacity-90 dark:bg-primary-bright"
            onPress={() => router.back()}
          >
            <Text className="text-[16px] font-bold text-white dark:text-on-primary-dark">
              {resultCount > 0
                ? t('filters.showResultsCount', { count: resultCount })
                : t('filters.showResults')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
