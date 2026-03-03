import { useCallback, useMemo, useRef } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Post } from '@/src/lib/instant';

type SavedPostItem = {
  id: string;
  createdAt: number;
  post?: Post | null;
};

export function useSavedPosts(): {
  savedPosts: SavedPostItem[];
  savedFeedPosts: Post[];
  savedPostIds: Set<string>;
  isLoading: boolean;
  error: unknown;
  savePost: (postId: string) => Promise<void>;
  unsavePost: (savedPostId: string) => Promise<void>;
  toggleSavedPost: (postId: string) => Promise<void>;
  findSavedPostId: (postId: string) => string | undefined;
} {
  const { profile } = useAuth();
  const pendingPostIdsRef = useRef<Set<string>>(new Set());

  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          savedPosts: {
            post: {
              author: {},
              likes: { user: {} },
              comments: { author: {} },
            },
            $: {
              where: {
                'owner.id': profile.id,
              },
              order: { serverCreatedAt: 'desc' },
            },
          },
        }
      : null
  );

  const savedPosts = useMemo(() => {
    return (data?.savedPosts ?? []) as SavedPostItem[];
  }, [data?.savedPosts]);

  const savedPostIds = useMemo(() => {
    const set = new Set<string>();

    for (const savedPost of savedPosts) {
      if (savedPost.post?.id) set.add(savedPost.post.id);
    }

    return set;
  }, [savedPosts]);

  const findSavedPostId = useCallback(
    (postId: string) => {
      return savedPosts.find((savedPost) => savedPost.post?.id === postId)?.id;
    },
    [savedPosts]
  );

  const savedFeedPosts = useMemo(() => {
    return savedPosts
      .map((savedPost) => savedPost.post)
      .filter((post): post is Post => !!post?.id);
  }, [savedPosts]);

  const savePost = useCallback(
    async (postId: string) => {
      if (!profile) return;
      if (savedPostIds.has(postId)) return;

      const savedPostId = id();
      await db.transact([
        db.tx.savedPosts[savedPostId].update({
          createdAt: Date.now(),
          uniqueKey: `${profile.id}_${postId}`,
        }),
        db.tx.savedPosts[savedPostId].link({ owner: profile.id }),
        db.tx.savedPosts[savedPostId].link({ post: postId }),
      ]);
    },
    [profile, savedPostIds]
  );

  const unsavePost = useCallback(async (savedPostId: string) => {
    await db.transact(db.tx.savedPosts[savedPostId].delete());
  }, []);

  const toggleSavedPost = useCallback(
    async (postId: string) => {
      if (!postId) return;
      if (pendingPostIdsRef.current.has(postId)) return;

      pendingPostIdsRef.current.add(postId);

      try {
        const savedPostId = findSavedPostId(postId);
        if (savedPostId) {
          await unsavePost(savedPostId);
          return;
        }

        await savePost(postId);
      } catch (error) {
        console.error('Failed to toggle saved post:', error);
      } finally {
        pendingPostIdsRef.current.delete(postId);
      }
    },
    [findSavedPostId, savePost, unsavePost]
  );

  return {
    savedPosts,
    savedFeedPosts,
    savedPostIds,
    isLoading,
    error,
    savePost,
    unsavePost,
    toggleSavedPost,
    findSavedPostId,
  };
}
