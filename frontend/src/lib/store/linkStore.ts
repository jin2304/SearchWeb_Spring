import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  sortType: 'latest' | 'oldest' | 'alphabetical';
}

interface LinkStore {
  filters: FilterState;
  
  // Actions
  setSearchQuery: (query: string) => void;
  toggleTagFilter: (tag: string) => void;
  setSortType: (type: FilterState['sortType']) => void;
  clearFilters: () => void;
}

export const useLinkStore = create<LinkStore>((set) => ({
  filters: {
    searchQuery: '',
    selectedTags: [],
    sortType: 'latest',
  },

  setSearchQuery: (query) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

  toggleTagFilter: (tag) =>
    set((state) => {
      const isSelected = state.filters.selectedTags.includes(tag);
      return {
        filters: {
          ...state.filters,
          selectedTags: isSelected
            ? state.filters.selectedTags.filter((t) => t !== tag)
            : [...state.filters.selectedTags, tag],
        },
      };
    }),

  setSortType: (type) =>
    set((state) => ({ filters: { ...state.filters, sortType: type } })),

  clearFilters: () =>
    set(() => ({
      filters: { searchQuery: '', selectedTags: [], sortType: 'latest' },
    })),
}));
