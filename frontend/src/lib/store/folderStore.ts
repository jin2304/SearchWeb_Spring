import { create } from 'zustand';

interface FolderStore {
  selectedFolderId: number | null;
  setSelectedFolderId: (id: number | null) => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  selectedFolderId: null,

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
}));
