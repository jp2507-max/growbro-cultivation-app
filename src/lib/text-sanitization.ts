// Regular expressions for sanitization
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;
const INVISIBLE_CHARS_REGEX =
  /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
const WHITESPACE_REGEX = /\s+/g;
const HTML_TAGS_REGEX = /<[^>]*>/g;
const ESCAPED_CHARS_REGEX = /\\n|\\r|\\t/g;
const ALPHANUMERIC_REGEX = /[^A-Za-z0-9\s'’\-()/]/g;
const QUOTES_WRAPPERS_REGEX = /^[\[{(]+|[\]})]+$/g;
const QUOTES_REGEX = /^['"]|['"]$/g;
const NON_ALPHANUMERIC_EDGES_REGEX = /^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g;

export const DEFAULT_STRAIN_NAME = 'OG Kush';
export const DEFAULT_DESCRIPTION =
  'OG Kush is a world-famous strain first propagated in Florida in the early 90s. This strain has a unique terpene profile that boasts a complex aroma with notes of fuel, skunk, and spice.';

export function normalizeWhitespace(value: string): string {
  return value
    .replace(CONTROL_CHARS_REGEX, ' ')
    .replace(INVISIBLE_CHARS_REGEX, '')
    .replace(WHITESPACE_REGEX, ' ')
    .trim();
}

export function normalizeText(
  value: string | undefined | null,
  fallback: string
): string {
  const cleaned = value ? normalizeWhitespace(value) : '';
  return cleaned && cleaned.length > 0 ? cleaned : fallback;
}

export function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function sanitizeDescription(value: string | undefined | null): string {
  const base = normalizeText(value, DEFAULT_DESCRIPTION);
  const parsed = tryParseJson(base);

  let raw = base;
  if (Array.isArray(parsed))
    raw = parsed
      .filter((item): item is string => typeof item === 'string')
      .join(' ');
  else if (typeof parsed === 'string') raw = parsed;

  const withoutTags = raw.replace(HTML_TAGS_REGEX, ' ');
  const withoutEscaped = withoutTags.replace(ESCAPED_CHARS_REGEX, ' ');
  const cleaned = normalizeWhitespace(withoutEscaped);
  const compact = cleaned.slice(0, 280);
  const lastSpace = compact.lastIndexOf(' ');
  const truncated =
    compact.length >= 280 && lastSpace > 80
      ? `${compact.slice(0, lastSpace)}...`
      : compact;

  const letterCount = (truncated.match(/[A-Za-z]/g) ?? []).length;
  if (letterCount < 20) return DEFAULT_DESCRIPTION;
  return truncated.length > 0 ? truncated : DEFAULT_DESCRIPTION;
}

export function sanitizeName(value: string | undefined | null): string {
  const raw = normalizeText(value, DEFAULT_STRAIN_NAME);
  const cleaned = normalizeWhitespace(
    raw.replace(HTML_TAGS_REGEX, ' ').replace(ALPHANUMERIC_REGEX, ' ').trim()
  ).slice(0, 42);

  const letterCount = (cleaned.match(/[A-Za-z]/g) ?? []).length;
  if (letterCount < 2) return DEFAULT_STRAIN_NAME;
  return cleaned.length > 0 ? cleaned : DEFAULT_STRAIN_NAME;
}

export function canonicalizeLabel(
  value: string,
  allowedLabels: readonly string[]
): string | null {
  const normalized = value.toLowerCase();

  for (const label of allowedLabels) {
    const candidate = label.toLowerCase();
    if (normalized === candidate) return label;
    if (normalized.includes(candidate)) return label;
    if (
      (candidate.startsWith(normalized) ||
        normalized.length / candidate.length >= 0.6) &&
      normalized.length >= 3
    )
      return label;
  }

  return null;
}

export function cleanLabel(
  value: string,
  allowedLabels?: readonly string[]
): string | null {
  const parsed = tryParseJson(value);
  const asString =
    typeof parsed === 'string'
      ? parsed
      : parsed && typeof parsed === 'object' && 'name' in parsed
        ? String((parsed as { name?: unknown }).name ?? '')
        : value;

  const cleaned = normalizeWhitespace(
    asString
      .replace(QUOTES_WRAPPERS_REGEX, '')
      .replace(QUOTES_REGEX, '')
      .replace(NON_ALPHANUMERIC_EDGES_REGEX, '')
  );
  if (cleaned.length < 2 || cleaned.length > 28) return null;

  const lowered = cleaned.toLowerCase();
  const letterCount = (cleaned.match(/[A-Za-z]/g) ?? []).length;
  if (
    letterCount < 2 ||
    lowered === 'n/a' ||
    lowered === 'na' ||
    lowered === 'none' ||
    lowered === 'null' ||
    lowered === 'unknown' ||
    lowered === '-'
  )
    return null;

  if (allowedLabels) {
    const canonical = canonicalizeLabel(cleaned, allowedLabels);
    if (canonical) return canonical;
    return null;
  }

  return cleaned;
}

export function normalizeList(
  values: string[],
  fallback: readonly string[],
  allowedLabels?: readonly string[]
): string[] {
  const cleaned = values
    .map((item) => cleanLabel(item, allowedLabels))
    .filter((item): item is string => item != null);

  if (cleaned.length === 0) return [...fallback];
  return Array.from(new Set(cleaned)).slice(0, 3);
}

export function parseNumberParts(value: string | undefined | null): number[] {
  if (!value) return [];
  const parts = value.match(/\d+/g);
  if (!parts) return [];
  return parts
    .map((part) => Number(part))
    .filter((part) => Number.isFinite(part));
}
