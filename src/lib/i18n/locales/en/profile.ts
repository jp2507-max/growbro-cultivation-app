const profile = {
  title: 'Profile',
  unknownGrower: 'Unknown Grower',
  levelGrower: 'LEVEL {{level}} GROWER',
  newGrower: 'NEW GROWER',
  stats: {
    plants: 'Plants',
    rating: 'Rating',
    active: 'Active',
  },
  pastHarvests: 'Past Harvests',
  seeAll: 'See All',
  profileOptions: 'Profile Options',
  editProfile: 'Edit Profile',
  shareProfile: 'Share Profile',
  settings: 'Settings',
  pushNotifications: 'Push Notifications',
  units: 'Units',
  accountPrivacy: 'Account Privacy',
  signOut: 'Sign Out',
  signOutConfirm: 'Are you sure you want to sign out?',
  failedSignOut: 'Failed to sign out. Please try again.',
  testSentryError: 'Test Sentry Error',
  sentrySuccess: 'Sentry error sent!',
  versionInfo: 'GrowBro v{{version}} (Build {{build}})',
} as const;

export default profile;
