import { create } from 'zustand';

interface FolderStore {
  selectedFolderId: number | null;
  searchScope: 'folders' | 'all' | 'links';
  searchQuery: string;
  savedTodayFilter: boolean;
  unreadFilter: boolean;
  unorganizedFilter: boolean;

  setSelectedFolderId: (id: number | null) => void;
  setSearchScope: (scope: 'folders' | 'all' | 'links') => void;
  setSearchQuery: (query: string) => void;
  toggleSavedTodayFilter: () => void;
  toggleUnreadFilter: () => void;
  toggleUnorganizedFilter: () => void;
  clearSearch: () => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  selectedFolderId: null,    // 현재 선택된 폴더 (우측 패널에 표시됨)
  searchScope: 'all',    // 검색 범위 ('folders': 폴더명만, 'all': 북마크 포함, 'links': 링크만)
  searchQuery: '',           // 폴더 목록 필터링용 검색어
  savedTodayFilter: false,   // 오늘 저장한 링크만 표시 여부
  unreadFilter: false,       // 아직 읽지 않은 링크(view_count = 0)만 표시 여부
  unorganizedFilter: false,  // 미분류 폴더만 표시 여부

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSearchScope: (scope) => set({ searchScope: scope }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSavedTodayFilter: () => set((state) => {
    const nextValue = !state.savedTodayFilter;
    return {
      savedTodayFilter: nextValue,
      selectedFolderId: nextValue ? null : state.selectedFolderId,
    };
  }),
  toggleUnreadFilter: () => set((state) => {
    const nextValue = !state.unreadFilter;
    return {
      unreadFilter: nextValue,
      selectedFolderId: nextValue ? null : state.selectedFolderId,
    };
  }),
  toggleUnorganizedFilter: () => set((state) => {
    const nextValue = !state.unorganizedFilter;
    return {
      unorganizedFilter: nextValue,
      selectedFolderId: nextValue ? null : state.selectedFolderId,
    };
  }),
  clearSearch: () => set({
    selectedFolderId: null,
    searchQuery: '',
    searchScope: 'all',
    savedTodayFilter: false,
    unreadFilter: false,
    unorganizedFilter: false,
  }),
}));
