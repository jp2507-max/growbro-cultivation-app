import { useMemo } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, type Strain } from '@/src/lib/instant';
import {
  applyStrainFilters,
  type StrainFilters,
} from '@/src/lib/strain-helpers';

const EMPTY_FILTERS: StrainFilters = {};

type FavoriteWithStrain = {
  createdAt?: number;
  strain?: Strain | null;
};

export function useFavoriteStrains(filters: StrainFilters = EMPTY_FILTERS): {
  strains: Strain[];
  isLoading: boolean;
  error: unknown;
} {
  const { profile } = useAuth();

  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          favorites: {
            strain: {},
            $: {
              where: {
                'owner.id': profile.id,
              },
            },
          },
        }
      : null
  );

  const strains = useMemo(() => {
    const favorites = (data?.favorites ?? []) as FavoriteWithStrain[];

    const sorted = favorites
      .filter((favorite) => !!favorite.strain?.id)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .map((favorite) => favorite.strain as Strain);

    return applyStrainFilters(sorted, filters);
  }, [data?.favorites, filters]);

  return {
    strains,
    isLoading,
    error,
  };
}
