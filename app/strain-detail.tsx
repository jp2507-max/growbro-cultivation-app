import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Heart, Share2, Sprout, Star } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { strains } from '@/mocks/strains';
import { Pressable, ScrollView, Text, View } from '@/src/tw';

type StrainMetadata = {
  difficulty: { level: number; label: string };
  description: string;
  floweringTime: string;
  yield: string;
  terpenes: string[];
};

const strainMetadata: Record<string, StrainMetadata> = {
  'OG Kush': {
    difficulty: { level: 3, label: 'Moderate (3/5)' },
    description:
      "OG Kush is a legendary strain with a distinct aroma of pine and lemon. Famous for its stress-relieving properties, this strain is a favorite among growers for its potency and unique flavor profile. Originating from Florida in the early '90s, it has become a backbone of West Coast cannabis varieties.",
    floweringTime: '8-9 Weeks',
    yield: 'High',
    terpenes: ['Lemon', 'Pine', 'Diesel'],
  },
  'Super Lemon Haze': {
    difficulty: { level: 4, label: 'Hard (4/5)' },
    description:
      'A two-time Cannabis Cup winner, Super Lemon Haze delivers a zesty, lemon-citrus flavor with energetic cerebral effects. Ideal for daytime use, it promotes creativity and motivation.',
    floweringTime: '9-10 Weeks',
    yield: 'Very High',
    terpenes: ['Citrus', 'Lemon', 'Sweet'],
  },
  GSC: {
    difficulty: { level: 3, label: 'Moderate (3/5)' },
    description:
      'Girl Scout Cookies delivers a powerful euphoria that sweeps through the body. With earthy, sweet aromas, this hybrid offers full-body relaxation paired with cerebral clarity.',
    floweringTime: '9-10 Weeks',
    yield: 'Medium',
    terpenes: ['Sweet', 'Earthy', 'Mint'],
  },
  'Blue Dream': {
    difficulty: { level: 2, label: 'Easy (2/5)' },
    description:
      'Blue Dream is a sativa-dominant hybrid that balances full-body relaxation with gentle cerebral invigoration. A top shelf strain known for its sweet berry aroma inherited from its Blueberry parent.',
    floweringTime: '9-10 Weeks',
    yield: 'High',
    terpenes: ['Berry', 'Sweet', 'Herbal'],
  },
  'Sour Diesel': {
    difficulty: { level: 3, label: 'Moderate (3/5)' },
    description:
      'Sour Diesel is an invigorating sativa-dominant strain named after its pungent, diesel-like aroma. This fast-acting strain delivers dreamy cerebral effects ideal for easing stress and pain.',
    floweringTime: '10-11 Weeks',
    yield: 'High',
    terpenes: ['Diesel', 'Citrus', 'Earthy'],
  },
  'Northern Lights': {
    difficulty: { level: 1, label: 'Beginner (1/5)' },
    description:
      'One of the most famous indicas, Northern Lights offers a deeply relaxing experience. Its sweet, spicy aromas and crystal-coated buds make it a timeless classic beloved by beginners and experts alike.',
    floweringTime: '6-8 Weeks',
    yield: 'Medium',
    terpenes: ['Pine', 'Earthy', 'Sweet'],
  },
};

const defaultMetadata: StrainMetadata = {
  difficulty: { level: 3, label: 'Moderate (3/5)' },
  description: 'A popular cannabis strain known for its unique properties.',
  floweringTime: '8-10 Weeks',
  yield: 'Medium',
  terpenes: ['Earthy', 'Pine'],
};

const terpeneEmoji: Record<string, string> = {
  Lemon: '🍋',
  Citrus: '🍋',
  Pine: '🌲',
  Diesel: '⛽',
  Berry: '🫐',
  Sweet: '🍬',
  Earthy: '🌿',
  Mint: '🌱',
  Herbal: '🌿',
};

const typeTagColors: Record<string, { bg: string; text: string }> = {
  Indica: { bg: Colors.badgeIndica, text: '#2E7D32' },
  Sativa: { bg: Colors.badgeSativa, text: '#F9A825' },
  Hybrid: { bg: Colors.badgeHybrid, text: '#7B1FA2' },
};

export default function StrainDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [liked, setLiked] = useState<boolean>(false);

  const strain = strains.find((s) => s.id === id);

  const toggleLike = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((p) => !p);
  }, []);

  if (!strain) {
    return (
      <View
        className="bg-background dark:bg-dark-bg flex-1 items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-text dark:text-text-primary-dark text-lg font-bold">
          Strain not found
        </Text>
        <Pressable
          accessibilityRole="button"
          className="bg-primary dark:bg-primary-bright mt-4 rounded-2xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const metadata = strainMetadata[strain.name] ?? defaultMetadata;
  const colors = typeTagColors[strain.type] ?? typeTagColors.Hybrid;

  const rating = Math.min(strain.thc / 5, 5).toFixed(1);

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
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
                className="text-text dark:text-text-primary-dark text-[28px] font-black"
                selectable
              >
                {strain.name}
              </Text>
              {strain.origin && (
                <Text className="text-textSecondary dark:text-text-secondary-dark mt-0.5 text-[13px]">
                  {strain.origin}
                </Text>
              )}
            </View>
            <View className="dark:bg-dark-bg-card min-w-[50px] items-center rounded-xl bg-white p-2">
              <Text
                className="text-primary dark:text-primary-bright text-lg font-extrabold"
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
            <View className="bg-danger-light dark:bg-error-dark/20 flex-row items-center rounded-full px-3.5 py-2">
              <Text className="text-danger dark:text-error-dark text-[13px] font-bold">
                {strain.trait}
              </Text>
            </View>
            {strain.effect && (
              <View className="dark:bg-info-dark/20 flex-row items-center rounded-full bg-[#E3F2FD] px-3.5 py-2">
                <Text className="dark:text-info-dark text-[13px] font-bold text-[#1565C0]">
                  {strain.effect}
                </Text>
              </View>
            )}
          </View>

          <View className="dark:bg-dark-bg-elevated mb-6 rounded-[20px] bg-white p-5 shadow-sm">
            <View className="mb-2.5 flex-row items-center gap-2">
              <Sprout size={18} color={Colors.primary} />
              <Text className="text-text dark:text-text-primary-dark flex-1 text-[15px] font-bold">
                Growing Difficulty
              </Text>
              <Text className="text-textSecondary dark:text-text-secondary-dark text-[13px] font-semibold">
                {metadata.difficulty.label}
              </Text>
            </View>
            <View className="bg-borderLight dark:bg-dark-border mb-[18px] h-2 overflow-hidden rounded">
              <View
                className="bg-primaryLight dark:bg-primary-bright h-full rounded"
                style={{ width: `${(metadata.difficulty.level / 5) * 100}%` }}
              />
            </View>
            <View className="flex-row">
              <View className="flex-1">
                <Text className="text-textMuted dark:text-text-muted-dark mb-1 text-[11px] font-bold tracking-wide">
                  FLOWERING TIME
                </Text>
                <Text
                  className="text-text dark:text-text-primary-dark text-base font-extrabold"
                  selectable
                >
                  {metadata.floweringTime}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-textMuted dark:text-text-muted-dark mb-1 text-[11px] font-bold tracking-wide">
                  YIELD
                </Text>
                <Text
                  className="text-text dark:text-text-primary-dark text-base font-extrabold"
                  selectable
                >
                  {metadata.yield}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-text dark:text-text-primary-dark mb-2.5 text-lg font-extrabold">
            About this strain
          </Text>
          <Text
            className="text-textSecondary dark:text-text-secondary-dark mb-6 text-[15px] leading-[22px]"
            selectable
          >
            {metadata.description}
          </Text>

          <Text className="text-text dark:text-text-primary-dark mb-2.5 text-lg font-extrabold">
            Terpene Profile
          </Text>
          <View className="mb-5 flex-row gap-5">
            {metadata.terpenes.map((t) => (
              <View key={t} className="items-center">
                <View className="dark:bg-dark-bg-card mb-1.5 size-[52px] items-center justify-center rounded-full bg-white shadow-sm">
                  <Text className="text-[22px]">{terpeneEmoji[t] ?? '🌸'}</Text>
                </View>
                <Text className="text-textSecondary dark:text-text-secondary-dark text-xs font-semibold">
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="bg-background dark:bg-dark-bg absolute inset-x-0 bottom-0 px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          accessibilityRole="button"
          className="bg-primaryLight dark:bg-primary-bright items-center justify-center rounded-[20px] py-[18px] shadow-md active:opacity-80"
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
