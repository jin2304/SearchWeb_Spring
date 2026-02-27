import { create } from 'zustand';

interface FolderStore {
  selectedFolderId: string | null;
  
  // Actions
  setSelectedFolderId: (id: string | null) => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  selectedFolderId: null,

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
}));
