import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sprout,
  Leaf,
  TreePine,
  ArrowRight,
  Sun,
  Droplets,
  Calendar,
  Camera,
  BarChart3,
  Zap,
  ChevronRight,
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useAuth, ExperienceLevel } from '@/providers/AuthProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingPage {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgAccent: string;
  icon: React.ElementType;
  features: { icon: React.ElementType; label: string }[];
}

const pages: OnboardingPage[] = [
  {
    id: 'track',
    title: 'Track Your\nGarden',
    subtitle: 'Monitor every stage of growth with real-time dashboards and smart metrics.',
    accentColor: Colors.primary,
    bgAccent: '#E8F5E9',
    icon: Sprout,
    features: [
      { icon: Sun, label: 'Light tracking' },
      { icon: Droplets, label: 'Water logs' },
      { icon: BarChart3, label: 'Growth stats' },
    ],
  },
  {
    id: 'schedule',
    title: 'Never Miss\na Task',
    subtitle: 'Smart scheduling adapts to your plant\u2019s stage and sends timely reminders.',
    accentColor: Colors.amber,
    bgAccent: '#FFF8E1',
    icon: Calendar,
    features: [
      { icon: Zap, label: 'Auto tasks' },
      { icon: Calendar, label: 'Weekly plans' },
      { icon: Droplets, label: 'Feed alerts' },
    ],
  },
  {
    id: 'diagnose',
    title: 'AI Plant\nDoctor',
    subtitle: 'Snap a photo and get instant diagnosis with treatment plans powered by AI.',
    accentColor: '#5C6BC0',
    bgAccent: '#E8EAF6',
    icon: Camera,
    features: [
      { icon: Camera, label: 'Photo scan' },
      { icon: Leaf, label: 'Health check' },
      { icon: Zap, label: 'Quick fixes' },
    ],
  },
  {
    id: 'experience',
    title: 'Your Grow\nLevel',
    subtitle: 'We tailor guides and recommendations to match your expertise.',
    accentColor: Colors.primary,
    bgAccent: '#E8F5E9',
    icon: TreePine,
    features: [],
  },
];

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
    label: 'Seedling',
    description: 'First time grower — guide me through everything.',
    icon: Sprout,
    color: Colors.primaryLight,
    bg: '#E8F5E9',
  },
  {
    level: 'intermediate',
    label: 'Vegetative',
    description: 'Grown a few times — I want to optimize.',
    icon: Leaf,
    color: '#F57C00',
    bg: '#FFF3E0',
  },
  {
    level: 'expert',
    label: 'Flowering',
    description: 'Seasoned cultivator — give me full control.',
    icon: TreePine,
    color: '#5C6BC0',
    bg: '#E8EAF6',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding, userName } = useAuth();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selected, setSelected] = useState<ExperienceLevel>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const iconPulse = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(1)).current;
  const featureSlide = useRef(pages[0].features.map(() => new Animated.Value(0))).current;
  const levelScales = useRef(levels.map(() => new Animated.Value(1))).current;

  const isLastPage = currentPage === pages.length - 1;
  const firstName = userName?.split(' ')[0] || 'Grower';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [iconPulse]);

  const animateFeatures = useCallback((pageIndex: number) => {
    const featureCount = pages[pageIndex].features.length;
    const anims = featureSlide.slice(0, featureCount);
    anims.forEach((a) => a.setValue(30));
    anims.forEach((a, i) => {
      Animated.timing(a, {
        toValue: 0,
        duration: 300,
        delay: i * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [featureSlide]);

  useEffect(() => {
    animateFeatures(0);
  }, [animateFeatures]);

  const goToPage = useCallback((index: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    Animated.timing(contentFade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: false });
      setCurrentPage(index);
      animateFeatures(index);
      Animated.timing(contentFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [contentFade, animateFeatures]);

  const handleNext = useCallback(() => {
    if (isLastPage) return;
    goToPage(currentPage + 1);
  }, [currentPage, isLastPage, goToPage]);

  const handleSelectLevel = useCallback((level: ExperienceLevel, index: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelected(level);
    Animated.sequence([
      Animated.timing(levelScales[index], { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(levelScales[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [levelScales]);

  const handleFinish = useCallback(() => {
    if (!selected) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding(selected);
    router.replace('/(tabs)/(garden)' as never);
  }, [selected, completeOnboarding]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumEnd = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (idx !== currentPage) {
      setCurrentPage(idx);
      animateFeatures(idx);
    }
  }, [currentPage, animateFeatures]);

  const renderInfoPage = (page: OnboardingPage, index: number) => {
    const Icon = page.icon;
    return (
      <View key={page.id} style={[styles.page, { width: SCREEN_WIDTH }]}>
        <Animated.View style={{ opacity: contentFade }}>
          <View style={styles.pageInner}>
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: page.bgAccent, transform: [{ scale: iconPulse }] },
              ]}
            >
              <View style={[styles.iconInner, { backgroundColor: page.accentColor }]}>
                <Icon size={44} color={Colors.white} />
              </View>
            </Animated.View>

            <Text style={styles.pageTitle}>{page.title}</Text>
            <Text style={styles.pageSubtitle}>{page.subtitle}</Text>

            {page.features.length > 0 && (
              <View style={styles.featuresRow}>
                {page.features.map((f, i) => {
                  const FIcon = f.icon;
                  return (
                    <Animated.View
                      key={f.label}
                      style={[
                        styles.featureChip,
                        {
                          backgroundColor: page.bgAccent,
                          transform: [{ translateY: featureSlide[i] || new Animated.Value(0) }],
                        },
                      ]}
                    >
                      <FIcon size={16} color={page.accentColor} />
                      <Text style={[styles.featureLabel, { color: page.accentColor }]}>{f.label}</Text>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderExperiencePage = () => (
    <View key="experience" style={[styles.page, { width: SCREEN_WIDTH }]}>
      <Animated.View style={{ opacity: contentFade }}>
        <View style={styles.pageInner}>
          <Text style={styles.experienceGreeting}>Almost there, {firstName}!</Text>
          <Text style={[styles.pageTitle, { fontSize: 28 }]}>Pick your{'\n'}grow level</Text>
          <Text style={[styles.pageSubtitle, { marginBottom: 24 }]}>
            This shapes your entire experience.
          </Text>

          <View style={styles.levelsContainer}>
            {levels.map((item, index) => {
              const LIcon = item.icon;
              const isSelected = selected === item.level;
              return (
                <Animated.View key={item.level} style={{ transform: [{ scale: levelScales[index] }] }}>
                  <TouchableOpacity
                    style={[styles.levelCard, isSelected && styles.levelCardSelected]}
                    onPress={() => handleSelectLevel(item.level, index)}
                    activeOpacity={0.85}
                    testID={`level-${item.level}`}
                  >
                    <View style={[styles.levelIconCircle, { backgroundColor: item.bg }]}>
                      <LIcon size={24} color={item.color} />
                    </View>
                    <View style={styles.levelTextBlock}>
                      <Text style={styles.levelLabel}>{item.label}</Text>
                      <Text style={styles.levelDesc}>{item.description}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <ChevronRight size={14} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View style={styles.dotsRow}>
          {pages.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });
            const dotColor = pages[i].accentColor;
            return (
              <TouchableOpacity key={i} onPress={() => goToPage(i)} activeOpacity={0.7}>
                <Animated.View
                  style={[
                    styles.dot,
                    { width: dotWidth, opacity: dotOpacity, backgroundColor: dotColor },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
        {!isLastPage && (
          <TouchableOpacity onPress={() => goToPage(pages.length - 1)} testID="skip-btn">
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {pages.map((page, i) =>
          i < pages.length - 1 ? renderInfoPage(page, i) : renderExperiencePage()
        )}
      </Animated.ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {isLastPage ? (
          <TouchableOpacity
            style={[styles.ctaButton, !selected && styles.ctaDisabled]}
            onPress={handleFinish}
            disabled={!selected}
            activeOpacity={0.85}
            testID="finish-setup-btn"
          >
            <Text style={styles.ctaText}>Let's Grow</Text>
            <Sprout size={20} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleNext}
            activeOpacity={0.85}
            testID="next-btn"
          >
            <Text style={styles.ctaText}>Continue</Text>
            <ArrowRight size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
    height: 36,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
  },
  pageInner: {
    paddingHorizontal: 28,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconInner: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: Colors.text,
    lineHeight: 42,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  experienceGreeting: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 8,
  },
  levelsContainer: {
    gap: 10,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 14,
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
  levelIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTextBlock: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  levelDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  ctaButton: {
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
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
