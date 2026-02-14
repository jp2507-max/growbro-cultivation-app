export default {
  defaultTitle: 'Task Details',
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
        'Prepare your equipment and ensure the environment is ready for the task.',
      tags: {
        water: '{{amount}} Liters Water',
        temperature: '{{temperature}}°C',
      },
    },
    step2: {
      label: 'STEP 2',
      title: 'Execution',
      description:
        'Follow the standard procedure to carry out the main part of this task.',
      tags: {
        micro: '{{amount}}ml FloraMicro',
      },
    },
    step3: {
      label: 'STEP 3',
      title: 'Review',
      description:
        'Double-check your work to ensure everything has been completed correctly.',
      tags: {
        duration: '{{duration}} Minutes',
      },
    },
    step4: {
      label: 'STEP 4',
      title: 'Finalize',
      description:
        'Clean up the area and record any necessary measurements or notes.',
    },
  },
  taskCompletedSuccess: 'Task completed successfully',
  taskCompletedHint:
    'The task has been marked as complete. You can navigate back to continue.',
} as const;
