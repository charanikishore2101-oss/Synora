import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Globe,
  Video,
  GitBranch,
  Code2,
  BookOpen,
  FileText,
  Clipboard,
  Bookmark,
  ArrowRight,
  History,
  X,
  Sparkles,
} from 'lucide-react';
import type { EngineId, SearchEngine, SearchHistoryItem } from '../../types';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useClipboardStore } from '../../store/useClipboardStore';
import { useVaultStore } from '../../store/useVaultStore';
import { getItem, setItem, StorageKeys } from '../../services/storage';

const SEARCH_ENGINES: SearchEngine[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'Globe', placeholder: 'Search Google or type a URL...', color: '#4285F4' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', icon: 'Video', placeholder: 'Search YouTube videos...', color: '#FF0000' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=', icon: 'GitBranch', placeholder: 'Search GitHub repositories...', color: '#24292e' },
  { id: 'stackoverflow', name: 'Stack Overflow', url: 'https://stackoverflow.com/search?q=', icon: 'Code2', placeholder: 'Search Stack Overflow answers...', color: '#F48024' },
  { id: 'wikipedia', name: 'Wikipedia', url: 'https://en.wikipedia.org/w/index.php?search=', icon: 'BookOpen', placeholder: 'Search Wikipedia articles...', color: '#636466' },
  { id: 'notes', name: 'Notes', url: '', icon: 'FileText', placeholder: 'Search your Quick Notes...', color: '#8B5CF6' },
  { id: 'clipboard', name: 'Clipboard', url: '', icon: 'Clipboard', placeholder: 'Search Clipboard history...', color: '#06B6D4' },
  { id: 'vault', name: 'Link Vault', url: '', icon: 'Bookmark', placeholder: 'Search saved links in Vault...', color: '#10B981' },
];

export function UniversalSearch() {
  const { settings } = useSettingsStore();
  const [activeEngine, setActiveEngine] = useState<EngineId>(settings.defaultSearchEngine || 'google');
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { notes } = useNotesStore();
  const { items: clipboardItems } = useClipboardStore();
  const { links: vaultLinks } = useVaultStore();

  useEffect(() => {
    getItem<SearchHistoryItem[]>(StorageKeys.SEARCH_HISTORY, []).then(setHistory);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentEngineObj = SEARCH_ENGINES.find((e) => e.id === activeEngine) || SEARCH_ENGINES[0];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const newItem: SearchHistoryItem = {
      id: `hist-${Date.now()}`,
      query: trimmed,
      engine: activeEngine,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...history.filter((h) => h.query !== trimmed)].slice(0, 10);
    setHistory(updated);
    setItem(StorageKeys.SEARCH_HISTORY, updated);

    if (currentEngineObj.url) {
      window.open(`${currentEngineObj.url}${encodeURIComponent(trimmed)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    setItem(StorageKeys.SEARCH_HISTORY, updated);
  };

  const filteredNotes = activeEngine === 'notes' && query
    ? notes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredClipboard = activeEngine === 'clipboard' && query
    ? clipboardItems.filter((c) => c.content.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredVault = activeEngine === 'vault' && query
    ? vaultLinks.filter((l) => l.title.toLowerCase().includes(query.toLowerCase()) || l.url.toLowerCase().includes(query.toLowerCase()))
    : [];

  const getEngineIcon = (iconName: string) => {
    switch (iconName) {
      case 'Video': return <Video className="w-4 h-4" />;
      case 'GitBranch': return <GitBranch className="w-4 h-4" />;
      case 'Code2': return <Code2 className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Clipboard': return <Clipboard className="w-4 h-4" />;
      case 'Bookmark': return <Bookmark className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 relative z-20">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none px-1">
        {SEARCH_ENGINES.map((engine) => {
          const isActive = activeEngine === engine.id;
          return (
            <button
              key={engine.id}
              data-magnetic
              onClick={() => setActiveEngine(engine.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg border border-white/20 scale-105'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <span style={{ color: isActive ? engine.color : undefined }}>
                {getEngineIcon(engine.icon)}
              </span>
              <span>{engine.name}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div
          className={`glass-panel p-2 flex items-center gap-3 transition-all duration-300 ${
            isFocused ? 'border-white/40 ring-2 ring-violet-500/40 shadow-2xl scale-[1.01]' : ''
          }`}
        >
          <div className="pl-3 text-gray-400 group-hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            data-cursor="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={currentEngineObj.placeholder}
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-base font-normal py-2"
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

          <button
            type="submit"
            data-magnetic
            className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!isFocused && !query && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-[10px] text-gray-400 border border-white/10">
            Press <kbd className="font-mono text-white px-1">/</kbd> to search
          </div>
        )}
      </form>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-panel p-4 z-30 shadow-2xl border border-white/15 max-h-80 overflow-y-auto"
          >
            {!query && history.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Recent Searches
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setQuery(item.query);
                        setActiveEngine(item.engine);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-gray-200 cursor-pointer border border-white/10 group transition-all"
                    >
                      <span>{item.query}</span>
                      <button
                        onClick={(e) => removeHistoryItem(item.id, e)}
                        className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEngine === 'notes' && query && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Matching Notes ({filteredNotes.length})
                </div>
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No matching notes found.</p>
                ) : (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs border border-white/10 cursor-pointer"
                    >
                      <h4 className="font-semibold text-white">{note.title}</h4>
                      <p className="text-gray-400 line-clamp-1 mt-0.5">{note.content.replace(/<[^>]*>?/gm, '')}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeEngine === 'clipboard' && query && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Matching Clipboard Items ({filteredClipboard.length})
                </div>
                {filteredClipboard.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No matching clipboard items.</p>
                ) : (
                  filteredClipboard.map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() => navigator.clipboard.writeText(clip.content)}
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs border border-white/10 cursor-pointer"
                    >
                      <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 mr-2 font-mono">
                        {clip.category}
                      </span>
                      <span className="text-gray-200 line-clamp-1">{clip.content}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeEngine === 'vault' && query && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Matching Saved Links ({filteredVault.length})
                </div>
                {filteredVault.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No matching links found.</p>
                ) : (
                  filteredVault.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-white">{link.title}</h4>
                        <p className="text-gray-400 text-[11px]">{link.domain}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </a>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
