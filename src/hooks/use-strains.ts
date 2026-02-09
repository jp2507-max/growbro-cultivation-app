import { useCallback } from 'react';

import { db, id } from '@/src/lib/instant';

export function useStrains(filter?: string) {
  const { data, isLoading, error } = db.useQuery({ strains: {} });

  const allStrains = data?.strains ?? [];
  const strains =
    filter && filter !== 'All'
      ? allStrains.filter((s) => s.type === filter)
      : allStrains;

  const addStrain = useCallback(
    (strainData: {
      name: string;
      type: string;
      thc?: number;
      trait?: string;
      imageUrl?: string;
    }) => {
      const strainId = id();
      db.transact(
        db.tx.strains[strainId].update({
          name: strainData.name,
          type: strainData.type,
          thc: strainData.thc ?? 0,
          trait: strainData.trait ?? '',
          imageUrl: strainData.imageUrl ?? '',
          createdBy: 'user',
        })
      );
    },
    []
  );

  return {
    strains,
    isLoading,
    error,
    addStrain,
  };
}
