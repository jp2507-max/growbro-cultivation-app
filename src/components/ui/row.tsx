import React from 'react';

import { cn } from '@/src/lib/utils';
import { View } from '@/src/tw';

type RowProps = React.ComponentProps<typeof View>;

export function Row({ className, ...props }: RowProps) {
  return <View className={cn('flex-row items-center', className)} {...props} />;
}
