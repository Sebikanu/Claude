import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'inspection.db');

export const db = new Database(DB_PATH);

// Performance & safety settings
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// ── Schema migrations ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS equipment (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    category            TEXT NOT NULL,
    serial_number       TEXT DEFAULT '',
    manufacturer        TEXT DEFAULT '',
    location            TEXT NOT NULL,
    department          TEXT DEFAULT '',
    inspection_interval TEXT NOT NULL,
    last_inspection_date TEXT,
    next_inspection_date TEXT,
    notes               TEXT DEFAULT '',
    created_at          TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inspections (
    id                   TEXT PRIMARY KEY,
    equipment_id         TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    date                 TEXT NOT NULL,
    inspector            TEXT NOT NULL,
    result               TEXT NOT NULL CHECK(result IN ('passed','failed','conditional')),
    checklist            TEXT NOT NULL DEFAULT '[]',
    defects              TEXT DEFAULT '',
    measures             TEXT DEFAULT '',
    notes                TEXT DEFAULT '',
    next_inspection_date TEXT NOT NULL,
    signature            TEXT DEFAULT '',
    created_at           TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_inspections_equipment ON inspections(equipment_id);
  CREATE INDEX IF NOT EXISTS idx_equipment_next_date   ON equipment(next_inspection_date);
`);

// ── Seed demo data on first run ──────────────────────────────────────────────
const { count } = db.prepare('SELECT COUNT(*) as count FROM equipment').get() as { count: number };

if (count === 0) {
  const insertEquipment = db.prepare(`
    INSERT INTO equipment
      (id, name, category, serial_number, manufacturer, location, department,
       inspection_interval, last_inspection_date, next_inspection_date, notes, created_at)
    VALUES
      (@id, @name, @category, @serial_number, @manufacturer, @location, @department,
       @inspection_interval, @last_inspection_date, @next_inspection_date, @notes, @created_at)
  `);

  const seedEquipment = db.transaction(() => {
    insertEquipment.run({
      id: 'eq-1', name: 'Aluleiter 6m', category: 'Leiter',
      serial_number: 'AL-2019-001', manufacturer: 'Zarges',
      location: 'Lager EG', department: 'Produktion',
      inspection_interval: 'annual',
      last_inspection_date: '2025-04-10', next_inspection_date: '2026-04-10',
      notes: 'Mehrzweckleiter, max. 150 kg', created_at: '2024-01-15',
    });
    insertEquipment.run({
      id: 'eq-2', name: 'Feuerlöscher Büro 1', category: 'Feuerlöscher',
      serial_number: 'FL-ABC-2022-047', manufacturer: 'Minimax',
      location: 'Büro 1.OG', department: 'Verwaltung',
      inspection_interval: 'annual',
      last_inspection_date: '2024-11-01', next_inspection_date: '2025-11-01',
      notes: 'ABC-Pulver, 6 kg', created_at: '2024-01-15',
    });
    insertEquipment.run({
      id: 'eq-3', name: 'Bohrmaschine Werkstatt', category: 'Elektrisches Gerät',
      serial_number: 'BM-B24-0032', manufacturer: 'Bosch',
      location: 'Werkstatt', department: 'Instandhaltung',
      inspection_interval: 'annual',
      last_inspection_date: '2024-03-15', next_inspection_date: '2025-03-15',
      notes: 'SDS-Plus, 850W', created_at: '2024-01-15',
    });
    insertEquipment.run({
      id: 'eq-4', name: 'Hubwagen HW-01', category: 'Hebezeug',
      serial_number: 'HW-001-2020', manufacturer: 'Still',
      location: 'Lager EG', department: 'Logistik',
      inspection_interval: 'annual',
      last_inspection_date: '2024-12-01', next_inspection_date: '2025-12-01',
      notes: 'Tragfähigkeit 2500 kg, elektrisch', created_at: '2024-01-15',
    });
    insertEquipment.run({
      id: 'eq-5', name: 'Kompressor K200', category: 'Druckbehälter',
      serial_number: 'KP-200-2018-09', manufacturer: 'Atlas Copco',
      location: 'Maschinenraum', department: 'Produktion',
      inspection_interval: 'biennial',
      last_inspection_date: '2023-06-01', next_inspection_date: '2025-06-01',
      notes: 'Betriebsdruck max. 10 bar', created_at: '2024-01-15',
    });
    insertEquipment.run({
      id: 'eq-6', name: 'Transporter VW Crafter', category: 'Fahrzeug',
      serial_number: 'WV1ZZZ2CZ12345678', manufacturer: 'Volkswagen',
      location: 'Außenparkplatz', department: 'Logistik',
      inspection_interval: 'annual',
      last_inspection_date: '2025-01-20', next_inspection_date: '2026-01-20',
      notes: 'Kennzeichen: MU-AB 1234, TÜV 01/2026', created_at: '2024-01-15',
    });
    insertEquipment.run({
      id: 'eq-7', name: 'Stehleiter 3m', category: 'Leiter',
      serial_number: 'SL-3M-2021-003', manufacturer: 'Günzburger',
      location: 'Regal A3', department: 'Produktion',
      inspection_interval: 'annual',
      last_inspection_date: null, next_inspection_date: null,
      notes: 'Noch nie geprüft', created_at: '2024-01-15',
    });
  });

  seedEquipment();

  // Seed one demo inspection
  db.prepare(`
    INSERT INTO inspections
      (id, equipment_id, date, inspector, result, checklist, defects, measures,
       notes, next_inspection_date, signature)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'ins-1', 'eq-1', '2025-04-10', 'Max Mustermann', 'passed',
    JSON.stringify([
      { id: 'c1', label: 'Holme und Sprossen auf Beschädigungen prüfen', checked: true, note: '' },
      { id: 'c2', label: 'Verbindungsstellen auf festen Sitz prüfen', checked: true, note: '' },
      { id: 'c3', label: 'Antirutscheinrichtungen vorhanden und in Ordnung', checked: true, note: '' },
      { id: 'c4', label: 'Beschriftung/Kennzeichnung lesbar', checked: true, note: '' },
      { id: 'c5', label: 'Keine Risse, Verformungen oder Korrosion', checked: true, note: '' },
      { id: 'c6', label: 'Sicherungseinrichtungen funktionsfähig', checked: true, note: '' },
      { id: 'c7', label: 'Leiternfüße in Ordnung', checked: true, note: '' },
    ]),
    '', '', 'Kein Mangel festgestellt.', '2026-04-10', 'M. Mustermann'
  );

  console.log('✅ Demo-Daten wurden in die Datenbank eingefügt.');
}

export default db;
