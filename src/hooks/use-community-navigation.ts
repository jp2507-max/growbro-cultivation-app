import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export type CommunityReportTargetType = 'post' | 'comment' | 'user';

export function useCommunityNavigation() {
  const { push } = useRouter();

  const openComposer = useCallback(() => {
    push('./create-post');
  }, [push]);

  const openSaved = useCallback(() => {
    push('./saved');
  }, [push]);

  const openComments = useCallback(
    (postId: string) => {
      push({
        pathname: './comments',
        params: { postId },
      });
    },
    [push]
  );

  const openProfile = useCallback(
    (profileId: string) => {
      push({
        pathname: './profile/[id]',
        params: { id: profileId },
      });
    },
    [push]
  );

  const openReport = useCallback(
    (targetType: CommunityReportTargetType, targetId: string) => {
      push({
        pathname: './report',
        params: { targetType, targetId },
      });
    },
    [push]
  );

  return {
    openComposer,
    openSaved,
    openComments,
    openProfile,
    openReport,
  };
}
