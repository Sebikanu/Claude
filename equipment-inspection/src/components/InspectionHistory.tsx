import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, ClipboardPlus, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORY_ICONS } from '../types';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const RESULT_MAP = {
  passed: { label: 'Bestanden', classes: 'bg-green-100 text-green-800' },
  failed: { label: 'Nicht bestanden', classes: 'bg-red-100 text-red-800' },
  conditional: { label: 'Bedingt bestanden', classes: 'bg-amber-100 text-amber-800' },
};

export default function InspectionHistory() {
  const inspections = useStore((s) => s.inspections);
  const equipment = useStore((s) => s.equipment);
  const deleteInspection = useStore((s) => s.deleteInspection);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);

  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...inspections].sort((a, b) => b.date.localeCompare(a.date));

  const filtered = sorted.filter((ins) => {
    const eq = equipment.find((e) => e.id === ins.equipmentId);
    const term = search.toLowerCase();
    return (
      eq?.name.toLowerCase().includes(term) ||
      ins.inspector.toLowerCase().includes(term) ||
      ins.date.includes(term)
    );
  });

  const handleNewInspection = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setActiveView('inspection-new');
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Gerät, Prüfer, Datum suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-sm text-slate-500">{filtered.length} Prüfung(en)</p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-16 text-center text-slate-400">
          <p className="text-lg mb-1">Keine Prüfungen vorhanden</p>
          <p className="text-sm">Führen Sie eine Prüfung durch, um sie hier zu sehen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ins) => {
            const eq = equipment.find((e) => e.id === ins.equipmentId);
            const isExpanded = expandedId === ins.id;
            const resultCfg = RESULT_MAP[ins.result] ?? { label: ins.result, classes: 'bg-gray-100 text-gray-800' };
            return (
              <div key={ins.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : ins.id)}
                >
                  <span className="text-2xl shrink-0">{eq ? CATEGORY_ICONS[eq.category] : '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{eq?.name ?? 'Unbekannt'}</p>
                    <p className="text-xs text-slate-500">
                      {format(parseISO(ins.date), 'd. MMMM yyyy', { locale: de })} · Prüfer: {ins.inspector}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full hidden sm:inline ${resultCfg.classes}`}>
                    {resultCfg.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(evt) => { evt.stopPropagation(); handleNewInspection(ins.equipmentId); }}
                      title="Neue Prüfung"
                      className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors"
                    >
                      <ClipboardPlus size={15} />
                    </button>
                    <button
                      onClick={(evt) => { evt.stopPropagation(); if (confirm('Prüfung löschen?')) deleteInspection(ins.id); }}
                      title="Löschen"
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-4 bg-slate-50/50">
                    {/* Checklist summary */}
                    {ins.checklist.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                          Prüfliste ({ins.checklist.filter((c) => c.checked).length}/{ins.checklist.length} geprüft)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {ins.checklist.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 text-sm">
                              <span className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs ${item.checked ? 'bg-green-500 text-white' : 'bg-red-100 text-red-500'}`}>
                                {item.checked ? '✓' : '✗'}
                              </span>
                              <span className={item.checked ? 'text-slate-600' : 'text-slate-700 font-medium'}>
                                {item.label}
                                {item.note && <em className="text-slate-400 ml-1">— {item.note}</em>}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {ins.defects && (
                        <Detail label="Mängel" value={ins.defects} />
                      )}
                      {ins.measures && (
                        <Detail label="Maßnahmen" value={ins.measures} />
                      )}
                      {ins.notes && (
                        <Detail label="Bemerkungen" value={ins.notes} />
                      )}
                      <Detail label="Nächste Prüfung" value={format(parseISO(ins.nextInspectionDate), 'd. MMM yyyy', { locale: de })} />
                      {ins.signature && (
                        <Detail label="Unterschrift" value={ins.signature} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-slate-700 mt-0.5">{value}</p>
    </div>
  );
}
