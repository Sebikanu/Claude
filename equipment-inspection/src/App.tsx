import { useEffect } from 'react';
import './index.css';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import EquipmentForm from './components/EquipmentForm';
import InspectionForm from './components/InspectionForm';
import InspectionHistory from './components/InspectionHistory';
import CalendarView from './components/CalendarView';
import RemindersView from './components/RemindersView';
import SettingsView from './components/SettingsView';
import { ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

function MainContent() {
  const activeView = useStore((s) => s.activeView);

  switch (activeView) {
    case 'dashboard':      return <Dashboard />;
    case 'equipment':      return <EquipmentList />;
    case 'equipment-new':  return <EquipmentForm />;
    case 'equipment-edit': return <EquipmentForm isEdit />;
    case 'inspections':    return <InspectionHistory />;
    case 'inspection-new': return <InspectionForm />;
    case 'calendar':       return <CalendarView />;
    case 'reminders':      return <RemindersView />;
    case 'settings':       return <SettingsView />;
    default:               return <Dashboard />;
  }
}

export default function App() {
  const fetchAll = useStore((s) => s.fetchAll);
  const loading  = useStore((s) => s.loading);
  const error    = useStore((s) => s.error);
  const clearError = useStore((s) => s.clearError);

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Full-screen loading ───────────────────────────────────────────────
  if (loading && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 100%)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
          <ShieldCheck size={28} className="text-white" />
        </div>
        <p className="text-white font-bold text-xl tracking-tight">BetriebsPrüfer</p>
        <div className="flex items-center gap-2 text-blue-300 text-sm">
          <RefreshCw size={14} className="animate-spin" />
          Datenbank wird geladen…
        </div>
      </div>
    );
  }

  // ── Connection error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6"
        style={{ background: '#f0f2f5' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-100">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <div className="text-center max-w-sm">
          <p className="font-bold text-slate-800 text-lg mb-1">Server nicht erreichbar</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <p className="text-xs text-slate-400 bg-slate-100 rounded-xl px-4 py-3 font-mono text-left">
            Starte den Server mit:<br />
            <strong>npm run server</strong>
          </p>
        </div>
        <button
          onClick={() => { clearError(); fetchAll(); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
        >
          <RefreshCw size={15} />
          Erneut versuchen
        </button>
      </div>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <MainContent />
        </main>
      </div>
    </div>
  );
}
