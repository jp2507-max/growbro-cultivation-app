const TAB_ICON_CONFIG = {
  '(garden)': {
    sf: { default: 'leaf', selected: 'leaf.fill' },
    androidMd: 'spa',
  },
  schedule: {
    sf: 'calendar',
    androidMd: 'calendar_today',
  },
  scan: {
    sf: 'viewfinder',
    androidMd: 'center_focus_weak',
  },
  strains: {
    sf: { default: 'book', selected: 'book.fill' },
    androidMd: 'menu_book',
  },
  community: {
    sf: { default: 'person.2', selected: 'person.2.fill' },
    androidMd: 'people',
  },
} as const;

export type TabRouteName = keyof typeof TAB_ICON_CONFIG;

export function getTabIcon<T extends TabRouteName>(
  routeName: T
): {
  sf: (typeof TAB_ICON_CONFIG)[T]['sf'];
  androidName: (typeof TAB_ICON_CONFIG)[T]['androidMd'];
} {
  const config = TAB_ICON_CONFIG[routeName];
  return {
    sf: config.sf,
    androidName: config.androidMd,
  };
}
