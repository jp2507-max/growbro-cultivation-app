import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, XCircle, Sprout } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function AgeGateScreen() {
  const insets = useSafeAreaInsets();
  const { confirmAge } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const [denied, setDenied] = React.useState<boolean>(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleConfirm = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    confirmAge();
    router.replace('/welcome');
  };

  const handleDeny = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setDenied(true);
  };

  const handleExit = () => {
    if (Platform.OS !== 'web') {
      BackHandler.exitApp();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {!denied ? (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.iconOuter}>
                <View style={styles.iconInner}>
                  <Sprout size={44} color={Colors.white} />
                </View>
              </View>
            </View>

            <Text style={styles.title}>Welcome to GrowBro</Text>
            <Text style={styles.subtitle}>
              This app contains content related to cannabis cultivation and is intended for adults only.
            </Text>

            <View style={styles.ageCard}>
              <ShieldCheck size={28} color={Colors.primary} />
              <Text style={styles.ageQuestion}>Are you 18 years or older?</Text>
              <Text style={styles.ageNote}>
                You must be of legal age in your jurisdiction to use this application.
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.85}
                testID="age-confirm-btn"
              >
                <ShieldCheck size={20} color={Colors.white} />
                <Text style={styles.confirmBtnText}>I am 18+</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.denyBtn}
                onPress={handleDeny}
                activeOpacity={0.85}
                testID="age-deny-btn"
              >
                <XCircle size={20} color={Colors.red} />
                <Text style={styles.denyBtnText}>I am under 18</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.deniedContent}>
            <View style={styles.deniedIcon}>
              <XCircle size={56} color={Colors.red} />
            </View>
            <Text style={styles.deniedTitle}>Access Denied</Text>
            <Text style={styles.deniedSubtitle}>
              You must be 18 years or older to use GrowBro. Please come back when you meet the age requirement.
            </Text>
            <TouchableOpacity
              style={styles.exitBtn}
              onPress={handleExit}
              activeOpacity={0.85}
              testID="exit-btn"
            >
              <Text style={styles.exitBtnText}>Exit App</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  ageCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  ageQuestion: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 14,
    textAlign: 'center',
  },
  ageNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  denyBtn: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  denyBtnText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.red,
  },
  deniedContent: {
    alignItems: 'center',
  },
  deniedIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  deniedTitle: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.white,
    marginBottom: 12,
  },
  deniedSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  exitBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  exitBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
