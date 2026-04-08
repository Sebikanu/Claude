import { Bell, Plus, Search } from 'lucide-react';
import { useStore, getEquipmentStatus } from '../store/useStore';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const VIEW_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Übersicht aller Prüfpflichten' },
  equipment: { title: 'Geräteverwaltung', subtitle: 'Alle erfassten Betriebsmittel' },
  inspections: { title: 'Prüfhistorie', subtitle: 'Dokumentierte Prüfprotokolle' },
  calendar: { title: 'Prüfkalender', subtitle: 'Zeitliche Übersicht der Prüftermine' },
  reminders: { title: 'Erinnerungen', subtitle: 'Handlungsbedarf und Fristen' },
  settings: { title: 'Einstellungen', subtitle: 'Konfiguration und Datenverwaltung' },
  'equipment-new': { title: 'Neues Gerät', subtitle: 'Betriebsmittel erfassen' },
  'equipment-edit': { title: 'Gerät bearbeiten', subtitle: 'Stammdaten aktualisieren' },
  'inspection-new': { title: 'Prüfung dokumentieren', subtitle: 'Neues Prüfprotokoll anlegen' },
};

export default function Header() {
  const activeView = useStore((s) => s.activeView);
  const setActiveView = useStore((s) => s.setActiveView);
  const equipment = useStore((s) => s.equipment);

  const alertCount = equipment.filter(
    (e) => getEquipmentStatus(e) === 'overdue' || getEquipmentStatus(e) === 'warning'
  ).length;

  const view = VIEW_TITLES[activeView] ?? { title: 'BetriebsPrüfer', subtitle: '' };
  const today = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });

  return (
    <header
      className="sticky top-0 z-20 px-6 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(240,242,245,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
          {view.title}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{view.subtitle} · <span className="capitalize">{today}</span></p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button
          onClick={() => setActiveView('equipment')}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 border border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 hover:text-slate-600"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <Search size={14} />
          <span className="text-xs">Suchen…</span>
          <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
        </button>

        {/* Bell */}
        <button
          onClick={() => setActiveView('reminders')}
          className="relative p-2.5 rounded-xl bg-white/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 text-slate-500 hover:text-slate-700"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <Bell size={17} />
          {alertCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-white"
              style={{ background: '#ef4444' }}
            />
          )}
        </button>

        {/* CTA */}
        <button
          onClick={() => setActiveView('equipment-new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Gerät hinzufügen
        </button>
      </div>
    </header>
  );
}
