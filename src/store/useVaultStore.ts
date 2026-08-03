import { create } from 'zustand';
import type { VaultLink, VaultCollection } from '../types';
import { getItem, setItem, StorageKeys } from '../services/storage';

const INITIAL_COLLECTIONS: VaultCollection[] = [
  { id: 'dev', name: 'Developer Tools', color: '#3b82f6', icon: 'Code' },
  { id: 'design', name: 'Design & UI', color: '#ec4899', icon: 'Palette' },
  { id: 'reading', name: 'Reading List', color: '#10b981', icon: 'BookOpen' },
];

const INITIAL_LINKS: VaultLink[] = [
  {
    id: 'vault-1',
    url: 'https://github.com',
    title: 'GitHub: Where the world builds software',
    description: 'GitHub is where over 100 million developers shape the future of software, together.',
    domain: 'github.com',
    favicon: 'https://github.githubassets.com/favicons/favicon.png',
    readingTimeMinutes: 3,
    tags: ['code', 'git', 'repo'],
    collectionId: 'dev',
    createdAt: Date.now() - 86400000,
    pinned: true,
  },
  {
    id: 'vault-2',
    url: 'https://dribbble.com',
    title: 'Dribbble - Discover the World’s Top Designers',
    description: 'Find top designers & creative professionals on Dribbble. The global community for design.',
    domain: 'dribbble.com',
    favicon: 'https://cdn.dribbble.com/assets/favicon-b38525132fd2e499162e8c005ed40f01200a570a20963ae8c9db13b137b0cf77.ico',
    readingTimeMinutes: 5,
    tags: ['design', 'inspiration', 'ui'],
    collectionId: 'design',
    createdAt: Date.now() - 172800000,
    pinned: true,
  },
  {
    id: 'vault-3',
    url: 'https://news.ycombinator.com',
    title: 'Hacker News',
    description: 'Hacker News is a social news website focusing on computer science and entrepreneurship.',
    domain: 'ycombinator.com',
    favicon: 'https://news.ycombinator.com/favicon.ico',
    readingTimeMinutes: 8,
    tags: ['news', 'tech', 'startups'],
    collectionId: 'reading',
    createdAt: Date.now() - 259200000,
    pinned: false,
  },
];

interface VaultState {
  links: VaultLink[];
  collections: VaultCollection[];
  selectedCollectionId: string | null;
  searchQuery: string;
  isLoaded: boolean;
  loadVault: () => Promise<void>;
  setSelectedCollectionId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  addLink: (url: string, title?: string, description?: string, tags?: string[], collectionId?: string) => Promise<VaultLink>;
  deleteLink: (id: string) => Promise<void>;
  togglePinLink: (id: string) => Promise<void>;
  createCollection: (name: string, color: string) => Promise<VaultCollection>;
  deleteCollection: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  links: [],
  collections: [],
  selectedCollectionId: null,
  searchQuery: '',
  isLoaded: false,

  loadVault: async () => {
    const savedLinks = await getItem<VaultLink[]>(StorageKeys.VAULT_LINKS, INITIAL_LINKS);
    const savedCollections = await getItem<VaultCollection[]>(StorageKeys.VAULT_COLLECTIONS, INITIAL_COLLECTIONS);
    set({ links: savedLinks, collections: savedCollections, isLoaded: true });
  },

  setSelectedCollectionId: (id) => set({ selectedCollectionId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  addLink: async (url, title, description, tags = [], collectionId) => {
    let domain = url;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = parsed.hostname.replace('www.', '');
    } catch {
      // fallback
    }

    const newLink: VaultLink = {
      id: `vault-${Date.now()}`,
      url: url.startsWith('http') ? url : `https://${url}`,
      title: title || domain || 'Saved Bookmark',
      description: description || `Saved link from ${domain}`,
      domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      readingTimeMinutes: Math.floor(Math.random() * 5) + 2,
      tags,
      collectionId: collectionId || get().selectedCollectionId || undefined,
      createdAt: Date.now(),
      pinned: false,
    };

    const updated = [newLink, ...get().links];
    set({ links: updated });
    await setItem(StorageKeys.VAULT_LINKS, updated);
    return newLink;
  },

  deleteLink: async (id) => {
    const updated = get().links.filter((l) => l.id !== id);
    set({ links: updated });
    await setItem(StorageKeys.VAULT_LINKS, updated);
  },

  togglePinLink: async (id) => {
    const updated = get().links.map((l) =>
      l.id === id ? { ...l, pinned: !l.pinned } : l
    );
    set({ links: updated });
    await setItem(StorageKeys.VAULT_LINKS, updated);
  },

  createCollection: async (name, color) => {
    const newCol: VaultCollection = {
      id: `col-${Date.now()}`,
      name,
      color,
    };
    const updated = [...get().collections, newCol];
    set({ collections: updated });
    await setItem(StorageKeys.VAULT_COLLECTIONS, updated);
    return newCol;
  },

  deleteCollection: async (id) => {
    const updatedCols = get().collections.filter((c) => c.id !== id);
    const updatedLinks = get().links.map((l) =>
      l.collectionId === id ? { ...l, collectionId: undefined } : l
    );
    set({ collections: updatedCols, links: updatedLinks });
    await setItem(StorageKeys.VAULT_COLLECTIONS, updatedCols);
    await setItem(StorageKeys.VAULT_LINKS, updatedLinks);
  },
}));
