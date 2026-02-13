const addPlant = {
  stepOf: 'of {{total}}',
  step1: {
    title: 'What are you\ngrowing?',
    subtitle: "Let's start with the basics.",
    plantName: 'Plant Name',
    plantNameHint: 'Enter the name of your plant',
    plantNamePlaceholder: 'e.g., Northern Lights',
    strainType: 'Strain Type',
    indica: {
      label: 'Indica',
      subtitle: 'RELAXING & CALM',
    },
    sativa: {
      label: 'Sativa',
      subtitle: 'ENERGIZING & FOCUS',
    },
    hybrid: {
      label: 'Hybrid',
      subtitle: 'BALANCED BLEND',
    },
  },
  step2: {
    title: 'Growing\nEnvironment',
    subtitle: 'Where will this plant live?',
    indoor: 'Indoor',
    indoorDesc:
      'Grow tent, closet, or room with controlled lighting and climate.',
    outdoor: 'Outdoor',
    outdoorDesc: 'Garden, balcony, or greenhouse using natural sunlight.',
  },
  step3: {
    title: 'Ready to\ngrow!',
    subtitle: "Here's a summary of your new plant.",
    name: 'Name',
    strain: 'Strain',
    environment: 'Environment',
  },
  nextStep: 'Next Step',
  startGrowing: 'Start Growing',
  success: {
    title: "It's a Grow!",
    message: 'Your tasks for the next week have been generated.',
    goToGarden: 'Go to Garden',
  },
  errors: {
    failedAddPlant: 'Failed to add plant. Please try again.',
  },
} as const;

export default addPlant;
