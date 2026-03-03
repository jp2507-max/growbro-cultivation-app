import { useCallback, useMemo } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';

type BlockRecord = {
  id: string;
  blocker?: { id?: string } | null;
  blocked?: { id?: string } | null;
};

export function useBlocks(): {
  blockedUserIds: Set<string>;
  outgoingBlocks: BlockRecord[];
  incomingBlocks: BlockRecord[];
  isLoading: boolean;
  error: unknown;
  blockUser: (targetProfileId: string) => Promise<void>;
  unblockUser: (blockId: string) => Promise<void>;
  findOutgoingBlockId: (targetProfileId: string) => string | undefined;
  isBlocked: (targetProfileId: string) => boolean;
} {
  const { profile } = useAuth();

  const outgoingQuery = db.useQuery(
    profile
      ? {
          blocks: {
            blocker: {},
            blocked: {},
            $: {
              where: {
                'blocker.id': profile.id,
              },
            },
          },
        }
      : null
  );

  const incomingQuery = db.useQuery(
    profile
      ? {
          blocks: {
            blocker: {},
            blocked: {},
            $: {
              where: {
                'blocked.id': profile.id,
              },
            },
          },
        }
      : null
  );

  const outgoingBlocks = useMemo(() => {
    return (outgoingQuery.data?.blocks ?? []) as BlockRecord[];
  }, [outgoingQuery.data?.blocks]);

  const incomingBlocks = useMemo(() => {
    return (incomingQuery.data?.blocks ?? []) as BlockRecord[];
  }, [incomingQuery.data?.blocks]);

  const blockedUserIds = useMemo(() => {
    const blockedIds = new Set<string>();

    for (const record of outgoingBlocks) {
      const blockedId = record.blocked?.id;
      if (blockedId) blockedIds.add(blockedId);
    }

    for (const record of incomingBlocks) {
      const blockerId = record.blocker?.id;
      if (blockerId) blockedIds.add(blockerId);
    }

    if (profile?.id) blockedIds.delete(profile.id);

    return blockedIds;
  }, [incomingBlocks, outgoingBlocks, profile?.id]);

  const findOutgoingBlockId = useCallback(
    (targetProfileId: string) => {
      return outgoingBlocks.find((item) => item.blocked?.id === targetProfileId)
        ?.id;
    },
    [outgoingBlocks]
  );

  const blockUser = useCallback(
    async (targetProfileId: string) => {
      if (!profile?.id) return;
      if (!targetProfileId || targetProfileId === profile.id) return;
      if (
        outgoingBlocks.some((record) => record.blocked?.id === targetProfileId)
      ) {
        return;
      }

      const blockId = id();
      await db.transact([
        db.tx.blocks[blockId].update({
          createdAt: Date.now(),
          uniqueKey: `${profile.id}_${targetProfileId}`,
        }),
        db.tx.blocks[blockId].link({ blocker: profile.id }),
        db.tx.blocks[blockId].link({ blocked: targetProfileId }),
      ]);
    },
    [outgoingBlocks, profile?.id]
  );

  const unblockUser = useCallback(async (blockId: string) => {
    await db.transact(db.tx.blocks[blockId].delete());
  }, []);

  const isBlocked = useCallback(
    (targetProfileId: string) => blockedUserIds.has(targetProfileId),
    [blockedUserIds]
  );

  return {
    blockedUserIds,
    outgoingBlocks,
    incomingBlocks,
    isLoading: outgoingQuery.isLoading || incomingQuery.isLoading,
    error: outgoingQuery.error ?? incomingQuery.error,
    blockUser,
    unblockUser,
    findOutgoingBlockId,
    isBlocked,
  };
}
