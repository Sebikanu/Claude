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

function MainContent() {
  const activeView = useStore((s) => s.activeView);

  switch (activeView) {
    case 'dashboard':
      return <Dashboard />;
    case 'equipment':
      return <EquipmentList />;
    case 'equipment-new':
      return <EquipmentForm />;
    case 'equipment-edit':
      return <EquipmentForm isEdit />;
    case 'inspections':
      return <InspectionHistory />;
    case 'inspection-new':
      return <InspectionForm />;
    case 'calendar':
      return <CalendarView />;
    case 'reminders':
      return <RemindersView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <Dashboard />;
  }
}

export default function App() {
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
