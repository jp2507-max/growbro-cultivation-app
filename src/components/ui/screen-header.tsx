import React from 'react';

import { BackButton, BackButtonSpacer } from '@/src/components/ui/back-button';
import { cn } from '@/src/lib/utils';
import { Text, View } from '@/src/tw';

type ScreenHeaderProps = {
  title: string;
  rightAction?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  testID?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  backTestID?: string;
};

export function ScreenHeader({
  title,
  rightAction,
  className,
  titleClassName,
  testID,
  showBack = true,
  onBackPress,
  backTestID,
}: ScreenHeaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-4 py-2.5',
        className
      )}
      testID={testID}
    >
      {showBack ? (
        <BackButton onPress={onBackPress} testID={backTestID} />
      ) : (
        <BackButtonSpacer />
      )}
      <Text
        className={cn(
          'text-text dark:text-text-primary-dark text-[17px] font-bold',
          titleClassName
        )}
      >
        {title}
      </Text>
      {rightAction ?? <BackButtonSpacer />}
    </View>
  );
}
