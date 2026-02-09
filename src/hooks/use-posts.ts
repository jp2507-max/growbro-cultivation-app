import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';

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
    (postData: {
      caption: string;
      imageUrl?: string;
      label?: string;
      hashtags?: string;
    }) => {
      if (!profile) return;
      const postId = id();
      db.transact([
        db.tx.posts[postId].update({
          caption: postData.caption,
          imageUrl: postData.imageUrl ?? '',
          label: postData.label ?? '',
          hashtags: postData.hashtags ?? '',
          createdAt: Date.now(),
        }),
        db.tx.posts[postId].link({ author: profile.id }),
      ]);
    },
    [profile]
  );

  const likePost = useCallback(
    (postId: string) => {
      if (!profile) return;
      if (likedPostIds.has(postId) || pendingLikeIds.has(postId)) return;
      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
      const likeId = id();
      db.transact([
        db.tx.likes[likeId].update({ createdAt: Date.now() }),
        db.tx.likes[likeId].link({ post: postId }),
        db.tx.likes[likeId].link({ user: profile.id }),
      ]);
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
