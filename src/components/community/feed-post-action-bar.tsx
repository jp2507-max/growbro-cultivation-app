import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react-native';
import React, { memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { motion } from '@/src/lib/animations/motion';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type FeedPostActionBarProps = {
  postId: string;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onPressComments: () => void;
  onShare: () => void;
  onToggleSave: () => void;
};

export const FeedPostActionBar = memo(function FeedPostActionBar({
  postId,
  isLiked,
  isSaved,
  likeCount,
  commentCount,
  onLike,
  onPressComments,
  onShare,
  onToggleSave,
}: FeedPostActionBarProps): React.ReactElement {
  const { t } = useTranslation('community');
  const likeScale = useSharedValue(1);

  useEffect(() => {
    return () => cancelAnimation(likeScale);
  }, [likeScale]);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.get() }],
  }));

  const handlePressLike = useCallback(() => {
    likeScale.set(
      withSequence(
        withSpring(1.2, motion.spring.snappy),
        withSpring(1, motion.spring.gentle)
      )
    );

    onLike();
  }, [likeScale, onLike]);

  return (
    <View className="flex-row items-center justify-between px-4 pb-2 pt-3.5">
      <View className="flex-row items-center gap-4">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5"
          onPress={handlePressLike}
          testID={`like-${postId}`}
        >
          <Animated.View style={likeAnimatedStyle}>
            <Heart
              size={22}
              color={isLiked ? Colors.danger : Colors.textMuted}
              fill={isLiked ? Colors.danger : 'transparent'}
            />
          </Animated.View>
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('actions.viewComments')}
          accessibilityHint={t('actions.viewComments')}
          className="flex-row items-center gap-1.5 rounded-full bg-primary/5 px-3.5 py-2 dark:bg-primary/10"
          onPress={onPressComments}
          testID={`comments-${postId}`}
        >
          <MessageCircle
            size={18}
            color={Colors.primary}
            fill={Colors.primaryAlpha15}
          />
          <Text className="text-sm font-extrabold text-primary dark:text-primary-bright">
            {commentCount}{' '}
            {commentCount > 0 ? t('actions.joinIn') : t('actions.reply')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('actions.sharePost')}
          accessibilityHint={t('actions.sharePost')}
          className="items-center justify-center rounded-full p-1.5"
          onPress={onShare}
          testID={`share-${postId}`}
        >
          <Send
            size={20}
            color={Colors.textMuted}
            style={{ transform: [{ rotate: '-12deg' }] }}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isSaved ? t('actions.unsavePost') : t('actions.savePost')
        }
        accessibilityHint={
          isSaved ? t('actions.unsavePost') : t('actions.savePost')
        }
        onPress={onToggleSave}
        testID={`save-${postId}`}
      >
        <Bookmark
          size={22}
          color={isSaved ? Colors.primary : Colors.textMuted}
          fill={isSaved ? Colors.primary : 'transparent'}
        />
      </Pressable>
    </View>
  );
});
