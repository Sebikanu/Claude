import { Bell, Plus } from 'lucide-react';
import { useStore, getEquipmentStatus } from '../store/useStore';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  equipment: 'Geräteverwaltung',
  inspections: 'Prüfhistorie',
  calendar: 'Prüfkalender',
  reminders: 'Erinnerungen',
  settings: 'Einstellungen',
  'equipment-new': 'Neues Gerät',
  'equipment-edit': 'Gerät bearbeiten',
  'inspection-new': 'Neue Prüfung',
};

export default function Header() {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const equipment = useStore((s) => s.equipment);

  const alertCount = equipment.filter(
    (e) => getEquipmentStatus(e) === 'overdue' || getEquipmentStatus(e) === 'warning'
  ).length;

  const today = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {VIEW_TITLES[activeView] ?? 'BetriebsPrüfer'}
        </h1>
        <p className="text-sm text-slate-500 capitalize">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('equipment-new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          Gerät hinzufügen
        </button>

        <button
          onClick={() => setActiveView('reminders')}
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Bell size={20} className="text-slate-600" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    </header>
  );
}
