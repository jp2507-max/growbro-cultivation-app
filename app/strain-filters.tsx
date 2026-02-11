import Stack from 'expo-router/stack';
import { Check, RotateCcw } from 'lucide-react-native';
import React from 'react';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { useStrainFilters } from '@/src/hooks/use-strain-filters';
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
        'px-[14px] py-[7px] rounded-[20px] border',
        'bg-white dark:bg-dark-bg-card border-borderLight dark:border-dark-border',
        active &&
          'bg-primary dark:bg-primary-bright border-primary dark:border-primary-bright'
      )}
      onPress={onPress}
    >
      <Text
        className={cn(
          'text-[12px] font-semibold text-textSecondary dark:text-text-secondary-dark',
          active && 'text-white dark:text-dark-bg'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function StrainFiltersModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const accentColor = isDark ? Colors.primaryBright : Colors.primary;

  const { filters, toggleEffect, setDifficulty, resetAdvanced } =
    useStrainFilters();

  const hasActiveFilters = filters.effects.length > 0 || !!filters.difficulty;

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <Stack.Screen
        options={{
          title: 'Filters',
          headerRight: hasActiveFilters
            ? () => (
                <Pressable
                  accessibilityRole="button"
                  onPress={resetAdvanced}
                  className="flex-row items-center gap-1 px-2"
                >
                  <RotateCcw size={14} color={accentColor} />
                  <Text className="text-primary dark:text-primary-bright text-sm font-semibold">
                    Reset
                  </Text>
                </Pressable>
              )
            : undefined,
        }}
      />

      <ScrollView
        className="px-5 pt-6"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Difficulty */}
        <Text className="text-textSecondary dark:text-text-secondary-dark mb-3 text-xs font-bold uppercase tracking-wide">
          Difficulty
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          <FilterChip
            label="Any"
            active={!filters.difficulty}
            onPress={() => setDifficulty(undefined)}
          />
          {ALL_DIFFICULTIES.map((d) => (
            <FilterChip
              key={d}
              label={d}
              active={filters.difficulty === d}
              onPress={() =>
                setDifficulty(filters.difficulty === d ? undefined : d)
              }
            />
          ))}
        </View>

        {/* Effects */}
        <Text className="text-textSecondary dark:text-text-secondary-dark mb-3 text-xs font-bold uppercase tracking-wide">
          Effects
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ALL_EFFECTS.map((effect) => {
            const active = filters.effects.includes(effect);
            return (
              <Pressable
                key={effect}
                accessibilityRole="button"
                className={cn(
                  'flex-row items-center gap-1 rounded-full border px-3 py-[6px]',
                  'bg-white dark:bg-dark-bg-elevated border-borderLight dark:border-dark-border',
                  active &&
                    'bg-primary/10 dark:bg-primary-bright/15 border-primary dark:border-primary-bright'
                )}
                onPress={() => toggleEffect(effect)}
              >
                {active && (
                  <Check size={12} color={accentColor} strokeWidth={3} />
                )}
                <Text
                  className={cn(
                    'text-[12px] font-semibold text-textSecondary dark:text-text-secondary-dark',
                    active && 'text-primary dark:text-primary-bright'
                  )}
                >
                  {effect}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
