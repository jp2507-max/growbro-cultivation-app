import { useMemo } from 'react';

import { type usePosts } from '@/src/hooks/use-posts';

export const COMMUNITY_TYPE_FILTER_KEYS = ['all', 'showcase', 'help'] as const;

export type CommunityTypeFilterKey =
  (typeof COMMUNITY_TYPE_FILTER_KEYS)[number];
export type CommunitySortKey = 'newest' | 'trending';
export type CommunityFeedPost = ReturnType<typeof usePosts>['posts'][number];

type UseCommunityFeedFilterParams = {
  posts: CommunityFeedPost[];
  blockedUserIds: Set<string>;
  activeType: CommunityTypeFilterKey;
  activeSort: CommunitySortKey;
  debouncedSearchQuery: string;
};

export function useCommunityFeedFilter({
  posts,
  blockedUserIds,
  activeType,
  activeSort,
  debouncedSearchQuery,
}: UseCommunityFeedFilterParams): CommunityFeedPost[] {
  const moderationFilteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const authorId = post.author?.id;
      if (!authorId) return true;
      return !blockedUserIds.has(authorId);
    });
  }, [blockedUserIds, posts]);

  const typeFilteredPosts = useMemo(() => {
    return moderationFilteredPosts.filter((post) => {
      if (activeType === 'all') return true;

      const postType = post.type === 'help' ? 'help' : 'showcase';
      return postType === activeType;
    });
  }, [activeType, moderationFilteredPosts]);

  const sortedPosts = useMemo(() => {
    if (activeSort === 'trending') {
      return [...typeFilteredPosts].sort(
        (a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0)
      );
    }

    return [...typeFilteredPosts].sort((a, b) => b.createdAt - a.createdAt);
  }, [activeSort, typeFilteredPosts]);

  return useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return sortedPosts;

    return sortedPosts.filter((post) => {
      const author = post.author?.displayName?.toLowerCase() ?? '';
      const caption = post.caption?.toLowerCase() ?? '';
      const hashtags = post.hashtags?.toLowerCase() ?? '';
      const label = post.label?.toLowerCase() ?? '';

      return (
        author.includes(query) ||
        caption.includes(query) ||
        hashtags.includes(query) ||
        label.includes(query)
      );
    });
  }, [debouncedSearchQuery, sortedPosts]);
}
