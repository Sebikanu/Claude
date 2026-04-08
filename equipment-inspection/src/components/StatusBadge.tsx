import type { EquipmentStatus } from '../types';

interface Props {
  status: EquipmentStatus;
  days?: number | null;
}

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; classes: string; dot: string }> = {
  ok: {
    label: 'In Ordnung',
    classes: 'bg-green-100 text-green-800 border border-green-200',
    dot: 'bg-green-500',
  },
  warning: {
    label: 'Bald fällig',
    classes: 'bg-amber-100 text-amber-800 border border-amber-200',
    dot: 'bg-amber-500',
  },
  overdue: {
    label: 'Überfällig',
    classes: 'bg-red-100 text-red-800 border border-red-200',
    dot: 'bg-red-500',
  },
  uninspected: {
    label: 'Nicht geprüft',
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
    dot: 'bg-gray-400',
  },
};

export default function StatusBadge({ status, days }: Props) {
  const cfg = STATUS_CONFIG[status];
  let label = cfg.label;

  if (status === 'overdue' && days !== undefined && days !== null) {
    label = `${Math.abs(days)} Tage überfällig`;
  } else if (status === 'warning' && days !== undefined && days !== null) {
    label = `In ${days} Tagen fällig`;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}
