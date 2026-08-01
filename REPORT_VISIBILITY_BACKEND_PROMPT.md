# Dynamic Report Visibility by Module/Section - Backend Implementation

## Technologies
- Node.js + Express.js
- PostgreSQL (pg library with Pool)
- JWT Authentication (Bearer token, middleware already exists)
- Port: 5000, Prefix: /api

---

## IMPORTANT: DO NOT MODIFY EXISTING FUNCTIONALITY

- Do NOT change `report_master` table structure
- Do NOT modify existing report CRUD endpoints
- Do NOT alter report execution, query generation, filters, joins, aggregates, or exports
- Do NOT change existing permissions logic
- Only ADD new tables, endpoints, and extend existing responses where specified

---

## EXISTING TABLE (Reference Only - DO NOT MODIFY)

```sql
-- Already exists - DO NOT touch
CREATE TABLE report_master (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    description TEXT,
    module VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    main_table VARCHAR(255) NOT NULL,
    columns JSONB DEFAULT '[]',
    -- ... other fields ...
    is_deleted BOOLEAN DEFAULT FALSE
);
```

---

## EXISTING TABLE: department (Reference Only - DO NOT MODIFY)

```sql
-- Already exists in the database
-- Structure:
-- "id"  "d_name"  "created_at"  "disable"
-- This is the department master table used across the application
```

---

## NEW DATABASE TABLES

### 1. Report Section Master

```sql
CREATE TABLE IF NOT EXISTS report_section_master (
    section_id SERIAL PRIMARY KEY,
    section_key VARCHAR(50) UNIQUE NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    disable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Seed Data (INSERT on deployment)

```sql
INSERT INTO report_section_master (section_key, section_name, display_order) VALUES
('DRAW_MANAGEMENT', 'Draw Management', 1),
('PROOF_TESTING', 'Proof Testing', 2),
('QUALITY', 'Quality', 3),
('QUALITY_ASSURANCE', 'Quality Assurance', 4),
('FINISH_GOODS', 'Finish Goods', 5),
('DISPATCH', 'Dispatch', 6),
('DYNAMIC_REPORTS', 'Dynamic Reports', 7)
ON CONFLICT (section_key) DO NOTHING;
```

**Note:** `section_key` matches sidebar menu keys in the frontend.
The sections correspond to the sidebar structure:
- `DRAW_MANAGEMENT` → sidebar key `draw` → path `/drawmange/reports`
- `PROOF_TESTING` → sidebar key `proof` → path `/prooftesting/ptreport`
- `QUALITY` → sidebar key `quality` → path `/quality/reports`
- `QUALITY_ASSURANCE` → sidebar key `qa`
- `FINISH_GOODS` → sidebar key `finishgoods`
- `DISPATCH` → sidebar key `dispatch`  
- `DYNAMIC_REPORTS` → sidebar key `dynamicreports` → path `/dynamicreports`

---

### 2. Report Section Mapping

```sql
CREATE TABLE IF NOT EXISTS report_section_mapping (
    mapping_id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES report_master(id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES report_section_master(section_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, section_id)
);

-- Index for fast lookups by section
CREATE INDEX IF NOT EXISTS idx_report_section_mapping_section 
    ON report_section_mapping(section_id);

-- Index for fast lookups by report
CREATE INDEX IF NOT EXISTS idx_report_section_mapping_report 
    ON report_section_mapping(report_id);
```

---

### 3. Migration: Map ALL existing reports to DYNAMIC_REPORTS section

```sql
-- Run this ONCE after creating the tables above
-- This ensures all existing reports continue appearing in Dynamic Reports
INSERT INTO report_section_mapping (report_id, section_id)
SELECT rm.id, rsm.section_id
FROM report_master rm
CROSS JOIN report_section_master rsm
WHERE rsm.section_key = 'DYNAMIC_REPORTS'
  AND rm.is_deleted = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM report_section_mapping m 
      WHERE m.report_id = rm.id AND m.section_id = rsm.section_id
  );
```

---

## NEW ROUTE FILE: routes/reportSections.routes.js

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── GET all active sections ────────────────────────────────────────────────
// Used by Admin UI to populate the "Display In" multi-select
router.get('/sections', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT section_id, section_key, section_name, display_order 
             FROM report_section_master 
             WHERE disable = FALSE 
             ORDER BY display_order ASC`
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── GET sections mapped to a specific report ───────────────────────────────
// Used when editing a report to pre-select assigned sections
router.get('/reports/:reportId/sections', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT rsm.section_id, rsm.section_key, rsm.section_name
             FROM report_section_mapping m
             JOIN report_section_master rsm ON rsm.section_id = m.section_id
             WHERE m.report_id = $1
             ORDER BY rsm.display_order ASC`,
            [req.params.reportId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── SAVE/UPDATE section mappings for a report ──────────────────────────────
// Called when creating or editing a report
// Body: { section_ids: [1, 2, 7] }
router.put('/reports/:reportId/sections', async (req, res) => {
    const client = await pool.connect();
    try {
        const { section_ids } = req.body;
        const reportId = req.params.reportId;

        // Validate: at least one section required
        if (!Array.isArray(section_ids) || section_ids.length === 0) {
            return res.status(400).json({ message: 'At least one section must be selected' });
        }

        // Validate: report exists
        const reportCheck = await client.query(
            'SELECT id FROM report_master WHERE id = $1 AND is_deleted = FALSE',
            [reportId]
        );
        if (reportCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Validate: all section_ids exist
        const sectionCheck = await client.query(
            `SELECT section_id FROM report_section_master 
             WHERE section_id = ANY($1) AND disable = FALSE`,
            [section_ids]
        );
        if (sectionCheck.rows.length !== section_ids.length) {
            return res.status(400).json({ message: 'One or more invalid section IDs' });
        }

        await client.query('BEGIN');

        // Delete existing mappings for this report
        await client.query(
            'DELETE FROM report_section_mapping WHERE report_id = $1',
            [reportId]
        );

        // Insert new mappings
        if (section_ids.length > 0) {
            const values = section_ids.map((sid, i) => 
                `($1, $${i + 2})`
            ).join(', ');
            await client.query(
                `INSERT INTO report_section_mapping (report_id, section_id) VALUES ${values}`,
                [reportId, ...section_ids]
            );
        }

        await client.query('COMMIT');

        // Return updated mappings
        const updated = await pool.query(
            `SELECT rsm.section_id, rsm.section_key, rsm.section_name
             FROM report_section_mapping m
             JOIN report_section_master rsm ON rsm.section_id = m.section_id
             WHERE m.report_id = $1
             ORDER BY rsm.display_order ASC`,
            [reportId]
        );

        res.json({ 
            message: 'Sections updated successfully', 
            sections: updated.rows 
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
```

---

## MODIFY EXISTING ROUTE: routes/dynamicReports.routes.js

### Add section-based filtering to the user reports endpoint

**IMPORTANT:** Keep the existing `GET /` endpoint working exactly as before when no `section` query param is provided.

```javascript
// REPLACE the existing GET / endpoint with this:

// GET user-accessible reports (with optional section filter)
router.get('/', async (req, res) => {
    try {
        const { section } = req.query;

        let query;
        let params = [];

        if (section) {
            // Filter by section - return only reports mapped to this section
            query = `
                SELECT rm.* 
                FROM report_master rm
                INNER JOIN report_section_mapping rsm_map ON rsm_map.report_id = rm.id
                INNER JOIN report_section_master rsm ON rsm.section_id = rsm_map.section_id
                WHERE rm.is_deleted = FALSE 
                  AND rm.status = 'active'
                  AND rsm.section_key = $1
                  AND rsm.disable = FALSE
                ORDER BY rm.report_name ASC
            `;
            params = [section];
        } else {
            // No filter - return all active reports (existing behavior)
            query = `
                SELECT * FROM report_master 
                WHERE is_deleted = FALSE AND status = 'active' 
                ORDER BY report_name ASC
            `;
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

---

## MODIFY EXISTING ROUTE: routes/reportBuilder.routes.js

### Extend GET /reports (admin) to include section mappings

```javascript
// REPLACE the existing GET /reports endpoint:

// GET all reports (admin) - now includes section mappings
router.get('/reports', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_master WHERE is_deleted = FALSE ORDER BY created_at DESC'
        );

        // Fetch section mappings for all reports in one query
        const reportIds = result.rows.map(r => r.id);
        let sectionMap = {};

        if (reportIds.length > 0) {
            const sectionsResult = await pool.query(
                `SELECT m.report_id, rsm.section_id, rsm.section_key, rsm.section_name
                 FROM report_section_mapping m
                 JOIN report_section_master rsm ON rsm.section_id = m.section_id
                 WHERE m.report_id = ANY($1)
                 ORDER BY rsm.display_order ASC`,
                [reportIds]
            );

            // Group by report_id
            sectionsResult.rows.forEach(row => {
                if (!sectionMap[row.report_id]) sectionMap[row.report_id] = [];
                sectionMap[row.report_id].push({
                    section_id: row.section_id,
                    section_key: row.section_key,
                    section_name: row.section_name
                });
            });
        }

        // Attach sections to each report
        const reports = result.rows.map(r => ({
            ...r,
            sections: sectionMap[r.id] || []
        }));

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

### Extend GET /reports/:id to include section mappings

```javascript
// REPLACE the existing GET /reports/:id endpoint:

// GET single report by ID - includes section mappings
router.get('/reports/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_master WHERE id = $1 AND is_deleted = FALSE',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });

        // Fetch section mappings for this report
        const sectionsResult = await pool.query(
            `SELECT rsm.section_id, rsm.section_key, rsm.section_name
             FROM report_section_mapping m
             JOIN report_section_master rsm ON rsm.section_id = m.section_id
             WHERE m.report_id = $1
             ORDER BY rsm.display_order ASC`,
            [req.params.id]
        );

        const report = {
            ...result.rows[0],
            sections: sectionsResult.rows
        };

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

---

### Extend POST /reports (create) to auto-save section mappings

```javascript
// REPLACE the existing POST /reports endpoint:

// CREATE report - now also saves section mappings
router.post('/reports', async (req, res) => {
    const client = await pool.connect();
    try {
        const { report_name, description, module, status, main_table,
            columns, column_display_names, column_order, joins,
            expressions, filters, sorting, group_by, aggregates, having, 
            permissions, section_ids } = req.body;

        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO report_master 
            (report_name, description, module, status, main_table,
             columns, column_display_names, column_order, joins, expressions,
             filters, sorting, group_by, aggregates, having, permissions, created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            RETURNING *
        `, [
            report_name, description, module, status || 'active', main_table,
            JSON.stringify(columns || []),
            JSON.stringify(column_display_names || {}),
            JSON.stringify(column_order || []),
            JSON.stringify(joins || []),
            JSON.stringify(expressions || []),
            JSON.stringify(filters || []),
            JSON.stringify(sorting || []),
            JSON.stringify(group_by || []),
            JSON.stringify(aggregates || []),
            JSON.stringify(having || []),
            JSON.stringify(permissions || []),
            req.user?.id || null
        ]);

        const newReport = result.rows[0];

        // Save section mappings
        // If section_ids provided, use them; otherwise default to DYNAMIC_REPORTS
        let sectionsToMap = section_ids;
        if (!Array.isArray(sectionsToMap) || sectionsToMap.length === 0) {
            // Default: map to DYNAMIC_REPORTS section
            const defaultSection = await client.query(
                `SELECT section_id FROM report_section_master WHERE section_key = 'DYNAMIC_REPORTS'`
            );
            if (defaultSection.rows.length > 0) {
                sectionsToMap = [defaultSection.rows[0].section_id];
            }
        }

        if (Array.isArray(sectionsToMap) && sectionsToMap.length > 0) {
            const values = sectionsToMap.map((sid, i) => 
                `($1, $${i + 2})`
            ).join(', ');
            await client.query(
                `INSERT INTO report_section_mapping (report_id, section_id) VALUES ${values}
                 ON CONFLICT (report_id, section_id) DO NOTHING`,
                [newReport.id, ...sectionsToMap]
            );
        }

        await client.query('COMMIT');

        // Fetch sections for response
        const sectionsResult = await pool.query(
            `SELECT rsm.section_id, rsm.section_key, rsm.section_name
             FROM report_section_mapping m
             JOIN report_section_master rsm ON rsm.section_id = m.section_id
             WHERE m.report_id = $1`,
            [newReport.id]
        );

        res.json({ ...newReport, sections: sectionsResult.rows });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
});
```

---

### Extend PUT /reports/:id (update) to also update section mappings

```javascript
// REPLACE the existing PUT /reports/:id endpoint:

// UPDATE report - now also updates section mappings
router.put('/reports/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { report_name, description, module, status, main_table,
            columns, column_display_names, column_order, joins,
            expressions, filters, sorting, group_by, aggregates, having, 
            permissions, section_ids } = req.body;

        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE report_master SET
                report_name=$1, description=$2, module=$3, status=$4, main_table=$5,
                columns=$6, column_display_names=$7, column_order=$8, joins=$9,
                expressions=$10, filters=$11, sorting=$12, group_by=$13, aggregates=$14,
                having=$15, permissions=$16, updated_by=$17, updated_at=NOW()
            WHERE id=$18 AND is_deleted=FALSE
            RETURNING *
        `, [
            report_name, description, module, status, main_table,
            JSON.stringify(columns || []),
            JSON.stringify(column_display_names || {}),
            JSON.stringify(column_order || []),
            JSON.stringify(joins || []),
            JSON.stringify(expressions || []),
            JSON.stringify(filters || []),
            JSON.stringify(sorting || []),
            JSON.stringify(group_by || []),
            JSON.stringify(aggregates || []),
            JSON.stringify(having || []),
            JSON.stringify(permissions || []),
            req.user?.id || null,
            req.params.id
        ]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Not found' });
        }

        // Update section mappings if provided
        if (Array.isArray(section_ids)) {
            if (section_ids.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'At least one section must be selected' });
            }

            // Delete existing mappings
            await client.query(
                'DELETE FROM report_section_mapping WHERE report_id = $1',
                [req.params.id]
            );

            // Insert new mappings
            const values = section_ids.map((sid, i) => 
                `($1, $${i + 2})`
            ).join(', ');
            await client.query(
                `INSERT INTO report_section_mapping (report_id, section_id) VALUES ${values}
                 ON CONFLICT (report_id, section_id) DO NOTHING`,
                [req.params.id, ...section_ids]
            );
        }

        await client.query('COMMIT');

        // Fetch updated sections
        const sectionsResult = await pool.query(
            `SELECT rsm.section_id, rsm.section_key, rsm.section_name
             FROM report_section_mapping m
             JOIN report_section_master rsm ON rsm.section_id = m.section_id
             WHERE m.report_id = $1`,
            [req.params.id]
        );

        res.json({ ...result.rows[0], sections: sectionsResult.rows });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
});
```

---

### Extend DELETE /reports/:id to clean up mappings (already handled by ON DELETE CASCADE)

The `ON DELETE CASCADE` on `report_section_mapping.report_id` handles this automatically.
However since we use soft-delete (`is_deleted = TRUE`), the mappings remain in the table.
This is fine because the query always filters `rm.is_deleted = FALSE`.

No change needed for the DELETE endpoint.

---

### Extend POST /reports/:id/duplicate to also duplicate section mappings

```javascript
// REPLACE the existing POST /reports/:id/duplicate endpoint:

// DUPLICATE report - also duplicates section mappings
router.post('/reports/:id/duplicate', async (req, res) => {
    const client = await pool.connect();
    try {
        const orig = await client.query('SELECT * FROM report_master WHERE id=$1', [req.params.id]);
        if (orig.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        const r = orig.rows[0];

        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO report_master 
            (report_name, description, module, status, main_table,
             columns, column_display_names, column_order, joins, expressions,
             filters, sorting, group_by, aggregates, having, permissions, created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            RETURNING *
        `, [
            r.report_name + ' (Copy)', r.description, r.module, 'inactive', r.main_table,
            JSON.stringify(r.columns), JSON.stringify(r.column_display_names),
            JSON.stringify(r.column_order), JSON.stringify(r.joins),
            JSON.stringify(r.expressions), JSON.stringify(r.filters),
            JSON.stringify(r.sorting), JSON.stringify(r.group_by),
            JSON.stringify(r.aggregates), JSON.stringify(r.having),
            JSON.stringify(r.permissions), req.user?.id || null
        ]);

        const newReport = result.rows[0];

        // Duplicate section mappings from original report
        await client.query(
            `INSERT INTO report_section_mapping (report_id, section_id)
             SELECT $1, section_id FROM report_section_mapping WHERE report_id = $2
             ON CONFLICT (report_id, section_id) DO NOTHING`,
            [newReport.id, req.params.id]
        );

        await client.query('COMMIT');

        res.json(newReport);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
});
```

---

## ROUTE REGISTRATION (server.js additions)

```javascript
const reportSectionsRoutes = require('./routes/reportSections.routes');

// Add after existing report routes - same auth middleware
app.use('/api/report-builder', authMiddleware, reportSectionsRoutes);
```

This gives us:
- `GET /api/report-builder/sections` — list all active sections
- `GET /api/report-builder/reports/:reportId/sections` — get sections for a report
- `PUT /api/report-builder/reports/:reportId/sections` — update sections for a report

---

## COMPLETE API SUMMARY

### New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/report-builder/sections` | Get all active sections for multi-select dropdown |
| GET | `/api/report-builder/reports/:reportId/sections` | Get sections assigned to a report |
| PUT | `/api/report-builder/reports/:reportId/sections` | Update section mappings for a report |

### Modified Endpoints (backward compatible)

| Method | Endpoint | Change |
|--------|----------|--------|
| GET | `/api/report-builder/reports` | Now includes `sections[]` array in each report object |
| GET | `/api/report-builder/reports/:id` | Now includes `sections[]` array in report object |
| POST | `/api/report-builder/reports` | Accepts optional `section_ids[]` in body; defaults to DYNAMIC_REPORTS |
| PUT | `/api/report-builder/reports/:id` | Accepts optional `section_ids[]` in body to update mappings |
| POST | `/api/report-builder/reports/:id/duplicate` | Also duplicates section mappings |
| GET | `/api/dynamic-reports` | Accepts optional `?section=SECTION_KEY` query param for filtering |

---

## API RESPONSE FORMATS

### GET /api/report-builder/sections

```json
[
    { "section_id": 1, "section_key": "DRAW_MANAGEMENT", "section_name": "Draw Management", "display_order": 1 },
    { "section_id": 2, "section_key": "PROOF_TESTING", "section_name": "Proof Testing", "display_order": 2 },
    { "section_id": 3, "section_key": "QUALITY", "section_name": "Quality", "display_order": 3 },
    { "section_id": 4, "section_key": "QUALITY_ASSURANCE", "section_name": "Quality Assurance", "display_order": 4 },
    { "section_id": 5, "section_key": "FINISH_GOODS", "section_name": "Finish Goods", "display_order": 5 },
    { "section_id": 6, "section_key": "DISPATCH", "section_name": "Dispatch", "display_order": 6 },
    { "section_id": 7, "section_key": "DYNAMIC_REPORTS", "section_name": "Dynamic Reports", "display_order": 7 }
]
```

### GET /api/report-builder/reports (admin list with sections)

```json
[
    {
        "id": 1,
        "report_name": "Daily Draw Report",
        "description": "...",
        "module": "Draw Management",
        "status": "active",
        "main_table": "draw_entry",
        "columns": [...],
        "column_display_names": {...},
        "column_order": [...],
        "joins": [...],
        "expressions": [...],
        "filters": [...],
        "sorting": [...],
        "group_by": [...],
        "aggregates": [...],
        "having": [...],
        "permissions": [...],
        "created_at": "2025-01-15T10:00:00.000Z",
        "sections": [
            { "section_id": 1, "section_key": "DRAW_MANAGEMENT", "section_name": "Draw Management" },
            { "section_id": 7, "section_key": "DYNAMIC_REPORTS", "section_name": "Dynamic Reports" }
        ]
    }
]
```

### POST /api/report-builder/reports (create with sections)

Request body includes new optional field:
```json
{
    "report_name": "Production Summary",
    "description": "...",
    "module": "Draw Management",
    "status": "active",
    "main_table": "draw_entry",
    "columns": [...],
    "section_ids": [1, 7]
}
```

If `section_ids` is not provided or empty, automatically maps to DYNAMIC_REPORTS.

### PUT /api/report-builder/reports/:id (update with sections)

Request body includes new optional field:
```json
{
    "report_name": "Production Summary Updated",
    "section_ids": [1, 3, 7]
}
```

### GET /api/dynamic-reports?section=DRAW_MANAGEMENT

Returns only reports mapped to the specified section (same format as before, just filtered):
```json
[
    {
        "id": 1,
        "report_name": "Daily Draw Report",
        "module": "Draw Management",
        "status": "active",
        "main_table": "draw_entry",
        ...all other fields...
    }
]
```

---

## SECTION KEY TO FRONTEND MAPPING

The `section_key` values map to the frontend sidebar and route structure:

| section_key | Sidebar Menu Key | Report Route Path | API Call |
|-------------|-----------------|-------------------|----------|
| DRAW_MANAGEMENT | draw | /drawmange/reports | GET /api/dynamic-reports?section=DRAW_MANAGEMENT |
| PROOF_TESTING | proof | /prooftesting/ptreport | GET /api/dynamic-reports?section=PROOF_TESTING |
| QUALITY | quality | /quality/reports | GET /api/dynamic-reports?section=QUALITY |
| QUALITY_ASSURANCE | qa | (new or existing) | GET /api/dynamic-reports?section=QUALITY_ASSURANCE |
| FINISH_GOODS | finishgoods | (new or existing) | GET /api/dynamic-reports?section=FINISH_GOODS |
| DISPATCH | dispatch | (new or existing) | GET /api/dynamic-reports?section=DISPATCH |
| DYNAMIC_REPORTS | dynamicreports | /dynamicreports | GET /api/dynamic-reports?section=DYNAMIC_REPORTS |

---

## VALIDATION RULES

1. **At least one section must be selected** when creating or updating report sections
2. **Prevent duplicate mappings** — UNIQUE constraint on (report_id, section_id) + ON CONFLICT DO NOTHING
3. **Deleting a report removes mappings** — ON DELETE CASCADE handles hard deletes; soft deletes keep mappings but queries filter `is_deleted = FALSE`
4. **Disabling a report hides it from every section** — `status = 'active'` filter in the dynamic-reports endpoint
5. **Disabling a section hides it from the UI** — `disable = FALSE` filter in the sections endpoint
6. **Section mappings use foreign keys** — Both `report_id` and `section_id` are FK-constrained

---

## CRITICAL RULES

1. ALL existing endpoints must continue working without breaking changes
2. The `section_ids` field in POST/PUT is OPTIONAL — if not provided, defaults to DYNAMIC_REPORTS
3. The `?section=` query param in GET /api/dynamic-reports is OPTIONAL — if not provided, returns all active reports (existing behavior)
4. NEVER remove the `module` field from `report_master` — it serves a different purpose (report categorization label)
5. The `sections` array returned in reports is purely for the admin UI to show/edit section assignments
6. All queries joining to report_section_mapping must also check `rm.is_deleted = FALSE` and `rm.status = 'active'` for user-facing endpoints
7. Use transactions (BEGIN/COMMIT/ROLLBACK) when doing DELETE + INSERT for section mappings
8. The migration script to map existing reports to DYNAMIC_REPORTS must be run ONCE after table creation

---

## DEPLOYMENT STEPS (in order)

1. Create `report_section_master` table
2. Insert seed data into `report_section_master`
3. Create `report_section_mapping` table with indexes
4. Run migration to map all existing reports to DYNAMIC_REPORTS
5. Deploy updated `reportBuilder.routes.js` (extended GET, POST, PUT, DUPLICATE)
6. Deploy new `reportSections.routes.js`
7. Deploy updated `dynamicReports.routes.js` (section filter support)
8. Register new route in `server.js`
9. Verify: All existing reports still appear under `/api/dynamic-reports` with no section filter
10. Verify: All existing reports appear under `/api/dynamic-reports?section=DYNAMIC_REPORTS`

---

## COMPLETE SQL MIGRATION SCRIPT

```sql
-- ============================================================
-- MIGRATION: Dynamic Report Visibility by Section
-- Run this script in order on your PostgreSQL database
-- ============================================================

-- 1. Create report_section_master
CREATE TABLE IF NOT EXISTS report_section_master (
    section_id SERIAL PRIMARY KEY,
    section_key VARCHAR(50) UNIQUE NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    disable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed data
INSERT INTO report_section_master (section_key, section_name, display_order) VALUES
('DRAW_MANAGEMENT', 'Draw Management', 1),
('PROOF_TESTING', 'Proof Testing', 2),
('QUALITY', 'Quality', 3),
('QUALITY_ASSURANCE', 'Quality Assurance', 4),
('FINISH_GOODS', 'Finish Goods', 5),
('DISPATCH', 'Dispatch', 6),
('DYNAMIC_REPORTS', 'Dynamic Reports', 7)
ON CONFLICT (section_key) DO NOTHING;

-- 3. Create report_section_mapping
CREATE TABLE IF NOT EXISTS report_section_mapping (
    mapping_id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES report_master(id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES report_section_master(section_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, section_id)
);

CREATE INDEX IF NOT EXISTS idx_report_section_mapping_section 
    ON report_section_mapping(section_id);
CREATE INDEX IF NOT EXISTS idx_report_section_mapping_report 
    ON report_section_mapping(report_id);

-- 4. Migrate existing reports to DYNAMIC_REPORTS section
INSERT INTO report_section_mapping (report_id, section_id)
SELECT rm.id, rsm.section_id
FROM report_master rm
CROSS JOIN report_section_master rsm
WHERE rsm.section_key = 'DYNAMIC_REPORTS'
  AND rm.is_deleted = FALSE
  AND NOT EXISTS (
      SELECT 1 FROM report_section_mapping m 
      WHERE m.report_id = rm.id AND m.section_id = rsm.section_id
  );

-- Done! All existing reports now mapped to Dynamic Reports section.
```

---

## TESTING CHECKLIST

- [ ] GET /api/report-builder/sections returns all 7 sections
- [ ] GET /api/dynamic-reports (no param) returns all active reports (unchanged behavior)
- [ ] GET /api/dynamic-reports?section=DYNAMIC_REPORTS returns only mapped reports
- [ ] GET /api/dynamic-reports?section=DRAW_MANAGEMENT returns only draw-mapped reports
- [ ] POST /api/report-builder/reports without section_ids defaults to DYNAMIC_REPORTS
- [ ] POST /api/report-builder/reports with section_ids=[1,7] creates both mappings
- [ ] PUT /api/report-builder/reports/:id with section_ids updates mappings correctly
- [ ] GET /api/report-builder/reports returns reports with sections[] array
- [ ] GET /api/report-builder/reports/:id returns report with sections[] array
- [ ] Duplicate report also duplicates section mappings
- [ ] Deleting report does not break (soft delete keeps mappings, filtered by is_deleted)
- [ ] Existing reports still visible in Dynamic Reports section
- [ ] Invalid section_ids returns 400 error
- [ ] Empty section_ids returns 400 error
