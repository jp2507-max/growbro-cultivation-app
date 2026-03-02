import {
  type TaskMetadata,
  taskMetadataSchema,
  type WeeklyHealthCheckInput,
  weeklyHealthCheckInputSchema,
} from '@/src/lib/task-engine/types';

export function stringifyTaskMetadata(metadata: TaskMetadata): string {
  return JSON.stringify(taskMetadataSchema.parse(metadata));
}

export function parseTaskMetadata(
  metadataJson: string | undefined | null
): TaskMetadata | null {
  if (!metadataJson) return null;

  try {
    const parsed: unknown = JSON.parse(metadataJson);
    const result = taskMetadataSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}

export function stringifyHealthCheckPayload(
  payload: WeeklyHealthCheckInput
): string {
  return JSON.stringify(weeklyHealthCheckInputSchema.parse(payload));
}

export function parseHealthCheckPayload(
  payloadJson: string | undefined | null
): WeeklyHealthCheckInput | null {
  if (!payloadJson) return null;

  try {
    const parsed: unknown = JSON.parse(payloadJson);
    const result = weeklyHealthCheckInputSchema.safeParse(parsed);
    if (!result.success) return null;
    return result.data;
  } catch {
    return null;
  }
}
