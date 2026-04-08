import { Bell, BellOff, AlertTriangle, Clock, ClipboardPlus, CheckCircle } from 'lucide-react';
import { useStore, getEquipmentStatus, getDaysUntilInspection } from '../store/useStore';
import type { Equipment } from '../types';
import { CATEGORY_ICONS, INTERVAL_LABELS } from '../types';
import StatusBadge from './StatusBadge';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export default function RemindersView() {
  const equipment = useStore((s) => s.equipment);
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useStore((s) => s.setNotificationsEnabled);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);

  const overdue = equipment
    .filter((e) => getEquipmentStatus(e) === 'overdue')
    .sort((a, b) => (getDaysUntilInspection(a) ?? 0) - (getDaysUntilInspection(b) ?? 0));

  const warning = equipment
    .filter((e) => getEquipmentStatus(e) === 'warning')
    .sort((a, b) => (getDaysUntilInspection(a) ?? 0) - (getDaysUntilInspection(b) ?? 0));

  const uninspected = equipment.filter((e) => getEquipmentStatus(e) === 'uninspected');

  const enableBrowserNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('BetriebsPrüfer', {
          body: `Browser-Benachrichtigungen aktiviert. Sie werden an ${overdue.length + warning.length} anstehende Prüfung(en) erinnert.`,
          icon: '/favicon.ico',
        });
      } else {
        alert('Benachrichtigungen wurden abgelehnt. Bitte erlauben Sie Benachrichtigungen in Ihren Browser-Einstellungen.');
      }
    } else {
      alert('Ihr Browser unterstützt keine Desktop-Benachrichtigungen.');
    }
  };

  const handleInspect = (id: string) => {
    setSelectedEquipmentId(id);
    setActiveView('inspection-new');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification toggle */}
      <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${notificationsEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </div>
          <div>
            <p className="font-semibold text-slate-800">Browser-Benachrichtigungen</p>
            <p className="text-sm text-slate-500">
              {notificationsEnabled
                ? 'Benachrichtigungen sind aktiviert'
                : 'Erhalten Sie Desktop-Benachrichtigungen bei fälligen Prüfungen'}
            </p>
          </div>
        </div>
        <button
          onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : enableBrowserNotifications}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            notificationsEnabled
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {notificationsEnabled ? 'Deaktivieren' : 'Aktivieren'}
        </button>
      </div>

      {/* Summary banner */}
      {overdue.length + warning.length + uninspected.length === 0 ? (
        <div className="rounded-2xl p-6 flex items-center gap-4" style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)' }}>
          <CheckCircle size={32} className="text-green-500 shrink-0" />
          <div>
            <p className="font-bold text-green-800">Alles in Ordnung!</p>
            <p className="text-green-700 text-sm">Alle Geräte wurden fristgerecht geprüft.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard
            count={overdue.length}
            label="Überfällig"
            color="red"
            icon={<AlertTriangle size={20} />}
          />
          <SummaryCard
            count={warning.length}
            label="Bald fällig (≤30 Tage)"
            color="amber"
            icon={<Clock size={20} />}
          />
          <SummaryCard
            count={uninspected.length}
            label="Noch nicht geprüft"
            color="gray"
            icon={<ClipboardPlus size={20} />}
          />
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section
          title="Überfällige Prüfungen"
          icon={<AlertTriangle size={16} className="text-red-500" />}
          headerClass="bg-red-50 border-red-200"
          items={overdue}
          onInspect={handleInspect}
        />
      )}

      {/* Warning */}
      {warning.length > 0 && (
        <Section
          title="Bald fällige Prüfungen"
          icon={<Clock size={16} className="text-amber-500" />}
          headerClass="bg-amber-50 border-amber-200"
          items={warning}
          onInspect={handleInspect}
        />
      )}

      {/* Uninspected */}
      {uninspected.length > 0 && (
        <Section
          title="Noch nie geprüft"
          icon={<ClipboardPlus size={16} className="text-slate-400" />}
          headerClass="bg-slate-50 border-slate-200"
          items={uninspected}
          onInspect={handleInspect}
        />
      )}
    </div>
  );
}

function SummaryCard({ count, label, color, icon }: { count: number; label: string; color: string; icon: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 border-red-200 text-red-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    gray: 'bg-slate-50 border-slate-200 text-slate-600',
  };
  return (
    <div className={`border rounded-xl p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs font-semibold">{label}</span></div>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  headerClass,
  items,
  onInspect,
}: {
  title: string;
  icon: React.ReactNode;
  headerClass: string;
  items: Equipment[];
  onInspect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
      <div className={`px-5 py-3.5 border-b flex items-center gap-2 ${headerClass}`}>
        {icon}
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-medium">{items.length}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((eq) => {
          const status = getEquipmentStatus(eq);
          const days = getDaysUntilInspection(eq);
          return (
            <div key={eq.id} className="px-5 py-4 flex items-center gap-4">
              <span className="text-2xl shrink-0">{CATEGORY_ICONS[eq.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{eq.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                  <span>{eq.location}</span>
                  {eq.department && <span>· {eq.department}</span>}
                  <span>· {INTERVAL_LABELS[eq.inspectionInterval]}</span>
                  {eq.nextInspectionDate && (
                    <span>
                      · Fällig: {format(parseISO(eq.nextInspectionDate), 'd. MMM yyyy', { locale: de })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={status} days={days} />
                <button
                  onClick={() => onInspect(eq.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <ClipboardPlus size={13} />
                  Prüfen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
