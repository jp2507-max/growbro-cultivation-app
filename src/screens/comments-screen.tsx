import { zodResolver } from '@hookform/resolvers/zod';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { MessageCircle, MoreHorizontal, Send, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { HeaderAction } from '@/src/components/ui/header-action';
import { ListImage } from '@/src/components/ui/list-image';
import { useBlocks } from '@/src/hooks/use-blocks';
import { useComments } from '@/src/hooks/use-comments';
import {
  type CreateCommentFormData,
  createCommentSchema,
} from '@/src/lib/forms';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, TextInput, View } from '@/src/tw';

type TopLevelComment = ReturnType<
  typeof useComments
>['topLevelComments'][number];

function toRouteParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

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

function CommentRow({
  comment,
  isReply,
  canDelete,
  onDelete,
  onReply,
  onOpenActions,
}: {
  comment: TopLevelComment;
  isReply?: boolean;
  canDelete: boolean;
  onDelete: (commentId: string) => void;
  onReply: (comment: TopLevelComment) => void;
  onOpenActions: (comment: TopLevelComment) => void;
}): React.ReactElement {
  const { t } = useTranslation(['community', 'common']);
  const authorName = comment.author?.displayName ?? t('unknownAuthor');
  const authorAvatar = comment.author?.avatarUrl;

  return (
    <View
      className={cn(
        'mb-2 rounded-2xl border border-border bg-white p-3 dark:border-dark-border dark:bg-dark-bg-card',
        isReply && 'ml-6'
      )}
    >
      <View className="flex-row items-start gap-2.5">
        {authorAvatar ? (
          <ListImage
            source={{ uri: authorAvatar }}
            style={{ width: 30, height: 30, borderRadius: 15 }}
            transition={160}
            recyclingKey={`${comment.id}:comment-avatar`}
          />
        ) : (
          <View className="size-7.5 items-center justify-center rounded-full bg-primary/15 dark:bg-primary-bright/20">
            <Text className="text-xs font-bold text-primary dark:text-primary-bright">
              {authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <View className="mb-1 flex-row items-center">
            <View className="flex-row items-center gap-2">
              <Text className="text-text dark:text-text-primary-dark text-[13px] font-bold">
                {authorName}
              </Text>
              <Text className="text-text-muted dark:text-text-muted-dark text-[11px]">
                {getTimeAgo(comment.createdAt, t)}
              </Text>
            </View>
            <HeaderAction
              accessibilityLabel={t('actions.openMenu')}
              accessibilityHint={t('actions.openMenu')}
              variant="icon"
              className="ml-auto size-7 rounded-full"
              onPress={() => onOpenActions(comment)}
              testID={`comment-actions-${comment.id}`}
            >
              <MoreHorizontal size={16} color={Colors.textMuted} />
            </HeaderAction>
          </View>

          <Text className="text-text dark:text-text-primary-dark text-[14px] leading-5">
            {comment.body}
          </Text>

          {!isReply ? (
            <View className="mt-2 flex-row items-center gap-4">
              <Pressable
                accessibilityRole="button"
                onPress={() => onReply(comment)}
                testID={`reply-comment-${comment.id}`}
              >
                <Text className="text-[12px] font-semibold text-primary dark:text-primary-bright">
                  {t('comments.reply')}
                </Text>
              </Pressable>
              {canDelete ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onDelete(comment.id)}
                  testID={`delete-comment-${comment.id}`}
                >
                  <Text className="text-danger dark:text-error-dark text-[12px] font-semibold">
                    {t('common:delete')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function CommentsScreen(): React.ReactElement {
  const { t } = useTranslation(['community', 'common']);
  const { push } = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ postId?: string | string[] }>();
  const postId = toRouteParam(params.postId);
  const { profile } = useAuth();
  const { blockedUserIds, blockUser, unblockUser, findOutgoingBlockId } =
    useBlocks();

  const {
    topLevelComments,
    repliesByParentId,
    addComment,
    deleteComment,
    isLoading,
  } = useComments(postId);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { body: '' },
    mode: 'onBlur',
  });

  const [replyTo, setReplyTo] = useState<TopLevelComment | null>(null);
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(
    () => new Set()
  );

  const hasPostId = !!postId;

  const toggleReplies = useCallback((parentId: string) => {
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  }, []);

  const openReport = useCallback(
    (targetType: 'comment' | 'user', targetId: string) => {
      push({
        pathname: './report',
        params: { targetType, targetId },
      });
    },
    [push]
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

  const handleDelete = useCallback(
    (commentId: string) => {
      Alert.alert(t('common:delete'), t('comments.deleteConfirm'), [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: () => {
            void deleteComment(commentId);
          },
        },
      ]);
    },
    [deleteComment, t]
  );

  const handleOpenCommentActions = useCallback(
    (comment: TopLevelComment) => {
      const authorId = comment.author?.id;
      const authorName = comment.author?.displayName ?? t('unknownAuthor');
      const isOwnComment = !!authorId && authorId === profile?.id;
      const outgoingBlockId = authorId
        ? findOutgoingBlockId(authorId)
        : undefined;

      const blockOrUnblockOption =
        authorId && !isOwnComment
          ? outgoingBlockId
            ? {
                text: t('actions.unblockUser'),
                onPress: () => {
                  void unblockUser(outgoingBlockId);
                },
              }
            : {
                text: t('actions.blockUser'),
                style: 'destructive' as const,
                onPress: () => confirmBlockUser(authorId, authorName),
              }
          : null;

      if (
        authorId &&
        !isOwnComment &&
        blockOrUnblockOption &&
        Platform.OS === 'android'
      ) {
        Alert.alert(authorName, undefined, [
          {
            text: t('actions.reportComment'),
            onPress: () => {
              Alert.alert(authorName, undefined, [
                {
                  text: t('actions.reportComment'),
                  onPress: () => openReport('comment', comment.id),
                },
                {
                  text: t('actions.reportUser'),
                  onPress: () => openReport('user', authorId),
                },
                {
                  text: t('common:cancel'),
                  style: 'cancel',
                },
              ]);
            },
          },
          blockOrUnblockOption,
          {
            text: t('common:cancel'),
            style: 'cancel',
          },
        ]);
        return;
      }

      const options: {
        text: string;
        style?: 'default' | 'cancel' | 'destructive';
        onPress?: () => void;
      }[] = [
        {
          text: t('actions.reportComment'),
          onPress: () => openReport('comment', comment.id),
        },
      ];

      if (authorId && !isOwnComment) {
        options.push({
          text: t('actions.reportUser'),
          onPress: () => openReport('user', authorId),
        });

        if (blockOrUnblockOption) {
          options.push(blockOrUnblockOption);
        }
      }

      if (isOwnComment) {
        options.push({
          text: t('common:delete'),
          style: 'destructive',
          onPress: () => handleDelete(comment.id),
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
      findOutgoingBlockId,
      handleDelete,
      openReport,
      profile?.id,
      t,
      unblockUser,
    ]
  );

  const onValidSubmit = useCallback(
    async (data: CreateCommentFormData) => {
      if (!hasPostId) return;
      await addComment(data.body, replyTo?.id);
      reset({ body: '' });
      setReplyTo(null);
    },
    [addComment, hasPostId, replyTo?.id, reset]
  );

  const renderedRows = useMemo(() => {
    return topLevelComments
      .filter((comment) => {
        const authorId = comment.author?.id;
        if (!authorId) return true;
        return !blockedUserIds.has(authorId);
      })
      .map((comment) => {
        const replies = (repliesByParentId.get(comment.id) ?? []).filter(
          (reply) => {
            const authorId = reply.author?.id;
            if (!authorId) return true;
            return !blockedUserIds.has(authorId);
          }
        );
        const isExpanded = expandedParentIds.has(comment.id);

        return {
          comment,
          replies,
          isExpanded,
        };
      });
  }, [blockedUserIds, expandedParentIds, repliesByParentId, topLevelComments]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof renderedRows)[number] }) => {
      const repliesCount = item.replies.length;

      return (
        <View>
          <CommentRow
            comment={item.comment}
            canDelete={item.comment.author?.id === profile?.id}
            onDelete={handleDelete}
            onReply={setReplyTo}
            onOpenActions={handleOpenCommentActions}
          />

          {repliesCount > 0 ? (
            <Pressable
              className="mb-2 ml-6"
              accessibilityRole="button"
              onPress={() => toggleReplies(item.comment.id)}
              testID={`toggle-replies-${item.comment.id}`}
            >
              <Text className="text-[12px] font-semibold text-primary dark:text-primary-bright">
                {item.isExpanded
                  ? t('comments.hideReplies')
                  : t('comments.viewReplies', { count: repliesCount })}
              </Text>
            </Pressable>
          ) : null}

          {item.isExpanded
            ? item.replies.map((reply) => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  isReply
                  canDelete={reply.author?.id === profile?.id}
                  onDelete={handleDelete}
                  onReply={setReplyTo}
                  onOpenActions={handleOpenCommentActions}
                />
              ))
            : null}
        </View>
      );
    },
    [handleDelete, handleOpenCommentActions, profile?.id, t, toggleReplies]
  );

  if (!hasPostId) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6 dark:bg-dark-bg">
        <Text className="text-center text-base font-semibold text-text dark:text-text-primary-dark">
          {t('comments.invalidPost')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-bg">
      <FlashList
        data={renderedRows}
        keyExtractor={(item) => item.comment.id}
        renderItem={renderItem}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-16">
              <View className="mb-4 size-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-bright/15">
                <MessageCircle
                  size={28}
                  color={isDark ? Colors.primaryBright : Colors.primary}
                />
              </View>
              <Text className="text-lg font-bold text-text dark:text-text-primary-dark">
                {t('comments.noCommentsTitle')}
              </Text>
              <Text className="mt-2 text-center text-[14px] text-text-secondary dark:text-text-secondary-dark">
                {t('comments.noCommentsSubtitle')}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      />

      <View className="border-border dark:border-dark-border bg-background dark:bg-dark-bg absolute bottom-0 left-0 right-0 border-t px-4 pb-5 pt-3">
        {replyTo ? (
          <View className="mb-2 flex-row items-center justify-between rounded-lg bg-primary/10 px-3 py-2 dark:bg-primary-bright/15">
            <Text className="text-xs font-semibold text-primary dark:text-primary-bright">
              {t('comments.replyingTo', {
                name: replyTo.author?.displayName ?? t('unknownAuthor'),
              })}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common:cancel')}
              accessibilityHint={t('comments.cancelReplyHint')}
              onPress={() => setReplyTo(null)}
              testID="clear-reply-target"
            >
              <X
                size={14}
                color={isDark ? Colors.primaryBright : Colors.primary}
              />
            </Pressable>
          </View>
        ) : null}

        <View className="flex-row items-end gap-2">
          <View className="bg-card dark:bg-dark-bg-card flex-1 rounded-2xl px-3 py-2">
            <Controller
              control={control}
              name="body"
              render={({ field: { value, onBlur, onChange } }) => (
                <TextInput
                  accessibilityRole="text"
                  className="text-text dark:text-text-primary-dark min-h-10 max-h-28"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('comments.placeholder')}
                  placeholderTextColor={
                    isDark ? Colors.textMutedDark : Colors.textMuted
                  }
                  multiline
                  textAlignVertical="top"
                  testID="comment-input"
                />
              )}
            />
          </View>

          <HeaderAction
            testID="send-comment"
            variant="icon"
            accessibilityLabel={t('comments.send')}
            accessibilityHint={t('comments.sendHint')}
            className="rounded-full bg-primary dark:bg-primary-bright"
            onPress={handleSubmit(onValidSubmit)}
          >
            <Send size={16} color={Colors.white} />
          </HeaderAction>
        </View>

        {errors.body ? (
          <Text className="text-danger dark:text-error-dark mt-1 text-xs">
            {t(`common:${errors.body.message ?? 'validation.required'}`, {
              defaultValue: errors.body.message ?? 'validation.required',
            })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
