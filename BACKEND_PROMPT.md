# Dynamic Report Builder - Complete Backend Implementation

## Technologies
- Node.js + Express.js
- PostgreSQL (pg library with Pool)
- JWT Authentication (Bearer token, middleware already exists)
- Port: 5000, Prefix: /api

---

## DATABASE SCHEMA

```sql
CREATE TABLE IF NOT EXISTS report_master (
    id SERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    description TEXT,
    module VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    main_table VARCHAR(255) NOT NULL,
    columns JSONB DEFAULT '[]',
    column_display_names JSONB DEFAULT '{}',
    column_order JSONB DEFAULT '[]',
    joins JSONB DEFAULT '[]',
    expressions JSONB DEFAULT '[]',
    filters JSONB DEFAULT '[]',
    sorting JSONB DEFAULT '[]',
    group_by JSONB DEFAULT '[]',
    aggregates JSONB DEFAULT '[]',
    having JSONB DEFAULT '[]',
    permissions JSONB DEFAULT '[]',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS report_execution_log (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES report_master(id),
    executed_by INTEGER,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    row_count INTEGER,
    filters_applied JSONB,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT
);
```

---

## CRITICAL RULES

1. ALL JSONB fields MUST be stored using `JSON.stringify()` in INSERT/UPDATE
2. ALL JSONB fields are auto-parsed by PostgreSQL `pg` driver on SELECT - return directly
3. `GET` endpoints MUST return `SELECT *` to include ALL fields
4. The list endpoints AND detail endpoint MUST return the SAME complete structure
5. NEVER return partial data - every report object must have ALL fields

---

## ROUTE FILES

### File: routes/reportBuilder.routes.js

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET all tables from PostgreSQL
router.get('/tables', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            AND table_name NOT IN ('report_master','report_execution_log')
            ORDER BY table_name
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET columns for a table
router.get('/tables/:tableName/columns', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position
        `, [req.params.tableName]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET table relationships
router.get('/tables/:tableName/relationships', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT kcu.column_name, ccu.table_name AS foreign_table_name,
                   ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
        `, [req.params.tableName]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET all reports (admin)
router.get('/reports', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_master WHERE is_deleted = FALSE ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single report by ID - MUST return ALL fields
router.get('/reports/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_master WHERE id = $1 AND is_deleted = FALSE',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE report
router.post('/reports', async (req, res) => {
    try {
        const { report_name, description, module, status, main_table,
            columns, column_display_names, column_order, joins,
            expressions, filters, sorting, group_by, aggregates, having, permissions } = req.body;

        const result = await pool.query(`
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
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE report
router.put('/reports/:id', async (req, res) => {
    try {
        const { report_name, description, module, status, main_table,
            columns, column_display_names, column_order, joins,
            expressions, filters, sorting, group_by, aggregates, having, permissions } = req.body;

        const result = await pool.query(`
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
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE report (soft)
router.delete('/reports/:id', async (req, res) => {
    try {
        await pool.query(
            'UPDATE report_master SET is_deleted=TRUE, updated_at=NOW() WHERE id=$1',
            [req.params.id]
        );
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DUPLICATE report
router.post('/reports/:id/duplicate', async (req, res) => {
    try {
        const orig = await pool.query('SELECT * FROM report_master WHERE id=$1', [req.params.id]);
        if (orig.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        const r = orig.rows[0];
        const result = await pool.query(`
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
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PREVIEW report
router.post('/reports/preview', async (req, res) => {
    try {
        const config = req.body;
        const sql = buildReportSQL(config, { limit: 100 });
        console.log('[Preview] SQL:', sql.text);
        const startTime = Date.now();
        const result = await pool.query(sql);
        res.json({
            data: result.rows,
            sql: sql.text,
            executionTime: Date.now() - startTime,
            rowCount: result.rows.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET roles
router.get('/roles', async (req, res) => {
    res.json([{ id: 'admin', role_name: 'Admin' }, { id: 'user', role_name: 'User' }]);
});

// GET users for permissions
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, emp_id, emp_name FROM users ORDER BY emp_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
```

---

### File: routes/dynamicReports.routes.js

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET user-accessible reports
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_master WHERE is_deleted = FALSE AND status = $1 ORDER BY report_name',
            ['active']
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// EXECUTE report - MOST CRITICAL ENDPOINT
router.post('/:id/execute', async (req, res) => {
    const startTime = Date.now();
    try {
        const { page = 1, pageSize = 50, filters = {}, sorting = [], search = '' } = req.body;

        // 1. Load report config
        const reportResult = await pool.query(
            'SELECT * FROM report_master WHERE id = $1 AND is_deleted = FALSE',
            [req.params.id]
        );
        if (reportResult.rows.length === 0) return res.status(404).json({ message: 'Report not found' });
        const report = reportResult.rows[0];

        // 2. Parse JSONB fields (pg driver auto-parses, but be safe)
        const columns = report.columns || [];
        const columnOrder = report.column_order || [];
        const displayNames = report.column_display_names || {};
        const joins = report.joins || [];
        const expressions = report.expressions || [];
        const reportFilters = report.filters || [];
        const reportSorting = sorting.length > 0 ? sorting : (report.sorting || []);
        const groupBy = report.group_by || [];
        const aggregates = report.aggregates || [];
        const havingConds = report.having || [];

        // 3. Build SELECT
        const selectParts = [];
        for (const key of columnOrder) {
            const parts = key.split('.');
            const table = parts[0];
            const column = parts[1];
            selectParts.push(`"${table}"."${column}" AS "${column}"`);
        }
        for (const agg of aggregates) {
            if (agg.column === '*') selectParts.push(`${agg.function}(*) AS "${agg.alias}"`);
            else {
                const col = agg.column.split('.').pop();
                selectParts.push(`${agg.function}("${col}") AS "${agg.alias}"`);
            }
        }
        for (const expr of expressions) {
            // Replace table.column references with just "column" for SQL
            let safeExpr = expr.expression;
            // Validate - block dangerous keywords
            const dangerous = ['DROP','DELETE','INSERT','UPDATE','ALTER','CREATE','EXEC','EXECUTE','GRANT','REVOKE','TRUNCATE'];
            for (const word of dangerous) {
                if (new RegExp(`\\b${word}\\b`, 'gi').test(safeExpr)) {
                    return res.status(400).json({ message: `Forbidden keyword in expression: ${word}` });
                }
            }
            if (safeExpr.includes('--') || safeExpr.includes('/*') || safeExpr.includes('*/') || safeExpr.includes(';')) {
                return res.status(400).json({ message: 'Forbidden pattern in expression' });
            }
            selectParts.push(`(${safeExpr}) AS "${expr.alias}"`);
        }
        const selectClause = selectParts.length > 0 ? selectParts.join(', ') : '*';

        // 4. Build FROM + JOINs
        let fromClause = `FROM "${report.main_table}"`;
        for (const join of joins) {
            const jt = ['INNER','LEFT','RIGHT','FULL'].includes(join.joinType) ? join.joinType : 'INNER';
            fromClause += ` ${jt} JOIN "${join.rightTable}" ON "${join.leftTable}"."${join.leftColumn}" = "${join.rightTable}"."${join.rightColumn}"`;
        }

        // 5. Build WHERE
        const params = [];
        const conditions = [];
        for (const [key, value] of Object.entries(filters)) {
            if (!value || value === '') continue;
            const column = key.split('.').pop();
            const filterConfig = reportFilters.find(f => f.column === key);
            if (filterConfig?.filterType === 'daterange') {
                if (value.from) { params.push(value.from); conditions.push(`"${column}" >= $${params.length}`); }
                if (value.to) { params.push(value.to); conditions.push(`"${column}" <= $${params.length}`); }
            } else if (filterConfig?.filterType === 'number') {
                params.push(Number(value)); conditions.push(`"${column}" = $${params.length}`);
            } else {
                params.push(`%${value}%`); conditions.push(`"${column}" ILIKE $${params.length}`);
            }
        }
        if (search) {
            const textCols = columns.filter(c => ['character varying','text','character'].includes(c.dataType));
            if (textCols.length > 0) {
                params.push(`%${search}%`);
                const searchConds = textCols.map(c => `"${c.column}"::text ILIKE $${params.length}`);
                conditions.push(`(${searchConds.join(' OR ')})`);
            }
        }
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // 6. GROUP BY
        let groupByClause = '';
        if (groupBy.length > 0) {
            groupByClause = 'GROUP BY ' + groupBy.map(g => `"${g.split('.').pop()}"`).join(', ');
        }

        // 7. HAVING
        let havingClause = '';
        if (havingConds.length > 0) {
            havingClause = 'HAVING ' + havingConds.map(h => `${h.expression} ${h.operator} ${h.value}`).join(' AND ');
        }

        // 8. ORDER BY
        let orderByClause = '';
        if (reportSorting.length > 0) {
            orderByClause = 'ORDER BY ' + reportSorting.map(s => {
                const col = s.column.split('.').pop();
                return `"${col}" ${s.direction === 'DESC' ? 'DESC' : 'ASC'}`;
            }).join(', ');
        }

        // 9. Pagination
        const limit = Math.min(Number(pageSize) || 50, 500);
        const offset = (Math.max(Number(page), 1) - 1) * limit;

        // 10. Execute
        const dataSQL = `SELECT ${selectClause} ${fromClause} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause} LIMIT ${limit} OFFSET ${offset}`;
        const countSQL = `SELECT COUNT(*) as total ${fromClause} ${whereClause}`;

        console.log('[Execute] SQL:', dataSQL);
        console.log('[Execute] Params:', params);

        const [dataResult, countResult] = await Promise.all([
            pool.query({ text: dataSQL, values: params }),
            pool.query({ text: countSQL, values: params }),
        ]);

        const totalRows = parseInt(countResult.rows[0]?.total || 0);
        const executionTime = Date.now() - startTime;

        // 11. Build column definitions for frontend
        const columnDefs = columnOrder.map(key => ({
            field: key.split('.').pop(),
            header: displayNames[key] || key.split('.').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        }));
        for (const expr of expressions) {
            columnDefs.push({ field: expr.alias, header: expr.displayName || expr.name });
        }
        for (const agg of aggregates) {
            columnDefs.push({ field: agg.alias, header: agg.alias.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
        }

        // 12. Log execution
        pool.query(
            `INSERT INTO report_execution_log (report_id, executed_by, execution_time_ms, row_count, filters_applied, status) VALUES ($1,$2,$3,$4,$5,'success')`,
            [req.params.id, req.user?.id, executionTime, totalRows, JSON.stringify(filters)]
        ).catch(() => {});

        // 13. RESPONSE - this exact format is required by frontend
        res.json({
            columns: columnDefs,
            data: dataResult.rows,
            rows: dataResult.rows,
            totalRows: totalRows,
            totalRecords: totalRows,
            executionTime: executionTime
        });

    } catch (error) {
        console.error('[Execute] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
```

---

## ROUTE REGISTRATION (server.js)

```javascript
const reportBuilderRoutes = require('./routes/reportBuilder.routes');
const dynamicReportsRoutes = require('./routes/dynamicReports.routes');

// Both need auth middleware
app.use('/api/report-builder', authMiddleware, reportBuilderRoutes);
app.use('/api/dynamic-reports', authMiddleware, dynamicReportsRoutes);
```

---

## CRITICAL: EDIT FUNCTIONALITY FIX

The frontend Edit function depends on the LIST endpoint returning COMPLETE report objects.

When the admin clicks Edit, the frontend passes the FULL report object from the list to the wizard.

**If your list endpoint returns partial data (e.g., only id, report_name, module, status, created_at), the Edit will NOT work.**

### VERIFY:

1. Call `GET /api/report-builder/reports` or `GET /api/dynamic-reports`
2. Check that EACH report object in the response has ALL these fields:
   - `id` 
   - `report_name`
   - `main_table` ← CRITICAL - must NOT be null
   - `columns` ← must be array
   - `column_display_names` ← must be object
   - `column_order` ← must be array
   - `joins` ← must be array
   - `expressions` ← must be array
   - `filters` ← must be array
   - `sorting` ← must be array
   - `group_by` ← must be array
   - `aggregates` ← must be array
   - `having` ← must be array
   - `permissions` ← must be array

3. If ANY field is null when it should have data, check your INSERT query - you might be passing `undefined` instead of `JSON.stringify([])`

### COMMON BUG: Double JSON.stringify

If your JSONB column already receives a JSON string from the frontend, and you do `JSON.stringify()` again, it will be double-encoded:

**WRONG (stored as string in DB):**
```
"[{\"table\":\"draw_entry\"}]"   ← this is a string, not JSONB
```

**CORRECT (stored as JSONB):**
```
[{"table": "draw_entry"}]   ← this is proper JSONB
```

To fix: Before `JSON.stringify`, check if it's already a string:
```javascript
function toJsonb(val) {
    if (typeof val === 'string') return val; // already JSON string
    return JSON.stringify(val || []);
}
```

Then use `toJsonb(columns)` instead of `JSON.stringify(columns)` in your INSERT/UPDATE.

---

## EXECUTE RESPONSE FORMAT (mandatory)

```json
{
    "columns": [
        {"field": "spool_id", "header": "Spool ID"},
        {"field": "drawn_length", "header": "Draw Length (KM)"},
        {"field": "exact_weigth", "header": "Exact Weigth"}
    ],
    "data": [
        {"spool_id": "SP001", "drawn_length": 50.4, "exact_weigth": 2016}
    ],
    "totalRows": 1,
    "totalRecords": 1,
    "executionTime": 35
}
```

The frontend uses `response.columns[].field` to read `response.data[row][field]`.

---

## EXPRESSION VALIDATION

Do NOT put `*`, `+`, `-`, `/`, `(`, `)` in the dangerous keywords regex. These are SQL arithmetic operators. Only block actual injection keywords:

```javascript
const dangerous = ['DROP','DELETE','INSERT','UPDATE','ALTER','CREATE','EXEC','EXECUTE','GRANT','REVOKE','TRUNCATE'];
for (const word of dangerous) {
    if (new RegExp(`\\b${word}\\b`, 'gi').test(expr)) {
        throw new Error(`Forbidden: ${word}`);
    }
}
// Check patterns via string includes (NOT regex)
if (expr.includes('--') || expr.includes('/*') || expr.includes('*/') || expr.includes(';')) {
    throw new Error('Forbidden pattern');
}
```

---

## TESTING CHECKLIST

1. Create a report → verify all JSONB fields are stored correctly
2. List reports → verify response has ALL fields with data (not null)
3. Get report by ID → verify same complete structure
4. Edit report → frontend should show all saved config in every step
5. Execute report → verify SQL is generated and data is returned
6. Execute with joins → verify JOIN SQL is correct
7. Execute with expressions → verify calculated columns appear
8. Export → verify same data structure works for export
