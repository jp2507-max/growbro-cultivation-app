import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Scissors, Scale, Calendar, CheckCircle2, PartyPopper } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

export default function HarvestScreen() {
  const insets = useSafeAreaInsets();
  const [wetWeight, setWetWeight] = useState<string>('');
  const [dryWeight, setDryWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [quality, setQuality] = useState<string>('good');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const qualityOptions = [
    { id: 'poor', label: 'Poor', emoji: '😐' },
    { id: 'good', label: 'Good', emoji: '😊' },
    { id: 'great', label: 'Great', emoji: '🤩' },
    { id: 'premium', label: 'Premium', emoji: '🏆' },
  ];

  const handleSave = useCallback(() => {
    if (!wetWeight.trim()) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [wetWeight, scaleAnim]);

  const handleGoToGarden = useCallback(() => {
    setShowSuccess(false);
    router.replace('/(tabs)/(garden)' as never);
  }, []);

  const handleGoToProfile = useCallback(() => {
    setShowSuccess(false);
    router.replace('/profile');
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="back-harvest">
          <ChevronLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Harvest</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Scissors size={32} color={Colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Harvest Time!</Text>
            <Text style={styles.heroSubtitle}>Record your yield details for Blue Dream</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Yield Weight</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconWrap}>
                  <Scale size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Wet weight (g)"
                  placeholderTextColor={Colors.textMuted}
                  value={wetWeight}
                  onChangeText={setWetWeight}
                  keyboardType="numeric"
                  testID="wet-weight-input"
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconWrap}>
                  <Scale size={18} color={Colors.amber} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Dry weight (g) — optional"
                  placeholderTextColor={Colors.textMuted}
                  value={dryWeight}
                  onChangeText={setDryWeight}
                  keyboardType="numeric"
                  testID="dry-weight-input"
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quality Rating</Text>
            <View style={styles.qualityRow}>
              {qualityOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.qualityOption, quality === opt.id && styles.qualityOptionActive]}
                  onPress={() => setQuality(opt.id)}
                  testID={`quality-${opt.id}`}
                >
                  <Text style={styles.qualityEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.qualityLabel, quality === opt.id && styles.qualityLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Harvest Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any observations, trichome color, smell notes..."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="harvest-notes-input"
            />
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Harvest Date: Today</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !wetWeight.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!wetWeight.trim()}
            testID="save-harvest-btn"
          >
            <Scissors size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save Harvest</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successModal, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.successIconWrap}>
              <CheckCircle2 size={56} color={Colors.primary} />
            </View>
            <View style={styles.partyRow}>
              <PartyPopper size={24} color={Colors.amber} />
              <Text style={styles.successTitle}>Harvest Logged!</Text>
              <PartyPopper size={24} color={Colors.amber} />
            </View>
            <Text style={styles.successSubtitle}>
              {wetWeight}g recorded. Your plant data has been moved to your harvest inventory.
            </Text>

            <TouchableOpacity style={styles.successPrimaryBtn} onPress={handleGoToGarden} testID="go-garden-btn">
              <Text style={styles.successPrimaryBtnText}>Start New Grow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.successSecondaryBtn} onPress={handleGoToProfile} testID="go-profile-btn">
              <Text style={styles.successSecondaryBtnText}>View Inventory</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  inputGroup: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  inputIconWrap: {
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  qualityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  qualityOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.border,
  },
  qualityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  qualityLabelActive: {
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  saveBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successModal: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  successPrimaryBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  successPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  successSecondaryBtn: {
    borderRadius: 18,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  successSecondaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
