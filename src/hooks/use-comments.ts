import { useCallback, useMemo } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { type Comment, db, id } from '@/src/lib/instant';
import { normalizeWhitespace } from '@/src/lib/text-sanitization';

type CommentItem = Comment & {
  replies?: (Comment & { author?: { id?: string } | null })[];
};

export function useComments(postId: string | undefined): {
  comments: CommentItem[];
  topLevelComments: CommentItem[];
  repliesByParentId: Map<string, CommentItem[]>;
  isLoading: boolean;
  error: unknown;
  addComment: (body: string, parentCommentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
} {
  const { profile } = useAuth();

  const { data, isLoading, error } = db.useQuery(
    postId
      ? {
          comments: {
            author: {},
            parent: {
              author: {},
            },
            replies: {
              author: {},
            },
            $: {
              where: {
                'post.id': postId,
              },
              order: { serverCreatedAt: 'asc' },
            },
          },
        }
      : null
  );

  const comments = useMemo(() => {
    return (data?.comments ?? []) as CommentItem[];
  }, [data?.comments]);

  const repliesByParentId = useMemo(() => {
    const map = new Map<string, CommentItem[]>();

    for (const comment of comments) {
      const parentId = comment.parentCommentId || comment.parent?.id;
      if (!parentId) continue;

      const existing = map.get(parentId);
      if (existing) {
        existing.push(comment);
        continue;
      }

      map.set(parentId, [comment]);
    }

    return map;
  }, [comments]);

  const topLevelComments = useMemo(() => {
    const commentIds = new Set(comments.map((comment) => comment.id));

    return comments.filter((comment) => {
      const parentId = comment.parent?.id ?? comment.parentCommentId;
      if (!parentId) return true;
      return !commentIds.has(parentId);
    });
  }, [comments]);

  const addComment = useCallback(
    async (body: string, parentCommentId?: string) => {
      if (!profile?.id || !postId) return;

      const commentBody = normalizeWhitespace(body);
      if (!commentBody) return;

      const commentId = id();
      const basePayload = {
        body: commentBody,
        createdAt: Date.now(),
      };

      const updatePayload = parentCommentId
        ? { ...basePayload, parentCommentId }
        : basePayload;

      const tx = [
        db.tx.comments[commentId].update(updatePayload),
        db.tx.comments[commentId].link({ author: profile.id }),
        db.tx.comments[commentId].link({ post: postId }),
      ];

      if (parentCommentId) {
        tx.push(db.tx.comments[commentId].link({ parent: parentCommentId }));
      }

      await db.transact(tx);
    },
    [postId, profile?.id]
  );

  const deleteComment = useCallback(async (commentId: string) => {
    await db.transact(db.tx.comments[commentId].delete());
  }, []);

  return {
    comments,
    topLevelComments,
    repliesByParentId,
    isLoading,
    error,
    addComment,
    deleteComment,
  };
}
