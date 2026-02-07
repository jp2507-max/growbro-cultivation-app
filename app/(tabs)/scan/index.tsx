import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScanLine, Camera, Zap, Leaf, AlertTriangle, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [scanning, setScanning] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const startScanLine = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [scanLineAnim]);

  const handleScan = useCallback((resultType: 'healthy' | 'issue') => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    startPulse();
    startScanLine();

    setTimeout(() => {
      setScanning(false);
      pulseAnim.stopAnimation();
      scanLineAnim.stopAnimation();
      pulseAnim.setValue(1);
      scanLineAnim.setValue(0);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: '/ai-diagnosis', params: { type: resultType } });
    }, 2500);
  }, [pulseAnim, scanLineAnim, startPulse, startScanLine]);

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Plant Scanner</Text>
        <Text style={styles.headerSubtitle}>Diagnose plant health instantly</Text>
      </View>

      <View style={styles.scanArea}>
        <Animated.View style={[styles.scanFrame, { transform: [{ scale: scanning ? pulseAnim : 1 }] }]}>
          <View style={styles.scanFrameInner}>
            <View style={[styles.cornerTL, styles.corner]} />
            <View style={[styles.cornerTR, styles.corner]} />
            <View style={[styles.cornerBL, styles.corner]} />
            <View style={[styles.cornerBR, styles.corner]} />

            <View style={styles.scanContent}>
              {scanning ? (
                <>
                  <Animated.View
                    style={[styles.scanLineBar, { transform: [{ translateY: scanLineTranslate }] }]}
                  />
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.scanningText}>Analyzing plant...</Text>
                </>
              ) : (
                <>
                  <View style={styles.cameraIconWrap}>
                    <Camera size={48} color={Colors.primary} />
                  </View>
                  <Text style={styles.scanPrompt}>Point camera at your plant</Text>
                  <Text style={styles.scanHint}>Take a clear photo of leaves for best results</Text>
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.tipsRow}>
          <View style={styles.tipCard}>
            <ScanLine size={20} color={Colors.primary} />
            <Text style={styles.tipText}>Focus on leaves</Text>
          </View>
          <View style={styles.tipCard}>
            <Zap size={20} color={Colors.amber} />
            <Text style={styles.tipText}>Good lighting</Text>
          </View>
          <View style={styles.tipCard}>
            <Leaf size={20} color={Colors.primaryLight} />
            <Text style={styles.tipText}>Close-up shot</Text>
          </View>
        </View>

        <Text style={styles.demoLabel}>Demo Scans</Text>

        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => handleScan('healthy')}
          activeOpacity={0.85}
          disabled={scanning}
          testID="scan-healthy-btn"
        >
          <Heart size={20} color={Colors.white} />
          <Text style={styles.scanBtnText}>Scan — Healthy Result</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scanBtn, styles.scanBtnIssue]}
          onPress={() => handleScan('issue')}
          activeOpacity={0.85}
          disabled={scanning}
          testID="scan-issue-btn"
        >
          <AlertTriangle size={20} color={Colors.white} />
          <Text style={styles.scanBtnText}>Scan — Issue Detected</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderRadius: 28,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  scanFrameInner: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    backgroundColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },
  scanContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanLineBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    top: 10,
    opacity: 0.7,
  },
  cameraIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  scanPrompt: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  scanHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scanningText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  tipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  tipCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  tipText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  scanBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnIssue: {
    backgroundColor: '#E65100',
    shadowColor: '#E65100',
  },
  scanBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
