const TAB_ICON_CONFIG = {
  '(garden)': {
    sf: { default: 'leaf', selected: 'leaf.fill' },
    md: 'spa',
  },
  schedule: {
    sf: 'calendar',
    md: 'calendar_today',
  },
  scan: {
    sf: 'viewfinder',
    md: 'center_focus_weak',
  },
  strains: {
    sf: { default: 'book', selected: 'book.fill' },
    md: 'menu_book',
  },
  community: {
    sf: { default: 'person.2', selected: 'person.2.fill' },
    md: 'people',
  },
} as const;

export type TabRouteName = keyof typeof TAB_ICON_CONFIG;

export function getTabIcon(routeName: TabRouteName) {
  const config = TAB_ICON_CONFIG[routeName];
  return { sf: config.sf, md: config.md };
}
