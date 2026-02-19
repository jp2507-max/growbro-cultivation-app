const garden = {
  title: 'My Garden',
  noPlantsTitle: 'No Plants Yet',
  noPlantsSubtitle: 'Add your first plant to get started!',
  unknownUser: 'User',
  addPlant: 'Add Plant',
  readyPercent: '{{percent}}% Ready',
  dayCount: 'Day {{day}}',
  phaseInfo: '{{phase}} • {{weeksLeft}} weeks left',
  metrics: {
    strainType: 'TYPE',
    environment: 'SETUP',
    pending: 'PENDING',
  },
  openTask: 'Open task',
  openProfile: 'Open profile',
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
