import { useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { Pressable, Text, View } from '@/src/tw';

export default function PostSuccessScreen() {
  const { t } = useTranslation('community');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleViewPost = useCallback(() => {
    // Dismiss the success modal and go to the feed (or immediately open the new post if we had its ID)
    router.dismissAll();
  }, [router]);

  const handleBackToFeed = useCallback(() => {
    router.dismissAll();
  }, [router]);

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <View className="flex-1 items-center justify-center px-6">
        {/* ── Celebration Icon / Illustration ── */}
        <View className="mb-8 items-center justify-center">
          <View className="relative size-32 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/20">
            {/* Minimal botanical illustration substitute using Lucide Leaf */}
            <Leaf
              size={64}
              color={isDark ? Colors.primaryBright : Colors.primary}
              strokeWidth={1.5}
            />
            {/* Confetti dot 1 */}
            <View className="absolute -left-2 top-4 size-3 rounded-full bg-warning dark:bg-warning-dark" />
            {/* Confetti dot 2 */}
            <View className="absolute -right-4 bottom-8 size-4 rounded-full bg-primary/40 dark:bg-primary-bright/40" />
            {/* Confetti dot 3 */}
            <View className="absolute left-8 -top-3 size-2.5 rounded-full bg-primary dark:bg-primary-bright" />
          </View>
        </View>

        {/* ── Headlines ── */}
        <Text className="mb-3 text-center text-3xl font-bold tracking-tight text-text dark:text-text-primary-dark">
          {t('postSuccess.title')}
        </Text>
        <Text className="mb-10 text-center text-[15px] leading-6 text-text-secondary dark:text-text-secondary-dark">
          {t('postSuccess.subtitle')}
        </Text>

        {/* ── Actions ── */}
        <View className="w-full gap-4">
          <Pressable
            accessibilityRole="button"
            className="w-full items-center justify-center rounded-xl bg-primary py-4 active:opacity-80 dark:bg-primary-bright"
            onPress={handleViewPost}
            testID="view-my-post-btn"
          >
            <Text className="text-[17px] font-bold text-white dark:text-dark-bg">
              {t('postSuccess.viewPost')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="w-full items-center justify-center py-4 active:opacity-60"
            onPress={handleBackToFeed}
            testID="back-to-feed-btn"
          >
            <Text className="text-[15px] font-semibold text-primary dark:text-primary-bright">
              {t('postSuccess.backToFeed')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
