import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Flower2,
  Gauge,
  Info,
  Leaf,
  Lightbulb,
  type LucideIcon,
  PlusCircle,
  Ruler,
  Scale,
  Smile,
  Sparkles,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme, useWindowDimensions } from 'react-native';
import { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HERO_FALLBACK_ASSET from '@/assets/images/strain-fallback.jpg';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/src/components/ui/skeleton';
import { StrainDetailHero } from '@/src/components/ui/strain-detail/strain-detail-hero';
import { StrainDetailMetricCard } from '@/src/components/ui/strain-detail/strain-detail-metric-card';
import { StrainDetailPill } from '@/src/components/ui/strain-detail/strain-detail-pill';
import { withRM } from '@/src/lib/animations/motion';
import { db, id, type Strain } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import {
  getFlavorColor,
  parseEffects,
  parseFlavors,
  thcPercent,
  typeColors,
} from '@/src/lib/strain-helpers';
import {
  normalizeList,
  normalizeText,
  parseNumberParts,
  sanitizeDescriptionFull,
  sanitizeName,
} from '@/src/lib/text-sanitization';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const HERO_FALLBACK_IMAGE_URL = HERO_FALLBACK_ASSET;

const DESCRIPTION_COLLAPSED_LENGTH = 180;
const CTA_TAB_BAR_SAFE_OFFSET = 76;

const effectIcons: Record<string, LucideIcon> = {
  Happy: Smile,
  Relaxed: Leaf,
  Creative: Lightbulb,
};

type DifficultyKey = 'Easy' | 'Medium' | 'Difficult';
type HeightBucketKey = 'short' | 'medium' | 'tall';
type YieldBucketKey = 'small' | 'medium' | 'large';

function normalizeTypeLabel(strain: Strain): 'Indica' | 'Sativa' | 'Hybrid' {
  const direct = normalizeText(strain.type, '').toLowerCase();
  if (direct.includes('indica')) return 'Indica';
  if (direct.includes('sativa')) return 'Sativa';
  if (direct.includes('hybrid')) return 'Hybrid';

  const genetics = normalizeText(strain.genetics, '').toLowerCase();
  if (genetics.includes('indica')) return 'Indica';
  if (genetics.includes('sativa')) return 'Sativa';
  return 'Hybrid';
}

function getPotencyValue(strain: Strain): number | null {
  const direct = thcPercent(strain);
  if (Number.isFinite(direct) && direct > 0) return Math.round(direct);

  const fromTrait = normalizeText(strain.trait, '').match(/(\d{1,2})\s*%?/);
  if (fromTrait) {
    const parsed = Number(fromTrait[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return null;
}

function getDifficultyKey(strain: Strain): DifficultyKey {
  const value = normalizeText(strain.difficulty, 'Medium');
  if (value === 'Difficult' || value === 'Hard') return 'Difficult';
  if (value === 'Easy') return 'Easy';
  return 'Medium';
}

function getHeightBucket(strain: Strain): HeightBucketKey {
  const raw = normalizeText(
    strain.heightIndoor ?? strain.heightOutdoor,
    'Medium'
  );
  const values = parseNumberParts(raw);
  const max = values.length > 1 ? values[1] : values[0];

  if (!max) {
    if (raw.toLowerCase().includes('short')) return 'short';
    if (raw.toLowerCase().includes('tall')) return 'tall';
    return 'medium';
  }

  if (max <= 90) return 'short';
  if (max <= 170) return 'medium';
  return 'tall';
}

function getYieldBucket(strain: Strain): YieldBucketKey {
  const raw = normalizeText(
    strain.yieldIndoor ?? strain.yieldOutdoor,
    'Medium'
  );
  const values = parseNumberParts(raw);
  const max = values.length > 1 ? values[1] : values[0];

  if (!max) {
    const normalized = raw.toLowerCase();
    if (normalized.includes('high') || normalized.includes('large'))
      return 'large';
    if (normalized.includes('low') || normalized.includes('small'))
      return 'small';
    return 'medium';
  }

  if (max < 300) return 'small';
  if (max < 500) return 'medium';
  return 'large';
}

export default function StrainDetailScreen(): React.ReactElement {
  const { t } = useTranslation(['strains', 'common']);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id: strainId } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [toggling, setToggling] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const togglingRef = useRef(false);

  const heroHeight = Math.round(screenHeight * 0.45);
  const iconColor = isDark ? Colors.primaryBright : Colors.primary;

  const { data, isLoading } = db.useQuery(
    strainId
      ? {
          strains: {
            $: { where: { id: strainId } },
          },
        }
      : null
  );

  const uniqueKey = profile ? `${profile.id}_${strainId}` : null;

  const { data: favData } = db.useQuery(
    uniqueKey
      ? {
          favorites: {
            $: { where: { uniqueKey } },
          },
        }
      : null
  );

  const existingFav = favData?.favorites?.[0] ?? null;
  const liked = !!existingFav;

  const strain: Strain | undefined = data?.strains?.[0];

  const toggleLike = useCallback(async (): Promise<void> => {
    if (!profile || !strainId || togglingRef.current) return;
    togglingRef.current = true;
    setToggling(true);

    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (existingFav) {
        await db.transact(db.tx.favorites[existingFav.id].delete());
      } else {
        const favId = id();
        await db.transact([
          db.tx.favorites[favId].update({
            createdAt: Date.now(),
            uniqueKey: `${profile.id}_${strainId}`,
          }),
          db.tx.favorites[favId].link({ strain: strainId }),
          db.tx.favorites[favId].link({ owner: profile.id }),
        ]);
      }
    } catch (error) {
      console.error('[favorites] toggle failed:', error);
    } finally {
      togglingRef.current = false;
      setToggling(false);
    }
  }, [profile, strainId, existingFav]);

  const strainName = sanitizeName(strain?.name);
  const typeLabel = strain ? normalizeTypeLabel(strain) : 'Hybrid';
  const typeColor = typeColors[typeLabel] ?? typeColors.Hybrid;
  const potency = strain ? getPotencyValue(strain) : null;
  const effects = strain ? normalizeList(parseEffects(strain), []) : [];
  const flavors = strain ? normalizeList(parseFlavors(strain), []) : [];
  const fullDescription = sanitizeDescriptionFull(strain?.description);
  const [descExpanded, setDescExpanded] = useState(false);
  const isDescLong = fullDescription.length > DESCRIPTION_COLLAPSED_LENGTH;
  const description = useMemo(
    () =>
      !descExpanded && isDescLong
        ? (() => {
            const spaceIdx = fullDescription.lastIndexOf(
              ' ',
              DESCRIPTION_COLLAPSED_LENGTH
            );
            const cutAt =
              spaceIdx > 0 ? spaceIdx : DESCRIPTION_COLLAPSED_LENGTH;
            return `${fullDescription.slice(0, cutAt)}…`;
          })()
        : fullDescription,
    [fullDescription, descExpanded, isDescLong]
  );
  const difficulty = strain
    ? t(`difficulties.${getDifficultyKey(strain)}`)
    : t('difficulties.Medium');
  const height = strain
    ? t(`detail.heightBuckets.${getHeightBucket(strain)}`)
    : t('detail.heightBuckets.medium');
  const yieldLabel = strain
    ? t(`detail.yieldBuckets.${getYieldBucket(strain)}`)
    : t('detail.yieldBuckets.medium');
  const strainImg = normalizeText(strain?.imageUrl, '');
  const heroImageSource = strainImg
    ? { uri: strainImg }
    : HERO_FALLBACK_IMAGE_URL;
  const safeHeroImageSource = hasImageError
    ? HERO_FALLBACK_IMAGE_URL
    : heroImageSource;

  if (isLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-bg">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          <Skeleton
            className="w-full rounded-b-3xl"
            style={{ height: heroHeight }}
          />

          <View className="px-5 pt-6">
            <View className="mb-7">
              <Skeleton className="mb-3 h-6 w-36 rounded-md" />
              <Skeleton className="h-24 rounded-2xl" />
            </View>

            <View className="mb-7">
              <Skeleton className="mb-3 h-6 w-28 rounded-md" />
              <View className="flex-row gap-2.5">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
              </View>
            </View>

            <View className="mb-7">
              <Skeleton className="mb-3 h-6 w-28 rounded-md" />
              <View className="flex-row flex-wrap gap-2.5">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
              </View>
            </View>

            <View className="pb-6">
              <Skeleton className="mb-3 h-6 w-20 rounded-md" />
              <Skeleton className="mb-2 h-4 w-full rounded-md" />
              <Skeleton className="mb-2 h-4 w-[94%] rounded-md" />
              <Skeleton className="h-4 w-[82%] rounded-md" />
            </View>
          </View>
        </ScrollView>

        <View
          className="absolute inset-x-0 bottom-0 px-5 pt-3"
          style={{
            backgroundColor: isDark
              ? Colors.detailOverlayDark
              : Colors.detailOverlayLight,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          <Skeleton className="h-14 rounded-2xl" />
        </View>
      </View>
    );
  }

  if (!strain) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-bg">
        <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
          {t('detail.notFound')}
        </Text>
        <Pressable
          accessibilityHint={t('common:a11y.goBackHint')}
          accessibilityRole="button"
          className="mt-4 rounded-2xl bg-primary px-6 py-3 dark:bg-primary-bright"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-white dark:text-on-primary-dark">
            {t('common:goBack')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-bg"
      testID="strain-detail"
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120 + CTA_TAB_BAR_SAFE_OFFSET,
        }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View testID="strain-banner">
          <StrainDetailHero
            title={strainName}
            typeLabel={typeLabel}
            typeColors={typeColor}
            potency={potency}
            potencyLabel={t('detail.potency')}
            thcLabel={t('detail.thc')}
            highThcLabel={t('detail.highThc')}
            imageSource={safeHeroImageSource}
            heroHeight={heroHeight}
            insetsTop={insets.top}
            isDark={isDark}
            liked={liked}
            toggling={toggling}
            onBackPress={() => router.back()}
            onFavoritePress={toggleLike}
            onImageError={() => setHasImageError(true)}
            backLabel={t('common:goBack')}
            backHint={t('common:a11y.goBackHint')}
            favoriteLabel={t('detail.a11y.favoriteLabel')}
            favoriteHint={t('detail.a11y.toggleFavoriteHint')}
          />
        </View>

        <View className="px-5 pt-7">
          <Animated.View
            entering={withRM(FadeInUp.duration(300).delay(50))}
            testID="growing-info"
          >
            <View className="mb-4 flex-row items-center gap-2">
              <Leaf size={18} color={iconColor} />
              <Text className="text-2xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.growInfo')}
              </Text>
            </View>
            <View className="flex-row gap-3" testID="quick-facts">
              <StrainDetailMetricCard
                icon={Gauge}
                label={t('detail.difficultyShort')}
                value={difficulty}
                iconColor={iconColor}
                isDark={isDark}
              />
              <StrainDetailMetricCard
                icon={Ruler}
                label={t('detail.height')}
                value={height}
                iconColor={iconColor}
                isDark={isDark}
              />
              <StrainDetailMetricCard
                icon={Scale}
                label={t('detail.yield')}
                value={yieldLabel}
                iconColor={iconColor}
                isDark={isDark}
              />
            </View>
          </Animated.View>

          <Animated.View
            entering={withRM(FadeInUp.duration(300).delay(120))}
            className="mt-8"
          >
            <View className="mb-4 flex-row items-center gap-2">
              <Sparkles size={16} color={iconColor} />
              <Text className="text-2xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.effects')}
              </Text>
            </View>
            {effects.length > 0 ? (
              <View className="flex-row flex-wrap gap-3">
                {effects.map((effect) => {
                  const Icon = effectIcons[effect] ?? Sparkles;
                  return (
                    <StrainDetailPill
                      key={effect}
                      label={effect}
                      icon={Icon}
                      iconColor={iconColor}
                      bgColor={isDark ? 'rgba(255,255,255,0.04)' : Colors.card}
                      borderColor={
                        isDark ? 'rgba(255,255,255,0.10)' : Colors.borderLight
                      }
                      textColor={isDark ? Colors.primaryBright : Colors.primary}
                    />
                  );
                })}
              </View>
            ) : (
              <Text className="text-sm text-text-muted dark:text-text-muted-dark">
                {t('detail.noEffects')}
              </Text>
            )}
          </Animated.View>

          <Animated.View
            entering={withRM(FadeInUp.duration(300).delay(190))}
            className="mt-8"
            testID="terpene-section"
          >
            <View className="mb-4 flex-row items-center gap-2">
              <Flower2 size={16} color={iconColor} />
              <Text className="text-2xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.flavors')}
              </Text>
            </View>
            {flavors.length > 0 ? (
              <View className="flex-row flex-wrap gap-3">
                {flavors.map((flavor) => {
                  const fc = getFlavorColor(flavor);
                  return (
                    <StrainDetailPill
                      key={flavor}
                      label={flavor}
                      bgColor={isDark ? fc.bg : Colors.primaryAlpha15}
                      borderColor={isDark ? fc.border : Colors.primaryAlpha30}
                      textColor={isDark ? fc.text : Colors.primary}
                    />
                  );
                })}
              </View>
            ) : (
              <Text className="text-sm text-text-muted dark:text-text-muted-dark">
                {t('detail.noFlavors')}
              </Text>
            )}
          </Animated.View>

          <Animated.View
            entering={withRM(FadeInUp.duration(300).delay(260))}
            className="mt-8 pb-8"
          >
            <View className="mb-3 flex-row items-center gap-2">
              <Info size={16} color={iconColor} />
              <Text className="text-2xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.about')}
              </Text>
            </View>
            <Text className="text-lg leading-8 text-text-secondary dark:text-text-secondary-dark">
              {description}
            </Text>
            {isDescLong && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setDescExpanded((prev) => !prev)}
                className="mt-2"
              >
                <Text className="text-sm font-semibold text-primary dark:text-primary-bright">
                  {descExpanded ? t('detail.readLess') : t('detail.readMore')}
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 px-5 pt-3 shadow-lg"
        style={{
          backgroundColor: isDark
            ? Colors.detailOverlayDark
            : Colors.detailOverlayLight,
          paddingBottom: Math.max(insets.bottom, 16) + CTA_TAB_BAR_SAFE_OFFSET,
        }}
      >
        <Pressable
          accessibilityHint={t('detail.a11y.addToGardenHint')}
          accessibilityLabel={t('detail.addToGarden')}
          accessibilityRole="button"
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:opacity-90 dark:bg-primary-bright"
          onPress={() => {
            if (process.env.EXPO_OS !== 'web')
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(ROUTES.ADD_PLANT);
          }}
          testID="add-to-garden-btn"
        >
          <PlusCircle
            size={20}
            color={isDark ? Colors.darkBg : Colors.white}
            strokeWidth={2.3}
          />
          <Text className="text-base font-bold text-white dark:text-on-primary-dark">
            {t('detail.addToGarden')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
