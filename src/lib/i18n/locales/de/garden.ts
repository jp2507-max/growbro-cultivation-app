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
  photo: {
    editTitle: 'Pflanzenfoto',
    editMessage: 'Füge ein Pflanzenfoto hinzu oder aktualisiere es',
    editHint:
      'Öffnet Optionen zum Aufnehmen oder Auswählen eines Pflanzenfotos',
    takePhoto: 'Foto aufnehmen',
    chooseLibrary: 'Aus Mediathek wählen',
    cameraPermissionDenied: 'Kamera-Berechtigung verweigert',
    libraryPermissionDenied: 'Mediathek-Berechtigung verweigert',
    updateFailed: 'Pflanzenfoto konnte nicht aktualisiert werden',
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
