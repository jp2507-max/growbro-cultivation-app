/** Type-safe route constants for use with router.push / router.replace. */
export const ROUTES = {
  GARDEN: '/',
  COMMUNITY: '/community',
  COMMUNITY_CREATE_POST: '/community/create-post',
  SCAN: '/scan',
  SCHEDULE: '/schedule',
  STRAINS: '/strains',
  ADD_PLANT: '/add-plant',
  AI_DIAGNOSIS: '/ai-diagnosis',
  AGE_GATE: '/age-gate',
  HARVEST: '/harvest',
  ONBOARDING: '/onboarding',
  PROFILE: '/profile',
  STRAIN_DETAIL: '/strain-detail',
  STRAIN_FILTERS: '/strain-filters',
  TASK_DETAIL: '/task-detail',
  WELCOME: '/welcome',
} as const;
