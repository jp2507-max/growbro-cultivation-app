import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { TaskRow } from '@/src/components/ui/task-row';
import { type Task } from '@/src/lib/instant';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type TaskListProps = {
  tasks: Task[];
  onToggle: (taskId: string, completed: boolean) => void;
  className?: string;
  testID?: string;
};

export function TaskList({
  tasks,
  onToggle,
  className,
  testID,
}: TaskListProps): React.ReactElement {
  const { t } = useTranslation('garden');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={cn(className)} testID={testID}>
      <Text className="mb-3 px-1 text-lg font-bold text-text dark:text-text-primary-dark">
        {t('plantDetail.tasks')}
      </Text>
      {tasks.length === 0 ? (
        <Text className="px-1 text-base text-text-muted dark:text-text-muted-dark">
          {t('plantDetail.noPendingTasks')}
        </Text>
      ) : (
        <View className="gap-3">
          {tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              index={index}
              onToggle={onToggle}
              isDark={isDark}
            />
          ))}
        </View>
      )}
    </View>
  );
}
