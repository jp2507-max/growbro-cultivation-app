const garden = {
  noPlantsTitle: 'No Plants Yet',
  noPlantsSubtitle: 'Add your first plant to get started!',
  addPlant: 'Add Plant',
  readyPercent: '{{percent}}% Ready',
  dayCount: 'Day {{day}}',
  phaseInfo: '{{phase}} • {{weeksLeft}} weeks left',
  metrics: {
    temp: 'TEMP',
    humidity: 'HUMIDITY',
    ph: 'PH',
  },
  todaysTasks: "Today's Tasks",
  pendingCount: '{{count}} Pending',
  noTasks: 'No tasks for today',
  harvestPlant: 'Harvest Plant',
  logActivity: 'Log Activity',
  errors: {
    failedUpdateTask: 'Failed to update task',
    loadingPlants: 'Error loading plants',
    loadingTasks: 'Error loading tasks',
  },
} as const;

export default garden;
