const scan = {
  subtitle: 'Diagnose plant health instantly',
  analyzing: 'Analyzing plant...',
  pointCamera: 'Point camera at your plant',
  clearPhoto: 'Take a clear photo of leaves for best results',
  tips: {
    focusLeaves: 'Focus on leaves',
    goodLighting: 'Good lighting',
    closeUp: 'Close-up shot',
  },
  actions: 'Actions',
  openCamera: 'Open Camera',
  chooseFromLibrary: 'Choose from Library',
  analyzePhoto: 'Analyze Photo',
  photoReady: 'Photo ready for analysis',
  camera: {
    close: 'Close camera',
    closeHint: 'Close the camera and return to scan actions',
    capture: 'Capture photo',
    captureHint: 'Capture the current camera frame for diagnosis',
    flipCamera: 'Flip camera',
    flipCameraHint: 'Switch between front and rear camera',
  },
  demoScans: 'Demo Scans',
  scanHealthy: 'Scan — Healthy Result',
  scanIssue: 'Scan — Issue Detected',
  permissions: {
    cameraTitle: 'Camera Permission Needed',
    cameraDeniedMessage:
      'Camera access is required to capture a plant photo. You can enable it in app settings.',
    photosTitle: 'Photo Library Permission Needed',
    photosDeniedMessage:
      'Photo library access is required to choose an existing plant photo.',
    openSettings: 'Open Settings',
    cancel: 'Cancel',
  },
  errors: {
    noImageTitle: 'No Photo Selected',
    noImageBody: 'Capture a photo or choose one from your library first.',
    captureFailedTitle: 'Photo Capture Failed',
    captureFailedBody: 'Could not capture photo. Please try again.',
  },
  diagnosis: {
    title: 'AI Diagnosis',
    confidence: 'Confidence',
    analysis: 'Analysis',
    image: 'Analyzed Image',
    imageDescription: 'Photo used for AI diagnosis',
    maintenancePlan: 'Maintenance Plan',
    treatmentPlan: 'Treatment Plan',
    addToSchedule: 'Add to Schedule',
    scanAgain: 'Scan Again',
    treatmentAdded: 'Treatment added to your schedule!',
    healthy: {
      title: 'Healthy Plant',
      explanation:
        'Your plant looks healthy and vigorous! No signs of pests or deficiencies detected.',
      steps: {
        step1: 'Continue current watering schedule',
        step2: 'Maintain environmental conditions',
        step3: 'Monitor for any changes',
        step4: 'Regular nutrient feeding',
      },
    },
    issue: {
      title: 'Nutrient Deficiency',
      explanation:
        'Signs of Nitrogen deficiency detected. Lower leaves are turning yellow while veins remain green.',
      steps: {
        step1: 'Check pH levels of run-off',
        step2: 'Increase Nitrogen in next feeding',
        step3: 'Monitor new growth for improvement',
        step4: 'Ensure proper drainage',
        step5: 'Check temperature and humidity',
      },
    },
  },
} as const;

export default scan;
