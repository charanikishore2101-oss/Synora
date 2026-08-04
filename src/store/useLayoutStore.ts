import { create } from 'zustand';

export type LayoutMode = 'popup' | 'workspace';
export type WorkspaceTab = 'notes' | 'clipboard' | 'vault' | 'focus' | 'calculator' | 'settings' | 'dashboard';

interface LayoutState {
  mode: LayoutMode;
  isMinimized: boolean;
  activeWorkspaceTab: WorkspaceTab;
  setMode: (mode: LayoutMode) => void;
  toggleMode: () => void;
  setActiveWorkspaceTab: (tab: WorkspaceTab) => void;
  expandToWorkspace: (tab?: WorkspaceTab) => void;
  minimizeToPopup: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  mode: 'popup',
  isMinimized: false,
  activeWorkspaceTab: 'notes',

  setMode: (mode) => set({ mode, isMinimized: false }),
  
  toggleMode: () => set((state) => ({
    mode: state.mode === 'popup' ? 'workspace' : 'popup',
    isMinimized: false,
  })),

  setActiveWorkspaceTab: (tab) => set({ activeWorkspaceTab: tab }),

  expandToWorkspace: (tab) => {
    set((state) => ({
      mode: 'workspace',
      isMinimized: false,
      activeWorkspaceTab: tab || state.activeWorkspaceTab,
    }));
  },

  minimizeToPopup: () => set({ mode: 'popup', isMinimized: false }),
}));
