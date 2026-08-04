import { create } from 'zustand';
import type { Note, NoteFolder } from '../types';
import { getItem, setItem, StorageKeys } from '../services/storage';

const INITIAL_FOLDERS: NoteFolder[] = [
  { id: 'personal', name: 'Personal', color: '#8b5cf6', icon: 'User' },
  { id: 'work', name: 'Work', color: '#06b6d4', icon: 'Briefcase' },
  { id: 'ideas', name: 'Ideas & Drafts', color: '#10b981', icon: 'Lightbulb' },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome',
    title: '🚀 Welcome to SYNORA Quick Notes',
    content: `<h2>Welcome to SYNORA Quick Notes!</h2><p>This is a full Markdown &amp; Rich Text TipTap editor built right into your personal productivity companion.</p><ul><li><p><strong>Checklists:</strong> Track your tasks instantly</p></li><li><p><strong>Code blocks:</strong> Store code snippets with formatting</p></li><li><p><strong>Folders &amp; Tags:</strong> Organize ideas effortlessly</p></li></ul><p>Start writing by creating a new note or modifying this draft!</p>`,
    folderId: 'ideas',
    tags: ['welcome', 'guide'],
    pinned: true,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
];

interface NotesState {
  notes: Note[];
  folders: NoteFolder[];
  activeNoteId: string | null;
  searchQuery: string;
  selectedFolderId: string | null;
  isLoaded: boolean;
  loadNotes: () => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  createNote: (title?: string, folderId?: string) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  createFolder: (name: string, color: string) => Promise<NoteFolder>;
  deleteFolder: (folderId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  folders: [],
  activeNoteId: null,
  searchQuery: '',
  selectedFolderId: null,
  isLoaded: false,

  loadNotes: async () => {
    const savedNotes = await getItem<Note[]>(StorageKeys.NOTES, INITIAL_NOTES);
    const savedFolders = await getItem<NoteFolder[]>(StorageKeys.NOTE_FOLDERS, INITIAL_FOLDERS);
    set({
      notes: savedNotes,
      folders: savedFolders,
      activeNoteId: savedNotes.length > 0 ? savedNotes[0].id : null,
      isLoaded: true,
    });
  },

  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId }),

  createNote: async (title = 'Untitled Note', folderId) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title,
      content: '<p></p>',
      folderId: folderId || get().selectedFolderId || undefined,
      tags: [],
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...get().notes];
    set({ notes: updated, activeNoteId: newNote.id });
    await setItem(StorageKeys.NOTES, updated);
    return newNote;
  },

  updateNote: async (id, updates) => {
    const updated = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    set({ notes: updated });
    await setItem(StorageKeys.NOTES, updated);
  },

  deleteNote: async (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    const nextActive = get().activeNoteId === id ? (updated[0]?.id || null) : get().activeNoteId;
    set({ notes: updated, activeNoteId: nextActive });
    await setItem(StorageKeys.NOTES, updated);
  },

  togglePinNote: async (id) => {
    const updated = get().notes.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    set({ notes: updated });
    await setItem(StorageKeys.NOTES, updated);
  },

  createFolder: async (name, color) => {
    const newFolder: NoteFolder = {
      id: `folder-${Date.now()}`,
      name,
      color,
    };
    const updated = [...get().folders, newFolder];
    set({ folders: updated });
    await setItem(StorageKeys.NOTE_FOLDERS, updated);
    return newFolder;
  },

  deleteFolder: async (folderId) => {
    const updatedFolders = get().folders.filter((f) => f.id !== folderId);
    const updatedNotes = get().notes.map((n) =>
      n.folderId === folderId ? { ...n, folderId: undefined } : n
    );
    set({ folders: updatedFolders, notes: updatedNotes });
    await setItem(StorageKeys.NOTE_FOLDERS, updatedFolders);
    await setItem(StorageKeys.NOTES, updatedNotes);
  },
}));
