import * as Sentry from '@sentry/react-native';

function toStatusClass(statusCode: number): string {
  if (statusCode >= 500) return '5xx';
  if (statusCode >= 400) return '4xx';
  if (statusCode >= 300) return '3xx';
  if (statusCode >= 200) return '2xx';
  if (statusCode >= 100) return '1xx';
  return 'unknown';
}

export function recordApiLatencyMetric(input: {
  endpoint: string;
  durationMs: number;
  statusCode: number;
  method?: string;
}): void {
  const { endpoint, durationMs, statusCode, method = 'GET' } = input;

  Sentry.metrics.distribution('growbro.api.latency', durationMs, {
    unit: 'millisecond',
    attributes: {
      endpoint,
      method,
      status_class: toStatusClass(statusCode),
      status_code: statusCode,
    },
  });
}

export function recordTaskCompletionMetric(input: { source: 'toggle' }): void {
  Sentry.metrics.count('growbro.task.completed', 1, {
    attributes: {
      source: input.source,
    },
  });
}

export function recordTaskAddedMetric(input: {
  source: 'diagnosis' | 'manual' | 'schedule';
}): void {
  Sentry.metrics.count('growbro.task.added', 1, {
    attributes: {
      source: input.source,
    },
  });
}

export function recordAiDiagnosisStartedMetric(input: {
  diagnosisType: 'healthy' | 'issue';
}): void {
  Sentry.metrics.count('growbro.ai.diagnosis.started', 1, {
    attributes: {
      diagnosis_type: input.diagnosisType,
    },
  });
}

export function recordAiDiagnosisResultMetric(input: {
  diagnosisType: 'healthy' | 'issue';
  confidence: number;
  durationMs?: number;
}): void {
  Sentry.metrics.count('growbro.ai.diagnosis.succeeded', 1, {
    attributes: {
      diagnosis_type: input.diagnosisType,
    },
  });

  Sentry.metrics.gauge('growbro.ai.diagnosis.confidence', input.confidence, {
    unit: 'percent',
    attributes: {
      diagnosis_type: input.diagnosisType,
    },
  });

  if (
    typeof input.durationMs === 'number' &&
    Number.isFinite(input.durationMs)
  ) {
    Sentry.metrics.distribution(
      'growbro.ai.diagnosis.duration',
      input.durationMs,
      {
        unit: 'millisecond',
        attributes: {
          diagnosis_type: input.diagnosisType,
        },
      }
    );
  }
}

export function recordAiTreatmentAddedMetric(input: {
  diagnosisType: 'healthy' | 'issue';
}): void {
  Sentry.metrics.count('growbro.ai.treatment.added_to_schedule', 1, {
    attributes: {
      diagnosis_type: input.diagnosisType,
    },
  });
}

export function recordStartupUxMetric(input: {
  milestone: string;
  durationMs: number;
}): void {
  Sentry.metrics.distribution('growbro.app.startup.ux', input.durationMs, {
    unit: 'millisecond',
    attributes: {
      milestone: input.milestone,
    },
  });
}
