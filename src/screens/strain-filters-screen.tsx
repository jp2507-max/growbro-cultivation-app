import { router, useLocalSearchParams } from 'expo-router';
import Stack from 'expo-router/stack';
import { Check, FlaskConical, Leaf, Sprout, X } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import {
  type FloweringType,
  type StrainFilterScope,
  useStrainFilters,
} from '@/src/hooks/use-strain-filters';
import { motion, withRM } from '@/src/lib/animations/motion';
import {
  ALL_DIFFICULTIES,
  ALL_EFFECTS,
  ALL_FLAVORS,
} from '@/src/lib/strain-helpers';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

interface PillChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon?: React.ReactElement;
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
      {icon ? (
        <View className="h-3.5 w-3.5 items-center justify-center">
          <View style={{ opacity: isActive ? 1 : 0 }}>{icon}</View>
        </View>
      ) : null}
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

type FilterSectionKey = 'floweringType' | 'difficulty' | 'effects' | 'flavors';

const SECTION_ORDER: FilterSectionKey[] = [
  'floweringType',
  'difficulty',
  'effects',
  'flavors',
];

const EFFECTS_COLLAPSED_LIMIT_NARROW = 8;
const EFFECTS_COLLAPSED_LIMIT_WIDE = 10;
const FLAVORS_COLLAPSED_LIMIT_NARROW = 10;
const FLAVORS_COLLAPSED_LIMIT_WIDE = 12;

function getVisibleOptions<const T extends string>(
  options: readonly T[],
  {
    selected,
    isExpanded,
    collapsedLimit,
  }: {
    selected: readonly string[];
    isExpanded: boolean;
    collapsedLimit: number;
  }
): T[] {
  if (isExpanded) return [...options];

  const selectedSet = new Set(selected);
  const selectedInOptions = options.filter((option) => selectedSet.has(option));

  if (selectedInOptions.length >= collapsedLimit) return selectedInOptions;

  const nonSelected = options.filter((option) => !selectedSet.has(option));

  return [...selectedInOptions, ...nonSelected].slice(0, collapsedLimit);
}

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
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const accentColor = isDark ? Colors.primaryBright : Colors.primary;
  const filterScope = resolveFilterScope(scope);
  const isWideLayout = width >= 420;

  const effectsCollapsedLimit = isWideLayout
    ? EFFECTS_COLLAPSED_LIMIT_WIDE
    : EFFECTS_COLLAPSED_LIMIT_NARROW;
  const flavorsCollapsedLimit = isWideLayout
    ? FLAVORS_COLLAPSED_LIMIT_WIDE
    : FLAVORS_COLLAPSED_LIMIT_NARROW;

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
  const scrollRef = React.useRef<React.ElementRef<typeof ScrollView>>(null);

  const [activeSection, setActiveSection] =
    React.useState<FilterSectionKey>('floweringType');
  const [showAllEffects, setShowAllEffects] = React.useState(false);
  const [showAllFlavors, setShowAllFlavors] = React.useState(false);
  const sectionOffsetsRef = React.useRef<
    Partial<Record<FilterSectionKey, number>>
  >({});

  const visibleEffects = React.useMemo(
    () =>
      getVisibleOptions(ALL_EFFECTS, {
        selected: filters.effects,
        isExpanded: showAllEffects,
        collapsedLimit: effectsCollapsedLimit,
      }),
    [effectsCollapsedLimit, filters.effects, showAllEffects]
  );

  const visibleFlavors = React.useMemo(
    () =>
      getVisibleOptions(ALL_FLAVORS, {
        selected: filters.flavors,
        isExpanded: showAllFlavors,
        collapsedLimit: flavorsCollapsedLimit,
      }),
    [filters.flavors, flavorsCollapsedLimit, showAllFlavors]
  );

  const hiddenEffectsCount = ALL_EFFECTS.length - visibleEffects.length;
  const hiddenFlavorsCount = ALL_FLAVORS.length - visibleFlavors.length;

  const hasActiveFilters =
    filters.effects.length > 0 ||
    filters.flavors.length > 0 ||
    !!filters.difficulty ||
    !!filters.floweringType;

  const sectionTitles: Record<FilterSectionKey, string> = {
    floweringType: t('filters.floweringType'),
    difficulty: t('filters.difficulty'),
    effects: t('filters.effects'),
    flavors: t('filters.flavors'),
  };

  const setSectionOffset = React.useCallback(
    (section: FilterSectionKey, offsetY: number) => {
      const current = sectionOffsetsRef.current[section];
      if (current != null && Math.abs(current - offsetY) < 12) return;
      sectionOffsetsRef.current[section] = offsetY;
    },
    []
  );

  const handleQuickNavPress = React.useCallback((section: FilterSectionKey) => {
    const offsetY = sectionOffsetsRef.current[section];
    if (offsetY == null) return;

    scrollRef.current?.scrollTo({
      y: Math.max(0, offsetY - 12),
      animated: true,
    });
    setActiveSection(section);
  }, []);

  const updateActiveSection = React.useCallback((scrollY: number) => {
    const availableSections = SECTION_ORDER.filter(
      (section) => sectionOffsetsRef.current[section] != null
    );
    if (availableSections.length === 0) return;

    let nextSection = availableSections[0];

    for (const section of availableSections) {
      const sectionY = sectionOffsetsRef.current[section] ?? 0;
      if (scrollY + 56 >= sectionY) nextSection = section;
    }

    setActiveSection((current) =>
      current === nextSection ? current : nextSection
    );
  }, []);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    updateActiveSection(event.nativeEvent.contentOffset.y);
  }

  function renderSectionCard(
    section: FilterSectionKey,
    content: React.ReactElement,
    index: number
  ): React.ReactElement {
    return (
      <Animated.View
        key={section}
        entering={withRM(
          FadeInUp.delay(Math.min(index * 50, 180)).duration(motion.dur.sm)
        )}
        onLayout={(event) =>
          setSectionOffset(section, event.nativeEvent.layout.y)
        }
        className="mb-5 rounded-2xl border border-border bg-card p-4 dark:border-dark-border dark:bg-dark-bg-card"
      >
        {content}
      </Animated.View>
    );
  }

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

      <View className="border-b border-border px-5 pb-3 pt-2 dark:border-dark-border">
        <View className="flex-row flex-wrap gap-2">
          {SECTION_ORDER.map((section) => {
            const isActive = activeSection === section;

            return (
              <Pressable
                key={section}
                accessibilityRole="button"
                className={cn(
                  'rounded-full border px-4.5 py-2',
                  isActive
                    ? 'border-primary bg-primary/10 dark:border-primary-bright dark:bg-primary-bright/15'
                    : 'border-border bg-background dark:border-dark-border dark:bg-dark-bg'
                )}
                onPress={() => handleQuickNavPress(section)}
              >
                <Text
                  className={cn(
                    'text-[13px] font-semibold',
                    isActive
                      ? 'text-primary dark:text-primary-bright'
                      : 'text-text-secondary dark:text-text-secondary-dark'
                  )}
                >
                  {sectionTitles[section]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        contentContainerClassName="pb-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        collapsable={false}
      >
        {renderSectionCard(
          'floweringType',
          <>
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
          </>,
          0
        )}

        {renderSectionCard(
          'difficulty',
          <>
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
                    'flex-1 items-center rounded-2xl border bg-background px-3 py-3.5 dark:bg-dark-bg',
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
          </>,
          1
        )}

        {renderSectionCard(
          'effects',
          <>
            <View className="mb-3 flex-row items-center justify-between gap-2">
              <SectionLabel>{t('filters.effects')}</SectionLabel>
              {(showAllEffects || hiddenEffectsCount > 0) && (
                <Pressable
                  accessibilityRole="button"
                  testID="strain-filters-toggle-effects"
                  className="rounded-full border border-border bg-background px-3 py-1 dark:border-dark-border dark:bg-dark-bg"
                  onPress={() => setShowAllEffects((current) => !current)}
                >
                  <Text className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark">
                    {showAllEffects
                      ? t('filters.showLess')
                      : t('filters.showAllCount', {
                          count: hiddenEffectsCount,
                        })}
                  </Text>
                </Pressable>
              )}
            </View>
            <View className="flex-row flex-wrap gap-2.5">
              {visibleEffects.map((effect) => {
                const isActive = filters.effects.includes(effect);
                return (
                  <PillChip
                    key={effect}
                    testID={`effect-chip-${effect}`}
                    label={t(`effectsList.${effect}` as const)}
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
          </>,
          2
        )}

        {renderSectionCard(
          'flavors',
          <>
            <View className="mb-3 flex-row items-center justify-between gap-2">
              <SectionLabel>{t('filters.flavors')}</SectionLabel>
              {(showAllFlavors || hiddenFlavorsCount > 0) && (
                <Pressable
                  accessibilityRole="button"
                  testID="strain-filters-toggle-flavors"
                  className="rounded-full border border-border bg-background px-3 py-1 dark:border-dark-border dark:bg-dark-bg"
                  onPress={() => setShowAllFlavors((current) => !current)}
                >
                  <Text className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark">
                    {showAllFlavors
                      ? t('filters.showLess')
                      : t('filters.showAllCount', {
                          count: hiddenFlavorsCount,
                        })}
                  </Text>
                </Pressable>
              )}
            </View>
            <View className="flex-row flex-wrap gap-2.5 pb-1">
              {visibleFlavors.map((flavor) => {
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
          </>,
          3
        )}

        <View
          className="px-5 pb-1 pt-4"
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
