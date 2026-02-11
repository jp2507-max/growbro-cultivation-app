import * as Haptics from 'expo-haptics';
import {
  ArrowRight,
  ChevronLeft,
  Hash,
  Mail,
  Sprout,
  User,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { FormField } from '@/src/components/ui/form-field';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type AuthMode = 'welcome' | 'email' | 'code' | 'name';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    sendMagicCode,
    verifyMagicCode,
    createProfile,
    user,
    profile,
    isProfileLoading,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>(
    user && !profile ? 'name' : 'welcome'
  );
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const fadeAnim = useSharedValue(1);

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const applyModeSwitch = useCallback(
    (nextMode: AuthMode) => {
      setMode(nextMode);
      setError('');
      // Defer fade-in until after React commit
      requestAnimationFrame(() => {
        fadeAnim.set(withTiming(1, rmTiming(motion.dur.sm)));
      });
    },
    [fadeAnim]
  );

  const animateTo = useCallback(
    (nextMode: AuthMode) => {
      fadeAnim.set(
        withTiming(0, rmTiming(motion.dur.xs), (finished) => {
          if (finished) {
            scheduleOnRN(applyModeSwitch, nextMode);
          }
        })
      );
    },
    [fadeAnim, applyModeSwitch]
  );

  const handleSendCode = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await sendMagicCode(email.trim());
      if (process.env.EXPO_OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      animateTo('code');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send code.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, sendMagicCode, animateTo]);

  const handleVerifyCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter the code.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await verifyMagicCode(email.trim(), code.trim());
      if (process.env.EXPO_OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Wait for profile check before transitioning
      setPendingVerification(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid code.');
      setIsSubmitting(false);
    }
  }, [code, email, verifyMagicCode]);

  // Handle post-verification routing
  React.useEffect(() => {
    if (pendingVerification && user) {
      if (isProfileLoading) return;

      if (!profile) {
        // No profile exists, proceed to name step
        animateTo('name');
        setPendingVerification(false);
        setIsSubmitting(false);
      } else {
        // Profile exists, let _layout handle the redirect
        // We keep isSubmitting=true implies loading state persists
      }
    }
  }, [pendingVerification, user, isProfileLoading, profile, animateTo]);

  const handleCreateProfile = useCallback(async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await createProfile(name.trim());
      if (process.env.EXPO_OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // _layout.tsx will reactively redirect to /onboarding once profile exists
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create profile.');
      setIsSubmitting(false);
    }
  }, [name, createProfile]);

  return (
    <View
      className="bg-background dark:bg-dark-bg flex-1"
      style={{ paddingTop: insets.top }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Animated.View style={animatedFadeStyle} className="flex-1">
            {mode === 'welcome' && (
              <View className="min-h-[500px] flex-1 justify-center">
                <View className="mb-10 items-center">
                  <View className="bg-primary dark:bg-primary-bright mb-5 size-24 items-center justify-center rounded-full shadow-lg">
                    <Sprout size={48} color={Colors.white} />
                  </View>
                  <Text className="text-primaryDark dark:text-primary-bright text-4xl font-black tracking-tight">
                    GrowBro
                  </Text>
                  <Text className="text-textSecondary dark:text-text-secondary-dark mt-1.5 text-base">
                    Your cannabis cultivation companion
                  </Text>
                </View>

                <View className="dark:bg-dark-bg-elevated mb-10 rounded-3xl bg-white p-7 shadow-md">
                  <View className="mb-4 flex-row gap-2">
                    <View className="bg-primary size-2.5 rounded-full" />
                    <View className="bg-warning size-2.5 rounded-full" />
                    <View className="bg-primaryLight size-2.5 rounded-full" />
                  </View>
                  <Text className="text-text dark:text-text-primary-dark text-[17px] font-medium leading-[26px]">
                    Track your grows, manage schedules, and harvest like a pro.
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  className="bg-primaryDark dark:bg-primary-bright flex-row items-center justify-center gap-2 rounded-[20px] py-[18px] shadow-md active:opacity-80"
                  onPress={() => animateTo('email')}
                  testID="get-started-btn"
                >
                  <Text className="text-[17px] font-bold text-white">
                    Get Started
                  </Text>
                  <ArrowRight size={20} color={Colors.white} />
                </Pressable>
              </View>
            )}

            {mode === 'email' && (
              <View className="pt-4">
                <Pressable
                  accessibilityRole="button"
                  className="dark:bg-dark-bg-card mb-6 size-10 items-center justify-center rounded-full bg-white"
                  onPress={() => animateTo('welcome')}
                  testID="back-welcome"
                >
                  <ChevronLeft size={22} color={Colors.text} />
                </Pressable>

                <Text className="text-text dark:text-text-primary-dark mb-2 text-[32px] font-black leading-[38px]">
                  {"What's your\nemail?"}
                </Text>
                <Text className="text-textSecondary dark:text-text-secondary-dark mb-8 text-base">
                  {"We'll send you a magic code to sign in."}
                </Text>

                {error ? (
                  <Text
                    className="text-danger dark:text-error-dark mb-4 text-sm font-semibold"
                    selectable
                  >
                    {error}
                  </Text>
                ) : null}

                <FormField
                  icon={<Mail size={18} color={Colors.textMuted} />}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                  testID="email-input"
                />

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center justify-center gap-2 rounded-[20px] bg-primaryDark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright',
                    isSubmitting && 'opacity-60'
                  )}
                  onPress={handleSendCode}
                  disabled={isSubmitting}
                  testID="send-code-btn"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text className="text-[17px] font-bold text-white">
                        Send Code
                      </Text>
                      <ArrowRight size={20} color={Colors.white} />
                    </>
                  )}
                </Pressable>
              </View>
            )}

            {mode === 'code' && (
              <View className="pt-4">
                <Pressable
                  accessibilityRole="button"
                  className="dark:bg-dark-bg-card mb-6 size-10 items-center justify-center rounded-full bg-white"
                  onPress={() => animateTo('email')}
                  testID="back-email"
                >
                  <ChevronLeft size={22} color={Colors.text} />
                </Pressable>

                <Text className="text-text dark:text-text-primary-dark mb-2 text-[32px] font-black leading-[38px]">
                  Check your{'\n'}inbox
                </Text>
                <Text className="text-textSecondary dark:text-text-secondary-dark mb-8 text-base">
                  Enter the 6-digit code sent to{' '}
                  <Text className="text-text dark:text-text-primary-dark font-bold">
                    {email}
                  </Text>
                </Text>

                {error ? (
                  <Text
                    className="text-danger dark:text-error-dark mb-4 text-sm font-semibold"
                    selectable
                  >
                    {error}
                  </Text>
                ) : null}

                <FormField
                  icon={<Hash size={18} color={Colors.textMuted} />}
                  accessibilityLabel="Verification code input"
                  accessibilityHint="Enter the 6-digit code from your email"
                  className="text-text dark:text-text-primary-dark flex-1 px-3 py-4 text-center text-xl font-bold tracking-[8px]"
                  placeholder="000000"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  testID="code-input"
                />

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center justify-center gap-2 rounded-[20px] bg-primaryDark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright',
                    isSubmitting && 'opacity-60'
                  )}
                  onPress={handleVerifyCode}
                  disabled={isSubmitting}
                  testID="verify-code-btn"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text className="text-[17px] font-bold text-white">
                        Verify
                      </Text>
                      <ArrowRight size={20} color={Colors.white} />
                    </>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleSendCode}
                  className="mt-5 items-center"
                  disabled={isSubmitting}
                >
                  <Text className="text-textSecondary dark:text-text-secondary-dark text-[15px]">
                    {"Didn't get the code?"}{' '}
                    <Text className="text-primary dark:text-primary-bright font-bold">
                      Resend
                    </Text>
                  </Text>
                </Pressable>
              </View>
            )}

            {mode === 'name' && (
              <View className="pt-4">
                <Pressable
                  accessibilityRole="button"
                  className="dark:bg-dark-bg-card mb-6 size-10 items-center justify-center rounded-full bg-white"
                  onPress={() => animateTo('code')}
                  testID="back-code"
                >
                  <ChevronLeft size={22} color={Colors.text} />
                </Pressable>

                <Text className="text-text dark:text-text-primary-dark mb-2 text-[32px] font-black leading-[38px]">
                  {"What's your\nname?"}
                </Text>
                <Text className="text-textSecondary dark:text-text-secondary-dark mb-8 text-base">
                  This is how other growers will see you.
                </Text>

                {error ? (
                  <Text
                    className="text-danger dark:text-error-dark mb-4 text-sm font-semibold"
                    selectable
                  >
                    {error}
                  </Text>
                ) : null}

                <FormField
                  icon={<User size={18} color={Colors.textMuted} />}
                  accessibilityLabel="Display name input"
                  accessibilityHint="Enter your display name"
                  placeholder="Display Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoFocus
                  testID="name-input"
                />

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center justify-center gap-2 rounded-[20px] bg-primaryDark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright',
                    (!name.trim() || isSubmitting) && 'opacity-60'
                  )}
                  onPress={handleCreateProfile}
                  disabled={!name.trim() || isSubmitting}
                  testID="submit-name"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text className="text-[17px] font-bold text-white">
                        Continue
                      </Text>
                      <ArrowRight size={20} color={Colors.white} />
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
