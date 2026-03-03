import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Stack from 'expo-router/stack';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { HeaderAction } from '@/src/components/ui/header-action';
import { ListImage } from '@/src/components/ui/list-image';
import { useBlocks } from '@/src/hooks/use-blocks';
import { useFollows } from '@/src/hooks/use-follows';
import { db, type Post } from '@/src/lib/instant';
import { ROUTES } from '@/src/lib/routes';
import { Pressable, Text, View } from '@/src/tw';

type ProfilePost = Post & {
  author?: {
    id?: string;
    displayName?: string;
    avatarUrl?: string;
    experienceLevel?: string;
  } | null;
  likes?: { id: string }[];
  comments?: { id: string }[];
};

function toRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function ProfilePostCard({ post }: { post: ProfilePost }): React.ReactElement {
  const { t } = useTranslation('community');
  const authorName = post.author?.displayName ?? t('profile.unknownGrower');

  return (
    <View className="mb-3 rounded-[20px] border border-border bg-white p-4 dark:border-dark-border dark:bg-dark-bg-elevated">
      {post.imageUrl ? (
        <ListImage
          source={{ uri: post.imageUrl }}
          style={{ width: '100%', height: 220, borderRadius: 14 }}
          contentFit="cover"
          transition={160}
          recyclingKey={`${post.id}:profile-image`}
        />
      ) : null}

      <View className="mt-3">
        <Text className="text-[13px] font-bold text-text dark:text-text-primary-dark">
          {authorName}
        </Text>
        <Text className="mt-1 text-[14px] leading-5 text-text dark:text-text-primary-dark">
          {post.caption}
        </Text>

        <View className="mt-2 flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Heart size={14} color={Colors.textMuted} />
            <Text className="text-[12px] font-semibold text-text-muted dark:text-text-muted-dark">
              {post.likes?.length ?? 0}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MessageCircle size={14} color={Colors.textMuted} />
            <Text className="text-[12px] font-semibold text-text-muted dark:text-text-muted-dark">
              {post.comments?.length ?? 0}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function UserProfileScreen(): React.ReactElement {
  const { t } = useTranslation(['community', 'common']);
  const { push } = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const targetProfileId = toRouteParam(params.id);

  const { profile } = useAuth();
  const { followingIds, followUser, unfollowUser, findFollowingRecordId } =
    useFollows();
  const { blockedUserIds, blockUser, unblockUser, findOutgoingBlockId } =
    useBlocks();

  const postsQuery = db.useQuery(
    targetProfileId
      ? {
          posts: {
            author: {},
            likes: {},
            comments: {},
            $: {
              where: {
                'author.id': targetProfileId,
              },
              order: {
                serverCreatedAt: 'desc',
              },
            },
          },
        }
      : null
  );

  const followersQuery = db.useQuery(
    targetProfileId
      ? {
          follows: {
            follower: {},
            $: {
              where: {
                'followee.id': targetProfileId,
              },
            },
          },
        }
      : null
  );

  const followingQuery = db.useQuery(
    targetProfileId
      ? {
          follows: {
            followee: {},
            $: {
              where: {
                'follower.id': targetProfileId,
              },
            },
          },
        }
      : null
  );

  const posts = useMemo(() => {
    return (postsQuery.data?.posts ?? []) as ProfilePost[];
  }, [postsQuery.data?.posts]);

  const isOwnProfile = !!targetProfileId && targetProfileId === profile?.id;
  const fallbackAuthor = posts[0]?.author;

  const displayName = isOwnProfile
    ? (profile?.displayName ?? t('profile.unknownGrower'))
    : (fallbackAuthor?.displayName ?? t('profile.unknownGrower'));

  const avatarUrl = isOwnProfile
    ? profile?.avatarUrl
    : fallbackAuthor?.avatarUrl;

  const outgoingBlockId = targetProfileId
    ? findOutgoingBlockId(targetProfileId)
    : undefined;

  const followRecordId = targetProfileId
    ? findFollowingRecordId(targetProfileId)
    : undefined;

  const isFollowingTarget = targetProfileId
    ? followingIds.has(targetProfileId)
    : false;

  const isBlockedTarget = targetProfileId
    ? blockedUserIds.has(targetProfileId)
    : false;

  const visiblePosts = useMemo(() => {
    if (isBlockedTarget) return [];
    return posts;
  }, [isBlockedTarget, posts]);

  const followersCount = followersQuery.data?.follows?.length ?? 0;
  const followingCount = followingQuery.data?.follows?.length ?? 0;
  const postsCount = posts.length;

  const openReportUser = useCallback(() => {
    if (!targetProfileId) return;

    push({
      pathname: '../report',
      params: {
        targetType: 'user',
        targetId: targetProfileId,
      },
    });
  }, [push, targetProfileId]);

  const confirmBlockUser = useCallback(
    (profileId: string, name: string) => {
      Alert.alert(
        t('block.confirmTitle', { name }),
        t('block.confirmDescription', { name }),
        [
          {
            text: t('common:cancel'),
            style: 'cancel',
          },
          {
            text: t('actions.blockUser'),
            style: 'destructive',
            onPress: () => {
              void blockUser(profileId);
            },
          },
        ]
      );
    },
    [blockUser, t]
  );

  const handleOpenActions = useCallback(() => {
    if (!targetProfileId || isOwnProfile) return;

    const options: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[] = [
      {
        text: t('actions.reportUser'),
        onPress: openReportUser,
      },
      outgoingBlockId
        ? {
            text: t('actions.unblockUser'),
            onPress: () => {
              void unblockUser(outgoingBlockId);
            },
          }
        : {
            text: t('actions.blockUser'),
            style: 'destructive',
            onPress: () => confirmBlockUser(targetProfileId, displayName),
          },
      {
        text: t('common:cancel'),
        style: 'cancel',
      },
    ];

    Alert.alert(displayName, undefined, options);
  }, [
    confirmBlockUser,
    displayName,
    isOwnProfile,
    openReportUser,
    outgoingBlockId,
    t,
    targetProfileId,
    unblockUser,
  ]);

  const handlePrimaryAction = useCallback(() => {
    if (!targetProfileId) return;

    if (isOwnProfile) {
      push(ROUTES.PROFILE);
      return;
    }

    if (isFollowingTarget && followRecordId) {
      void unfollowUser(followRecordId);
      return;
    }

    void followUser(targetProfileId);
  }, [
    followRecordId,
    followUser,
    isFollowingTarget,
    isOwnProfile,
    push,
    targetProfileId,
    unfollowUser,
  ]);

  const primaryActionLabel = isOwnProfile
    ? t('profile.editProfile')
    : isFollowingTarget
      ? t('profile.unfollow')
      : t('profile.follow');

  const renderPost = useCallback(
    ({ item }: { item: ProfilePost }) => <ProfilePostCard post={item} />,
    []
  );

  if (!targetProfileId) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6 dark:bg-dark-bg">
        <Text className="text-center text-base font-semibold text-text dark:text-text-primary-dark">
          {t('profile.invalidUser')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen
        options={{
          title: displayName,
          headerRight: isOwnProfile
            ? undefined
            : () => (
                <HeaderAction
                  accessibilityLabel={t('actions.openMenu')}
                  accessibilityHint={t('actions.openMenu')}
                  onPress={handleOpenActions}
                  variant="icon"
                  className="size-9 rounded-full"
                  testID="profile-actions"
                >
                  <MoreHorizontal size={18} color={Colors.textMuted} />
                </HeaderAction>
              ),
        }}
      />

      <FlashList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
        }}
        ListHeaderComponent={
          <View className="mb-4 rounded-[20px] border border-border bg-white p-4 dark:border-dark-border dark:bg-dark-bg-elevated">
            <View className="flex-row items-center gap-3">
              {avatarUrl ? (
                <ListImage
                  source={{ uri: avatarUrl }}
                  style={{ width: 58, height: 58, borderRadius: 29 }}
                  transition={180}
                  recyclingKey={`${targetProfileId}:community-profile-avatar`}
                />
              ) : (
                <View className="size-14.5 items-center justify-center rounded-full bg-primary/15 dark:bg-primary-bright/20">
                  <Text className="text-xl font-bold text-primary dark:text-primary-bright">
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View className="flex-1">
                <Text className="text-[18px] font-extrabold text-text dark:text-text-primary-dark">
                  {displayName}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row rounded-2xl bg-card py-3 dark:bg-dark-bg-card">
              <View className="flex-1 items-center">
                <Text
                  className="text-[20px] font-black text-text dark:text-text-primary-dark"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {postsCount}
                </Text>
                <Text className="text-xs font-medium text-text-muted dark:text-text-muted-dark">
                  {t('profile.stats.posts')}
                </Text>
              </View>
              <View className="h-7 w-px self-center bg-border-light dark:bg-dark-border" />
              <View className="flex-1 items-center">
                <Text
                  className="text-[20px] font-black text-text dark:text-text-primary-dark"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {followersCount}
                </Text>
                <Text className="text-xs font-medium text-text-muted dark:text-text-muted-dark">
                  {t('profile.stats.followers')}
                </Text>
              </View>
              <View className="h-7 w-px self-center bg-border-light dark:bg-dark-border" />
              <View className="flex-1 items-center">
                <Text
                  className="text-[20px] font-black text-text dark:text-text-primary-dark"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {followingCount}
                </Text>
                <Text className="text-xs font-medium text-text-muted dark:text-text-muted-dark">
                  {t('profile.stats.following')}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-4 items-center justify-center rounded-xl bg-primary px-4 py-3 dark:bg-primary-bright"
              onPress={handlePrimaryAction}
              testID="profile-primary-action"
            >
              <Text className="text-sm font-bold text-white dark:text-on-primary-dark">
                {primaryActionLabel}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <View className="mb-4 size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/15">
              <MessageCircle
                size={28}
                color={isDark ? Colors.primaryBright : Colors.primary}
              />
            </View>
            <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
              {isBlockedTarget
                ? t('profile.blockedTitle')
                : t('profile.emptyPostsTitle')}
            </Text>
            <Text className="mt-2 text-center text-[14px] text-text-secondary dark:text-text-secondary-dark">
              {isBlockedTarget
                ? t('profile.blockedSubtitle')
                : t('profile.emptyPostsSubtitle')}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
