import { create } from 'zustand';
import type { ClipboardItem, ClipboardCategory } from '../types';
import { getItem, setItem, StorageKeys } from '../services/storage';

import { isColorString } from '../services/tauri';

function categorizeText(content: string): ClipboardCategory {
  const trimmed = content.trim();
  if (isColorString(trimmed)) return 'color';
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) return 'link';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email';
  if (/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(trimmed) && trimmed.length >= 7) return 'phone';
  if (
    trimmed.includes('{') ||
    trimmed.includes('const ') ||
    trimmed.includes('function ') ||
    trimmed.includes('import ') ||
    trimmed.includes('</') ||
    trimmed.includes('=>')
  ) {
    return 'code';
  }
  return 'text';
}

const INITIAL_CLIPBOARD: ClipboardItem[] = [
  {
    id: 'clip-color-1',
    content: '#8b5cf6',
    category: 'color',
    pinned: true,
    timestamp: Date.now() - 30000,
    tags: ['theme', 'accent'],
  },

  {
    id: 'clip-1',
    content: 'https://synora.workspace.design',
    category: 'link',
    pinned: true,
    timestamp: Date.now() - 120000,
    tags: ['essential'],
  },
  {
    id: 'clip-2',
    content: 'const synoraEngine = new LivingCursor({ velocity: 0.8, glow: true });',
    category: 'code',
    pinned: false,
    timestamp: Date.now() - 600000,
  },
  {
    id: 'clip-3',
    content: 'support@synora.design',
    category: 'email',
    pinned: false,
    timestamp: Date.now() - 1800000,
  },
];

interface ClipboardState {
  items: ClipboardItem[];
  searchQuery: string;
  selectedCategory: ClipboardCategory | 'all';
  isLoaded: boolean;
  loadClipboard: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: ClipboardCategory | 'all') => void;
  addItem: (content: string) => Promise<ClipboardItem | null>;
  deleteItem: (id: string) => Promise<void>;
  togglePinItem: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useClipboardStore = create<ClipboardState>((set, get) => ({
  items: [],
  searchQuery: '',
  selectedCategory: 'all',
  isLoaded: false,

  loadClipboard: async () => {
    const saved = await getItem<ClipboardItem[]>(StorageKeys.CLIPBOARD, INITIAL_CLIPBOARD);
    set({ items: saved, isLoaded: true });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  addItem: async (content) => {
    const trimmed = content.trim();
    if (!trimmed) return null;

    const existing = get().items.find((i) => i.content === trimmed);
    if (existing) {
      const filtered = get().items.filter((i) => i.id !== existing.id);
      const updatedExisting = { ...existing, timestamp: Date.now() };
      const updated = [updatedExisting, ...filtered];
      set({ items: updated });
      await setItem(StorageKeys.CLIPBOARD, updated);
      return updatedExisting;
    }

    const newItem: ClipboardItem = {
      id: `clip-${Date.now()}`,
      content: trimmed,
      category: categorizeText(trimmed),
      pinned: false,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...get().items];
    set({ items: updated });
    await setItem(StorageKeys.CLIPBOARD, updated);
    return newItem;
  },

  deleteItem: async (id) => {
    const updated = get().items.filter((i) => i.id !== id);
    set({ items: updated });
    await setItem(StorageKeys.CLIPBOARD, updated);
  },

  togglePinItem: async (id) => {
    const updated = get().items.map((i) =>
      i.id === id ? { ...i, pinned: !i.pinned } : i
    );
    set({ items: updated });
    await setItem(StorageKeys.CLIPBOARD, updated);
  },

  clearAll: async () => {
    const pinnedItems = get().items.filter((i) => i.pinned);
    set({ items: pinnedItems });
    await setItem(StorageKeys.CLIPBOARD, pinnedItems);
  },
}));
