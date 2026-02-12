import { FlashList } from '@shopify/flash-list';
import { Link, useRouter } from 'expo-router';
import Stack from 'expo-router/stack';
import { BookOpen, SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';

import Colors from '@/constants/colors';
import { useStrainFilters } from '@/src/hooks/use-strain-filters';
import { useStrains } from '@/src/hooks/use-strains';
import { type Strain } from '@/src/lib/instant';
import { thcDisplay, typeColors } from '@/src/lib/strain-helpers';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';
import { Image } from '@/src/tw/image';

const TYPE_FILTERS = ['All', 'Indica', 'Sativa', 'Hybrid'] as const;

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;
const NUM_COLUMNS = 2;

// ---------------------------------------------------------------------------
// StrainCard
// ---------------------------------------------------------------------------

function StrainCard({
  strain,
  cardWidth,
  isDark,
}: {
  strain: Strain;
  cardWidth: number;
  isDark: boolean;
}) {
  const colors = typeColors[strain.type] ?? typeColors.Hybrid;
  const thc = thcDisplay(strain);

  return (
    <Link href={{ pathname: '/strain-detail', params: { id: strain.id } }}>
      <Link.Trigger>
        <Pressable
          accessibilityRole="button"
          className="mb-3 overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm dark:border-white/5 dark:bg-dark-bg-elevated"
          style={{ width: cardWidth }}
          testID={`strain-${strain.id}`}
        >
          <View className="p-2.5 pb-0">
            <View
              className="relative w-full overflow-hidden rounded-xl"
              style={{ height: cardWidth * 0.78 }}
            >
              <Image
                source={{ uri: strain.imageUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />
              {thc !== '' && (
                <View className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5">
                  <Text
                    className="text-xs font-bold text-white"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {thc}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View className="px-3 pb-3 pt-2">
            <Text
              className="text-text dark:text-text-primary-dark mb-1.5 text-[15px] font-extrabold leading-tight"
              numberOfLines={1}
            >
              {strain.name}
            </Text>
            <View className="flex-row items-center gap-2">
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: isDark ? colors.darkBg : colors.bg,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? colors.darkBorder : 'transparent',
                }}
              >
                <Text
                  className="text-[11px] font-semibold"
                  style={{ color: isDark ? colors.darkText : colors.text }}
                >
                  {strain.type}
                </Text>
              </View>
              {strain.trait ? (
                <Text
                  className="text-text-secondary dark:text-text-secondary-dark shrink text-xs"
                  numberOfLines={1}
                >
                  {strain.trait}
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>
      </Link.Trigger>
      <Link.Preview />
    </Link>
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
      className="relative size-[42px] items-center justify-center rounded-full bg-white shadow-sm dark:bg-dark-bg-card"
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
// Main Screen
// ---------------------------------------------------------------------------

export default function StrainsScreen() {
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
        <StrainCard strain={item} cardWidth={cardWidth} isDark={isDark} />
      </View>
    ),
    [cardWidth, isDark]
  );

  const keyExtractor = useCallback((item: Strain) => item.id, []);

  const listHeader = useCallback(
    () => (
      <View className="mb-2 mt-1 flex-row gap-2 px-1.5">
        {TYPE_FILTERS.map((f) => (
          <Pressable
            accessibilityRole="button"
            key={f}
            className={cn(
              'px-[18px] py-2 rounded-[20px] bg-white dark:bg-dark-bg-card border border-border-light dark:border-dark-border',
              filters.type === f &&
                'bg-primary dark:bg-primary-bright border-primary dark:border-primary-bright'
            )}
            onPress={() => setType(f)}
            testID={`filter-${f}`}
          >
            <Text
              className={cn(
                'text-[13px] font-semibold text-text-secondary dark:text-text-secondary-dark',
                filters.type === f && 'text-white dark:text-dark-bg'
              )}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>
    ),
    [filters.type, setType]
  );

  const listEmpty = useCallback(
    () =>
      isLoading ? (
        <View className="items-center justify-center py-10">
          <Text className="text-text-muted dark:text-text-muted-dark text-[15px]">
            Loading strains...
          </Text>
        </View>
      ) : (
        <View className="items-center justify-center py-16">
          <View className="bg-border dark:bg-dark-bg-card mb-4 size-16 items-center justify-center rounded-full">
            <BookOpen size={28} color={Colors.primary} />
          </View>
          <Text className="text-text dark:text-text-primary-dark text-lg font-extrabold">
            No Strains Found
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark mt-2 text-center text-[15px]">
            Try a different search or filter
          </Text>
        </View>
      ),
    [isLoading]
  );

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderRight onPress={openFilters} badgeCount={badgeCount} />
          ),
          headerSearchBarOptions: {
            placeholder: 'Search strains...',
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
