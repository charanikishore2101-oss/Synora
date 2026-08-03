import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Command, Settings, HelpCircle } from 'lucide-react';
import { LivingCursor } from './components/cursor/LivingCursor';
import { AuroraBackground } from './components/background/AuroraBackground';
import { NoiseOverlay } from './components/background/NoiseOverlay';
import { HeaderGreeting } from './components/dashboard/HeaderGreeting';
import { LiveClock } from './components/dashboard/LiveClock';
import { WeatherWidget } from './components/dashboard/WeatherWidget';
import { TodayGoals } from './components/dashboard/TodayGoals';
import { UniversalSearch } from './components/search/UniversalSearch';
import { QuickActions } from './components/dashboard/QuickActions';
import { NotesModule } from './components/notes/NotesModule';
import { ClipboardTimeline } from './components/clipboard/ClipboardTimeline';
import { LinkVault } from './components/vault/LinkVault';
import { FocusStudio } from './components/focus/FocusStudio';
import { CommandPalette } from './components/command/CommandPalette';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { SettingsModal } from './components/settings/SettingsModal';
import { useSettingsStore } from './store/useSettingsStore';

export function App() {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'notes' | 'clipboard' | 'vault' | 'focus'>('notes');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply theme attributes to body
  useEffect(() => {
    if (settings?.theme) {
      document.body.setAttribute('data-theme', settings.theme);
    }
    if (settings?.accent) {
      document.body.setAttribute('data-accent', settings.accent);
    }
  }, [settings?.theme, settings?.accent]);

  const widgets = settings?.widgetVisibility || {
    greeting: true,
    clock: true,
    weather: true,
    goals: true,
    quickActions: true,
    vault: true,
    notes: true,
    clipboard: true,
    focus: true,
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between p-4 sm:p-8">
      {/* Background Engine */}
      <AuroraBackground />
      <NoiseOverlay />

      {/* Living Cursor Engine */}
      <LivingCursor />

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Navigation Top Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl">
            <Sparkles className="w-5 h-5 animate-pulse-glow" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-wider text-white">LUMA</h2>
            <p className="text-[10px] text-gray-400 font-medium">The Intelligent Start Page</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommandOpen(true)}
            data-magnetic
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 flex items-center gap-1.5 font-medium transition-all"
          >
            <Command className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Search / Cmd+K</span>
          </button>

          <button
            onClick={() => updateSettings({ onboardingCompleted: false })}
            data-magnetic
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10"
            title="Help / Walkthrough Tour"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            data-magnetic
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center my-6 z-20">
        {/* Dynamic Greeting */}
        {widgets.greeting && <HeaderGreeting />}

        {/* Dashboard Top Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {widgets.clock && <LiveClock />}
          {widgets.weather && <WeatherWidget />}
          {widgets.goals && <TodayGoals />}
        </div>

        {/* Universal Search Hero */}
        <UniversalSearch />

        {/* Quick Action Navigation Bar */}
        <QuickActions
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenCommand={() => setIsCommandOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Active Module Container */}
        <div className="w-full max-w-5xl mx-auto mt-4">
          <AnimatePresence mode="wait">
            {activeTab === 'notes' && widgets.notes && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <NotesModule />
              </motion.div>
            )}

            {activeTab === 'clipboard' && widgets.clipboard && (
              <motion.div
                key="clipboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <ClipboardTimeline />
              </motion.div>
            )}

            {activeTab === 'vault' && widgets.vault && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <LinkVault />
              </motion.div>
            )}

            {activeTab === 'focus' && widgets.focus && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <FocusStudio />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex items-center justify-between text-[11px] text-gray-500 py-4 border-t border-white/5 z-20">
        <p>LUMA Intelligent Workspace &copy; {new Date().getFullYear()}</p>
        <p className="hidden sm:block">Press <kbd className="font-mono text-gray-300 px-1 py-0.5 rounded bg-white/10">Ctrl + K</kbd> to open Command Palette</p>
      </footer>
    </div>
  );
}

export default App;
