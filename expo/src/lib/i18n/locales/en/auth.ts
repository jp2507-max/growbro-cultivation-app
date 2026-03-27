const auth = {
  ageGate: {
    welcomeTitle: 'Welcome to GrowBro',
    welcomeSubtitle:
      'This app contains content related to cannabis cultivation and is intended for adults only.',
    question: 'Are you 18 years or older?',
    legalNotice:
      'You must be of legal age in your jurisdiction to use this application.',
    confirmButton: 'I am 18+',
    denyButton: 'I am under 18',
    deniedTitle: 'Access Denied',
    deniedMessage:
      'You must be 18 years or older to use GrowBro. Please come back when you meet the age requirement.',
    exitApp: 'Exit App',
  },
  welcome: {
    appName: 'GrowBro',
    tagline: 'Your cannabis cultivation companion',
    pitch: 'Track your grows, manage schedules, and harvest like a pro.',
    getStarted: 'Get Started',
    emailTitle: "What's your\nemail?",
    emailSubtitle: "We'll send you a magic code to sign in.",
    emailPlaceholder: 'Email',
    sendCode: 'Send Code',
    codeTitle: 'Check your\ninbox',
    codeSentTo: 'Enter the 6-digit code sent to ',
    codePlaceholder: '000000',
    verify: 'Verify',
    didntGetCode: "Didn't get the code?",
    resend: 'Resend',
    nameTitle: "What's your\nname?",
    nameSubtitle: 'This is how other growers will see you.',
    namePlaceholder: 'Display Name',
    a11y: {
      emailInputLabel: 'Email input',
      emailInputHint: 'Enter your email address',
      codeInputLabel: 'Verification code input',
      codeInputHint: 'Enter the 6-digit code from your email',
      nameInputLabel: 'Display name input',
      nameInputHint: 'Enter your display name',
    },
    errors: {
      enterEmail: 'Please enter your email.',
      failedSendCode: 'Failed to send code.',
      enterCode: 'Please enter the code.',
      invalidCode: 'Invalid code.',
      enterName: 'Please enter your name.',
      failedCreateProfile: 'Failed to create profile.',
    },
  },
  onboarding: {
    skip: 'Skip',
    continue: 'Continue',
    letsGrow: "Let's Grow",
    defaultName: 'Grower',
    pages: {
      track: {
        title: 'Track Your\nGarden',
        subtitle:
          'Monitor every stage of growth with real-time dashboards and smart metrics.',
        features: {
          lightTracking: 'Light tracking',
          waterLogs: 'Water logs',
          growthStats: 'Growth stats',
        },
      },
      schedule: {
        title: 'Never Miss\na Task',
        subtitle:
          'Smart scheduling adapts to your plant\u2019s stage and sends timely reminders.',
        features: {
          autoTasks: 'Auto tasks',
          weeklyPlans: 'Weekly plans',
          feedAlerts: 'Feed alerts',
        },
      },
      diagnose: {
        title: 'AI Plant\nDoctor',
        subtitle:
          'Snap a photo and get instant diagnosis with treatment plans powered by AI.',
        features: {
          photoScan: 'Photo scan',
          healthCheck: 'Health check',
          quickFixes: 'Quick fixes',
        },
      },
      experience: {
        title: 'Your Grow\nLevel',
        subtitle:
          'We tailor guides and recommendations to match your expertise.',
        almostThere: 'Almost there, {{firstName}}!',
        pickLevel: 'Pick your\ngrow level',
        shapesExperience: 'This shapes your entire experience.',
      },
    },
    levels: {
      beginner: {
        label: 'Seedling',
        description: 'First time grower — guide me through everything.',
      },
      intermediate: {
        label: 'Vegetative',
        description: 'Grown a few times — I want to optimize.',
      },
      expert: {
        label: 'Flowering',
        description: 'Seasoned cultivator — give me full control.',
      },
    },
    errors: {
      failedSavePreferences:
        'Failed to save your preferences. Please try again.',
    },
    a11y: {
      dotLabel: 'Onboarding page {{index}}',
      dotHint: 'Navigates to this onboarding page',
    },
  },
} as const;

export default auth;
