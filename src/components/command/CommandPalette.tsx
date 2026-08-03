import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  FileText,
  Clipboard,
  Bookmark,
  Flame,
  Palette,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useFocusStore } from '../../store/useFocusStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'notes' | 'clipboard' | 'vault' | 'focus') => void;
  onOpenSettings: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onOpenSettings,
}: CommandPaletteProps) {
  const { updateSettings, resetSettings } = useSettingsStore();
  const { createNote } = useNotesStore();
  const { startTimer, pauseTimer, isRunning } = useFocusStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          setSelectedIndex(0);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commandItems = [
    {
      id: 'tab-notes',
      title: 'Open Quick Notes',
      category: 'Navigation',
      icon: FileText,
      action: () => { onSelectTab('notes'); onClose(); },
    },
    {
      id: 'tab-clipboard',
      title: 'Open Clipboard Timeline',
      category: 'Navigation',
      icon: Clipboard,
      action: () => { onSelectTab('clipboard'); onClose(); },
    },
    {
      id: 'tab-vault',
      title: 'Open Link Vault',
      category: 'Navigation',
      icon: Bookmark,
      action: () => { onSelectTab('vault'); onClose(); },
    },
    {
      id: 'tab-focus',
      title: 'Open Focus Studio',
      category: 'Navigation',
      icon: Flame,
      action: () => { onSelectTab('focus'); onClose(); },
    },
    {
      id: 'create-note',
      title: 'Create New Quick Note',
      category: 'Actions',
      icon: FileText,
      action: () => {
        createNote();
        onSelectTab('notes');
        onClose();
      },
    },
    {
      id: 'toggle-timer',
      title: isRunning ? 'Pause Focus Timer' : 'Start Focus Timer',
      category: 'Actions',
      icon: Flame,
      action: () => {
        if (isRunning) pauseTimer();
        else startTimer();
        onSelectTab('focus');
        onClose();
      },
    },
    {
      id: 'theme-aurora',
      title: 'Switch Theme: Aurora Dark',
      category: 'Themes',
      icon: Palette,
      action: () => { updateSettings({ theme: 'aurora' }); onClose(); },
    },
    {
      id: 'theme-midnight',
      title: 'Switch Theme: OLED Midnight',
      category: 'Themes',
      icon: Moon,
      action: () => { updateSettings({ theme: 'midnight' }); onClose(); },
    },
    {
      id: 'theme-cyberpunk',
      title: 'Switch Theme: Cyberpunk Glow',
      category: 'Themes',
      icon: Sparkles,
      action: () => { updateSettings({ theme: 'cyberpunk' }); onClose(); },
    },
    {
      id: 'theme-sunset',
      title: 'Switch Theme: Sunset Flare',
      category: 'Themes',
      icon: Sun,
      action: () => { updateSettings({ theme: 'sunset' }); onClose(); },
    },
    {
      id: 'theme-light',
      title: 'Switch Theme: Minimal Light',
      category: 'Themes',
      icon: Sun,
      action: () => { updateSettings({ theme: 'light' }); onClose(); },
    },
    {
      id: 'open-settings',
      title: 'Open Personalization & Settings',
      category: 'Preferences',
      icon: Palette,
      action: () => { onOpenSettings(); onClose(); },
    },
    {
      id: 'reset-layout',
      title: 'Reset Default Settings & Layout',
      category: 'Preferences',
      icon: RotateCcw,
      action: () => { resetSettings(); onClose(); },
    },
  ];

  const filteredCommands = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-xl glass-panel border border-white/20 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Command className="w-5 h-5 text-violet-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm font-medium"
              />
              <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-300">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No matching commands found.</p>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all ${
                        isSelected
                          ? 'bg-violet-500/25 border border-violet-500/40 text-white shadow-md'
                          : 'bg-transparent text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-medium text-white block">{cmd.title}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">{cmd.category}</span>
                        </div>
                      </div>

                      {isSelected && <ArrowRight className="w-4 h-4 text-violet-400" />}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-t border-white/10 text-[10px] text-gray-400">
              <span>Use <kbd className="font-mono text-white">↑</kbd> <kbd className="font-mono text-white">↓</kbd> to navigate</span>
              <span><kbd className="font-mono text-white">Enter</kbd> to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
