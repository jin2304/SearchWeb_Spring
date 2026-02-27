import { create } from 'zustand';

interface UIStore {
  // Dialog States
  saveLinkDialogOpen: boolean;
  createFolderDialogOpen: boolean;

  // Panel States
  rightPanelOpen: boolean;

  // Actions
  toggleSaveLinkDialog: (open?: boolean) => void;
  toggleCreateFolderDialog: (open?: boolean) => void;
  toggleRightPanel: (open?: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  saveLinkDialogOpen: false,
  createFolderDialogOpen: false,
  rightPanelOpen: true,

  toggleSaveLinkDialog: (open) =>
    set((state) => ({ saveLinkDialogOpen: open ?? !state.saveLinkDialogOpen })),

  toggleCreateFolderDialog: (open) =>
    set((state) => ({ createFolderDialogOpen: open ?? !state.createFolderDialogOpen })),

  toggleRightPanel: (open) =>
    set((state) => ({ rightPanelOpen: open ?? !state.rightPanelOpen })),
}));
