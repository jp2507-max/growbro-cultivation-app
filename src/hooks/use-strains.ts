import { useCallback, useMemo } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id } from '@/src/lib/instant';
import { parseEffects } from '@/src/lib/strain-helpers';

export type StrainFilters = {
  type?: string; // 'All' | 'Indica' | 'Sativa' | 'Hybrid'
  search?: string;
  effects?: string[]; // e.g. ['Relaxed', 'Happy']
  difficulty?: string; // 'Easy' | 'Medium' | 'Difficult'
};

export function useStrains(filters: StrainFilters = {}) {
  const { profile } = useAuth();

  // Fetch user-created strains (if authenticated)
  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          strains: {
            $: {
              where: {
                'creator.id': profile.id,
              },
            },
          },
        }
      : null
  );

  // Fetch global admin-seeded strains
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
    const merged = [...(globalData?.strains ?? []), ...(data?.strains ?? [])];

    // Deduplicate by id
    const seen = new Map<string, (typeof merged)[number]>();
    for (const s of merged) {
      if (!seen.has(s.id)) seen.set(s.id, s);
    }
    const allStrains = Array.from(seen.values());

    return allStrains.filter((s) => {
      // Type filter
      if (filters.type && filters.type !== 'All' && s.type !== filters.type) {
        return false;
      }

      // Search filter
      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase();
        if (!s.name.toLowerCase().includes(q)) return false;
      }

      // Effects filter — strain must have ALL selected effects
      if (filters.effects && filters.effects.length > 0) {
        const strainEffects = parseEffects(s);
        const hasAll = filters.effects.every((e) => strainEffects.includes(e));
        if (!hasAll) return false;
      }

      // Difficulty filter
      if (filters.difficulty && s.difficulty !== filters.difficulty) {
        return false;
      }

      return true;
    });
  }, [
    globalData?.strains,
    data?.strains,
    filters.type,
    filters.search,
    filters.effects,
    filters.difficulty,
  ]);

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
