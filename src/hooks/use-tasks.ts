import { useCallback } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Task } from '@/src/lib/instant';

export function useTasks(plantId?: string) {
  const { profile } = useAuth();

  const { data, isLoading, error } = db.useQuery(
    profile
      ? {
          tasks: {
            $: {
              where: {
                'owner.id': profile.id,
                ...(plantId ? { 'plant.id': plantId } : {}),
              },
            },
          },
        }
      : null
  );

  const addTask = useCallback(
    (taskData: {
      title: string;
      subtitle?: string;
      dueTime?: string;
      time?: string;
      status?: string;
      icon?: string;
      date?: string;
    }) => {
      if (!profile) return;
      const taskId = id();
      const txns = [
        db.tx.tasks[taskId].update({
          title: taskData.title,
          subtitle: taskData.subtitle ?? '',
          dueTime: taskData.dueTime ?? '',
          completed: false,
          time: taskData.time ?? '',
          status: taskData.status ?? 'upcoming',
          icon: taskData.icon ?? '',
          date: taskData.date ?? new Date().toISOString().split('T')[0],
          createdAt: Date.now(),
        }),
        db.tx.tasks[taskId].link({ owner: profile.id }),
      ];
      if (plantId) {
        txns.push(db.tx.tasks[taskId].link({ plant: plantId }));
      }
      db.transact(txns);
    },
    [profile, plantId]
  );

  const toggleTask = useCallback((taskId: string, completed: boolean) => {
    db.transact(
      db.tx.tasks[taskId].update({
        completed: !completed,
        status: !completed ? 'completed' : 'upcoming',
      })
    );
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    db.transact(db.tx.tasks[taskId].update(updates));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    db.transact(db.tx.tasks[taskId].delete());
  }, []);

  return {
    tasks: data?.tasks ?? [],
    isLoading,
    error,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
  };
}
