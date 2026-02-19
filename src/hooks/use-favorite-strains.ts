import { useMemo } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, type Strain } from '@/src/lib/instant';
import { parseEffects, parseFlavors } from '@/src/lib/strain-helpers';

import type { StrainFilters } from './use-strains';

type FavoriteWithStrain = {
  createdAt?: number;
  strain?: Strain | null;
};

function applyStrainFilters(
  strains: Strain[],
  filters: StrainFilters
): Strain[] {
  return strains.filter((strain) => {
    if (
      filters.type &&
      filters.type !== 'All' &&
      strain.type !== filters.type
    ) {
      return false;
    }

    if (filters.search?.trim()) {
      const query = filters.search.toLowerCase();
      if (!strain.name.toLowerCase().includes(query)) return false;
    }

    if (filters.effects && filters.effects.length > 0) {
      const strainEffects = parseEffects(strain);
      const hasAll = filters.effects.every((effect) =>
        strainEffects.includes(effect)
      );
      if (!hasAll) return false;
    }

    if (filters.flavors && filters.flavors.length > 0) {
      const strainFlavors = parseFlavors(strain);
      const hasAll = filters.flavors.every((flavor) =>
        strainFlavors.includes(flavor)
      );
      if (!hasAll) return false;
    }

    if (filters.difficulty && strain.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.floweringType) {
      const isAuto = strain.isAutoflower;
      if (isAuto == null) return false;
      if (filters.floweringType === 'autoflower' && !isAuto) return false;
      if (filters.floweringType === 'photoperiod' && isAuto) return false;
    }

    return true;
  });
}

export function useFavoriteStrains(filters: StrainFilters = {}): {
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
