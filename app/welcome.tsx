import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  ArrowRight,
  ChevronLeft,
  Lock,
  Mail,
  Sprout,
  User,
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
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { motion, rmTiming } from '@/src/lib/animations/motion';

type AuthMode = 'welcome' | 'signup' | 'signin';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fadeAnim = useSharedValue(1);

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const applyModeSwitch = useCallback((nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  }, []);

  const animateTo = useCallback(
    (nextMode: AuthMode) => {
      fadeAnim.set(
        withTiming(0, rmTiming(motion.dur.xs), (finished) => {
          if (finished) {
            scheduleOnRN(applyModeSwitch, nextMode);
            fadeAnim.set(withTiming(1, rmTiming(motion.dur.sm)));
          }
        })
      );
    },
    [fadeAnim, applyModeSwitch]
  );

  const handleSignUp = useCallback(() => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    signUp(name.trim(), email.trim());
    router.replace('/onboarding');
  }, [name, email, password, signUp]);

  const handleSignIn = useCallback(() => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (process.env.EXPO_OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    signIn(email.trim());
    router.replace('/(tabs)/(garden)' as never);
  }, [email, password, signIn]);

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-bg"
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
                  <View className="mb-5 size-24 items-center justify-center rounded-full bg-primary shadow-lg dark:bg-primary-bright">
                    <Sprout size={48} color={Colors.white} />
                  </View>
                  <Text className="text-4xl font-black tracking-tight text-primaryDark dark:text-primary-bright">
                    GrowBro
                  </Text>
                  <Text className="mt-1.5 text-base text-textSecondary dark:text-text-secondary-dark">
                    Your cannabis cultivation companion
                  </Text>
                </View>

                <View className="mb-10 rounded-3xl bg-white p-7 shadow-md dark:bg-dark-bg-elevated">
                  <View className="mb-4 flex-row gap-2">
                    <View className="size-2.5 rounded-full bg-primary" />
                    <View className="size-2.5 rounded-full bg-amber" />
                    <View className="size-2.5 rounded-full bg-primaryLight" />
                  </View>
                  <Text className="text-[17px] font-medium leading-[26px] text-text dark:text-text-primary-dark">
                    Track your grows, manage schedules, and harvest like a pro.
                  </Text>
                </View>

                <View className="gap-3">
                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center justify-center gap-2 rounded-[20px] bg-primaryDark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright"
                    onPress={() => animateTo('signup')}
                    testID="signup-btn"
                  >
                    <Text className="text-[17px] font-bold text-white">
                      Get Started
                    </Text>
                    <ArrowRight size={20} color={Colors.white} />
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    className="items-center rounded-[20px] border-2 border-primary py-[18px] active:opacity-80 dark:border-primary-bright"
                    onPress={() => animateTo('signin')}
                    testID="signin-btn"
                  >
                    <Text className="text-base font-bold text-primary dark:text-primary-bright">
                      I already have an account
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {mode === 'signup' && (
              <View className="pt-4">
                <Pressable
                  accessibilityRole="button"
                  className="mb-6 size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
                  onPress={() => animateTo('welcome')}
                  testID="back-welcome"
                >
                  <ChevronLeft size={22} color={Colors.text} />
                </Pressable>

                <Text className="mb-2 text-[32px] font-black leading-[38px] text-text dark:text-text-primary-dark">
                  Create your{'\n'}account
                </Text>
                <Text className="mb-8 text-base text-textSecondary dark:text-text-secondary-dark">
                  Join thousands of growers worldwide.
                </Text>

                {error ? (
                  <Text
                    className="mb-4 text-sm font-semibold text-red dark:text-error-dark"
                    selectable
                  >
                    {error}
                  </Text>
                ) : null}

                <View className="mb-3.5 flex-row items-center overflow-hidden rounded-2xl border border-borderLight bg-white dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="pl-[18px] pr-1">
                    <User size={18} color={Colors.textMuted} />
                  </View>
                  <TextInput
                    accessibilityLabel="Full name input"
                    accessibilityHint="Enter your full name"
                    className="flex-1 px-3 py-4 text-base text-text dark:text-text-primary-dark"
                    placeholder="Full Name"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    testID="name-input"
                  />
                </View>

                <View className="mb-3.5 flex-row items-center overflow-hidden rounded-2xl border border-borderLight bg-white dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="pl-[18px] pr-1">
                    <Mail size={18} color={Colors.textMuted} />
                  </View>
                  <TextInput
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address"
                    className="flex-1 px-3 py-4 text-base text-text dark:text-text-primary-dark"
                    placeholder="Email"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="email-input"
                  />
                </View>

                <View className="mb-3.5 flex-row items-center overflow-hidden rounded-2xl border border-borderLight bg-white dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="pl-[18px] pr-1">
                    <Lock size={18} color={Colors.textMuted} />
                  </View>
                  <TextInput
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                    className="flex-1 px-3 py-4 text-base text-text dark:text-text-primary-dark"
                    placeholder="Password"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    testID="password-input"
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center justify-center gap-2 rounded-[20px] bg-primaryDark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright"
                  onPress={handleSignUp}
                  testID="submit-signup"
                >
                  <Text className="text-[17px] font-bold text-white">
                    Sign Up
                  </Text>
                  <ArrowRight size={20} color={Colors.white} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => animateTo('signin')}
                  className="mt-5 items-center"
                >
                  <Text className="text-[15px] text-textSecondary dark:text-text-secondary-dark">
                    Already have an account?{' '}
                    <Text className="font-bold text-primary dark:text-primary-bright">
                      Sign In
                    </Text>
                  </Text>
                </Pressable>
              </View>
            )}

            {mode === 'signin' && (
              <View className="pt-4">
                <Pressable
                  accessibilityRole="button"
                  className="mb-6 size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
                  onPress={() => animateTo('welcome')}
                  testID="back-welcome-signin"
                >
                  <ChevronLeft size={22} color={Colors.text} />
                </Pressable>

                <Text className="mb-2 text-[32px] font-black leading-[38px] text-text dark:text-text-primary-dark">
                  Welcome{'\n'}back!
                </Text>
                <Text className="mb-8 text-base text-textSecondary dark:text-text-secondary-dark">
                  Sign in to continue your grows.
                </Text>

                {error ? (
                  <Text
                    className="mb-4 text-sm font-semibold text-red dark:text-error-dark"
                    selectable
                  >
                    {error}
                  </Text>
                ) : null}

                <View className="mb-3.5 flex-row items-center overflow-hidden rounded-2xl border border-borderLight bg-white dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="pl-[18px] pr-1">
                    <Mail size={18} color={Colors.textMuted} />
                  </View>
                  <TextInput
                    accessibilityLabel="Email input"
                    accessibilityHint="Enter your email address"
                    className="flex-1 px-3 py-4 text-base text-text dark:text-text-primary-dark"
                    placeholder="Email"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="signin-email-input"
                  />
                </View>

                <View className="mb-3.5 flex-row items-center overflow-hidden rounded-2xl border border-borderLight bg-white dark:border-dark-border dark:bg-dark-bg-card">
                  <View className="pl-[18px] pr-1">
                    <Lock size={18} color={Colors.textMuted} />
                  </View>
                  <TextInput
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                    className="flex-1 px-3 py-4 text-base text-text dark:text-text-primary-dark"
                    placeholder="Password"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    testID="signin-password-input"
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center justify-center gap-2 rounded-[20px] bg-primaryDark py-[18px] shadow-md active:opacity-80 dark:bg-primary-bright"
                  onPress={handleSignIn}
                  testID="submit-signin"
                >
                  <Text className="text-[17px] font-bold text-white">
                    Sign In
                  </Text>
                  <ArrowRight size={20} color={Colors.white} />
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => animateTo('signup')}
                  className="mt-5 items-center"
                >
                  <Text className="text-[15px] text-textSecondary dark:text-text-secondary-dark">
                    {"Don't have an account?"}{' '}
                    <Text className="font-bold text-primary dark:text-primary-bright">
                      Sign Up
                    </Text>
                  </Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
