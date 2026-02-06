import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sprout, Mail, Lock, User, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

type AuthMode = 'welcome' | 'signup' | 'signin';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback((nextMode: AuthMode) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setMode(nextMode);
      setError('');
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const handleSignUp = useCallback(() => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    signUp(name.trim(), email.trim());
    router.replace('/onboarding');
  }, [name, email, password, signUp]);

  const handleSignIn = useCallback(() => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    signIn(email.trim());
    router.replace('/(tabs)/(garden)' as never);
  }, [email, password, signIn]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            {mode === 'welcome' && (
              <View style={styles.welcomeContent}>
                <View style={styles.logoSection}>
                  <View style={styles.logoCircle}>
                    <Sprout size={48} color={Colors.white} />
                  </View>
                  <Text style={styles.logoTitle}>GrowBro</Text>
                  <Text style={styles.logoSubtitle}>Your cannabis cultivation companion</Text>
                </View>

                <View style={styles.illustrationCard}>
                  <View style={styles.illustrationRow}>
                    <View style={[styles.illustrationDot, { backgroundColor: Colors.primary }]} />
                    <View style={[styles.illustrationDot, { backgroundColor: Colors.amber }]} />
                    <View style={[styles.illustrationDot, { backgroundColor: Colors.primaryLight }]} />
                  </View>
                  <Text style={styles.illustrationText}>Track your grows, manage schedules, and harvest like a pro.</Text>
                </View>

                <View style={styles.buttonSection}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => animateTo('signup')}
                    activeOpacity={0.85}
                    testID="signup-btn"
                  >
                    <Text style={styles.primaryBtnText}>Get Started</Text>
                    <ArrowRight size={20} color={Colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => animateTo('signin')}
                    activeOpacity={0.85}
                    testID="signin-btn"
                  >
                    <Text style={styles.secondaryBtnText}>I already have an account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {mode === 'signup' && (
              <View style={styles.formContent}>
                <TouchableOpacity style={styles.backBtn} onPress={() => animateTo('welcome')} testID="back-welcome">
                  <ChevronLeft size={22} color={Colors.text} />
                </TouchableOpacity>

                <Text style={styles.formTitle}>Create your{'\n'}account</Text>
                <Text style={styles.formSubtitle}>Join thousands of growers worldwide.</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.inputRow}>
                  <View style={styles.inputIcon}><User size={18} color={Colors.textMuted} /></View>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    testID="name-input"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputIcon}><Mail size={18} color={Colors.textMuted} /></View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="email-input"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputIcon}><Lock size={18} color={Colors.textMuted} /></View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    testID="password-input"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp} activeOpacity={0.85} testID="submit-signup">
                  <Text style={styles.primaryBtnText}>Sign Up</Text>
                  <ArrowRight size={20} color={Colors.white} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => animateTo('signin')} style={styles.switchLink}>
                  <Text style={styles.switchText}>Already have an account? <Text style={styles.switchBold}>Sign In</Text></Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'signin' && (
              <View style={styles.formContent}>
                <TouchableOpacity style={styles.backBtn} onPress={() => animateTo('welcome')} testID="back-welcome-signin">
                  <ChevronLeft size={22} color={Colors.text} />
                </TouchableOpacity>

                <Text style={styles.formTitle}>Welcome{'\n'}back!</Text>
                <Text style={styles.formSubtitle}>Sign in to continue your grows.</Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.inputRow}>
                  <View style={styles.inputIcon}><Mail size={18} color={Colors.textMuted} /></View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="signin-email-input"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputIcon}><Lock size={18} color={Colors.textMuted} /></View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    testID="signin-password-input"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn} activeOpacity={0.85} testID="submit-signin">
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                  <ArrowRight size={20} color={Colors.white} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => animateTo('signup')} style={styles.switchLink}>
                  <Text style={styles.switchText}>{"Don't have an account?"} <Text style={styles.switchBold}>Sign Up</Text></Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 500,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: Colors.primaryDark,
    letterSpacing: -1,
  },
  logoSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  illustrationCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    marginBottom: 40,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  illustrationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  illustrationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  illustrationText: {
    fontSize: 17,
    color: Colors.text,
    lineHeight: 26,
    fontWeight: '500' as const,
  },
  buttonSection: {
    gap: 12,
  },
  primaryBtn: {
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
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  secondaryBtn: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  formContent: {
    paddingTop: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.text,
    lineHeight: 38,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  errorText: {
    fontSize: 14,
    color: Colors.red,
    marginBottom: 16,
    fontWeight: '600' as const,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 18,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  switchBold: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
