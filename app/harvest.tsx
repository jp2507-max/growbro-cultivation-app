import * as Haptics from 'expo-haptics';
import { type Href, router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  CheckCircle2,
  PartyPopper,
  Scale,
  Scissors,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
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

const qualityOptions = [
  { id: 'poor', label: 'Poor', emoji: '😐' },
  { id: 'good', label: 'Good', emoji: '😊' },
  { id: 'great', label: 'Great', emoji: '🤩' },
  { id: 'premium', label: 'Premium', emoji: '🏆' },
];

export default function HarvestScreen() {
  const { plantName } = useLocalSearchParams<{ plantName?: string }>();
  const displayPlantName = plantName || 'this plant';
  const [wetWeight, setWetWeight] = useState<string>('');
  const [dryWeight, setDryWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [quality, setQuality] = useState<string>('good');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scaleAnim = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  const isWeightValid =
    wetWeight.trim().length > 0 &&
    !isNaN(Number(wetWeight)) &&
    Number(wetWeight) > 0;

  const modalAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.get() }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.get(),
  }));

  const showOverlay = useCallback(() => {
    overlayOpacity.set(withTiming(1, rmTiming(motion.dur.md)));
    scaleAnim.set(withSpring(1, motion.spring.bouncy));
  }, [overlayOpacity, scaleAnim]);

  const handleDismissOverlay = useCallback(() => {
    scaleAnim.set(withTiming(0, rmTiming(motion.dur.sm)));
    overlayOpacity.set(
      withTiming(0, rmTiming(motion.dur.sm), (finished) => {
        if (finished) {
          scheduleOnRN(() => {
            setShowSuccess(false);
          });
        }
      })
    );
  }, [overlayOpacity, scaleAnim]);

  const handleSave = useCallback(() => {
    const trimmedWeight = wetWeight.trim();
    const weightNum = Number(trimmedWeight);

    if (
      !trimmedWeight ||
      isNaN(weightNum) ||
      !Number.isFinite(weightNum) ||
      weightNum <= 0
    ) {
      setError('Please enter a valid positive weight');
      if (process.env.EXPO_OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    setError(null);
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    showOverlay();
  }, [wetWeight, showOverlay]);

  const dismissAndNavigate = useCallback(
    (route: Href) => {
      overlayOpacity.set(
        withTiming(0, rmTiming(motion.dur.sm), (finished) => {
          if (finished) {
            scheduleOnRN(() => {
              setShowSuccess(false);
              router.replace(route);
            });
          }
        })
      );
      scaleAnim.set(withTiming(0, rmTiming(motion.dur.sm)));
    },
    [overlayOpacity, scaleAnim]
  );

  const handleGoToGarden = useCallback(
    () => dismissAndNavigate(ROUTES.GARDEN),
    [dismissAndNavigate]
  );

  const handleGoToProfile = useCallback(
    () => dismissAndNavigate(ROUTES.PROFILE),
    [dismissAndNavigate]
  );

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-10"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View className="items-center py-6">
            <View className="bg-border dark:bg-dark-bg-card mb-4 size-[72px] items-center justify-center rounded-full">
              <Scissors size={32} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark text-[26px] font-black">
              Harvest Time!
            </Text>
            <Text className="text-text-secondary dark:text-text-secondary-dark mt-1 text-[15px]">
              Record your yield details for {displayPlantName}
            </Text>
          </View>

          <View className="dark:bg-dark-bg-elevated mb-4 rounded-[20px] bg-white p-5 shadow-sm">
            <Text className="text-text dark:text-text-primary-dark mb-3.5 text-base font-bold">
              Yield Weight
            </Text>
            <View className="gap-3">
              <View className="border-border-light bg-background dark:border-dark-border dark:bg-dark-bg flex-row items-center overflow-hidden rounded-[14px] border">
                <View className="pl-4 pr-1.5">
                  <Scale size={18} color={Colors.primary} />
                </View>
                <TextInput
                  accessibilityLabel="Wet weight input"
                  accessibilityHint="Enter the wet weight of your harvest in grams"
                  className="text-text dark:text-text-primary-dark flex-1 px-2.5 py-3.5 text-[15px]"
                  placeholder="Wet weight (g)"
                  placeholderTextColor={Colors.textMuted}
                  value={wetWeight}
                  onChangeText={(text) => {
                    setWetWeight(text);
                    if (error) setError(null);
                  }}
                  keyboardType="numeric"
                  testID="wet-weight-input"
                />
              </View>
              {error && (
                <Text className="text-danger dark:text-error-dark px-1 text-sm font-medium">
                  {error}
                </Text>
              )}
              <View className="border-border-light bg-background dark:border-dark-border dark:bg-dark-bg flex-row items-center overflow-hidden rounded-[14px] border">
                <View className="pl-4 pr-1.5">
                  <Scale size={18} color={Colors.warning} />
                </View>
                <TextInput
                  accessibilityLabel="Dry weight input"
                  accessibilityHint="Optionally enter the dry weight of your harvest in grams"
                  className="text-text dark:text-text-primary-dark flex-1 px-2.5 py-3.5 text-[15px]"
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

          <View className="dark:bg-dark-bg-elevated mb-4 rounded-[20px] bg-white p-5 shadow-sm">
            <Text className="text-text dark:text-text-primary-dark mb-3.5 text-base font-bold">
              Quality Rating
            </Text>
            <View className="flex-row gap-2.5">
              {qualityOptions.map((opt) => (
                <Pressable
                  accessibilityRole="button"
                  key={opt.id}
                  className={cn(
                    'flex-1 items-center py-3.5 rounded-[14px] bg-background dark:bg-dark-bg border-2 border-transparent',
                    quality === opt.id &&
                      'border-primary dark:border-primary-bright bg-border dark:bg-dark-bg-card'
                  )}
                  onPress={() => setQuality(opt.id)}
                  testID={`quality-${opt.id}`}
                >
                  <Text className="mb-1 text-2xl">{opt.emoji}</Text>
                  <Text
                    className={cn(
                      'text-xs font-semibold text-text-secondary dark:text-text-secondary-dark',
                      quality === opt.id &&
                        'text-primary dark:text-primary-bright font-bold'
                    )}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="dark:bg-dark-bg-elevated mb-4 rounded-[20px] bg-white p-5 shadow-sm">
            <Text className="text-text dark:text-text-primary-dark mb-3.5 text-base font-bold">
              Harvest Notes
            </Text>
            <TextInput
              accessibilityLabel="Harvest notes input"
              accessibilityHint="Enter any observations about your harvest"
              className="border-border-light bg-background text-text dark:border-dark-border dark:bg-dark-bg dark:text-text-primary-dark min-h-[100px] rounded-[14px] border p-3.5 text-[15px]"
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

          <View className="mb-5 flex-row items-center gap-2 px-1">
            <Calendar size={16} color={Colors.textSecondary} />
            <Text className="text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
              Harvest Date: Today
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className={cn(
              'bg-primary-dark dark:bg-primary-bright rounded-[20px] py-[18px] flex-row items-center justify-center gap-2.5 shadow-md active:opacity-80',
              !isWeightValid && 'opacity-50'
            )}
            onPress={handleSave}
            disabled={!isWeightValid}
            testID="save-harvest-btn"
          >
            <Scissors size={20} color={Colors.white} />
            <Text className="text-[17px] font-bold text-white">
              Save Harvest
            </Text>
          </Pressable>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      {showSuccess && (
        <Animated.Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss overlay"
          accessibilityHint="Tap to dismiss the success overlay and return to the harvest form"
          style={overlayStyle}
          className="absolute inset-0 z-10 items-center justify-center bg-black/50 px-8"
          onPress={handleDismissOverlay}
        >
          <Animated.View
            onStartShouldSetResponder={() => true}
            style={modalAnimStyle}
            className="dark:bg-dark-bg-elevated w-full items-center rounded-[28px] bg-white p-8 shadow-2xl"
          >
            <View className="bg-border dark:bg-dark-bg-card mb-4 size-[88px] items-center justify-center rounded-full">
              <CheckCircle2 size={56} color={Colors.primary} />
            </View>
            <View className="mb-2.5 flex-row items-center gap-2">
              <PartyPopper size={24} color={Colors.warning} />
              <Text className="text-text dark:text-text-primary-dark text-2xl font-black">
                Harvest Logged!
              </Text>
              <PartyPopper size={24} color={Colors.warning} />
            </View>
            <Text className="text-text-secondary dark:text-text-secondary-dark mb-7 text-center text-[15px] leading-[22px]">
              {wetWeight}g recorded. Your plant data has been moved to your
              harvest inventory.
            </Text>

            <Pressable
              accessibilityRole="button"
              className="bg-primary-dark dark:bg-primary-bright mb-2.5 w-full items-center rounded-[18px] py-4 active:opacity-80"
              onPress={handleGoToGarden}
              testID="go-garden-btn"
            >
              <Text className="text-base font-bold text-white">
                Start New Grow
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="border-primary dark:border-primary-bright w-full items-center rounded-[18px] border-2 py-3.5 active:opacity-80"
              onPress={handleGoToProfile}
              testID="go-profile-btn"
            >
              <Text className="text-primary dark:text-primary-bright text-base font-bold">
                View Inventory
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.Pressable>
      )}
    </View>
  );
}
