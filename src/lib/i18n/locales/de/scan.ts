const scan = {
  subtitle: 'Pflanzengesundheit sofort diagnostizieren',
  analyzing: 'Pflanze wird analysiert...',
  pointCamera: 'Richte die Kamera auf deine Pflanze',
  clearPhoto: 'Mache ein klares Foto der Blätter für beste Ergebnisse',
  tips: {
    focusLeaves: 'Blätter fokussieren',
    goodLighting: 'Gute Beleuchtung',
    closeUp: 'Nahaufnahme',
  },
  demoScans: 'Demo-Scans',
  scanHealthy: 'Scan — Gesundes Ergebnis',
  scanIssue: 'Scan — Problem erkannt',
  diagnosis: {
    title: 'KI-Diagnose',
    confidence: 'Konfidenz',
    analysis: 'Analyse',
    maintenancePlan: 'Pflegeplan',
    treatmentPlan: 'Behandlungsplan',
    addToSchedule: 'Zum Zeitplan hinzufügen',
    scanAgain: 'Erneut scannen',
    treatmentAdded: 'Behandlung wurde deinem Zeitplan hinzugefügt!',
    healthy: {
      title: 'Pflanze sieht gesund aus!',
      explanation:
        'Deine Pflanze scheint in ausgezeichnetem Zustand zu sein. Die Blätter zeigen eine lebendige grüne Farbe ohne Anzeichen von Nährstoffmangel, Schädlingsbefall oder Krankheiten. Die Gesamtstruktur und das Wachstumsmuster deuten auf eine gut gepflegte Pflanze hin.',
      steps: {
        step1: 'Aktuellen Bewässerungsplan beibehalten',
        step2: 'Nährstoffmischung wie geplant fortführen',
        step3: 'Neues Wachstum auf Veränderungen beobachten',
        step4: 'Umgebungsbedingungen stabil halten',
      },
    },
    issue: {
      title: 'Stickstoffmangel erkannt',
      explanation:
        'Die unteren Blätter zeigen Vergilbungsmuster, die für Stickstoffmangel charakteristisch sind. Dies beginnt typischerweise an der Unterseite der Pflanze und schreitet nach oben fort. Die älteren Blätter werden erst hellgrün, dann gelb, da Stickstoff ein mobiler Nährstoff ist, den die Pflanze zu neuem Wachstum umleitet.',
      steps: {
        step1: 'Stickstoff bei nächster Düngung um 20% erhöhen',
        step2: 'Ausgewogenen N-P-K-Dünger verwenden (höherer N-Anteil)',
        step3:
          'pH-Wert prüfen — Stickstoffaufnahme ist bei pH 6,0-6,5 am besten',
        step4: 'Betroffene Blätter in den nächsten 5-7 Tagen beobachten',
        step5: 'Blattdüngung für schnelle Aufnahme in Betracht ziehen',
      },
    },
  },
} as const;

export default scan;
