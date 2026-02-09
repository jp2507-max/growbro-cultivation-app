import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Stack from 'expo-router/stack';
import { Heart, MessageCircle, Send } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { feedFilters, type Post, posts } from '@/mocks/community';
import { motion, withRM } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';

function FeedPost({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <Animated.View
      className="mb-3.5 rounded-[20px] bg-white p-[18px] shadow-sm dark:bg-dark-bg-elevated"
      entering={withRM(FadeInUp.delay(index * 80).duration(motion.dur.lg))}
      layout={withRM(LinearTransition.duration(motion.dur.lg))}
    >
      <View className="mb-3 flex-row items-center gap-2.5">
        <Image
          source={{ uri: post.avatarUrl }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
          transition={200}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-text dark:text-text-primary-dark">
            {post.username}
          </Text>
          <Text className="mt-px text-xs text-textMuted dark:text-text-muted-dark">
            {post.timeAgo}
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: post.imageUrl }}
        style={{ width: '100%', height: 280 }}
        contentFit="cover"
        transition={200}
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      <View className="absolute bottom-14 left-5">
        <Text className="rounded-[8px] bg-black/50 px-2 py-1 text-[12px] font-bold text-white dark:text-dark-bg">
          {post.label}
        </Text>
      </View>

      <View className="flex-row gap-5 pt-1">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5"
          onPress={() => {
            if (process.env.EXPO_OS !== 'web')
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setLiked((prev) => !prev);
          }}
          testID={`like-${post.id}`}
        >
          <Heart
            size={20}
            color={liked ? Colors.red : Colors.textMuted}
            fill={liked ? Colors.red : 'transparent'}
          />
          <Text
            className={cn(
              'text-sm font-semibold text-textMuted dark:text-text-muted-dark',
              liked && 'text-red dark:text-error-dark'
            )}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {liked ? post.likes + 1 : post.likes}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-1.5">
          <MessageCircle size={20} color={Colors.textMuted} />
          <Text
            className="text-sm font-semibold text-textMuted dark:text-text-muted-dark"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {post.comments}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5"
        >
          <Send size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View className="px-5 pb-5">
        <Text
          className="mb-3 text-[15px] leading-[22px] text-text dark:text-text-primary-dark"
          selectable
        >
          <Text className="font-bold text-text dark:text-text-primary-dark">
            {post.username}
          </Text>{' '}
          <Text className="text-text dark:text-text-primary-dark">
            {post.caption}
          </Text>
        </Text>
        <Text className="mt-4 text-[13px] font-medium text-primary dark:text-primary-bright">
          {post.hashtags}
        </Text>
      </View>
    </Animated.View>
  );
}

function HeaderRight() {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-[20px] bg-primary px-4 py-2 active:opacity-80 dark:bg-primary-bright"
      onPress={() => router.push('/community/create-post' as never)}
      testID="new-post-btn"
    >
      <Text className="text-sm font-bold text-white dark:text-dark-bg">
        + Post
      </Text>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const [activeFilter, setActiveFilter] = useState<string>('Trending');
  const feedPosts = posts;

  const filtered = useMemo(() => {
    if (activeFilter === 'Trending')
      return [...feedPosts].sort((a, b) => b.likes - a.likes);
    if (activeFilter === 'Newest') return [...feedPosts].reverse();
    return feedPosts;
  }, [activeFilter, feedPosts]);

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen
        options={{
          headerRight: () => <HeaderRight />,
        }}
      />

      <View className="mb-4 mt-3.5 flex-row gap-2 px-5">
        {feedFilters.map((f) => (
          <Pressable
            accessibilityRole="button"
            key={f}
            className={cn(
              'px-4 py-2 rounded-[20px] bg-white dark:bg-dark-bg-card border border-borderLight dark:border-dark-border',
              activeFilter === f &&
                'bg-primary dark:bg-primary-bright border-primary dark:border-primary-bright'
            )}
            onPress={() => setActiveFilter(f)}
            testID={`community-filter-${f}`}
          >
            <Text
              className={cn(
                'text-[13px] font-semibold text-textSecondary dark:text-text-secondary-dark',
                activeFilter === f && 'text-white dark:text-dark-bg'
              )}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <FeedPost post={item} index={index} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
