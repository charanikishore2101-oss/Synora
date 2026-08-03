import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Sun, Moon, Sunrise } from 'lucide-react';

export function HeaderGreeting() {
  const { settings } = useSettingsStore();
  const [greeting, setGreeting] = useState('');
  const [icon, setIcon] = useState<React.ReactNode>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
      setIcon(<Sunrise className="w-5 h-5 text-amber-400" />);
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good Afternoon');
      setIcon(<Sun className="w-5 h-5 text-yellow-400" />);
    } else {
      setGreeting('Good Evening');
      setIcon(<Moon className="w-5 h-5 text-indigo-400" />);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center my-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 mb-2">
        {icon}
        <span className="font-medium tracking-wide uppercase">{greeting}</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
        Welcome back, <span className="accent-text">{settings.userName || 'Creator'}</span>
      </h1>

      <p className="text-sm text-gray-400 mt-1 max-w-lg">
        Transform your browser into your ultimate flow state workspace.
      </p>
    </div>
  );
}
