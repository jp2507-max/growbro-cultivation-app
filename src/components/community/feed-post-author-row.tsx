import { MoreHorizontal } from 'lucide-react-native';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { type CommunityFeedPost } from '@/src/components/community/types';
import { HeaderAction } from '@/src/components/ui/header-action';
import { ListImage } from '@/src/components/ui/list-image';
import { Pressable, Text, View } from '@/src/tw';

type FeedPostAuthorRowProps = {
  post: CommunityFeedPost;
  authorId: string | undefined;
  authorName: string;
  authorAvatar: string | undefined;
  hasAuthorAvatarError: boolean;
  isHelpPost: boolean;
  timeAgoLabel: string;
  onAvatarError: () => void;
  onPressAuthor: (authorId: string) => void;
  onOpenActions: (post: CommunityFeedPost) => void;
};

export const FeedPostAuthorRow = memo(function FeedPostAuthorRow({
  post,
  authorId,
  authorName,
  authorAvatar,
  hasAuthorAvatarError,
  isHelpPost,
  timeAgoLabel,
  onAvatarError,
  onPressAuthor,
  onOpenActions,
}: FeedPostAuthorRowProps): React.ReactElement {
  const { t } = useTranslation('community');

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('actions.viewProfile')}
        accessibilityHint={t('actions.viewProfile')}
        disabled={!authorId}
        className="flex-1 flex-row items-center gap-3"
        onPress={() => {
          if (!authorId) return;
          onPressAuthor(authorId);
        }}
        testID={`open-author-${post.id}`}
      >
        {authorAvatar && !hasAuthorAvatarError ? (
          <ListImage
            source={{ uri: authorAvatar }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: Colors.primaryAlpha15,
            }}
            transition={200}
            recyclingKey={`${post.id}:avatar`}
            onError={onAvatarError}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        ) : (
          <View className="size-10 items-center justify-center rounded-full bg-primary dark:bg-primary-bright">
            <Text className="text-base font-bold text-white dark:text-on-primary-dark">
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-sm font-bold text-text dark:text-text-primary-dark">
            {authorName}
          </Text>
          <Text className="mt-px text-xs text-text-muted dark:text-text-muted-dark">
            {timeAgoLabel}
          </Text>
        </View>
      </Pressable>

      {isHelpPost ? (
        <View className="mr-2 rounded-full bg-warning/15 px-2.5 py-1 dark:bg-warning-dark/20">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-warning dark:text-warning-dark">
            {t('filters.help')}
          </Text>
        </View>
      ) : null}

      <HeaderAction
        accessibilityLabel={t('actions.openMenu')}
        accessibilityHint={t('actions.openMenu')}
        variant="icon"
        className="size-8 rounded-full"
        onPress={() => onOpenActions(post)}
        testID={`post-actions-${post.id}`}
      >
        <MoreHorizontal size={18} color={Colors.textMuted} />
      </HeaderAction>
    </View>
  );
});
