import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Flower2,
  Gauge,
  Heart,
  Info,
  Leaf,
  Lightbulb,
  type LucideIcon,
  PlusCircle,
  Scale,
  Sparkles,
} from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HERO_FALLBACK_ASSET from '@/assets/images/strain-fallback.jpg';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { db, id, type Strain } from '@/src/lib/instant';
import {
  ALL_EFFECTS,
  flavorColors,
  parseEffects,
  parseFlavors,
  thcPercent,
  typeColors,
} from '@/src/lib/strain-helpers';
import {
  normalizeList,
  normalizeText,
  parseNumberParts,
  sanitizeDescription,
  sanitizeName,
} from '@/src/lib/text-sanitization';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Image } from '@/src/tw/image';

const HERO_FALLBACK_IMAGE_URL = HERO_FALLBACK_ASSET;

const DEFAULT_EFFECTS = ['Happy', 'Relaxed', 'Creative'] as const;
const DEFAULT_FLAVORS = ['Earthy', 'Pine', 'Woody'] as const;

const effectIcons: Record<string, LucideIcon> = {
  Happy: Sparkles,
  Relaxed: Flower2,
  Creative: Lightbulb,
};

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

function getDifficulty(strain: Strain): string {
  const value = normalizeText(strain.difficulty, 'Medium');
  if (value === 'Difficult') return 'Hard';
  return value;
}

function getHeight(strain: Strain): string {
  const raw = normalizeText(
    strain.heightIndoor ?? strain.heightOutdoor,
    'Medium'
  );
  const values = parseNumberParts(raw);
  const max = values.length > 1 ? values[1] : values[0];

  if (!max) {
    if (raw.toLowerCase().includes('short')) return 'Short';
    if (raw.toLowerCase().includes('tall')) return 'Tall';
    return 'Medium';
  }

  if (max <= 90) return 'Short';
  if (max <= 170) return 'Medium';
  return 'Tall';
}

function getYield(strain: Strain): string {
  const raw = normalizeText(
    strain.yieldIndoor ?? strain.yieldOutdoor,
    'Medium'
  );
  const values = parseNumberParts(raw);
  const max = values.length > 1 ? values[1] : values[0];

  if (!max) {
    const normalized = raw.toLowerCase();
    if (normalized.includes('high') || normalized.includes('large'))
      return 'Large';
    if (normalized.includes('low') || normalized.includes('small'))
      return 'Small';
    return 'Medium';
  }

  if (max < 300) return 'Small';
  if (max < 500) return 'Medium';
  return 'Large';
}

type GrowInfoCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function GrowInfoCard({
  icon: Icon,
  label,
  value,
}: GrowInfoCardProps): React.ReactElement {
  const colorScheme = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? Colors.primaryBright : Colors.primary;

  return (
    <View className="flex-1 items-center justify-center gap-2 rounded-2xl border border-border-light bg-card p-4 dark:border-white/5 dark:bg-dark-bg-card">
      <View className="size-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/20">
        <Icon size={20} color={iconColor} />
      </View>
      <View className="items-center">
        <Text className="text-[10px] font-bold uppercase tracking-wide text-textMuted dark:text-text-muted-dark">
          {label}
        </Text>
        <Text className="text-[16px] font-semibold text-text dark:text-text-primary-dark">
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function StrainDetailScreen(): React.ReactElement {
  const { t } = useTranslation('strains');
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const { id: strainId } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [toggling, setToggling] = useState(false);
  const togglingRef = useRef(false);

  const heroHeight = Math.round(screenHeight * 0.45);

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
  const effects = strain
    ? normalizeList(parseEffects(strain), DEFAULT_EFFECTS, ALL_EFFECTS)
    : [...DEFAULT_EFFECTS];
  const flavors = strain
    ? normalizeList(
        parseFlavors(strain),
        DEFAULT_FLAVORS,
        Object.keys(flavorColors)
      )
    : [...DEFAULT_FLAVORS];
  const description = sanitizeDescription(strain?.description);
  const difficulty = strain ? getDifficulty(strain) : 'Medium';
  const height = strain ? getHeight(strain) : 'Medium';
  const yieldLabel = strain ? getYield(strain) : 'Medium';
  const strainImg = normalizeText(strain?.imageUrl, '');
  const heroImageSource = strainImg
    ? { uri: strainImg }
    : HERO_FALLBACK_IMAGE_URL;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-bg">
        <ActivityIndicator
          size="large"
          color={colorScheme === 'dark' ? Colors.primaryBright : Colors.primary}
        />
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
          accessibilityHint="Returns to the previous screen"
          accessibilityRole="button"
          className="mt-4 rounded-2xl bg-primary px-6 py-3 dark:bg-primary-bright"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-white dark:text-dark-bg">
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
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="relative w-full overflow-hidden rounded-b-3xl"
          style={{ height: heroHeight }}
          testID="strain-banner"
        >
          <Image
            source={heroImageSource}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
            priority="high"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />

          <LinearGradient
            colors={['rgba(0,0,0,0.75)', 'transparent']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 108,
            }}
          />
          <LinearGradient
            colors={
              colorScheme === 'dark'
                ? ['transparent', 'rgba(10,20,16,0.95)']
                : ['transparent', 'rgba(0,0,0,0.7)']
            }
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: heroHeight * 0.62,
            }}
          />

          <View
            className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4"
            style={{ paddingTop: insets.top + 8 }}
          >
            <Pressable
              accessibilityHint="Returns to the previous screen"
              accessibilityLabel="Go back"
              accessibilityRole="button"
              className="size-10 items-center justify-center rounded-full border border-white/10 bg-black/40"
              onPress={() => router.back()}
              testID="back-strain"
            >
              <ChevronLeft size={20} color="#ffffff" />
            </Pressable>
            <Pressable
              accessibilityHint="Toggle favorite status"
              accessibilityLabel="Favorite strain"
              accessibilityRole="button"
              className="size-10 items-center justify-center rounded-full border border-white/10 bg-black/40"
              disabled={toggling}
              onPress={toggleLike}
              testID="favorite-button"
            >
              <Heart
                size={18}
                color="#ffffff"
                fill={liked ? '#fb7185' : 'transparent'}
              />
            </Pressable>
          </View>

          <View className="absolute bottom-6 left-6 right-6 flex-row items-end justify-between">
            <View className="flex-1 pr-4">
              <Text className="mb-2 text-4xl font-bold tracking-tight text-white">
                {strainName}
              </Text>
              <View className="flex-row items-center gap-3">
                <View
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: typeColor.darkBg,
                    borderWidth: 1,
                    borderColor: typeColor.darkBorder,
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: typeColor.darkText }}
                  >
                    {typeLabel}
                  </Text>
                </View>
                {potency != null && potency > 0 && (
                  <View className="flex-row items-center gap-1">
                    <View className="size-1.5 rounded-full bg-gray-400" />
                    <Text className="text-sm font-medium text-gray-300">
                      {potency >= 20 ? t('detail.highThc') : t('detail.thc')}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {potency != null && (
              <View
                className="rounded-2xl border border-white/20 px-4 py-3"
                style={{ backgroundColor: 'rgba(74,222,128,0.9)' }}
              >
                <Text className="text-xs font-bold uppercase tracking-wide text-[#1a1a1a]">
                  {t('detail.potency')}
                </Text>
                <Text className="text-3xl font-black text-[#1a1a1a]">
                  {potency}%
                </Text>
                <Text className="text-[10px] font-bold text-[#1a1a1a]/80">
                  THC
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-6 py-8">
          <View testID="growing-info">
            <View className="mb-4 flex-row items-center gap-2">
              <Leaf size={18} color="#4ade80" />
              <Text className="text-xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.growInfo')}
              </Text>
            </View>
            <View className="flex-row gap-3" testID="quick-facts">
              <GrowInfoCard
                icon={Gauge}
                label={t('detail.difficulty')}
                value={difficulty}
              />
              <GrowInfoCard
                icon={Sparkles}
                label={t('detail.height')}
                value={height}
              />
              <GrowInfoCard
                icon={Scale}
                label={t('detail.yield')}
                value={yieldLabel}
              />
            </View>
          </View>

          <View className="mt-8">
            <View className="mb-4 flex-row items-center gap-2">
              <Sparkles size={18} color="#4ade80" />
              <Text className="text-xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.effects')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {effects.map((effect) => {
                const Icon = effectIcons[effect] ?? Sparkles;
                return (
                  <View
                    key={effect}
                    className="flex-row items-center gap-1.5 rounded-full border border-borderLight dark:border-dark-border-bright bg-card dark:bg-dark-bg-card px-4 py-2"
                  >
                    <Icon size={14} color="#6ee7b7" />
                    <Text className="text-sm font-medium text-text dark:text-text-primary-dark">
                      {effect}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View className="mt-8" testID="terpene-section">
            <View className="mb-4 flex-row items-center gap-2">
              <Flower2 size={18} color="#4ade80" />
              <Text className="text-xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.flavors')}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {flavors.map((flavor) => (
                <View
                  key={flavor}
                  className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 dark:border-primary-bright/30 dark:bg-primary-bright/10"
                >
                  <Text className="text-sm font-medium text-primary dark:text-primary-bright">
                    {flavor}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-8 pb-6">
            <View className="mb-3 flex-row items-center gap-2">
              <Info size={18} color="#4ade80" />
              <Text className="text-xl font-bold text-text dark:text-text-primary-dark">
                {t('detail.about')}
              </Text>
            </View>
            <Text className="text-sm leading-relaxed text-textSecondary dark:text-text-secondary-dark">
              {description}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-border-light px-4 pt-4 dark:border-white/5"
        style={{
          backgroundColor:
            colorScheme === 'dark'
              ? 'rgba(10,20,16,0.95)'
              : 'rgba(241,248,233,0.95)',
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <Pressable
          accessibilityHint="Starts adding this strain to your garden"
          accessibilityLabel="Add to my garden"
          accessibilityRole="button"
          className="h-14 flex-row items-center justify-center gap-2 rounded-xl bg-primary active:opacity-90 dark:bg-primary-bright"
          onPress={() => {
            if (process.env.EXPO_OS !== 'web')
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/add-plant');
          }}
          testID="add-to-garden-btn"
        >
          <PlusCircle size={20} color="#ffffff" />
          <Text className="text-lg font-bold text-white dark:text-dark-bg">
            {t('detail.addToGarden')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
