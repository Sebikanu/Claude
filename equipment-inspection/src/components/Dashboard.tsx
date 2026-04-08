import { AlertTriangle, CheckCircle, Clock, Package, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useStore, getEquipmentStatus, getDaysUntilInspection, useEquipmentStats } from '../store/useStore';
import { CATEGORY_ICONS } from '../types';
import StatusBadge from './StatusBadge';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const CARD_CONFIG = {
  blue:   { gradient: 'linear-gradient(135deg,#1d4ed8,#2563eb)', glow: 'rgba(37,99,235,0.25)', icon: 'rgba(255,255,255,0.2)' },
  green:  { gradient: 'linear-gradient(135deg,#15803d,#16a34a)', glow: 'rgba(22,163,74,0.25)',  icon: 'rgba(255,255,255,0.2)' },
  amber:  { gradient: 'linear-gradient(135deg,#b45309,#d97706)', glow: 'rgba(217,119,6,0.25)',  icon: 'rgba(255,255,255,0.2)' },
  red:    { gradient: 'linear-gradient(135deg,#b91c1c,#dc2626)', glow: 'rgba(220,38,38,0.25)',  icon: 'rgba(255,255,255,0.2)' },
  purple: { gradient: 'linear-gradient(135deg,#6d28d9,#7c3aed)', glow: 'rgba(124,58,237,0.25)', icon: 'rgba(255,255,255,0.2)' },
  gray:   { gradient: 'linear-gradient(135deg,#475569,#64748b)', glow: 'rgba(100,116,139,0.2)', icon: 'rgba(255,255,255,0.2)' },
};

export default function Dashboard() {
  const equipment = useStore((s) => s.equipment);
  const inspections = useStore((s) => s.inspections);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);
  const stats = useEquipmentStats();

  const urgentItems = equipment
    .filter((e) => { const s = getEquipmentStatus(e); return s === 'overdue' || s === 'warning'; })
    .sort((a, b) => (getDaysUntilInspection(a) ?? 999) - (getDaysUntilInspection(b) ?? 999))
    .slice(0, 5);

  const recentInspections = [...inspections]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const handleEquipmentClick = (id: string) => {
    setSelectedEquipmentId(id);
    setActiveView('equipment');
  };

  return (
    <div className="p-6 space-y-5">
      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Package size={20} />} label="Geräte gesamt"      value={stats.total}   color="blue"  onClick={() => setActiveView('equipment')} />
        <StatCard icon={<CheckCircle size={20} />} label="In Ordnung"     value={stats.ok}      color="green" onClick={() => setActiveView('equipment')} />
        <StatCard icon={<Clock size={20} />} label="Bald fällig"          value={stats.warning} color="amber" onClick={() => setActiveView('reminders')} />
        <StatCard icon={<AlertTriangle size={20} />} label="Überfällig"   value={stats.overdue} color="red"   onClick={() => setActiveView('reminders')} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<ClipboardCheck size={20} />} label="Prüfungen diesen Monat" value={stats.thisMonth}   color="purple" onClick={() => setActiveView('inspections')} />
        <StatCard icon={<TrendingUp size={20} />}     label="Noch nie geprüft"       value={stats.uninspected} color="gray"   onClick={() => setActiveView('equipment')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Urgent */}
        <Card
          title="Handlungsbedarf"
          icon={<AlertTriangle size={14} className="text-red-400" />}
          action={{ label: 'Alle anzeigen', onClick: () => setActiveView('reminders') }}
        >
          {urgentItems.length === 0 ? (
            <EmptyState icon={<CheckCircle size={28} className="text-green-400" />} text="Alle Geräte sind in Ordnung!" />
          ) : (
            urgentItems.map((eq) => {
              const status = getEquipmentStatus(eq);
              const days = getDaysUntilInspection(eq);
              return (
                <div
                  key={eq.id}
                  onClick={() => handleEquipmentClick(eq.id)}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer group"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <span className="text-xl">{CATEGORY_ICONS[eq.category]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{eq.name}</p>
                    <p className="text-xs text-slate-400">{eq.location}{eq.department ? ` · ${eq.department}` : ''}</p>
                  </div>
                  <StatusBadge status={status} days={days} />
                </div>
              );
            })
          )}
        </Card>

        {/* Recent inspections */}
        <Card
          title="Letzte Prüfungen"
          icon={<ClipboardCheck size={14} className="text-blue-400" />}
          action={{ label: 'Alle anzeigen', onClick: () => setActiveView('inspections') }}
        >
          {recentInspections.length === 0 ? (
            <EmptyState text="Noch keine Prüfungen dokumentiert." />
          ) : (
            recentInspections.map((ins) => {
              const eq = equipment.find((e) => e.id === ins.equipmentId);
              return (
                <div key={ins.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span className="text-xl">{eq ? CATEGORY_ICONS[eq.category] : '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{eq?.name ?? 'Unbekannt'}</p>
                    <p className="text-xs text-slate-400">
                      {format(parseISO(ins.date), 'd. MMM yyyy', { locale: de })} · {ins.inspector}
                    </p>
                  </div>
                  <ResultBadge result={ins.result} />
                </div>
              );
            })
          )}
        </Card>
      </div>

      {/* Category grid */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <h2 className="font-semibold text-slate-800 text-sm tracking-tight">Übersicht nach Kategorie</h2>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(
            equipment.reduce((acc, eq) => {
              acc[eq.category] = (acc[eq.category] ?? 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([cat, count]) => (
            <div
              key={cat}
              onClick={() => setActiveView('equipment')}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group"
              style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</span>
              <div>
                <p className="text-[10px] text-slate-400 leading-tight">{cat}</p>
                <p className="font-bold text-slate-800 text-lg leading-tight">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function StatCard({
  icon, label, value, color, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: keyof typeof CARD_CONFIG;
  onClick?: () => void;
}) {
  const cfg = CARD_CONFIG[color];
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-5 text-left text-white group"
      style={{ background: cfg.gradient, boxShadow: `0 4px 20px ${cfg.glow}` }}
    >
      {/* Decorative circle */}
      <span
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
      <div
        className="inline-flex p-2 rounded-lg mb-3"
        style={{ background: cfg.icon }}
      >
        {icon}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs mt-0.5 opacity-80 font-medium">{label}</p>
    </button>
  );
}

function Card({
  title, icon, action, children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
          {icon}{title}
        </h2>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs text-blue-500 hover:text-blue-700 font-semibold"
          >
            {action.label} →
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="py-10 text-center text-slate-400 text-sm space-y-2">
      {icon && <div className="flex justify-center">{icon}</div>}
      <p>{text}</p>
    </div>
  );
}

function ResultBadge({ result }: { result: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    passed:      { label: 'Bestanden',        bg: 'rgba(22,163,74,0.1)',   color: '#15803d' },
    failed:      { label: 'Nicht bestanden',  bg: 'rgba(220,38,38,0.1)',   color: '#b91c1c' },
    conditional: { label: 'Bedingt',          bg: 'rgba(217,119,6,0.12)',  color: '#b45309' },
  };
  const cfg = map[result] ?? { label: result, bg: '#f1f5f9', color: '#475569' };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}
