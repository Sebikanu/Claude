import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Helper: map snake_case DB row → camelCase TS object ─────────────────────
function toEquipment(row: Record<string, unknown>) {
  return {
    id:                  row.id,
    name:                row.name,
    category:            row.category,
    serialNumber:        row.serial_number,
    manufacturer:        row.manufacturer,
    location:            row.location,
    department:          row.department,
    inspectionInterval:  row.inspection_interval,
    lastInspectionDate:  row.last_inspection_date ?? null,
    nextInspectionDate:  row.next_inspection_date ?? null,
    notes:               row.notes,
    createdAt:           row.created_at,
  };
}

function toInspection(row: Record<string, unknown>) {
  return {
    id:                  row.id,
    equipmentId:         row.equipment_id,
    date:                row.date,
    inspector:           row.inspector,
    result:              row.result,
    checklist:           typeof row.checklist === 'string'
                           ? JSON.parse(row.checklist)
                           : row.checklist,
    defects:             row.defects,
    measures:            row.measures,
    notes:               row.notes,
    nextInspectionDate:  row.next_inspection_date,
    signature:           row.signature,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// EQUIPMENT routes
// ════════════════════════════════════════════════════════════════════════════

// GET all equipment
app.get('/api/equipment', (_req, res) => {
  const rows = db.prepare('SELECT * FROM equipment ORDER BY created_at ASC').all() as Record<string, unknown>[];
  res.json(rows.map(toEquipment));
});

// GET single equipment
app.get('/api/equipment/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!row) return res.status(404).json({ error: 'Gerät nicht gefunden' });
  res.json(toEquipment(row));
});

// POST create equipment
app.post('/api/equipment', (req, res) => {
  const b = req.body;
  const id = `eq-${Date.now()}`;
  db.prepare(`
    INSERT INTO equipment
      (id, name, category, serial_number, manufacturer, location, department,
       inspection_interval, last_inspection_date, next_inspection_date, notes, created_at)
    VALUES
      (@id, @name, @category, @serial_number, @manufacturer, @location, @department,
       @inspection_interval, @last_inspection_date, @next_inspection_date, @notes, @created_at)
  `).run({
    id,
    name:                 b.name,
    category:             b.category,
    serial_number:        b.serialNumber ?? '',
    manufacturer:         b.manufacturer ?? '',
    location:             b.location,
    department:           b.department ?? '',
    inspection_interval:  b.inspectionInterval,
    last_inspection_date: b.lastInspectionDate ?? null,
    next_inspection_date: b.nextInspectionDate ?? null,
    notes:                b.notes ?? '',
    created_at:           new Date().toISOString().split('T')[0],
  });
  const row = db.prepare('SELECT * FROM equipment WHERE id = ?').get(id) as Record<string, unknown>;
  res.status(201).json(toEquipment(row));
});

// PUT update equipment
app.put('/api/equipment/:id', (req, res) => {
  const b = req.body;
  const existing = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Gerät nicht gefunden' });

  db.prepare(`
    UPDATE equipment SET
      name                 = @name,
      category             = @category,
      serial_number        = @serial_number,
      manufacturer         = @manufacturer,
      location             = @location,
      department           = @department,
      inspection_interval  = @inspection_interval,
      last_inspection_date = @last_inspection_date,
      next_inspection_date = @next_inspection_date,
      notes                = @notes
    WHERE id = @id
  `).run({
    id:                   req.params.id,
    name:                 b.name,
    category:             b.category,
    serial_number:        b.serialNumber ?? '',
    manufacturer:         b.manufacturer ?? '',
    location:             b.location,
    department:           b.department ?? '',
    inspection_interval:  b.inspectionInterval,
    last_inspection_date: b.lastInspectionDate ?? null,
    next_inspection_date: b.nextInspectionDate ?? null,
    notes:                b.notes ?? '',
  });
  const row = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id) as Record<string, unknown>;
  res.json(toEquipment(row));
});

// DELETE equipment (cascades to inspections)
app.delete('/api/equipment/:id', (req, res) => {
  const result = db.prepare('DELETE FROM equipment WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Gerät nicht gefunden' });
  res.json({ success: true });
});

// ════════════════════════════════════════════════════════════════════════════
// INSPECTION routes
// ════════════════════════════════════════════════════════════════════════════

// GET all inspections
app.get('/api/inspections', (_req, res) => {
  const rows = db.prepare('SELECT * FROM inspections ORDER BY date DESC').all() as Record<string, unknown>[];
  res.json(rows.map(toInspection));
});

// GET inspections for one equipment
app.get('/api/equipment/:id/inspections', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM inspections WHERE equipment_id = ? ORDER BY date DESC'
  ).all(req.params.id) as Record<string, unknown>[];
  res.json(rows.map(toInspection));
});

// POST create inspection (also updates equipment dates)
app.post('/api/inspections', (req, res) => {
  const b = req.body;
  const id = `ins-${Date.now()}`;

  const insertInspection = db.transaction(() => {
    db.prepare(`
      INSERT INTO inspections
        (id, equipment_id, date, inspector, result, checklist, defects,
         measures, notes, next_inspection_date, signature)
      VALUES
        (@id, @equipment_id, @date, @inspector, @result, @checklist, @defects,
         @measures, @notes, @next_inspection_date, @signature)
    `).run({
      id,
      equipment_id:        b.equipmentId,
      date:                b.date,
      inspector:           b.inspector,
      result:              b.result,
      checklist:           JSON.stringify(b.checklist ?? []),
      defects:             b.defects ?? '',
      measures:            b.measures ?? '',
      notes:               b.notes ?? '',
      next_inspection_date: b.nextInspectionDate,
      signature:           b.signature ?? '',
    });

    // Keep equipment's last/next inspection date in sync
    db.prepare(`
      UPDATE equipment
      SET last_inspection_date = @last, next_inspection_date = @next
      WHERE id = @id
    `).run({ id: b.equipmentId, last: b.date, next: b.nextInspectionDate });
  });

  insertInspection();

  const row = db.prepare('SELECT * FROM inspections WHERE id = ?').get(id) as Record<string, unknown>;
  res.status(201).json(toInspection(row));
});

// DELETE inspection
app.delete('/api/inspections/:id', (req, res) => {
  const result = db.prepare('DELETE FROM inspections WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Prüfung nicht gefunden' });
  res.json({ success: true });
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM equipment').get() as { count: number };
  res.json({ status: 'ok', equipment: count, timestamp: new Date().toISOString() });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛡️  BetriebsPrüfer API läuft auf http://localhost:${PORT}`);
  console.log(`📁  Datenbank: data/inspection.db`);
  console.log(`🔗  Health:    http://localhost:${PORT}/api/health\n`);
});
