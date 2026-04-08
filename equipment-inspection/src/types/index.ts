export type EquipmentCategory =
  | 'Leiter'
  | 'Feuerlöscher'
  | 'Elektrisches Gerät'
  | 'Fahrzeug'
  | 'Maschine'
  | 'Hebezeug'
  | 'Druckbehälter'
  | 'Arbeitsmittel'
  | 'Sonstiges';

export type InspectionInterval =
  | 'monthly'      // Monatlich
  | 'quarterly'    // Vierteljährlich
  | 'semi-annual'  // Halbjährlich
  | 'annual'       // Jährlich
  | 'biennial';    // Zweijährlich

export type InspectionResult = 'passed' | 'failed' | 'conditional';

export type EquipmentStatus = 'ok' | 'warning' | 'overdue' | 'uninspected';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  serialNumber: string;
  manufacturer: string;
  location: string;
  department: string;
  inspectionInterval: InspectionInterval;
  lastInspectionDate: string | null; // ISO date string
  nextInspectionDate: string | null;
  notes: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  note: string;
}

export interface Inspection {
  id: string;
  equipmentId: string;
  date: string; // ISO date string
  inspector: string;
  result: InspectionResult;
  checklist: ChecklistItem[];
  defects: string;
  measures: string;
  notes: string;
  nextInspectionDate: string;
  signature: string;
}

export interface Reminder {
  id: string;
  equipmentId: string;
  daysBeforeDue: number;
  notifyEmail: boolean;
  notifyBrowser: boolean;
  email: string;
}

export const INTERVAL_LABELS: Record<InspectionInterval, string> = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  'semi-annual': 'Halbjährlich',
  annual: 'Jährlich',
  biennial: 'Zweijährlich',
};

export const INTERVAL_DAYS: Record<InspectionInterval, number> = {
  monthly: 30,
  quarterly: 90,
  'semi-annual': 180,
  annual: 365,
  biennial: 730,
};

export const CATEGORY_ICONS: Record<EquipmentCategory, string> = {
  Leiter: '🪜',
  Feuerlöscher: '🧯',
  'Elektrisches Gerät': '⚡',
  Fahrzeug: '🚗',
  Maschine: '⚙️',
  Hebezeug: '🏗️',
  Druckbehälter: '🔧',
  Arbeitsmittel: '🔨',
  Sonstiges: '📦',
};

export const CHECKLIST_TEMPLATES: Record<EquipmentCategory, string[]> = {
  Leiter: [
    'Holme und Sprossen auf Beschädigungen prüfen',
    'Verbindungsstellen auf festen Sitz prüfen',
    'Antirutscheinrichtungen vorhanden und in Ordnung',
    'Beschriftung/Kennzeichnung lesbar',
    'Keine Risse, Verformungen oder Korrosion',
    'Sicherungseinrichtungen funktionsfähig (bei Stehleitern)',
    'Leiternfüße in Ordnung',
  ],
  Feuerlöscher: [
    'Füllgewicht/Druck vorhanden (Manometer grün)',
    'Plombe/Sicherung unversehrt',
    'Außenhülle unbeschädigt',
    'Düse/Schlauch frei und unbeschädigt',
    'Kennzeichnung lesbar',
    'Prüfplakette aktuell',
    'Wandhalterung/Aufstellort korrekt',
  ],
  'Elektrisches Gerät': [
    'Gehäuse unbeschädigt',
    'Kabel und Stecker in Ordnung',
    'Schutzleiter vorhanden und geprüft',
    'Isolationswiderstand geprüft',
    'Schalter und Sicherungen funktionsfähig',
    'Typenschild vorhanden und lesbar',
    'Keine sichtbaren Schäden an Bauteilen',
  ],
  Fahrzeug: [
    'Bremsen geprüft',
    'Beleuchtung vollständig funktionsfähig',
    'Reifen auf Profil und Druck geprüft',
    'Flüssigkeitsstand (Öl, Wasser, etc.) geprüft',
    'Sicherheitsgurte in Ordnung',
    'Warneinrichtungen funktionsfähig',
    'Hauptuntersuchung/TÜV aktuell',
  ],
  Maschine: [
    'Schutzeinrichtungen vollständig vorhanden',
    'NOT-AUS funktionsfähig',
    'Schmierung/Wartungszustand geprüft',
    'Elektrische Anschlüsse in Ordnung',
    'Lärm- und Vibrationsdämpfung in Ordnung',
    'Betriebsanleitung vorhanden',
    'Kennzeichnung/Beschriftung lesbar',
  ],
  Hebezeug: [
    'Tragmittel (Seile, Ketten, Gurte) geprüft',
    'Lasthaken in Ordnung (Sicherung vorhanden)',
    'Bremsen und Sicherheitseinrichtungen geprüft',
    'Tragfähigkeitsangabe vorhanden',
    'Elektrische Anlage in Ordnung',
    'Endschalter funktionsfähig',
    'Letzter Sachkundigennachweis vorhanden',
  ],
  Druckbehälter: [
    'Behälter auf Korrosion und Undichtigkeiten geprüft',
    'Sicherheitsventil geprüft',
    'Manometer kalibriert und in Ordnung',
    'Armaturen funktionsfähig',
    'Prüfbescheinigung vorhanden und aktuell',
    'Beschriftung/Kennzeichnung lesbar',
    'Aufstellbedingungen eingehalten',
  ],
  Arbeitsmittel: [
    'Sichtprüfung auf Beschädigungen',
    'Funktion geprüft',
    'Kennzeichnung vorhanden',
    'Sicherheitsrelevante Teile in Ordnung',
    'Reinigungszustand akzeptabel',
  ],
  Sonstiges: [
    'Sichtprüfung durchgeführt',
    'Funktion geprüft',
    'Kennzeichnung vorhanden',
    'Keine sichtbaren Mängel',
  ],
};
