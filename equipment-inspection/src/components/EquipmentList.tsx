import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, ClipboardPlus, SlidersHorizontal } from 'lucide-react';
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

  const handleEdit = (id: string) => { setSelectedEquipmentId(id); setActiveView('equipment-edit'); };
  const handleNewInspection = (id: string) => { setSelectedEquipmentId(id); setActiveView('inspection-new'); };
  const handleDelete = (id: string) => {
    const eq = equipment.find((e) => e.id === id);
    if (confirm(`Gerät "${eq?.name}" wirklich löschen? Alle Prüfungen werden ebenfalls gelöscht.`)) {
      deleteEquipment(id);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="relative flex-1 min-w-48"
        >
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Gerät, Seriennummer, Ort…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm px-3 py-2.5 rounded-xl outline-none bg-white cursor-pointer"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
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
            className="text-sm px-3 py-2.5 rounded-xl outline-none bg-white cursor-pointer"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <option value="all">Alle Kategorien</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button
          onClick={() => { setSelectedEquipmentId(null); setActiveView('equipment-new'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 2px 8px rgba(79,70,229,0.3)' }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Neues Gerät
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400 font-medium">{filtered.length} von {equipment.length} Geräten</p>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Gerät', 'Kategorie', 'Ort / Abteilung', 'Intervall', 'Nächste Prüfung', 'Status', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                      i >= 2 && i <= 3 ? 'hidden lg:table-cell' : i === 4 ? 'hidden md:table-cell' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                    Keine Geräte gefunden.
                  </td>
                </tr>
              ) : (
                filtered.map((eq, i) => {
                  const status = getEquipmentStatus(eq);
                  const days = getDaysUntilInspection(eq);
                  return (
                    <tr
                      key={eq.id}
                      className="group"
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ background: '#f1f5f9' }}
                          >
                            {CATEGORY_ICONS[eq.category]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{eq.name}</p>
                            <p className="text-xs text-slate-400">{eq.serialNumber || '–'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-sm">{eq.category}</td>
                      <td className="px-4 py-4 hidden lg:table-cell text-slate-500 text-sm">
                        {eq.location}{eq.department && <span className="text-slate-300"> · {eq.department}</span>}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-slate-500 text-sm">
                        {INTERVAL_LABELS[eq.inspectionInterval]}
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-slate-500 text-sm">
                        {eq.nextInspectionDate
                          ? format(parseISO(eq.nextInspectionDate), 'd. MMM yyyy', { locale: de })
                          : <span className="text-slate-300">–</span>}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={status} days={days} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ActionBtn
                            title="Prüfung dokumentieren"
                            onClick={() => handleNewInspection(eq.id)}
                            hoverStyle="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <ClipboardPlus size={15} />
                          </ActionBtn>
                          <ActionBtn
                            title="Bearbeiten"
                            onClick={() => handleEdit(eq.id)}
                            hoverStyle="hover:bg-slate-100"
                          >
                            <Pencil size={15} />
                          </ActionBtn>
                          <ActionBtn
                            title="Löschen"
                            onClick={() => handleDelete(eq.id)}
                            hoverStyle="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </ActionBtn>
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

function ActionBtn({ children, title, onClick, hoverStyle }: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  hoverStyle: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg text-slate-400 transition-colors ${hoverStyle}`}
    >
      {children}
    </button>
  );
}
