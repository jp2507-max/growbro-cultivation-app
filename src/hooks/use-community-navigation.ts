import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { ROUTES } from '@/src/lib/routes';

export type CommunityReportTargetType = 'post' | 'comment' | 'user';

export type UseCommunityNavigationReturn = {
  openComposer: () => void;
  openSaved: () => void;
  openComments: (postId: string) => void;
  openProfile: (profileId: string) => void;
  openReport: (targetType: CommunityReportTargetType, targetId: string) => void;
};

export function useCommunityNavigation(): UseCommunityNavigationReturn {
  const { push } = useRouter();

  const openComposer = useCallback(() => {
    push(ROUTES.COMMUNITY_CREATE_POST);
  }, [push]);

  const openSaved = useCallback(() => {
    push(ROUTES.COMMUNITY_SAVED);
  }, [push]);

  const openComments = useCallback(
    (postId: string) => {
      push({
        pathname: ROUTES.COMMUNITY_COMMENTS,
        params: { postId },
      });
    },
    [push]
  );

  const openProfile = useCallback(
    (profileId: string) => {
      push({
        pathname: ROUTES.COMMUNITY_PROFILE_PATHNAME,
        params: { id: profileId },
      });
    },
    [push]
  );

  const openReport = useCallback(
    (targetType: CommunityReportTargetType, targetId: string) => {
      push({
        pathname: ROUTES.COMMUNITY_REPORT,
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
