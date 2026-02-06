import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ArrowRight, Leaf, Sun, FlaskConical, Warehouse, TreePine, Check, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

type StrainType = 'Indica' | 'Sativa' | 'Hybrid' | null;
type Environment = 'Indoor' | 'Outdoor' | null;

const strainOptions: { type: StrainType; label: string; subtitle: string; icon: React.ElementType; color: string; bg: string }[] = [
  { type: 'Indica', label: 'Indica', subtitle: 'RELAXING & CALM', icon: Leaf, color: Colors.primary, bg: Colors.border },
  { type: 'Sativa', label: 'Sativa', subtitle: 'ENERGIZING & FOCUS', icon: Sun, color: '#F57C00', bg: '#FFF3E0' },
  { type: 'Hybrid', label: 'Hybrid', subtitle: 'BALANCED BLEND', icon: FlaskConical, color: '#5C6BC0', bg: '#E8EAF6' },
];

export default function AddPlantScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<number>(1);
  const [plantName, setPlantName] = useState<string>('');
  const [strainType, setStrainType] = useState<StrainType>(null);
  const [environment, setEnvironment] = useState<Environment>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const totalSteps = 3;

  const animateTransition = useCallback((next: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const canProceed = step === 1 ? plantName.trim().length > 0 && strainType !== null : step === 2 ? environment !== null : true;

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < totalSteps) {
      animateTransition(step + 1);
    } else {
      setShowSuccess(true);
      Animated.parallel([
        Animated.spring(modalScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.timing(modalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [canProceed, step, animateTransition, modalScale, modalOpacity]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      animateTransition(step - 1);
    } else {
      router.back();
    }
  }, [step, animateTransition]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} testID="back-add-plant">
          <ChevronLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>
          <Text style={styles.stepCurrent}>{step}</Text> of {totalSteps}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            {step === 1 && (
              <View>
                <Text style={styles.title}>What are you{'\n'}growing?</Text>
                <Text style={styles.subtitle}>{"Let's start with the basics."}</Text>

                <Text style={styles.fieldLabel}>Plant Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Northern Lights"
                  placeholderTextColor={Colors.textMuted}
                  value={plantName}
                  onChangeText={setPlantName}
                  testID="plant-name-input"
                />

                <Text style={[styles.fieldLabel, { marginTop: 28 }]}>Strain Type</Text>
                {strainOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = strainType === opt.type;
                  return (
                    <TouchableOpacity
                      key={opt.type}
                      style={[styles.strainOption, selected && styles.strainOptionSelected]}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setStrainType(opt.type);
                      }}
                      testID={`strain-type-${opt.type}`}
                    >
                      <View style={[styles.strainIcon, { backgroundColor: opt.bg }]}>
                        <Icon size={22} color={opt.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.strainLabel}>{opt.label}</Text>
                        <Text style={styles.strainSub}>{opt.subtitle}</Text>
                      </View>
                      {selected && (
                        <View style={styles.checkCircle}>
                          <Check size={14} color={Colors.white} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.title}>Growing{'\n'}Environment</Text>
                <Text style={styles.subtitle}>Where will this plant live?</Text>

                <TouchableOpacity
                  style={[styles.envCard, environment === 'Indoor' && styles.envCardSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setEnvironment('Indoor');
                  }}
                  testID="env-indoor"
                >
                  <View style={[styles.envIconWrap, { backgroundColor: '#E3F2FD' }]}>
                    <Warehouse size={28} color="#1565C0" />
                  </View>
                  <Text style={styles.envTitle}>Indoor</Text>
                  <Text style={styles.envDesc}>Grow tent, closet, or room with controlled lighting and climate.</Text>
                  {environment === 'Indoor' && (
                    <View style={styles.envCheck}><Check size={14} color={Colors.white} /></View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.envCard, environment === 'Outdoor' && styles.envCardSelected]}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    setEnvironment('Outdoor');
                  }}
                  testID="env-outdoor"
                >
                  <View style={[styles.envIconWrap, { backgroundColor: '#E8F5E9' }]}>
                    <TreePine size={28} color={Colors.primary} />
                  </View>
                  <Text style={styles.envTitle}>Outdoor</Text>
                  <Text style={styles.envDesc}>Garden, balcony, or greenhouse using natural sunlight.</Text>
                  {environment === 'Outdoor' && (
                    <View style={styles.envCheck}><Check size={14} color={Colors.white} /></View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View style={styles.summaryView}>
                <Text style={styles.title}>Ready to{'\n'}grow!</Text>
                <Text style={styles.subtitle}>{"Here's a summary of your new plant."}</Text>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Name</Text>
                    <Text style={styles.summaryValue}>{plantName}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Strain</Text>
                    <Text style={styles.summaryValue}>{strainType}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Environment</Text>
                    <Text style={styles.summaryValue}>{environment}</Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed}
            activeOpacity={0.85}
            testID="next-step-btn"
          >
            <Text style={styles.nextBtnText}>{step === totalSteps ? 'Start Growing' : 'Next Step'}</Text>
            {step < totalSteps && <ArrowRight size={20} color={Colors.white} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Modal visible={showSuccess} transparent animationType="none" testID="success-modal">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { opacity: modalOpacity, transform: [{ scale: modalScale }] }]}>
            <View style={styles.modalCheckCircle}>
              <CheckCircle size={48} color={Colors.white} />
            </View>
            <Text style={styles.modalTitle}>{"It's a Grow!"}</Text>
            <Text style={styles.modalBody}>Your tasks for the next week have been generated.</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)/(garden)' as never);
              }}
              activeOpacity={0.85}
              testID="go-to-garden-btn"
            >
              <Text style={styles.modalBtnText}>Go to Garden</Text>
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
  stepIndicator: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  stepCurrent: {
    color: Colors.primary,
    fontWeight: '800' as const,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.text,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  strainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  strainOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F1F8E9',
  },
  strainIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strainLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  strainSub: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  envCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F1F8E9',
  },
  envIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  envTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  envDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  envCheck: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  nextBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    width: '100%',
  },
  modalBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
