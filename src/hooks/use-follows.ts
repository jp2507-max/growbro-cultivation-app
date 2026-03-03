import { useCallback, useMemo } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';

type FollowRecord = {
  id: string;
  follower?: { id?: string } | null;
  followee?: { id?: string } | null;
};

export function useFollows(): {
  followingIds: Set<string>;
  followingRecords: FollowRecord[];
  followerRecords: FollowRecord[];
  isLoading: boolean;
  error: unknown;
  followUser: (targetProfileId: string) => Promise<void>;
  unfollowUser: (followId: string) => Promise<void>;
  findFollowingRecordId: (targetProfileId: string) => string | undefined;
  isFollowing: (targetProfileId: string) => boolean;
} {
  const { profile } = useAuth();

  const followingQuery = db.useQuery(
    profile
      ? {
          follows: {
            follower: {},
            followee: {},
            $: {
              where: {
                'follower.id': profile.id,
              },
            },
          },
        }
      : null
  );

  const followersQuery = db.useQuery(
    profile
      ? {
          follows: {
            follower: {},
            followee: {},
            $: {
              where: {
                'followee.id': profile.id,
              },
            },
          },
        }
      : null
  );

  const followingRecords = useMemo(() => {
    return (followingQuery.data?.follows ?? []) as FollowRecord[];
  }, [followingQuery.data?.follows]);

  const followerRecords = useMemo(() => {
    return (followersQuery.data?.follows ?? []) as FollowRecord[];
  }, [followersQuery.data?.follows]);

  const followingIds = useMemo(() => {
    const ids = new Set<string>();

    for (const follow of followingRecords) {
      const followeeId = follow.followee?.id;
      if (followeeId) ids.add(followeeId);
    }

    if (profile?.id) ids.delete(profile.id);

    return ids;
  }, [followingRecords, profile?.id]);

  const findFollowingRecordId = useCallback(
    (targetProfileId: string) => {
      return followingRecords.find(
        (follow) => follow.followee?.id === targetProfileId
      )?.id;
    },
    [followingRecords]
  );

  const followUser = useCallback(
    async (targetProfileId: string) => {
      if (!profile?.id) return;
      if (!targetProfileId || targetProfileId === profile.id) return;
      if (followingIds.has(targetProfileId)) return;

      const followId = id();
      await db.transact([
        db.tx.follows[followId].update({
          createdAt: Date.now(),
          uniqueKey: `${profile.id}_${targetProfileId}`,
        }),
        db.tx.follows[followId].link({ follower: profile.id }),
        db.tx.follows[followId].link({ followee: targetProfileId }),
      ]);
    },
    [followingIds, profile?.id]
  );

  const unfollowUser = useCallback(async (followId: string) => {
    await db.transact(db.tx.follows[followId].delete());
  }, []);

  const isFollowing = useCallback(
    (targetProfileId: string) => followingIds.has(targetProfileId),
    [followingIds]
  );

  return {
    followingIds,
    followingRecords,
    followerRecords,
    isLoading: followingQuery.isLoading || followersQuery.isLoading,
    error: followingQuery.error ?? followersQuery.error,
    followUser,
    unfollowUser,
    findFollowingRecordId,
    isFollowing,
  };
}
