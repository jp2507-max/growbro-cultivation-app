import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Stack from 'expo-router/stack';
import { Leaf, SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, useWindowDimensions } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useStrainFilters } from '@/src/hooks/use-strain-filters';
import { useStrains } from '@/src/hooks/use-strains';
import { motion } from '@/src/lib/animations/motion';
import { type Strain } from '@/src/lib/instant';
import { thcPercent } from '@/src/lib/strain-helpers';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

const TYPE_FILTERS = ['All', 'Indica', 'Sativa', 'Hybrid'] as const;

const CARD_GAP = 10;
const HORIZONTAL_PADDING = 16;
const NUM_COLUMNS = 2;

// ---------------------------------------------------------------------------
// Type dot color mapping
// ---------------------------------------------------------------------------

const TYPE_DOT_COLORS: Record<string, { light: string; dark: string }> = {
  Indica: { light: '#7B1FA2', dark: '#c4b5fd' },
  Sativa: { light: '#F9A825', dark: '#fde68a' },
  Hybrid: { light: '#3B82F6', dark: '#bfdbfe' },
};

// ---------------------------------------------------------------------------
// StrainCard — image-forward overlay design
// ---------------------------------------------------------------------------

function StrainCard({
  strain,
  cardWidth,
  isDark,
  onPress,
}: {
  strain: Strain;
  cardWidth: number;
  isDark: boolean;
  onPress: () => void;
}) {
  const thc = thcPercent(strain);
  const cardHeight = Math.round(cardWidth * 1.1);
  const dotColors = TYPE_DOT_COLORS[strain.type] ?? TYPE_DOT_COLORS.Hybrid;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = useCallback(() => {
    scale.set(withSpring(0.97, motion.spring.snappy));
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.set(withSpring(1, motion.spring.gentle));
  }, [scale]);

  return (
    <Animated.View style={animatedStyle} className="mb-3">
      <Pressable
        accessibilityRole="button"
        className="overflow-hidden rounded-2xl"
        style={{ width: cardWidth, height: cardHeight }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`strain-${strain.id}`}
      >
        <Image
          source={{ uri: strain.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        {/* Bottom gradient for text legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: cardHeight * 0.45,
          }}
        />

        {/* THC badge — frosted pill top-right */}
        {thc > 0 && (
          <View
            className="absolute right-2 top-2 rounded-full px-2 py-0.5"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            <Text
              className="text-[11px] font-bold text-white"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {Math.round(thc)}%
            </Text>
          </View>
        )}

        {/* Text overlay — bottom */}
        <View className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          <Text
            className="text-[15px] font-bold leading-tight text-white"
            numberOfLines={1}
          >
            {strain.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <View
              className="size-2 rounded-full"
              style={{
                backgroundColor: isDark ? dotColors.dark : dotColors.light,
              }}
            />
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
              {strain.type}
            </Text>
            {strain.trait ? (
              <>
                <View className="size-[3px] rounded-full bg-white/40" />
                <Text
                  className="shrink text-[11px] text-white/60"
                  numberOfLines={1}
                >
                  {strain.trait}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Header right button
// ---------------------------------------------------------------------------

function HeaderRight({
  onPress,
  badgeCount,
}: {
  onPress: () => void;
  badgeCount: number;
}) {
  const colorScheme = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? Colors.textPrimaryDark : Colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="relative size-[42px] items-center justify-center rounded-full bg-card shadow-sm dark:bg-dark-bg-card"
      testID="filter-btn"
    >
      <SlidersHorizontal size={20} color={iconColor} />
      {badgeCount > 0 && (
        <View className="absolute -right-1 -top-1 size-[18px] items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
          <Text className="text-[10px] font-bold text-white dark:text-dark-bg">
            {badgeCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Type filter bar — underline indicator style
// ---------------------------------------------------------------------------

function TypeFilterBar({
  activeType,
  onSelect,
  isDark,
}: {
  activeType: string;
  onSelect: (type: string) => void;
  isDark: boolean;
}) {
  const { t } = useTranslation('strains');

  return (
    <View className="mb-3 mt-1 flex-row gap-1 px-1">
      {TYPE_FILTERS.map((f) => {
        const isActive = activeType === f;
        return (
          <Pressable
            accessibilityRole="button"
            key={f}
            className="items-center px-4 pb-2 pt-1"
            onPress={() => onSelect(f)}
            testID={`filter-${f}`}
          >
            <Text
              className={cn(
                'text-[13px] font-semibold',
                isActive
                  ? 'text-primary dark:text-primary-bright'
                  : 'text-text-muted dark:text-text-muted-dark'
              )}
            >
              {f === 'All' ? t('filters.all') : f}
            </Text>
            {isActive && (
              <View
                className="mt-1.5 h-[2px] w-full rounded-full"
                style={{
                  backgroundColor: isDark
                    ? Colors.primaryBright
                    : Colors.primary,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function StrainsScreen() {
  const { t } = useTranslation('strains');
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const cardWidth =
    (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) /
    NUM_COLUMNS;

  const { filters, setType, setSearch, activeAdvancedCount } =
    useStrainFilters();
  const badgeCount = activeAdvancedCount();

  const { strains, isLoading } = useStrains(filters);

  const openFilters = useCallback(() => {
    router.push('/strain-filters');
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Strain }) => (
      <View style={{ paddingHorizontal: CARD_GAP / 2 }}>
        <StrainCard
          strain={item}
          cardWidth={cardWidth}
          isDark={isDark}
          onPress={() =>
            router.push({ pathname: '/strain-detail', params: { id: item.id } })
          }
        />
      </View>
    ),
    [cardWidth, isDark, router]
  );

  const keyExtractor = useCallback((item: Strain) => item.id, []);

  const listHeader = useCallback(
    () => (
      <TypeFilterBar
        activeType={filters.type}
        onSelect={setType}
        isDark={isDark}
      />
    ),
    [filters.type, setType, isDark]
  );

  const listEmpty = useCallback(
    () =>
      isLoading ? (
        <View className="items-center justify-center py-10">
          <Text className="text-[15px] text-text-muted dark:text-text-muted-dark">
            {t('loading')}
          </Text>
        </View>
      ) : (
        <View className="items-center justify-center py-16">
          <View className="mb-4 size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/15">
            <Leaf
              size={28}
              color={isDark ? Colors.primaryBright : Colors.primary}
            />
          </View>
          <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
            {t('noStrainsTitle')}
          </Text>
          <Text className="mt-2 text-center text-[15px] text-text-secondary dark:text-text-secondary-dark">
            {t('noStrainsSubtitle')}
          </Text>
        </View>
      ),
    [isLoading, isDark, t]
  );

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderRight onPress={openFilters} badgeCount={badgeCount} />
          ),
          headerSearchBarOptions: {
            placeholder: t('searchPlaceholder'),
            onChangeText: (e) => setSearch(e.nativeEvent.text),
          },
        }}
      />

      <FlashList
        data={strains}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING - CARD_GAP / 2,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
