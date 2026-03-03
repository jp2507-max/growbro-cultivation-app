import { type usePosts } from '@/src/hooks/use-posts';

export type CommunityFeedPost = ReturnType<typeof usePosts>['posts'][number];
