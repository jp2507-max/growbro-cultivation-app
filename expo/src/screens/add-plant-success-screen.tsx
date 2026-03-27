import { router, useLocalSearchParams } from 'expo-router';
import { Check, CirclePlus, Leaf, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { Button, ScreenContainer } from '@/src/components/ui';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { motion, rmTiming } from '@/src/lib/animations/motion';
import { ROUTES } from '@/src/lib/routes';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

function getRouteParamValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

export default function AddPlantSuccessScreen(): React.ReactElement {
  const { t } = useTranslation(['add-plant', 'common']);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    plantName: plantNameParam,
    strainType: strainTypeParam,
    environment,
  } = useLocalSearchParams<{
    plantName?: string | string[];
    strainType?: string | string[];
    environment?: string | string[];
  }>();

  const heroOpacity = useSharedValue(0);
  const heroScale = useSharedValue(0.92);
  const copyOpacity = useSharedValue(0);
  const copyTranslateY = useSharedValue(18);
  const footerOpacity = useSharedValue(0);
  const footerTranslateY = useSharedValue(20);

  const plantName = useMemo(
    () => getRouteParamValue(plantNameParam) ?? t('success.defaultPlantName'),
    [plantNameParam, t]
  );
  const strainType = useMemo(
    () =>
      getRouteParamValue(strainTypeParam) ??
      t('step1.strainTypeOptions.unknown'),
    [strainTypeParam, t]
  );
  const growEnvironment = useMemo(
    () => getRouteParamValue(environment) ?? t('step2.indoor'),
    [environment, t]
  );

  const heroShadowStyle = useMemo(
    () => ({
      shadowColor: Colors.shadow,
      shadowOpacity: isDark ? 0.35 : 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    }),
    [isDark]
  );

  const seedBadgeShadowStyle = useMemo(
    () => ({
      shadowColor: Colors.shadow,
      shadowOpacity: isDark ? 0.32 : 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    }),
    [isDark]
  );

  useEffect(() => {
    heroOpacity.value = withTiming(1, rmTiming(motion.dur.lg));
    heroScale.value = withTiming(1, rmTiming(motion.dur.lg));

    copyOpacity.value = withDelay(
      motion.dur.sm,
      withTiming(1, rmTiming(motion.dur.lg))
    );
    copyTranslateY.value = withDelay(
      motion.dur.sm,
      withTiming(0, rmTiming(motion.dur.lg))
    );

    footerOpacity.value = withDelay(
      motion.dur.md,
      withTiming(1, rmTiming(motion.dur.lg))
    );
    footerTranslateY.value = withDelay(
      motion.dur.md,
      withTiming(0, rmTiming(motion.dur.lg))
    );
  }, [
    copyOpacity,
    copyTranslateY,
    footerOpacity,
    footerTranslateY,
    heroOpacity,
    heroScale,
  ]);

  const handleClose = useCallback(() => {
    router.replace(ROUTES.GARDEN);
  }, []);

  const handleAddAnotherPlant = useCallback(() => {
    router.replace(ROUTES.ADD_PLANT);
  }, []);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ scale: heroScale.value }],
  }));

  const copyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
    transform: [{ translateY: copyTranslateY.value }],
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
    transform: [{ translateY: footerTranslateY.value }],
  }));

  return (
    <ScreenContainer withTopInset>
      <View className="relative flex-1 overflow-hidden bg-background px-6 dark:bg-dark-bg">
        <View
          className="absolute top-29 size-84 self-center rounded-full bg-primary/18 dark:bg-primary-bright/8"
          pointerEvents="none"
        />
        <View className="flex-row items-center justify-between pb-4 pt-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeSuccessLabel')}
            accessibilityHint={t('a11y.closeSuccessHint')}
            className="size-11 items-center justify-center rounded-full"
            onPress={handleClose}
            testID="close-add-plant-success"
          >
            <PlatformIcon
              sfName="xmark"
              fallbackIcon={X}
              size={28}
              color={isDark ? Colors.textPrimaryDark : Colors.text}
            />
          </Pressable>
          <Text className="text-[13px] font-bold tracking-[1.6px] text-primary-dark dark:text-text-secondary-dark">
            GROWBRO
          </Text>
          <View className="size-11" />
        </View>

        <View className="flex-1 justify-center pb-3">
          <Animated.View
            style={heroAnimatedStyle}
            className="mb-9 items-center"
          >
            <View className="relative items-center justify-center">
              <View className="absolute size-66 rounded-full bg-primary/14 dark:bg-primary-bright/8" />
              <View
                className="size-52 items-center justify-center rounded-full border-[6px] border-border bg-card dark:border-dark-border-bright dark:bg-dark-bg-card"
                style={heroShadowStyle}
              >
                <View className="size-24 items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
                  <PlatformIcon
                    sfName="checkmark"
                    fallbackIcon={Check}
                    size={44}
                    color={isDark ? Colors.darkBg : Colors.white}
                  />
                </View>
              </View>
              <View
                className="absolute -bottom-1.5 right-1.5 size-19 items-center justify-center rounded-full border-[4px] border-background bg-primary dark:border-dark-bg dark:bg-primary-bright"
                style={seedBadgeShadowStyle}
              >
                <PlatformIcon
                  sfName="leaf.fill"
                  fallbackIcon={Leaf}
                  size={24}
                  color={isDark ? Colors.darkBg : Colors.white}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={copyAnimatedStyle}
            className="items-center px-1.5"
          >
            <Text className="mb-2.5 text-center text-[22px] font-black leading-7 text-text dark:text-text-primary-dark">
              {t('success.title')}
            </Text>
            <Text className="text-center text-[14px] leading-5.5 text-text-secondary dark:text-text-secondary-dark">
              {t('success.message', { plantName })}
            </Text>

            <View className="mt-8 w-full max-w-[350px] rounded-full border border-primary/22 bg-primary/10 px-4.5 py-3 dark:border-primary-bright/25 dark:bg-primary-bright/10">
              <View className="flex-row items-center justify-center">
                <Text
                  numberOfLines={1}
                  className="max-w-[40%] text-[15px] font-bold text-text dark:text-text-primary-dark"
                >
                  {plantName}
                </Text>
                <Text className="mx-2 text-sm font-semibold text-text-muted dark:text-text-muted-dark">
                  •
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-[15px] font-medium text-text-secondary dark:text-text-secondary-dark"
                >
                  {strainType}
                </Text>
                <Text className="mx-2 text-sm font-semibold text-text-muted dark:text-text-muted-dark">
                  •
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-[15px] font-medium text-text-secondary dark:text-text-secondary-dark"
                >
                  {growEnvironment}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            footerAnimatedStyle,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          className="pt-2"
        >
          <Button
            accessibilityLabel={t('common:goToGarden')}
            accessibilityHint={t('a11y.goToGardenSuccessHint')}
            className="h-16 w-full rounded-full py-0 shadow-lg"
            onPress={handleClose}
            testID="go-to-garden-btn"
          >
            {t('success.goToGarden')}
          </Button>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('a11y.addAnotherPlantSuccessLabel')}
            accessibilityHint={t('a11y.addAnotherPlantSuccessHint')}
            className="mt-5 min-h-12 flex-row items-center justify-center gap-2.5 px-3 py-2.5"
            onPress={handleAddAnotherPlant}
            testID="add-another-plant-btn"
          >
            <PlatformIcon
              sfName="plus.circle.fill"
              fallbackIcon={CirclePlus}
              size={22}
              color={isDark ? Colors.textPrimaryDark : Colors.primaryDark}
            />
            <Text className="text-[15px] font-bold text-primary-dark dark:text-text-primary-dark">
              {t('success.addAnotherPlant')}
            </Text>
          </Pressable>
          <View className="mt-6 h-1.5 w-27 self-center rounded-full bg-border dark:bg-dark-border" />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
