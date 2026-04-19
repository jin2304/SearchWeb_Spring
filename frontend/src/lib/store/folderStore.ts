import { create } from 'zustand';

interface FolderStore {
  selectedFolderId: number | null;
  searchScope: 'folders' | 'all';
  searchQuery: string;

  setSelectedFolderId: (id: number | null) => void;
  setSearchScope: (scope: 'folders' | 'all') => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  selectedFolderId: null,    // 현재 선택된 폴더 (우측 패널에 표시됨)
  searchScope: 'all',        // 검색 범위 ('folders': 폴더명만, 'all': 북마크 포함)
  searchQuery: '',           // 폴더 목록 필터링용 검색어

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSearchScope: (scope) => set({ searchScope: scope }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: '', searchScope: 'all' }),
}));
