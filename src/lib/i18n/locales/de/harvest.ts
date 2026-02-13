const harvest = {
  thisPlant: 'diese Pflanze',
  title: 'Erntezeit!',
  subtitle: 'Erfasse deine Erntedaten für {{plantName}}',
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
  harvestNotes: 'Erntenotizen',
  notesHint: 'Gib Beobachtungen zu deiner Ernte ein',
  notesPlaceholder: 'Beobachtungen, Trichomfarbe, Geruchsnotizen...',
  harvestDateToday: 'Erntedatum: Heute',
  saveHarvest: 'Ernte speichern',
  errors: {
    invalidWeight: 'Bitte gib ein gültiges positives Gewicht ein',
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
