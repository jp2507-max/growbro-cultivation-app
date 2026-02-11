import { create } from 'zustand';

export type StrainFilters = {
  type: string; // 'All' | 'Indica' | 'Sativa' | 'Hybrid'
  search: string;
  effects: string[];
  difficulty: string | undefined;
};

type StrainFiltersState = {
  filters: StrainFilters;
  setType: (type: string) => void;
  setSearch: (search: string) => void;
  toggleEffect: (effect: string) => void;
  setDifficulty: (difficulty: string | undefined) => void;
  resetAdvanced: () => void;
  activeAdvancedCount: () => number;
};

const DEFAULT_FILTERS: StrainFilters = {
  type: 'All',
  search: '',
  effects: [],
  difficulty: undefined,
};

export const useStrainFilters = create<StrainFiltersState>((set, get) => ({
  filters: { ...DEFAULT_FILTERS },

  setType: (type) => set((s) => ({ filters: { ...s.filters, type } })),

  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),

  toggleEffect: (effect) =>
    set((s) => {
      const current = s.filters.effects;
      const next = current.includes(effect)
        ? current.filter((e) => e !== effect)
        : [...current, effect];
      return { filters: { ...s.filters, effects: next } };
    }),

  setDifficulty: (difficulty) =>
    set((s) => ({ filters: { ...s.filters, difficulty } })),

  resetAdvanced: () =>
    set((s) => ({
      filters: { ...s.filters, effects: [], difficulty: undefined },
    })),

  activeAdvancedCount: () => {
    const { effects, difficulty } = get().filters;
    let count = 0;
    if (difficulty) count += 1;
    if (effects.length > 0) count += effects.length;
    return count;
  },
}));
