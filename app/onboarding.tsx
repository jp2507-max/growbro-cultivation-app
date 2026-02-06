import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sprout, Leaf, TreePine, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useAuth, ExperienceLevel } from '@/providers/AuthProvider';

interface LevelOption {
  level: ExperienceLevel;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const levels: LevelOption[] = [
  {
    level: 'beginner',
    label: 'Beginner',
    description: 'First time grower. I need step-by-step guidance for everything.',
    icon: Sprout,
    color: Colors.primaryLight,
    bg: '#E8F5E9',
  },
  {
    level: 'intermediate',
    label: 'Intermediate',
    description: "I've grown a few times. I know the basics but want to optimize.",
    icon: Leaf,
    color: '#F57C00',
    bg: '#FFF3E0',
  },
  {
    level: 'expert',
    label: 'Expert',
    description: 'Seasoned cultivator. I want advanced analytics and fine control.',
    icon: TreePine,
    color: '#5C6BC0',
    bg: '#E8EAF6',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, userName } = useAuth();
  const [selected, setSelected] = useState<ExperienceLevel>(null);
  const scaleAnims = useRef(levels.map(() => new Animated.Value(1))).current;

  const handleSelect = useCallback((level: ExperienceLevel, index: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelected(level);
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [scaleAnims]);

  const handleFinish = useCallback(() => {
    if (!selected) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding(selected);
    router.replace('/(tabs)/(garden)' as never);
  }, [selected, completeOnboarding]);

  const firstName = userName?.split(' ')[0] || 'Grower';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Hey {firstName}! 👋</Text>
        <Text style={styles.title}>How experienced{'\n'}are you?</Text>
        <Text style={styles.subtitle}>This helps us tailor your guides and recommendations.</Text>

        <View style={styles.cardsSection}>
          {levels.map((item, index) => {
            const Icon = item.icon;
            const isSelected = selected === item.level;
            return (
              <Animated.View key={item.level} style={{ transform: [{ scale: scaleAnims[index] }] }}>
                <TouchableOpacity
                  style={[styles.levelCard, isSelected && styles.levelCardSelected]}
                  onPress={() => handleSelect(item.level, index)}
                  activeOpacity={0.85}
                  testID={`level-${item.level}`}
                >
                  <View style={[styles.levelIcon, { backgroundColor: item.bg }]}>
                    <Icon size={26} color={item.color} />
                  </View>
                  <View style={styles.levelText}>
                    <Text style={styles.levelLabel}>{item.label}</Text>
                    <Text style={styles.levelDesc}>{item.description}</Text>
                  </View>
                  {isSelected && <View style={styles.selectedDot} />}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.finishBtn, !selected && styles.finishBtnDisabled]}
          onPress={handleFinish}
          disabled={!selected}
          activeOpacity={0.85}
          testID="finish-setup-btn"
        >
          <Text style={styles.finishBtnText}>Finish Setup</Text>
          <ArrowRight size={20} color={Colors.white} />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 8,
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
    lineHeight: 22,
  },
  cardsSection: {
    gap: 12,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  levelCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F1F8E9',
  },
  levelIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  levelDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  selectedDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  finishBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishBtnDisabled: {
    opacity: 0.4,
  },
  finishBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
