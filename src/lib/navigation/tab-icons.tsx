const TAB_ICON_CONFIG = {
  '(garden)': {
    sf: { default: 'leaf', selected: 'leaf.fill' },
    androidSrc: 'spa',
  },
  schedule: {
    sf: 'calendar',
    androidSrc: 'calendar-today',
  },
  scan: {
    sf: 'viewfinder',
    androidSrc: 'center-focus-weak',
  },
  strains: {
    sf: { default: 'book', selected: 'book.fill' },
    androidSrc: 'menu-book',
  },
  community: {
    sf: { default: 'person.2', selected: 'person.2.fill' },
    androidSrc: 'people',
  },
} as const;

export type TabRouteName = keyof typeof TAB_ICON_CONFIG;

export function getTabIcon<T extends TabRouteName>(
  routeName: T
): {
  sf: (typeof TAB_ICON_CONFIG)[T]['sf'];
  androidName: (typeof TAB_ICON_CONFIG)[T]['androidSrc'];
} {
  const config = TAB_ICON_CONFIG[routeName];
  return {
    sf: config.sf,
    androidName: config.androidSrc,
  };
}
