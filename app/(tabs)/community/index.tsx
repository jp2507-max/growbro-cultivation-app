import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Link, useRouter } from 'expo-router';
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
import { Share } from 'react-native';
import { FadeInUp, LinearTransition } from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { AdaptiveGlassSurface } from '@/src/components/ui/adaptive-glass-surface';
import { ListImage } from '@/src/components/ui/list-image';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { usePosts } from '@/src/hooks/use-posts';
import { motion, withRM } from '@/src/lib/animations/motion';
import { buildSearchBarOptions } from '@/src/lib/navigation/search-bar-options';
import { ROUTES } from '@/src/lib/routes';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

const FILTER_KEYS = ['trending', 'newest', 'following'] as const;
const FEED_CONTENT_CONTAINER_STYLE = {
  paddingHorizontal: 20,
  paddingBottom: 40,
} as const;

function getTimeAgo(
  timestamp: number,
  t: TFunction<['community', 'common']>
): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('common:timeAgo.justNow');
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
  const authorName = post.author?.displayName ?? t('unknownAuthor');
  const authorAvatar = post.author?.avatarUrl;
  const [hasAuthorAvatarError, setHasAuthorAvatarError] = useState(false);
  const [hasPostImageError, setHasPostImageError] = useState(false);

  const hasShown = useRef(false);
  useEffect(() => {
    hasShown.current = true;
  }, []);

  useEffect(() => {
    setHasAuthorAvatarError(false);
    setHasPostImageError(false);
  }, [post.id, authorAvatar, post.imageUrl]);

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
      className="dark:bg-dark-bg-elevated mb-3.5 rounded-[20px] bg-white p-4.5 shadow-sm"
      entering={
        !hasShown.current
          ? withRM(FadeInUp.delay(index * 80).duration(motion.dur.lg))
          : undefined
      }
      layout={withRM(LinearTransition.duration(motion.dur.lg))}
    >
      <View className="mb-3 flex-row items-center gap-2.5">
        {authorAvatar && !hasAuthorAvatarError ? (
          <ListImage
            source={{ uri: authorAvatar }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            transition={200}
            recyclingKey={`${post.id}:avatar`}
            onError={() => setHasAuthorAvatarError(true)}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View className="bg-primary dark:bg-primary-bright size-11 items-center justify-center rounded-full">
            <Text className="text-lg font-bold text-white dark:text-on-primary-dark">
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

      {post.imageUrl && !hasPostImageError ? (
        <View className="relative">
          <ListImage
            source={{ uri: post.imageUrl }}
            style={{ width: '100%', height: 280 }}
            contentFit="cover"
            transition={200}
            recyclingKey={`${post.id}:image`}
            onError={() => setHasPostImageError(true)}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          {post.label ? (
            <View className="absolute bottom-2 left-3">
              <Text className="rounded-lg bg-black/50 px-2 py-1 text-[12px] font-bold text-white dark:bg-dark-bg-card/90">
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
          className="text-text dark:text-text-primary-dark mb-3 text-[15px] leading-5.5"
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
  const { push } = useRouter();

  return (
    <Link href={ROUTES.COMMUNITY_CREATE_POST}>
      <Link.Trigger>
        <AdaptiveGlassSurface
          isInteractive
          style={{ borderRadius: 20, overflow: 'hidden' }}
        >
          <Pressable
            accessibilityRole="button"
            className="bg-primary/95 dark:bg-primary-bright/95 rounded-[20px] px-4 py-2 active:opacity-80"
            testID="new-post-btn"
          >
            <Text className="text-sm font-bold text-white dark:text-on-primary-dark">
              {t('newPost')}
            </Text>
          </Pressable>
        </AdaptiveGlassSurface>
      </Link.Trigger>
      <Link.Preview />
      <Link.Menu>
        <Link.MenuAction
          title={t('preview.openComposer')}
          icon="square.and.pencil"
          onPress={() => push(ROUTES.COMMUNITY_CREATE_POST)}
        />
      </Link.Menu>
    </Link>
  );
}

function FeedPostSkeleton({ index }: { index: number }): React.ReactElement {
  return (
    <Animated.View
      className="dark:bg-dark-bg-elevated mb-3.5 rounded-[20px] bg-white p-4.5 shadow-sm"
      entering={withRM(FadeInUp.delay(index * 80).duration(motion.dur.lg))}
      layout={withRM(LinearTransition.duration(motion.dur.lg))}
    >
      <View className="mb-3 flex-row items-center gap-2.5">
        <Skeleton className="size-11 rounded-full" />
        <View className="flex-1 gap-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </View>
      </View>

      <Skeleton className="h-70 rounded-2xl" />

      <View className="flex-row gap-5 pt-3">
        <Skeleton className="h-6 w-14 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
        <Skeleton className="h-6 w-10 rounded-md" />
      </View>

      <View className="pt-3">
        <Skeleton className="mb-2 h-4 w-full rounded-md" />
        <Skeleton className="mb-2 h-4 w-[90%] rounded-md" />
        <Skeleton className="h-3 w-32 rounded-md" />
      </View>
    </Animated.View>
  );
}

export default function CommunityScreen() {
  const { t } = useTranslation('community');
  const [activeFilter, setActiveFilter] =
    useState<(typeof FILTER_KEYS)[number]>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const { posts, isLoading, likePost, unlikePost } = usePosts();
  const { profile } = useAuth();
  const loadingItems = useMemo(() => {
    return Array.from(
      { length: 4 },
      (_, index) => `community-skeleton-${index}`
    );
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const searchBarOptions = useMemo(
    () =>
      buildSearchBarOptions({
        placeholder: t('searchPlaceholder'),
        onChangeText: setSearchQuery,
        onCancel: clearSearch,
      }),
    [clearSearch, t]
  );

  const filteredByType = useMemo(() => {
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

  const filtered = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return filteredByType;

    return filteredByType.filter((post) => {
      const author = post.author?.displayName?.toLowerCase() ?? '';
      const caption = post.caption?.toLowerCase() ?? '';
      const hashtags = post.hashtags?.toLowerCase() ?? '';
      const label = post.label?.toLowerCase() ?? '';

      return (
        author.includes(query) ||
        caption.includes(query) ||
        hashtags.includes(query) ||
        label.includes(query)
      );
    });
  }, [filteredByType, debouncedSearchQuery]);

  const renderSkeleton = useCallback(
    ({ index }: { index: number }) => <FeedPostSkeleton index={index} />,
    []
  );

  const skeletonKeyExtractor = useCallback((item: string) => item, []);

  const feedKeyExtractor = useCallback((item: FeedPostData) => item.id, []);

  const renderFeedPost = useCallback(
    ({ item, index }: { item: FeedPostData; index: number }) => (
      <FeedPost
        post={item}
        index={index}
        profileId={profile?.id}
        onLike={likePost}
        onUnlike={unlikePost}
      />
    ),
    [likePost, profile?.id, unlikePost]
  );

  const listEmpty = useMemo(
    () => (
      <View className="items-center py-16">
        <View className="bg-border dark:bg-dark-bg-card mb-4 size-16 items-center justify-center rounded-full">
          <PlatformIcon
            sfName="message"
            fallbackIcon={MessageCircle}
            size={28}
            color={Colors.primary}
          />
        </View>
        <Text className="text-text dark:text-text-primary-dark text-lg font-extrabold">
          {debouncedSearchQuery.trim()
            ? t('noSearchResultsTitle')
            : t('noPostsTitle')}
        </Text>
        <Text className="text-text-secondary dark:text-text-secondary-dark mt-2 text-center text-[15px]">
          {debouncedSearchQuery.trim()
            ? t('noSearchResultsSubtitle', {
                query: debouncedSearchQuery.trim(),
              })
            : t('noPostsSubtitle')}
        </Text>
      </View>
    ),
    [debouncedSearchQuery, t]
  );

  if (isLoading) {
    return (
      <View className="bg-background dark:bg-dark-bg flex-1">
        <Stack.Screen
          options={{
            headerRight: () => <HeaderRight />,
            headerSearchBarOptions: searchBarOptions,
          }}
        />

        <View className="mb-4 mt-3.5 flex-row gap-2 px-5">
          {FILTER_KEYS.map((key) => (
            <Skeleton
              key={`community-filter-skeleton-${key}`}
              className="h-9 w-24 rounded-[20px]"
            />
          ))}
        </View>

        <FlashList
          data={loadingItems}
          keyExtractor={skeletonKeyExtractor}
          renderItem={renderSkeleton}
          contentContainerStyle={FEED_CONTENT_CONTAINER_STYLE}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      </View>
    );
  }

  return (
    <View className="bg-background dark:bg-dark-bg flex-1">
      <Stack.Screen
        options={{
          headerRight: () => <HeaderRight />,
          headerSearchBarOptions: searchBarOptions,
        }}
      />

      <View className="mb-4 mt-3.5 px-5">
        <SegmentedControl
          values={FILTER_KEYS.map((key) => t(`filters.${key}`))}
          selectedIndex={Math.max(
            0,
            FILTER_KEYS.indexOf(activeFilter as (typeof FILTER_KEYS)[number])
          )}
          onChange={({ nativeEvent }) =>
            setActiveFilter(FILTER_KEYS[nativeEvent.selectedSegmentIndex])
          }
        />
      </View>

      <FlashList
        data={filtered}
        keyExtractor={feedKeyExtractor}
        renderItem={renderFeedPost}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={FEED_CONTENT_CONTAINER_STYLE}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}
