const harvest = {
  thisPlant: 'this plant',
  title: 'Harvest Time!',
  subtitle: 'Record your yield details for {{plantName}}',
  yieldWeight: 'Yield Weight',
  wetWeightPlaceholder: 'Wet weight (g)',
  dryWeightPlaceholder: 'Dry weight (g) — optional',
  qualityRating: 'Quality Rating',
  quality: {
    poor: 'Poor',
    good: 'Good',
    great: 'Great',
    premium: 'Premium',
  },
  harvestNotes: 'Harvest Notes',
  notesHint: 'Enter any observations about your harvest',
  notesPlaceholder: 'Any observations, trichome color, smell notes...',
  harvestDateToday: 'Harvest Date: Today',
  saveHarvest: 'Save Harvest',
  errors: {
    invalidWeight: 'Please enter a valid positive weight',
  },
  success: {
    title: 'Harvest Logged!',
    message:
      '{{weight}}g recorded. Your plant data has been moved to your harvest inventory.',
    startNewGrow: 'Start New Grow',
    viewInventory: 'View Inventory',
  },
} as const;

export default harvest;
