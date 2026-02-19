const garden = {
  title: 'Mein Garten',
  noPlantsTitle: 'Noch keine Pflanzen',
  noPlantsSubtitle: 'Füge deine erste Pflanze hinzu!',
  unknownUser: 'Nutzer',
  addPlant: 'Pflanze hinzufügen',
  readyPercent: '{{percent}}% Bereit',
  dayCount: 'Tag {{day}}',
  phaseInfo: '{{phase}} • noch {{weeksLeft}} Wochen',
  metrics: {
    strainType: 'TYP',
    environment: 'SETUP',
    pending: 'OFFEN',
  },
  openTask: 'Aufgabe öffnen',
  openProfile: 'Profil öffnen',
  todaysTasks: 'Heutige Aufgaben',
  pendingCount: '{{count}} Ausstehend',
  noTasks: 'Keine Aufgaben für heute',
  harvestPlant: 'Pflanze ernten',
  logActivity: 'Aktivität erfassen',
  errors: {
    failedUpdateTask: 'Aufgabe konnte nicht aktualisiert werden',
    loadingPlants: 'Fehler beim Laden der Pflanzen',
    loadingTasks: 'Fehler beim Laden der Aufgaben',
  },
} as const;

export default garden;
