import type { LucideIcon } from 'lucide-react-native';
import React from 'react';

import { Text, View } from '@/src/tw';

type StrainDetailPillProps = {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
};

export function StrainDetailPill({
  label,
  icon: Icon,
  iconColor,
  bgColor,
  borderColor,
  textColor,
}: StrainDetailPillProps): React.ReactElement {
  return (
    <View
      className="flex-row items-center gap-2 rounded-full border px-5 py-3"
      style={{
        backgroundColor: bgColor,
        borderColor,
      }}
    >
      {Icon ? <Icon size={16} color={iconColor ?? textColor} /> : null}
      <Text className="text-base font-semibold" style={{ color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
