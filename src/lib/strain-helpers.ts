import Colors from '@/constants/colors';
import type { Strain } from '@/src/lib/instant';

export const typeColors: Record<
  string,
  {
    bg: string;
    text: string;
    darkBg: string;
    darkText: string;
    darkBorder: string;
  }
> = {
  Indica: {
    bg: Colors.badgeIndica,
    text: '#2E7D32',
    darkBg: 'rgba(139,92,246,0.2)',
    darkText: '#c4b5fd',
    darkBorder: 'rgba(139,92,246,0.3)',
  },
  Sativa: {
    bg: Colors.badgeSativa,
    text: '#F9A825',
    darkBg: 'rgba(234,179,8,0.2)',
    darkText: '#fde68a',
    darkBorder: 'rgba(234,179,8,0.3)',
  },
  Hybrid: {
    bg: Colors.badgeHybrid,
    text: '#7B1FA2',
    darkBg: 'rgba(59,130,246,0.2)',
    darkText: '#bfdbfe',
    darkBorder: 'rgba(59,130,246,0.3)',
  },
};

function normalizeArrayItem(value: unknown): string | null {
  if (value && typeof value === 'object') {
    const objectValue = value as {
      name?: unknown;
      label?: unknown;
      title?: unknown;
      value?: unknown;
    };

    const picked =
      objectValue.name ??
      objectValue.label ??
      objectValue.title ??
      objectValue.value;

    if (typeof picked === 'string' || typeof picked === 'number') {
      return normalizeArrayItem(picked);
    }

    return null;
  }

  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const cleaned = String(value)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > 0 ? cleaned : null;
}

function normalizeParsedList(value: unknown): string[] {
  if (Array.isArray(value))
    return value
      .map((item) => normalizeArrayItem(item))
      .filter((item): item is string => item != null);

  if (typeof value === 'string') {
    const parts = value.split(/[,|;/]/g);
    return parts
      .map((item) => normalizeArrayItem(item))
      .filter((item): item is string => item != null);
  }

  return [];
}

/**
 * Parse a strain list field.
 * Supports JSON array strings and plain comma/pipe separated strings.
 */
export function parseStrainArray(json: string | undefined | null): string[] {
  if (!json) return [];

  const trimmed = json.trim();
  if (trimmed.length === 0) return [];

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return normalizeParsedList(parsed);
  } catch {
    return normalizeParsedList(trimmed);
  }
}

/** Convenience: parse effects field */
export function parseEffects(strain: Strain): string[] {
  return parseStrainArray(strain.effects);
}

/** Convenience: parse flavors field */
export function parseFlavors(strain: Strain): string[] {
  return parseStrainArray(strain.flavors);
}

/** Map difficulty string to a numeric level (1-5) */
export function difficultyLevel(difficulty: string | undefined): number {
  switch (difficulty) {
    case 'Easy':
      return 2;
    case 'Medium':
      return 3;
    case 'Difficult':
      return 4;
    default:
      return 3;
  }
}

/** Map difficulty string to a display label */
export function difficultyLabel(difficulty: string | undefined): string {
  const level = difficultyLevel(difficulty);
  const label = difficulty || 'Moderate';
  return `${label} (${level}/5)`;
}

/** Get a THC display string from min/max */
export function thcDisplay(strain: Strain): string {
  if (
    strain.thcMin != null &&
    strain.thcMax != null &&
    strain.thcMin !== strain.thcMax
  ) {
    return `${strain.thcMin}-${strain.thcMax}%`;
  }
  if (strain.thcMax != null) return `${strain.thcMax}%`;
  if (strain.thc != null) return `${strain.thc}%`;
  return '';
}

/** All known effects for filter UI */
export const ALL_EFFECTS = [
  'Relaxed',
  'Happy',
  'Euphoric',
  'Creative',
  'Energetic',
  'Calming',
  'Sleepy',
  'Focused',
  'Uplifting',
  'Giggly',
  'Cerebral',
  'Body-buzz',
  'Munchies',
  'Sociable',
  'Sedative',
] as const;

/** All known flavors for filter UI */
export const ALL_FLAVORS = [
  'Earthy',
  'Pine',
  'Woody',
  'Lemon',
  'Citrus',
  'Diesel',
  'Berry',
  'Sweet',
  'Mint',
  'Herbal',
  'Fruity',
  'Spicy',
  'Flowery',
  'Tropical',
  'Chocolate',
  'Coffee',
  'Cheese',
  'Skunk',
  'Fuel',
  'Lavender',
  'Vanilla',
  'Sour',
  'Pungent',
] as const;

/** All known difficulties for filter UI */
export const ALL_DIFFICULTIES = ['Easy', 'Medium', 'Difficult'] as const;

/** Get the primary THC number (for potency badge) */
export function thcPercent(strain: Strain): number {
  return strain.thcMax ?? strain.thc ?? 0;
}

/** Flavor → tinted pill colors { bg, border, text } */
export const flavorColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  Earthy: {
    bg: 'rgba(120,53,15,0.2)',
    border: 'rgba(180,83,9,0.3)',
    text: '#fde68a',
  },
  Pine: {
    bg: 'rgba(20,83,45,0.2)',
    border: 'rgba(21,128,61,0.3)',
    text: '#bbf7d0',
  },
  Woody: {
    bg: 'rgba(154,52,18,0.2)',
    border: 'rgba(194,65,12,0.3)',
    text: '#fed7aa',
  },
  Lemon: {
    bg: 'rgba(161,98,7,0.2)',
    border: 'rgba(202,138,4,0.3)',
    text: '#fef08a',
  },
  Citrus: {
    bg: 'rgba(161,98,7,0.2)',
    border: 'rgba(202,138,4,0.3)',
    text: '#fef08a',
  },
  Diesel: {
    bg: 'rgba(120,53,15,0.2)',
    border: 'rgba(180,83,9,0.3)',
    text: '#fde68a',
  },
  Berry: {
    bg: 'rgba(88,28,135,0.2)',
    border: 'rgba(126,34,206,0.3)',
    text: '#e9d5ff',
  },
  Sweet: {
    bg: 'rgba(157,23,77,0.2)',
    border: 'rgba(190,24,93,0.3)',
    text: '#fbcfe8',
  },
  Mint: {
    bg: 'rgba(20,83,45,0.2)',
    border: 'rgba(21,128,61,0.3)',
    text: '#bbf7d0',
  },
  Herbal: {
    bg: 'rgba(20,83,45,0.2)',
    border: 'rgba(21,128,61,0.3)',
    text: '#bbf7d0',
  },
  Fruity: {
    bg: 'rgba(88,28,135,0.2)',
    border: 'rgba(126,34,206,0.3)',
    text: '#e9d5ff',
  },
  Spicy: {
    bg: 'rgba(154,52,18,0.2)',
    border: 'rgba(194,65,12,0.3)',
    text: '#fed7aa',
  },
  Flowery: {
    bg: 'rgba(157,23,77,0.2)',
    border: 'rgba(190,24,93,0.3)',
    text: '#fbcfe8',
  },
  Tropical: {
    bg: 'rgba(161,98,7,0.2)',
    border: 'rgba(202,138,4,0.3)',
    text: '#fef08a',
  },
  Chocolate: {
    bg: 'rgba(120,53,15,0.2)',
    border: 'rgba(180,83,9,0.3)',
    text: '#fde68a',
  },
  Coffee: {
    bg: 'rgba(120,53,15,0.2)',
    border: 'rgba(180,83,9,0.3)',
    text: '#fde68a',
  },
  Cheese: {
    bg: 'rgba(161,98,7,0.2)',
    border: 'rgba(202,138,4,0.3)',
    text: '#fef08a',
  },
  Skunk: {
    bg: 'rgba(20,83,45,0.2)',
    border: 'rgba(21,128,61,0.3)',
    text: '#bbf7d0',
  },
  Fuel: {
    bg: 'rgba(120,53,15,0.2)',
    border: 'rgba(180,83,9,0.3)',
    text: '#fde68a',
  },
  Lavender: {
    bg: 'rgba(88,28,135,0.2)',
    border: 'rgba(126,34,206,0.3)',
    text: '#e9d5ff',
  },
  Vanilla: {
    bg: 'rgba(161,98,7,0.2)',
    border: 'rgba(202,138,4,0.3)',
    text: '#fef08a',
  },
  Sour: {
    bg: 'rgba(161,98,7,0.2)',
    border: 'rgba(202,138,4,0.3)',
    text: '#fef08a',
  },
  Pungent: {
    bg: 'rgba(120,53,15,0.2)',
    border: 'rgba(180,83,9,0.3)',
    text: '#fde68a',
  },
};

const defaultFlavorColor = {
  bg: 'rgba(20,83,45,0.2)',
  border: 'rgba(21,128,61,0.3)',
  text: '#bbf7d0',
};

/** Get flavor pill colors with fallback */
export function getFlavorColor(flavor: string): {
  bg: string;
  border: string;
  text: string;
} {
  return flavorColors[flavor] ?? defaultFlavorColor;
}

/** Terpene/flavor emoji mapping */
export const flavorEmoji: Record<string, string> = {
  Lemon: '🍋',
  Citrus: '🍋',
  Pine: '🌲',
  Diesel: '⛽',
  Berry: '🫐',
  Sweet: '🍬',
  Earthy: '🌿',
  Mint: '🌱',
  Herbal: '🌿',
  Fruity: '🍇',
  Spicy: '🌶️',
  Cheese: '🧀',
  Skunk: '🦨',
  Flowery: '🌸',
  Woody: '🪵',
  Pepper: '🫑',
  Tropical: '🌴',
  Blueberry: '🫐',
  Mango: '🥭',
  Coffee: '☕',
  Chocolate: '🍫',
  Vanilla: '🍦',
  Grape: '🍇',
  Pineapple: '🍍',
  Strawberry: '🍓',
  Orange: '🍊',
  Banana: '🍌',
  Cherry: '🍒',
  Honey: '🍯',
  Candy: '🍭',
  Sour: '😖',
  Pungent: '💨',
  Fuel: '⛽',
  Nutty: '🥜',
  Lavender: '💜',
  Peach: '🍑',
};
