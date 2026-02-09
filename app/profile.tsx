import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
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
import { Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { BackButton } from '@/src/components/ui/back-button';
import { cn } from '@/src/lib/utils';
import { Pressable, ScrollView, Text, View } from '@/src/tw';

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

  const handleSignOut = useCallback(() => {
    if (process.env.EXPO_OS === 'web') {
      if (confirm('Are you sure you want to sign out?')) {
        signOut();
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Alert } = require('react-native');
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]);
    }
  }, [signOut]);

  return (
    <View
      className="bg-background dark:bg-dark-bg flex-1"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-2.5">
        <BackButton testID="back-profile" />
        <Text className="text-text dark:text-text-primary-dark text-[17px] font-bold">
          Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          className="dark:bg-dark-bg-card size-10 items-center justify-center rounded-full bg-white"
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
              <Pencil size={12} color={Colors.white} />
            </View>
          </View>
          <Text
            className="text-text dark:text-text-primary-dark text-2xl font-extrabold"
            selectable
          >
            Alex Green
          </Text>
          <View className="bg-primary dark:bg-primary-bright mt-2 rounded-full px-4 py-1.5">
            <Text className="dark:text-dark-bg text-xs font-extrabold tracking-wide text-white">
              LEVEL 5 GROWER
            </Text>
          </View>
        </View>

        <View className="dark:bg-dark-bg-elevated mx-5 mb-6 flex-row rounded-[20px] bg-white py-5 shadow-sm">
          <View className="flex-1 items-center">
            <Text
              className="text-text dark:text-text-primary-dark text-[22px] font-black"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              12
            </Text>
            <Text className="text-textMuted dark:text-text-muted-dark mt-0.5 text-xs font-medium">
              Harvests
            </Text>
          </View>
          <View className="bg-borderLight dark:bg-dark-border h-[30px] w-px self-center" />
          <View className="flex-1 items-center">
            <Text
              className="text-text dark:text-text-primary-dark text-[22px] font-black"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              4.8
            </Text>
            <Text className="text-textMuted dark:text-text-muted-dark mt-0.5 text-xs font-medium">
              Rating
            </Text>
          </View>
          <View className="bg-borderLight dark:bg-dark-border h-[30px] w-px self-center" />
          <View className="flex-1 items-center">
            <Text
              className="text-text dark:text-text-primary-dark text-[22px] font-black"
              style={{ fontVariant: ['tabular-nums'] }}
              selectable
            >
              2yr
            </Text>
            <Text className="text-textMuted dark:text-text-muted-dark mt-0.5 text-xs font-medium">
              Active
            </Text>
          </View>
        </View>

        <View className="mb-3.5 flex-row items-center justify-between px-5">
          <Text className="text-text dark:text-text-primary-dark text-xl font-extrabold">
            Past Harvests
          </Text>
          <Pressable accessibilityRole="button">
            <Text className="text-primary dark:text-primary-bright text-sm font-semibold">
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
            marginBottom: 28,
          }}
          renderItem={({ item }) => (
            <View className="dark:bg-dark-bg-elevated mr-3 w-[150px] overflow-hidden rounded-2xl bg-white shadow-sm">
              <Image
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
              <Text className="text-textMuted dark:text-text-muted-dark mt-0.5 px-2.5 pb-2.5 text-xs">
                {item.weight} • {item.date}
              </Text>
            </View>
          )}
        />

        <Text className="text-text dark:text-text-primary-dark mb-3.5 px-5 text-xl font-extrabold">
          Settings
        </Text>

        <View className="dark:bg-dark-bg-elevated mx-5 mb-5 rounded-[20px] bg-white shadow-sm">
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="bg-border dark:bg-dark-bg-card size-[38px] items-center justify-center rounded-xl">
              <Bell size={18} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark flex-1 text-[15px] font-semibold">
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

          <View className="bg-borderLight dark:bg-dark-border mx-4 h-px" />

          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="bg-border dark:bg-dark-bg-card size-[38px] items-center justify-center rounded-xl">
              <Scale size={18} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark flex-1 text-[15px] font-semibold">
              Units
            </Text>
            <View className="border-borderLight dark:border-dark-border flex-row overflow-hidden rounded-[10px] border">
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

          <View className="bg-borderLight dark:bg-dark-border mx-4 h-px" />

          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 px-4 py-3.5"
          >
            <View className="bg-border dark:bg-dark-bg-card size-[38px] items-center justify-center rounded-xl">
              <Shield size={18} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark flex-1 text-[15px] font-semibold">
              Account Privacy
            </Text>
            <ChevronRight size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          className="border-danger-light dark:border-error-dark/30 dark:bg-dark-bg-elevated mx-5 flex-row items-center justify-center gap-2 rounded-2xl border bg-white py-3.5"
          onPress={handleSignOut}
          testID="sign-out-btn"
        >
          <LogOut size={18} color={Colors.danger} />
          <Text className="text-danger dark:text-error-dark text-[15px] font-semibold">
            Sign Out
          </Text>
        </Pressable>

        <Text className="text-textMuted dark:text-text-muted-dark mt-4 text-center text-xs">
          GrowBro v2.4.1 (Build 890)
        </Text>
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
