import * as Haptics from 'expo-haptics';
import { type TFunction } from 'i18next';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Camera,
  ChevronRight,
  Droplets,
  Leaf,
  Sprout,
  Sun,
  TreePine,
  Zap,
} from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useWindowDimensions } from 'react-native';
import {
  cancelAnimation,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
// Raw Reanimated export for ScrollView and other non-styled components
import RNAnimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { type ExperienceLevel, useAuth } from '@/providers/auth-provider';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';
// NativeWind-wrapped Animated for styled components (View, Image, etc)
import { Animated } from '@/src/tw/animated';

interface OnboardingPage {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgAccent: string;
  icon: React.ElementType;
  features: { icon: React.ElementType; label: string }[];
}

function buildPages(t: TFunction<['auth', 'common']>): OnboardingPage[] {
  return [
    {
      id: 'track',
      title: t('onboarding.pages.track.title'),
      subtitle: t('onboarding.pages.track.subtitle'),
      accentColor: Colors.primary,
      bgAccent: '#E8F5E9',
      icon: Sprout,
      features: [
        {
          icon: Sun,
          label: t('onboarding.pages.track.features.lightTracking'),
        },
        {
          icon: Droplets,
          label: t('onboarding.pages.track.features.waterLogs'),
        },
        {
          icon: BarChart3,
          label: t('onboarding.pages.track.features.growthStats'),
        },
      ],
    },
    {
      id: 'schedule',
      title: t('onboarding.pages.schedule.title'),
      subtitle: t('onboarding.pages.schedule.subtitle'),
      accentColor: Colors.warning,
      bgAccent: '#FFF8E1',
      icon: Calendar,
      features: [
        {
          icon: Zap,
          label: t('onboarding.pages.schedule.features.autoTasks'),
        },
        {
          icon: Calendar,
          label: t('onboarding.pages.schedule.features.weeklyPlans'),
        },
        {
          icon: Droplets,
          label: t('onboarding.pages.schedule.features.feedAlerts'),
        },
      ],
    },
    {
      id: 'diagnose',
      title: t('onboarding.pages.diagnose.title'),
      subtitle: t('onboarding.pages.diagnose.subtitle'),
      accentColor: '#5C6BC0',
      bgAccent: '#E8EAF6',
      icon: Camera,
      features: [
        {
          icon: Camera,
          label: t('onboarding.pages.diagnose.features.photoScan'),
        },
        {
          icon: Leaf,
          label: t('onboarding.pages.diagnose.features.healthCheck'),
        },
        {
          icon: Zap,
          label: t('onboarding.pages.diagnose.features.quickFixes'),
        },
      ],
    },
    {
      id: 'experience',
      title: t('onboarding.pages.experience.title'),
      subtitle: t('onboarding.pages.experience.subtitle'),
      accentColor: Colors.primary,
      bgAccent: '#E8F5E9',
      icon: TreePine,
      features: [],
    },
  ];
}

interface LevelOption {
  level: ExperienceLevel;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function buildLevels(t: TFunction<['auth', 'common']>): LevelOption[] {
  return [
    {
      level: 'beginner',
      label: t('onboarding.levels.beginner.label'),
      description: t('onboarding.levels.beginner.description'),
      icon: Sprout,
      color: Colors.primaryLight,
      bg: '#E8F5E9',
    },
    {
      level: 'intermediate',
      label: t('onboarding.levels.intermediate.label'),
      description: t('onboarding.levels.intermediate.description'),
      icon: Leaf,
      color: '#F57C00',
      bg: '#FFF3E0',
    },
    {
      level: 'expert',
      label: t('onboarding.levels.expert.label'),
      description: t('onboarding.levels.expert.description'),
      icon: TreePine,
      color: '#5C6BC0',
      bg: '#E8EAF6',
    },
  ];
}

const BUTTON_BASE_CLASSES =
  'bg-primary-dark dark:bg-primary-bright rounded-[20px] py-[18px] flex-row items-center justify-center gap-2 shadow-md active:opacity-80';

function DotIndicator({
  index,
  scrollX,
  color,
  onPress,
  screenWidth,
  accessibilityLabel,
  accessibilityHint,
}: {
  index: number;
  scrollX: SharedValue<number>;
  color: string;
  onPress: () => void;
  screenWidth: number;
  accessibilityLabel: string;
  accessibilityHint: string;
}) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];
    return {
      width: interpolate(
        scrollX.get(),
        inputRange,
        [8, 28, 8],
        Extrapolation.CLAMP
      ),
      opacity: interpolate(
        scrollX.get(),
        inputRange,
        [0.25, 1, 0.25],
        Extrapolation.CLAMP
      ),
    };
  });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
    >
      <Animated.View
        style={[{ backgroundColor: color }, dotStyle]}
        className="h-2 rounded"
      />
    </Pressable>
  );
}

function FeatureChipAnimated({
  icon: FIcon,
  label,
  bgAccent,
  accentColor,
  sharedValue,
}: {
  icon: React.ElementType;
  label: string;
  bgAccent: string;
  accentColor: string;
  sharedValue: SharedValue<number>;
}) {
  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sharedValue.get() }],
  }));
  return (
    <Animated.View
      style={[{ backgroundColor: bgAccent }, chipStyle]}
      className="flex-row items-center gap-1.5 rounded-[14px] px-3.5 py-2.5"
    >
      <FIcon size={16} color={accentColor} />
      <Text className="text-[13px] font-bold" style={{ color: accentColor }}>
        {label}
      </Text>
    </Animated.View>
  );
}

function LevelCardAnimated({
  item,
  index,
  isSelected,
  onSelect,
  sharedScale,
}: {
  item: LevelOption;
  index: number;
  isSelected: boolean;
  onSelect: (level: ExperienceLevel, index: number) => void;
  sharedScale: SharedValue<number>;
}) {
  const LIcon = item.icon;
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sharedScale.get() }],
  }));
  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        accessibilityRole="button"
        className={cn(
          'flex-row items-center bg-white dark:bg-dark-bg-card rounded-[18px] p-4 gap-3.5 border-2 border-transparent shadow-sm',
          isSelected &&
            'border-primary dark:border-primary-bright bg-background dark:bg-dark-bg-elevated'
        )}
        onPress={() => onSelect(item.level, index)}
        testID={`level-${item.level}`}
      >
        <View
          className="size-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: item.bg }}
        >
          <LIcon size={24} color={item.color} />
        </View>
        <View className="flex-1">
          <Text className="text-text dark:text-text-primary-dark mb-0.5 text-[17px] font-bold">
            {item.label}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark text-[13px] leading-[17px]">
            {item.description}
          </Text>
        </View>
        {isSelected && (
          <View className="bg-primary dark:bg-primary-bright size-6 items-center justify-center rounded-full">
            <ChevronRight size={14} color={Colors.white} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const { t } = useTranslation(['auth', 'common']);
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const screenWidthSV = useSharedValue(SCREEN_WIDTH);

  useEffect(() => {
    screenWidthSV.set(SCREEN_WIDTH);
  }, [SCREEN_WIDTH, screenWidthSV]);
  const insets = useSafeAreaInsets();
  const { completeOnboarding, userName } = useAuth();

  const pages = useMemo(() => buildPages(t), [t]);
  const levels = useMemo(() => buildLevels(t), [t]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selected, setSelected] = useState<ExperienceLevel>(null);
  const scrollRef = useRef<RNAnimated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const iconPulse = useSharedValue(1);
  const contentFade = useSharedValue(1);

  const maxFeatures = Math.max(...pages.map((p) => p.features.length));
  // Note: These shared value counts must match level/page array lengths to satisfy Hooks rules.
  // If either array grows, additional shared values must be declared here manually.
  const featureSlide0 = useSharedValue(0);
  const featureSlide1 = useSharedValue(0);
  const featureSlide2 = useSharedValue(0);
  const featureSlides = useMemo(
    () => [featureSlide0, featureSlide1, featureSlide2].slice(0, maxFeatures),
    [featureSlide0, featureSlide1, featureSlide2, maxFeatures]
  );
  const levelScale0 = useSharedValue(1);
  const levelScale1 = useSharedValue(1);
  const levelScale2 = useSharedValue(1);
  const levelScales = useMemo(
    () => [levelScale0, levelScale1, levelScale2],
    [levelScale0, levelScale1, levelScale2]
  );

  const isLastPage = currentPage === pages.length - 1;
  const firstName = userName?.split(' ')[0] || t('onboarding.defaultName');

  const iconPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.get() }],
  }));

  const contentFadeStyle = useAnimatedStyle(() => ({
    opacity: contentFade.get(),
  }));

  useEffect(() => {
    iconPulse.set(
      withRepeat(
        withSequence(
          withTiming(1.08, rmTiming(1200)),
          withTiming(1, rmTiming(1200))
        ),
        -1,
        true
      )
    );
    return () => cancelAnimation(iconPulse);
  }, [iconPulse]);

  const animateFeatures = useCallback(
    (pageIndex: number) => {
      const featureCount = pages[pageIndex].features.length;
      for (let i = 0; i < Math.min(featureCount, featureSlides.length); i++) {
        featureSlides[i].set(30);
        featureSlides[i].set(
          withDelay(i * 100, withTiming(0, rmTiming(motion.dur.lg)))
        );
      }
    },
    [featureSlides, pages]
  );

  useEffect(() => {
    animateFeatures(0);
  }, [animateFeatures]);

  const doGoToPage = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: false,
      });
      setCurrentPage(index);
      animateFeatures(index);
      contentFade.set(withTiming(1, rmTiming(motion.dur.sm)));
    },
    [SCREEN_WIDTH, animateFeatures, contentFade]
  );

  const goToPage = useCallback(
    (index: number) => {
      if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
      contentFade.set(
        withTiming(0, rmTiming(motion.dur.xs), (finished) => {
          if (finished) {
            scheduleOnRN(doGoToPage, index);
          }
        })
      );
    },
    [contentFade, doGoToPage]
  );

  const handleNext = useCallback(() => {
    if (isLastPage) return;
    goToPage(currentPage + 1);
  }, [currentPage, isLastPage, goToPage]);

  const handleSelectLevel = useCallback(
    (level: ExperienceLevel, index: number) => {
      if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
      setSelected(level);
      levelScales[index].set(
        withSequence(
          withTiming(0.95, rmTiming(motion.dur.xs)),
          withTiming(1, rmTiming(motion.dur.xs))
        )
      );
    },
    [levelScales]
  );

  const handleFinish = useCallback(async () => {
    if (!selected) return;
    try {
      await completeOnboarding(selected);
      if (process.env.EXPO_OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // _layout.tsx will reactively redirect once profile query updates
    } catch {
      Alert.alert(
        t('common:error'),
        t('onboarding.errors.failedSavePreferences')
      );
    }
  }, [selected, completeOnboarding, t]);

  const onMomentumEnd = useCallback(
    (idx: number) => {
      setCurrentPage(idx);
      animateFeatures(idx);
    },
    [animateFeatures]
  );

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.set(event.contentOffset.x);
    },
    onMomentumEnd: (event) => {
      const idx = Math.round(event.contentOffset.x / screenWidthSV.get());
      scheduleOnRN(onMomentumEnd, idx);
    },
  });

  const renderInfoPage = (page: OnboardingPage, _index: number) => {
    const Icon = page.icon;
    return (
      <View
        key={page.id}
        className="flex-1 justify-center"
        style={{ width: SCREEN_WIDTH }}
      >
        <Animated.View style={contentFadeStyle}>
          <View className="px-7">
            <Animated.View
              style={[{ backgroundColor: page.bgAccent }, iconPulseStyle]}
              className="mb-8 size-[120px] items-center justify-center rounded-[40px]"
            >
              <View
                className="size-[76px] items-center justify-center rounded-[26px] shadow-lg"
                style={{ backgroundColor: page.accentColor }}
              >
                <Icon size={44} color={Colors.white} />
              </View>
            </Animated.View>

            <Text className="text-text dark:text-text-primary-dark mb-3 text-4xl font-black leading-[42px] tracking-tight">
              {page.title}
            </Text>
            <Text className="text-text-secondary dark:text-text-secondary-dark mb-8 text-[17px] leading-6">
              {page.subtitle}
            </Text>

            {page.features.length > 0 && (
              <View className="flex-row flex-wrap gap-2.5">
                {page.features.map((f, i) => {
                  const safeSharedValue =
                    featureSlides[i] ??
                    featureSlides[Math.max(0, featureSlides.length - 1)];
                  return (
                    <FeatureChipAnimated
                      key={f.label}
                      icon={f.icon}
                      label={f.label}
                      bgAccent={page.bgAccent}
                      accentColor={page.accentColor}
                      sharedValue={safeSharedValue}
                    />
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
    <View
      key="experience"
      className="flex-1 justify-center"
      style={{ width: SCREEN_WIDTH }}
    >
      <Animated.View style={contentFadeStyle}>
        <View className="px-7">
          <Text className="text-primary dark:text-primary-bright mb-2 text-[15px] font-semibold">
            {t('onboarding.pages.experience.almostThere', { firstName })}
          </Text>
          <Text className="text-text dark:text-text-primary-dark mb-3 text-[28px] font-black leading-[42px] tracking-tight">
            {t('onboarding.pages.experience.pickLevel')}
          </Text>
          <Text className="text-text-secondary dark:text-text-secondary-dark mb-6 text-[17px] leading-6">
            {t('onboarding.pages.experience.shapesExperience')}
          </Text>

          <View className="gap-2.5">
            {levels.map((item, index) => (
              <LevelCardAnimated
                key={item.level}
                item={item}
                index={index}
                isSelected={selected === item.level}
                onSelect={handleSelectLevel}
                sharedScale={levelScales[index]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View
      className="bg-background dark:bg-dark-bg flex-1"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="mb-2 h-9 flex-row items-center justify-between px-6">
        <View className="flex-row items-center gap-1.5">
          {pages.map((_, i) => (
            <DotIndicator
              key={i}
              index={i}
              scrollX={scrollX}
              color={pages[i].accentColor}
              onPress={() => goToPage(i)}
              screenWidth={SCREEN_WIDTH}
              accessibilityLabel={t('onboarding.a11y.dotLabel', {
                index: i + 1,
              })}
              accessibilityHint={t('onboarding.a11y.dotHint')}
            />
          ))}
        </View>
        {!isLastPage && (
          <Pressable
            accessibilityRole="button"
            onPress={() => goToPage(pages.length - 1)}
            testID="skip-btn"
          >
            <Text className="text-text-secondary dark:text-text-secondary-dark text-[15px] font-semibold">
              {t('onboarding.skip')}
            </Text>
          </Pressable>
        )}
      </View>

      <RNAnimated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {pages.map((page, i) =>
          i < pages.length - 1
            ? renderInfoPage(page, i)
            : renderExperiencePage()
        )}
      </RNAnimated.ScrollView>

      <View
        className="px-6 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        {isLastPage ? (
          <Pressable
            accessibilityRole="button"
            className={cn(BUTTON_BASE_CLASSES, !selected && 'opacity-40')}
            onPress={handleFinish}
            disabled={!selected}
            testID="finish-setup-btn"
          >
            <Text className="text-[17px] font-bold text-white">
              {t('onboarding.letsGrow')}
            </Text>
            <Sprout size={20} color={Colors.white} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            className={BUTTON_BASE_CLASSES}
            onPress={handleNext}
            testID="next-btn"
          >
            <Text className="text-[17px] font-bold text-white">
              {t('onboarding.continue')}
            </Text>
            <ArrowRight size={20} color={Colors.white} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
