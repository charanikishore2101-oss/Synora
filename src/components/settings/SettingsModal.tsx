import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  X,
  Palette,
  MousePointer,
  Layout,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import type { ThemeId, AccentColor, CursorMode } from '../../types';
import { clearAllData, getItem, setItem, StorageKeys } from '../../services/storage';
import { synoraAudio } from '../../services/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'cursor' | 'widgets' | 'data'>('appearance');

  const themes: { id: ThemeId; name: string }[] = [
    { id: 'aurora', name: 'Aurora Dark' },
    { id: 'midnight', name: 'OLED Midnight' },
    { id: 'cyberpunk', name: 'Cyberpunk Glow' },
    { id: 'sunset', name: 'Sunset Flare' },
    { id: 'light', name: 'Minimal Light' },
  ];

  const accents: { id: AccentColor; name: string; color: string }[] = [
    { id: 'violet', name: 'Violet', color: '#8b5cf6' },
    { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
    { id: 'emerald', name: 'Emerald', color: '#10b981' },
    { id: 'rose', name: 'Rose', color: '#f43f5e' },
    { id: 'amber', name: 'Amber', color: '#f59e0b' },
  ];

  const cursorModes: { id: CursorMode; name: string; desc: string }[] = [
    { id: 'glow', name: 'Spotlight Glow', desc: 'Elastic spring dot + ambient radial spotlight' },
    { id: 'particles', name: 'Particle Trail', desc: 'Canvas particle physics floating trail' },
    { id: 'magnetic', name: 'Magnetic Pull', desc: 'Interactive attraction to buttons & inputs' },
    { id: 'minimal', name: 'Minimal Ring', desc: 'Sleek thin border without heavy glows' },
    { id: 'disabled', name: 'System Default', desc: 'Native browser cursor' },
  ];

  const handleExportBackup = async () => {
    const backupData = {
      settings,
      notes: await getItem(StorageKeys.NOTES, []),
      clipboard: await getItem(StorageKeys.CLIPBOARD, []),
      vault: await getItem(StorageKeys.VAULT_LINKS, []),
      goals: await getItem(StorageKeys.TODAY_GOALS, []),
      exportedAt: Date.now(),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LUMA_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings) await setItem(StorageKeys.SETTINGS, data.settings);
        if (data.notes) await setItem(StorageKeys.NOTES, data.notes);
        if (data.clipboard) await setItem(StorageKeys.CLIPBOARD, data.clipboard);
        if (data.vault) await setItem(StorageKeys.VAULT_LINKS, data.vault);
        if (data.goals) await setItem(StorageKeys.TODAY_GOALS, data.goals);
        window.location.reload();
      } catch (err) {
        console.error('Backup import error:', err);
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl glass-panel border border-white/20 shadow-2xl overflow-hidden flex flex-col h-[520px]"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" />
              <h3 className="text-base font-semibold text-white">SYNORA Preferences &amp; Customization</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-white/5 text-xs">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'appearance' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Themes & Color
            </button>

            <button
              onClick={() => setActiveTab('cursor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'cursor' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" /> Living Cursor
            </button>

            <button
              onClick={() => setActiveTab('widgets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'widgets' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" /> Dashboard Widgets
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'data' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" /> Data & Backup
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs text-gray-200">
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">User Profile Name</label>
                  <input
                    type="text"
                    value={settings.userName}
                    onChange={(e) => updateSettings({ userName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 font-medium">Theme Aesthetic</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {themes.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => updateSettings({ theme: t.id })}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          settings.theme === t.id
                            ? 'bg-violet-500/25 border-violet-500 text-white shadow-md'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-semibold">{t.name}</span>
                        {settings.theme === t.id && <Check className="w-4 h-4 text-violet-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 font-medium">Accent Color</label>
                  <div className="flex items-center gap-3">
                    {accents.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => updateSettings({ accent: acc.id })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          settings.accent === acc.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: acc.color }}
                        title={acc.name}
                      >
                        {settings.accent === acc.id && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cursor' && (
              <div className="space-y-3">
                <label className="block text-gray-400 font-medium mb-1">Living Cursor Physics Engine</label>
                {cursorModes.map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => updateSettings({ cursorMode: mode.id })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      settings.cursorMode === mode.id
                        ? 'bg-violet-500/25 border-violet-500 text-white'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-sm">{mode.name}</h4>
                      <p className="text-gray-400 text-[11px]">{mode.desc}</p>
                    </div>
                    {settings.cursorMode === mode.id && <Check className="w-4 h-4 text-violet-400" />}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'widgets' && (
              <div className="space-y-3">
                <label className="block text-gray-400 font-medium mb-1">Toggle Dashboard Widgets</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(settings.widgetVisibility).map(([key, val]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer capitalize hover:bg-white/10"
                    >
                      <span>{key}</span>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() =>
                          updateSettings({
                            widgetVisibility: {
                              ...settings.widgetVisibility,
                              [key]: !val,
                            },
                          })
                        }
                        className="accent-violet-500 w-4 h-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-1">Backup & Restore Offline Data</h4>
                  <p className="text-gray-400 text-xs mb-3">
                    Export your notes, bookmarks, clipboard history, and settings as a JSON backup file.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Export Backup JSON
                    </button>

                    <label className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer">
                      <Upload className="w-4 h-4" /> Import Backup JSON
                      <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h4 className="font-semibold text-white mb-1">Launch Experience &amp; Sound</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <span className="text-xs font-semibold text-white block">Desktop Demo Mode</span>
                      <span className="text-[11px] text-gray-400">Launch into simulated Windows 11 desktop with app icon launch flow.</span>
                    </div>
                    <button
                      onClick={() => updateSettings({ desktopDemoMode: !settings.desktopDemoMode })}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                        settings.desktopDemoMode ? 'bg-violet-600' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          settings.desktopDemoMode ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <span className="text-xs font-semibold text-white block">Desktop Sound Effects</span>
                      <span className="text-[11px] text-gray-400">Optional procedural Web Audio chimes and launch sounds.</span>
                    </div>
                    <button
                      onClick={() => synoraAudio.setSoundEnabled(!synoraAudio.isSoundEnabled())}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                        synoraAudio.isSoundEnabled() ? 'bg-violet-600' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          synoraAudio.isSoundEnabled() ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-semibold text-white mb-1">Reset &amp; Replay SYNORA</h4>
                  <p className="text-gray-400 text-xs mb-3">Replay the product intro, onboarding tour, or clear storage.</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        sessionStorage.removeItem('synora_intro_seen');
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 rounded-lg text-xs font-semibold border border-violet-500/30"
                    >
                      Replay Cinematic Intro
                    </button>

                    <button
                      onClick={() => {
                        updateSettings({ onboardingCompleted: false });
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs"
                    >
                      Replay Onboarding Tour
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to clear all SYNORA data and reset to defaults?')) {
                          await clearAllData();
                          window.location.reload();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg text-xs"
                    >
                      Clear LocalForage Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
