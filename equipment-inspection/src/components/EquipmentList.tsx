import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, ClipboardPlus, Filter } from 'lucide-react';
import { useStore, getEquipmentStatus, getDaysUntilInspection } from '../store/useStore';
import { CATEGORY_ICONS, INTERVAL_LABELS } from '../types';
import StatusBadge from './StatusBadge';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export default function EquipmentList() {
  const equipment = useStore((s) => s.equipment);
  const deleteEquipment = useStore((s) => s.deleteEquipment);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);
  const selectedEquipmentId = useStore((s) => s.selectedEquipmentId);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(equipment.map((e) => e.category)));

  const filtered = equipment.filter((eq) => {
    const status = getEquipmentStatus(eq);
    const matchSearch =
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      eq.location.toLowerCase().includes(search.toLowerCase()) ||
      eq.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || status === filterStatus;
    const matchCategory = filterCategory === 'all' || eq.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleEdit = (id: string) => {
    setSelectedEquipmentId(id);
    setActiveView('equipment-edit');
  };

  const handleNewInspection = (id: string) => {
    setSelectedEquipmentId(id);
    setActiveView('inspection-new');
  };

  const handleDelete = (id: string) => {
    const eq = equipment.find((e) => e.id === id);
    if (confirm(`Gerät "${eq?.name}" wirklich löschen? Alle Prüfungen werden ebenfalls gelöscht.`)) {
      deleteEquipment(id);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Gerät, Seriennummer, Ort suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Status</option>
            <option value="ok">In Ordnung</option>
            <option value="warning">Bald fällig</option>
            <option value="overdue">Überfällig</option>
            <option value="uninspected">Nicht geprüft</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { setSelectedEquipmentId(null); setActiveView('equipment-new'); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          Neues Gerät
        </button>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">{filtered.length} von {equipment.length} Geräten</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Gerät</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Kategorie</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600 hidden lg:table-cell">Ort / Abteilung</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600 hidden lg:table-cell">Intervall</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Nächste Prüfung</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3.5 font-semibold text-slate-600 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Keine Geräte gefunden.
                  </td>
                </tr>
              ) : (
                filtered.map((eq) => {
                  const status = getEquipmentStatus(eq);
                  const days = getDaysUntilInspection(eq);
                  const isSelected = eq.id === selectedEquipmentId;
                  return (
                    <tr
                      key={eq.id}
                      className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{CATEGORY_ICONS[eq.category]}</span>
                          <div>
                            <p className="font-semibold text-slate-800">{eq.name}</p>
                            <p className="text-xs text-slate-400">{eq.serialNumber || '–'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-600">{eq.category}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-slate-600">
                        <span>{eq.location}</span>
                        {eq.department && <span className="text-slate-400"> · {eq.department}</span>}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-slate-600">
                        {INTERVAL_LABELS[eq.inspectionInterval]}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-slate-600">
                        {eq.nextInspectionDate
                          ? format(parseISO(eq.nextInspectionDate), 'd. MMM yyyy', { locale: de })
                          : '–'}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={status} days={days} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleNewInspection(eq.id)}
                            title="Prüfung dokumentieren"
                            className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors"
                          >
                            <ClipboardPlus size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(eq.id)}
                            title="Bearbeiten"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(eq.id)}
                            title="Löschen"
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
