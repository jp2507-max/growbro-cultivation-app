import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  Calendar,
  CheckCircle2,
  PartyPopper,
  Scale,
  Scissors,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';

export default function HarvestScreen() {
  const [wetWeight, setWetWeight] = useState<string>('');
  const [dryWeight, setDryWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [quality, setQuality] = useState<string>('good');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const scaleAnim = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  const modalAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const qualityOptions = [
    { id: 'poor', label: 'Poor', emoji: '😐' },
    { id: 'good', label: 'Good', emoji: '😊' },
    { id: 'great', label: 'Great', emoji: '🤩' },
    { id: 'premium', label: 'Premium', emoji: '🏆' },
  ];

  const showOverlay = useCallback(() => {
    overlayOpacity.set(withTiming(1, rmTiming(motion.dur.md)));
    scaleAnim.set(withSpring(1, motion.spring.bouncy));
  }, [overlayOpacity, scaleAnim]);

  const handleSave = useCallback(() => {
    if (!wetWeight.trim()) return;
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    scheduleOnUI(showOverlay);
  }, [wetWeight, showOverlay]);

  const hideDone = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const hideOverlay = useCallback(() => {
    overlayOpacity.set(
      withTiming(0, rmTiming(motion.dur.sm), (finished) => {
        if (finished) scheduleOnRN(hideDone);
      })
    );
    scaleAnim.set(withTiming(0, rmTiming(motion.dur.sm)));
  }, [overlayOpacity, scaleAnim, hideDone]);

  const dismissOverlay = useCallback(() => {
    scheduleOnUI(hideOverlay);
  }, [hideOverlay]);

  const handleGoToGarden = useCallback(() => {
    dismissOverlay();
    setTimeout(
      () => router.replace('/(tabs)/(garden)' as never),
      motion.dur.sm
    );
  }, [dismissOverlay]);

  const handleGoToProfile = useCallback(() => {
    dismissOverlay();
    setTimeout(() => router.replace('/profile'), motion.dur.sm);
  }, [dismissOverlay]);

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View className="items-center py-6">
            <View className="mb-4 size-[72px] items-center justify-center rounded-full bg-border dark:bg-dark-bg-card">
              <Scissors size={32} color={Colors.primary} />
            </View>
            <Text className="text-[26px] font-black text-text dark:text-text-primary-dark">
              Harvest Time!
            </Text>
            <Text className="mt-1 text-[15px] text-textSecondary dark:text-text-secondary-dark">
              Record your yield details for Blue Dream
            </Text>
          </View>

          <View className="mb-4 rounded-[20px] bg-white p-5 shadow-sm dark:bg-dark-bg-elevated">
            <Text className="mb-3.5 text-base font-bold text-text dark:text-text-primary-dark">
              Yield Weight
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center overflow-hidden rounded-[14px] border border-borderLight bg-background dark:border-dark-border dark:bg-dark-bg">
                <View className="pl-4 pr-1.5">
                  <Scale size={18} color={Colors.primary} />
                </View>
                <TextInput
                  accessibilityLabel="Wet weight input"
                  accessibilityHint="Enter the wet weight of your harvest in grams"
                  className="flex-1 px-2.5 py-3.5 text-[15px] text-text dark:text-text-primary-dark"
                  placeholder="Wet weight (g)"
                  placeholderTextColor={Colors.textMuted}
                  value={wetWeight}
                  onChangeText={setWetWeight}
                  keyboardType="numeric"
                  testID="wet-weight-input"
                />
              </View>
              <View className="flex-row items-center overflow-hidden rounded-[14px] border border-borderLight bg-background dark:border-dark-border dark:bg-dark-bg">
                <View className="pl-4 pr-1.5">
                  <Scale size={18} color={Colors.amber} />
                </View>
                <TextInput
                  accessibilityLabel="Dry weight input"
                  accessibilityHint="Optionally enter the dry weight of your harvest in grams"
                  className="flex-1 px-2.5 py-3.5 text-[15px] text-text dark:text-text-primary-dark"
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

          <View className="mb-4 rounded-[20px] bg-white p-5 shadow-sm dark:bg-dark-bg-elevated">
            <Text className="mb-3.5 text-base font-bold text-text dark:text-text-primary-dark">
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
                      'text-xs font-semibold text-textSecondary dark:text-text-secondary-dark',
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

          <View className="mb-4 rounded-[20px] bg-white p-5 shadow-sm dark:bg-dark-bg-elevated">
            <Text className="mb-3.5 text-base font-bold text-text dark:text-text-primary-dark">
              Harvest Notes
            </Text>
            <TextInput
              accessibilityLabel="Harvest notes input"
              accessibilityHint="Enter any observations about your harvest"
              className="min-h-[100px] rounded-[14px] border border-borderLight bg-background p-3.5 text-[15px] text-text dark:border-dark-border dark:bg-dark-bg dark:text-text-primary-dark"
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
            <Text className="text-sm font-medium text-textSecondary dark:text-text-secondary-dark">
              Harvest Date: Today
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className={cn(
              'bg-primaryDark dark:bg-primary-bright rounded-[20px] py-[18px] flex-row items-center justify-center gap-2.5 shadow-md active:opacity-80',
              !wetWeight.trim() && 'opacity-50'
            )}
            onPress={handleSave}
            disabled={!wetWeight.trim()}
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
        <Animated.View
          style={overlayStyle}
          className="absolute inset-0 z-10 items-center justify-center bg-black/50 px-8"
        >
          <Animated.View
            style={modalAnimStyle}
            className="w-full items-center rounded-[28px] bg-white p-8 shadow-2xl dark:bg-dark-bg-elevated"
          >
            <View className="mb-4 size-[88px] items-center justify-center rounded-full bg-border dark:bg-dark-bg-card">
              <CheckCircle2 size={56} color={Colors.primary} />
            </View>
            <View className="mb-2.5 flex-row items-center gap-2">
              <PartyPopper size={24} color={Colors.amber} />
              <Text className="text-2xl font-black text-text dark:text-text-primary-dark">
                Harvest Logged!
              </Text>
              <PartyPopper size={24} color={Colors.amber} />
            </View>
            <Text className="mb-7 text-center text-[15px] leading-[22px] text-textSecondary dark:text-text-secondary-dark">
              {wetWeight}g recorded. Your plant data has been moved to your
              harvest inventory.
            </Text>

            <Pressable
              accessibilityRole="button"
              className="mb-2.5 w-full items-center rounded-[18px] bg-primaryDark py-4 active:opacity-80 dark:bg-primary-bright"
              onPress={handleGoToGarden}
              testID="go-garden-btn"
            >
              <Text className="text-base font-bold text-white">
                Start New Grow
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="w-full items-center rounded-[18px] border-2 border-primary py-3.5 active:opacity-80 dark:border-primary-bright"
              onPress={handleGoToProfile}
              testID="go-profile-btn"
            >
              <Text className="text-base font-bold text-primary dark:text-primary-bright">
                View Inventory
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
