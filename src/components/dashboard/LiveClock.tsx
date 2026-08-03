import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Calendar } from 'lucide-react';

export function LiveClock() {
  const { settings, updateSettings } = useSettingsStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timePattern = settings.clock24h
    ? settings.showSeconds ? 'HH:mm:ss' : 'HH:mm'
    : settings.showSeconds ? 'hh:mm:ss a' : 'hh:mm a';

  const dateString = format(time, 'EEEE, MMMM d, yyyy');

  return (
    <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        <Calendar className="w-3.5 h-3.5 text-violet-400" />
        <span>{dateString}</span>
      </div>

      <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight drop-shadow-md my-1">
        {format(time, timePattern)}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => updateSettings({ clock24h: !settings.clock24h })}
          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10"
        >
          {settings.clock24h ? '24-Hour' : '12-Hour'}
        </button>
        <button
          onClick={() => updateSettings({ showSeconds: !settings.showSeconds })}
          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10"
        >
          {settings.showSeconds ? 'Hide Sec' : 'Show Sec'}
        </button>
      </div>
    </div>
  );
}
