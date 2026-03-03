import { FlashList } from '@shopify/flash-list';
import { Bookmark, Heart, MessageCircle } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { HeaderAction } from '@/src/components/ui/header-action';
import { ListImage } from '@/src/components/ui/list-image';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { useBlocks } from '@/src/hooks/use-blocks';
import { useSavedPosts } from '@/src/hooks/use-saved-posts';
import { Text, View } from '@/src/tw';

type SavedFeedPost = ReturnType<typeof useSavedPosts>['savedFeedPosts'][number];

function SavedPostCard({
  post,
  isSaved,
  onToggleSave,
}: {
  post: SavedFeedPost;
  isSaved: boolean;
  onToggleSave: (postId: string) => void;
}): React.ReactElement {
  const { t } = useTranslation('community');
  const authorName = post.author?.displayName ?? t('unknownAuthor');

  return (
    <View className="mb-3 rounded-[20px] border border-border bg-white p-4 dark:border-dark-border dark:bg-dark-bg-elevated">
      {post.imageUrl ? (
        <ListImage
          source={{ uri: post.imageUrl }}
          style={{ width: '100%', height: 190, borderRadius: 14 }}
          contentFit="cover"
          transition={160}
          recyclingKey={`${post.id}:saved-image`}
        />
      ) : null}

      <View className="mt-3 flex-row items-start gap-2">
        <View className="flex-1">
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

        <HeaderAction
          accessibilityLabel={
            isSaved ? t('actions.unsavePost') : t('actions.savePost')
          }
          accessibilityHint={
            isSaved ? t('actions.unsavePost') : t('actions.savePost')
          }
          variant="icon"
          onPress={() => onToggleSave(post.id)}
          className="size-9 rounded-full border border-border bg-card dark:border-dark-border dark:bg-dark-bg-card"
          testID={`toggle-save-${post.id}`}
        >
          <Bookmark
            size={16}
            color={isSaved ? Colors.primary : Colors.textMuted}
            fill={isSaved ? Colors.primary : 'transparent'}
          />
        </HeaderAction>
      </View>
    </View>
  );
}

export function SavedPostsScreen(): React.ReactElement {
  const { t } = useTranslation('community');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { blockedUserIds } = useBlocks();
  const { savedFeedPosts, savedPostIds, toggleSavedPost } = useSavedPosts();

  const filteredSavedPosts = useMemo(() => {
    return savedFeedPosts.filter((post) => {
      const authorId = post.author?.id;
      if (!authorId) return true;
      return !blockedUserIds.has(authorId);
    });
  }, [blockedUserIds, savedFeedPosts]);

  const renderItem = useCallback(
    ({ item }: { item: SavedFeedPost }) => (
      <SavedPostCard
        post={item}
        isSaved={savedPostIds.has(item.id)}
        onToggleSave={(postId) => {
          void toggleSavedPost(postId);
        }}
      />
    ),
    [savedPostIds, toggleSavedPost]
  );

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <FlashList
        data={filteredSavedPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-18">
            <View className="mb-4 size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/15">
              <PlatformIcon
                sfName="bookmark"
                fallbackIcon={Bookmark}
                size={28}
                color={isDark ? Colors.primaryBright : Colors.primary}
              />
            </View>
            <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
              {t('saved.emptyTitle')}
            </Text>
            <Text className="mt-2 text-center text-[14px] text-text-secondary dark:text-text-secondary-dark">
              {t('saved.emptySubtitle')}
            </Text>
          </View>
        }
      />
    </View>
  );
}
