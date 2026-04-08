import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useStore, getEquipmentStatus } from '../store/useStore';

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
    <aside
      className="w-64 flex flex-col min-h-screen shrink-0"
      style={{ background: 'linear-gradient(180deg, #0d1b2e 0%, #0f2744 60%, #0d1b2e 100%)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-[15px] leading-tight tracking-tight">
              BetriebsPrüfer
            </div>
            <div className="text-[11px] text-blue-400/80 leading-tight tracking-wide uppercase">
              Prüfmanagement
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5 mb-4" />

      {/* Navigation label */}
      <p className="px-5 text-[10px] font-semibold tracking-widest uppercase text-slate-500 mb-2">
        Navigation
      </p>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id ||
            (id === 'equipment' && (activeView === 'equipment-new' || activeView === 'equipment-edit')) ||
            (id === 'inspections' && activeView === 'inspection-new');
          const showBadge = id === 'reminders' && alertCount > 0;

          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium group relative"
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.15))',
                color: '#93c5fd',
              } : {
                color: 'rgba(148,163,184,0.7)',
              }}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #3b82f6, #6366f1)' }}
                />
              )}
              <Icon size={17} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className={`flex-1 text-left ${!isActive && 'group-hover:text-slate-200'}`}>
                {label}
              </span>
              {showBadge && (
                <span
                  className="text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center px-1.5 py-0.5"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
              {isActive && <ChevronRight size={13} className="text-blue-400/60" />}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5 my-4" />

      {/* Bottom */}
      <div className="px-3 pb-5">
        <button
          onClick={() => setActiveView('settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium group"
          style={activeView === 'settings' ? {
            background: 'rgba(59,130,246,0.15)',
            color: '#93c5fd',
          } : { color: 'rgba(148,163,184,0.6)' }}
        >
          <Settings size={17} className={activeView === 'settings' ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
          <span className="group-hover:text-slate-200">Einstellungen</span>
        </button>

        {/* Version tag */}
        <div className="mt-5 mx-1 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            BetriebsPrüfer v1.0<br />
            <span className="text-slate-700">BetrSichV · DGUV · BGV</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
