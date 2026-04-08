import { AlertTriangle, CheckCircle, Clock, Package, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useStore, getEquipmentStatus, getDaysUntilInspection, useEquipmentStats } from '../store/useStore';
import { CATEGORY_ICONS } from '../types';
import StatusBadge from './StatusBadge';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Dashboard() {
  const equipment = useStore((s) => s.equipment);
  const inspections = useStore((s) => s.inspections);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);
  const stats = useEquipmentStats();

  const urgentItems = equipment
    .filter((e) => {
      const s = getEquipmentStatus(e);
      return s === 'overdue' || s === 'warning';
    })
    .sort((a, b) => {
      const da = getDaysUntilInspection(a) ?? 999;
      const db = getDaysUntilInspection(b) ?? 999;
      return da - db;
    })
    .slice(0, 5);

  const recentInspections = [...inspections]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const handleEquipmentClick = (id: string) => {
    setSelectedEquipmentId(id);
    setActiveView('equipment');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package size={22} />}
          label="Geräte gesamt"
          value={stats.total}
          color="blue"
          onClick={() => setActiveView('equipment')}
        />
        <StatCard
          icon={<CheckCircle size={22} />}
          label="In Ordnung"
          value={stats.ok}
          color="green"
          onClick={() => setActiveView('equipment')}
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Bald fällig"
          value={stats.warning}
          color="amber"
          onClick={() => setActiveView('reminders')}
        />
        <StatCard
          icon={<AlertTriangle size={22} />}
          label="Überfällig"
          value={stats.overdue}
          color="red"
          onClick={() => setActiveView('reminders')}
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<ClipboardCheck size={22} />}
          label="Prüfungen diesen Monat"
          value={stats.thisMonth}
          color="purple"
          onClick={() => setActiveView('inspections')}
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Nicht geprüft"
          value={stats.uninspected}
          color="gray"
          onClick={() => setActiveView('equipment')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent items */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Handlungsbedarf
            </h2>
            <button
              onClick={() => setActiveView('reminders')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Alle anzeigen →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {urgentItems.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                Alle Geräte sind in Ordnung!
              </div>
            ) : (
              urgentItems.map((eq) => {
                const status = getEquipmentStatus(eq);
                const days = getDaysUntilInspection(eq);
                return (
                  <div
                    key={eq.id}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleEquipmentClick(eq.id)}
                  >
                    <span className="text-xl">{CATEGORY_ICONS[eq.category]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{eq.name}</p>
                      <p className="text-xs text-slate-500">{eq.location} · {eq.department}</p>
                    </div>
                    <StatusBadge status={status} days={days} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent inspections */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-blue-500" />
              Letzte Prüfungen
            </h2>
            <button
              onClick={() => setActiveView('inspections')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Alle anzeigen →
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentInspections.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">
                Noch keine Prüfungen dokumentiert.
              </div>
            ) : (
              recentInspections.map((ins) => {
                const eq = equipment.find((e) => e.id === ins.equipmentId);
                return (
                  <div key={ins.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-xl">{eq ? CATEGORY_ICONS[eq.category] : '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">
                        {eq?.name ?? 'Unbekannt'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(ins.date), 'd. MMM yyyy', { locale: de })} · {ins.inspector}
                      </p>
                    </div>
                    <ResultBadge result={ins.result} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Category overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Übersicht nach Kategorie</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(
            equipment.reduce((acc, eq) => {
              acc[eq.category] = (acc[eq.category] ?? 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([cat, count]) => (
            <div
              key={cat}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={() => setActiveView('equipment')}
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</span>
              <div>
                <p className="text-xs text-slate-500">{cat}</p>
                <p className="font-bold text-slate-800">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  onClick?: () => void;
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-slate-50 text-slate-500 border-slate-100',
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className={`inline-flex p-2.5 rounded-lg border ${colorMap[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </button>
  );
}

function ResultBadge({ result }: { result: string }) {
  const map = {
    passed: { label: 'Bestanden', classes: 'bg-green-100 text-green-800' },
    failed: { label: 'Nicht bestanden', classes: 'bg-red-100 text-red-800' },
    conditional: { label: 'Bedingt', classes: 'bg-amber-100 text-amber-800' },
  };
  const cfg = map[result as keyof typeof map] ?? { label: result, classes: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
