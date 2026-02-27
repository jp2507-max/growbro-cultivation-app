import { router, useLocalSearchParams } from 'expo-router';
import Stack from 'expo-router/stack';
import { Check, FlaskConical, Leaf, Sprout, X } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import {
  type FloweringType,
  type StrainFilterScope,
  useStrainFilters,
} from '@/src/hooks/use-strain-filters';
import {
  ALL_DIFFICULTIES,
  ALL_EFFECTS,
  ALL_FLAVORS,
} from '@/src/lib/strain-helpers';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';

interface PillChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  testID?: string;
}

function PillChip({
  label,
  isActive,
  onPress,
  icon,
  testID,
}: PillChipProps): React.ReactElement {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      className={cn(
        'items-center rounded-full border py-2.5',
        icon ? 'flex-row gap-1.5 px-4' : 'px-5',
        isActive
          ? 'border-primary bg-primary dark:border-primary-bright dark:bg-primary-bright'
          : 'border-border bg-card dark:border-dark-border-bright dark:bg-dark-bg-card'
      )}
      onPress={onPress}
    >
      {isActive && icon}
      <Text
        className={cn(
          'text-[14px] font-semibold',
          isActive
            ? 'text-white dark:text-on-primary-dark'
            : 'text-text-secondary dark:text-text-secondary-dark'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }): React.ReactElement {
  return (
    <View className="mb-3">
      <Text className="text-sm font-bold uppercase tracking-[1.4px] text-text-secondary dark:text-text-secondary-dark">
        {children}
      </Text>
    </View>
  );
}

const DIFFICULTY_ICONS = {
  Easy: Sprout,
  Medium: Leaf,
  Difficult: FlaskConical,
} as const;

const FLOWERING_TYPES: FloweringType[] = ['autoflower', 'photoperiod'];

function resolveFilterScope(
  value: string | string[] | undefined
): StrainFilterScope {
  if (value === 'favorites') return 'favorites';
  if (Array.isArray(value) && value.includes('favorites')) return 'favorites';
  return 'library';
}

export default function StrainFiltersScreen(): React.ReactElement {
  const { t } = useTranslation('strains');
  const { scope } = useLocalSearchParams<{ scope?: string | string[] }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const accentColor = isDark ? Colors.primaryBright : Colors.primary;
  const filterScope = resolveFilterScope(scope);

  const {
    filters,
    getMatchedCount,
    toggleEffect,
    toggleFlavor,
    setDifficulty,
    setFloweringType,
    resetAdvanced,
    activeAdvancedCount,
  } = useStrainFilters();
  const matchedCount = getMatchedCount(filterScope);
  const selectedCount = activeAdvancedCount();

  const hasActiveFilters =
    filters.effects.length > 0 ||
    filters.flavors.length > 0 ||
    !!filters.difficulty ||
    !!filters.floweringType;

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-bg"
      testID="filter-modal"
      collapsable={false}
    >
      <Stack.Screen
        options={{
          title: t('filters.title'),
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              testID="strain-filters-reset"
              onPress={resetAdvanced}
              className={cn(
                'flex-row items-center gap-1 rounded-lg px-1.5 py-1',
                !hasActiveFilters && 'opacity-45'
              )}
            >
              <X size={14} color={accentColor} />
              <Text className="text-sm font-semibold text-primary dark:text-primary-bright">
                {t('filters.reset')}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        collapsable={false}
      >
        <View className="mb-7">
          <SectionLabel>{t('filters.floweringType')}</SectionLabel>
          <View className="flex-row flex-wrap gap-2.5">
            {FLOWERING_TYPES.map((ft) => (
              <PillChip
                key={ft}
                testID={`filter-chip-${ft}`}
                label={t(`filters.${ft}`)}
                isActive={filters.floweringType === ft}
                onPress={() =>
                  setFloweringType(
                    filters.floweringType === ft ? undefined : ft
                  )
                }
              />
            ))}
          </View>
        </View>

        <View className="mb-7">
          <SectionLabel>{t('filters.difficulty')}</SectionLabel>
          <View className="flex-row gap-2.5">
            {ALL_DIFFICULTIES.map((d) => (
              <Pressable
                key={d}
                testID={`difficulty-chip-${d}`}
                accessibilityRole="button"
                onPress={() =>
                  setDifficulty(filters.difficulty === d ? undefined : d)
                }
                className={cn(
                  'flex-1 items-center rounded-2xl border bg-card px-3 py-3.5 dark:bg-dark-bg-card',
                  filters.difficulty === d
                    ? 'border-primary dark:border-primary-bright'
                    : 'border-border dark:border-dark-border'
                )}
              >
                {React.createElement(DIFFICULTY_ICONS[d], {
                  size: 18,
                  color:
                    filters.difficulty === d
                      ? accentColor
                      : isDark
                        ? Colors.textSecondaryDark
                        : Colors.textSecondary,
                })}
                <Text
                  className={cn(
                    'mt-2 text-center text-[13px] font-semibold',
                    filters.difficulty === d
                      ? 'text-text dark:text-text-primary-dark'
                      : 'text-text-secondary dark:text-text-secondary-dark'
                  )}
                >
                  {t(`difficulties.${d}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mb-7">
          <SectionLabel>{t('filters.effects')}</SectionLabel>
          <View className="flex-row flex-wrap gap-2.5">
            {ALL_EFFECTS.map((effect) => {
              const isActive = filters.effects.includes(effect);
              return (
                <PillChip
                  key={effect}
                  testID={`effect-chip-${effect}`}
                  label={t(`effectsList.${effect}`)}
                  isActive={isActive}
                  icon={
                    <Check
                      size={14}
                      color={isDark ? Colors.darkBg : Colors.white}
                      strokeWidth={3}
                    />
                  }
                  onPress={() => toggleEffect(effect)}
                />
              );
            })}
          </View>
        </View>

        <View>
          <SectionLabel>{t('filters.flavors')}</SectionLabel>
          <View className="flex-row flex-wrap gap-2.5 pb-2">
            {ALL_FLAVORS.map((flavor) => {
              const isActive = filters.flavors.includes(flavor);
              return (
                <PillChip
                  key={flavor}
                  testID={`flavor-chip-${flavor}`}
                  label={t(`flavorsList.${flavor}`, { defaultValue: flavor })}
                  isActive={isActive}
                  icon={
                    <Check
                      size={14}
                      color={isDark ? Colors.darkBg : Colors.white}
                      strokeWidth={3}
                    />
                  }
                  onPress={() => toggleFlavor(flavor)}
                />
              );
            })}
          </View>
        </View>

        <View
          className="px-5 pt-6"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            accessibilityRole="button"
            testID="strain-filters-show-results"
            className="h-14 items-center justify-center rounded-2xl bg-primary active:opacity-90 dark:bg-primary-bright"
            onPress={() => router.back()}
          >
            <Text className="text-[16px] font-bold text-white dark:text-on-primary-dark">
              {selectedCount > 0
                ? t('filters.applyCount', { count: selectedCount })
                : t('filters.apply')}
            </Text>
          </Pressable>
          <Text className="mt-2 text-center text-xs text-text-muted dark:text-text-muted-dark">
            {matchedCount > 0
              ? t('filters.showResultsCount', { count: matchedCount })
              : t('filters.showResults')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
