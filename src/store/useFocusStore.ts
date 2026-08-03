import { create } from 'zustand';
import type { FocusMode, FocusSession, AmbientSound, SoundTrackId } from '../types';
import { getItem, setItem, StorageKeys } from '../services/storage';
import { audioSynth } from '../utils/audioSynth';

const DEFAULT_SOUNDS: AmbientSound[] = [
  { id: 'rain', name: 'Rain Storm', volume: 0.5, active: false },
  { id: 'waves', name: 'Ocean Waves', volume: 0.5, active: false },
  { id: 'forest', name: 'Forest Wind', volume: 0.5, active: false },
  { id: 'whitenoise', name: 'White Noise', volume: 0.3, active: false },
  { id: 'synth', name: 'Cyberpunk Synth', volume: 0.4, active: false },
];

interface FocusState {
  mode: FocusMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  workDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessions: FocusSession[];
  ambientSounds: AmbientSound[];
  isZenFullscreen: boolean;
  isLoaded: boolean;

  loadFocusData: () => Promise<void>;
  setMode: (mode: FocusMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  setDurations: (work: number, shortB: number, longB: number) => void;
  toggleSound: (soundId: SoundTrackId) => void;
  setSoundVolume: (soundId: SoundTrackId, volume: number) => void;
  setZenFullscreen: (active: boolean) => void;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  mode: 'work',
  timeLeft: 25 * 60,
  isRunning: false,
  workDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessions: [],
  ambientSounds: DEFAULT_SOUNDS,
  isZenFullscreen: false,
  isLoaded: false,

  loadFocusData: async () => {
    const savedSessions = await getItem<FocusSession[]>(StorageKeys.FOCUS_SESSIONS, []);
    set({ sessions: savedSessions, isLoaded: true });
  },

  setMode: (mode) => {
    const { workDurationMinutes, shortBreakMinutes, longBreakMinutes } = get();
    let mins = workDurationMinutes;
    if (mode === 'shortBreak') mins = shortBreakMinutes;
    if (mode === 'longBreak') mins = longBreakMinutes;
    set({ mode, timeLeft: mins * 60, isRunning: false });
  },

  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),

  resetTimer: () => {
    const { mode, workDurationMinutes, shortBreakMinutes, longBreakMinutes } = get();
    let mins = workDurationMinutes;
    if (mode === 'shortBreak') mins = shortBreakMinutes;
    if (mode === 'longBreak') mins = longBreakMinutes;
    set({ isRunning: false, timeLeft: mins * 60 });
  },

  tickTimer: async () => {
    const { timeLeft, isRunning, mode, workDurationMinutes, sessions } = get();
    if (!isRunning) return;

    if (timeLeft > 1) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      set({ isRunning: false, timeLeft: 0 });

      if (mode === 'work') {
        const newSession: FocusSession = {
          id: `session-${Date.now()}`,
          durationMinutes: workDurationMinutes,
          mode: 'work',
          completedAt: Date.now(),
        };
        const updatedSessions = [newSession, ...sessions];
        set({ sessions: updatedSessions });
        await setItem(StorageKeys.FOCUS_SESSIONS, updatedSessions);
      }
    }
  },

  setDurations: (work, shortB, longB) => {
    set({
      workDurationMinutes: work,
      shortBreakMinutes: shortB,
      longBreakMinutes: longB,
    });
    get().resetTimer();
  },

  toggleSound: (soundId) => {
    const currentSounds = get().ambientSounds;
    const updated = currentSounds.map((s) => {
      if (s.id === soundId) {
        const newActive = !s.active;
        if (newActive) {
          if (soundId === 'rain') audioSynth.playRain(s.volume);
          if (soundId === 'waves') audioSynth.playWaves(s.volume);
          if (soundId === 'forest') audioSynth.playForest(s.volume);
          if (soundId === 'whitenoise') audioSynth.playWhiteNoise(s.volume);
          if (soundId === 'synth') audioSynth.playSynth(s.volume);
        } else {
          audioSynth.stopSound(soundId);
        }
        return { ...s, active: newActive };
      }
      return s;
    });
    set({ ambientSounds: updated });
  },

  setSoundVolume: (soundId, volume) => {
    const updated = get().ambientSounds.map((s) => {
      if (s.id === soundId) {
        if (s.active) {
          audioSynth.setVolume(soundId, volume);
        }
        return { ...s, volume };
      }
      return s;
    });
    set({ ambientSounds: updated });
  },

  setZenFullscreen: (active) => set({ isZenFullscreen: active }),
}));
