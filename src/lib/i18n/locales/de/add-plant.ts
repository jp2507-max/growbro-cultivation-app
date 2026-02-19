const addPlant = {
  headerTitle: 'Pflanze hinzufügen',
  stepProgress: 'Schritt {{step}} von {{total}}',
  nextStep: 'Nächster Schritt',
  reviewSetup: 'Setup prüfen',
  startGrowing: 'Grow starten',
  done: 'Fertig',
  step1: {
    title: 'Identität & Details',
    subtitle: 'Starten wir mit den Grundlagen deiner neuen Pflanze.',
    plantName: 'Pflanzenname',
    plantNamePlaceholder: 'z. B. Northern Lights #1',
    strain: 'Sorte',
    strainPlaceholder: 'Sorte suchen...',
    strainSuggestions: 'Sorten-Vorschläge',
    strainType: 'Sortentyp',
    sourceType: 'Quelltyp',
    sourceSeed: 'Samen',
    sourceClone: 'Steckling',
    strainTypeOptions: {
      indica: 'Indica',
      sativa: 'Sativa',
      hybrid: 'Hybrid',
      ruderalis: 'Ruderalis',
      unknown: 'Unbekannt',
    },
  },
  step2: {
    title: 'Grow Setup\n& Medium 🪴',
    subtitle: 'Erzähle uns, wo deine Pflanze leben und wachsen wird.',
    environment: 'Umgebung',
    indoor: 'Indoor',
    outdoor: 'Outdoor',
    greenhouse: 'Gewächshaus',
    currentPhase: 'Aktuelle Phase',
    phase: {
      seedling: 'Sämling',
      vegetative: 'Vegetativ',
      flowering: 'Blüte',
      harvest: 'Ernte',
    },
    medium: 'Anbaumedium',
    mediumOptions: {
      soil: 'Erde',
      coco: 'Kokos',
      hydro: 'Hydro',
      other: 'Andere',
      soilless: 'Ohne Erde',
    },
    startDate: 'Startdatum',
    potSize: 'Topfgröße',
    containerUnits: {
      l: 'L',
      gal: 'GAL',
    },
    containerSizePlaceholder: '5',
  },
  step3: {
    title: 'Umgebung &\nLicht-Setup ☀️',
    subtitle: 'Konfiguriere Umgebung und Lichtplan.',
    lightType: 'Lichttyp',
    lightTypeOptions: {
      led: 'LED',
      hps: 'HPS',
      sun: 'Sonne',
    },
    lightSchedule: 'Lichtplan',
    lightScheduleOptions: {
      preset18_6: '18/6',
      preset12_12: '12/12',
      preset20_4: '20/4',
      veg: 'Veg',
      flower: 'Blüte',
      auto: 'Auto',
    },
    targets: 'Umgebungsziele',
    tempDay: 'Temp (Tag)',
    tempNight: 'Temp (Nacht)',
    humidity: 'Luftfeuchte',
    phRange: 'pH-Bereich',
  },
  step4: {
    title: 'Prüfen &\nAutomatisierung ⚡',
    subtitle: 'Richte den Zeitplan ein und ergänze finale Details.',
    autoCreateTasks: 'Tasks automatisch erstellen',
    autoCreateTasksHint: 'Tägliche To-dos automatisch generieren',
    wateringCadence: 'Gießrhythmus',
    feedingCadence: 'Düngerrhythmus',
    every: 'Alle',
    days: 'Tage',
    reminderTime: 'Erinnerungszeit',
    notes: 'Notizen (Optional)',
    notesPlaceholder: 'Details zu Erde, Töpfen usw. hinzufügen...',
    initialPhoto: 'Erstes Pflanzenfoto',
    photoHint: 'Foto hochladen oder aufnehmen',
    photoTake: 'Foto aufnehmen',
    photoLibrary: 'Aus Galerie wählen',
    removePhoto: 'Foto entfernen',
    photoPermissionDenied:
      'Foto-Berechtigung ist erforderlich, um ein Bild auszuwählen.',
    cameraPermissionDenied:
      'Kamera-Berechtigung ist erforderlich, um ein Foto aufzunehmen.',
    photoFailed:
      'Foto konnte nicht hinzugefügt werden. Bitte erneut versuchen.',
  },
  tasks: {
    water: {
      title: 'Pflanze gießen',
      subtitle: '{{medium}}-Routine',
    },
    feed: {
      title: 'Nährstoffe geben',
      subtitle: '{{phase}}-Rhythmus',
    },
    environment: {
      title: 'Umgebung prüfen',
      subtitle: '{{environment}}-Bedingungen',
    },
    log: {
      title: 'Foto & Grow-Log',
      subtitle: 'Wöchentliches Fortschritts-Update',
    },
  },
  success: {
    title: 'Pflanze hinzugefügt! 🎉',
    message:
      'Dein {{plantName}} ist jetzt sicher in deinem Garten. Mach dich bereit, beim Wachsen zuzusehen!',
    goToGarden: 'Zu meinem Garten 🌿',
    addAnotherPlant: 'Weitere Pflanze hinzufügen',
    defaultPlantName: 'Green Dream',
  },
  a11y: {
    closeSuccessLabel: 'Erfolgsansicht schließen',
    closeSuccessHint:
      'Schließt die Erfolgsansicht und bringt dich zurück zu deinem Garten',
    goToGardenSuccessHint: 'Navigiert zu deiner Gartenübersicht',
    addAnotherPlantSuccessLabel: 'Weitere Pflanze hinzufügen',
    addAnotherPlantSuccessHint:
      'Startet den Ablauf zum Hinzufügen einer weiteren Pflanze',
  },
  errors: {
    failedAddPlant:
      'Pflanze konnte nicht hinzugefügt werden. Bitte erneut versuchen.',
  },
} as const;

export default addPlant;
