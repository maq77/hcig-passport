import { create } from 'zustand';

interface UIStore {
  taskId: string | null;
  newTask: { open: boolean; status?: string; assignee?: string };
  palette: boolean;
  navOpen: boolean;
  openTask: (id: string | null) => void;
  openNewTask: (preset?: { status?: string; assignee?: string }) => void;
  closeNewTask: () => void;
  setPalette: (v: boolean) => void;
  setNav: (v: boolean) => void;
}

export const useUI = create<UIStore>(set => ({
  taskId: null,
  newTask: { open: false },
  palette: false,
  navOpen: false,
  openTask: id => set({ taskId: id }),
  openNewTask: preset => set({ newTask: { open: true, ...preset } }),
  closeNewTask: () => set({ newTask: { open: false } }),
  setPalette: v => set({ palette: v }),
  setNav: v => set({ navOpen: v }),
}));
