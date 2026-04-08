import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, Inspection, EquipmentStatus } from '../types';
import { INTERVAL_DAYS } from '../types';
import { addDays, differenceInDays, parseISO, format } from 'date-fns';

interface StoreState {
  equipment: Equipment[];
  inspections: Inspection[];
  activeView: string;
  selectedEquipmentId: string | null;
  notificationsEnabled: boolean;

  // Equipment CRUD
  addEquipment: (e: Omit<Equipment, 'id' | 'createdAt' | 'nextInspectionDate'>) => void;
  updateEquipment: (id: string, e: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // Inspection CRUD
  addInspection: (i: Omit<Inspection, 'id'>) => void;
  deleteInspection: (id: string) => void;

  // UI
  setActiveView: (view: string) => void;
  setSelectedEquipmentId: (id: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

function computeNextDate(lastDate: string | null, interval: Equipment['inspectionInterval']): string | null {
  if (!lastDate) return null;
  const days = INTERVAL_DAYS[interval];
  return format(addDays(parseISO(lastDate), days), 'yyyy-MM-dd');
}

export function getEquipmentStatus(equipment: Equipment): EquipmentStatus {
  if (!equipment.nextInspectionDate) return 'uninspected';
  const today = new Date();
  const next = parseISO(equipment.nextInspectionDate);
  const diff = differenceInDays(next, today);
  if (diff < 0) return 'overdue';
  if (diff <= 30) return 'warning';
  return 'ok';
}

export function getDaysUntilInspection(equipment: Equipment): number | null {
  if (!equipment.nextInspectionDate) return null;
  return differenceInDays(parseISO(equipment.nextInspectionDate), new Date());
}

const DEMO_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    name: 'Aluleiter 6m',
    category: 'Leiter',
    serialNumber: 'AL-2019-001',
    manufacturer: 'Zarges',
    location: 'Lager EG',
    department: 'Produktion',
    inspectionInterval: 'annual',
    lastInspectionDate: '2025-04-10',
    nextInspectionDate: '2026-04-10',
    notes: 'Mehrzweckleiter, max. 150 kg',
    createdAt: '2024-01-15',
  },
  {
    id: 'eq-2',
    name: 'Feuerlöscher Büro 1',
    category: 'Feuerlöscher',
    serialNumber: 'FL-ABC-2022-047',
    manufacturer: 'Minimax',
    location: 'Büro 1.OG',
    department: 'Verwaltung',
    inspectionInterval: 'annual',
    lastInspectionDate: '2024-11-01',
    nextInspectionDate: '2025-11-01',
    notes: 'ABC-Pulver, 6 kg',
    createdAt: '2024-01-15',
  },
  {
    id: 'eq-3',
    name: 'Bohrmaschine Werkstatt',
    category: 'Elektrisches Gerät',
    serialNumber: 'BM-B24-0032',
    manufacturer: 'Bosch',
    location: 'Werkstatt',
    department: 'Instandhaltung',
    inspectionInterval: 'annual',
    lastInspectionDate: '2024-03-15',
    nextInspectionDate: '2025-03-15',
    notes: 'SDS-Plus, 850W',
    createdAt: '2024-01-15',
  },
  {
    id: 'eq-4',
    name: 'Hubwagen HW-01',
    category: 'Hebezeug',
    serialNumber: 'HW-001-2020',
    manufacturer: 'Still',
    location: 'Lager EG',
    department: 'Logistik',
    inspectionInterval: 'annual',
    lastInspectionDate: '2024-12-01',
    nextInspectionDate: '2025-12-01',
    notes: 'Tragfähigkeit 2500 kg, elektrisch',
    createdAt: '2024-01-15',
  },
  {
    id: 'eq-5',
    name: 'Kompressor K200',
    category: 'Druckbehälter',
    serialNumber: 'KP-200-2018-09',
    manufacturer: 'Atlas Copco',
    location: 'Maschinenraum',
    department: 'Produktion',
    inspectionInterval: 'biennial',
    lastInspectionDate: '2023-06-01',
    nextInspectionDate: '2025-06-01',
    notes: 'Betriebsdruck max. 10 bar',
    createdAt: '2024-01-15',
  },
  {
    id: 'eq-6',
    name: 'Transporter VW Crafter',
    category: 'Fahrzeug',
    serialNumber: 'WV1ZZZ2CZ12345678',
    manufacturer: 'Volkswagen',
    location: 'Außenparkplatz',
    department: 'Logistik',
    inspectionInterval: 'annual',
    lastInspectionDate: '2025-01-20',
    nextInspectionDate: '2026-01-20',
    notes: 'Kennzeichen: MU-AB 1234, TÜV 01/2026',
    createdAt: '2024-01-15',
  },
  {
    id: 'eq-7',
    name: 'Stehleiter 3m',
    category: 'Leiter',
    serialNumber: 'SL-3M-2021-003',
    manufacturer: 'Günzburger',
    location: 'Regal A3',
    department: 'Produktion',
    inspectionInterval: 'annual',
    lastInspectionDate: null,
    nextInspectionDate: null,
    notes: 'Noch nie geprüft',
    createdAt: '2024-01-15',
  },
];

const DEMO_INSPECTIONS: Inspection[] = [
  {
    id: 'ins-1',
    equipmentId: 'eq-1',
    date: '2025-04-10',
    inspector: 'Max Mustermann',
    result: 'passed',
    checklist: [
      { id: 'c1', label: 'Holme und Sprossen auf Beschädigungen prüfen', checked: true, note: '' },
      { id: 'c2', label: 'Verbindungsstellen auf festen Sitz prüfen', checked: true, note: '' },
      { id: 'c3', label: 'Antirutscheinrichtungen vorhanden und in Ordnung', checked: true, note: '' },
      { id: 'c4', label: 'Beschriftung/Kennzeichnung lesbar', checked: true, note: '' },
      { id: 'c5', label: 'Keine Risse, Verformungen oder Korrosion', checked: true, note: '' },
      { id: 'c6', label: 'Sicherungseinrichtungen funktionsfähig (bei Stehleitern)', checked: true, note: '' },
      { id: 'c7', label: 'Leiternfüße in Ordnung', checked: true, note: '' },
    ],
    defects: '',
    measures: '',
    notes: 'Kein Mangel festgestellt.',
    nextInspectionDate: '2026-04-10',
    signature: 'M. Mustermann',
  },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      equipment: DEMO_EQUIPMENT,
      inspections: DEMO_INSPECTIONS,
      activeView: 'dashboard',
      selectedEquipmentId: null,
      notificationsEnabled: false,

      addEquipment: (e) => {
        const nextDate = computeNextDate(e.lastInspectionDate, e.inspectionInterval);
        const newEquipment: Equipment = {
          ...e,
          id: `eq-${Date.now()}`,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
          nextInspectionDate: nextDate,
        };
        set((s) => ({ equipment: [...s.equipment, newEquipment] }));
      },

      updateEquipment: (id, updates) => {
        set((s) => ({
          equipment: s.equipment.map((eq) => {
            if (eq.id !== id) return eq;
            const merged = { ...eq, ...updates };
            merged.nextInspectionDate = computeNextDate(
              merged.lastInspectionDate,
              merged.inspectionInterval
            );
            return merged;
          }),
        }));
      },

      deleteEquipment: (id) => {
        set((s) => ({
          equipment: s.equipment.filter((e) => e.id !== id),
          inspections: s.inspections.filter((i) => i.equipmentId !== id),
        }));
      },

      addInspection: (ins) => {
        const newIns: Inspection = { ...ins, id: `ins-${Date.now()}` };
        set((s) => {
          const updated = s.equipment.map((eq) => {
            if (eq.id !== ins.equipmentId) return eq;
            return {
              ...eq,
              lastInspectionDate: ins.date,
              nextInspectionDate: ins.nextInspectionDate,
            };
          });
          return {
            inspections: [newIns, ...s.inspections],
            equipment: updated,
          };
        });
      },

      deleteInspection: (id) => {
        set((s) => ({ inspections: s.inspections.filter((i) => i.id !== id) }));
      },

      setActiveView: (view) => set({ activeView: view }),
      setSelectedEquipmentId: (id) => set({ selectedEquipmentId: id }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'equipment-inspection-store',
    }
  )
);

export function useEquipmentStats() {
  const equipment = useStore((s) => s.equipment);
  const inspections = useStore((s) => s.inspections);

  const total = equipment.length;
  const ok = equipment.filter((e) => getEquipmentStatus(e) === 'ok').length;
  const warning = equipment.filter((e) => getEquipmentStatus(e) === 'warning').length;
  const overdue = equipment.filter((e) => getEquipmentStatus(e) === 'overdue').length;
  const uninspected = equipment.filter((e) => getEquipmentStatus(e) === 'uninspected').length;

  const thisMonth = inspections.filter((i) => {
    const d = parseISO(i.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return { total, ok, warning, overdue, uninspected, thisMonth };
}
