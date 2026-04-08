import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { EquipmentCategory, InspectionInterval } from '../types';
import { INTERVAL_LABELS, CATEGORY_ICONS } from '../types';

const CATEGORIES: EquipmentCategory[] = [
  'Leiter',
  'Feuerlöscher',
  'Elektrisches Gerät',
  'Fahrzeug',
  'Maschine',
  'Hebezeug',
  'Druckbehälter',
  'Arbeitsmittel',
  'Sonstiges',
];

const INTERVALS: InspectionInterval[] = [
  'monthly',
  'quarterly',
  'semi-annual',
  'annual',
  'biennial',
];

const EMPTY_FORM = {
  name: '',
  category: 'Leiter' as EquipmentCategory,
  serialNumber: '',
  manufacturer: '',
  location: '',
  department: '',
  inspectionInterval: 'annual' as InspectionInterval,
  lastInspectionDate: '',
  notes: '',
};

export default function EquipmentForm({ isEdit }: { isEdit?: boolean }) {
  const addEquipment = useStore((s) => s.addEquipment);
  const updateEquipment = useStore((s) => s.updateEquipment);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);
  const selectedId = useStore((s) => s.selectedEquipmentId);
  const equipment = useStore((s) => s.equipment);

  const existing = isEdit ? equipment.find((e) => e.id === selectedId) : undefined;

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        category: existing.category,
        serialNumber: existing.serialNumber,
        manufacturer: existing.manufacturer,
        location: existing.location,
        department: existing.department,
        inspectionInterval: existing.inspectionInterval,
        lastInspectionDate: existing.lastInspectionDate ?? '',
        notes: existing.notes,
      });
    }
  }, [existing]);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      lastInspectionDate: form.lastInspectionDate || null,
      nextInspectionDate: null,
    };

    if (isEdit && selectedId) {
      updateEquipment(selectedId, data);
    } else {
      addEquipment(data);
    }

    setSelectedEquipmentId(null);
    setActiveView('equipment');
  };

  return (
    <div className="p-6 max-w-3xl">
      <button
        onClick={() => { setSelectedEquipmentId(null); setActiveView('equipment'); }}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Zurück zur Liste
      </button>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Gerät bearbeiten' : 'Neues Gerät hinzufügen'}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Füllen Sie alle relevanten Felder aus, um das Gerät zu erfassen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Kategorie <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    form.category === cat
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                  <span className="text-center leading-tight">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Bezeichnung"
              required
              value={form.name}
              onChange={(v) => set('name', v)}
              placeholder="z.B. Aluleiter 6m"
            />
            <FormField
              label="Seriennummer / Inventar-Nr."
              value={form.serialNumber}
              onChange={(v) => set('serialNumber', v)}
              placeholder="z.B. AL-2019-001"
            />
            <FormField
              label="Hersteller"
              value={form.manufacturer}
              onChange={(v) => set('manufacturer', v)}
              placeholder="z.B. Zarges"
            />
            <FormField
              label="Standort"
              required
              value={form.location}
              onChange={(v) => set('location', v)}
              placeholder="z.B. Lager EG, Werkstatt"
            />
            <FormField
              label="Abteilung"
              value={form.department}
              onChange={(v) => set('department', v)}
              placeholder="z.B. Produktion"
            />
          </div>

          {/* Inspection settings */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm">Prüfeinstellungen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Prüfintervall <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.inspectionInterval}
                  onChange={(e) => set('inspectionInterval', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INTERVALS.map((iv) => (
                    <option key={iv} value={iv}>{INTERVAL_LABELS[iv]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Datum der letzten Prüfung
                </label>
                <input
                  type="date"
                  value={form.lastInspectionDate}
                  onChange={(e) => set('lastInspectionDate', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Anmerkungen
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Weitere Informationen zum Gerät…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setSelectedEquipmentId(null); setActiveView('equipment'); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600"
              style={{ border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc' }}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}
            >
              <Save size={15} />
              {isEdit ? 'Änderungen speichern' : 'Gerät hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
