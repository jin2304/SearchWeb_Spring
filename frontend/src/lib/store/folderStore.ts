import { create } from 'zustand';

export type SearchScope = 'all' | 'folders' | 'links';

interface FolderStore {
  selectedFolderId: number | null;
  searchScope: SearchScope;
  searchQuery: string;
  savedTodayFilter: boolean;
  unreadFilter: boolean;
  unorganizedFilter: boolean;

  setSelectedFolderId: (id: number | null) => void;
  setSearchScope: (scope: SearchScope) => void;
  setSearchQuery: (query: string) => void;
  toggleSavedTodayFilter: () => void;
  toggleUnreadFilter: () => void;
  toggleUnorganizedFilter: () => void;
  clearSearch: () => void;
}

export const useFolderStore = create<FolderStore>((set) => {
  // 공통 필터 토글 헬퍼 함수
  const toggleFilter = (state: FolderStore, key: 'savedTodayFilter' | 'unreadFilter' | 'unorganizedFilter') => {
    const nextValue = !state[key];
    return {
      [key]: nextValue,
      // 필터가 활성화될 때 현재 선택된 폴더를 해제 (검색 결과 뷰로 전환 위함)
      selectedFolderId: nextValue ? null : state.selectedFolderId,
    };
  };

  return {
    selectedFolderId: null,    // 현재 선택된 폴더 (우측 패널에 표시됨)
    searchScope: 'all',    // 검색 범위 ('folders': 폴더명만, 'all': 북마크 포함, 'links': 링크만)
    searchQuery: '',           // 폴더 목록 필터링용 검색어
    savedTodayFilter: false,   // 오늘 저장한 링크만 표시 여부
    unreadFilter: false,       // 아직 읽지 않은 링크(view_count = 0)만 표시 여부
    unorganizedFilter: false,  // 미분류 폴더만 표시 여부

    setSelectedFolderId: (id) => set({ selectedFolderId: id }),
    setSearchScope: (scope) => set({ searchScope: scope }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    
    toggleSavedTodayFilter: () => set((state) => toggleFilter(state, 'savedTodayFilter')),
    toggleUnreadFilter: () => set((state) => toggleFilter(state, 'unreadFilter')),
    toggleUnorganizedFilter: () => set((state) => toggleFilter(state, 'unorganizedFilter')),
    
    clearSearch: () => set({
      selectedFolderId: null,
      searchQuery: '',
      searchScope: 'all',
      savedTodayFilter: false,
      unreadFilter: false,
      unorganizedFilter: false,
    }),
  };
});
