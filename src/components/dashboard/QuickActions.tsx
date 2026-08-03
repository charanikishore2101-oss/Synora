import {
  FileText,
  Clipboard,
  Bookmark,
  Flame,
  Command,
  Settings,
} from 'lucide-react';

interface QuickActionsProps {
  onSelectTab: (tab: 'notes' | 'clipboard' | 'vault' | 'focus') => void;
  onOpenCommand: () => void;
  onOpenSettings: () => void;
  activeTab: string;
}

export function QuickActions({
  onSelectTab,
  onOpenCommand,
  onOpenSettings,
  activeTab,
}: QuickActionsProps) {
  const actions = [
    { id: 'notes', label: 'Quick Notes', icon: FileText, color: 'from-violet-600 to-indigo-600' },
    { id: 'clipboard', label: 'Clipboard', icon: Clipboard, color: 'from-cyan-600 to-blue-600' },
    { id: 'vault', label: 'Link Vault', icon: Bookmark, color: 'from-emerald-600 to-teal-600' },
    { id: 'focus', label: 'Focus Studio', icon: Flame, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 my-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const isActive = activeTab === action.id;
        return (
          <button
            key={action.id}
            data-magnetic
            data-tilt
            onClick={() => onSelectTab(action.id as 'notes' | 'clipboard' | 'vault' | 'focus')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-r ${action.color} text-white shadow-xl scale-105 border border-white/30`
                : 'glass-panel text-gray-300 hover:text-white hover:border-white/20'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{action.label}</span>
          </button>
        );
      })}

      <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

      <button
        onClick={onOpenCommand}
        data-magnetic
        className="glass-panel px-3.5 py-2.5 rounded-2xl text-xs text-gray-300 hover:text-white flex items-center gap-1.5 font-medium"
      >
        <Command className="w-4 h-4 text-violet-400" />
        <span>Cmd+K</span>
      </button>

      <button
        onClick={onOpenSettings}
        data-magnetic
        className="glass-panel p-2.5 rounded-2xl text-xs text-gray-300 hover:text-white"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
