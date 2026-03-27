import { useColorScheme } from 'react-native';

import Colors from '@/constants/colors';

type ThemeColorToken =
  | 'background'
  | 'surface'
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'primary'
  | 'onPrimary'
  | 'danger';

const THEME_COLORS: Record<ThemeColorToken, { light: string; dark: string }> = {
  background: { light: Colors.background, dark: Colors.darkBg },
  surface: { light: Colors.card, dark: Colors.darkBgCard },
  text: { light: Colors.text, dark: Colors.textPrimaryDark },
  textSecondary: {
    light: Colors.textSecondary,
    dark: Colors.textSecondaryDark,
  },
  textMuted: { light: Colors.textMuted, dark: Colors.textMutedDark },
  primary: { light: Colors.primary, dark: Colors.primaryBright },
  onPrimary: { light: Colors.white, dark: Colors.darkBg },
  danger: { light: Colors.danger, dark: Colors.errorDark },
};

export function useThemeColor(token: ThemeColorToken): string {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark'
    ? THEME_COLORS[token].dark
    : THEME_COLORS[token].light;
}
