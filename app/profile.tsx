import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import {
  Bell,
  ChevronLeft,
  LogOut,
  MoreHorizontal,
  Pencil,
  Scale,
  Shield,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { BackButton } from '@/src/components/ui/back-button';
import { cn } from '@/src/lib/utils';

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
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [unitMetric, setUnitMetric] = useState<boolean>(true);

  const toggleNotifications = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((p) => !p);
  }, []);

  return (
    <View
      className="flex-1 bg-background dark:bg-dark-bg"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-2.5">
        <BackButton testID="back-profile" />
        <Text className="text-[17px] font-bold text-text dark:text-text-primary-dark">
          Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          className="size-10 items-center justify-center rounded-full bg-white dark:bg-dark-bg-card"
          testID="more-btn"
        >
          <MoreHorizontal size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="items-center pb-5 pt-2.5">
          <View className="mb-3.5 size-[110px] rounded-full border-[3px] border-primary p-1 dark:border-primary-bright">
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
              }}
              style={{ width: '100%', height: '100%', borderRadius: 52 }}
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              priority="high"
            />
            <View className="absolute bottom-1 right-1 size-7 items-center justify-center rounded-full border-2 border-background bg-primary dark:border-dark-bg dark:bg-primary-bright">
              <Pencil size={12} color={Colors.white} />
            </View>
          </View>
          <Text
            className="text-2xl font-extrabold text-text dark:text-text-primary-dark"
            selectable
          >
            Alex Green
          </Text>
          <View className="mt-2 rounded-full bg-primary px-4 py-1.5 dark:bg-primary-bright">
            <Text className="text-xs font-extrabold tracking-wide text-white dark:text-dark-bg">
              LEVEL 5 GROWER
            </Text>
          </View>
        </View>

        <View className="mx-5 mb-6 flex-row rounded-[20px] bg-white py-5 shadow-sm dark:bg-dark-bg-elevated">
          <View className="flex-1 items-center">
            <Text
              className="text-[22px] font-black text-text dark:text-text-primary-dark"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              12
            </Text>
            <Text className="mt-0.5 text-xs font-medium text-textMuted dark:text-text-muted-dark">
              Harvests
            </Text>
          </View>
          <View className="h-[30px] w-px self-center bg-borderLight dark:bg-dark-border" />
          <View className="flex-1 items-center">
            <Text
              className="text-[22px] font-black text-text dark:text-text-primary-dark"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              4.8
            </Text>
            <Text className="mt-0.5 text-xs font-medium text-textMuted dark:text-text-muted-dark">
              Rating
            </Text>
          </View>
          <View className="h-[30px] w-px self-center bg-borderLight dark:bg-dark-border" />
          <View className="flex-1 items-center">
            <Text
              className="text-[22px] font-black text-text dark:text-text-primary-dark"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              2yr
            </Text>
            <Text className="mt-0.5 text-xs font-medium text-textMuted dark:text-text-muted-dark">
              Active
            </Text>
          </View>
        </View>

        <View className="mb-3.5 flex-row items-center justify-between px-5">
          <Text className="text-xl font-extrabold text-text dark:text-text-primary-dark">
            Past Harvests
          </Text>
          <Pressable accessibilityRole="button">
            <Text className="text-sm font-semibold text-primary dark:text-primary-bright">
              See All
            </Text>
          </Pressable>
        </View>

        <FlashList
          data={harvests}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 12,
            marginBottom: 28,
          }}
          renderItem={({ item }) => (
            <View className="w-[150px] overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-dark-bg-elevated">
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: '100%', height: 100 }}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                recyclingKey={item.id}
              />
              <Text
                className="px-2.5 pt-2 text-sm font-bold text-text dark:text-text-primary-dark"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="mt-0.5 px-2.5 pb-2.5 text-xs text-textMuted dark:text-text-muted-dark">
                {item.weight} • {item.date}
              </Text>
            </View>
          )}
        />

        <Text className="mb-3.5 px-5 text-xl font-extrabold text-text dark:text-text-primary-dark">
          Settings
        </Text>

        <View className="mx-5 mb-5 rounded-[20px] bg-white shadow-sm dark:bg-dark-bg-elevated">
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="size-[38px] items-center justify-center rounded-xl bg-border dark:bg-dark-bg-card">
              <Bell size={18} color={Colors.primary} />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-text dark:text-text-primary-dark">
              Push Notifications
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

          <View className="mx-4 h-px bg-borderLight dark:bg-dark-border" />

          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="size-[38px] items-center justify-center rounded-xl bg-border dark:bg-dark-bg-card">
              <Scale size={18} color={Colors.primary} />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-text dark:text-text-primary-dark">
              Units
            </Text>
            <View className="flex-row overflow-hidden rounded-[10px] border border-borderLight dark:border-dark-border">
              <Pressable
                accessibilityRole="button"
                className={cn(
                  'px-3.5 py-1.5 bg-white dark:bg-dark-bg-card',
                  unitMetric && 'bg-primary dark:bg-primary-bright'
                )}
                onPress={() => setUnitMetric(true)}
              >
                <Text
                  className={cn(
                    'text-[13px] font-semibold text-textSecondary dark:text-text-secondary-dark',
                    unitMetric && 'text-white dark:text-dark-bg'
                  )}
                >
                  Metric
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className={cn(
                  'px-3.5 py-1.5 bg-white dark:bg-dark-bg-card',
                  !unitMetric && 'bg-primary dark:bg-primary-bright'
                )}
                onPress={() => setUnitMetric(false)}
              >
                <Text
                  className={cn(
                    'text-[13px] font-semibold text-textSecondary dark:text-text-secondary-dark',
                    !unitMetric && 'text-white dark:text-dark-bg'
                  )}
                >
                  Imperial
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mx-4 h-px bg-borderLight dark:bg-dark-border" />

          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 px-4 py-3.5"
          >
            <View className="size-[38px] items-center justify-center rounded-xl bg-border dark:bg-dark-bg-card">
              <Shield size={18} color={Colors.primary} />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-text dark:text-text-primary-dark">
              Account Privacy
            </Text>
            <ChevronLeft
              size={18}
              color={Colors.textMuted}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          className="mx-5 flex-row items-center justify-center gap-2 rounded-2xl border border-redLight bg-white py-3.5 dark:border-error-dark/30 dark:bg-dark-bg-elevated"
          onPress={signOut}
          testID="sign-out-btn"
        >
          <LogOut size={18} color={Colors.red} />
          <Text className="text-[15px] font-semibold text-red dark:text-error-dark">
            Sign Out
          </Text>
        </Pressable>

        <Text className="mt-4 text-center text-xs text-textMuted dark:text-text-muted-dark">
          GrowBro v2.4.1 (Build 890)
        </Text>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
