import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import Stack from 'expo-router/stack';
import { BookOpen, Heart, Leaf } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { AdaptiveGlassSurface } from '@/src/components/ui/adaptive-glass-surface';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import {
  StrainListCard,
  StrainListCardSkeleton,
  StrainTypeChipBar,
} from '@/src/components/ui/strain-list';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useFavoriteStrains } from '@/src/hooks/use-favorite-strains';
import { useStrainFilters } from '@/src/hooks/use-strain-filters';
import { motion, withRM } from '@/src/lib/animations/motion';
import { type Strain } from '@/src/lib/instant';
import { buildSearchBarOptions } from '@/src/lib/navigation/search-bar-options';
import { ROUTES } from '@/src/lib/routes';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const HORIZONTAL_PADDING = 12;

function HeaderRight({
  badgeCount,
  onOpen,
}: {
  badgeCount: number;
  onOpen: () => void;
}): React.ReactElement {
  const { t } = useTranslation('strains');
  const colorScheme = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? Colors.textPrimaryDark : Colors.text;

  return (
    <AdaptiveGlassSurface
      isInteractive
      style={{ borderRadius: 21, overflow: 'hidden' }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('headerActions.openFiltersLabel')}
        accessibilityHint={t('headerActions.openFiltersHint')}
        onPress={onOpen}
        className="relative size-10.5 items-center justify-center rounded-full bg-card/90 shadow-sm dark:bg-dark-bg-card/90"
        testID="favorite-filter-button"
      >
        <PlatformIcon
          sfName="book.closed"
          fallbackIcon={BookOpen}
          size={19}
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
  );
}

export default function StrainFavoritesScreen(): React.ReactElement {
  const { t } = useTranslation('strains');
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { push } = useRouter();
  const { profile } = useAuth();

  const cardWidth = width - HORIZONTAL_PADDING * 2;

  const { filters, setType, setSearch, setMatchedCount, activeAdvancedCount } =
    useStrainFilters();
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const badgeCount = activeAdvancedCount();

  useEffect(() => {
    setSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearch]);

  const { strains, isLoading } = useFavoriteStrains(filters);

  useEffect(() => {
    setMatchedCount('favorites', strains.length);
  }, [setMatchedCount, strains.length]);

  const loadingItems = useMemo(
    () =>
      Array.from(
        { length: 5 },
        (_, index) => `favorite-strain-skeleton-${index}`
      ),
    []
  );

  const openFilters = useCallback(() => {
    push({
      pathname: ROUTES.STRAIN_FILTERS,
      params: { scope: 'favorites' },
    });
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
        entering={withRM(
          FadeInUp.delay(Math.min(index * 55, 280)).duration(motion.dur.md)
        )}
        exiting={withRM(FadeOutUp.duration(motion.dur.sm))}
        layout={withRM(LinearTransition.duration(motion.dur.md))}
      >
        <StrainListCard
          strain={item}
          cardWidth={cardWidth}
          menuOpenTitle={t('preview.openDetails')}
          onOpenDetail={openStrainDetail}
          testIDPrefix="favorite-strain"
        />
      </Animated.View>
    ),
    [cardWidth, openStrainDetail, t]
  );

  const listHeader = useCallback(
    () => (
      <View className="mb-6 mt-1 gap-4 px-1">
        <View className="flex-row items-center gap-2">
          <Heart
            size={14}
            color={isDark ? Colors.primaryBright : Colors.primary}
            fill={isDark ? Colors.primaryBright : Colors.primary}
          />
          <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary dark:text-primary-bright">
            {t('favorites.subtitle')}
          </Text>
        </View>
        <StrainTypeChipBar activeType={filters.type} onChangeType={setType} />
      </View>
    ),
    [filters.type, isDark, setType, t]
  );

  const listEmpty = useCallback(
    () =>
      isLoading ? (
        <View className="items-center justify-center py-10">
          <Text className="text-[15px] text-text-muted dark:text-text-muted-dark">
            {t('favorites.loading')}
          </Text>
        </View>
      ) : !profile ? (
        <View className="items-center justify-center py-16">
          <View className="mb-4 size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/15">
            <Heart
              size={28}
              color={isDark ? Colors.primaryBright : Colors.primary}
            />
          </View>
          <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
            {t('favorites.signInTitle')}
          </Text>
          <Text className="mt-2 text-center text-[15px] text-text-secondary dark:text-text-secondary-dark">
            {t('favorites.signInSubtitle')}
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
            {t('favorites.emptyTitle')}
          </Text>
          <Text className="mt-2 text-center text-[15px] text-text-secondary dark:text-text-secondary-dark">
            {t('favorites.emptySubtitle')}
          </Text>
        </View>
      ),
    [isLoading, isDark, profile, t]
  );

  const renderLoadingItem = useCallback(
    () => <StrainListCardSkeleton cardWidth={cardWidth} />,
    [cardWidth]
  );

  const keyExtractor = useCallback((item: Strain) => item.id, []);
  const loadingKeyExtractor = useCallback((item: string) => item, []);
  const getStrainItemType = useCallback(() => 'favorite-strain-card', []);
  const getSkeletonItemType = useCallback(() => 'favorite-strain-skeleton', []);

  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingBottom: 34,
    }),
    []
  );

  const searchBarOptions = useMemo(
    () =>
      buildSearchBarOptions({
        placeholder: t('favorites.searchPlaceholder', {
          defaultValue: t('searchPlaceholder'),
        }),
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
            <HeaderRight onOpen={openFilters} badgeCount={badgeCount} />
          ),
          headerSearchBarOptions: searchBarOptions,
        }}
      />

      {isLoading ? (
        <FlashList
          data={loadingItems}
          renderItem={renderLoadingItem}
          keyExtractor={loadingKeyExtractor}
          getItemType={getSkeletonItemType}
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
          getItemType={getStrainItemType}
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
