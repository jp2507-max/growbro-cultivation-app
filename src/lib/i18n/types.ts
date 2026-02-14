import type { defaultNS, resources } from './index';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
    returnNull: false;
  }
}

// Re-export for convenience — useful for typed helpers if needed later
export type AppResources = (typeof resources)['en'];
export type AppNamespaces = keyof AppResources;
