import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/src/lib/utils';
import { View } from '@/src/tw';

type ScreenContainerProps = React.ComponentProps<typeof View> & {
  withTopInset?: boolean;
  withBottomInset?: boolean;
};

export function ScreenContainer({
  className,
  style,
  withTopInset = false,
  withBottomInset = false,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={cn('flex-1 bg-background dark:bg-dark-bg', className)}
      style={[
        withTopInset ? { paddingTop: insets.top } : null,
        withBottomInset ? { paddingBottom: insets.bottom } : null,
        style,
      ]}
      {...props}
    />
  );
}
