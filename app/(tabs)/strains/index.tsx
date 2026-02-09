import { Image } from 'expo-image';
import { Link } from 'expo-router';
import Stack from 'expo-router/stack';
import { SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { type Strain, strainFilters, strains } from '@/mocks/strains';
import { motion, withRM } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;

const typeColors: Record<string, { bg: string; text: string }> = {
  Indica: { bg: Colors.indicaBadge, text: '#2E7D32' },
  Sativa: { bg: Colors.sativaBadge, text: '#F9A825' },
  Hybrid: { bg: Colors.hybridBadge, text: '#7B1FA2' },
};

function StrainCard({
  strain,
  cardWidth,
  index,
}: {
  strain: Strain;
  cardWidth: number;
  index: number;
}) {
  const colors = typeColors[strain.type] ?? typeColors.Hybrid;

  return (
    <Animated.View
      entering={withRM(FadeInUp.delay(index * 60).duration(motion.dur.md))}
      layout={withRM(LinearTransition.duration(motion.dur.md))}
    >
      <Link href={{ pathname: '/strain-detail', params: { id: strain.id } }}>
        <Link.Trigger>
          <Pressable
            accessibilityRole="button"
            className="mb-0.5 overflow-hidden rounded-[18px] bg-white shadow-md dark:bg-dark-bg-elevated"
            style={{ width: cardWidth }}
            testID={`strain-${strain.id}`}
          >
            <View
              className="relative w-full"
              style={{ height: cardWidth * 0.85 }}
            >
              <Image
                source={{ uri: strain.imageUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />
              <View className="absolute right-2.5 top-2.5 rounded-[10px] bg-black/55 px-2 py-1">
                <Text
                  className="text-xs font-bold text-white"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {strain.thc}%
                </Text>
              </View>
            </View>
            <View className="p-3">
              <Text
                className="mb-1.5 text-[15px] font-extrabold text-text dark:text-text-primary-dark"
                numberOfLines={1}
              >
                {strain.name}
              </Text>
              <View className="flex-row items-center gap-2">
                <View
                  className="rounded-md px-2 py-0.5"
                  style={{ backgroundColor: colors.bg }}
                >
                  <Text
                    className="text-[11px] font-bold"
                    style={{ color: colors.text }}
                  >
                    {strain.type}
                  </Text>
                </View>
                <Text className="text-xs text-textSecondary dark:text-text-secondary-dark">
                  {strain.trait}
                </Text>
              </View>
            </View>
          </Pressable>
        </Link.Trigger>
        <Link.Preview />
      </Link>
    </Animated.View>
  );
}

function HeaderRight() {
  return (
    <Pressable
      accessibilityRole="button"
      className="size-[42px] items-center justify-center rounded-full bg-white shadow-sm dark:bg-dark-bg-card"
      testID="filter-btn"
    >
      <SlidersHorizontal size={20} color={Colors.text} />
    </Pressable>
  );
}

export default function StrainsScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    let result = strains;
    if (activeFilter !== 'All') {
      result = result.filter((s) => s.type === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [search, activeFilter]);

  const handleFilter = useCallback((f: string) => {
    setActiveFilter(f);
  }, []);

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen
        options={{
          headerRight: () => <HeaderRight />,
          headerSearchBarOptions: {
            placeholder: 'Search strains...',
            onChangeText: (e) => setSearch(e.nativeEvent.text),
          },
        }}
      />

      <View className="mb-4 mt-3.5 flex-row gap-2 px-5">
        {strainFilters.map((f) => (
          <Pressable
            accessibilityRole="button"
            key={f}
            className={cn(
              'px-[18px] py-2 rounded-[20px] bg-white dark:bg-dark-bg-card border border-borderLight dark:border-dark-border',
              activeFilter === f &&
                'bg-primary dark:bg-primary-bright border-primary dark:border-primary-bright'
            )}
            onPress={() => handleFilter(f)}
            testID={`filter-${f}`}
          >
            <Text
              className={cn(
                'text-[13px] font-semibold text-textSecondary dark:text-text-secondary-dark',
                activeFilter === f && 'text-white dark:text-dark-bg'
              )}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="flex-row flex-wrap" style={{ gap: CARD_GAP }}>
          {filtered.map((strain, index) => (
            <StrainCard
              key={strain.id}
              strain={strain}
              cardWidth={cardWidth}
              index={index}
            />
          ))}
        </View>
        {filtered.length === 0 && (
          <View className="items-center py-10">
            <Text className="text-[15px] text-textMuted dark:text-text-muted-dark">
              No strains found
            </Text>
          </View>
        )}
        <View className="h-[30px]" />
      </ScrollView>
    </View>
  );
}
