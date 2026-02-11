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
import { Alert, Modal } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { usePlants } from '@/src/hooks/use-plants';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from '@/src/tw';
import { Animated } from '@/src/tw/animated';

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
  const { addPlant } = usePlants();
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

  const handleNext = useCallback(async () => {
    if (!canProceed) return;
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < totalSteps) {
      animateTransition(step + 1);
    } else {
      try {
        await addPlant({
          name: plantName.trim(),
          strainType: strainType ?? 'Hybrid',
          environment: environment ?? 'Indoor',
        });
        setShowSuccess(true);
        modalScale.set(withSpring(1, motion.spring.gentle));
        modalOpacity.set(withTiming(1, rmTiming(motion.dur.md)));
      } catch {
        Alert.alert('Error', 'Failed to add plant. Please try again.');
      }
    }
  }, [
    canProceed,
    step,
    animateTransition,
    modalScale,
    modalOpacity,
    addPlant,
    plantName,
    strainType,
    environment,
  ]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      animateTransition(step - 1);
    } else {
      router.back();
    }
  }, [step, animateTransition]);

  const closeModal = useCallback(() => {
    setShowSuccess(false);
    modalScale.set(0.8);
    modalOpacity.set(0);
    router.replace(ROUTES.GARDEN);
  }, [modalScale, modalOpacity]);

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <View className="flex-row items-center justify-between px-4 py-2.5">
        {step > 1 ? (
          <Pressable
            accessibilityRole="button"
            className="dark:bg-dark-bg-card size-10 items-center justify-center rounded-full bg-white"
            onPress={handleBack}
            testID="back-add-plant"
          >
            <ChevronLeft size={22} color={Colors.text} />
          </Pressable>
        ) : (
          <View className="size-10" />
        )}
        <Text
          className="text-textMuted dark:text-text-muted-dark text-[15px] font-semibold"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          <Text className="text-primary dark:text-primary-bright font-extrabold">
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
                <Text className="text-text dark:text-text-primary-dark mb-2 text-[32px] font-black leading-[38px]">
                  What are you{'\n'}growing?
                </Text>
                <Text className="text-textSecondary dark:text-text-secondary-dark mb-8 text-base">
                  {"Let's start with the basics."}
                </Text>

                <Text className="text-text dark:text-text-primary-dark mb-2.5 text-[15px] font-bold">
                  Plant Name
                </Text>
                <TextInput
                  accessibilityLabel="Plant name input"
                  accessibilityHint="Enter the name of your plant"
                  className="border-borderLight text-text dark:border-dark-border dark:bg-dark-bg-card dark:text-text-primary-dark rounded-2xl border bg-white px-[18px] py-4 text-base"
                  placeholder="e.g., Northern Lights"
                  placeholderTextColor={Colors.textMuted}
                  value={plantName}
                  onChangeText={setPlantName}
                  testID="plant-name-input"
                />

                <Text className="text-text dark:text-text-primary-dark mb-2.5 mt-7 text-[15px] font-bold">
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
                          'border-primary dark:border-primary-bright bg-background dark:bg-dark-bg-elevated'
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
                        <Text className="text-text dark:text-text-primary-dark text-[17px] font-bold">
                          {opt.label}
                        </Text>
                        <Text className="text-textMuted dark:text-text-muted-dark mt-0.5 text-[11px] font-semibold tracking-wide">
                          {opt.subtitle}
                        </Text>
                      </View>
                      {selected && (
                        <View className="bg-primary dark:bg-primary-bright size-[26px] items-center justify-center rounded-full">
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
                <Text className="text-text dark:text-text-primary-dark mb-2 text-[32px] font-black leading-[38px]">
                  Growing{'\n'}Environment
                </Text>
                <Text className="text-textSecondary dark:text-text-secondary-dark mb-8 text-base">
                  Where will this plant live?
                </Text>

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'bg-white dark:bg-dark-bg-card rounded-[20px] p-6 mb-3.5 border-2 border-transparent',
                    environment === 'Indoor' &&
                      'border-primary dark:border-primary-bright bg-background dark:bg-dark-bg-elevated'
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
                  <Text className="text-text dark:text-text-primary-dark mb-1.5 text-xl font-extrabold">
                    Indoor
                  </Text>
                  <Text className="text-textSecondary dark:text-text-secondary-dark text-sm leading-5">
                    Grow tent, closet, or room with controlled lighting and
                    climate.
                  </Text>
                  {environment === 'Indoor' && (
                    <View className="bg-primary dark:bg-primary-bright absolute right-4 top-4 size-[26px] items-center justify-center rounded-full">
                      <Check size={14} color={Colors.white} />
                    </View>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'bg-white dark:bg-dark-bg-card rounded-[20px] p-6 mb-3.5 border-2 border-transparent',
                    environment === 'Outdoor' &&
                      'border-primary dark:border-primary-bright bg-background dark:bg-dark-bg-elevated'
                  )}
                  onPress={() => {
                    if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
                    setEnvironment('Outdoor');
                  }}
                  testID="env-outdoor"
                >
                  <View className="bg-border mb-3.5 size-14 items-center justify-center rounded-full">
                    <TreePine size={28} color={Colors.primary} />
                  </View>
                  <Text className="text-text dark:text-text-primary-dark mb-1.5 text-xl font-extrabold">
                    Outdoor
                  </Text>
                  <Text className="text-textSecondary dark:text-text-secondary-dark text-sm leading-5">
                    Garden, balcony, or greenhouse using natural sunlight.
                  </Text>
                  {environment === 'Outdoor' && (
                    <View className="bg-primary dark:bg-primary-bright absolute right-4 top-4 size-[26px] items-center justify-center rounded-full">
                      <Check size={14} color={Colors.white} />
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            {step === 3 && (
              <View className="flex-1">
                <Text className="text-text dark:text-text-primary-dark mb-2 text-[32px] font-black leading-[38px]">
                  Ready to{'\n'}grow!
                </Text>
                <Text className="text-textSecondary dark:text-text-secondary-dark mb-8 text-base">
                  {"Here's a summary of your new plant."}
                </Text>

                <View className="dark:bg-dark-bg-elevated rounded-[20px] bg-white p-5">
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-textSecondary dark:text-text-secondary-dark text-[15px]">
                      Name
                    </Text>
                    <Text
                      className="text-text dark:text-text-primary-dark text-base font-bold"
                      selectable
                    >
                      {plantName}
                    </Text>
                  </View>
                  <View className="bg-borderLight dark:bg-dark-border h-px" />
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-textSecondary dark:text-text-secondary-dark text-[15px]">
                      Strain
                    </Text>
                    <Text
                      className="text-text dark:text-text-primary-dark text-base font-bold"
                      selectable
                    >
                      {strainType}
                    </Text>
                  </View>
                  <View className="bg-borderLight dark:bg-dark-border h-px" />
                  <View className="flex-row items-center justify-between py-3.5">
                    <Text className="text-textSecondary dark:text-text-secondary-dark text-[15px]">
                      Environment
                    </Text>
                    <Text
                      className="text-text dark:text-text-primary-dark text-base font-bold"
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
        onRequestClose={closeModal}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <Animated.View
            style={modalStyle}
            className="dark:bg-dark-bg-elevated w-full max-w-[340px] items-center rounded-[28px] bg-white p-9 shadow-2xl"
          >
            <View className="bg-primary dark:bg-primary-bright mb-5 size-20 items-center justify-center rounded-full">
              <CheckCircle size={48} color={Colors.white} />
            </View>
            <Text className="text-text dark:text-text-primary-dark mb-2.5 text-[26px] font-black">
              {"It's a Grow!"}
            </Text>
            <Text className="text-textSecondary dark:text-text-secondary-dark mb-7 text-center text-[15px] leading-[22px]">
              Your tasks for the next week have been generated.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="bg-primaryDark dark:bg-primary-bright w-full items-center rounded-[18px] px-10 py-4 active:opacity-80"
              onPress={closeModal}
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
