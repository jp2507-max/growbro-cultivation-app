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
  photo: {
    editTitle: 'Plant photo',
    editMessage: 'Add or update your plant photo',
    editHint: 'Opens options to take or choose a plant photo',
    takePhoto: 'Take photo',
    chooseLibrary: 'Choose from library',
    cameraPermissionDenied: 'Camera permission denied',
    libraryPermissionDenied: 'Photo library permission denied',
    updateFailed: 'Failed to update plant photo',
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
