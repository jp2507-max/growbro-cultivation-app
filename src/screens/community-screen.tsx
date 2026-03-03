import { FlashList } from '@shopify/flash-list';
import Stack from 'expo-router/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import {
  CommunityFeedControls,
  CommunityFeedEmpty,
  type CommunityFeedPost,
  CommunityHeaderActions,
  FeedPost,
  FeedPostSkeleton,
} from '@/src/components/community';
import { AnimatedFab } from '@/src/components/ui/fab';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useBlocks } from '@/src/hooks/use-blocks';
import { useCommunityFeedFilter } from '@/src/hooks/use-community-feed-filter';
import {
  type CommunitySortKey,
  type CommunityTypeFilterKey,
} from '@/src/hooks/use-community-feed-filter';
import { useCommunityNavigation } from '@/src/hooks/use-community-navigation';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { usePosts } from '@/src/hooks/use-posts';
import { useSavedPosts } from '@/src/hooks/use-saved-posts';
import { buildSearchBarOptions } from '@/src/lib/navigation/search-bar-options';
import { View } from '@/src/tw';

export function CommunityScreen(): React.ReactElement {
  const { t } = useTranslation(['community', 'common']);
  const isIOS = process.env.EXPO_OS === 'ios';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [activeType, setActiveType] = useState<CommunityTypeFilterKey>('all');
  const [activeSort, setActiveSort] = useState<CommunitySortKey>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const fabBottom = useMemo(() => insets.bottom + 49 + 16, [insets.bottom]);

  const { profile } = useAuth();
  const { posts, isLoading, likePost, unlikePost, deletePost } = usePosts();
  const { savedPostIds, toggleSavedPost } = useSavedPosts();
  const { blockedUserIds, blockUser, unblockUser, findOutgoingBlockId } =
    useBlocks();

  const { openComments, openComposer, openProfile, openReport, openSaved } =
    useCommunityNavigation();

  const filteredPosts = useCommunityFeedFilter({
    posts,
    blockedUserIds,
    activeType,
    activeSort,
    debouncedSearchQuery,
  });

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

  const typeFilterLabels = useMemo(
    () => [t('filters.all'), t('filters.showcase'), t('filters.help')],
    [t]
  );

  const confirmBlockUser = useCallback(
    (authorId: string, authorName: string) => {
      Alert.alert(
        t('block.confirmTitle', { name: authorName }),
        t('block.confirmDescription', { name: authorName }),
        [
          {
            text: t('common:cancel'),
            style: 'cancel',
          },
          {
            text: t('actions.blockUser'),
            style: 'destructive',
            onPress: () => {
              void blockUser(authorId);
            },
          },
        ]
      );
    },
    [blockUser, t]
  );

  const handleOpenActions = useCallback(
    (post: CommunityFeedPost) => {
      const authorId = post.author?.id;
      const authorName = post.author?.displayName ?? t('unknownAuthor');
      const isOwnPost = !!authorId && authorId === profile?.id;
      const outgoingBlockId = authorId
        ? findOutgoingBlockId(authorId)
        : undefined;

      const options: {
        text: string;
        style?: 'default' | 'cancel' | 'destructive';
        onPress?: () => void;
      }[] = [
        {
          text: t('actions.reportPost'),
          onPress: () => openReport('post', post.id),
        },
      ];

      if (authorId && !isOwnPost) {
        options.push({
          text: t('actions.reportUser'),
          onPress: () => openReport('user', authorId),
        });

        options.push(
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
                onPress: () => confirmBlockUser(authorId, authorName),
              }
        );
      }

      if (isOwnPost) {
        options.push({
          text: t('actions.deletePost'),
          style: 'destructive',
          onPress: () => {
            deletePost(post.id);
          },
        });
      }

      options.push({
        text: t('common:cancel'),
        style: 'cancel',
      });

      Alert.alert(authorName, undefined, options);
    },
    [
      confirmBlockUser,
      deletePost,
      findOutgoingBlockId,
      openReport,
      profile?.id,
      t,
      unblockUser,
    ]
  );

  const toggleSort = useCallback(() => {
    setActiveSort((prev) => (prev === 'newest' ? 'trending' : 'newest'));
  }, []);

  const renderSkeleton = useCallback(
    ({ index }: { index: number }) => <FeedPostSkeleton index={index} />,
    []
  );

  const skeletonKeyExtractor = useCallback((item: string) => item, []);
  const getSkeletonItemType = useCallback(() => 'community-skeleton', []);

  const feedKeyExtractor = useCallback(
    (item: CommunityFeedPost) => item.id,
    []
  );
  const getFeedItemType = useCallback(() => 'community-post', []);

  const renderFeedPost = useCallback(
    ({ item, index }: { item: CommunityFeedPost; index: number }) => (
      <FeedPost
        post={item}
        index={index}
        profileId={profile?.id}
        isSaved={savedPostIds.has(item.id)}
        onLike={likePost}
        onUnlike={unlikePost}
        onToggleSave={(postId) => {
          void toggleSavedPost(postId);
        }}
        onPressComments={openComments}
        onOpenActions={handleOpenActions}
        onPressAuthor={openProfile}
      />
    ),
    [
      handleOpenActions,
      likePost,
      openComments,
      openProfile,
      profile?.id,
      savedPostIds,
      toggleSavedPost,
      unlikePost,
    ]
  );

  const listEmpty = useMemo(
    () => (
      <CommunityFeedEmpty
        searchQuery={debouncedSearchQuery}
        onCreateFirstPost={openComposer}
      />
    ),
    [debouncedSearchQuery, openComposer]
  );

  const listItemSeparator = useCallback(
    () => <View className="h-2 bg-transparent" />,
    []
  );

  const headerOptions = useMemo(
    () => ({
      headerRight: () => <CommunityHeaderActions onOpenSaved={openSaved} />,
      ...(isIOS ? {} : { headerSearchBarOptions: searchBarOptions }),
    }),
    [isIOS, openSaved, searchBarOptions]
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background dark:bg-dark-bg">
        <Stack.Screen options={headerOptions} />

        {isIOS ? (
          <Stack.SearchBar
            placeholder={t('searchPlaceholder')}
            onChangeText={(event) => setSearchQuery(event.nativeEvent.text)}
            onCancelButtonPress={clearSearch}
          />
        ) : null}

        <View className="mb-3 mt-3.5 px-5">
          <Skeleton className="h-9 w-full rounded-[20px]" />
        </View>

        <FlashList
          data={loadingItems}
          keyExtractor={skeletonKeyExtractor}
          getItemType={getSkeletonItemType}
          renderItem={renderSkeleton}
          ItemSeparatorComponent={listItemSeparator}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: fabBottom + 88 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen options={headerOptions} />

      {isIOS ? (
        <Stack.SearchBar
          placeholder={t('searchPlaceholder')}
          onChangeText={(event) => setSearchQuery(event.nativeEvent.text)}
          onCancelButtonPress={clearSearch}
        />
      ) : null}

      <CommunityFeedControls
        activeType={activeType}
        activeSort={activeSort}
        typeFilterLabels={typeFilterLabels}
        isDark={isDark}
        onChangeType={setActiveType}
        onToggleSort={toggleSort}
      />

      <FlashList
        data={filteredPosts}
        keyExtractor={feedKeyExtractor}
        getItemType={getFeedItemType}
        renderItem={renderFeedPost}
        ListEmptyComponent={listEmpty}
        ItemSeparatorComponent={listItemSeparator}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: fabBottom + 88, paddingTop: 8 }}
      />

      <AnimatedFab
        onPress={openComposer}
        testID="community-fab"
        bottom={fabBottom}
      />
    </View>
  );
}
