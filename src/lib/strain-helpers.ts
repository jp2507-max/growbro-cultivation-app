import Colors from '@/constants/colors';
import type { Strain } from '@/src/lib/instant';

export type StrainFilters = {
  type?: string; // 'All' | 'Indica' | 'Sativa' | 'Hybrid'
  search?: string;
  effects?: string[]; // e.g. ['Relaxed', 'Happy']
  flavors?: string[]; // e.g. ['Citrus', 'Pine']
  difficulty?: string; // 'Easy' | 'Medium' | 'Difficult'
  floweringType?: 'autoflower' | 'photoperiod';
};

export function applyStrainFilters(
  strains: Strain[],
  filters: StrainFilters
): Strain[] {
  return strains.filter((strain) => {
    // Type filter
    if (
      filters.type &&
      filters.type !== 'All' &&
      strain.type !== filters.type
    ) {
      return false;
    }

    // Search filter
    if (filters.search?.trim()) {
      const query = filters.search.toLowerCase();
      if (!strain.name.toLowerCase().includes(query)) return false;
    }

    // Effects filter — strain must have ALL selected effects
    if (filters.effects && filters.effects.length > 0) {
      const strainEffects = parseEffects(strain);
      const hasAll = filters.effects.every((effect) =>
        strainEffects.includes(effect)
      );
      if (!hasAll) return false;
    }

    // Flavors filter — strain must have ALL selected flavors
    if (filters.flavors && filters.flavors.length > 0) {
      const strainFlavors = parseFlavors(strain);
      const hasAll = filters.flavors.every((flavor) =>
        strainFlavors.includes(flavor)
      );
      if (!hasAll) return false;
    }

    // Difficulty filter
    if (filters.difficulty && strain.difficulty !== filters.difficulty) {
      return false;
    }

    // Flowering type filter
    if (filters.floweringType) {
      const isAuto = strain.isAutoflower;
      if (isAuto == null) return false;
      if (filters.floweringType === 'autoflower' && !isAuto) return false;
      if (filters.floweringType === 'photoperiod' && isAuto) return false;
    }

    return true;
  });
}

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
    text: Colors.primary,
    darkBg: Colors.strainIndicaDarkBg,
    darkText: Colors.strainIndicaDarkText,
    darkBorder: Colors.strainIndicaDarkBorder,
  },
  Sativa: {
    bg: Colors.badgeSativa,
    text: Colors.dotSativa,
    darkBg: Colors.strainSativaDarkBg,
    darkText: Colors.strainSativaDarkText,
    darkBorder: Colors.strainSativaDarkBorder,
  },
  Hybrid: {
    bg: Colors.badgeHybrid,
    text: Colors.dotIndica,
    darkBg: Colors.strainHybridDarkBg,
    darkText: Colors.strainHybridDarkText,
    darkBorder: Colors.strainHybridDarkBorder,
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
    bg: Colors.flavorEarthyBg,
    border: Colors.flavorEarthyBorder,
    text: Colors.flavorEarthyText,
  },
  Pine: {
    bg: Colors.flavorPineBg,
    border: Colors.flavorPineBorder,
    text: Colors.flavorPineText,
  },
  Woody: {
    bg: Colors.flavorWoodyBg,
    border: Colors.flavorWoodyBorder,
    text: Colors.flavorWoodyText,
  },
  Lemon: {
    bg: Colors.flavorLemonBg,
    border: Colors.flavorLemonBorder,
    text: Colors.flavorLemonText,
  },
  Citrus: {
    bg: Colors.flavorLemonBg,
    border: Colors.flavorLemonBorder,
    text: Colors.flavorLemonText,
  },
  Diesel: {
    bg: Colors.flavorEarthyBg,
    border: Colors.flavorEarthyBorder,
    text: Colors.flavorEarthyText,
  },
  Berry: {
    bg: Colors.flavorBerryBg,
    border: Colors.flavorBerryBorder,
    text: Colors.flavorBerryText,
  },
  Sweet: {
    bg: Colors.flavorSweetBg,
    border: Colors.flavorSweetBorder,
    text: Colors.flavorSweetText,
  },
  Mint: {
    bg: Colors.flavorPineBg,
    border: Colors.flavorPineBorder,
    text: Colors.flavorPineText,
  },
  Herbal: {
    bg: Colors.flavorPineBg,
    border: Colors.flavorPineBorder,
    text: Colors.flavorPineText,
  },
  Fruity: {
    bg: Colors.flavorBerryBg,
    border: Colors.flavorBerryBorder,
    text: Colors.flavorBerryText,
  },
  Spicy: {
    bg: Colors.flavorWoodyBg,
    border: Colors.flavorWoodyBorder,
    text: Colors.flavorWoodyText,
  },
  Flowery: {
    bg: Colors.flavorSweetBg,
    border: Colors.flavorSweetBorder,
    text: Colors.flavorSweetText,
  },
  Tropical: {
    bg: Colors.flavorLemonBg,
    border: Colors.flavorLemonBorder,
    text: Colors.flavorLemonText,
  },
  Chocolate: {
    bg: Colors.flavorEarthyBg,
    border: Colors.flavorEarthyBorder,
    text: Colors.flavorEarthyText,
  },
  Coffee: {
    bg: Colors.flavorEarthyBg,
    border: Colors.flavorEarthyBorder,
    text: Colors.flavorEarthyText,
  },
  Cheese: {
    bg: Colors.flavorLemonBg,
    border: Colors.flavorLemonBorder,
    text: Colors.flavorLemonText,
  },
  Skunk: {
    bg: Colors.flavorPineBg,
    border: Colors.flavorPineBorder,
    text: Colors.flavorPineText,
  },
  Fuel: {
    bg: Colors.flavorEarthyBg,
    border: Colors.flavorEarthyBorder,
    text: Colors.flavorEarthyText,
  },
  Lavender: {
    bg: Colors.flavorBerryBg,
    border: Colors.flavorBerryBorder,
    text: Colors.flavorBerryText,
  },
  Vanilla: {
    bg: Colors.flavorLemonBg,
    border: Colors.flavorLemonBorder,
    text: Colors.flavorLemonText,
  },
  Sour: {
    bg: Colors.flavorLemonBg,
    border: Colors.flavorLemonBorder,
    text: Colors.flavorLemonText,
  },
  Pungent: {
    bg: Colors.flavorEarthyBg,
    border: Colors.flavorEarthyBorder,
    text: Colors.flavorEarthyText,
  },
};

const defaultFlavorColor = {
  bg: Colors.flavorPineBg,
  border: Colors.flavorPineBorder,
  text: Colors.flavorPineText,
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
