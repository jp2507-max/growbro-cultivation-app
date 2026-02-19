import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Heart, type LucideIcon } from 'lucide-react-native';
import React from 'react';

import Colors from '@/constants/colors';
import { AdaptiveGlassSurface } from '@/src/components/ui/adaptive-glass-surface';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { Pressable, Text, View } from '@/src/tw';
import { Image } from '@/src/tw/image';

type TypeColors = {
  darkBg: string;
  darkBorder: string;
  darkText: string;
};

type StrainDetailHeroProps = {
  title: string;
  typeLabel: string;
  typeColors: TypeColors;
  potency: number | null;
  potencyLabel: string;
  thcLabel: string;
  highThcLabel: string;
  imageSource: { uri: string } | number;
  heroHeight: number;
  insetsTop: number;
  isDark: boolean;
  liked: boolean;
  toggling: boolean;
  onBackPress: () => void;
  onFavoritePress: () => void;
  onImageError: () => void;
  backLabel: string;
  backHint: string;
  favoriteLabel: string;
  favoriteHint: string;
};

type HeroActionButtonProps = {
  sfName: React.ComponentProps<typeof PlatformIcon>['sfName'];
  fallbackIcon: LucideIcon;
  onPress: () => void;
  label: string;
  hint: string;
  isDark: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  testID?: string;
};

function HeroActionButton({
  sfName,
  fallbackIcon,
  onPress,
  label,
  hint,
  isDark,
  disabled,
  children,
  testID,
}: HeroActionButtonProps): React.ReactElement {
  return (
    <AdaptiveGlassSurface
      isInteractive
      blurIntensity={96}
      style={{ borderRadius: 999, overflow: 'hidden' }}
    >
      <Pressable
        accessibilityHint={hint}
        accessibilityLabel={label}
        accessibilityRole="button"
        className="size-12 items-center justify-center rounded-full border border-white/30 bg-white/22 dark:border-dark-border-bright dark:bg-dark-bg-card/38"
        disabled={disabled}
        onPress={onPress}
        testID={testID}
      >
        {children ?? (
          <PlatformIcon
            sfName={sfName}
            fallbackIcon={fallbackIcon}
            size={22}
            color={isDark ? Colors.textPrimaryDark : Colors.white}
          />
        )}
      </Pressable>
    </AdaptiveGlassSurface>
  );
}

export function StrainDetailHero({
  title,
  typeLabel,
  typeColors,
  potency,
  potencyLabel,
  thcLabel,
  highThcLabel,
  imageSource,
  heroHeight,
  insetsTop,
  isDark,
  liked,
  toggling,
  onBackPress,
  onFavoritePress,
  onImageError,
  backLabel,
  backHint,
  favoriteLabel,
  favoriteHint,
}: StrainDetailHeroProps): React.ReactElement {
  return (
    <View
      className="relative w-full overflow-hidden rounded-b-[30px]"
      style={{ height: heroHeight }}
    >
      <Image
        source={imageSource}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        transition={200}
        priority="high"
        onError={onImageError}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.78)', 'transparent']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 112 }}
      />
      <LinearGradient
        colors={
          isDark
            ? ['transparent', 'rgba(10,20,16,0.95)']
            : ['transparent', 'rgba(0,0,0,0.84)']
        }
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: Math.round(heroHeight * 0.58),
        }}
      />

      <View
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-4"
        style={{ paddingTop: insetsTop + 10 }}
      >
        <HeroActionButton
          sfName="chevron.left"
          fallbackIcon={ChevronLeft}
          onPress={onBackPress}
          label={backLabel}
          hint={backHint}
          isDark={isDark}
          testID="back-strain"
        />

        <HeroActionButton
          sfName="heart"
          fallbackIcon={Heart}
          onPress={onFavoritePress}
          label={favoriteLabel}
          hint={favoriteHint}
          isDark={isDark}
          disabled={toggling}
          testID="favorite-button"
        >
          <Heart
            size={20}
            color={isDark ? Colors.textPrimaryDark : Colors.white}
            fill={liked ? Colors.liked : 'transparent'}
          />
        </HeroActionButton>
      </View>

      <View className="absolute inset-x-0 bottom-7 flex-row items-end justify-between px-5">
        <View className="max-w-[72%]">
          <Text className="text-[40px] font-bold leading-10.5 tracking-tight text-white dark:text-text-primary-dark">
            {title}
          </Text>

          <View className="mt-3 flex-row items-center gap-2.5">
            <View
              className="rounded-full px-3.5 py-1.5"
              style={{
                backgroundColor: typeColors.darkBg,
                borderWidth: 1,
                borderColor: typeColors.darkBorder,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: typeColors.darkText }}
              >
                {typeLabel}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <View className="size-1.5 rounded-full bg-white/45 dark:bg-text-muted-dark" />
              <Text className="text-lg font-semibold text-white/90 dark:text-text-secondary-dark">
                {highThcLabel}
              </Text>
            </View>
          </View>
        </View>

        {potency != null && potency > 0 ? (
          <View
            className="rounded-[20px] px-3.5 py-3"
            style={{
              minWidth: 98,
              backgroundColor: '#4ade80',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.22)',
            }}
          >
            <Text className="text-[10px] font-extrabold uppercase tracking-[0.8px] text-dark-bg">
              {potencyLabel}
            </Text>
            <Text
              className="mt-0.5 text-[32px] font-black leading-8 text-dark-bg"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {potency}%
            </Text>
            <Text className="mt-0.5 text-[10px] font-bold uppercase text-dark-bg/80">
              {thcLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
