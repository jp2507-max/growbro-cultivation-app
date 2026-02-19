import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import HERO_FALLBACK_ASSET from '@/assets/images/strain-fallback.jpg';
import { ListImage } from '@/src/components/ui/list-image';
import { Skeleton } from '@/src/components/ui/skeleton';
import { motion } from '@/src/lib/animations/motion';
import { type Strain } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import {
  parseEffects,
  parseFlavors,
  thcPercent,
} from '@/src/lib/strain-helpers';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const TYPE_CHIPS = ['All', 'Indica', 'Sativa', 'Hybrid'] as const;
const CHIP_BAR_CONTENT_CONTAINER_STYLE = { paddingHorizontal: 12 };

function renderChipSeparator(): React.ReactElement {
  return <View className="w-3" />;
}

function getChipItemType(): string {
  return 'chip';
}

function buildDisplayQuote(description: string | undefined): string {
  if (!description) return '';

  const normalized = description.trim().replace(/\s+/g, ' ');
  if (!normalized) return '';

  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0] ?? normalized;
  return firstSentence.length > 160
    ? `${firstSentence.slice(0, 157).trimEnd()}...`
    : firstSentence;
}

export function StrainListCard({
  strain,
  cardWidth,
  menuOpenTitle,
  onOpenDetail,
  testIDPrefix = 'strain',
}: {
  strain: Strain;
  cardWidth: number;
  menuOpenTitle: string;
  onOpenDetail: (id: string) => void;
  testIDPrefix?: string;
}): React.ReactElement {
  const { t } = useTranslation('strains');
  const [hasImageError, setHasImageError] = React.useState(false);
  const thc = thcPercent(strain);

  const effects = React.useMemo(() => parseEffects(strain), [strain]);
  const flavors = React.useMemo(() => parseFlavors(strain), [strain]);

  const typeKey = String(strain.type).toLowerCase() as
    | 'indica'
    | 'sativa'
    | 'hybrid';
  const typeLabel = t(`types.${typeKey}`, { defaultValue: strain.type });

  const detailHref = React.useMemo(
    () => ({
      pathname: ROUTES.STRAIN_DETAIL_PATHNAME,
      params: { id: strain.id },
    }),
    [strain.id]
  );

  const badgeText = (
    strain.trait ?? t('card.values.defaultBadge')
  ).toUpperCase();
  const thcLabel =
    thc > 0
      ? t('card.values.concentration', {
          value: Math.round(thc),
        })
      : t('card.values.defaultDescriptor');

  const quote =
    buildDisplayQuote(strain.description) || t('card.values.defaultQuote');

  const aromaValue =
    flavors.length > 0
      ? flavors.slice(0, 2).join(', ')
      : t('card.values.noFlavorData');

  const bestForValue =
    effects.length > 0
      ? t(`effectsList.${effects[0]}`, { defaultValue: effects[0] })
      : t('card.values.noEffectData');

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const tapGesture = React.useMemo(
    () =>
      Gesture.Tap()
        .onBegin(() => {
          scale.set(withSpring(0.985, motion.spring.snappy));
        })
        .onFinalize(() => {
          scale.set(withSpring(1, motion.spring.gentle));
        }),
    [scale]
  );

  const handleOpen = React.useCallback(() => {
    onOpenDetail(strain.id);
  }, [onOpenDetail, strain.id]);

  return (
    <Animated.View style={animatedStyle} className="mb-7">
      <Link href={detailHref}>
        <Link.Trigger>
          <GestureDetector gesture={tapGesture}>
            <Pressable
              accessibilityRole="button"
              className="overflow-hidden rounded-3xl bg-card dark:bg-dark-bg-card"
              style={{ width: cardWidth }}
              testID={`${testIDPrefix}-${strain.id}`}
            >
              <View className="relative">
                <ListImage
                  source={
                    hasImageError || !strain.imageUrl
                      ? HERO_FALLBACK_ASSET
                      : { uri: strain.imageUrl }
                  }
                  style={{ width: '100%', aspectRatio: 4 / 3 }}
                  contentFit="cover"
                  transition={200}
                  recyclingKey={`${strain.id}:hero`}
                  onError={() => setHasImageError(true)}
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                />

                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 72,
                  }}
                />

                <View className="absolute bottom-3 left-4 rounded-full border border-white/35 bg-black/35 px-3 py-1">
                  <Text className="text-[10px] font-bold uppercase tracking-[1.4px] text-white">
                    {badgeText}
                  </Text>
                </View>
              </View>

              <View className="px-5 pb-5 pt-4">
                <View className="mb-2 flex-row items-center gap-2">
                  <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-primary dark:text-primary-bright">
                    {typeLabel}
                  </Text>
                  <View className="size-1 rounded-full bg-border-light dark:bg-dark-border-bright" />
                  <Text className="text-[11px] font-medium text-text-secondary dark:text-text-secondary-dark">
                    {thcLabel}
                  </Text>
                </View>

                <Text className="font-serif text-[42px] font-bold leading-11.5 text-text dark:text-text-primary-dark">
                  {strain.name}
                </Text>

                <Text className="mb-5 mt-3 font-serif text-[22px] italic leading-8 text-text-secondary dark:text-text-secondary-dark">
                  &quot;{quote}&quot;
                </Text>

                <View className="flex-row border-t border-border pt-4 dark:border-dark-border">
                  <View className="flex-1 pr-2">
                    <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted dark:text-text-muted-dark">
                      {t('card.labels.aromaProfile')}
                    </Text>
                    <Text className="mt-1 text-[15px] font-medium text-text dark:text-text-primary-dark">
                      {aromaValue}
                    </Text>
                  </View>

                  <View className="flex-1 pl-2">
                    <Text className="text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted dark:text-text-muted-dark">
                      {t('card.labels.bestFor')}
                    </Text>
                    <Text className="mt-1 text-[15px] font-medium text-text dark:text-text-primary-dark">
                      {bestForValue}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </GestureDetector>
        </Link.Trigger>

        <Link.Preview
          style={{
            width: Math.round(cardWidth * 1.02),
            height: Math.round(cardWidth * 1.1),
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

export function StrainListCardSkeleton({
  cardWidth,
}: {
  cardWidth: number;
}): React.ReactElement {
  return (
    <View
      className="mb-7 overflow-hidden rounded-3xl"
      style={{ width: cardWidth }}
    >
      <Skeleton
        style={{ width: '100%', aspectRatio: 4 / 3 }}
        className="rounded-none"
      />
      <View className="gap-2.5 bg-card px-5 pb-5 pt-4 dark:bg-dark-bg-card">
        <Skeleton className="h-3 w-2/5 rounded-md" />
        <Skeleton className="h-10 w-3/5 rounded-md" />
        <Skeleton className="h-18 w-full rounded-xl" />
        <View className="mt-1 flex-row gap-3 border-t border-border pt-4 dark:border-dark-border">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </View>
      </View>
    </View>
  );
}

export function StrainTypeChipBar({
  activeType,
  onChangeType,
}: {
  activeType: string;
  onChangeType: (nextType: string) => void;
}): React.ReactElement {
  const { t } = useTranslation('strains');

  const onToggleChip = React.useCallback(
    (type: string) => {
      onChangeType(activeType === type ? 'All' : type);
    },
    [activeType, onChangeType]
  );

  const renderChip = React.useCallback(
    ({ item }: { item: (typeof TYPE_CHIPS)[number] }) => {
      const active = activeType === item;
      const chipLabel =
        item === 'All'
          ? t('filters.all')
          : t(`types.${item.toLowerCase() as 'indica' | 'sativa' | 'hybrid'}`);

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chips.accessibility.select', {
            chip: chipLabel,
          })}
          accessibilityHint={t('chips.accessibility.hint')}
          onPress={() => onToggleChip(item)}
          className={cn(
            'rounded-full border px-5 py-2.5',
            active
              ? 'border-primary bg-primary dark:border-primary-bright dark:bg-primary-bright'
              : 'border-border bg-card dark:border-dark-border-bright dark:bg-dark-bg-card'
          )}
        >
          <Text
            className={cn(
              'text-[14px] font-semibold',
              active
                ? 'text-white dark:text-on-primary-dark'
                : 'text-text-secondary dark:text-text-secondary-dark'
            )}
          >
            {chipLabel}
          </Text>
        </Pressable>
      );
    },
    [activeType, onToggleChip, t]
  );

  const keyExtractor = React.useCallback(
    (item: (typeof TYPE_CHIPS)[number]) => item,
    []
  );

  return (
    <View className="-mx-3">
      <FlashList
        data={TYPE_CHIPS}
        horizontal
        keyExtractor={keyExtractor}
        getItemType={getChipItemType}
        renderItem={renderChip}
        extraData={activeType}
        ItemSeparatorComponent={renderChipSeparator}
        contentContainerStyle={CHIP_BAR_CONTENT_CONTAINER_STYLE}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
