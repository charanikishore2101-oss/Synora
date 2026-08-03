import { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flame,
  Award,
  Sparkles,
} from 'lucide-react';
import { useFocusStore } from '../../store/useFocusStore';
import type { SoundTrackId } from '../../types';

export function FocusStudio() {
  const {
    mode,
    timeLeft,
    isRunning,
    workDurationMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    sessions,
    ambientSounds,
    isZenFullscreen,
    loadFocusData,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
    toggleSound,
    setSoundVolume,
    setZenFullscreen,
  } = useFocusStore();

  useEffect(() => {
    loadFocusData();
  }, [loadFocusData]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tickTimer]);

  const totalDurationSec =
    (mode === 'work' ? workDurationMinutes : mode === 'shortBreak' ? shortBreakMinutes : longBreakMinutes) * 60;
  const progress = totalDurationSec > 0 ? (totalDurationSec - timeLeft) / totalDurationSec : 0;
  const strokeDashoffset = 283 - 283 * progress;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className={`glass-panel p-5 w-full flex flex-col transition-all duration-500 ${
      isZenFullscreen ? 'fixed inset-0 z-[9990] rounded-none bg-black/90 justify-center items-center' : 'h-[560px]'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Focus Studio</h3>
            <p className="text-xs text-gray-400">Pomodoro & Ambient Audio</p>
          </div>
        </div>

        <button
          onClick={() => setZenFullscreen(!isZenFullscreen)}
          data-magnetic
          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all border border-white/10"
          title={isZenFullscreen ? 'Exit Zen Mode' : 'Fullscreen Zen Mode'}
        >
          {isZenFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase transition-all ${
              mode === m
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg scale-105'
                : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            {m === 'work' ? 'Work Session' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center my-2 relative">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-white/10 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-amber-400 fill-none transition-all duration-1000"
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center text-center">
            <span className="text-4xl font-mono font-bold tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </span>
            <span className="text-[11px] text-amber-400 uppercase tracking-widest mt-1 font-semibold">
              {mode === 'work' ? 'Focusing' : 'Resting'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            data-magnetic
            className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all border border-white/10"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isRunning ? pauseTimer : startTimer}
            data-magnetic
            className="p-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white shadow-xl transition-all scale-110"
          >
            {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
          </button>
        </div>
      </div>

      {!isZenFullscreen && (
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400 font-semibold mb-3 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Procedural Ambient Sounds (Web Audio)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ambientSounds.map((sound) => (
              <div
                key={sound.id}
                className={`p-2.5 rounded-xl border flex flex-col gap-2 transition-all ${
                  sound.active
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium truncate">{sound.name}</span>
                  <button
                    onClick={() => toggleSound(sound.id as SoundTrackId)}
                    className={`p-1 rounded ${sound.active ? 'text-amber-400' : 'text-gray-500'}`}
                  >
                    {sound.active ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {sound.active && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sound.volume}
                    onChange={(e) => setSoundVolume(sound.id as SoundTrackId, parseFloat(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-white/20 rounded cursor-pointer"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Completed Sessions: {sessions.length}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Total Focused: {totalFocusMinutes} mins
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
