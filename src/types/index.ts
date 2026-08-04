export type EngineId = 'google' | 'youtube' | 'github' | 'stackoverflow' | 'wikipedia' | 'notes' | 'clipboard' | 'vault';

export interface SearchEngine {
  id: EngineId;
  name: string;
  url: string;
  icon: string;
  placeholder: string;
  color: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  engine: EngineId;
  timestamp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // HTML or JSON content
  folderId?: string;
  tags: string[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type ClipboardCategory = 'text' | 'link' | 'email' | 'phone' | 'code' | 'color';


export interface ClipboardItem {
  id: string;
  content: string;
  category: ClipboardCategory;
  pinned: boolean;
  timestamp: number;
  tags?: string[];
}

export interface VaultLink {
  id: string;
  url: string;
  title: string;
  description: string;
  domain: string;
  favicon?: string;
  thumbnail?: string;
  readingTimeMinutes: number;
  tags: string[];
  collectionId?: string;
  createdAt: number;
  pinned: boolean;
}

export interface VaultCollection {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface TodayGoal {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export type FocusMode = 'work' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  durationMinutes: number;
  mode: FocusMode;
  completedAt: number;
}

export type SoundTrackId = 'rain' | 'waves' | 'forest' | 'whitenoise' | 'synth';

export interface AmbientSound {
  id: SoundTrackId;
  name: string;
  volume: number; // 0 to 1
  active: boolean;
}

export type ThemeId = 'aurora' | 'midnight' | 'cyberpunk' | 'sunset' | 'light';

export type AccentColor = 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber';

export type CursorMode = 'glow' | 'particles' | 'magnetic' | 'minimal' | 'disabled';

export interface UserSettings {
  userName: string;
  avatarUrl?: string;
  theme: ThemeId;
  accent: AccentColor;
  cursorMode: CursorMode;
  defaultSearchEngine: EngineId;
  weatherCity: string;
  useCelsius: boolean;
  clock24h: boolean;
  showSeconds: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  widgetVisibility: {
    greeting: boolean;
    clock: boolean;
    weather: boolean;
    goals: boolean;
    quickActions: boolean;
    vault: boolean;
    notes: boolean;
    clipboard: boolean;
    focus: boolean;
  };
  onboardingCompleted: boolean;
  desktopDemoMode: boolean;
}
