import { type CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CameraOff,
  ImagePlus,
  Leaf,
  RefreshCcw,
  ScanLine,
  X,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Linking } from 'react-native';
import {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { rmTiming } from '@/src/lib/animations/motion';
import { recordAiDiagnosisStartedMetric } from '@/src/lib/observability/sentry-metrics';
import { ROUTES } from '@/src/lib/routes';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

const SCAN_TRAVEL_DISTANCE = 220;
// Animation durations for scan effect (intentionally longer than standard motion tokens)
const PULSE_DURATION = 800;
const SCAN_LINE_DURATION = 2000;

export default function ScanScreen() {
  const { t } = useTranslation('scan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView | null>(null);
  const pulseAnim = useSharedValue(1);
  const scanLineAnim = useSharedValue(0);
  const scanTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      cancelAnimation(pulseAnim);
      cancelAnimation(scanLineAnim);
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, [pulseAnim, scanLineAnim]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.get() }],
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scanLineAnim.get(),
          [0, 1],
          [0, SCAN_TRAVEL_DISTANCE]
        ),
      },
    ],
  }));

  const startScanAnimations = useCallback(() => {
    pulseAnim.set(
      withRepeat(
        withSequence(
          withTiming(1.15, rmTiming(PULSE_DURATION)),
          withTiming(1, rmTiming(PULSE_DURATION))
        ),
        -1,
        true
      )
    );
    scanLineAnim.set(
      withRepeat(
        withSequence(
          withTiming(1, rmTiming(SCAN_LINE_DURATION)),
          withTiming(0, rmTiming(SCAN_LINE_DURATION))
        ),
        -1,
        true
      )
    );
  }, [pulseAnim, scanLineAnim]);

  const stopScanAnimations = useCallback(() => {
    cancelAnimation(pulseAnim);
    cancelAnimation(scanLineAnim);
    pulseAnim.set(1);
    scanLineAnim.set(0);
  }, [pulseAnim, scanLineAnim]);

  const openSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  const openCamera = useCallback(async () => {
    if (cameraPermission?.granted) {
      setIsCameraOpen(true);
      return;
    }

    const response = await requestCameraPermission();
    if (response.granted) {
      setIsCameraOpen(true);
      return;
    }

    Alert.alert(
      t('permissions.cameraTitle'),
      t('permissions.cameraDeniedMessage'),
      [
        { text: t('permissions.cancel'), style: 'cancel' },
        { text: t('permissions.openSettings'), onPress: openSettings },
      ]
    );
  }, [cameraPermission?.granted, openSettings, requestCameraPermission, t]);

  const pickFromLibrary = useCallback(async () => {
    const mediaPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!mediaPermission.granted) {
      Alert.alert(
        t('permissions.photosTitle'),
        t('permissions.photosDeniedMessage'),
        [
          { text: t('permissions.cancel'), style: 'cancel' },
          { text: t('permissions.openSettings'), onPress: openSettings },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      if (process.env.EXPO_OS !== 'web')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setSelectedImageUri(result.assets[0].uri);
      setIsCameraOpen(false);
    }
  }, [openSettings, t]);

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) return;

      if (process.env.EXPO_OS !== 'web')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setSelectedImageUri(photo.uri);
      setIsCameraOpen(false);
    } catch {
      Alert.alert(
        t('errors.captureFailedTitle'),
        t('errors.captureFailedBody')
      );
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, t]);

  const toggleFacing = useCallback(() => {
    setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!selectedImageUri) {
      Alert.alert(t('errors.noImageTitle'), t('errors.noImageBody'));
      return;
    }

    const resultType =
      selectedImageUri.length % 2 === 0
        ? ('healthy' as const)
        : ('issue' as const);

    const startedAt = Date.now();
    recordAiDiagnosisStartedMetric({ diagnosisType: resultType });

    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);
    startScanAnimations();

    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }

    scanTimerRef.current = setTimeout(() => {
      setIsAnalyzing(false);
      stopScanAnimations();
      if (process.env.EXPO_OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: ROUTES.AI_DIAGNOSIS,
        params: {
          type: resultType,
          startedAt: String(startedAt),
          imageUri: selectedImageUri,
        },
      });
      scanTimerRef.current = null;
    }, 2500);
  }, [selectedImageUri, startScanAnimations, stopScanAnimations, t]);

  return (
    <ScrollView
      className="bg-background dark:bg-dark-bg flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text className="text-text-secondary dark:text-text-secondary-dark mt-0.5 px-5 text-sm">
        {t('subtitle')}
      </Text>

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          style={isAnalyzing ? pulseStyle : undefined}
          className="dark:bg-dark-bg-elevated size-70 rounded-[28px] bg-white shadow-lg"
        >
          <View className="bg-border dark:bg-dark-bg-card relative m-4 flex-1 overflow-hidden rounded-2xl">
            <View className="border-primary dark:border-primary-bright absolute left-0 top-0 size-7 rounded-tl-2xl border-l-[3px] border-t-[3px]" />
            <View className="border-primary dark:border-primary-bright absolute right-0 top-0 size-7 rounded-tr-2xl border-r-[3px] border-t-[3px]" />
            <View className="border-primary dark:border-primary-bright absolute bottom-0 left-0 size-7 rounded-bl-2xl border-b-[3px] border-l-[3px]" />
            <View className="border-primary dark:border-primary-bright absolute bottom-0 right-0 size-7 rounded-br-2xl border-b-[3px] border-r-[3px]" />

            {isAnalyzing ? (
              <View className="flex-1 items-center justify-center gap-3">
                <Animated.View
                  style={scanLineStyle}
                  className="bg-primary dark:bg-primary-bright absolute inset-x-2.5 top-2.5 h-0.75 rounded-sm opacity-70"
                />
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text className="text-primary dark:text-primary-bright text-[15px] font-semibold">
                  {t('analyzing')}
                </Text>
              </View>
            ) : isCameraOpen ? (
              <>
                <CameraView
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  facing={cameraFacing}
                />
                <View className="absolute inset-x-3 bottom-3 flex-row items-center justify-between">
                  <Pressable
                    accessibilityRole="button"
                    className="bg-black/45 size-11 items-center justify-center rounded-full"
                    onPress={() => setIsCameraOpen(false)}
                  >
                    <PlatformIcon
                      sfName="xmark"
                      fallbackIcon={X}
                      size={20}
                      color={Colors.white}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    className="bg-primary dark:bg-primary-bright size-14 items-center justify-center rounded-full"
                    onPress={capturePhoto}
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <PlatformIcon
                        sfName="camera"
                        fallbackIcon={Camera}
                        size={24}
                        color={Colors.white}
                      />
                    )}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    className="bg-black/45 size-11 items-center justify-center rounded-full"
                    onPress={toggleFacing}
                  >
                    <PlatformIcon
                      sfName="arrow.triangle.2.circlepath"
                      fallbackIcon={RefreshCcw}
                      size={20}
                      color={Colors.white}
                    />
                  </Pressable>
                </View>
              </>
            ) : selectedImageUri ? (
              <View className="flex-1">
                <Image
                  source={{ uri: selectedImageUri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={150}
                />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center gap-3 px-4">
                <View className="dark:bg-dark-bg-elevated size-20 items-center justify-center rounded-full bg-white shadow-sm">
                  {cameraPermission?.granted === false ? (
                    <PlatformIcon
                      sfName="camera.fill"
                      fallbackIcon={CameraOff}
                      size={44}
                      color={Colors.textMuted}
                    />
                  ) : (
                    <PlatformIcon
                      sfName="camera"
                      fallbackIcon={Camera}
                      size={48}
                      color={Colors.primary}
                    />
                  )}
                </View>
                <Text className="text-text dark:text-text-primary-dark text-base font-bold">
                  {t('pointCamera')}
                </Text>
                <Text className="text-text-muted dark:text-text-muted-dark text-center text-[13px]">
                  {t('clearPhoto')}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>

      <View className="px-5 pb-6">
        <View className="mb-5 flex-row gap-2.5">
          <View className="bg-card dark:bg-dark-bg-card flex-1 items-center gap-1.5 rounded-[14px] py-3 shadow-sm">
            <ScanLine size={20} color={Colors.primary} />
            <Text className="text-text-secondary dark:text-text-secondary-dark text-[11px] font-semibold">
              {t('tips.focusLeaves')}
            </Text>
          </View>
          <View className="bg-card dark:bg-dark-bg-card flex-1 items-center gap-1.5 rounded-[14px] py-3 shadow-sm">
            <Zap size={20} color={Colors.warning} />
            <Text className="text-text-secondary dark:text-text-secondary-dark text-[11px] font-semibold">
              {t('tips.goodLighting')}
            </Text>
          </View>
          <View className="bg-card dark:bg-dark-bg-card flex-1 items-center gap-1.5 rounded-[14px] py-3 shadow-sm">
            <Leaf size={20} color={Colors.primaryLight} />
            <Text className="text-text-secondary dark:text-text-secondary-dark text-[11px] font-semibold">
              {t('tips.closeUp')}
            </Text>
          </View>
        </View>

        <Text className="text-text-muted dark:text-text-muted-dark mb-2.5 text-xs font-bold uppercase tracking-widest">
          {t('actions')}
        </Text>

        <Pressable
          accessibilityRole="button"
          className="bg-primary-dark dark:bg-primary-bright mb-2.5 flex-row items-center justify-center gap-2.5 rounded-[18px] py-4 shadow-md active:opacity-80 disabled:opacity-50"
          onPress={openCamera}
          disabled={isAnalyzing}
          testID="open-camera-btn"
        >
          <PlatformIcon
            sfName="camera"
            fallbackIcon={Camera}
            size={20}
            color={Colors.white}
          />
          <Text className="text-base font-bold text-white">
            {t('openCamera')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="mb-2.5 flex-row items-center justify-center gap-2.5 rounded-[18px] py-4 shadow-md active:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: Colors.primaryLight }}
          onPress={pickFromLibrary}
          disabled={isAnalyzing}
          testID="pick-library-btn"
        >
          <PlatformIcon
            sfName="photo"
            fallbackIcon={ImagePlus}
            size={20}
            color={Colors.white}
          />
          <Text className="text-base font-bold text-white">
            {t('chooseFromLibrary')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="mb-2.5 flex-row items-center justify-center gap-2.5 rounded-[18px] py-4 shadow-md active:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: Colors.issue }}
          onPress={handleAnalyze}
          disabled={isAnalyzing || !selectedImageUri || isCameraOpen}
          testID="analyze-photo-btn"
        >
          <PlatformIcon
            sfName="exclamationmark.triangle"
            fallbackIcon={AlertTriangle}
            size={20}
            color={Colors.white}
          />
          <Text className="text-base font-bold text-white">
            {t('analyzePhoto')}
          </Text>
        </Pressable>

        {selectedImageUri ? (
          <View className="mt-1.5 flex-row items-center justify-center gap-1.5">
            <PlatformIcon
              sfName="leaf"
              fallbackIcon={Leaf}
              size={14}
              color={Colors.textMuted}
            />
            <Text className="text-text-muted dark:text-text-muted-dark text-xs font-medium">
              {t('photoReady')}
            </Text>
            <PlatformIcon
              sfName="arrow.right"
              fallbackIcon={ArrowRight}
              size={14}
              color={Colors.textMuted}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
