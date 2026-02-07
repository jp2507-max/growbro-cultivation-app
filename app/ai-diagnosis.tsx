import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Pill,
  CalendarPlus,
  ArrowRight,
  Leaf,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

interface DiagnosisResult {
  status: 'healthy' | 'issue';
  title: string;
  confidence: number;
  explanation: string;
  treatmentSteps: string[];
}

const diagnosisResults: Record<string, DiagnosisResult> = {
  healthy: {
    status: 'healthy',
    title: 'Plant Looks Healthy!',
    confidence: 94,
    explanation:
      'Your plant appears to be in excellent condition. Leaves show vibrant green color with no signs of nutrient deficiency, pest damage, or disease. The overall structure and growth pattern indicate a well-maintained plant.',
    treatmentSteps: [
      'Continue current watering schedule',
      'Maintain nutrient mix as planned',
      'Monitor new growth for any changes',
      'Keep environmental conditions stable',
    ],
  },
  issue: {
    status: 'issue',
    title: 'Nitrogen Deficiency Detected',
    confidence: 87,
    explanation:
      'The lower leaves are showing yellowing patterns characteristic of nitrogen deficiency. This typically starts from the bottom of the plant and progresses upward. The older leaves turn pale green then yellow because nitrogen is a mobile nutrient that the plant redirects to new growth.',
    treatmentSteps: [
      'Increase nitrogen in next feeding by 20%',
      'Use a balanced N-P-K fertilizer (higher N ratio)',
      'Check pH levels — nitrogen uptake is best at pH 6.0-6.5',
      'Monitor affected leaves over the next 5-7 days',
      'Consider foliar spray for quick absorption',
    ],
  },
};

export default function AIDiagnosisScreen() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const result = diagnosisResults[type === 'issue' ? 'issue' : 'healthy'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showToast, setShowToast] = useState<boolean>(false);
  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.timing(progressAnim, {
      toValue: result.confidence / 100,
      duration: 1200,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim, slideAnim, progressAnim, result.confidence]);

  const handleAddToTasks = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setShowToast(false);
      router.back();
    });
  }, [toastAnim]);

  const isHealthy = result.status === 'healthy';
  const statusColor = isHealthy ? Colors.primary : '#E65100';
  const statusBg = isHealthy ? Colors.border : '#FFF3E0';

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="back-diagnosis">
          <ChevronLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Diagnosis</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[styles.statusCard, { borderLeftColor: statusColor }]}>
            <View style={[styles.statusIconWrap, { backgroundColor: statusBg }]}>
              {isHealthy ? (
                <Heart size={32} color={statusColor} />
              ) : (
                <AlertTriangle size={32} color={statusColor} />
              )}
            </View>
            <Text style={[styles.statusTitle, { color: statusColor }]}>{result.title}</Text>

            <View style={styles.confidenceSection}>
              <View style={styles.confidenceHeader}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={[styles.confidenceValue, { color: statusColor }]}>{result.confidence}%</Text>
              </View>
              <View style={styles.confidenceBarBg}>
                <Animated.View
                  style={[styles.confidenceBarFill, { width: progressWidth, backgroundColor: statusColor }]}
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Leaf size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Analysis</Text>
            </View>
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Pill size={18} color={Colors.amber} />
              <Text style={styles.cardTitle}>
                {isHealthy ? 'Maintenance Plan' : 'Treatment Plan'}
              </Text>
            </View>
            {result.treatmentSteps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.addTaskBtn}
            onPress={handleAddToTasks}
            activeOpacity={0.85}
            testID="add-treatment-tasks-btn"
          >
            <CalendarPlus size={20} color={Colors.white} />
            <Text style={styles.addTaskBtnText}>Add to Schedule</Text>
            <ArrowRight size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanAgainBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
            testID="scan-again-btn"
          >
            <Text style={styles.scanAgainBtnText}>Scan Again</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {showToast && (
        <Animated.View style={[styles.toast, { opacity: toastAnim, bottom: insets.bottom + 20 }]}>
          <CheckCircle2 size={20} color={Colors.white} />
          <Text style={styles.toastText}>Treatment added to your schedule!</Text>
        </Animated.View>
      )}
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
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statusIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '900' as const,
    textAlign: 'center',
    marginBottom: 20,
  },
  confidenceSection: {
    width: '100%',
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  confidenceValue: {
    fontSize: 15,
    fontWeight: '800' as const,
  },
  confidenceBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  explanationText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    paddingTop: 3,
  },
  addTaskBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addTaskBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  scanAgainBtn: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  scanAgainBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
