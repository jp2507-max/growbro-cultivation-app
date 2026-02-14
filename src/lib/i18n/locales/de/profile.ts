const profile = {
  title: 'Profil',
  unknownGrower: 'Unbekannter Grower',
  levelGrower: 'LEVEL {{level}} GROWER',
  newGrower: 'NEUER GROWER',
  stats: {
    plants: 'Pflanzen',
    rating: 'Bewertung',
    active: 'Aktiv',
  },
  pastHarvests: 'Vergangene Ernten',
  seeAll: 'Alle anzeigen',
  settings: 'Einstellungen',
  pushNotifications: 'Push-Benachrichtigungen',
  units: 'Einheiten',
  accountPrivacy: 'Konto-Privatsphäre',
  signOut: 'Abmelden',
  signOutConfirm: 'Möchtest du dich wirklich abmelden?',
  failedSignOut: 'Abmeldung fehlgeschlagen. Bitte erneut versuchen.',
  testSentryError: 'Sentry-Fehler testen',
  sentrySuccess: 'Sentry-Fehler gesendet!',
  versionInfo: 'GrowBro v{{version}} (Build {{build}})',
} as const;

export default profile;
