const taskDetail = {
  defaultTitle: 'Nutrient Mix A',
  loading: 'Loading task details...',
  taskProgress: 'TASK PROGRESS',
  keepGrowing: 'Keep it growing!',
  markComplete: 'Mark as Complete',
  taskCompleted: 'Task Completed! Good job. 🌱',
  errors: {
    failedToLoad: 'Failed to load task',
    notFound: 'Task not found',
    mightBeDeleted: 'This task might have been deleted.',
  },
  steps: {
    step1: {
      label: 'STEP 1',
      title: 'Preparation',
      description:
        'Fill your reservoir with fresh, pH-balanced water. Ensure the temperature is approx 20°C.',
    },
    step2: {
      label: 'STEP 2',
      title: 'Micro-Nutrients',
      description:
        'Shake the bottle well before use. Add FloraMicro directly to the water reservoir.',
    },
    step3: {
      label: 'STEP 3',
      title: 'Stir Solution',
      description:
        'Stir the solution thoroughly using a clean mixing stick before adding the next nutrient to prevent lockout.',
    },
    step4: {
      label: 'STEP 4',
      title: 'pH Check',
      description:
        'Test the final pH of the solution. It should be between 5.5 and 6.5.',
    },
  },
} as const;

export default taskDetail;
