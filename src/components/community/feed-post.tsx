import * as Haptics from 'expo-haptics';
import type { TFunction } from 'i18next';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';
import { FadeInUp, LinearTransition } from 'react-native-reanimated';

import { FeedPostActionBar } from '@/src/components/community/feed-post-action-bar';
import { FeedPostAuthorRow } from '@/src/components/community/feed-post-author-row';
import { FeedPostCaption } from '@/src/components/community/feed-post-caption';
import { type CommunityFeedPost } from '@/src/components/community/types';
import { ListImage } from '@/src/components/ui/list-image';
import { motion, withRM } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type FeedPostProps = {
  post: CommunityFeedPost;
  index: number;
  profileId: string | undefined;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onUnlike: (likeId: string) => void;
  onToggleSave: (postId: string) => void;
  onPressComments: (postId: string) => void;
  onOpenActions: (post: CommunityFeedPost) => void;
  onPressAuthor: (authorId: string) => void;
};

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

function parseHashtags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/\s+/)
    .filter((tag) => tag.startsWith('#') && tag.length > 1);
}

export const FeedPost = memo(function FeedPost({
  post,
  index,
  profileId,
  isSaved,
  onLike,
  onUnlike,
  onToggleSave,
  onPressComments,
  onOpenActions,
  onPressAuthor,
}: FeedPostProps): React.ReactElement {
  const myLike = profileId
    ? post.likes?.find((like) => like.user?.id === profileId)
    : undefined;
  const isLiked = !!myLike;
  const likeCount = post.likes?.length ?? 0;
  const commentCount = post.comments?.length ?? 0;

  const { t } = useTranslation(['community', 'common']);
  const authorId = post.author?.id;
  const authorName = post.author?.displayName ?? t('unknownAuthor');
  const authorAvatar = post.author?.avatarUrl;
  const isHelpPost = post.type === 'help';
  const hashtags = useMemo(() => parseHashtags(post.hashtags), [post.hashtags]);
  const timeAgoLabel = useMemo(
    () => getTimeAgo(post.createdAt, t),
    [post.createdAt, t]
  );

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
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const shareContent = post.caption
        ? t('share.withCaption', { author: authorName, caption: post.caption })
        : t('share.withoutCaption', { author: authorName });

      await Share.share({
        message: shareContent,
        url: post.imageUrl || undefined,
      });
    } catch {
      // Share dismissed or failed silently.
    }
  }, [authorName, post.caption, post.imageUrl, t]);

  const handleLike = useCallback(() => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isLiked && myLike) {
      onUnlike(myLike.id);
      return;
    }

    onLike(post.id);
  }, [isLiked, myLike, onLike, onUnlike, post.id]);

  return (
    <Animated.View
      className={cn(
        'mx-3 overflow-hidden rounded-3xl border border-border-light bg-card pb-1 shadow-sm dark:border-dark-border dark:bg-dark-bg-card',
        isHelpPost &&
          'border-warning/30 bg-warning/5 dark:border-warning-dark/35 dark:bg-warning-dark/10'
      )}
      entering={
        !hasShown.current
          ? withRM(FadeInUp.delay(index * 80).duration(motion.dur.lg))
          : undefined
      }
      layout={withRM(LinearTransition.duration(motion.dur.lg))}
    >
      {isHelpPost ? (
        <View className="h-1.5 bg-warning dark:bg-warning-dark" />
      ) : null}

      <FeedPostAuthorRow
        post={post}
        authorId={authorId}
        authorName={authorName}
        authorAvatar={authorAvatar}
        hasAuthorAvatarError={hasAuthorAvatarError}
        isHelpPost={isHelpPost}
        timeAgoLabel={timeAgoLabel}
        onAvatarError={() => setHasAuthorAvatarError(true)}
        onPressAuthor={onPressAuthor}
        onOpenActions={onOpenActions}
      />

      {post.imageUrl && !hasPostImageError ? (
        <View
          className="relative mx-3 mb-1 overflow-hidden rounded-xl"
          style={{ aspectRatio: 4 / 5 }}
        >
          <ListImage
            source={{ uri: post.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
            recyclingKey={`${post.id}:image`}
            onError={() => setHasPostImageError(true)}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          {post.label ? (
            <View className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5">
              <Text className="text-xs font-medium tracking-wide text-white">
                {post.label}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <FeedPostActionBar
        postId={post.id}
        isLiked={isLiked}
        isSaved={isSaved}
        likeCount={likeCount}
        commentCount={commentCount}
        onLike={handleLike}
        onPressComments={() => onPressComments(post.id)}
        onShare={handleShare}
        onToggleSave={() => onToggleSave(post.id)}
      />

      <FeedPostCaption
        authorName={authorName}
        caption={post.caption ?? ''}
        hashtags={hashtags}
      />
    </Animated.View>
  );
});
