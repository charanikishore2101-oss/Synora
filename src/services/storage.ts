import localforage from 'localforage';

// Configure localforage database
localforage.config({
  name: 'SYNORA_ProductivityCompanion',
  storeName: 'synora_app_data',
  description: 'Offline storage for SYNORA Personal Productivity Companion'
});

export const StorageKeys = {
  SETTINGS: 'synora_settings_v1',
  NOTES: 'synora_notes_v1',
  NOTE_FOLDERS: 'synora_note_folders_v1',
  CLIPBOARD: 'synora_clipboard_v1',
  VAULT_LINKS: 'synora_vault_links_v1',
  VAULT_COLLECTIONS: 'synora_vault_collections_v1',
  TODAY_GOALS: 'synora_today_goals_v1',
  FOCUS_SESSIONS: 'synora_focus_sessions_v1',
  SEARCH_HISTORY: 'synora_search_history_v1',
} as const;

export async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await localforage.getItem<T>(key);
    return data !== null ? data : defaultValue;
  } catch (error) {
    console.warn(`[SYNORA Storage] Failed to get key ${key}:`, error);
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
    console.warn(`[SYNORA Storage] LocalForage failed, falling back to localStorage for key ${key}:`, error);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[SYNORA Storage] Storage set failed:`, err);
    }
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await localforage.removeItem(key);
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[SYNORA Storage] Failed to remove key ${key}:`, error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await localforage.clear();
    localStorage.clear();
  } catch (error) {
    console.error(`[SYNORA Storage] Failed to clear storage:`, error);
  }
}
