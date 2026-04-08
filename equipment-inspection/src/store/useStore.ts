import { create } from 'zustand';
import type { Equipment, Inspection, EquipmentStatus } from '../types';
import { INTERVAL_DAYS } from '../types';
import { api } from '../api/client';
import { addDays, differenceInDays, parseISO, format } from 'date-fns';

// ── Helpers ──────────────────────────────────────────────────────────────────

export function computeNextDate(
  lastDate: string | null,
  interval: Equipment['inspectionInterval']
): string | null {
  if (!lastDate) return null;
  return format(addDays(parseISO(lastDate), INTERVAL_DAYS[interval]), 'yyyy-MM-dd');
}

export function getEquipmentStatus(equipment: Equipment): EquipmentStatus {
  if (!equipment.nextInspectionDate) return 'uninspected';
  const diff = differenceInDays(parseISO(equipment.nextInspectionDate), new Date());
  if (diff < 0) return 'overdue';
  if (diff <= 30) return 'warning';
  return 'ok';
}

export function getDaysUntilInspection(equipment: Equipment): number | null {
  if (!equipment.nextInspectionDate) return null;
  return differenceInDays(parseISO(equipment.nextInspectionDate), new Date());
}

// ── Store interface ──────────────────────────────────────────────────────────

interface StoreState {
  equipment: Equipment[];
  inspections: Inspection[];
  loading: boolean;
  error: string | null;
  activeView: string;
  selectedEquipmentId: string | null;
  notificationsEnabled: boolean;

  // Data fetching
  fetchAll: () => Promise<void>;

  // Equipment CRUD
  addEquipment: (e: Omit<Equipment, 'id' | 'createdAt'>) => Promise<void>;
  updateEquipment: (id: string, e: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;

  // Inspection CRUD
  addInspection: (i: Omit<Inspection, 'id'>) => Promise<void>;
  deleteInspection: (id: string) => Promise<void>;

  // UI
  setActiveView: (view: string) => void;
  setSelectedEquipmentId: (id: string | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  clearError: () => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<StoreState>()((set, get) => ({
  equipment: [],
  inspections: [],
  loading: false,
  error: null,
  activeView: 'dashboard',
  selectedEquipmentId: null,
  notificationsEnabled: false,

  // ── Fetch all data from API on startup ─────────────────────────────────
  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [equipment, inspections] = await Promise.all([
        api.equipment.list(),
        api.inspections.list(),
      ]);
      set({ equipment, inspections, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error
          ? `Verbindung zum Server fehlgeschlagen: ${err.message}`
          : 'Unbekannter Fehler',
      });
    }
  },

  // ── Equipment ─────────────────────────────────────────────────────────
  addEquipment: async (data) => {
    const nextInspectionDate = computeNextDate(data.lastInspectionDate, data.inspectionInterval);
    try {
      const created = await api.equipment.create({ ...data, nextInspectionDate });
      set((s) => ({ equipment: [...s.equipment, created] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler beim Speichern' });
    }
  },

  updateEquipment: async (id, data) => {
    const existing = get().equipment.find((e) => e.id === id);
    if (!existing) return;
    const merged = { ...existing, ...data };
    merged.nextInspectionDate = computeNextDate(
      merged.lastInspectionDate,
      merged.inspectionInterval
    );
    try {
      const updated = await api.equipment.update(id, merged);
      set((s) => ({
        equipment: s.equipment.map((e) => (e.id === id ? updated : e)),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler beim Aktualisieren' });
    }
  },

  deleteEquipment: async (id) => {
    // Optimistic update
    const prev = get().equipment;
    const prevIns = get().inspections;
    set((s) => ({
      equipment: s.equipment.filter((e) => e.id !== id),
      inspections: s.inspections.filter((i) => i.equipmentId !== id),
    }));
    try {
      await api.equipment.delete(id);
    } catch (err) {
      set({ equipment: prev, inspections: prevIns, error: 'Fehler beim Löschen' });
    }
  },

  // ── Inspections ────────────────────────────────────────────────────────
  addInspection: async (data) => {
    try {
      const created = await api.inspections.create(data);
      // Update equipment dates optimistically (server already updated them)
      set((s) => ({
        inspections: [created, ...s.inspections],
        equipment: s.equipment.map((eq) => {
          if (eq.id !== data.equipmentId) return eq;
          return { ...eq, lastInspectionDate: data.date, nextInspectionDate: data.nextInspectionDate };
        }),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler beim Speichern der Prüfung' });
    }
  },

  deleteInspection: async (id) => {
    const prev = get().inspections;
    set((s) => ({ inspections: s.inspections.filter((i) => i.id !== id) }));
    try {
      await api.inspections.delete(id);
    } catch (err) {
      set({ inspections: prev, error: 'Fehler beim Löschen der Prüfung' });
    }
  },

  // ── UI ────────────────────────────────────────────────────────────────
  setActiveView: (view) => set({ activeView: view }),
  setSelectedEquipmentId: (id) => set({ selectedEquipmentId: id }),
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  clearError: () => set({ error: null }),
}));

// ── Derived selector ─────────────────────────────────────────────────────────

export function useEquipmentStats() {
  const equipment = useStore((s) => s.equipment);
  const inspections = useStore((s) => s.inspections);

  const total      = equipment.length;
  const ok         = equipment.filter((e) => getEquipmentStatus(e) === 'ok').length;
  const warning    = equipment.filter((e) => getEquipmentStatus(e) === 'warning').length;
  const overdue    = equipment.filter((e) => getEquipmentStatus(e) === 'overdue').length;
  const uninspected = equipment.filter((e) => getEquipmentStatus(e) === 'uninspected').length;

  const thisMonth  = inspections.filter((i) => {
    const d = parseISO(i.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return { total, ok, warning, overdue, uninspected, thisMonth };
}
