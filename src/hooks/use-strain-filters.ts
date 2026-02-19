import { create } from 'zustand';

export type FloweringType = 'autoflower' | 'photoperiod';
export type StrainFilterScope = 'library' | 'favorites';

export type StrainFilters = {
  type: string; // 'All' | 'Indica' | 'Sativa' | 'Hybrid'
  search: string;
  effects: string[];
  flavors: string[];
  difficulty: string | undefined;
  floweringType: FloweringType | undefined;
};

type StrainFiltersState = {
  filters: StrainFilters;
  matchedCountByScope: Record<StrainFilterScope, number>;
  setType: (type: string) => void;
  setSearch: (search: string) => void;
  setEffects: (effects: string[]) => void;
  setFlavors: (flavors: string[]) => void;
  toggleEffect: (effect: string) => void;
  toggleFlavor: (flavor: string) => void;
  setDifficulty: (difficulty: string | undefined) => void;
  setFloweringType: (floweringType: FloweringType | undefined) => void;
  resetAdvanced: () => void;
  setMatchedCount: (scope: StrainFilterScope, count: number) => void;
  getMatchedCount: (scope: StrainFilterScope) => number;
  activeAdvancedCount: () => number;
};

const DEFAULT_FILTERS: StrainFilters = {
  type: 'All',
  search: '',
  effects: [],
  flavors: [],
  difficulty: undefined,
  floweringType: undefined,
};

export const useStrainFilters = create<StrainFiltersState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },
  matchedCountByScope: {
    library: 0,
    favorites: 0,
  },

  setType: (type) => set((s) => ({ filters: { ...s.filters, type } })),

  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),

  setEffects: (effects) => set((s) => ({ filters: { ...s.filters, effects } })),

  setFlavors: (flavors) => set((s) => ({ filters: { ...s.filters, flavors } })),

  toggleEffect: (effect) =>
    set((s) => {
      const current = s.filters.effects;
      const next = current.includes(effect)
        ? current.filter((e) => e !== effect)
        : [...current, effect];
      return { filters: { ...s.filters, effects: next } };
    }),

  toggleFlavor: (flavor) =>
    set((s) => {
      const current = s.filters.flavors;
      const next = current.includes(flavor)
        ? current.filter((f) => f !== flavor)
        : [...current, flavor];
      return { filters: { ...s.filters, flavors: next } };
    }),

  setDifficulty: (difficulty) =>
    set((s) => ({ filters: { ...s.filters, difficulty } })),

  setFloweringType: (floweringType) =>
    set((s) => ({ filters: { ...s.filters, floweringType } })),

  resetAdvanced: () =>
    set((s) => ({
      filters: {
        ...s.filters,
        effects: [],
        flavors: [],
        difficulty: undefined,
        floweringType: undefined,
      },
    })),

  setMatchedCount: (scope, count) =>
    set((s) => ({
      matchedCountByScope: {
        ...s.matchedCountByScope,
        [scope]: count,
      },
    })),

  getMatchedCount: (scope) => get().matchedCountByScope[scope] ?? 0,

  activeAdvancedCount: () => {
    const { effects, flavors, difficulty, floweringType } = get().filters;
    let count = 0;
    if (difficulty) count += 1;
    if (floweringType) count += 1;
    if (effects.length > 0) count += effects.length;
    if (flavors.length > 0) count += flavors.length;
    return count;
  },
}));
