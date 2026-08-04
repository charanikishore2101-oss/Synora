import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Globe,
  Folder,
  Trash2,
  Search,
  Wifi,
  Volume2,
  Battery,
  Grid,
} from 'lucide-react';
import { synoraAudio } from '../../services/audio';

interface DesktopDemoSceneProps {
  onLaunchSynora: () => void;
  isLaunching: boolean;
}

export function DesktopDemoScene({ onLaunchSynora, isLaunching }: DesktopDemoSceneProps) {
  const [selectedIcon, setSelectedIcon] = useState<string | null>('synora');
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [showRipple, setShowRipple] = useState(false);
  const [showGuideTooltip, setShowGuideTooltip] = useState(true);

  // Live Taskbar Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
      setDateString(now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fade guide tooltip out gracefully after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGuideTooltip(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleIconClick = (id: string) => {
    setSelectedIcon(id);
  };

  const handleIconDoubleClick = (id: string) => {
    if (id === 'synora') {
      triggerLaunch();
    }
  };

  const triggerLaunch = () => {
    synoraAudio.playLaunchSound();
    setShowRipple(true);
    setShowGuideTooltip(false);
    setTimeout(() => {
      onLaunchSynora();
      setShowRipple(false);
    }, 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedIcon === 'synora') {
      triggerLaunch();
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => setSelectedIcon(null)}
      className="fixed inset-0 z-10 flex flex-col justify-between overflow-hidden select-none bg-[#0a0c14] focus:outline-none"
    >
      {/* Premium Ambient Desktop Wallpaper */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0d1b] via-[#12142e] to-[#090a14]" />
        
        {/* Soft Glowing Ambient Mesh */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-tr from-violet-600/25 via-indigo-500/20 to-cyan-500/20 blur-[120px]"
        />

        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 left-1/3 w-[600px] h-[400px] rounded-full bg-gradient-to-br from-pink-600/15 via-purple-600/20 to-blue-600/15 blur-[100px]"
        />

        {/* Windows 11 Mesh Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* DESKTOP ICONS GRID AREA */}
      <div className="relative z-10 p-6 sm:p-10 grid grid-flow-col grid-rows-6 gap-6 max-w-xs pointer-events-auto">
        {/* HERO MOMENT: Featured SYNORA Desktop App Icon */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          onClick={(e) => {
            e.stopPropagation();
            handleIconClick('synora');
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleIconDoubleClick('synora');
          }}
          className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
            selectedIcon === 'synora'
              ? 'bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl scale-105'
              : 'hover:bg-white/10 hover:border hover:border-white/10'
          }`}
        >
          {/* Non-intrusive Guide Tooltip */}
          <AnimatePresence>
            {showGuideTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold shadow-xl border border-white/20 whitespace-nowrap flex items-center gap-1.5 pointer-events-none"
              >
                <span>✨ Double-click SYNORA to launch</span>
                <span className="w-2 h-2 rotate-45 bg-indigo-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glowing Aura Badge */}
          <div className="relative mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-[14px] bg-[#0d0e1d] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-violet-400 animate-pulse-glow" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-gray-900"></span>
            </span>
          </div>

          <span className="text-xs font-bold text-white tracking-wide text-center drop-shadow-md">
            ✨ SYNORA
          </span>
          <span className="text-[9px] text-gray-300 font-mono opacity-80">Double-Click</span>

          {/* Soft Ripple Launch Animation */}
          <AnimatePresence>
            {(showRipple || isLaunching) && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 rounded-2xl bg-violet-500/40 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Vector Desktop Icon: Recycle Bin */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleIconClick('recycle');
          }}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all ${
            selectedIcon === 'recycle' ? 'bg-white/15 backdrop-blur-md border border-white/30' : 'hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-gray-300">
            <Trash2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-gray-200 drop-shadow-sm">Recycle Bin</span>
        </div>

        {/* Vector Desktop Icon: Web Browser */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleIconClick('browser');
          }}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all ${
            selectedIcon === 'browser' ? 'bg-white/15 backdrop-blur-md border border-white/30' : 'hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-cyan-400">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-gray-200 drop-shadow-sm">Browser</span>
        </div>

        {/* Vector Desktop Icon: Projects Folder */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleIconClick('folder');
          }}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all ${
            selectedIcon === 'folder' ? 'bg-white/15 backdrop-blur-md border border-white/30' : 'hover:bg-white/10'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-1 text-amber-400">
            <Folder className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-gray-200 drop-shadow-sm">Workspace</span>
        </div>
      </div>

      {/* WINDOWS 11 SIMULATED TASKBAR */}
      <footer className="relative z-10 w-full h-12 glass-panel border-t border-white/15 bg-black/40 backdrop-blur-2xl px-4 flex items-center justify-between pointer-events-auto">
        {/* Taskbar Left: Weather / Widgets Indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-300 font-medium px-2 py-1 rounded-xl hover:bg-white/10 cursor-pointer">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">San Francisco 24°C</span>
        </div>

        {/* Taskbar Center App Icons & Start Menu */}
        <div className="flex items-center gap-2">
          {/* Windows Start Button */}
          <button
            onClick={() => triggerLaunch()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-violet-400 border border-white/10 transition-all"
            title="Start SYNORA"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Search Bar Pill */}
          <button
            onClick={() => triggerLaunch()}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs text-gray-300 border border-white/10 font-medium"
          >
            <Search className="w-3.5 h-3.5 text-violet-400" />
            <span>Search SYNORA...</span>
          </button>

          {/* Featured SYNORA Active Taskbar Icon */}
          <button
            onClick={() => triggerLaunch()}
            className="p-2 rounded-xl bg-violet-600/30 border border-violet-500/50 text-white shadow-lg relative group"
            title="SYNORA Companion"
          >
            <Sparkles className="w-4 h-4 text-violet-300 animate-pulse-glow" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-violet-400" />
          </button>
        </div>

        {/* Taskbar Right: System Tray & Clock */}
        <div className="flex items-center gap-3 text-gray-300 text-xs font-medium">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10">
            <Wifi className="w-3.5 h-3.5 text-gray-400" />
            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
            <Battery className="w-3.5 h-3.5 text-gray-400" />
          </div>

          <div className="text-right px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer">
            <div className="text-xs font-semibold text-white">{timeString || '10:53 AM'}</div>
            <div className="text-[9px] text-gray-400">{dateString || 'Aug 4, 2026'}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
