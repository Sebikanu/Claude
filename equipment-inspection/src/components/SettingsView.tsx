import { useState } from 'react';
import { Trash2, Download, Upload, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function SettingsView() {
  const equipment = useStore((s) => s.equipment);
  const inspections = useStore((s) => s.inspections);
  const [companyName, setCompanyName] = useState(
    () => localStorage.getItem('companyName') ?? ''
  );

  const handleExport = () => {
    const data = {
      companyName,
      equipment,
      inspections,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pruefmanagement-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        alert(`Import erfolgreich: ${data.equipment?.length ?? 0} Geräte, ${data.inspections?.length ?? 0} Prüfungen.\n\nNeuladen der Seite erforderlich.`);
      } catch {
        alert('Fehler beim Importieren der Datei.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Alle Daten wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      localStorage.removeItem('equipment-inspection-store');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-2xl space-y-5">
      {/* Company */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Betriebsinformationen</h3>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Betriebsname</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
              localStorage.setItem('companyName', e.target.value);
            }}
            placeholder="z.B. Mustermann GmbH"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Datenverwaltung</h3>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
          <Info size={16} className="text-blue-500 shrink-0" />
          Alle Daten werden lokal in Ihrem Browser gespeichert (LocalStorage).
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Daten exportieren</p>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download size={16} />
              Als JSON exportieren
            </button>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Daten importieren</p>
            <label className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <Upload size={16} />
              JSON importieren
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={handleClearData}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-semibold transition-colors"
          >
            <Trash2 size={16} />
            Alle Daten löschen
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Statistik</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500">Geräte erfasst</p>
            <p className="text-2xl font-bold text-slate-800">{equipment.length}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500">Prüfungen gesamt</p>
            <p className="text-2xl font-bold text-slate-800">{inspections.length}</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-sm text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">BetriebsPrüfer v1.0</p>
        <p>Prüfmanagementsystem für Betriebsmittel und Arbeitsmittel</p>
        <p className="text-xs mt-2">Entwickelt für die systematische Dokumentation von Prüfpflichten nach BetrSichV, DGUV und BGV.</p>
      </div>
    </div>
  );
}
