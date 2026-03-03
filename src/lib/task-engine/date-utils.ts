const DAY_MS = 24 * 60 * 60 * 1000;

export function parseHourMinute(
  value: string
): { hour: number; minute: number } | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function parseIsoDate(value: string): Date {
  const parsed = value ? new Date(`${value}T12:00:00`) : new Date();
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfIsoDate(isoDate: string): Date {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  return parsed;
}

export function daysBetween(startIsoDate: string, endIsoDate: string): number {
  const start = parseIsoDate(startIsoDate);
  const end = parseIsoDate(endIsoDate);
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.floor((endUtc - startUtc) / DAY_MS));
}

export function computeDueAt(
  isoDate: string,
  reminderTimeLocal: string
): number {
  const start = startOfIsoDate(isoDate);
  const parsed = parseHourMinute(reminderTimeLocal);
  if (!parsed) return start.getTime();
  start.setHours(parsed.hour, parsed.minute, 0, 0);
  return start.getTime();
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toIsoWeekKey(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((utcDate.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7
  );

  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
