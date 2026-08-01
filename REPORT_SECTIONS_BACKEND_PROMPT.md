# Dynamic Report Visibility by Module/Section - Backend Implementation

## Technologies
- Node.js + Express.js
- PostgreSQL (pg library with Pool)
- JWT Authentication (Bearer token, middleware already exists)
- Port: 5000, Prefix: /api

---

## IMPORTANT: DO NOT MODIFY EXISTING CODE

- Do NOT change `report_master` table structure
- Do NOT change any existing report builder routes or logic
- Do NOT modify `report_execution_log`
- Do NOT modify existing multi-sheet tables (`report_sheets`, `report_sheet_tables`)
- Do NOT change existing report execution, preview, export, or permission logic
- Only ADD new tables, routes, and extend existing responses where noted

---

## DATABASE SCHEMA - NEW TABLES

Run this migration:

```sql
-- Section Master: Defines all application sections where reports can appear
CREATE TABLE IF NOT EXISTS report_section_master (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Section Mapping: Many-to-many between reports and sections
CREATE TABLE IF NOT EXISTS report_section_mapping (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES report_master(id) ON DELETE CASCADE,
    section_id INTEGER NOT NULL REFERENCES report_section_master(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, section_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_report_section_mapping_report ON report_section_mapping(report_id);
CREATE INDEX IF NOT EXISTS idx_report_section_mapping_section ON report_section_mapping(section_id);
```

---

## SEED DATA - Insert Default Sections

```sql
INSERT INTO report_section_master (section_key, display_name, display_order) VALUES
    ('DYNAMIC_REPORTS', 'Dynamic Reports', 1),
    ('DRAW_MANAGEMENT', 'Draw Management', 2),
    ('PT_MANAGEMENT', 'PT Management', 3),
    ('QC', 'QC', 4),
    ('QA', 'QA', 5),
    ('FG', 'FG', 6),
    ('PACKING', 'Packing', 7),
    ('TC_GENERATION', 'TC Generation', 8),
    ('DISPATCH', 'Dispatch', 9),
    ('STORES', 'Stores', 10),
    ('INVENTORY', 'Inventory', 11),
    ('ORDER', 'Order', 12)
ON CONFLICT (section_key) DO NOTHING;
```

---

## MIGRATION FOR EXISTING REPORTS

All existing reports must be mapped to `DYNAMIC_REPORTS` so they continue appearing where they currently do:

```sql
-- Map all existing active reports to DYNAMIC_REPORTS section
INSERT INTO report_section_mapping (report_id, section_id)
SELECT rm.id, rsm.id
FROM report_master rm
CROSS JOIN report_section_master rsm
WHERE rm.is_deleted = FALSE
  AND rsm.section_key = 'DYNAMIC_REPORTS'
  AND NOT EXISTS (
    SELECT 1 FROM report_section_mapping m
    WHERE m.report_id = rm.id AND m.section_id = rsm.id
  );
```

---

## ROUTE FILE: routes/reportSections.routes.js

Create a new route file for section management:

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── GET all sections (for admin multi-select dropdown) ─────────────────────

router.get('/sections', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_section_master WHERE is_disabled = FALSE ORDER BY display_order ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── GET all sections including disabled (admin management) ─────────────────

router.get('/sections/all', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_section_master ORDER BY display_order ASC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── CREATE a new section ───────────────────────────────────────────────────

router.post('/sections', async (req, res) => {
    try {
        const { section_key, display_name, description, icon, display_order } = req.body;
        
        if (!section_key || !display_name) {
            return res.status(400).json({ message: 'section_key and display_name are required' });
        }

        const result = await pool.query(
            `INSERT INTO report_section_master (section_key, display_name, description, icon, display_order)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [section_key.toUpperCase(), display_name, description || null, icon || null, display_order || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Section with this key already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// ─── UPDATE a section ───────────────────────────────────────────────────────

router.put('/sections/:id', async (req, res) => {
    try {
        const { display_name, description, icon, display_order, is_disabled } = req.body;
        const result = await pool.query(
            `UPDATE report_section_master 
             SET display_name = COALESCE($1, display_name),
                 description = COALESCE($2, description),
                 icon = COALESCE($3, icon),
                 display_order = COALESCE($4, display_order),
                 is_disabled = COALESCE($5, is_disabled),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [display_name, description, icon, display_order, is_disabled, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── GET sections for a specific report ─────────────────────────────────────

router.get('/reports/:reportId/sections', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT rsm.* FROM report_section_master rsm
             INNER JOIN report_section_mapping m ON m.section_id = rsm.id
             WHERE m.report_id = $1 AND rsm.is_disabled = FALSE
             ORDER BY rsm.display_order`,
            [req.params.reportId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── SET sections for a report (replace all mappings) ───────────────────────

router.put('/reports/:reportId/sections', async (req, res) => {
    try {
        const { section_ids } = req.body;
        const reportId = req.params.reportId;

        if (!Array.isArray(section_ids) || section_ids.length === 0) {
            return res.status(400).json({ message: 'At least one section must be selected' });
        }

        // Verify report exists
        const reportCheck = await pool.query(
            'SELECT id FROM report_master WHERE id = $1 AND is_deleted = FALSE',
            [reportId]
        );
        if (reportCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Transaction: delete old mappings, insert new ones
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Remove existing mappings
            await client.query(
                'DELETE FROM report_section_mapping WHERE report_id = $1',
                [reportId]
            );

            // Insert new mappings
            const values = section_ids.map((sectionId, idx) => 
                `($1, $${idx + 2})`
            ).join(', ');
            
            await client.query(
                `INSERT INTO report_section_mapping (report_id, section_id) VALUES ${values}`,
                [reportId, ...section_ids]
            );

            await client.query('COMMIT');

            // Return updated sections
            const result = await pool.query(
                `SELECT rsm.* FROM report_section_master rsm
                 INNER JOIN report_section_mapping m ON m.section_id = rsm.id
                 WHERE m.report_id = $1 ORDER BY rsm.display_order`,
                [reportId]
            );
            res.json(result.rows);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ─── GET reports by section (for frontend module pages) ─────────────────────

router.get('/by-section/:sectionKey', async (req, res) => {
    try {
        const sectionKey = req.params.sectionKey.toUpperCase();
        
        const result = await pool.query(
            `SELECT rm.* FROM report_master rm
             INNER JOIN report_section_mapping m ON m.report_id = rm.id
             INNER JOIN report_section_master rsm ON rsm.id = m.section_id
             WHERE rsm.section_key = $1 
               AND rm.is_deleted = FALSE 
               AND rm.status = 'active'
               AND rsm.is_disabled = FALSE
             ORDER BY rm.report_name ASC`,
            [sectionKey]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
```

---

## MODIFY EXISTING ROUTE: Extend report listing to include sections

In the existing `routes/reportBuilder.routes.js`, **modify** the `GET /reports` endpoint to also return each report's mapped sections:

### Option A: Single query with aggregation (recommended)

Replace the existing `GET /reports` admin endpoint:

```javascript
// GET all reports (admin) - now includes section mappings
router.get('/reports', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT rm.*,
                   COALESCE(
                       json_agg(
                           json_build_object('id', rsm.id, 'section_key', rsm.section_key, 'display_name', rsm.display_name)
                       ) FILTER (WHERE rsm.id IS NOT NULL),
                       '[]'::json
                   ) AS sections
            FROM report_master rm
            LEFT JOIN report_section_mapping m ON m.report_id = rm.id
            LEFT JOIN report_section_master rsm ON rsm.id = m.section_id AND rsm.is_disabled = FALSE
            WHERE rm.is_deleted = FALSE
            GROUP BY rm.id
            ORDER BY rm.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

### Also modify `GET /reports/:id` to include sections:

```javascript
// GET single report by ID - now includes section mappings
router.get('/reports/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT rm.*,
                   COALESCE(
                       json_agg(
                           json_build_object('id', rsm.id, 'section_key', rsm.section_key, 'display_name', rsm.display_name)
                       ) FILTER (WHERE rsm.id IS NOT NULL),
                       '[]'::json
                   ) AS sections
            FROM report_master rm
            LEFT JOIN report_section_mapping m ON m.report_id = rm.id
            LEFT JOIN report_section_master rsm ON rsm.id = m.section_id AND rsm.is_disabled = FALSE
            WHERE rm.id = $1 AND rm.is_deleted = FALSE
            GROUP BY rm.id
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

---

## MODIFY EXISTING ROUTE: Auto-map on report CREATE

When a new report is created, if `section_ids` are provided in the body, save them. Otherwise, auto-map to `DYNAMIC_REPORTS`:

Add this logic **after** the existing INSERT into `report_master` in the POST `/reports` handler:

```javascript
// After creating the report (reportId is the new id)...
const reportId = result.rows[0].id;

// Handle section mappings
let sectionIds = req.body.section_ids;

if (!sectionIds || !Array.isArray(sectionIds) || sectionIds.length === 0) {
    // Default: map to DYNAMIC_REPORTS
    const defaultSection = await pool.query(
        "SELECT id FROM report_section_master WHERE section_key = 'DYNAMIC_REPORTS'"
    );
    if (defaultSection.rows.length > 0) {
        sectionIds = [defaultSection.rows[0].id];
    }
}

if (sectionIds && sectionIds.length > 0) {
    const values = sectionIds.map((_, idx) => `($1, $${idx + 2})`).join(', ');
    await pool.query(
        `INSERT INTO report_section_mapping (report_id, section_id) VALUES ${values}
         ON CONFLICT (report_id, section_id) DO NOTHING`,
        [reportId, ...sectionIds]
    );
}
```

---

## MODIFY EXISTING ROUTE: Update section mappings on report UPDATE

Add this logic at the **end** of the PUT `/reports/:id` handler:

```javascript
// Handle section mapping update (if section_ids provided)
if (req.body.section_ids && Array.isArray(req.body.section_ids)) {
    const sectionIds = req.body.section_ids;
    
    if (sectionIds.length === 0) {
        return res.status(400).json({ message: 'At least one section must be selected' });
    }

    // Remove old mappings
    await pool.query('DELETE FROM report_section_mapping WHERE report_id = $1', [req.params.id]);

    // Insert new mappings
    const values = sectionIds.map((_, idx) => `($1, $${idx + 2})`).join(', ');
    await pool.query(
        `INSERT INTO report_section_mapping (report_id, section_id) VALUES ${values}
         ON CONFLICT (report_id, section_id) DO NOTHING`,
        [req.params.id, ...sectionIds]
    );
}
```

---

## MODIFY: Dynamic Reports user endpoint

The existing `GET /api/dynamic-reports` currently returns all active reports. Modify it to support optional section filtering:

```javascript
// GET /api/dynamic-reports?section=DRAW_MANAGEMENT
router.get('/', async (req, res) => {
    try {
        const { section } = req.query;

        let query;
        let params = [];

        if (section) {
            // Filter by section
            query = `
                SELECT rm.* FROM report_master rm
                INNER JOIN report_section_mapping m ON m.report_id = rm.id
                INNER JOIN report_section_master rsm ON rsm.id = m.section_id
                WHERE rsm.section_key = $1
                  AND rm.is_deleted = FALSE
                  AND rm.status = 'active'
                  AND rsm.is_disabled = FALSE
                ORDER BY rm.report_name ASC
            `;
            params = [section.toUpperCase()];
        } else {
            // Default: return all active reports (backward compatible)
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

## REGISTER NEW ROUTES

In your main `server.js` or `app.js`, register the new route file:

```javascript
const reportSectionsRoutes = require('./routes/reportSections.routes');

// Mount under the report-builder prefix
app.use('/api/report-builder', authMiddleware, reportSectionsRoutes);
```

---

## API SUMMARY

### New Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/report-builder/sections` | Get all active sections (for multi-select) |
| GET | `/api/report-builder/sections/all` | Get all sections including disabled (admin) |
| POST | `/api/report-builder/sections` | Create a new section |
| PUT | `/api/report-builder/sections/:id` | Update a section |
| GET | `/api/report-builder/reports/:reportId/sections` | Get sections assigned to a report |
| PUT | `/api/report-builder/reports/:reportId/sections` | Set sections for a report (replaces all) |
| GET | `/api/report-builder/by-section/:sectionKey` | Get reports for a specific section |

### Modified Endpoints:

| Method | Endpoint | Change |
|--------|----------|--------|
| GET | `/api/report-builder/reports` | Now returns `sections` array on each report |
| GET | `/api/report-builder/reports/:id` | Now returns `sections` array on the report |
| POST | `/api/report-builder/reports` | Now accepts optional `section_ids` array in body |
| PUT | `/api/report-builder/reports/:id` | Now accepts optional `section_ids` array in body |
| GET | `/api/dynamic-reports` | Now accepts optional `?section=SECTION_KEY` query param |

---

## REQUEST/RESPONSE EXAMPLES

### GET `/api/report-builder/sections`

Response:
```json
[
    { "id": 1, "section_key": "DYNAMIC_REPORTS", "display_name": "Dynamic Reports", "display_order": 1 },
    { "id": 2, "section_key": "DRAW_MANAGEMENT", "display_name": "Draw Management", "display_order": 2 },
    { "id": 3, "section_key": "PT_MANAGEMENT", "display_name": "PT Management", "display_order": 3 },
    { "id": 4, "section_key": "QC", "display_name": "QC", "display_order": 4 }
]
```

### PUT `/api/report-builder/reports/5/sections`

Request body:
```json
{
    "section_ids": [1, 2, 4]
}
```

Response:
```json
[
    { "id": 1, "section_key": "DYNAMIC_REPORTS", "display_name": "Dynamic Reports" },
    { "id": 2, "section_key": "DRAW_MANAGEMENT", "display_name": "Draw Management" },
    { "id": 4, "section_key": "QC", "display_name": "QC" }
]
```

### GET `/api/report-builder/reports` (modified response)

Each report now includes a `sections` array:
```json
[
    {
        "id": 5,
        "report_name": "Daily Draw Report",
        "module": "Draw Management",
        "status": "active",
        "main_table": "draw_entry",
        "columns": [...],
        "...all existing fields...",
        "sections": [
            { "id": 1, "section_key": "DYNAMIC_REPORTS", "display_name": "Dynamic Reports" },
            { "id": 2, "section_key": "DRAW_MANAGEMENT", "display_name": "Draw Management" }
        ]
    }
]
```

### POST `/api/report-builder/reports` (create with sections)

Request body (existing fields + new):
```json
{
    "report_name": "Production Summary",
    "module": "Draw Management",
    "main_table": "draw_entry",
    "columns": [...],
    "...all existing fields...",
    "section_ids": [1, 2]
}
```

### GET `/api/dynamic-reports?section=DRAW_MANAGEMENT`

Returns only reports mapped to Draw Management section:
```json
[
    {
        "id": 5,
        "report_name": "Daily Draw Report",
        "module": "Draw Management",
        "status": "active",
        "...all existing fields..."
    }
]
```

### GET `/api/dynamic-reports` (no section param - backward compatible)

Returns ALL active reports (same as current behavior):
```json
[
    { "id": 1, "report_name": "..." },
    { "id": 2, "report_name": "..." }
]
```

---

## VALIDATION RULES

1. `section_key` must be unique, uppercase, alphanumeric with underscores
2. `display_name` is required
3. At least one section must be selected when saving a report
4. Duplicate mappings are prevented by UNIQUE constraint
5. Deleting a report (CASCADE) auto-removes its section mappings
6. Disabling a section hides it from multi-select but does not delete mappings
7. Disabled reports (`status != 'active'`) are not returned in section queries

---

## BACKWARD COMPATIBILITY

- `GET /api/dynamic-reports` without `?section` param returns ALL active reports (current behavior)
- Existing reports auto-mapped to `DYNAMIC_REPORTS` via migration
- `POST /api/report-builder/reports` without `section_ids` auto-maps to `DYNAMIC_REPORTS`
- All existing report execution, preview, export, and permission endpoints are UNCHANGED
- The `module` field on `report_master` is retained as-is (used for categorization, not visibility)

---

## EXECUTION ORDER

1. Run the CREATE TABLE migration (report_section_master + report_section_mapping)
2. Run the SEED DATA insert for default sections
3. Run the MIGRATION for existing reports (map to DYNAMIC_REPORTS)
4. Create the new `routes/reportSections.routes.js` file
5. Register the new routes in `server.js`
6. Modify the existing `GET /reports` endpoint to include sections
7. Modify the existing `GET /reports/:id` endpoint to include sections
8. Modify the existing `POST /reports` to handle section_ids
9. Modify the existing `PUT /reports/:id` to handle section_ids
10. Modify the existing `GET /api/dynamic-reports` to support `?section=` query param
11. Test all existing report functionality still works
12. Test new section CRUD
13. Test report-section mapping
14. Test backward compatibility (no section param returns all)
