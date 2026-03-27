const taskDetail = {
  defaultTitle: 'Nährstoffmischung A',
  loading: 'Aufgabendetails werden geladen...',
  taskProgress: 'AUFGABENFORTSCHRITT',
  keepGrowing: 'Weiter so!',
  markComplete: 'Als erledigt markieren',
  taskCompleted: 'Aufgabe erledigt! Gut gemacht. 🌱',
  errors: {
    failedToLoad: 'Aufgabe konnte nicht geladen werden',
    notFound: 'Aufgabe nicht gefunden',
    mightBeDeleted: 'Diese Aufgabe wurde möglicherweise gelöscht.',
  },
  steps: {
    step1: {
      label: 'SCHRITT 1',
      title: 'Vorbereitung',
      description:
        'Fülle dein Reservoir mit frischem, pH-ausgeglichenem Wasser. Stelle sicher, dass die Temperatur ca. 20°C beträgt.',
      tags: {
        water: '{{amount}} Liter Wasser',
        temperature: '{{temperature}}°C',
      },
    },
    step2: {
      label: 'SCHRITT 2',
      title: 'Mikronährstoffe',
      description:
        'Schüttle die Flasche gut vor Gebrauch. Gib FloraMicro direkt in das Wasserreservoir.',
      tags: {
        micro: '{{amount}}ml FloraMicro',
      },
    },
    step3: {
      label: 'SCHRITT 3',
      title: 'Lösung umrühren',
      description:
        'Rühre die Lösung gründlich mit einem sauberen Rührstab um, bevor du den nächsten Nährstoff hinzufügst, um Lockout zu vermeiden.',
      tags: {
        duration: '{{duration}} Minuten',
      },
    },
    step4: {
      label: 'SCHRITT 4',
      title: 'pH-Prüfung',
      description:
        'Teste den endgültigen pH-Wert der Lösung. Er sollte zwischen 5,5 und 6,5 liegen.',
      tags: {},
    },
    tapToCheck: 'Doppeltippen zum Abhaken',
    tapToUncheck: 'Doppeltippen zum Entfernen',
  },
  taskCompletedSuccess: 'Aufgabe erfolgreich abgeschlossen',
  taskCompletedHint:
    'Die Aufgabe wurde als erledigt markiert. Du kannst zurückkehren, um fortzufahren.',
} as const;

export default taskDetail;
