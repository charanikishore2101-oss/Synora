import localforage from 'localforage';

// Configure localforage database
localforage.config({
  name: 'LUMA_StartPage',
  storeName: 'luma_app_data',
  description: 'Offline storage for LUMA Intelligent Start Page'
});

export const StorageKeys = {
  SETTINGS: 'luma_settings_v1',
  NOTES: 'luma_notes_v1',
  NOTE_FOLDERS: 'luma_note_folders_v1',
  CLIPBOARD: 'luma_clipboard_v1',
  VAULT_LINKS: 'luma_vault_links_v1',
  VAULT_COLLECTIONS: 'luma_vault_collections_v1',
  TODAY_GOALS: 'luma_today_goals_v1',
  FOCUS_SESSIONS: 'luma_focus_sessions_v1',
  SEARCH_HISTORY: 'luma_search_history_v1',
} as const;

export async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await localforage.getItem<T>(key);
    return data !== null ? data : defaultValue;
  } catch (error) {
    console.warn(`[LUMA Storage] Failed to get key ${key}:`, error);
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await localforage.setItem(key, value);
  } catch (error) {
    console.warn(`[LUMA Storage] LocalForage failed, falling back to localStorage for key ${key}:`, error);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[LUMA Storage] Storage set failed:`, err);
    }
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await localforage.removeItem(key);
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[LUMA Storage] Failed to remove key ${key}:`, error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await localforage.clear();
    localStorage.clear();
  } catch (error) {
    console.error(`[LUMA Storage] Failed to clear storage:`, error);
  }
}
