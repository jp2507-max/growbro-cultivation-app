import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Stack from 'expo-router/stack';
import type { TFunction } from 'i18next';
import { Heart, MessageCircle, Send } from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Share } from 'react-native';
import { FadeInUp, LinearTransition } from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { usePosts } from '@/src/hooks/use-posts';
import { motion, withRM } from '@/src/lib/animations/motion';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Image } from '@/src/tw/image';

const FILTER_KEYS = ['trending', 'newest', 'following'] as const;

function getTimeAgo(
  timestamp: number,
  t: TFunction<['community', 'common']>
): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return t('common:timeAgo.minutes', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('common:timeAgo.hours', { count: hrs });
  const days = Math.floor(hrs / 24);
  return t('common:timeAgo.days', { count: days });
}

type FeedPostData = ReturnType<typeof usePosts>['posts'][number];

function FeedPost({
  post,
  index,
  profileId,
  onLike,
  onUnlike,
}: {
  post: FeedPostData;
  index: number;
  profileId: string | undefined;
  onLike: (postId: string) => void;
  onUnlike: (likeId: string) => void;
}) {
  const myLike = profileId
    ? post.likes?.find((l) => l.user?.id === profileId)
    : undefined;
  const isLiked = !!myLike;
  const likeCount = post.likes?.length ?? 0;
  const commentCount = post.comments?.length ?? 0;
  const { t } = useTranslation(['community', 'common']);
  const authorName = post.author?.displayName ?? 'Unknown';
  const authorAvatar = post.author?.avatarUrl;

  const hasShown = useRef(false);
  useEffect(() => {
    hasShown.current = true;
  }, []);

  const handleShare = useCallback(async () => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const shareContent = post.caption
        ? t('share.withCaption', { author: authorName, caption: post.caption })
        : t('share.withoutCaption', { author: authorName });

      await Share.share({
        message: shareContent,
        url: post.imageUrl || undefined,
      });
    } catch {
      // Share was dismissed or failed silently
    }
  }, [post.caption, post.imageUrl, authorName, t]);

  const handleLike = useCallback(() => {
    if (process.env.EXPO_OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLiked && myLike) {
      onUnlike(myLike.id);
    } else {
      onLike(post.id);
    }
  }, [isLiked, myLike, onLike, onUnlike, post.id]);

  return (
    <Animated.View
      className="dark:bg-dark-bg-elevated mb-3.5 rounded-[20px] bg-white p-[18px] shadow-sm"
      entering={
        !hasShown.current
          ? withRM(FadeInUp.delay(index * 80).duration(motion.dur.lg))
          : undefined
      }
      layout={withRM(LinearTransition.duration(motion.dur.lg))}
    >
      <View className="mb-3 flex-row items-center gap-2.5">
        {authorAvatar ? (
          <Image
            source={{ uri: authorAvatar }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View className="bg-primary dark:bg-primary-bright size-[44px] items-center justify-center rounded-full">
            <Text className="text-lg font-bold text-white">
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-text dark:text-text-primary-dark text-[15px] font-bold">
            {authorName}
          </Text>
          <Text className="text-text-muted dark:text-text-muted-dark mt-px text-xs">
            {getTimeAgo(post.createdAt, t)}
          </Text>
        </View>
      </View>

      {post.imageUrl ? (
        <View className="relative">
          <Image
            source={{ uri: post.imageUrl }}
            style={{ width: '100%', height: 280 }}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          {post.label ? (
            <View className="absolute bottom-2 left-3">
              <Text className="dark:text-dark-bg rounded-[8px] bg-black/50 px-2 py-1 text-[12px] font-bold text-white">
                {post.label}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View className="flex-row gap-5 pt-1">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5"
          onPress={handleLike}
          testID={`like-${post.id}`}
        >
          <Heart
            size={20}
            color={isLiked ? Colors.danger : Colors.textMuted}
            fill={isLiked ? Colors.danger : 'transparent'}
          />
          <Text
            className={cn(
              'text-sm font-semibold text-text-muted dark:text-text-muted-dark',
              isLiked && 'text-danger dark:text-error-dark'
            )}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {likeCount}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-1.5">
          <MessageCircle size={20} color={Colors.textMuted} />
          <Text
            className="text-text-muted dark:text-text-muted-dark text-sm font-semibold"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {commentCount}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5"
          onPress={handleShare}
          testID={`share-${post.id}`}
        >
          <Send size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View className="pt-2">
        <Text
          className="text-text dark:text-text-primary-dark mb-3 text-[15px] leading-[22px]"
          selectable
        >
          <Text className="text-text dark:text-text-primary-dark font-bold">
            {authorName}
          </Text>{' '}
          <Text className="text-text dark:text-text-primary-dark">
            {post.caption}
          </Text>
        </Text>
        {post.hashtags ? (
          <Text className="text-primary dark:text-primary-bright mt-4 text-[13px] font-medium">
            {post.hashtags}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

function HeaderRight() {
  const { t } = useTranslation('community');
  return (
    <Pressable
      accessibilityRole="button"
      className="bg-primary dark:bg-primary-bright rounded-[20px] px-4 py-2 active:opacity-80"
      onPress={() => router.push(ROUTES.COMMUNITY_CREATE_POST)}
      testID="new-post-btn"
    >
      <Text className="dark:text-dark-bg text-sm font-bold text-white">
        {t('newPost')}
      </Text>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const { t } = useTranslation('community');
  const [activeFilter, setActiveFilter] = useState<string>('trending');
  const { posts, isLoading, likePost, unlikePost } = usePosts();
  const { profile } = useAuth();

  const filtered = useMemo(() => {
    if (activeFilter === 'trending')
      return [...posts].sort(
        (a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0)
      );
    if (activeFilter === 'newest')
      return [...posts].sort((a, b) => b.createdAt - a.createdAt);
    if (activeFilter === 'following') {
      // TODO: Implement 'Following' filter logic when backend support is available.
      // For now, return empty or fallback to posts.
      return posts;
    }
    return posts;
  }, [activeFilter, posts]);

  if (isLoading) {
    return (
      <View className="bg-background dark:bg-dark-bg flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <Stack.Screen
        options={{
          headerRight: () => <HeaderRight />,
        }}
      />

      <View className="mb-4 mt-3.5 flex-row gap-2 px-5">
        {FILTER_KEYS.map((key) => (
          <Pressable
            accessibilityRole="button"
            key={key}
            className={cn(
              'px-4 py-2 rounded-[20px] bg-white dark:bg-dark-bg-card border border-border-light dark:border-dark-border',
              activeFilter === key &&
                'bg-primary dark:bg-primary-bright border-primary dark:border-primary-bright'
            )}
            onPress={() => setActiveFilter(key)}
            testID={`community-filter-${key}`}
          >
            <Text
              className={cn(
                'text-[13px] font-semibold text-text-secondary dark:text-text-secondary-dark',
                activeFilter === key && 'text-white dark:text-dark-bg'
              )}
            >
              {t(`filters.${key}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <FeedPost
            post={item}
            index={index}
            profileId={profile?.id}
            onLike={likePost}
            onUnlike={unlikePost}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <View className="bg-border dark:bg-dark-bg-card mb-4 size-16 items-center justify-center rounded-full">
              <MessageCircle size={28} color={Colors.primary} />
            </View>
            <Text className="text-text dark:text-text-primary-dark text-lg font-extrabold">
              {t('noPostsTitle')}
            </Text>
            <Text className="text-text-secondary dark:text-text-secondary-dark mt-2 text-center text-[15px]">
              {t('noPostsSubtitle')}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
