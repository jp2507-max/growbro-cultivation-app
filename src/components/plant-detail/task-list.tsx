import { Check, Circle } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { type Task } from '@/src/lib/instant';
import { cn } from '@/src/lib/utils';
import { Pressable, Text, View } from '@/src/tw';

type TaskListProps = {
  tasks: Task[];
  onToggle: (taskId: string, completed: boolean) => void;
  className?: string;
  testID?: string;
};

function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
}): React.ReactElement {
  const handlePress = useCallback(() => {
    onToggle(task.id, task.completed);
  }, [task.id, task.completed, onToggle]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.completed }}
      accessibilityLabel={task.title}
      className="flex-row items-center gap-3"
      onPress={handlePress}
      testID={`task-row-${task.id}`}
    >
      {task.completed ? (
        <View className="size-6 items-center justify-center rounded-md bg-primary dark:bg-primary-bright">
          <Check size={14} color="#fff" strokeWidth={3} />
        </View>
      ) : (
        <View className="size-6 items-center justify-center">
          <Circle size={22} color={Colors.textMuted} />
        </View>
      )}
      <Text
        className={cn(
          'text-sm font-medium text-text dark:text-text-primary-dark',
          task.completed &&
            'text-text-muted line-through dark:text-text-muted-dark'
        )}
      >
        {task.title}
      </Text>
    </Pressable>
  );
}

export function TaskList({
  tasks,
  onToggle,
  className,
  testID,
}: TaskListProps): React.ReactElement {
  const { t } = useTranslation('garden');

  return (
    <View
      className={cn(
        'rounded-xl bg-white p-5 shadow-sm dark:bg-dark-bg-elevated',
        className
      )}
      testID={testID}
    >
      <Text className="mb-4 text-lg font-bold text-text dark:text-text-primary-dark">
        {t('plantDetail.tasks')}
      </Text>
      {tasks.length === 0 ? (
        <Text className="text-sm text-text-muted dark:text-text-muted-dark">
          {t('plantDetail.noPendingTasks')}
        </Text>
      ) : (
        <View className="gap-3">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </View>
      )}
    </View>
  );
}
