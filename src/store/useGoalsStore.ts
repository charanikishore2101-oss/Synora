import { create } from 'zustand';
import type { TodayGoal } from '../types';
import { getItem, setItem, StorageKeys } from '../services/storage';

const INITIAL_GOALS: TodayGoal[] = [
  { id: 'goal-1', title: 'Review project specs for LUMA v1.0', completed: true, createdAt: Date.now() - 7200000 },
  { id: 'goal-2', title: 'Complete deep focus session in Focus Studio', completed: false, createdAt: Date.now() - 3600000 },
  { id: 'goal-3', title: 'Organize design bookmarks in Link Vault', completed: false, createdAt: Date.now() - 1800000 },
];

interface GoalsState {
  goals: TodayGoal[];
  isLoaded: boolean;
  loadGoals: () => Promise<void>;
  addGoal: (title: string) => Promise<TodayGoal | null>;
  toggleGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoaded: false,

  loadGoals: async () => {
    const saved = await getItem<TodayGoal[]>(StorageKeys.TODAY_GOALS, INITIAL_GOALS);
    set({ goals: saved, isLoaded: true });
  },

  addGoal: async (title) => {
    const trimmed = title.trim();
    if (!trimmed) return null;

    const newGoal: TodayGoal = {
      id: `goal-${Date.now()}`,
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    const updated = [newGoal, ...get().goals];
    set({ goals: updated });
    await setItem(StorageKeys.TODAY_GOALS, updated);
    return newGoal;
  },

  toggleGoal: async (id) => {
    const updated = get().goals.map((g) =>
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    set({ goals: updated });
    await setItem(StorageKeys.TODAY_GOALS, updated);
  },

  deleteGoal: async (id) => {
    const updated = get().goals.filter((g) => g.id !== id);
    set({ goals: updated });
    await setItem(StorageKeys.TODAY_GOALS, updated);
  },

  clearCompleted: async () => {
    const updated = get().goals.filter((g) => !g.completed);
    set({ goals: updated });
    await setItem(StorageKeys.TODAY_GOALS, updated);
  },
}));
