import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MoreHorizontal,
  Bell,
  Scale,
  Shield,
  LogOut,
  Pencil,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

interface HarvestItem {
  id: string;
  name: string;
  weight: string;
  date: string;
  imageUrl: string;
}

const harvests: HarvestItem[] = [
  { id: '1', name: 'Blue Dream', weight: '56g', date: 'Oct 12', imageUrl: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c4?w=200&h=200&fit=crop' },
  { id: '2', name: 'OG Kush', weight: '42g', date: 'Aug 05', imageUrl: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=200&h=200&fit=crop' },
  { id: '3', name: 'Northern Lights', weight: '38g', date: 'Jun 18', imageUrl: 'https://images.unsplash.com/photo-1604591098897-1baa0e506b1f?w=200&h=200&fit=crop' },
  { id: '4', name: 'Sour Diesel', weight: '51g', date: 'Apr 22', imageUrl: 'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b7?w=200&h=200&fit=crop' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [unitMetric, setUnitMetric] = useState<boolean>(true);

  const toggleNotifications = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((p) => !p);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="back-profile">
          <ChevronLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.backBtn} testID="more-btn">
          <MoreHorizontal size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Pencil size={12} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.userName}>Alex Green</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LEVEL 5 GROWER</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Harvests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2yr</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past Harvests</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={harvests}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.harvestList}
          scrollEnabled={true}
          renderItem={({ item }) => (
            <View style={styles.harvestCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.harvestImage} contentFit="cover" />
              <Text style={styles.harvestName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.harvestMeta}>{item.weight}  •  {item.date}</Text>
            </View>
          )}
        />

        <Text style={styles.settingsTitle}>Settings</Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Bell size={18} color={Colors.primary} />
            </View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.borderLight, true: Colors.primaryLight }}
              thumbColor={Colors.white}
              testID="notifications-switch"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Scale size={18} color={Colors.primary} />
            </View>
            <Text style={styles.settingLabel}>Units</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, unitMetric && styles.unitBtnActive]}
                onPress={() => setUnitMetric(true)}
              >
                <Text style={[styles.unitBtnText, unitMetric && styles.unitBtnTextActive]}>Metric</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, !unitMetric && styles.unitBtnActive]}
                onPress={() => setUnitMetric(false)}
              >
                <Text style={[styles.unitBtnText, !unitMetric && styles.unitBtnTextActive]}>Imperial</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconWrap}>
              <Shield size={18} color={Colors.primary} />
            </View>
            <Text style={styles.settingLabel}>Account Privacy</Text>
            <ChevronLeft size={18} color={Colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtn} testID="sign-out-btn">
          <LogOut size={18} color={Colors.red} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>GrowBro v2.4.1 (Build 890)</Text>
        <View style={{ height: 40 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: Colors.primary,
    padding: 4,
    marginBottom: 14,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  harvestList: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  harvestCard: {
    width: 150,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  harvestImage: {
    width: '100%',
    height: 100,
  },
  harvestName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  harvestMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: 2,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  settingsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  settingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.white,
  },
  unitBtnActive: {
    backgroundColor: Colors.primary,
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  unitBtnTextActive: {
    color: Colors.white,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.redLight,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.red,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 16,
  },
});
