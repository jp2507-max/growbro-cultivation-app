import { type NativeStackNavigationOptions } from '@react-navigation/native-stack';

import Colors from '@/constants/colors';

type FormSheetPreset = Readonly<NativeStackNavigationOptions>;

function getBaseFormSheetOptions(isDark: boolean): FormSheetPreset {
  const isIOS = process.env.EXPO_OS === 'ios';

  return {
    presentation: 'formSheet',
    headerShown: false,
    sheetGrabberVisible: true,
    sheetCornerRadius: 28,
    ...(isIOS
      ? {
          headerTransparent: true,
          contentStyle: { backgroundColor: 'transparent' },
        }
      : {
          contentStyle: {
            backgroundColor: isDark ? Colors.darkBg : Colors.background,
          },
        }),
  };
}

export function getFormSheetPresets(isDark: boolean): {
  wizardSheet: FormSheetPreset;
  filtersSheet: FormSheetPreset;
  editorSheet: FormSheetPreset;
  successSheet: FormSheetPreset;
} {
  const baseOptions = getBaseFormSheetOptions(isDark);

  return {
    wizardSheet: {
      ...baseOptions,
      sheetAllowedDetents: [0.85, 1.0],
      sheetInitialDetentIndex: 0,
    },
    filtersSheet: {
      ...baseOptions,
      headerShown: true,
      headerTransparent: false,
      ...(process.env.EXPO_OS === 'ios'
        ? {
            contentStyle: {
              backgroundColor: isDark ? Colors.darkBg : Colors.background,
            },
            sheetAllowedDetents: [0.82, 0.95],
            sheetInitialDetentIndex: 0,
          }
        : {
            contentStyle: {
              backgroundColor: isDark ? Colors.darkBg : Colors.background,
            },
            sheetAllowedDetents: [0.75, 0.95],
            sheetInitialDetentIndex: 0,
          }),
    },
    editorSheet: {
      ...baseOptions,
      sheetAllowedDetents: [0.75, 1.0],
      sheetInitialDetentIndex: 0,
    },
    successSheet: {
      ...baseOptions,
      sheetAllowedDetents: [0.45, 0.62],
      sheetInitialDetentIndex: 0,
      sheetLargestUndimmedDetentIndex: 'last',
    },
  };
}
