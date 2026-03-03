import * as Sentry from '@sentry/react-native';
import { useCallback } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { db, id, type Task } from '@/src/lib/instant';
import {
  recordApiLatencyMetric,
  recordTaskCompletionMetric,
} from '@/src/lib/observability/sentry-metrics';
import { computeDueAt, todayIsoDate } from '@/src/lib/task-engine/date-utils';

export type TaskUpdate = Partial<
  Pick<
    Task,
    | 'title'
    | 'subtitle'
    | 'completed'
    | 'time'
    | 'icon'
    | 'date'
    | 'status'
    | 'source'
    | 'dueAt'
    | 'dedupeKey'
    | 'metadataJson'
    | 'supersededByTaskId'
    | 'type'
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
      time?: string;
      icon?: string;
      date?: string;
    }) => {
      if (!profile) return;
      const startedAt = Date.now();
      const taskDate = taskData.date ?? new Date().toISOString().split('T')[0];
      const taskTime = taskData.time ?? '09:00';
      const taskId = id();
      const txns = [
        db.tx.tasks[taskId].update({
          title: taskData.title,
          subtitle: taskData.subtitle ?? '',
          completed: false,
          time: taskTime,
          icon: taskData.icon ?? '',
          date: taskDate,
          dueAt: computeDueAt(taskDate, taskTime),
          status: 'planned',
          source: 'manual',
          createdAt: Date.now(),
        }),
        db.tx.tasks[taskId].link({ owner: profile.id }),
      ];
      if (plantId) {
        txns.push(db.tx.tasks[taskId].link({ plant: plantId }));
      }
      return db
        .transact(txns)
        .then((result) => {
          recordApiLatencyMetric({
            endpoint: 'instant.tasks.add',
            durationMs: Date.now() - startedAt,
            statusCode: 200,
            method: 'TRANSACT',
          });

          return result;
        })
        .catch((e) => {
          recordApiLatencyMetric({
            endpoint: 'instant.tasks.add',
            durationMs: Date.now() - startedAt,
            statusCode: 500,
            method: 'TRANSACT',
          });
          Sentry.captureException(e);
          console.error('Failed to add task:', e);
          throw e;
        });
    },
    [profile, plantId]
  );

  const toggleTask = useCallback((taskId: string, completed: boolean) => {
    const startedAt = Date.now();
    const newCompleted = !completed;

    return db
      .transact(
        db.tx.tasks[taskId].update({
          completed: newCompleted,
          status: newCompleted ? 'completed' : 'planned',
        })
      )
      .then((result) => {
        recordApiLatencyMetric({
          endpoint: 'instant.tasks.toggle',
          durationMs: Date.now() - startedAt,
          statusCode: 200,
          method: 'TRANSACT',
        });

        if (!completed) {
          recordTaskCompletionMetric({ source: 'toggle' });
        }

        return result;
      })
      .catch((e) => {
        recordApiLatencyMetric({
          endpoint: 'instant.tasks.toggle',
          durationMs: Date.now() - startedAt,
          statusCode: 500,
          method: 'TRANSACT',
        });
        Sentry.captureException(e);
        console.error('Failed to toggle task:', e);
        throw e;
      });
  }, []);

  const updateTask = useCallback(
    (taskId: string, updates: TaskUpdate) => {
      const startedAt = Date.now();
      const hasDateOrTime =
        updates.date !== undefined || updates.time !== undefined;
      const task = data?.tasks?.find((t) => t.id === taskId);
      const resolvedDate = updates.date ?? task?.date ?? todayIsoDate();
      const resolvedTime = updates.time ?? task?.time ?? '09:00';
      const normalizedUpdates = hasDateOrTime
        ? { ...updates, dueAt: computeDueAt(resolvedDate, resolvedTime) }
        : updates;

      return db
        .transact(db.tx.tasks[taskId].update(normalizedUpdates))
        .then((result) => {
          recordApiLatencyMetric({
            endpoint: 'instant.tasks.update',
            durationMs: Date.now() - startedAt,
            statusCode: 200,
            method: 'TRANSACT',
          });

          return result;
        })
        .catch((e) => {
          recordApiLatencyMetric({
            endpoint: 'instant.tasks.update',
            durationMs: Date.now() - startedAt,
            statusCode: 500,
            method: 'TRANSACT',
          });
          Sentry.captureException(e);
          console.error('Failed to update task:', e);
          throw e;
        });
    },
    [data?.tasks]
  );

  const deleteTask = useCallback((taskId: string) => {
    const startedAt = Date.now();

    return db
      .transact(db.tx.tasks[taskId].delete())
      .then((result) => {
        recordApiLatencyMetric({
          endpoint: 'instant.tasks.delete',
          durationMs: Date.now() - startedAt,
          statusCode: 200,
          method: 'TRANSACT',
        });

        return result;
      })
      .catch((e) => {
        recordApiLatencyMetric({
          endpoint: 'instant.tasks.delete',
          durationMs: Date.now() - startedAt,
          statusCode: 500,
          method: 'TRANSACT',
        });
        Sentry.captureException(e);
        console.error('Failed to delete task:', e);
        throw e;
      });
  }, []);

  return {
    tasks: (data?.tasks ?? []).filter(
      (task) => task.status !== 'cancelled' && task.status !== 'superseded'
    ),
    isLoading,
    error,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
  };
}
