import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as Sentry from '@sentry/react-native';
import { FlashList } from '@shopify/flash-list';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import Stack from 'expo-router/stack';
import {
  Bell,
  ChevronRight,
  LogOut,
  MoreHorizontal,
  Pencil,
  Scale,
  Shield,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Switch } from 'react-native';
import { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { ListImage } from '@/src/components/ui/list-image';
import { useThemeColor } from '@/src/components/ui/use-theme-color';
import { motion, withRM } from '@/src/lib/animations/motion';
import { db } from '@/src/lib/instant';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

interface HarvestItem {
  id: string;
  name: string;
  weight: string;
  date: string;
  imageUrl: string;
}

const harvests: HarvestItem[] = [
  {
    id: '1',
    name: 'Blue Dream',
    weight: '56g',
    date: 'Oct 12',
    imageUrl:
      'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c4?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'OG Kush',
    weight: '42g',
    date: 'Aug 05',
    imageUrl:
      'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'Northern Lights',
    weight: '38g',
    date: 'Jun 18',
    imageUrl:
      'https://images.unsplash.com/photo-1604591098897-1baa0e506b1f?w=200&h=200&fit=crop',
  },
  {
    id: '4',
    name: 'Sour Diesel',
    weight: '51g',
    date: 'Apr 22',
    imageUrl:
      'https://images.unsplash.com/photo-1601055903647-ddf1ee9701b7?w=200&h=200&fit=crop',
  },
];

export default function ProfileScreen() {
  const { t } = useTranslation(['profile', 'common']);
  const { signOut, userName, experienceLevel, profile } = useAuth();
  const textColor = useThemeColor('text');
  const textMutedColor = useThemeColor('textMuted');
  const onPrimaryColor = useThemeColor('onPrimary');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [unitMetric, setUnitMetric] = useState<boolean>(true);

  // Fetch user's plants for stats
  const { data: plantsData } = db.useQuery(
    profile ? { plants: { $: { where: { 'owner.id': profile.id } } } } : null
  );

  const plantCount = plantsData?.plants?.length ?? 0;

  // Calculate active time
  const activeTime = React.useMemo(() => {
    if (!profile?.createdAt) return t('common:timeUnits.days', { count: 0 });
    const diff = Date.now() - profile.createdAt;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days >= 365)
      return t('common:timeUnits.years', { count: +(days / 365).toFixed(1) });
    if (days >= 30)
      return t('common:timeUnits.months', { count: Math.floor(days / 30) });
    return t('common:timeUnits.days', { count: days });
  }, [profile?.createdAt, t]);

  const toggleNotifications = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((p) => !p);
  }, []);

  const handleSignOut = useCallback(async () => {
    if (process.env.EXPO_OS === 'web') {
      if (confirm(t('signOutConfirm'))) {
        try {
          await signOut();
        } catch {
          alert(t('failedSignOut'));
        }
      }
    } else {
      Alert.alert(t('signOut'), t('signOutConfirm'), [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert(t('common:error'), t('failedSignOut'));
            }
          },
        },
      ]);
    }
  }, [signOut, t]);

  const handleOpenProfileOptions = useCallback(() => {
    Alert.alert(t('profileOptions'), undefined, [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('editProfile'), onPress: () => console.log('Edit profile') },
      { text: t('shareProfile'), onPress: () => console.log('Share profile') },
    ]);
  }, [t]);

  const keyExtractor = useCallback((item: HarvestItem) => item.id, []);

  const renderHarvestItem = useCallback(
    ({ item, index }: { item: HarvestItem; index: number }) => (
      <Animated.View
        className="mr-3 w-[150px] overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-dark-bg-elevated"
        entering={withRM(FadeInUp.delay(index * 50).duration(motion.dur.md))}
        exiting={withRM(FadeOutUp.duration(motion.dur.sm))}
        layout={withRM(LinearTransition.duration(motion.dur.md))}
      >
        <ListImage
          source={{ uri: item.imageUrl }}
          style={{ width: '100%', height: 100 }}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          recyclingKey={item.id}
        />
        <Text
          className="text-text dark:text-text-primary-dark px-2.5 pt-2 text-sm font-bold"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-text-muted dark:text-text-muted-dark mt-0.5 px-2.5 pb-2.5 text-xs">
          {item.weight} • {item.date}
        </Text>
      </Animated.View>
    ),
    []
  );

  const harvestListContentContainerStyle = React.useMemo(
    () => ({
      paddingHorizontal: 20,
      marginBottom: 28,
    }),
    []
  );

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <Stack.Screen
        options={{
          title: t('title'),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              className="bg-card dark:bg-dark-bg-card size-10 items-center justify-center rounded-full transition-opacity active:opacity-70"
              testID="more-btn"
              onPress={handleOpenProfileOptions}
            >
              <MoreHorizontal size={22} color={textColor} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="items-center pb-5 pt-2.5">
          <View className="border-primary dark:border-primary-bright mb-3.5 size-[110px] rounded-full border-[3px] p-1">
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
              }}
              style={{ width: '100%', height: '100%', borderRadius: 52 }}
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              priority="high"
            />
            <View className="border-background bg-primary dark:border-dark-bg dark:bg-primary-bright absolute bottom-1 right-1 size-7 items-center justify-center rounded-full border-2">
              <Pencil size={12} color={onPrimaryColor} />
            </View>
          </View>
          <Text
            className="text-text dark:text-text-primary-dark text-2xl font-extrabold"
            selectable
          >
            {userName || t('unknownGrower')}
          </Text>
          <View className="bg-primary dark:bg-primary-bright mt-2 rounded-full px-4 py-1.5">
            <Text className="text-xs font-extrabold tracking-wide text-white dark:text-on-primary-dark">
              {experienceLevel
                ? t('levelGrower', { level: experienceLevel.toUpperCase() })
                : t('newGrower')}
            </Text>
          </View>
        </View>

        <View className="mx-5 mb-6 flex-row rounded-[20px] bg-white py-5 shadow-sm dark:bg-dark-bg-elevated">
          <View className="flex-1 items-center">
            <Text
              className="text-text dark:text-text-primary-dark text-[22px] font-black"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              {plantCount}
            </Text>
            <Text className="text-text-muted dark:text-text-muted-dark mt-0.5 text-xs font-medium">
              {t('stats.plants')}
            </Text>
          </View>
          <View className="bg-border-light dark:bg-dark-border h-[30px] w-px self-center" />
          <View className="flex-1 items-center">
            <Text
              className="text-text dark:text-text-primary-dark text-[22px] font-black"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              {/* TODO: Implement community rating logic */}
              4.8
            </Text>
            <Text className="text-text-muted dark:text-text-muted-dark mt-0.5 text-xs font-medium">
              {t('stats.rating')}
            </Text>
          </View>
          <View className="bg-border-light dark:bg-dark-border h-[30px] w-px self-center" />
          <View className="flex-1 items-center">
            <Text
              className="text-text dark:text-text-primary-dark text-[22px] font-black"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              {activeTime}
            </Text>
            <Text className="text-text-muted dark:text-text-muted-dark mt-0.5 text-xs font-medium">
              {t('stats.active')}
            </Text>
          </View>
        </View>

        <View className="mb-3.5 flex-row items-center justify-between px-5">
          <Text className="text-text dark:text-text-primary-dark text-xl font-extrabold">
            {t('pastHarvests')}
          </Text>
          <Pressable accessibilityRole="button">
            <Text className="text-primary dark:text-primary-bright text-sm font-semibold">
              {t('seeAll')}
            </Text>
          </Pressable>
        </View>

        <FlashList
          data={harvests}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderHarvestItem}
          contentContainerStyle={harvestListContentContainerStyle}
        />

        <Text className="text-text dark:text-text-primary-dark mb-3.5 px-5 text-xl font-extrabold">
          {t('settings')}
        </Text>

        <View className="mx-5 mb-5 rounded-[20px] bg-white shadow-sm dark:bg-dark-bg-elevated">
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="bg-border dark:bg-dark-bg-card size-[38px] items-center justify-center rounded-xl">
              <Bell size={18} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark flex-1 text-[15px] font-semibold">
              {t('pushNotifications')}
            </Text>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{
                false: Colors.borderLight,
                true: Colors.primaryLight,
              }}
              thumbColor={Colors.white}
              testID="notifications-switch"
            />
          </View>

          <View className="bg-border-light dark:bg-dark-border mx-4 h-px" />

          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="bg-border dark:bg-dark-bg-card size-[38px] items-center justify-center rounded-xl">
              <Scale size={18} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark flex-1 text-[15px] font-semibold">
              {t('units')}
            </Text>
            <SegmentedControl
              values={[t('common:units.metric'), t('common:units.imperial')]}
              selectedIndex={unitMetric ? 0 : 1}
              onChange={({ nativeEvent }) =>
                setUnitMetric(nativeEvent.selectedSegmentIndex === 0)
              }
            />
          </View>

          <View className="bg-border-light dark:bg-dark-border mx-4 h-px" />

          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 px-4 py-3.5"
          >
            <View className="bg-border dark:bg-dark-bg-card size-[38px] items-center justify-center rounded-xl">
              <Shield size={18} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark flex-1 text-[15px] font-semibold">
              {t('accountPrivacy')}
            </Text>
            <ChevronRight size={18} color={textMutedColor} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          className="border-danger-light dark:border-error-dark/30 mx-5 flex-row items-center justify-center gap-2 rounded-2xl border bg-white py-3.5 dark:bg-dark-bg-elevated"
          onPress={handleSignOut}
          testID="sign-out-btn"
        >
          <LogOut size={18} color={Colors.danger} />
          <Text className="text-danger dark:text-error-dark text-[15px] font-semibold">
            {t('signOut')}
          </Text>
        </Pressable>

        {__DEV__ && (
          <Pressable
            accessibilityRole="button"
            className="border-warning/30 bg-warning/5 dark:border-warning-dark/30 dark:bg-warning-dark/10 mx-5 mt-4 flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-70"
            onPress={() => {
              Sentry.captureException(
                new Error('Sentry Test Error from Profile')
              );
              Alert.alert(t('common:success'), t('sentrySuccess'));
            }}
            testID="sentry-test-btn"
          >
            <Text className="text-warning dark:text-warning-dark text-[15px] font-semibold">
              {t('testSentryError')}
            </Text>
          </Pressable>
        )}

        <Text className="text-text-muted dark:text-text-muted-dark mt-4 text-center text-xs">
          {t('versionInfo', {
            version: Constants.expoConfig?.version ?? '1.0.0',
            build:
              Constants.expoConfig?.ios?.buildNumber ??
              Constants.expoConfig?.android?.versionCode ??
              '1',
          })}
        </Text>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
