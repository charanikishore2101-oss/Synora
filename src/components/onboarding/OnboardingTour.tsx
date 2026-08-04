import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MousePointer,
  Search,
  FileText,
  Flame,
  CheckCircle2,
  ArrowRight,
  X,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export function OnboardingTour() {
  const { settings, updateSettings } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!settings.onboardingCompleted) {
      setIsVisible(true);
    }
  }, [settings.onboardingCompleted]);

  const steps = [
    {
      title: 'Welcome to SYNORA',
      subtitle: 'Personal Productivity Companion',
      description: 'Everything you need. One shortcut away. Designed for deep flow and instant utility.',
      icon: Sparkles,
      color: 'from-violet-600 to-indigo-600',
    },
    {
      title: 'Living Cursor Engine',
      subtitle: 'Context-Aware Physics & Glows',
      description: 'Notice your cursor attract to buttons, tilt cards in 3D, and leave an ambient glowing particle trail.',
      icon: MousePointer,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      title: 'Universal Multi-Engine Search',
      subtitle: 'Press / or Ctrl+K Anytime',
      description: 'Search Google, YouTube, GitHub, Stack Overflow, and your internal notes & links directly from hero search.',
      icon: Search,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'Quick Notes & Link Vault',
      subtitle: 'Offline LocalForage Storage',
      description: 'Write rich markdown notes with checklists and bookmark websites with auto-extracted metadata.',
      icon: FileText,
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Focus Studio & Ambient Sounds',
      subtitle: 'Pomodoro & Web Audio Synth',
      description: 'Boost deep work with synthesized rain, ocean waves, and focus timer tracking.',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTour();
    }
  };

  const finishTour = () => {
    setIsVisible(false);
    updateSettings({ onboardingCompleted: true });
  };

  if (!isVisible) return null;

  const stepObj = steps[currentStep];
  const StepIcon = stepObj.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9996] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md glass-panel p-6 border border-white/20 shadow-2xl relative flex flex-col items-center text-center"
        >
          {/* Close Button */}
          <button
            onClick={finishTour}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className={`p-4 rounded-2xl bg-gradient-to-r ${stepObj.color} text-white mb-4 shadow-xl`}>
            <StepIcon className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{stepObj.title}</h2>
          <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-3">
            {stepObj.subtitle}
          </p>

          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            {stepObj.description}
          </p>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-violet-400' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleNext}
            data-magnetic
            className={`w-full py-3 rounded-xl bg-gradient-to-r ${stepObj.color} text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all`}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Get Started with SYNORA
              </>
            ) : (
              <>
                Continue Walkthrough <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
