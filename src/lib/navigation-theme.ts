import { type NativeStackNavigationOptions } from '@react-navigation/native-stack';

import Colors from '@/constants/colors';

export function getThemedStackOptions(
  isDark: boolean
): NativeStackNavigationOptions {
  return {
    headerTransparent: true,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: {
      backgroundColor: isDark ? Colors.darkBg : Colors.background,
    },
  };
}
