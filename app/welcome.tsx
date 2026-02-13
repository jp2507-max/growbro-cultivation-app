import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import {
  ArrowRight,
  ChevronLeft,
  Hash,
  Mail,
  Sprout,
  User,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import { motion, rmTiming } from '@/src/lib/animations/motion';
import {
  type CodeFormData,
  codeSchema,
  ControlledFormField,
  type EmailFormData,
  emailSchema,
  type NameFormData,
  nameSchema,
} from '@/src/lib/forms';
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
  const { t } = useTranslation('auth');
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
  const initialModeIsName = useRef(user && !profile ? true : false);
  const [serverError, setServerError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
    mode: 'onBlur',
  });

  const nameForm = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: '' },
    mode: 'onBlur',
  });
  const fadeAnim = useSharedValue(1);
  const profileCreationTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Cleanup any pending timeouts on unmount
  useEffect(() => {
    return () => {
      const currentTimeout = profileCreationTimeoutRef.current;
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, []);

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.get(),
  }));

  const applyModeSwitch = useCallback(
    (nextMode: AuthMode) => {
      setMode(nextMode);
      setServerError('');
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

  const handleSendCode = useCallback(
    async (data: EmailFormData) => {
      setIsSubmitting(true);
      setServerError('');
      try {
        await sendMagicCode(data.email.trim());
        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (mode !== 'code') {
          animateTo('code');
        }
      } catch (e: unknown) {
        setServerError(
          e instanceof Error ? e.message : t('welcome.errors.failedSendCode')
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [sendMagicCode, animateTo, mode, t]
  );

  const handleVerifyCode = useCallback(
    async (data: CodeFormData) => {
      setIsSubmitting(true);
      setServerError('');
      try {
        const currentEmail = emailForm.getValues('email');
        await verifyMagicCode(currentEmail.trim(), data.code.trim());
        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Wait for profile check before transitioning
        setPendingVerification(true);
      } catch (e: unknown) {
        setServerError(
          e instanceof Error ? e.message : t('welcome.errors.invalidCode')
        );
        setIsSubmitting(false);
      }
    },
    [emailForm, verifyMagicCode, t]
  );

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
        // Schedule fallback to clear loading states if redirect doesn't happen
        const fallbackTimeout = setTimeout(() => {
          setPendingVerification(false);
          setIsSubmitting(false);
        }, 750);

        return () => clearTimeout(fallbackTimeout);
      }
    }
  }, [pendingVerification, user, isProfileLoading, profile, animateTo]);

  const handleCreateProfile = useCallback(
    async (data: NameFormData) => {
      setIsSubmitting(true);
      setServerError('');
      try {
        await createProfile(data.name.trim());
        if (process.env.EXPO_OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // _layout.tsx will reactively redirect to /onboarding once profile exists
        // Schedule fallback to clear isSubmitting if redirect doesn't happen
        profileCreationTimeoutRef.current = setTimeout(() => {
          setIsSubmitting(false);
          profileCreationTimeoutRef.current = null;
        }, 8000); // 8 second fallback
      } catch (e: unknown) {
        const msg =
          e instanceof Error
            ? e.message
            : t('welcome.errors.failedCreateProfile');
        setServerError(msg);
        setIsSubmitting(false);
      }
    },
    [createProfile, t]
  );

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
                  <Text className="text-primary-dark dark:text-primary-bright text-4xl font-black tracking-tight">
                    {t('welcome.appName')}
                  </Text>
                  <Text className="text-text-secondary dark:text-text-secondary-dark mt-1.5 text-base">
                    {t('welcome.tagline')}
                  </Text>
                </View>

                <View className="dark:bg-dark-bg-elevated mb-10 rounded-3xl bg-white p-7 shadow-md">
                  <View className="mb-4 flex-row gap-2">
                    <View className="bg-primary size-2.5 rounded-full" />
                    <View className="bg-warning size-2.5 rounded-full" />
                    <View className="bg-primary-light size-2.5 rounded-full" />
                  </View>
                  <Text className="text-text dark:text-text-primary-dark text-[17px] font-medium leading-[26px]">
                    {t('welcome.pitch')}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  className="bg-primary-dark dark:bg-primary-bright flex-row items-center justify-center gap-2 rounded-[20px] py-[18px] shadow-md active:opacity-80"
                  onPress={() => animateTo('email')}
                  testID="get-started-btn"
                >
                  <Text className="text-[17px] font-bold text-white">
                    {t('welcome.getStarted')}
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
                  {t('welcome.emailTitle')}
                </Text>
                <Text className="text-text-secondary dark:text-text-secondary-dark mb-8 text-base">
                  {t('welcome.emailSubtitle')}
                </Text>

                {serverError ? (
                  <Text
                    className="text-danger dark:text-error-dark mb-4 text-sm font-semibold"
                    selectable
                  >
                    {serverError}
                  </Text>
                ) : null}

                <ControlledFormField<EmailFormData>
                  name="email"
                  control={emailForm.control}
                  icon={<Mail size={18} color={Colors.textMuted} />}
                  accessibilityLabel="Email input"
                  accessibilityHint="Enter your email address"
                  placeholder={t('welcome.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                  testID="email-input"
                />

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center justify-center gap-2 rounded-[20px] bg-primary-dark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright',
                    isSubmitting && 'opacity-60'
                  )}
                  onPress={emailForm.handleSubmit(handleSendCode)}
                  disabled={isSubmitting}
                  testID="send-code-btn"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text className="text-[17px] font-bold text-white">
                        {t('welcome.sendCode')}
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
                  {t('welcome.codeTitle')}
                </Text>
                <Text className="text-text-secondary dark:text-text-secondary-dark mb-8 text-base">
                  {t('welcome.codeSentTo')}
                  <Text className="text-text dark:text-text-primary-dark font-bold">
                    {emailForm.getValues('email')}
                  </Text>
                </Text>

                {serverError ? (
                  <Text
                    className="text-danger dark:text-error-dark mb-4 text-sm font-semibold"
                    selectable
                  >
                    {serverError}
                  </Text>
                ) : null}

                <ControlledFormField<CodeFormData>
                  name="code"
                  control={codeForm.control}
                  icon={<Hash size={18} color={Colors.textMuted} />}
                  accessibilityLabel="Verification code input"
                  accessibilityHint="Enter the 6-digit code from your email"
                  inputClassName="text-center text-xl font-bold tracking-[8px]"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  testID="code-input"
                />

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center justify-center gap-2 rounded-[20px] bg-primary-dark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright',
                    isSubmitting && 'opacity-60'
                  )}
                  onPress={codeForm.handleSubmit(handleVerifyCode)}
                  disabled={isSubmitting}
                  testID="verify-code-btn"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text className="text-[17px] font-bold text-white">
                        {t('welcome.verify')}
                      </Text>
                      <ArrowRight size={20} color={Colors.white} />
                    </>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={emailForm.handleSubmit(handleSendCode)}
                  className="mt-5 items-center"
                  disabled={isSubmitting}
                >
                  <Text className="text-text-secondary dark:text-text-secondary-dark text-[15px]">
                    {t('welcome.didntGetCode')}{' '}
                    <Text className="text-primary dark:text-primary-bright font-bold">
                      {t('welcome.resend')}
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
                  onPress={() =>
                    animateTo(initialModeIsName.current ? 'welcome' : 'code')
                  }
                  testID="back-code"
                >
                  <ChevronLeft size={22} color={Colors.text} />
                </Pressable>

                <Text className="text-text dark:text-text-primary-dark mb-2 text-[32px] font-black leading-[38px]">
                  {t('welcome.nameTitle')}
                </Text>
                <Text className="text-text-secondary dark:text-text-secondary-dark mb-8 text-base">
                  {t('welcome.nameSubtitle')}
                </Text>

                {serverError ? (
                  <Text
                    className="text-danger dark:text-error-dark mb-4 text-sm font-semibold"
                    selectable
                  >
                    {serverError}
                  </Text>
                ) : null}

                <ControlledFormField<NameFormData>
                  name="name"
                  control={nameForm.control}
                  icon={<User size={18} color={Colors.textMuted} />}
                  accessibilityLabel="Display name input"
                  accessibilityHint="Enter your display name"
                  placeholder={t('welcome.namePlaceholder')}
                  autoCapitalize="words"
                  autoFocus
                  testID="name-input"
                />

                <Pressable
                  accessibilityRole="button"
                  className={cn(
                    'flex-row items-center justify-center gap-2 rounded-[20px] bg-primary-dark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright',
                    (!nameForm.watch('name').trim() || isSubmitting) &&
                      'opacity-60'
                  )}
                  onPress={nameForm.handleSubmit(handleCreateProfile)}
                  disabled={!nameForm.watch('name').trim() || isSubmitting}
                  testID="submit-name"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text className="text-[17px] font-bold text-white">
                        {t('onboarding.continue')}
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
