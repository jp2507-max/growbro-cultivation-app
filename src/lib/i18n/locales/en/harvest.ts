const harvest = {
  thisPlant: 'this plant',
  title: 'Harvest Time!',
  subtitle: 'Record your yield details for {{plantName}}',
  plantSummaryLabel: 'Plant overview',
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
  qualityDescriptions: {
    poor: 'Below target quality this round.',
    good: 'Solid result with healthy buds.',
    great: 'Strong quality with rich trichomes.',
    premium: 'Top-tier quality for your best jars.',
  },
  harvestNotes: 'Harvest Notes',
  notesHint: 'Enter any observations about your harvest',
  notesPlaceholder: 'Any observations, trichome color, smell notes...',
  harvestDateToday: 'Harvest Date: Today',
  saveHarvest: 'Save Harvest',
  a11y: {
    wetWeightLabel: 'Wet weight input',
    wetWeightHint: 'Enter the wet weight of your harvest in grams',
    dryWeightLabel: 'Dry weight input',
    dryWeightHint: 'Optionally enter the dry weight of your harvest in grams',
    closeSheetLabel: 'Close harvest sheet',
    closeSheetHint: 'Closes this sheet and returns to the previous screen',
    closeSuccessLabel: 'Close success sheet',
    closeSuccessHint:
      'Closes the success sheet and returns to your previous screen',
    dismissOverlayLabel: 'Dismiss overlay',
    dismissOverlayHint:
      'Tap to dismiss the success overlay and return to the harvest form',
  },
  errors: {
    invalidWeight: 'Please enter a valid positive weight',
    saveFailed: 'Failed to save harvest. Please try again.',
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
