import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { synoraAudio } from '../../services/audio';

interface SynoraSplashIntroProps {
  onComplete: () => void;
}

export function SynoraSplashIntro({ onComplete }: SynoraSplashIntroProps) {
  useEffect(() => {
    // Play optional startup chime if sound is enabled
    synoraAudio.playStartupChime();

    // Auto-advance after 2.2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] bg-[#05060a] flex flex-col items-center justify-between p-8 overflow-hidden select-none cursor-pointer"
      onClick={onComplete}
    >
      {/* Ambient Particle Aura */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-600/20 to-cyan-500/20 blur-[130px]"
        />
      </div>

      {/* Top Header Controls: Skip Intro */}
      <div className="w-full max-w-6xl flex justify-end z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-xs text-gray-400 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all font-mono"
        >
          <span>Skip Intro</span>
          <kbd className="px-1 py-0.2 bg-white/10 rounded text-[10px]">ESC</kbd>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Cinematic Brand & Tagline Reveal */}
      <div className="flex flex-col items-center justify-center text-center z-10 my-auto">
        {/* Animated Brand Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.05, 1], opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#090a14] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-violet-400 animate-pulse-glow" />
            </div>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-3xl bg-violet-500/30 blur-xl pointer-events-none"
          />
        </motion.div>

        {/* Animated Brand Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl font-extrabold tracking-widest text-white drop-shadow-2xl font-sans"
        >
          SYNORA
        </motion.h1>

        {/* Tagline Reveal */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="text-base sm:text-xl text-gray-200 font-medium mt-3 tracking-wide drop-shadow"
        >
          &ldquo;Everything you need. One shortcut away.&rdquo;
        </motion.p>

        {/* Product Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-violet-300 uppercase tracking-widest font-mono"
        >
          Personal Productivity Companion
        </motion.div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="w-full max-w-xs z-10 mb-4">
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400"
          />
        </div>
      </div>
    </motion.div>
  );
}
