import { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { ChecklistItem } from '../types';
import { CHECKLIST_TEMPLATES, INTERVAL_DAYS } from '../types';
import { addDays, format } from 'date-fns';

export default function InspectionForm() {
  const equipment = useStore((s) => s.equipment);
  const addInspection = useStore((s) => s.addInspection);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);
  const selectedId = useStore((s) => s.selectedEquipmentId);

  const eq = equipment.find((e) => e.id === selectedId);

  const defaultNextDate = eq
    ? format(addDays(new Date(), INTERVAL_DAYS[eq.inspectionInterval]), 'yyyy-MM-dd')
    : '';

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    inspector: '',
    result: 'passed' as 'passed' | 'failed' | 'conditional',
    defects: '',
    measures: '',
    notes: '',
    nextInspectionDate: defaultNextDate,
    signature: '',
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (eq) {
      const template = CHECKLIST_TEMPLATES[eq.category] ?? [];
      setChecklist(
        template.map((label, i) => ({
          id: `cl-${i}`,
          label,
          checked: false,
          note: '',
        }))
      );
      setForm((f) => ({
        ...f,
        nextInspectionDate: format(
          addDays(new Date(), INTERVAL_DAYS[eq.inspectionInterval]),
          'yyyy-MM-dd'
        ),
      }));
    }
  }, [eq?.id]);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleCheckItem = (id: string) => {
    setChecklist((cl) =>
      cl.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const setCheckItemNote = (id: string, note: string) => {
    setChecklist((cl) =>
      cl.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const checkedCount = checklist.filter((c) => c.checked).length;
  const allChecked = checklist.length > 0 && checkedCount === checklist.length;

  const toggleAll = () => {
    setChecklist((cl) => cl.map((item) => ({ ...item, checked: !allChecked })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    addInspection({ ...form, equipmentId: selectedId, checklist });
    setSelectedEquipmentId(null);
    setActiveView('inspections');
  };

  if (!eq) {
    return (
      <div className="p-6 text-slate-500">Kein Gerät ausgewählt.</div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <button
        onClick={() => { setSelectedEquipmentId(null); setActiveView('equipment'); }}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Zurück
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-blue-50">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Prüfprotokoll</p>
          <h2 className="text-xl font-bold text-slate-800">{eq.name}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
            <span>Kategorie: <strong>{eq.category}</strong></span>
            <span>·</span>
            <span>Standort: <strong>{eq.location}</strong></span>
            {eq.serialNumber && (
              <>
                <span>·</span>
                <span>S/N: <strong>{eq.serialNumber}</strong></span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic inspection info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Prüfdatum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Prüfer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.inspector}
                onChange={(e) => set('inspector', e.target.value)}
                placeholder="Name des Prüfers"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-700 text-sm">
                Prüfliste ({checkedCount}/{checklist.length})
              </h3>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {allChecked ? <Square size={14} /> : <CheckSquare size={14} />}
                {allChecked ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${checklist.length ? (checkedCount / checklist.length) * 100 : 0}%` }}
              />
            </div>

            <div className="divide-y divide-slate-100">
              {checklist.map((item) => (
                <div key={item.id} className={`px-4 py-3 ${item.checked ? 'bg-green-50/40' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCheckItem(item.id)}
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.checked
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {item.checked && (
                        <svg viewBox="0 0 10 8" className="w-3 h-3 fill-current">
                          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${item.checked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                        {item.label}
                      </p>
                      {!item.checked && (
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => setCheckItemNote(item.id, e.target.value)}
                          placeholder="Anmerkung (optional)"
                          className="mt-1.5 w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Prüfergebnis <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'passed', label: 'Bestanden', color: 'green' },
                { value: 'conditional', label: 'Bedingt bestanden', color: 'amber' },
                { value: 'failed', label: 'Nicht bestanden', color: 'red' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('result', value)}
                  className={`py-3 px-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    form.result === value
                      ? color === 'green'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : color === 'amber'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Defects and measures */}
          {(form.result === 'failed' || form.result === 'conditional') && (
            <div className="space-y-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                <AlertCircle size={16} />
                Mängel und Maßnahmen
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Festgestellte Mängel
                </label>
                <textarea
                  value={form.defects}
                  onChange={(e) => set('defects', e.target.value)}
                  rows={2}
                  placeholder="Beschreibung der festgestellten Mängel…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Eingeleitete Maßnahmen
                </label>
                <textarea
                  value={form.measures}
                  onChange={(e) => set('measures', e.target.value)}
                  rows={2}
                  placeholder="Welche Maßnahmen wurden eingeleitet?…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nächste Prüfung <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.nextInspectionDate}
                onChange={(e) => set('nextInspectionDate', e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Unterschrift Prüfer
              </label>
              <input
                type="text"
                value={form.signature}
                onChange={(e) => set('signature', e.target.value)}
                placeholder="Name / Kürzel"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Prüfbemerkungen
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              placeholder="Weitere Bemerkungen zur Prüfung…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setSelectedEquipmentId(null); setActiveView('equipment'); }}
              className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Save size={16} />
              Prüfung speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
