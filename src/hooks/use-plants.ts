import { useCallback } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Plant } from '@/src/lib/instant';

export function usePlants(): {
  plants: Plant[];
  isLoading: boolean;
  error: { message: string } | undefined;
  addPlant: (data: {
    name: string;
    strainType: string;
    environment: string;
  }) => void;
  updatePlant: (plantId: string, data: Partial<Plant>) => void;
  deletePlant: (plantId: string) => void;
} {
  const { profile } = useAuth();

  const { data, isLoading, error } = db.useQuery(
    profile ? { plants: { $: { where: { 'owner.id': profile.id } } } } : null
  );

  const addPlant = useCallback(
    (plantData: { name: string; strainType: string; environment: string }) => {
      if (!profile) return;
      const plantId = id();
      db.transact([
        db.tx.plants[plantId].update({
          name: plantData.name,
          strainType: plantData.strainType,
          environment: plantData.environment,
          day: 0,
          phase: 'Seedling',
          weeksLeft: 12,
          readyPercent: 0,
          createdAt: Date.now(),
        }),
        db.tx.plants[plantId].link({ owner: profile.id }),
      ]);
    },
    [profile]
  );

  const updatePlant = useCallback(
    (plantId: string, updates: Partial<Plant>) => {
      db.transact(db.tx.plants[plantId].update(updates));
    },
    []
  );

  const deletePlant = useCallback((plantId: string) => {
    db.transact(db.tx.plants[plantId].delete());
  }, []);

  return {
    plants: data?.plants ?? [],
    isLoading,
    error,
    addPlant,
    updatePlant,
    deletePlant,
  };
}
