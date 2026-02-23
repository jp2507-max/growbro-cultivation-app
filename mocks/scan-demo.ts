// Demo diagnosis content for scan feature
// This data is used only in demo mode and doesn't need i18n translation

export const demoDiagnosisContent = {
  healthy: {
    title: 'Plant Looks Healthy!',
    explanation:
      'Your plant appears to be in excellent condition. Leaves show vibrant green color with no signs of nutrient deficiency, pest damage, or disease. The overall structure and growth pattern indicate a well-maintained plant.',
    steps: {
      step1: 'Continue current watering schedule',
      step2: 'Maintain nutrient mix as planned',
      step3: 'Monitor new growth for any changes',
      step4: 'Keep environmental conditions stable',
    },
  },
  issue: {
    title: 'Nitrogen Deficiency Detected',
    explanation:
      'The lower leaves are showing yellowing patterns characteristic of nitrogen deficiency. This typically starts from the bottom of the plant and progresses upward. The older leaves turn pale green then yellow because nitrogen is a mobile nutrient that the plant redirects to new growth.',
    steps: {
      step1: 'Increase nitrogen in next feeding by 20%',
      step2: 'Use a balanced N-P-K fertilizer (higher N ratio)',
      step3: 'Check pH levels — nitrogen uptake is best at pH 6.0-6.5',
      step4: 'Monitor affected leaves over the next 5-7 days',
      step5: 'Consider foliar spray for quick absorption',
    },
  },
} as const;

export type DemoDiagnosisType = keyof typeof demoDiagnosisContent;
