import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  GitBranch,
  FileText,
  Clipboard,
  Bookmark,
  Flame,
  Settings,
  Maximize2,
  Sun,
  Moon,
  Sunrise,
  History,
  X,
  Plus,
  CheckCircle2,
  Palette,
  ExternalLink,
  Calculator as CalcIcon,
  Pin,
  Trash2,
  Copy,
  Check,
  Edit2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useClipboardStore } from '../../store/useClipboardStore';
import { useVaultStore } from '../../store/useVaultStore';
import { useFocusStore } from '../../store/useFocusStore';
import { useLayoutStore, type WorkspaceTab } from '../../store/useLayoutStore';
import { isURLString, extractURLMetadata, hideNativeWindow } from '../../services/tauri';
import { MiniCalculator } from '../calculator/MiniCalculator';

const ANIMATED_PLACEHOLDERS = [
  'What would you like to do today?',
  'Search GitHub...',
  'Create a note...',
  'Open Clipboard...',
  'Start Focus Mode...',
  'Save a Link...',
  'Calculate 245 × 18...',
];

type MiniTab = 'search' | 'notes' | 'clipboard' | 'vault' | 'focus' | 'calculator';

interface UnifiedSearchResult {
  id: string;
  type: 'command' | 'web' | 'note' | 'clipboard' | 'vault' | 'history';
  title: string;
  subtitle?: string;
  category: string;
  targetTab: WorkspaceTab;
  icon: React.ReactNode;
  action: () => void;
}

interface SpotlightPopupProps {
  onOpenSettings: () => void;
  onOpenCommand: () => void;
}

export function SpotlightPopup({ onOpenSettings }: SpotlightPopupProps) {
  const { settings, updateSettings } = useSettingsStore();
  const { createNote, updateNote, deleteNote, togglePinNote, notes } = useNotesStore();
  const { items: clipboardItems, deleteItem: deleteClip, togglePinItem: togglePinClip } = useClipboardStore();
  const { links: vaultLinks, addLink: addVaultLink, deleteLink: deleteVault, togglePinLink: togglePinVault } = useVaultStore();
  const { timeLeft, isRunning, mode: focusMode, startTimer, pauseTimer, resetTimer } = useFocusStore();
  const { expandToWorkspace } = useLayoutStore();

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [activeMiniTab, setActiveMiniTab] = useState<MiniTab>('search');
  const [query, setQuery] = useState('');
  const [history] = useState<{ id: string; query: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteEditTitle, setNoteEditTitle] = useState('');

  const [timeString, setTimeString] = useState('');
  const [greetingText, setGreetingText] = useState('Good Morning');
  const [greetingIcon, setGreetingIcon] = useState<React.ReactNode>(<Sunrise className="w-4 h-4 text-amber-400" />);

  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder text
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ANIMATED_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Time & Greeting tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: !settings.clock24h,
      };
      setTimeString(now.toLocaleTimeString([], options));

      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setGreetingText('Good Morning');
        setGreetingIcon(<Sunrise className="w-4 h-4 text-amber-400" />);
      } else if (hour >= 12 && hour < 18) {
        setGreetingText('Good Afternoon');
        setGreetingIcon(<Sun className="w-4 h-4 text-yellow-400" />);
      } else {
        setGreetingText('Good Evening');
        setGreetingIcon(<Moon className="w-4 h-4 text-indigo-400" />);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.clock24h]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // UNIFIED SEARCH ENGINE WITH INTELLIGENT DIRECT EXPANSION
  const unifiedResults: UnifiedSearchResult[] = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const list: UnifiedSearchResult[] = [];

    if (!trimmed) {
      if (history.length > 0) {
        history.slice(0, 3).forEach((h) => {
          list.push({
            id: `hist-${h.id}`,
            type: 'history',
            title: h.query,
            subtitle: 'Recent Search Query',
            category: 'History',
            targetTab: 'notes',
            icon: <History className="w-3.5 h-3.5 text-violet-400" />,
            action: () => setQuery(h.query),
          });
        });
      }
      return list;
    }

    // Web Search
    list.push({
      id: 'web-google',
      type: 'web',
      title: `Search Google for "${query}"`,
      subtitle: 'Open in web browser',
      category: 'Web Search',
      targetTab: 'dashboard',
      icon: <Globe className="w-3.5 h-3.5 text-blue-400" />,
      action: () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        setQuery('');
      },
    });

    list.push({
      id: 'web-github',
      type: 'web',
      title: `Search GitHub for "${query}"`,
      subtitle: 'Search code repositories',
      category: 'Web Search',
      targetTab: 'dashboard',
      icon: <GitBranch className="w-3.5 h-3.5 text-gray-300" />,
      action: () => {
        window.open(`https://github.com/search?q=${encodeURIComponent(query)}`, '_blank');
        setQuery('');
      },
    });

    // Notes -> Direct expansion to Notes Workspace
    notes
      .filter((n) => n.title.toLowerCase().includes(trimmed) || n.content.toLowerCase().includes(trimmed))
      .slice(0, 3)
      .forEach((n) => {
        list.push({
          id: `note-${n.id}`,
          type: 'note',
          title: n.title,
          subtitle: n.content.replace(/<[^>]*>?/gm, '').slice(0, 60),
          category: 'Notes',
          targetTab: 'notes',
          icon: <FileText className="w-3.5 h-3.5 text-violet-400" />,
          action: () => {
            expandToWorkspace('notes');
            setQuery('');
          },
        });
      });

    // Clipboard -> Direct expansion to Clipboard Workspace
    clipboardItems
      .filter((c) => c.content.toLowerCase().includes(trimmed))
      .slice(0, 3)
      .forEach((c) => {
        list.push({
          id: `clip-${c.id}`,
          type: 'clipboard',
          title: c.content,
          subtitle: `Category: ${c.category}`,
          category: 'Clipboard',
          targetTab: 'clipboard',
          icon: <Clipboard className="w-3.5 h-3.5 text-cyan-400" />,
          action: () => {
            navigator.clipboard.writeText(c.content);
            triggerToast('Copied to Clipboard!');
            setQuery('');
          },
        });
      });

    // Link Vault -> Direct expansion to Vault Workspace
    vaultLinks
      .filter((l) => l.title.toLowerCase().includes(trimmed) || l.url.toLowerCase().includes(trimmed))
      .slice(0, 3)
      .forEach((l) => {
        list.push({
          id: `vault-${l.id}`,
          type: 'vault',
          title: l.title,
          subtitle: l.domain,
          category: 'Link Vault',
          targetTab: 'vault',
          icon: <Bookmark className="w-3.5 h-3.5 text-emerald-400" />,
          action: () => {
            window.open(l.url, '_blank');
            setQuery('');
          },
        });
      });

    // System Commands
    if ('focus timer studio'.includes(trimmed)) {
      list.push({
        id: 'cmd-focus',
        type: 'command',
        title: isRunning ? 'Pause Focus Timer' : 'Start Focus Timer',
        subtitle: 'Toggle Pomodoro session',
        category: 'Commands',
        targetTab: 'focus',
        icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
        action: () => {
          if (isRunning) pauseTimer();
          else startTimer();
          expandToWorkspace('focus');
        },
      });
    }

    if ('calculator math science'.includes(trimmed)) {
      list.push({
        id: 'cmd-calc',
        type: 'command',
        title: 'Open Calculator Workspace',
        subtitle: 'Standard & Scientific Math Engine',
        category: 'Commands',
        targetTab: 'calculator',
        icon: <CalcIcon className="w-3.5 h-3.5 text-pink-400" />,
        action: () => expandToWorkspace('calculator'),
      });
    }

    if ('theme dark midnight cyberpunk aurora'.includes(trimmed)) {
      list.push({
        id: 'cmd-theme',
        type: 'command',
        title: 'Switch to OLED Midnight Theme',
        subtitle: 'Appearance Settings',
        category: 'Commands',
        targetTab: 'settings',
        icon: <Palette className="w-3.5 h-3.5 text-purple-400" />,
        action: () => updateSettings({ theme: 'midnight' }),
      });
    }

    return list;
  }, [query, notes, clipboardItems, vaultLinks, history, isRunning, pauseTimer, startTimer, expandToWorkspace, updateSettings]);

  const handleExecute = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (isURLString(trimmed)) {
      const meta = extractURLMetadata(trimmed);
      await addVaultLink(meta.url, meta.title, meta.description, [meta.category]);
      setQuery('');
      triggerToast(`Saved to Link Vault: ${meta.domain}`);
      return;
    }

    if (unifiedResults[selectedIndex]) {
      unifiedResults[selectedIndex].action();
      return;
    }

    await createNote(trimmed);
    setQuery('');
    triggerToast('Quick note saved instantly!');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, unifiedResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + unifiedResults.length) % Math.max(1, unifiedResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        expandToWorkspace(activeMiniTab === 'search' ? 'notes' : activeMiniTab);
      } else {
        handleExecute();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (query) setQuery('');
      else hideNativeWindow();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedText = e.dataTransfer.getData('text');
    if (droppedText && isURLString(droppedText.trim())) {
      const meta = extractURLMetadata(droppedText.trim());
      await addVaultLink(meta.url, meta.title, meta.description, [meta.category]);
      triggerToast(`Bookmarked link: ${meta.domain}`);
    } else if (droppedText) {
      await createNote(droppedText.slice(0, 60));
      triggerToast('Text saved as Quick Note!');
    }
  };

  return (
    <motion.div
      layoutId="synora-main-container"
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 10 }}
      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-[700px] h-[520px] rounded-3xl glass-panel border border-white/20 shadow-2xl flex flex-col justify-between overflow-hidden relative z-30 transition-all duration-300 ${
        isDragOver ? 'ring-4 ring-violet-500/50 scale-[1.01]' : ''
      }`}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-emerald-500/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER SECTION */}
      <div className="px-6 pt-4 pb-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
            <span className="text-sm font-extrabold text-white">
              {(settings.userName || 'L').charAt(0).toUpperCase()}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              {greetingIcon}
              <span className="text-xs font-semibold text-gray-200">{greetingText}, {settings.userName || 'Creator'}</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{timeString}</p>
          </div>
        </div>

        {/* Feature Navigation Tabs inside Popup */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          {(['search', 'notes', 'clipboard', 'vault', 'calculator', 'focus'] as const).map((tab) => {
            const isActive = activeMiniTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveMiniTab(tab)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold capitalize transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => expandToWorkspace(activeMiniTab === 'search' ? 'notes' : activeMiniTab)}
            data-magnetic
            title="Expand to Full Workspace (Ctrl + Enter)"
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CENTER VIEWPORT (SEARCH OR MINI WORKSPACE TAB) */}
      <div className="px-6 py-4 flex-1 flex flex-col justify-start gap-3 overflow-hidden">
        {/* MINI SEARCH TAB */}
        {activeMiniTab === 'search' && (
          <>
            <div className="p-3.5 rounded-2xl glass-panel flex items-center gap-3 border-white/15 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/30 transition-all shadow-md">
              <Search className="w-5 h-5 text-violet-400 shrink-0" />

              <input
                ref={inputRef}
                type="text"
                data-cursor="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={query ? '' : ANIMATED_PLACEHOLDERS[placeholderIndex]}
                className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-base font-medium py-0.5"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {query ? (
                unifiedResults.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    Press <kbd className="font-mono text-white px-1 py-0.5 rounded bg-white/10">Enter</kbd> to save &quot;{query}&quot; as Quick Note
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">
                      Unified Search Results
                    </div>
                    {unifiedResults.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                            isSelected
                              ? 'bg-violet-500/25 border border-violet-500/40 text-white shadow-md'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                              {item.icon}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold text-white block truncate">{item.title}</span>
                              {item.subtitle && <span className="text-[10px] text-gray-400 block truncate">{item.subtitle}</span>}
                            </div>
                          </div>

                          <span className="text-[10px] text-gray-400 uppercase px-2 py-0.5 rounded bg-white/10 font-mono shrink-0 ml-2">
                            {item.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Default Quick Direct Expansions Cards */
                <div className="grid grid-cols-3 gap-3">
                  {/* Recent Clipboard Card -> Directly expands into Clipboard Workspace */}
                  <div
                    onClick={() => expandToWorkspace('clipboard')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="text-[11px] font-semibold text-cyan-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clipboard className="w-3.5 h-3.5" /> Recent Clipboard
                      </span>
                    </div>
                    {clipboardItems.slice(0, 2).map((clip) => (
                      <div
                        key={clip.id}
                        className="p-1.5 rounded-xl bg-white/5 text-[11px] truncate text-gray-300 border border-white/5 flex items-center justify-between"
                      >
                        <span className="truncate">{clip.content}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Notes Card -> Directly expands into Notes Workspace */}
                  <div
                    onClick={() => expandToWorkspace('notes')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="text-[11px] font-semibold text-violet-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Recent Notes
                      </span>
                    </div>
                    {notes.slice(0, 2).map((note) => (
                      <div
                        key={note.id}
                        className="p-1.5 rounded-xl bg-white/5 text-[11px] truncate text-gray-300 border border-white/5"
                      >
                        <span className="font-semibold text-white block truncate">{note.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Links Card -> Directly expands into Vault Workspace */}
                  <div
                    onClick={() => expandToWorkspace('vault')}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="text-[11px] font-semibold text-emerald-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5" /> Recent Vault Links
                      </span>
                    </div>
                    {vaultLinks.slice(0, 2).map((link) => (
                      <div
                        key={link.id}
                        className="p-1.5 rounded-xl bg-white/5 text-[11px] truncate text-gray-300 border border-white/5 flex items-center justify-between"
                      >
                        <span className="truncate text-white font-medium">{link.title}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* MINI NOTES TAB (Fully Functional Inline Notes Workspace) */}
        {activeMiniTab === 'notes' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Mini Notes ({notes.length})
              </span>
              <button
                onClick={async () => {
                  const newNote = await createNote('New Quick Note');
                  setEditingNoteId(newNote.id);
                  setNoteEditTitle('New Quick Note');
                }}
                className="px-2.5 py-1 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Note
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    note.pinned ? 'bg-violet-500/15 border-violet-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {editingNoteId === note.id ? (
                      <input
                        type="text"
                        value={noteEditTitle}
                        onChange={(e) => setNoteEditTitle(e.target.value)}
                        onBlur={() => {
                          updateNote(note.id, { title: noteEditTitle });
                          setEditingNoteId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateNote(note.id, { title: noteEditTitle });
                            setEditingNoteId(null);
                          }
                        }}
                        autoFocus
                        className="bg-black/30 text-white text-xs font-semibold px-2 py-0.5 rounded-lg border border-violet-500/50 focus:outline-none"
                      />
                    ) : (
                      <h4
                        onClick={() => expandToWorkspace('notes')}
                        className="text-xs font-bold text-white cursor-pointer hover:text-violet-300 truncate max-w-[360px]"
                      >
                        {note.title}
                      </h4>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setNoteEditTitle(note.title);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-white"
                        title="Edit Title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1 rounded ${note.pinned ? 'text-amber-400' : 'text-gray-400 hover:text-white'}`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{note.content.replace(/<[^>]*>?/gm, '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MINI CLIPBOARD TAB (Fully Functional Mini Clipboard) */}
        {activeMiniTab === 'clipboard' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <Clipboard className="w-4 h-4" /> Mini Clipboard ({clipboardItems.length})
              </span>
              <button
                onClick={() => expandToWorkspace('clipboard')}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
              >
                <span>Full Timeline</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
              {clipboardItems.map((clip) => {
                const isCopied = copiedClipId === clip.id;
                return (
                  <div
                    key={clip.id}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-between transition-all"
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-mono text-gray-200 block truncate">{clip.content}</span>
                      <span className="text-[9px] uppercase font-mono text-cyan-300">{clip.category}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(clip.content);
                          setCopiedClipId(clip.id);
                          setTimeout(() => setCopiedClipId(null), 1800);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button onClick={() => togglePinClip(clip.id)} className={`p-1.5 rounded-lg ${clip.pinned ? 'text-amber-400' : 'text-gray-400'}`}>
                        <Pin className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteClip(clip.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MINI LINK VAULT TAB (Fully Functional Mini Bookmark Manager) */}
        {activeMiniTab === 'vault' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4" /> Mini Link Vault ({vaultLinks.length})
              </span>
              <button
                onClick={() => expandToWorkspace('vault')}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
              >
                <span>Full Vault</span>
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
              {vaultLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-between transition-all"
                >
                  <div className="truncate pr-2">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-white hover:text-emerald-300 truncate block">
                      {link.title}
                    </a>
                    <span className="text-[10px] text-gray-400 font-mono block">{link.domain}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePinVault(link.id)} className={`p-1.5 rounded-lg ${link.pinned ? 'text-amber-400' : 'text-gray-400'}`}>
                      <Pin className="w-3 h-3" />
                    </button>
                    <button onClick={() => deleteVault(link.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MINI CALCULATOR TAB (Scientific Expression Math Engine) */}
        {activeMiniTab === 'calculator' && <MiniCalculator />}

        {/* MINI FOCUS TAB (Live Pomodoro Controls) */}
        {activeMiniTab === 'focus' && (
          <div className="flex-1 flex flex-col justify-between items-center text-center p-4">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Focus Timer • {focusMode}
            </span>

            <div className="text-5xl font-extrabold text-white font-mono tracking-tighter my-4 drop-shadow-lg">
              {formatTimer(timeLeft)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => (isRunning ? pauseTimer() : startTimer())}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-lg hover:brightness-110 flex items-center gap-2"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause' : 'Start Session'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-300 border border-white/10"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM QUICK ACTIONS BAR */}
      <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => expandToWorkspace('clipboard')}
            data-magnetic
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 font-semibold transition-all group"
          >
            <Clipboard className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Clipboard</span>
          </button>

          <button
            onClick={() => expandToWorkspace('notes')}
            data-magnetic
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 font-semibold transition-all group"
          >
            <FileText className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => expandToWorkspace('vault')}
            data-magnetic
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 font-semibold transition-all group"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Vault</span>
          </button>

          <button
            onClick={() => expandToWorkspace('calculator')}
            data-magnetic
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 font-semibold transition-all group"
          >
            <CalcIcon className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
            <span>Calculator</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            data-magnetic
            title="Settings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => expandToWorkspace(activeMiniTab === 'search' ? 'notes' : activeMiniTab)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md transition-all"
          >
            <span>Expand</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
