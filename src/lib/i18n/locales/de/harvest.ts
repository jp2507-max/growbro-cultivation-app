const harvest = {
  thisPlant: 'diese Pflanze',
  title: 'Erntezeit!',
  subtitle: 'Erfasse deine Erntedaten für {{plantName}}',
  plantSummaryLabel: 'Pflanzenübersicht',
  yieldWeight: 'Erntegewicht',
  wetWeightPlaceholder: 'Nassgewicht (g)',
  dryWeightPlaceholder: 'Trockengewicht (g) — optional',
  qualityRating: 'Qualitätsbewertung',
  quality: {
    poor: 'Schlecht',
    good: 'Gut',
    great: 'Sehr gut',
    premium: 'Premium',
  },
  qualityDescriptions: {
    poor: 'Diese Runde lag unter deinem Qualitätsziel.',
    good: 'Solides Ergebnis mit gesunden Blüten.',
    great: 'Starke Qualität mit vielen Trichomen.',
    premium: 'Top-Qualität für deine besten Gläser.',
  },
  harvestNotes: 'Erntenotizen',
  notesHint: 'Gib Beobachtungen zu deiner Ernte ein',
  notesPlaceholder: 'Beobachtungen, Trichomfarbe, Geruchsnotizen...',
  harvestDateToday: 'Erntedatum: Heute',
  saveHarvest: 'Ernte speichern',
  a11y: {
    wetWeightLabel: 'Eingabe Nassgewicht',
    wetWeightHint: 'Gib das Nassgewicht deiner Ernte in Gramm ein',
    dryWeightLabel: 'Eingabe Trockengewicht',
    dryWeightHint:
      'Optional kannst du das Trockengewicht deiner Ernte in Gramm eingeben',
    closeSheetLabel: 'Ernteansicht schließen',
    closeSheetHint:
      'Schließt diese Ansicht und bringt dich zurück zum vorherigen Bildschirm',
    closeSuccessLabel: 'Erfolgsansicht schließen',
    closeSuccessHint:
      'Schließt die Erfolgsansicht und bringt dich zurück zum vorherigen Bildschirm',
    dismissOverlayLabel: 'Overlay schließen',
    dismissOverlayHint:
      'Tippe, um das Erfolgs-Overlay zu schließen und zum Ernteformular zurückzukehren',
  },
  errors: {
    invalidWeight: 'Bitte gib ein gültiges positives Gewicht ein',
    saveFailed:
      'Ernte konnte nicht gespeichert werden. Bitte versuche es erneut.',
  },
  success: {
    title: 'Ernte erfasst!',
    message:
      '{{weight}}g erfasst. Deine Pflanzendaten wurden in dein Ernteinventar verschoben.',
    startNewGrow: 'Neuen Grow starten',
    viewInventory: 'Inventar anzeigen',
  },
} as const;

export default harvest;
