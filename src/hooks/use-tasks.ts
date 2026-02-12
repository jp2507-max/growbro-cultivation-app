import { useCallback } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Task } from '@/src/lib/instant';

export type TaskUpdate = Partial<
  Pick<
    Task,
    'title' | 'subtitle' | 'dueTime' | 'completed' | 'time' | 'icon' | 'date'
  >
>;

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
          icon: taskData.icon ?? '',
          date: taskData.date ?? new Date().toISOString().split('T')[0],
          createdAt: Date.now(),
        }),
        db.tx.tasks[taskId].link({ owner: profile.id }),
      ];
      if (plantId) {
        txns.push(db.tx.tasks[taskId].link({ plant: plantId }));
      }
      return db.transact(txns).catch((e) => {
        console.error('Failed to add task:', e);
        throw e;
      });
    },
    [profile, plantId]
  );

  const toggleTask = useCallback((taskId: string, completed: boolean) => {
    return db
      .transact(
        db.tx.tasks[taskId].update({
          completed: !completed,
        })
      )
      .catch((e) => {
        console.error('Failed to toggle task:', e);
        throw e;
      });
  }, []);

  const updateTask = useCallback((taskId: string, updates: TaskUpdate) => {
    return db.transact(db.tx.tasks[taskId].update(updates)).catch((e) => {
      console.error('Failed to update task:', e);
      throw e;
    });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    return db.transact(db.tx.tasks[taskId].delete()).catch((e) => {
      console.error('Failed to delete task:', e);
      throw e;
    });
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
