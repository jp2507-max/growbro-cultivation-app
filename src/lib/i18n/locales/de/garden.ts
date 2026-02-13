const garden = {
  noPlantsTitle: 'Noch keine Pflanzen',
  noPlantsSubtitle: 'Füge deine erste Pflanze hinzu!',
  addPlant: 'Pflanze hinzufügen',
  readyPercent: '{{percent}}% Bereit',
  dayCount: 'Tag {{day}}',
  phaseInfo: '{{phase}} • noch {{weeksLeft}} Wochen',
  metrics: {
    temp: 'TEMP',
    humidity: 'FEUCHTE',
    ph: 'PH',
  },
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
