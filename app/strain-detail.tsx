import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Share2, Heart, Sprout, Star } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { strains } from '@/mocks/strains';

const difficultyMap: Record<string, { level: number; label: string }> = {
  'OG Kush': { level: 3, label: 'Moderate (3/5)' },
  'Super Lemon Haze': { level: 4, label: 'Hard (4/5)' },
  'GSC': { level: 3, label: 'Moderate (3/5)' },
  'Blue Dream': { level: 2, label: 'Easy (2/5)' },
  'Sour Diesel': { level: 3, label: 'Moderate (3/5)' },
  'Northern Lights': { level: 1, label: 'Beginner (1/5)' },
};

const descriptions: Record<string, string> = {
  'OG Kush': 'OG Kush is a legendary strain with a distinct aroma of pine and lemon. Famous for its stress-relieving properties, this strain is a favorite among growers for its potency and unique flavor profile. Originating from Florida in the early \'90s, it has become a backbone of West Coast cannabis varieties.',
  'Super Lemon Haze': 'A two-time Cannabis Cup winner, Super Lemon Haze delivers a zesty, lemon-citrus flavor with energetic cerebral effects. Ideal for daytime use, it promotes creativity and motivation.',
  'GSC': 'Girl Scout Cookies delivers a powerful euphoria that sweeps through the body. With earthy, sweet aromas, this hybrid offers full-body relaxation paired with cerebral clarity.',
  'Blue Dream': 'Blue Dream is a sativa-dominant hybrid that balances full-body relaxation with gentle cerebral invigoration. A top shelf strain known for its sweet berry aroma inherited from its Blueberry parent.',
  'Sour Diesel': 'Sour Diesel is an invigorating sativa-dominant strain named after its pungent, diesel-like aroma. This fast-acting strain delivers dreamy cerebral effects ideal for easing stress and pain.',
  'Northern Lights': 'One of the most famous indicas, Northern Lights offers a deeply relaxing experience. Its sweet, spicy aromas and crystal-coated buds make it a timeless classic beloved by beginners and experts alike.',
};

const floweringTimes: Record<string, string> = {
  'OG Kush': '8-9 Weeks',
  'Super Lemon Haze': '9-10 Weeks',
  'GSC': '9-10 Weeks',
  'Blue Dream': '9-10 Weeks',
  'Sour Diesel': '10-11 Weeks',
  'Northern Lights': '6-8 Weeks',
};

const yields: Record<string, string> = {
  'OG Kush': 'High',
  'Super Lemon Haze': 'Very High',
  'GSC': 'Medium',
  'Blue Dream': 'High',
  'Sour Diesel': 'High',
  'Northern Lights': 'Medium',
};

const terpenes: Record<string, string[]> = {
  'OG Kush': ['Lemon', 'Pine', 'Diesel'],
  'Super Lemon Haze': ['Citrus', 'Lemon', 'Sweet'],
  'GSC': ['Sweet', 'Earthy', 'Mint'],
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
  const difficulty = difficultyMap[strain.name] ?? { level: 3, label: 'Moderate (3/5)' };
  const description = descriptions[strain.name] ?? 'A popular cannabis strain known for its unique properties.';
  const flowering = floweringTimes[strain.name] ?? '8-10 Weeks';
  const yieldLevel = yields[strain.name] ?? 'Medium';
  const terpeneList = terpenes[strain.name] ?? ['Earthy', 'Pine'];
  const colors = typeTagColors[strain.type] ?? typeTagColors.Hybrid;

  const toggleLike = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((p) => !p);
  }, []);

  const rating = (strain.thc / 5).toFixed(1);

  return (
    <View style={[styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroSection}>
          <Image source={{ uri: strain.imageUrl }} style={styles.heroImage} contentFit="cover" />
          <View style={[styles.heroOverlay, { paddingTop: insets.top }]}>
            <View style={styles.heroNav}>
              <TouchableOpacity style={styles.navBtn} onPress={() => router.back()} testID="back-strain">
                <ChevronLeft size={22} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.heroNavRight}>
                <TouchableOpacity style={styles.navBtn}>
                  <Share2 size={18} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={toggleLike} testID="like-strain">
                  <Heart size={18} color={Colors.white} fill={liked ? Colors.white : 'transparent'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.strainName}>{strain.name}</Text>
              <Text style={styles.origin}>West Coast Origin</Text>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingNum}>{rating}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={10} color="#F9A825" fill={i <= Math.round(Number(rating)) ? '#F9A825' : 'transparent'} />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: colors.bg }]}>
              <View style={[styles.pillDot, { backgroundColor: colors.text }]} />
              <Text style={[styles.pillText, { color: colors.text }]}>{strain.type}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.pillText, { color: '#E53935' }]}>{strain.trait}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.pillText, { color: '#1565C0' }]}>Relaxing</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.difficultyRow}>
              <Sprout size={18} color={Colors.primary} />
              <Text style={styles.diffLabel}>Growing Difficulty</Text>
              <Text style={styles.diffValue}>{difficulty.label}</Text>
            </View>
            <View style={styles.diffBar}>
              <View style={[styles.diffFill, { width: `${(difficulty.level / 5) * 100}%` }]} />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statMeta}>FLOWERING TIME</Text>
                <Text style={styles.statVal}>{flowering}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statMeta}>YIELD</Text>
                <Text style={styles.statVal}>{yieldLevel}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About this strain</Text>
          <Text style={styles.descText}>{description}</Text>

          <Text style={styles.sectionTitle}>Terpene Profile</Text>
          <View style={styles.terpeneRow}>
            {terpeneList.map((t) => (
              <View key={t} style={styles.terpeneItem}>
                <View style={styles.terpeneCircle}>
                  <Text style={styles.terpeneEmoji}>
                    {t === 'Lemon' || t === 'Citrus' ? '🍋' : t === 'Pine' ? '🌲' : t === 'Diesel' ? '⛽' : t === 'Berry' ? '🫐' : t === 'Sweet' ? '🍬' : t === 'Earthy' ? '🌿' : t === 'Mint' ? '🌱' : t === 'Herbal' ? '🌿' : '🌸'}
                  </Text>
                </View>
                <Text style={styles.terpeneLabel}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/add-plant');
          }}
          testID="add-to-garden-btn"
        >
          <Text style={styles.addBtnText}>+  Add to My Garden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroNavRight: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  strainName: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  origin: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingBox: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    minWidth: 50,
  },
  ratingNum: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
    marginTop: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  diffLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  diffValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  diffBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18,
  },
  diffFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCol: {
    flex: 1,
  },
  statMeta: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  descText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  terpeneRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  terpeneItem: {
    alignItems: 'center',
  },
  terpeneCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  terpeneEmoji: {
    fontSize: 22,
  },
  terpeneLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  addBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
