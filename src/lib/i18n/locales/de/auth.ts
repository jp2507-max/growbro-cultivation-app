const auth = {
  ageGate: {
    welcomeTitle: 'Willkommen bei GrowBro',
    welcomeSubtitle:
      'Diese App enthält Inhalte zum Cannabisanbau und ist nur für Erwachsene bestimmt.',
    question: 'Bist du 18 Jahre oder älter?',
    legalNotice:
      'Du musst in deinem Land volljährig sein, um diese App zu nutzen.',
    confirmButton: 'Ich bin 18+',
    denyButton: 'Ich bin unter 18',
    deniedTitle: 'Zugang verweigert',
    deniedMessage:
      'Du musst 18 Jahre oder älter sein, um GrowBro zu nutzen. Bitte komm zurück, wenn du die Altersanforderung erfüllst.',
    exitApp: 'App beenden',
  },
  welcome: {
    appName: 'GrowBro',
    tagline: 'Dein Begleiter für den Cannabisanbau',
    pitch: 'Verfolge deinen Grow, verwalte Zeitpläne und ernte wie ein Profi.',
    getStarted: "Los geht's",
    emailTitle: 'Wie lautet deine\nE-Mail?',
    emailSubtitle: 'Wir senden dir einen Magic Code zum Anmelden.',
    emailPlaceholder: 'E-Mail',
    sendCode: 'Code senden',
    codeTitle: 'Prüfe dein\nPostfach',
    codeSentTo: 'Gib den 6-stelligen Code ein, der an ',
    codePlaceholder: '000000',
    verify: 'Bestätigen',
    didntGetCode: 'Keinen Code erhalten?',
    resend: 'Erneut senden',
    nameTitle: 'Wie heißt\ndu?',
    nameSubtitle: 'So sehen dich andere Grower.',
    namePlaceholder: 'Anzeigename',
    errors: {
      enterEmail: 'Bitte gib deine E-Mail-Adresse ein.',
      failedSendCode: 'Code konnte nicht gesendet werden.',
      enterCode: 'Bitte gib den Code ein.',
      invalidCode: 'Ungültiger Code.',
      enterName: 'Bitte gib deinen Namen ein.',
      failedCreateProfile: 'Profil konnte nicht erstellt werden.',
    },
  },
  onboarding: {
    skip: 'Überspringen',
    continue: 'Weiter',
    letsGrow: "Los geht's!",
    pages: {
      track: {
        title: 'Verfolge deinen\nGarten',
        subtitle:
          'Überwache jede Wachstumsphase mit Echtzeit-Dashboards und smarten Metriken.',
        features: {
          lightTracking: 'Licht-Tracking',
          waterLogs: 'Bewässerungsprotokolle',
          growthStats: 'Wachstumsstatistiken',
        },
      },
      schedule: {
        title: 'Verpasse keine\nAufgabe',
        subtitle:
          'Smarte Planung passt sich der Phase deiner Pflanze an und sendet rechtzeitige Erinnerungen.',
        features: {
          autoTasks: 'Auto-Aufgaben',
          weeklyPlans: 'Wochenpläne',
          feedAlerts: 'Dünge-Alarme',
        },
      },
      diagnose: {
        title: 'KI-Pflanzen-\ndoktor',
        subtitle:
          'Mache ein Foto und erhalte sofort eine Diagnose mit KI-gestützten Behandlungsplänen.',
        features: {
          photoScan: 'Foto-Scan',
          healthCheck: 'Gesundheitscheck',
          quickFixes: 'Schnelle Lösungen',
        },
      },
      experience: {
        title: 'Dein Grow-\nLevel',
        subtitle:
          'Wir passen Anleitungen und Empfehlungen an deine Erfahrung an.',
        almostThere: 'Fast geschafft, {{firstName}}!',
        pickLevel: 'Wähle dein\nGrow-Level',
        shapesExperience: 'Das prägt dein gesamtes Erlebnis.',
      },
    },
    levels: {
      beginner: {
        label: 'Keimling',
        description: 'Erster Grow — führe mich durch alles.',
      },
      intermediate: {
        label: 'Vegetativ',
        description: 'Schon ein paar Mal gegrowt — ich will optimieren.',
      },
      expert: {
        label: 'Blüte',
        description: 'Erfahrener Grower — gib mir volle Kontrolle.',
      },
    },
    errors: {
      failedSavePreferences:
        'Einstellungen konnten nicht gespeichert werden. Bitte versuche es erneut.',
    },
  },
} as const;

export default auth;
