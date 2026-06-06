import { create } from 'zustand';

interface UIStore {
  // Dialog States
  saveLinkDialogOpen: boolean;
  saveLinkDefaultUrl?: string;
  createFolderDialogOpen: boolean;

  // Panel States
  rightPanelOpen: boolean;
  mobileSidebarOpen: boolean;

  // Actions
  toggleSaveLinkDialog: (open?: boolean, defaultUrl?: string) => void;
  toggleCreateFolderDialog: (open?: boolean) => void;
  toggleRightPanel: (open?: boolean) => void;
  toggleMobileSidebar: (open?: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  saveLinkDialogOpen: false,
  saveLinkDefaultUrl: undefined,
  createFolderDialogOpen: false,
  rightPanelOpen: false,
  mobileSidebarOpen: false,

  toggleSaveLinkDialog: (open, defaultUrl) =>
    set((state) => {
      const nextOpen = open ?? !state.saveLinkDialogOpen;
      return {
        saveLinkDialogOpen: nextOpen,
        saveLinkDefaultUrl: nextOpen ? defaultUrl : undefined,
      };
    }),

  toggleCreateFolderDialog: (open) =>
    set((state) => ({ createFolderDialogOpen: open ?? !state.createFolderDialogOpen })),

  toggleRightPanel: (open) =>
    set((state) => ({ rightPanelOpen: open ?? !state.rightPanelOpen })),

  toggleMobileSidebar: (open) =>
    set((state) => ({ mobileSidebarOpen: open ?? !state.mobileSidebarOpen })),
}));
