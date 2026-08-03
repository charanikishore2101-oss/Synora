import { useState } from 'react';
import { CloudRain, Sun, Wind, Droplets, MapPin } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export function WeatherWidget() {
  const { settings, updateSettings } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [cityInput, setCityInput] = useState(settings.weatherCity || 'San Francisco');

  const tempC = 22;
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const displayTemp = settings.useCelsius ? `${tempC}°C` : `${tempF}°F`;

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      updateSettings({ weatherCity: cityInput.trim() });
      setIsEditing(false);
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          {isEditing ? (
            <form onSubmit={handleCitySubmit} className="flex gap-1">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="bg-white/10 text-xs px-2 py-0.5 rounded text-white focus:outline-none w-28"
                autoFocus
              />
            </form>
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="font-medium cursor-pointer hover:underline"
              title="Click to change city"
            >
              {settings.weatherCity}
            </span>
          )}
        </div>

        <button
          onClick={() => updateSettings({ useCelsius: !settings.useCelsius })}
          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-cyan-300 font-mono border border-white/10"
        >
          {settings.useCelsius ? '°C' : '°F'}
        </button>
      </div>

      <div className="flex items-center justify-between my-2">
        <div>
          <div className="text-3xl font-bold text-white tracking-tight">{displayTemp}</div>
          <p className="text-xs text-gray-400 mt-0.5">Partly Cloudy</p>
        </div>
        <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-300">
          <Sun className="w-8 h-8 text-yellow-400 animate-pulse-glow" />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/10">
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3 text-cyan-400" /> 12 km/h
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-blue-400" /> 48% Humidity
        </div>
        <div className="flex items-center gap-1">
          <CloudRain className="w-3 h-3 text-indigo-400" /> 10% Rain
        </div>
      </div>
    </div>
  );
}
