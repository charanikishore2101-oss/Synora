import { create } from 'zustand';
import type { UserSettings } from '../types';
import { getItem, setItem, StorageKeys } from '../services/storage';

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Creator',
  avatarUrl: '',
  theme: 'aurora',
  accent: 'violet',
  cursorMode: 'glow',
  defaultSearchEngine: 'google',
  weatherCity: 'San Francisco',
  useCelsius: true,
  clock24h: false,
  showSeconds: false,
  reducedMotion: false,
  highContrast: false,
  widgetVisibility: {
    greeting: true,
    clock: true,
    weather: true,
    goals: true,
    quickActions: true,
    vault: true,
    notes: true,
    clipboard: true,
    focus: true,
  },
  onboardingCompleted: false,
  desktopDemoMode: true,
};

interface SettingsState {
  settings: UserSettings;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  toggleWidget: (widgetKey: keyof UserSettings['widgetVisibility']) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const saved = await getItem<Partial<UserSettings>>(StorageKeys.SETTINGS, DEFAULT_SETTINGS);
      const safeSaved = saved && typeof saved === 'object' ? saved : {};
      const widgetVisibility = {
        ...DEFAULT_SETTINGS.widgetVisibility,
        ...(safeSaved.widgetVisibility || {}),
      };
      const merged: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...safeSaved,
        widgetVisibility,
      };
      set({ settings: merged, isLoaded: true });
    } catch (err) {
      console.error('[SYNORA Settings] Error loading settings:', err);
      set({ settings: DEFAULT_SETTINGS, isLoaded: true });
    }
  },

  updateSettings: async (partial) => {
    const current = get().settings || DEFAULT_SETTINGS;
    const updated = { ...current, ...partial };
    set({ settings: updated });
    await setItem(StorageKeys.SETTINGS, updated);
  },

  toggleWidget: async (widgetKey) => {
    const current = get().settings || DEFAULT_SETTINGS;
    const currentWidgets = current.widgetVisibility || DEFAULT_SETTINGS.widgetVisibility;
    const updatedWidgetVis = {
      ...currentWidgets,
      [widgetKey]: !currentWidgets[widgetKey],
    };
    const updatedSettings = { ...current, widgetVisibility: updatedWidgetVis };
    set({ settings: updatedSettings });
    await setItem(StorageKeys.SETTINGS, updatedSettings);
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_SETTINGS });
    await setItem(StorageKeys.SETTINGS, DEFAULT_SETTINGS);
  },
}));
