import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Command, Settings, HelpCircle, Minimize2, AppWindow, Home, Calculator as CalcIcon, FileText, Clipboard, Bookmark, Flame } from 'lucide-react';
import { LivingCursor } from './components/cursor/LivingCursor';
import { AuroraBackground } from './components/background/AuroraBackground';
import { DesktopBackdrop } from './components/desktop/DesktopBackdrop';
import { DesktopDemoScene } from './components/desktop/DesktopDemoScene';
import { SpotlightPopup } from './components/desktop/SpotlightPopup';
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
import { CalculatorModule } from './components/calculator/CalculatorModule';
import { CommandPalette } from './components/command/CommandPalette';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { SettingsModal } from './components/settings/SettingsModal';
import { SynoraSplashIntro } from './components/desktop/SynoraSplashIntro';
import { useSettingsStore } from './store/useSettingsStore';
import { useLayoutStore, type WorkspaceTab } from './store/useLayoutStore';
import { minimizeNativeWindow } from './services/tauri';

export function App() {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { mode, activeWorkspaceTab, setMode, setActiveWorkspaceTab, minimizeToPopup, expandToWorkspace } = useLayoutStore();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(true);
  const [isIntroActive, setIsIntroActive] = useState(() => {
    return !sessionStorage.getItem('synora_intro_seen');
  });

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

  // Global Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Space or Cmd + Space: Toggle Spotlight Popup Mode
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        if (mode === 'popup') {
          if (!isSpotlightOpen) {
            setIsSpotlightOpen(true);
          } else {
            minimizeNativeWindow();
            if (settings?.desktopDemoMode) {
              setIsSpotlightOpen(false);
            }
          }
        } else {
          setMode('popup');
          setIsSpotlightOpen(true);
        }
      }

      // Escape key: Collapse workspace back to popup mode or close popup to desktop
      if (e.key === 'Escape' && !isCommandOpen && !isSettingsOpen) {
        if (mode === 'workspace') {
          e.preventDefault();
          minimizeToPopup();
        } else if (mode === 'popup' && settings?.desktopDemoMode) {
          e.preventDefault();
          setIsSpotlightOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isSpotlightOpen, isCommandOpen, isSettingsOpen, settings?.desktopDemoMode, setMode, minimizeToPopup]);

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

  const navItems: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'clipboard', label: 'Clipboard', icon: Clipboard },
    { id: 'vault', label: 'Link Vault', icon: Bookmark },
    { id: 'calculator', label: 'Calculator', icon: CalcIcon },
    { id: 'focus', label: 'Focus', icon: Flame },
    { id: 'dashboard', label: 'Dashboard', icon: Home },
  ];

  const handleLaunchFromDesktop = () => {
    setMode('popup');
    setIsSpotlightOpen(true);
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('synora_intro_seen', 'true');
    setIsIntroActive(false);
    if (settings?.desktopDemoMode) {
      setIsSpotlightOpen(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col justify-between p-4 sm:p-8 selection:bg-violet-500/30">
      {/* Cinematic Splash Intro */}
      <AnimatePresence>
        {isIntroActive && (
          <SynoraSplashIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Background Engine */}
      {mode === 'workspace' ? <AuroraBackground /> : <DesktopBackdrop />}
      <NoiseOverlay />

      {/* Living Cursor Engine */}
      <LivingCursor />

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTab={(tab) => {
          setActiveWorkspaceTab(tab as WorkspaceTab);
          expandToWorkspace(tab as WorkspaceTab);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* DESKTOP DEMO SCENE (Rendered when Demo Mode is ON & Spotlight is Closed) */}
      {settings?.desktopDemoMode && mode === 'popup' && !isSpotlightOpen && (
        <DesktopDemoScene
          onLaunchSynora={handleLaunchFromDesktop}
          isLaunching={false}
        />
      )}

      {/* SPOTLIGHT FLOATING POPUP MODE */}
      <AnimatePresence mode="wait">
        {mode === 'popup' && isSpotlightOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <SpotlightPopup
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenCommand={() => setIsCommandOpen(true)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* FULL DESKTOP WORKSPACE MODE (Morphing with Shared Element Transition) */}
      {mode === 'workspace' && (
        <motion.div
          layoutId="synora-main-container"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="w-full flex-1 flex flex-col justify-between z-20"
        >
          {/* Top Bar Navigation Header */}
          <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2 z-20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl">
                <Sparkles className="w-5 h-5 animate-pulse-glow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-wider text-white">SYNORA</h2>
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono border border-violet-500/30 uppercase">
                    {activeWorkspaceTab} Workspace
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Personal Productivity Companion</p>
              </div>
            </div>

            {/* Arc-Style Navigation Dock */}
            <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-white/15 bg-white/5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeWorkspaceTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveWorkspaceTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-lg border border-white/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => minimizeToPopup()}
                data-magnetic
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 flex items-center gap-1.5 font-medium transition-all"
                title="Minimize back to Spotlight Companion (ESC)"
              >
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Minimize Spotlight</span>
              </button>

              <button
                onClick={() => setIsCommandOpen(true)}
                data-magnetic
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 hover:text-white border border-white/10 flex items-center gap-1.5 font-medium transition-all"
              >
                <Command className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Cmd+K</span>
              </button>

              <button
                onClick={() => updateSettings({ onboardingCompleted: false })}
                data-magnetic
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/10"
                title="Help Tour"
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

          {/* Main Content Module Target Container */}
          <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center my-6 z-20">
            <AnimatePresence mode="wait">
              {/* DASHBOARD TARGET VIEW (Only when user explicitly clicks Home / Dashboard) */}
              {activeWorkspaceTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {widgets.greeting && <HeaderGreeting />}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {widgets.clock && <LiveClock />}
                    {widgets.weather && <WeatherWidget />}
                    {widgets.goals && <TodayGoals />}
                  </div>
                  <UniversalSearch />
                  <QuickActions
                    activeTab={activeWorkspaceTab}
                    onSelectTab={(tab) => setActiveWorkspaceTab(tab as WorkspaceTab)}
                    onOpenCommand={() => setIsCommandOpen(true)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />
                </motion.div>
              )}

              {/* DIRECT FEATURE TARGET VIEWPORTS */}
              {activeWorkspaceTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <NotesModule />
                </motion.div>
              )}

              {activeWorkspaceTab === 'clipboard' && (
                <motion.div
                  key="clipboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <ClipboardTimeline />
                </motion.div>
              )}

              {activeWorkspaceTab === 'vault' && (
                <motion.div
                  key="vault"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <LinkVault />
                </motion.div>
              )}

              {activeWorkspaceTab === 'focus' && (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <FocusStudio />
                </motion.div>
              )}

              {activeWorkspaceTab === 'calculator' && (
                <motion.div
                  key="calculator"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <CalculatorModule />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="w-full max-w-7xl mx-auto flex items-center justify-between text-[11px] text-gray-500 py-4 border-t border-white/5 z-20">
            <p>SYNORA Personal Productivity Companion &copy; {new Date().getFullYear()}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => minimizeToPopup()}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <AppWindow className="w-3.5 h-3.5 text-violet-400" />
                <span>Spotlight Mode (<kbd className="font-mono text-gray-300">Ctrl + Space</kbd>)</span>
              </button>
              <span>•</span>
              <p className="hidden sm:block">Everything you need. One shortcut away.</p>
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
}

export default App;
