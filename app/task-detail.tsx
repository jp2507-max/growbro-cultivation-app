import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { ChevronLeft, CheckCircle, Circle, Droplets, Thermometer, Clock, FlaskConical } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

interface TaskStep {
  id: string;
  label: string;
  title: string;
  description: string;
  tags: { icon: 'droplets' | 'thermometer' | 'clock' | 'flask'; text: string }[];
  completed: boolean;
}

const iconMap = {
  droplets: Droplets,
  thermometer: Thermometer,
  clock: Clock,
  flask: FlaskConical,
};

const defaultSteps: TaskStep[] = [
  {
    id: '1',
    label: 'STEP 1',
    title: 'Preparation',
    description: 'Fill your reservoir with fresh, pH-balanced water. Ensure the temperature is approx 20°C.',
    tags: [{ icon: 'droplets', text: '10 Liters Water' }, { icon: 'thermometer', text: '20°C' }],
    completed: false,
  },
  {
    id: '2',
    label: 'STEP 2',
    title: 'Micro-Nutrients',
    description: 'Shake the bottle well before use. Add FloraMicro directly to the water reservoir.',
    tags: [{ icon: 'flask', text: '5ml FloraMicro' }],
    completed: false,
  },
  {
    id: '3',
    label: 'STEP 3',
    title: 'Stir Solution',
    description: 'Stir the solution thoroughly using a clean mixing stick before adding the next nutrient to prevent lockout.',
    tags: [{ icon: 'clock', text: '2 Minutes' }],
    completed: false,
  },
  {
    id: '4',
    label: 'STEP 4',
    title: 'pH Check',
    description: 'Test the final pH of the solution. It should be between 5.5 and 6.5.',
    tags: [],
    completed: false,
  },
];

export default function TaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const { title: taskTitle } = useLocalSearchParams<{ title?: string }>();
  const [steps, setSteps] = useState<TaskStep[]>(defaultSteps);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? completedCount / steps.length : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const toggleStep = useCallback((id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  }, []);

  const handleMarkComplete = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSteps((prev) => prev.map((s) => ({ ...s, completed: true })));
    setTimeout(() => router.back(), 600);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="back-task">
          <ChevronLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{taskTitle ?? 'Nutrient Mix A'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>TASK PROGRESS</Text>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Keep it growing!</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        {steps.map((step) => (
          <TouchableOpacity
            key={step.id}
            style={[styles.stepCard, step.completed && styles.stepCardCompleted]}
            onPress={() => toggleStep(step.id)}
            activeOpacity={0.8}
            testID={`step-${step.id}`}
          >
            {step.completed && <View style={styles.completedBanner} />}
            <View style={styles.stepHeader}>
              <View style={{ flex: 1 }}>
                {!step.completed && <Text style={styles.stepLabel}>{step.label}</Text>}
                <Text style={[styles.stepTitle, step.completed && styles.stepTitleCompleted]}>{step.title}</Text>
              </View>
              {step.completed ? (
                <CheckCircle size={28} color={Colors.primary} />
              ) : (
                <Circle size={28} color={Colors.borderLight} />
              )}
            </View>
            <Text style={styles.stepDesc}>{step.description}</Text>
            {step.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {step.tags.map((tag) => {
                  const TagIcon = iconMap[tag.icon];
                  return (
                    <View key={tag.text} style={styles.tag}>
                      <TagIcon size={14} color={Colors.textSecondary} />
                      <Text style={styles.tagText}>{tag.text}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.completeBtn} onPress={handleMarkComplete} activeOpacity={0.85} testID="mark-complete-btn">
          <CheckCircle size={20} color={Colors.white} />
          <Text style={styles.completeBtnText}>Mark as Complete</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
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
    flex: 1,
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  stepCardCompleted: {
    borderColor: Colors.primaryLight,
  },
  completedBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#4ADE80',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  stepTitleCompleted: {
    color: Colors.primary,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
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
  completeBtn: {
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
  completeBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
