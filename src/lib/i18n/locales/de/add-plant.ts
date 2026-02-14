const addPlant = {
  stepOf: 'von {{total}}',
  stepProgress: 'Schritt {{step}} von {{total}}',
  step1: {
    title: 'Was baust du\nan?',
    subtitle: 'Beginnen wir mit den Grundlagen.',
    plantName: 'Pflanzenname',
    plantNameHint: 'Gib den Namen deiner Pflanze ein',
    plantNamePlaceholder: 'z.B. Northern Lights',
    strainType: 'Sortentyp',
    indica: {
      label: 'Indica',
      subtitle: 'ENTSPANNEND & RUHIG',
    },
    sativa: {
      label: 'Sativa',
      subtitle: 'ENERGISIEREND & FOKUS',
    },
    hybrid: {
      label: 'Hybrid',
      subtitle: 'AUSGEWOGENE MISCHUNG',
    },
  },
  step2: {
    title: 'Anbau-\numgebung',
    subtitle: 'Wo wird diese Pflanze leben?',
    indoor: 'Indoor',
    indoorDesc:
      'Growzelt, Schrank oder Raum mit kontrollierter Beleuchtung und Klima.',
    outdoor: 'Outdoor',
    outdoorDesc: 'Garten, Balkon oder Gewächshaus mit natürlichem Sonnenlicht.',
  },
  step3: {
    title: 'Bereit zum\nGrow!',
    subtitle: 'Hier ist eine Zusammenfassung deiner neuen Pflanze.',
    name: 'Name',
    strain: 'Sorte',
    environment: 'Umgebung',
  },
  nextStep: 'Nächster Schritt',
  startGrowing: 'Grow starten',
  success: {
    title: 'Es ist ein Grow!',
    message: 'Deine Aufgaben für die nächste Woche wurden generiert.',
    goToGarden: 'Zum Garten',
  },
  errors: {
    failedAddPlant:
      'Pflanze konnte nicht hinzugefügt werden. Bitte erneut versuchen.',
  },
} as const;

export default addPlant;
