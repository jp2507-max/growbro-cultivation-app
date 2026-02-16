import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';
import {
  sanitizePostCaption,
  sanitizePostHashtags,
} from '@/src/lib/text-sanitization';

export function usePosts() {
  const { profile } = useAuth();

  const { data, isLoading, error } = db.useQuery({
    posts: {
      author: {},
      likes: { user: {} },
      comments: {},
      $: { order: { serverCreatedAt: 'desc' } },
    },
  });

  const likedPostIds = useMemo(() => {
    const set = new Set<string>();
    if (!profile) return set;
    for (const post of data?.posts ?? []) {
      if (post.likes?.some((like) => like.user?.id === profile.id)) {
        set.add(post.id);
      }
    }
    return set;
  }, [data?.posts, profile]);

  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(
    () => new Set()
  );

  useEffect(() => {
    if (pendingLikeIds.size === 0) return;
    let changed = false;
    const next = new Set(pendingLikeIds);
    for (const postId of pendingLikeIds) {
      if (!profile || likedPostIds.has(postId)) {
        next.delete(postId);
        changed = true;
      }
    }
    if (changed) setPendingLikeIds(next);
  }, [likedPostIds, pendingLikeIds, profile]);

  const createPost = useCallback(
    async (postData: {
      caption: string;
      imageUrl?: string;
      label?: string;
      hashtags?: string;
    }) => {
      if (!profile) return;
      const postId = id();
      const caption = sanitizePostCaption(postData.caption);
      const hashtags = sanitizePostHashtags(postData.hashtags);

      if (!caption) {
        if (__DEV__) {
          console.warn(
            '[createPost] caption empty after sanitization — post discarded'
          );
        }
        return;
      }

      return db.transact([
        db.tx.posts[postId].update({
          caption,
          imageUrl: postData.imageUrl ?? '',
          label: postData.label ?? '',
          hashtags: hashtags ?? '',
          createdAt: Date.now(),
        }),
        db.tx.posts[postId].link({ author: profile.id }),
      ]);
    },
    [profile]
  );

  const likePost = useCallback(
    async (postId: string) => {
      if (!profile) return;
      if (likedPostIds.has(postId) || pendingLikeIds.has(postId)) return;

      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });

      try {
        const likeId = id();
        await db.transact([
          db.tx.likes[likeId].update({
            createdAt: Date.now(),
            uniqueKey: `${profile.id}_${postId}`,
          }),
          db.tx.likes[likeId].link({ post: postId }),
          db.tx.likes[likeId].link({ user: profile.id }),
        ]);
      } catch (err) {
        console.error('Failed to like post:', err);
        setPendingLikeIds((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [profile, likedPostIds, pendingLikeIds]
  );

  const unlikePost = useCallback((likeId: string) => {
    db.transact(db.tx.likes[likeId].delete());
  }, []);

  const deletePost = useCallback((postId: string) => {
    db.transact(db.tx.posts[postId].delete());
  }, []);

  return {
    posts: data?.posts ?? [],
    isLoading,
    error,
    createPost,
    likePost,
    unlikePost,
    deletePost,
  };
}
