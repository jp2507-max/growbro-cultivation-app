import { useCallback, useMemo } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';
import {
  applyStrainFilters,
  type StrainFilters,
} from '@/src/lib/strain-helpers';

const EMPTY_FILTERS: StrainFilters = {};

export function useStrains(filters: StrainFilters = EMPTY_FILTERS) {
  const { profile } = useAuth();

  // Fetch authenticated user's created strains via profile link.
  // This avoids an expensive top-level strains where-clause.
  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          profiles: {
            $: {
              where: {
                id: profile.id,
              },
            },
            createdStrains: {},
          },
        }
      : null
  );

  // Fetch global admin-seeded strains using an indexed where-clause.
  const {
    data: globalData,
    isLoading: globalLoading,
    error: globalError,
  } = db.useQuery({
    strains: {
      $: {
        where: {
          isAdminSeeded: true,
        },
      },
    },
  });

  const strains = useMemo(() => {
    const globalStrains = globalData?.strains ?? [];
    const ownStrains = data?.profiles?.[0]?.createdStrains ?? [];
    const merged = [...globalStrains, ...ownStrains];

    // Deduplicate by id
    const seen = new Map<string, (typeof merged)[number]>();
    for (const s of merged) {
      if (!seen.has(s.id)) seen.set(s.id, s);
    }
    const allStrains = Array.from(seen.values());

    return applyStrainFilters(allStrains, filters);
  }, [globalData?.strains, data?.profiles, filters]);

  const addStrain = useCallback(
    async (strainData: {
      name: string;
      type: string;
      thc?: number;
      trait?: string;
      imageUrl?: string;
    }) => {
      if (!profile) return Promise.reject(new Error('No profile'));
      const strainId = id();
      try {
        await db.transact([
          db.tx.strains[strainId].update({
            name: strainData.name,
            type: strainData.type,
            thc: strainData.thc ?? 0,
            trait: strainData.trait ?? '',
            imageUrl: strainData.imageUrl ?? '',
            isAdminSeeded: false,
          }),
          db.tx.strains[strainId].link({ creator: profile.id }),
        ]);
      } catch (e) {
        console.error('Failed to add strain:', e);
        throw e;
      }
    },
    [profile]
  );

  return {
    strains,
    isLoading: isLoading || globalLoading,
    error: error || globalError,
    addStrain,
  };
}
