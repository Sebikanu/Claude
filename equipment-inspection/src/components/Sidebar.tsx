import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getEquipmentStatus } from '../store/useStore';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'equipment', label: 'Geräte', icon: Package },
  { id: 'inspections', label: 'Prüfungen', icon: ClipboardList },
  { id: 'calendar', label: 'Kalender', icon: Calendar },
  { id: 'reminders', label: 'Erinnerungen', icon: Bell },
];

export default function Sidebar() {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const equipment = useStore((s) => s.equipment);

  const overdueCount = equipment.filter((e) => getEquipmentStatus(e) === 'overdue').length;
  const warningCount = equipment.filter((e) => getEquipmentStatus(e) === 'warning').length;
  const alertCount = overdueCount + warningCount;

  return (
    <aside className="w-64 bg-[#1a2e4a] text-white flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">BetriebsPrüfer</div>
          <div className="text-xs text-blue-300 leading-tight">Prüfmanagement</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          const showBadge = id === 'reminders' && alertCount > 0;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              {showBadge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <button
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeView === 'settings'
              ? 'bg-blue-500 text-white'
              : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings size={18} />
          Einstellungen
        </button>
      </div>
    </aside>
  );
}
