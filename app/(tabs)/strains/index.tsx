import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import Colors from '@/constants/colors';
import { strains, strainFilters, Strain } from '@/mocks/strains';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const typeColors: Record<string, { bg: string; text: string }> = {
  Indica: { bg: Colors.indicaBadge, text: '#2E7D32' },
  Sativa: { bg: Colors.sativaBadge, text: '#F9A825' },
  Hybrid: { bg: Colors.hybridBadge, text: '#7B1FA2' },
};

function StrainCard({ strain }: { strain: Strain }) {
  const colors = typeColors[strain.type] ?? typeColors.Hybrid;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} testID={`strain-${strain.id}`} onPress={() => router.push({ pathname: '/strain-detail', params: { id: strain.id } })}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: strain.imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
        />
        <View style={styles.thcBadge}>
          <Text style={styles.thcText}>{strain.thc}%</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.strainName} numberOfLines={1}>{strain.name}</Text>
        <View style={styles.tagRow}>
          <View style={[styles.typeTag, { backgroundColor: colors.bg }]}>
            <Text style={[styles.typeTagText, { color: colors.text }]}>{strain.type}</Text>
          </View>
          <Text style={styles.traitText}>{strain.trait}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function StrainsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    let result = strains;
    if (activeFilter !== 'All') {
      result = result.filter((s) => s.type === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [search, activeFilter]);

  const handleFilter = useCallback((f: string) => {
    setActiveFilter(f);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Strain Library</Text>
        <TouchableOpacity style={styles.filterIconBtn} testID="filter-btn">
          <SlidersHorizontal size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search strains..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          testID="strain-search"
        />
      </View>

      <View style={styles.filtersRow}>
        {strainFilters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
            onPress={() => handleFilter(f)}
            testID={`filter-${f}`}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        <View style={styles.gridInner}>
          {filtered.map((strain) => (
            <StrainCard key={strain.id} strain={strain} />
          ))}
        </View>
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No strains found</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  filterIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: HORIZONTAL_PADDING,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8,
    marginTop: 14,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  grid: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  gridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 2,
  },
  imageWrapper: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  thcBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  thcText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  cardBody: {
    padding: 12,
  },
  strainName: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  traitText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});
