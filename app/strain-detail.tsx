import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Heart, Share2, Sprout, Star } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { strains } from '@/mocks/strains';

const difficultyMap: Record<string, { level: number; label: string }> = {
  'OG Kush': { level: 3, label: 'Moderate (3/5)' },
  'Super Lemon Haze': { level: 4, label: 'Hard (4/5)' },
  GSC: { level: 3, label: 'Moderate (3/5)' },
  'Blue Dream': { level: 2, label: 'Easy (2/5)' },
  'Sour Diesel': { level: 3, label: 'Moderate (3/5)' },
  'Northern Lights': { level: 1, label: 'Beginner (1/5)' },
};

const descriptions: Record<string, string> = {
  'OG Kush':
    "OG Kush is a legendary strain with a distinct aroma of pine and lemon. Famous for its stress-relieving properties, this strain is a favorite among growers for its potency and unique flavor profile. Originating from Florida in the early '90s, it has become a backbone of West Coast cannabis varieties.",
  'Super Lemon Haze':
    'A two-time Cannabis Cup winner, Super Lemon Haze delivers a zesty, lemon-citrus flavor with energetic cerebral effects. Ideal for daytime use, it promotes creativity and motivation.',
  GSC: 'Girl Scout Cookies delivers a powerful euphoria that sweeps through the body. With earthy, sweet aromas, this hybrid offers full-body relaxation paired with cerebral clarity.',
  'Blue Dream':
    'Blue Dream is a sativa-dominant hybrid that balances full-body relaxation with gentle cerebral invigoration. A top shelf strain known for its sweet berry aroma inherited from its Blueberry parent.',
  'Sour Diesel':
    'Sour Diesel is an invigorating sativa-dominant strain named after its pungent, diesel-like aroma. This fast-acting strain delivers dreamy cerebral effects ideal for easing stress and pain.',
  'Northern Lights':
    'One of the most famous indicas, Northern Lights offers a deeply relaxing experience. Its sweet, spicy aromas and crystal-coated buds make it a timeless classic beloved by beginners and experts alike.',
};

const floweringTimes: Record<string, string> = {
  'OG Kush': '8-9 Weeks',
  'Super Lemon Haze': '9-10 Weeks',
  GSC: '9-10 Weeks',
  'Blue Dream': '9-10 Weeks',
  'Sour Diesel': '10-11 Weeks',
  'Northern Lights': '6-8 Weeks',
};

const yields: Record<string, string> = {
  'OG Kush': 'High',
  'Super Lemon Haze': 'Very High',
  GSC: 'Medium',
  'Blue Dream': 'High',
  'Sour Diesel': 'High',
  'Northern Lights': 'Medium',
};

const terpenes: Record<string, string[]> = {
  'OG Kush': ['Lemon', 'Pine', 'Diesel'],
  'Super Lemon Haze': ['Citrus', 'Lemon', 'Sweet'],
  GSC: ['Sweet', 'Earthy', 'Mint'],
  'Blue Dream': ['Berry', 'Sweet', 'Herbal'],
  'Sour Diesel': ['Diesel', 'Citrus', 'Earthy'],
  'Northern Lights': ['Pine', 'Earthy', 'Sweet'],
};

const typeTagColors: Record<string, { bg: string; text: string }> = {
  Indica: { bg: Colors.indicaBadge, text: '#2E7D32' },
  Sativa: { bg: Colors.sativaBadge, text: '#F9A825' },
  Hybrid: { bg: Colors.hybridBadge, text: '#7B1FA2' },
};

export default function StrainDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [liked, setLiked] = useState<boolean>(false);

  const strain = strains.find((s) => s.id === id) ?? strains[0];
  const difficulty = difficultyMap[strain.name] ?? {
    level: 3,
    label: 'Moderate (3/5)',
  };
  const description =
    descriptions[strain.name] ??
    'A popular cannabis strain known for its unique properties.';
  const flowering = floweringTimes[strain.name] ?? '8-10 Weeks';
  const yieldLevel = yields[strain.name] ?? 'Medium';
  const terpeneList = terpenes[strain.name] ?? ['Earthy', 'Pine'];
  const colors = typeTagColors[strain.type] ?? typeTagColors.Hybrid;

  const toggleLike = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((p) => !p);
  }, []);

  const rating = (strain.thc / 5).toFixed(1);

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="relative h-[300px]">
          <Image
            source={{ uri: strain.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            priority="high"
          />
          <View
            className="absolute inset-x-0 top-0 px-4"
            style={{ paddingTop: insets.top }}
          >
            <View className="flex-row justify-between">
              <Pressable
                accessibilityRole="button"
                className="size-[42px] items-center justify-center rounded-full bg-black/35"
                onPress={() => router.back()}
                testID="back-strain"
              >
                <ChevronLeft size={22} color={Colors.white} />
              </Pressable>
              <View className="flex-row gap-2">
                <Pressable
                  accessibilityRole="button"
                  className="size-[42px] items-center justify-center rounded-full bg-black/35"
                >
                  <Share2 size={18} color={Colors.white} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  className="size-[42px] items-center justify-center rounded-full bg-black/35"
                  onPress={toggleLike}
                  testID="like-strain"
                >
                  <Heart
                    size={18}
                    color={Colors.white}
                    fill={liked ? Colors.white : 'transparent'}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 pt-5">
          <View className="mb-3.5 flex-row items-start justify-between">
            <View className="flex-1">
              <Text
                className="text-[28px] font-black text-text dark:text-text-primary-dark"
                selectable
              >
                {strain.name}
              </Text>
              <Text className="mt-0.5 text-[13px] text-textSecondary dark:text-text-secondary-dark">
                West Coast Origin
              </Text>
            </View>
            <View className="min-w-[50px] items-center rounded-xl bg-white p-2 dark:bg-dark-bg-card">
              <Text
                className="text-lg font-extrabold text-primary dark:text-primary-bright"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {rating}
              </Text>
              <View className="mt-0.5 flex-row gap-px">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={10}
                    color="#F9A825"
                    fill={
                      i <= Math.round(Number(rating))
                        ? '#F9A825'
                        : 'transparent'
                    }
                  />
                ))}
              </View>
            </View>
          </View>

          <View className="mb-5 flex-row flex-wrap gap-2">
            <View
              className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2"
              style={{ backgroundColor: colors.bg }}
            >
              <View
                className="size-2 rounded-full"
                style={{ backgroundColor: colors.text }}
              />
              <Text
                className="text-[13px] font-bold"
                style={{ color: colors.text }}
              >
                {strain.type}
              </Text>
            </View>
            <View className="flex-row items-center rounded-full bg-redLight px-3.5 py-2 dark:bg-error-dark/20">
              <Text className="text-[13px] font-bold text-red dark:text-error-dark">
                {strain.trait}
              </Text>
            </View>
            <View className="flex-row items-center rounded-full bg-[#E3F2FD] px-3.5 py-2 dark:bg-info-dark/20">
              <Text className="text-[13px] font-bold text-[#1565C0] dark:text-info-dark">
                Relaxing
              </Text>
            </View>
          </View>

          <View className="mb-6 rounded-[20px] bg-white p-5 shadow-sm dark:bg-dark-bg-elevated">
            <View className="mb-2.5 flex-row items-center gap-2">
              <Sprout size={18} color={Colors.primary} />
              <Text className="flex-1 text-[15px] font-bold text-text dark:text-text-primary-dark">
                Growing Difficulty
              </Text>
              <Text className="text-[13px] font-semibold text-textSecondary dark:text-text-secondary-dark">
                {difficulty.label}
              </Text>
            </View>
            <View className="mb-[18px] h-2 overflow-hidden rounded bg-borderLight dark:bg-dark-border">
              <View
                className="h-full rounded bg-primaryLight dark:bg-primary-bright"
                style={{ width: `${(difficulty.level / 5) * 100}%` }}
              />
            </View>
            <View className="flex-row">
              <View className="flex-1">
                <Text className="mb-1 text-[11px] font-bold tracking-wide text-textMuted dark:text-text-muted-dark">
                  FLOWERING TIME
                </Text>
                <Text
                  className="text-base font-extrabold text-text dark:text-text-primary-dark"
                  selectable
                >
                  {flowering}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-[11px] font-bold tracking-wide text-textMuted dark:text-text-muted-dark">
                  YIELD
                </Text>
                <Text
                  className="text-base font-extrabold text-text dark:text-text-primary-dark"
                  selectable
                >
                  {yieldLevel}
                </Text>
              </View>
            </View>
          </View>

          <Text className="mb-2.5 text-lg font-extrabold text-text dark:text-text-primary-dark">
            About this strain
          </Text>
          <Text
            className="mb-6 text-[15px] leading-[22px] text-textSecondary dark:text-text-secondary-dark"
            selectable
          >
            {description}
          </Text>

          <Text className="mb-2.5 text-lg font-extrabold text-text dark:text-text-primary-dark">
            Terpene Profile
          </Text>
          <View className="mb-5 flex-row gap-5">
            {terpeneList.map((t) => (
              <View key={t} className="items-center">
                <View className="mb-1.5 size-[52px] items-center justify-center rounded-full bg-white shadow-sm dark:bg-dark-bg-card">
                  <Text className="text-[22px]">
                    {t === 'Lemon' || t === 'Citrus'
                      ? '🍋'
                      : t === 'Pine'
                        ? '🌲'
                        : t === 'Diesel'
                          ? '⛽'
                          : t === 'Berry'
                            ? '🫐'
                            : t === 'Sweet'
                              ? '🍬'
                              : t === 'Earthy'
                                ? '🌿'
                                : t === 'Mint'
                                  ? '🌱'
                                  : t === 'Herbal'
                                    ? '🌿'
                                    : '🌸'}
                  </Text>
                </View>
                <Text className="text-xs font-semibold text-textSecondary dark:text-text-secondary-dark">
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 bg-background px-5 pt-3 dark:bg-dark-bg"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          accessibilityRole="button"
          className="items-center justify-center rounded-[20px] bg-primaryLight py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright"
          onPress={() => {
            if (process.env.EXPO_OS !== 'web')
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/add-plant');
          }}
          testID="add-to-garden-btn"
        >
          <Text className="text-[17px] font-bold text-white">
            + Add to My Garden
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
