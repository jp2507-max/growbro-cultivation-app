import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import Stack from 'expo-router/stack';
import { Leaf, SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import HERO_FALLBACK_ASSET from '@/assets/images/strain-fallback.jpg';
import Colors from '@/constants/colors';
import { AdaptiveGlassSurface } from '@/src/components/ui/adaptive-glass-surface';
import { ListImage } from '@/src/components/ui/list-image';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useStrainFilters } from '@/src/hooks/use-strain-filters';
import { useStrains } from '@/src/hooks/use-strains';
import { motion, withRM } from '@/src/lib/animations/motion';
import { type Strain } from '@/src/lib/instant';
import { buildSearchBarOptions } from '@/src/lib/navigation/search-bar-options';
import { ROUTES } from '@/src/lib/routes';
import { thcPercent } from '@/src/lib/strain-helpers';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const TYPE_FILTERS = ['All', 'Indica', 'Sativa', 'Hybrid'] as const;

const CARD_GAP = 10;
const HORIZONTAL_PADDING = 16;
const NUM_COLUMNS = 2;
const GRID_ITEM_CONTAINER_STYLE = { paddingHorizontal: CARD_GAP / 2 };

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
  menuOpenTitle,
  onOpenDetail,
}: {
  strain: Strain;
  cardWidth: number;
  isDark: boolean;
  menuOpenTitle: string;
  onOpenDetail: (id: string) => void;
}) {
  const [hasImageError, setHasImageError] = React.useState(false);
  const thc = thcPercent(strain);
  const cardHeight = Math.round(cardWidth * 1.1);
  const dotColors = TYPE_DOT_COLORS[strain.type] ?? TYPE_DOT_COLORS.Hybrid;
  const detailHref = useMemo(
    () => ({
      pathname: ROUTES.STRAIN_DETAIL_PATHNAME,
      params: { id: strain.id },
    }),
    [strain.id]
  );

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .onBegin(() => {
          scale.set(withSpring(0.97, motion.spring.snappy));
        })
        .onFinalize(() => {
          scale.set(withSpring(1, motion.spring.gentle));
        }),
    [scale]
  );

  const handleOpen = useCallback(() => {
    onOpenDetail(strain.id);
  }, [onOpenDetail, strain.id]);

  return (
    <Animated.View style={animatedStyle} className="mb-3">
      <Link href={detailHref}>
        <Link.Trigger>
          <GestureDetector gesture={tapGesture}>
            <Pressable
              accessibilityRole="button"
              className="overflow-hidden rounded-2xl"
              style={{ width: cardWidth, height: cardHeight }}
              testID={`strain-${strain.id}`}
            >
              <ListImage
                source={
                  hasImageError || !strain.imageUrl
                    ? HERO_FALLBACK_ASSET
                    : { uri: strain.imageUrl }
                }
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
                recyclingKey={`${strain.id}:hero`}
                onError={() => setHasImageError(true)}
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
                <View className="absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 dark:bg-dark-bg-card/90">
                  <Text
                    className="text-[11px] font-bold text-white dark:text-text-primary-dark"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {Math.round(thc)}%
                  </Text>
                </View>
              )}

              {/* Text overlay — bottom */}
              <View className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                <Text
                  className="text-[15px] font-bold leading-tight text-white dark:text-text-primary-dark"
                  numberOfLines={1}
                >
                  {strain.name}
                </Text>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <View
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor: isDark
                        ? dotColors.dark
                        : dotColors.light,
                    }}
                  />
                  <Text className="text-[11px] font-semibold uppercase tracking-wide text-white/80 dark:text-text-secondary-dark/90">
                    {strain.type}
                  </Text>
                  {strain.trait ? (
                    <>
                      <View className="size-0.75 rounded-full bg-white/40 dark:bg-text-secondary-dark/50" />
                      <Text
                        className="shrink text-[11px] text-white/60 dark:text-text-muted-dark"
                        numberOfLines={1}
                      >
                        {strain.trait}
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
            </Pressable>
          </GestureDetector>
        </Link.Trigger>

        <Link.Preview
          style={{
            width: Math.round(cardWidth * 1.02),
            height: Math.round(cardHeight * 0.82),
          }}
        />
        <Link.Menu>
          <Link.MenuAction
            title={menuOpenTitle}
            icon="arrow.up.right"
            onPress={handleOpen}
          />
        </Link.Menu>
      </Link>
    </Animated.View>
  );
}

function StrainCardSkeleton({
  cardWidth,
}: {
  cardWidth: number;
}): React.ReactElement {
  const cardHeight = Math.round(cardWidth * 1.1);

  return (
    <View className="mb-3" style={{ width: cardWidth }}>
      <Skeleton
        className="overflow-hidden rounded-2xl"
        style={{ height: cardHeight }}
      />
      <View className="absolute bottom-3 left-3 right-3 gap-2">
        <Skeleton className="h-4 w-4/5 rounded-md bg-white/25 dark:bg-white/20" />
        <Skeleton className="h-3 w-1/2 rounded-md bg-white/20 dark:bg-white/15" />
      </View>
      <Skeleton className="absolute right-2 top-2 h-5 w-11 rounded-full bg-white/25 dark:bg-white/20" />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Header right button
// ---------------------------------------------------------------------------

function HeaderRight({
  badgeCount,
  menuOpenTitle,
  onOpen,
}: {
  badgeCount: number;
  menuOpenTitle: string;
  onOpen: () => void;
}) {
  const colorScheme = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? Colors.textPrimaryDark : Colors.text;

  return (
    <Link href={ROUTES.STRAIN_FILTERS}>
      <Link.Trigger>
        <AdaptiveGlassSurface
          isInteractive
          style={{ borderRadius: 21, overflow: 'hidden' }}
        >
          <Pressable
            accessibilityRole="button"
            className="relative size-10.5 items-center justify-center rounded-full bg-card/90 shadow-sm dark:bg-dark-bg-card/90"
            testID="filter-btn"
          >
            <PlatformIcon
              sfName="line.3.horizontal.decrease"
              fallbackIcon={SlidersHorizontal}
              size={20}
              color={iconColor}
            />
            {badgeCount > 0 && (
              <View className="absolute -right-1 -top-1 size-4.5 items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
                <Text className="text-[10px] font-bold text-white dark:text-on-primary-dark">
                  {badgeCount}
                </Text>
              </View>
            )}
          </Pressable>
        </AdaptiveGlassSurface>
      </Link.Trigger>
      <Link.Preview />
      <Link.Menu>
        <Link.MenuAction
          title={menuOpenTitle}
          icon="line.3.horizontal.decrease.circle"
          onPress={onOpen}
        />
      </Link.Menu>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Type filter bar — native SegmentedControl
// ---------------------------------------------------------------------------

function TypeFilterBar({
  activeType,
  onSelect,
}: {
  activeType: string;
  onSelect: (type: string) => void;
}) {
  const { t } = useTranslation('strains');
  const values = TYPE_FILTERS.map((f) => (f === 'All' ? t('filters.all') : f));
  const selectedIndex = Math.max(
    0,
    TYPE_FILTERS.indexOf(activeType as (typeof TYPE_FILTERS)[number])
  );

  return (
    <View className="mb-3 mt-1">
      <SegmentedControl
        values={values}
        selectedIndex={selectedIndex}
        onChange={({ nativeEvent }) =>
          onSelect(TYPE_FILTERS[nativeEvent.selectedSegmentIndex])
        }
      />
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
  const { push } = useRouter();

  const cardWidth =
    (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) /
    NUM_COLUMNS;

  const { filters, setType, setSearch, activeAdvancedCount } =
    useStrainFilters();
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const badgeCount = activeAdvancedCount();

  useEffect(() => {
    setSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearch]);

  const { strains, isLoading } = useStrains(filters);
  const loadingItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => `strain-skeleton-${index}`),
    []
  );

  const openFilters = useCallback(() => {
    push(ROUTES.STRAIN_FILTERS);
  }, [push]);

  const openStrainDetail = useCallback(
    (id: string) => {
      push({
        pathname: ROUTES.STRAIN_DETAIL_PATHNAME,
        params: { id },
      });
    },
    [push]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Strain; index: number }) => (
      <Animated.View
        style={GRID_ITEM_CONTAINER_STYLE}
        entering={withRM(FadeInUp.delay(index * 50).duration(motion.dur.md))}
        exiting={withRM(FadeOutUp.duration(motion.dur.sm))}
        layout={withRM(LinearTransition.duration(motion.dur.md))}
      >
        <StrainCard
          strain={item}
          cardWidth={cardWidth}
          isDark={isDark}
          menuOpenTitle={t('preview.openDetails')}
          onOpenDetail={openStrainDetail}
        />
      </Animated.View>
    ),
    [cardWidth, isDark, openStrainDetail, t]
  );

  const keyExtractor = useCallback((item: Strain) => item.id, []);
  const loadingKeyExtractor = useCallback((item: string) => item, []);

  const listHeader = useCallback(
    () => <TypeFilterBar activeType={filters.type} onSelect={setType} />,
    [filters.type, setType]
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
            <PlatformIcon
              sfName="leaf"
              fallbackIcon={Leaf}
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

  const renderLoadingItem = useCallback(
    () => (
      <View style={GRID_ITEM_CONTAINER_STYLE}>
        <StrainCardSkeleton cardWidth={cardWidth} />
      </View>
    ),
    [cardWidth]
  );

  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: HORIZONTAL_PADDING - CARD_GAP / 2,
      paddingBottom: 30,
    }),
    []
  );

  const searchBarOptions = useMemo(
    () =>
      buildSearchBarOptions({
        placeholder: t('searchPlaceholder'),
        onChangeText: setSearchQuery,
        onCancel: () => setSearchQuery(''),
      }),
    [t]
  );

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderRight
              onOpen={openFilters}
              badgeCount={badgeCount}
              menuOpenTitle={t('preview.openFilters')}
            />
          ),
          headerSearchBarOptions: searchBarOptions,
        }}
      />

      {isLoading ? (
        <FlashList
          data={loadingItems}
          renderItem={renderLoadingItem}
          keyExtractor={loadingKeyExtractor}
          numColumns={NUM_COLUMNS}
          ListHeaderComponent={listHeader}
          contentContainerStyle={listContentContainerStyle}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      ) : (
        <FlashList
          data={strains}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={NUM_COLUMNS}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={listContentContainerStyle}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}
    </View>
  );
}
