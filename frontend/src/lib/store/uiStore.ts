import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 패널 표시 방식 모드 타입: 'fixed'(우측 상시 고정) | 'drawer'(폴더 클릭 시 슬라이드 팝업)
export type PanelMode = 'fixed' | 'drawer';

interface UIStore {
  // Dialog States
  saveLinkDialogOpen: boolean;
  saveLinkDefaultUrl?: string;
  createFolderDialogOpen: boolean;

  // Panel States
  rightPanelOpen: boolean;
  panelMode: PanelMode; // 패널 표시 모드 상태 ('fixed' | 'drawer')
  mobileSidebarOpen: boolean;

  // Actions
  toggleSaveLinkDialog: (open?: boolean, defaultUrl?: string) => void;
  toggleCreateFolderDialog: (open?: boolean) => void;
  toggleRightPanel: (open?: boolean) => void;
  setPanelMode: (mode: PanelMode) => void; // 패널 표시 모드 변경 함수
  toggleMobileSidebar: (open?: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      saveLinkDialogOpen: false,
      saveLinkDefaultUrl: undefined,
      createFolderDialogOpen: false,
      rightPanelOpen: false,
      panelMode: 'fixed', // 기본값: 기존 상시 고정 모드
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

      // 패널 표시 방식 설정 변경
      setPanelMode: (mode) =>
        set(() => ({ panelMode: mode })),

      toggleMobileSidebar: (open) =>
        set((state) => ({ mobileSidebarOpen: open ?? !state.mobileSidebarOpen })),
    }),
    {
      name: 'ui-store-settings',
      // 사용자의 패널 모드 선택값만 로컬스토리지에 저장하여 유지
      partialize: (state) => ({ panelMode: state.panelMode }),
    }
  )
);

