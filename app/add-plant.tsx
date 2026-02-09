import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  ArrowRight,
  Check,
  CheckCircle,
  ChevronLeft,
  FlaskConical,
  Leaf,
  Sun,
  TreePine,
  Warehouse,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';

type StrainType = 'Indica' | 'Sativa' | 'Hybrid' | null;
type Environment = 'Indoor' | 'Outdoor' | null;

const strainOptions: {
  type: StrainType;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    type: 'Indica',
    label: 'Indica',
    subtitle: 'RELAXING & CALM',
    icon: Leaf,
    color: Colors.primary,
    bg: Colors.border,
  },
  {
    type: 'Sativa',
    label: 'Sativa',
    subtitle: 'ENERGIZING & FOCUS',
    icon: Sun,
    color: '#F57C00',
    bg: '#FFF3E0',
  },
  {
    type: 'Hybrid',
    label: 'Hybrid',
    subtitle: 'BALANCED BLEND',
    icon: FlaskConical,
    color: '#5C6BC0',
    bg: '#E8EAF6',
  },
];

export default function AddPlantScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<number>(1);
  const [plantName, setPlantName] = useState<string>('');
  const [strainType, setStrainType] = useState<StrainType>(null);
  const [environment, setEnvironment] = useState<Environment>(null);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const fadeAnim = useSharedValue(1);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const totalSteps = 3;

  const applyStepChange = useCallback((next: number) => {
    setStep(next);
  }, []);

  const animateTransition = useCallback(
    (next: number) => {
      fadeAnim.set(
        withTiming(0, rmTiming(motion.dur.xs), (finished) => {
          if (finished) {
            scheduleOnRN(applyStepChange, next);
            fadeAnim.set(withTiming(1, rmTiming(motion.dur.sm)));
          }
        })
      );
    },
    [fadeAnim, applyStepChange]
  );

  const canProceed =
    step === 1
      ? plantName.trim().length > 0 && strainType !== null
      : step === 2
        ? environment !== null
        : true;

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < totalSteps) {
      animateTransition(step + 1);
    } else {
      setShowSuccess(true);
      const showModal = () => {
        modalScale.set(withSpring(1, motion.spring.gentle));
        modalOpacity.set(withTiming(1, rmTiming(motion.dur.md)));
      };
      scheduleOnUI(showModal);
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
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <View className="flex-row items-center justify-between px-4 py-2.5">
        {step > 1 ? (
          <Pressable
            accessibilityRole="button"
            className="size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
            onPress={handleBack}
            testID="back-add-plant"
          >
            <ChevronLeft size={22} color={Colors.text} />
          </Pressable>
        ) : (
          <View className="size-10" />
        )}
        <Text
          className="text-[15px] font-semibold text-textMuted dark:text-text-muted-dark"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          <Text className="font-extrabold text-primary dark:text-primary-bright">
            {step}
          </Text>{' '}
          of {totalSteps}
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 10,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={fadeStyle} className="flex-1">
            {step === 1 && (
              <View>
                <Text className="mb-2 text-[32px] font-black leading-[38px] text-text dark:text-text-primary-dark">
                  What are you{'\n'}growing?
                </Text>
                <Text className="mb-8 text-base text-textSecondary dark:text-text-secondary-dark">
                  {"Let's start with the basics."}
                </Text>

                <Text className="mb-2.5 text-[15px] font-bold text-text dark:text-text-primary-dark">
                  Plant Name
                </Text>
                <TextInput
                  accessibilityLabel="Plant name input"
                  accessibilityHint="Enter the name of your plant"
                  className="rounded-2xl border border-borderLight bg-white px-[18px] py-4 text-base text-text dark:border-dark-border dark:bg-dark-bg-card dark:text-text-primary-dark"
                  placeholder="e.g., Northern Lights"
                  placeholderTextColor={Colors.textMuted}
                  value={plantName}
                  onChangeText={setPlantName}
                  testID="plant-name-input"
                />

                <Text className="mb-2.5 mt-7 text-[15px] font-bold text-text dark:text-text-primary-dark">
                  Strain Type
                </Text>
                {strainOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = strainType === opt.type;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={opt.type}
                      className={cn(
                        'flex-row items-center bg-white dark:bg-dark-bg-card rounded-2xl p-4 mb-2.5 gap-3.5 border-2 border-transparent',
                        selected &&
                          'border-primary dark:border-primary-bright bg-[#F1F8E9] dark:bg-dark-bg-elevated'
                      )}
                      onPress={() => {
                        if (process.env.EXPO_OS !== 'web')
                          Haptics.selectionAsync();
                        setStrainType(opt.type);
                      }}
                      testID={`strain-type-${opt.type}`}
                    >
                      <View
                        className="size-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: opt.bg }}
                      >
                        <Icon size={22} color={opt.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[17px] font-bold text-text dark:text-text-primary-dark">
                          {opt.label}
                        </Text>
                        <Text className="mt-0.5 text-[11px] font-semibold tracking-wide text-textMuted dark:text-text-muted-dark">
                          {opt.subtitle}
                        </Text>
                      </View>
                      {selected && (
                        <View className="size-[26px] items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
                          <Check size={14} color={Colors.white} />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {step === 2 && (
              <View>
                <Text className="mb-2 text-[32px] font-black leading-[38px] text-text dark:text-text-primary-dark">
                  Growing{'\n'}Environment
                </Text>
                <Text className="mb-8 text-base text-textSecondary dark:text-text-secondary-dark">
                  Where will this plant live?
                </Text>

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'bg-white dark:bg-dark-bg-card rounded-[20px] p-6 mb-3.5 border-2 border-transparent',
                    environment === 'Indoor' &&
                      'border-primary dark:border-primary-bright bg-[#F1F8E9] dark:bg-dark-bg-elevated'
                  )}
                  onPress={() => {
                    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
                    setEnvironment('Indoor');
                  }}
                  testID="env-indoor"
                >
                  <View className="mb-3.5 size-14 items-center justify-center rounded-full bg-[#E3F2FD]">
                    <Warehouse size={28} color="#1565C0" />
                  </View>
                  <Text className="mb-1.5 text-xl font-extrabold text-text dark:text-text-primary-dark">
                    Indoor
                  </Text>
                  <Text className="text-sm leading-5 text-textSecondary dark:text-text-secondary-dark">
                    Grow tent, closet, or room with controlled lighting and
                    climate.
                  </Text>
                  {environment === 'Indoor' && (
                    <View className="absolute right-4 top-4 size-[26px] items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
                      <Check size={14} color={Colors.white} />
                    </View>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'bg-white dark:bg-dark-bg-card rounded-[20px] p-6 mb-3.5 border-2 border-transparent',
                    environment === 'Outdoor' &&
                      'border-primary dark:border-primary-bright bg-[#F1F8E9] dark:bg-dark-bg-elevated'
                  )}
                  onPress={() => {
                    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
                    setEnvironment('Outdoor');
                  }}
                  testID="env-outdoor"
                >
                  <View className="mb-3.5 size-14 items-center justify-center rounded-full bg-indicaBadge">
                    <TreePine size={28} color={Colors.primary} />
                  </View>
                  <Text className="mb-1.5 text-xl font-extrabold text-text dark:text-text-primary-dark">
                    Outdoor
                  </Text>
                  <Text className="text-sm leading-5 text-textSecondary dark:text-text-secondary-dark">
                    Garden, balcony, or greenhouse using natural sunlight.
                  </Text>
                  {environment === 'Outdoor' && (
                    <View className="absolute right-4 top-4 size-[26px] items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
                      <Check size={14} color={Colors.white} />
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            {step === 3 && (
              <View className="flex-1">
                <Text className="mb-2 text-[32px] font-black leading-[38px] text-text dark:text-text-primary-dark">
                  Ready to{'\n'}grow!
                </Text>
                <Text className="mb-8 text-base text-textSecondary dark:text-text-secondary-dark">
                  {"Here's a summary of your new plant."}
                </Text>

                <View className="rounded-[20px] bg-white p-5 dark:bg-dark-bg-elevated">
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-[15px] text-textSecondary dark:text-text-secondary-dark">
                      Name
                    </Text>
                    <Text
                      className="text-base font-bold text-text dark:text-text-primary-dark"
                      selectable
                    >
                      {plantName}
                    </Text>
                  </View>
                  <View className="h-px bg-borderLight dark:bg-dark-border" />
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-[15px] text-textSecondary dark:text-text-secondary-dark">
                      Strain
                    </Text>
                    <Text
                      className="text-base font-bold text-text dark:text-text-primary-dark"
                      selectable
                    >
                      {strainType}
                    </Text>
                  </View>
                  <View className="h-px bg-borderLight dark:bg-dark-border" />
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-[15px] text-textSecondary dark:text-text-secondary-dark">
                      Environment
                    </Text>
                    <Text
                      className="text-base font-bold text-text dark:text-text-primary-dark"
                      selectable
                    >
                      {environment}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        <View
          className="px-6 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            accessibilityRole="button"
            className={cn(
              'bg-primaryDark dark:bg-primary-bright rounded-[20px] py-[18px] flex-row items-center justify-center gap-2 active:opacity-80',
              !canProceed && 'opacity-40'
            )}
            onPress={handleNext}
            disabled={!canProceed}
            testID="next-step-btn"
          >
            <Text className="text-[17px] font-bold text-white">
              {step === totalSteps ? 'Start Growing' : 'Next Step'}
            </Text>
            {step < totalSteps && <ArrowRight size={20} color={Colors.white} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={showSuccess}
        transparent
        animationType="none"
        testID="success-modal"
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <Animated.View
            style={modalStyle}
            className="w-full max-w-[340px] items-center rounded-[28px] bg-white p-9 shadow-2xl dark:bg-dark-bg-elevated"
          >
            <View className="mb-5 size-20 items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
              <CheckCircle size={48} color={Colors.white} />
            </View>
            <Text className="mb-2.5 text-[26px] font-black text-text dark:text-text-primary-dark">
              {"It's a Grow!"}
            </Text>
            <Text className="mb-7 text-center text-[15px] leading-[22px] text-textSecondary dark:text-text-secondary-dark">
              Your tasks for the next week have been generated.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="w-full items-center rounded-[18px] bg-primaryDark px-10 py-4 active:opacity-80 dark:bg-primary-bright"
              onPress={() => {
                setShowSuccess(false);
                router.replace('/(tabs)/(garden)' as never);
              }}
              testID="go-to-garden-btn"
            >
              <Text className="text-[17px] font-bold text-white">
                Go to Garden
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
