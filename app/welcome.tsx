import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Hash, Mail, Sprout, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { BackButton } from '@/src/components/ui/back-button';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Body, Subtitle, Title } from '@/src/components/ui/typography';
import { useThemeColor } from '@/src/components/ui/use-theme-color';
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
  const nameValue = nameForm.watch('name');
  const isNameEmpty = !nameValue.trim();
  const fadeAnim = useSharedValue(1);
  const onPrimaryColor = useThemeColor('onPrimary');
  const mutedIconColor = useThemeColor('textMuted');
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
    <ScreenContainer withTopInset>
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
                  <Subtitle className="mt-1.5">{t('welcome.tagline')}</Subtitle>
                </View>

                <Card className="mb-10 p-7 dark:bg-dark-bg-elevated">
                  <View className="mb-4 flex-row gap-2">
                    <View className="bg-primary size-2.5 rounded-full dark:bg-primary-bright" />
                    <View className="bg-warning size-2.5 rounded-full dark:bg-warning-dark" />
                    <View className="bg-primary-light size-2.5 rounded-full dark:bg-primary" />
                  </View>
                  <Body className="text-[17px] font-medium leading-[26px]">
                    {t('welcome.pitch')}
                  </Body>
                </Card>

                <Button
                  onPress={() => animateTo('email')}
                  rightIcon={<ArrowRight size={20} color={onPrimaryColor} />}
                  testID="get-started-btn"
                >
                  {t('welcome.getStarted')}
                </Button>
              </View>
            )}

            {mode === 'email' && (
              <View className="pt-4">
                <BackButton
                  onPress={() => animateTo('welcome')}
                  testID="back-welcome"
                />

                <Title className="mb-2">{t('welcome.emailTitle')}</Title>
                <Subtitle className="mb-8">
                  {t('welcome.emailSubtitle')}
                </Subtitle>

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
                  icon={<Mail size={18} color={mutedIconColor} />}
                  accessibilityLabel={t('welcome.a11y.emailInputLabel')}
                  accessibilityHint={t('welcome.a11y.emailInputHint')}
                  placeholder={t('welcome.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                  testID="email-input"
                />

                <Button
                  onPress={emailForm.handleSubmit(handleSendCode)}
                  loading={isSubmitting}
                  rightIcon={<ArrowRight size={20} color={onPrimaryColor} />}
                  testID="send-code-btn"
                >
                  {t('welcome.sendCode')}
                </Button>
              </View>
            )}

            {mode === 'code' && (
              <View className="pt-4">
                <BackButton
                  onPress={() => animateTo('email')}
                  testID="back-email"
                />

                <Title className="mb-2">{t('welcome.codeTitle')}</Title>
                <Subtitle className="mb-8">
                  {t('welcome.codeSentTo')}
                  <Text className="text-text dark:text-text-primary-dark font-bold">
                    {emailForm.getValues('email')}
                  </Text>
                </Subtitle>

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
                  icon={<Hash size={18} color={mutedIconColor} />}
                  accessibilityLabel={t('welcome.a11y.codeInputLabel')}
                  accessibilityHint={t('welcome.a11y.codeInputHint')}
                  className="text-center text-xl font-bold tracking-[8px]"
                  placeholder={t('welcome.codePlaceholder')}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  testID="code-input"
                />

                <Button
                  onPress={codeForm.handleSubmit(handleVerifyCode)}
                  loading={isSubmitting}
                  rightIcon={<ArrowRight size={20} color={onPrimaryColor} />}
                  testID="verify-code-btn"
                >
                  {t('welcome.verify')}
                </Button>

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
                <BackButton
                  onPress={() =>
                    animateTo(initialModeIsName.current ? 'welcome' : 'code')
                  }
                  testID="back-code"
                />

                <Title className="mb-2">{t('welcome.nameTitle')}</Title>
                <Subtitle className="mb-8">
                  {t('welcome.nameSubtitle')}
                </Subtitle>

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
                  icon={<User size={18} color={mutedIconColor} />}
                  accessibilityLabel={t('welcome.a11y.nameInputLabel')}
                  accessibilityHint={t('welcome.a11y.nameInputHint')}
                  placeholder={t('welcome.namePlaceholder')}
                  autoCapitalize="words"
                  autoFocus
                  testID="name-input"
                />

                <Button
                  onPress={nameForm.handleSubmit(handleCreateProfile)}
                  disabled={isNameEmpty}
                  loading={isSubmitting}
                  rightIcon={<ArrowRight size={20} color={onPrimaryColor} />}
                  testID="submit-name"
                >
                  {t('onboarding.continue')}
                </Button>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
