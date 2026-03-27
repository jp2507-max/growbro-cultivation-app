import { useCallback } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Note } from '@/src/lib/instant';

type AddNoteInput = {
  plantId: string;
  body: string;
  category: string;
  date: string;
};

export function useNotes(plantId?: string): {
  notes: Note[];
  isLoading: boolean;
  error: { message: string } | undefined;
  addNote: (data: AddNoteInput) => Promise<unknown>;
  deleteNote: (noteId: string) => Promise<unknown>;
} {
  const { profile } = useAuth();

  const { data, isLoading, error } = db.useQuery(
    profile && plantId
      ? {
          notes: {
            $: {
              where: {
                'owner.id': profile.id,
                'plant.id': plantId,
              },
              order: {
                serverCreatedAt: 'desc' as const,
              },
            },
          },
        }
      : null
  );

  const addNote = useCallback(
    (noteData: AddNoteInput) => {
      if (!profile) return Promise.reject(new Error('No profile'));

      const noteId = id();
      return db.transact([
        db.tx.notes[noteId].update({
          body: noteData.body,
          category: noteData.category,
          date: noteData.date,
          createdAt: Date.now(),
        }),
        db.tx.notes[noteId].link({ owner: profile.id }),
        db.tx.notes[noteId].link({ plant: noteData.plantId }),
      ]);
    },
    [profile]
  );

  const deleteNote = useCallback((noteId: string) => {
    return db.transact(db.tx.notes[noteId].delete());
  }, []);

  return {
    notes: data?.notes ?? [],
    isLoading,
    error,
    addNote,
    deleteNote,
  };
}
