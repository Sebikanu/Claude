import type { EquipmentStatus } from '../types';

interface Props {
  status: EquipmentStatus;
  days?: number | null;
}

const STATUS_CONFIG: Record<
  EquipmentStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  ok: {
    label: 'In Ordnung',
    bg: 'rgba(34,197,94,0.1)',
    text: '#15803d',
    dot: '#22c55e',
  },
  warning: {
    label: 'Bald fällig',
    bg: 'rgba(245,158,11,0.12)',
    text: '#b45309',
    dot: '#f59e0b',
  },
  overdue: {
    label: 'Überfällig',
    bg: 'rgba(239,68,68,0.1)',
    text: '#b91c1c',
    dot: '#ef4444',
  },
  uninspected: {
    label: 'Nicht geprüft',
    bg: 'rgba(100,116,139,0.1)',
    text: '#475569',
    dot: '#94a3b8',
  },
};

export default function StatusBadge({ status, days }: Props) {
  const cfg = STATUS_CONFIG[status];
  let label = cfg.label;

  if (status === 'overdue' && days !== undefined && days !== null) {
    label = `${Math.abs(days)}d überfällig`;
  } else if (status === 'warning' && days !== undefined && days !== null) {
    label = `In ${days} Tagen fällig`;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }}
      />
      {label}
    </span>
  );
}
