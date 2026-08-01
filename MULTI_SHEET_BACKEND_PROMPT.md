# Multi-Sheet/Multi-Table Backend Implementation - Integrated Approach

## Overview

Extend the EXISTING Dynamic Report Builder backend to support **multi-sheet/multi-table** reports. The frontend uses the SAME Report Builder wizard — the admin selects "Single Table" or "Multi-Sheet" mode in Step 1. The backend must handle both modes through the existing API structure with minimal new endpoints.

## Technologies
- Node.js + Express.js  
- PostgreSQL (pg library with Pool)  
- JWT Authentication (Bearer token, middleware already exists)  
- ExcelJS (new dependency for server-side multi-sheet Excel export)  
- Port: 5000, Prefix: /api

---

## CRITICAL RULES

1. **DO NOT** modify the existing `report_master` table columns (only ADD one new column)
2. **DO NOT** break existing single-table report endpoints — they must work identically
3. Existing `GET /api/report-builder/reports` must return both single-table AND multi-sheet reports
4. Existing `GET /api/report-builder/reports/:id` must return multi-sheet reports with their full structure
5. The `is_multi_sheet` boolean flag distinguishes report type
6. ALL JSONB fields stored using `JSON.stringify()` in INSERT/UPDATE
7. Use transactions for multi-sheet create/update operations

---

## DATABASE CHANGES

### 1. Alter existing table (one new column):

```sql
ALTER TABLE report_master ADD COLUMN IF NOT EXISTS is_multi_sheet BOOLEAN DEFAULT FALSE;
```

### 2. New tables:

```sql
CREATE TABLE IF NOT EXISTS report_sheets (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES report_master(id) ON DELETE CASCADE,
    sheet_name VARCHAR(100) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS report_tables (
    id SERIAL PRIMARY KEY,
    sheet_id INTEGER NOT NULL REFERENCES report_sheets(id) ON DELETE CASCADE,
    report_id INTEGER NOT NULL REFERENCES report_master(id) ON DELETE CASCADE,
    table_name VARCHAR(255) NOT NULL,
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
    display_order INTEGER NOT NULL DEFAULT 1,
    spacing INTEGER DEFAULT 2,
    formatting JSONB DEFAULT '{"headerBold":true,"headerBgColor":"#1e293b","headerTextColor":"#ffffff","borderEnabled":true,"autoWidth":true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_report_sheets_report_id ON report_sheets(report_id);
CREATE INDEX IF NOT EXISTS idx_report_tables_sheet_id ON report_tables(sheet_id);
CREATE INDEX IF NOT EXISTS idx_report_tables_report_id ON report_tables(report_id);
```

---

## HIERARCHY

```
report_master (existing + is_multi_sheet flag)
    |
    |---- report_sheets
    |         id, report_id, sheet_name, display_order
    |
    |---- report_tables
              id, sheet_id, report_id, table_name, main_table,
              columns, column_display_names, column_order,
              joins, expressions, filters, sorting,
              group_by, aggregates, having,
              display_order, spacing, formatting
```

---

## MODIFICATIONS TO EXISTING ENDPOINTS

### 1. GET /api/report-builder/reports (list all reports)

**No change needed** — existing `SELECT * FROM report_master WHERE is_deleted=FALSE` already returns the `is_multi_sheet` column once added. Frontend uses this flag to determine edit behavior.

### 2. GET /api/report-builder/reports/:id (get single report)

**Modify** to also return sheets/tables when `is_multi_sheet = true`:

```javascript
router.get('/reports/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM report_master WHERE id = $1 AND is_deleted = FALSE',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        
        const report = result.rows[0];
        
        // If multi-sheet, also load sheets and tables
        if (report.is_multi_sheet) {
            const sheetsResult = await pool.query(
                'SELECT * FROM report_sheets WHERE report_id=$1 AND is_deleted=FALSE ORDER BY display_order',
                [report.id]
            );
            const tablesResult = await pool.query(
                'SELECT * FROM report_tables WHERE report_id=$1 AND is_deleted=FALSE ORDER BY display_order',
                [report.id]
            );
            // Group tables by sheet_id
            const tablesBySheet = {};
            tablesResult.rows.forEach(t => {
                if (!tablesBySheet[t.sheet_id]) tablesBySheet[t.sheet_id] = [];
                tablesBySheet[t.sheet_id].push(t);
            });
            report.sheets = sheetsResult.rows.map(sheet => ({
                ...sheet,
                tables: tablesBySheet[sheet.id] || [],
            }));
        }
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

### 3. POST /api/report-builder/reports (create report)

**Modify** to handle multi-sheet creation when `is_multi_sheet` is true in the request body:

```javascript
router.post('/reports', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { report_name, description, module, status, is_multi_sheet,
            main_table, columns, column_display_names, column_order, joins,
            expressions, filters, sorting, group_by, aggregates, having,
            permissions, sheets } = req.body;

        // Create report_master entry
        const reportResult = await client.query(`
            INSERT INTO report_master 
            (report_name, description, module, status, main_table, is_multi_sheet,
             columns, column_display_names, column_order, joins, expressions,
             filters, sorting, group_by, aggregates, having, permissions, created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
            RETURNING *
        `, [
            report_name, description, module, status || 'active',
            is_multi_sheet ? 'multi_sheet' : main_table,
            is_multi_sheet || false,
            toJsonb(columns || []),
            toJsonbObj(column_display_names || {}),
            toJsonb(column_order || []),
            toJsonb(joins || []),
            toJsonb(expressions || []),
            toJsonb(filters || []),
            toJsonb(sorting || []),
            toJsonb(group_by || []),
            toJsonb(aggregates || []),
            toJsonb(having || []),
            toJsonb(permissions || []),
            req.user?.id || null
        ]);
        const report = reportResult.rows[0];

        // If multi-sheet, create sheets and tables
        if (is_multi_sheet && sheets && sheets.length > 0) {
            const createdSheets = [];
            for (let si = 0; si < sheets.length; si++) {
                const sheet = sheets[si];
                const sheetResult = await client.query(`
                    INSERT INTO report_sheets (report_id, sheet_name, display_order)
                    VALUES ($1, $2, $3) RETURNING *
                `, [report.id, sheet.sheet_name || `Sheet ${si + 1}`, sheet.display_order || si + 1]);
                const createdSheet = sheetResult.rows[0];

                const createdTables = [];
                for (let ti = 0; ti < (sheet.tables || []).length; ti++) {
                    const t = sheet.tables[ti];
                    const tableResult = await client.query(`
                        INSERT INTO report_tables 
                        (sheet_id, report_id, table_name, main_table, columns, column_display_names,
                         column_order, joins, expressions, filters, sorting, group_by,
                         aggregates, having, display_order, spacing, formatting)
                        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                        RETURNING *
                    `, [
                        createdSheet.id, report.id,
                        t.table_name || `Table ${ti + 1}`, t.main_table,
                        toJsonb(t.columns), toJsonbObj(t.column_display_names),
                        toJsonb(t.column_order), toJsonb(t.joins),
                        toJsonb(t.expressions), toJsonb(t.filters),
                        toJsonb(t.sorting), toJsonb(t.group_by),
                        toJsonb(t.aggregates), toJsonb(t.having),
                        t.display_order || ti + 1, t.spacing ?? 2,
                        toJsonbObj(t.formatting || {}),
                    ]);
                    createdTables.push(tableResult.rows[0]);
                }
                createdSheets.push({ ...createdSheet, tables: createdTables });
            }
            report.sheets = createdSheets;
        }

        await client.query('COMMIT');
        res.json(report);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
});
```

### 4. PUT /api/report-builder/reports/:id (update report)

**Modify** to handle multi-sheet updates:

```javascript
router.put('/reports/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const reportId = req.params.id;
        const { report_name, description, module, status, is_multi_sheet,
            main_table, columns, column_display_names, column_order, joins,
            expressions, filters, sorting, group_by, aggregates, having,
            permissions, sheets } = req.body;

        // Update report_master
        const reportResult = await client.query(`
            UPDATE report_master SET
                report_name=$1, description=$2, module=$3, status=$4,
                main_table=$5, is_multi_sheet=$6,
                columns=$7, column_display_names=$8, column_order=$9, joins=$10,
                expressions=$11, filters=$12, sorting=$13, group_by=$14,
                aggregates=$15, having=$16, permissions=$17,
                updated_by=$18, updated_at=NOW()
            WHERE id=$19 AND is_deleted=FALSE
            RETURNING *
        `, [
            report_name, description, module, status,
            is_multi_sheet ? 'multi_sheet' : main_table,
            is_multi_sheet || false,
            toJsonb(columns || []), toJsonbObj(column_display_names || {}),
            toJsonb(column_order || []), toJsonb(joins || []),
            toJsonb(expressions || []), toJsonb(filters || []),
            toJsonb(sorting || []), toJsonb(group_by || []),
            toJsonb(aggregates || []), toJsonb(having || []),
            toJsonb(permissions || []),
            req.user?.id || null, reportId
        ]);
        if (reportResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Not found' });
        }
        const report = reportResult.rows[0];

        // If multi-sheet, replace sheets and tables
        if (is_multi_sheet && sheets) {
            // Soft-delete old sheets and tables
            await client.query('UPDATE report_sheets SET is_deleted=TRUE, updated_at=NOW() WHERE report_id=$1', [reportId]);
            await client.query('UPDATE report_tables SET is_deleted=TRUE, updated_at=NOW() WHERE report_id=$1', [reportId]);

            // Create new sheets and tables
            const createdSheets = [];
            for (let si = 0; si < sheets.length; si++) {
                const sheet = sheets[si];
                const sheetResult = await client.query(`
                    INSERT INTO report_sheets (report_id, sheet_name, display_order)
                    VALUES ($1, $2, $3) RETURNING *
                `, [reportId, sheet.sheet_name || `Sheet ${si + 1}`, sheet.display_order || si + 1]);
                const createdSheet = sheetResult.rows[0];

                const createdTables = [];
                for (let ti = 0; ti < (sheet.tables || []).length; ti++) {
                    const t = sheet.tables[ti];
                    const tableResult = await client.query(`
                        INSERT INTO report_tables 
                        (sheet_id, report_id, table_name, main_table, columns, column_display_names,
                         column_order, joins, expressions, filters, sorting, group_by,
                         aggregates, having, display_order, spacing, formatting)
                        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                        RETURNING *
                    `, [
                        createdSheet.id, reportId,
                        t.table_name || `Table ${ti + 1}`, t.main_table,
                        toJsonb(t.columns), toJsonbObj(t.column_display_names),
                        toJsonb(t.column_order), toJsonb(t.joins),
                        toJsonb(t.expressions), toJsonb(t.filters),
                        toJsonb(t.sorting), toJsonb(t.group_by),
                        toJsonb(t.aggregates), toJsonb(t.having),
                        t.display_order || ti + 1, t.spacing ?? 2,
                        toJsonbObj(t.formatting || {}),
                    ]);
                    createdTables.push(tableResult.rows[0]);
                }
                createdSheets.push({ ...createdSheet, tables: createdTables });
            }
            report.sheets = createdSheets;
        }

        await client.query('COMMIT');
        res.json(report);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: error.message });
    } finally {
        client.release();
    }
});
```

### 5. POST /api/dynamic-reports/:id/execute (execute report)

**Modify** to detect multi-sheet and execute all tables:

```javascript
router.post('/:id/execute', async (req, res) => {
    const startTime = Date.now();
    try {
        const { page = 1, pageSize = 50, filters = {}, sorting = [], search = '' } = req.body;

        // Load report
        const reportResult = await pool.query(
            'SELECT * FROM report_master WHERE id = $1 AND is_deleted = FALSE', [req.params.id]
        );
        if (reportResult.rows.length === 0) return res.status(404).json({ message: 'Report not found' });
        const report = reportResult.rows[0];

        // ── Multi-Sheet Execution ───────────────────────────────────────
        if (report.is_multi_sheet) {
            const sheetsResult = await pool.query(
                'SELECT * FROM report_sheets WHERE report_id=$1 AND is_deleted=FALSE ORDER BY display_order',
                [report.id]
            );
            const tablesResult = await pool.query(
                'SELECT * FROM report_tables WHERE report_id=$1 AND is_deleted=FALSE ORDER BY display_order',
                [report.id]
            );
            const tablesBySheet = {};
            tablesResult.rows.forEach(t => {
                if (!tablesBySheet[t.sheet_id]) tablesBySheet[t.sheet_id] = [];
                tablesBySheet[t.sheet_id].push(t);
            });

            const resultSheets = [];
            for (const sheet of sheetsResult.rows) {
                const sheetTables = tablesBySheet[sheet.id] || [];
                const executedTables = [];
                for (const tableConfig of sheetTables) {
                    try {
                        const sql = buildTableSQL(tableConfig, { filters });
                        const tableResult = await pool.query(sql);
                        executedTables.push({
                            title: tableConfig.table_name,
                            table_name: tableConfig.table_name,
                            columns: buildColumnDefs(tableConfig),
                            data: tableResult.rows,
                            rowCount: tableResult.rows.length,
                            spacing: tableConfig.spacing || 2,
                        });
                    } catch (tableError) {
                        executedTables.push({
                            title: tableConfig.table_name,
                            columns: [], data: [], rowCount: 0,
                            spacing: tableConfig.spacing || 2,
                            error: tableError.message,
                        });
                    }
                }
                resultSheets.push({ sheetName: sheet.sheet_name, tables: executedTables });
            }

            // Log execution
            const executionTime = Date.now() - startTime;
            pool.query(
                `INSERT INTO report_execution_log (report_id, executed_by, execution_time_ms, row_count, filters_applied, status) VALUES ($1,$2,$3,$4,$5,'success')`,
                [report.id, req.user?.id, executionTime, tablesResult.rows.length, JSON.stringify(filters)]
            ).catch(() => {});

            return res.json({
                reportName: report.report_name,
                is_multi_sheet: true,
                sheets: resultSheets,
                executionTime,
            });
        }

        // ── Single-Table Execution (existing logic, unchanged) ──────────
        // ... (keep all existing single-table execution code exactly as-is)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

---

## NEW ENDPOINTS (add to existing route files)

### Add to `dynamicReports.routes.js`:

```javascript
// POST /api/dynamic-reports/:id/export/multi-excel
// Server-side multi-sheet Excel export with formatting
router.post('/:id/export/multi-excel', async (req, res) => {
    try {
        const { filters = {} } = req.body;
        const reportResult = await pool.query(
            'SELECT * FROM report_master WHERE id=$1 AND is_deleted=FALSE', [req.params.id]
        );
        if (reportResult.rows.length === 0) return res.status(404).json({ message: 'Not found' });
        const report = reportResult.rows[0];

        const sheetsResult = await pool.query(
            'SELECT * FROM report_sheets WHERE report_id=$1 AND is_deleted=FALSE ORDER BY display_order', [report.id]
        );
        const tablesResult = await pool.query(
            'SELECT * FROM report_tables WHERE report_id=$1 AND is_deleted=FALSE ORDER BY display_order', [report.id]
        );
        const tablesBySheet = {};
        tablesResult.rows.forEach(t => {
            if (!tablesBySheet[t.sheet_id]) tablesBySheet[t.sheet_id] = [];
            tablesBySheet[t.sheet_id].push(t);
        });

        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Dynamic Report Builder';

        for (const sheet of sheetsResult.rows) {
            const sheetTables = tablesBySheet[sheet.id] || [];
            const sheetName = (sheet.sheet_name || 'Sheet').replace(/[\\/*?[\]:]/g, '').substring(0, 31);
            const worksheet = workbook.addWorksheet(sheetName);
            let currentRow = 1;

            for (let ti = 0; ti < sheetTables.length; ti++) {
                const tableConfig = sheetTables[ti];
                const formatting = tableConfig.formatting || {};
                try {
                    const sql = buildTableSQL(tableConfig, { filters });
                    const tableResult = await pool.query(sql);
                    const columnDefs = buildColumnDefs(tableConfig);

                    // Title row
                    if (tableConfig.table_name) {
                        worksheet.getRow(currentRow).getCell(1).value = tableConfig.table_name;
                        worksheet.getRow(currentRow).getCell(1).font = { bold: true, size: 12 };
                        currentRow++;
                    }
                    // Headers
                    const headerRow = worksheet.getRow(currentRow);
                    columnDefs.forEach((col, idx) => {
                        const cell = headerRow.getCell(idx + 1);
                        cell.value = col.header;
                        cell.font = { bold: formatting.headerBold !== false, color: { argb: (formatting.headerTextColor || '#ffffff').replace('#', 'FF') } };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: (formatting.headerBgColor || '#1e293b').replace('#', 'FF') } };
                        if (formatting.borderEnabled !== false) {
                            cell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
                        }
                    });
                    currentRow++;
                    // Data
                    for (const row of tableResult.rows) {
                        const dataRow = worksheet.getRow(currentRow);
                        columnDefs.forEach((col, idx) => { dataRow.getCell(idx + 1).value = row[col.field] ?? ''; });
                        currentRow++;
                    }
                    // Auto-width
                    if (formatting.autoWidth !== false) {
                        columnDefs.forEach((col, idx) => { worksheet.getColumn(idx + 1).width = Math.max(col.header.length + 2, 14); });
                    }
                } catch (tableError) {
                    worksheet.getRow(currentRow).getCell(1).value = `Error: ${tableError.message}`;
                    currentRow++;
                }
                currentRow += (tableConfig.spacing ?? 2);
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `${report.report_name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

### Add to `reportBuilder.routes.js`:

```javascript
// POST /api/report-builder/reports/preview-table
// Preview a single table configuration (used in the table config modal)
router.post('/reports/preview-table', async (req, res) => {
    try {
        const config = req.body;
        const sql = buildTableSQL(config, { limit: 100 });
        const startTime = Date.now();
        const result = await pool.query(sql);
        const columnDefs = buildColumnDefs(config);
        res.json({
            data: result.rows,
            columns: columnDefs,
            sql: sql.text,
            executionTime: Date.now() - startTime,
            rowCount: result.rows.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
```

---

## SHARED UTILITY: SQL Builder

Create `utils/sqlBuilder.js` (or add inline to routes):

```javascript
/**
 * Build SQL for a single table config.
 * Used by: preview-table, execute (multi-sheet), export/multi-excel
 */
function buildTableSQL(config, options = {}) {
    const { limit, filters = {} } = options;

    const columnOrder = config.column_order || [];
    const joins = config.joins || [];
    const expressions = config.expressions || [];
    const reportFilters = config.filters || [];
    const configSorting = config.sorting || [];
    const groupBy = config.group_by || [];
    const aggregates = config.aggregates || [];
    const havingConds = config.having || [];

    // SELECT
    const selectParts = [];
    for (const key of columnOrder) {
        const [table, column] = key.split('.');
        selectParts.push(`"${table}"."${column}" AS "${column}"`);
    }
    for (const agg of aggregates) {
        if (agg.column === '*') selectParts.push(`${agg.function}(*) AS "${agg.alias}"`);
        else selectParts.push(`${agg.function}("${agg.column.split('.').pop()}") AS "${agg.alias}"`);
    }
    for (const expr of expressions) {
        // Validate expression
        const dangerous = ['DROP','DELETE','INSERT','UPDATE','ALTER','CREATE','EXEC','EXECUTE','GRANT','REVOKE','TRUNCATE'];
        for (const word of dangerous) {
            if (new RegExp(`\\b${word}\\b`, 'gi').test(expr.expression)) {
                throw new Error(`Forbidden keyword: ${word}`);
            }
        }
        if (/--|\/\*|\*\/|;/.test(expr.expression)) throw new Error('Forbidden pattern');
        selectParts.push(`(${expr.expression}) AS "${expr.alias}"`);
    }
    const selectClause = selectParts.length > 0 ? selectParts.join(', ') : '*';

    // FROM + JOINs
    let fromClause = `FROM "${config.main_table}"`;
    for (const join of joins) {
        const jt = ['INNER','LEFT','RIGHT','FULL'].includes(join.joinType) ? join.joinType : 'INNER';
        fromClause += ` ${jt} JOIN "${join.rightTable}" ON "${join.leftTable}"."${join.leftColumn}" = "${join.rightTable}"."${join.rightColumn}"`;
    }

    // WHERE (runtime filters)
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
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // GROUP BY
    const groupByClause = groupBy.length > 0
        ? 'GROUP BY ' + groupBy.map(g => `"${g.split('.').pop()}"`).join(', ') : '';

    // HAVING
    const havingClause = havingConds.length > 0
        ? 'HAVING ' + havingConds.map(h => `${h.expression} ${h.operator} ${h.value}`).join(' AND ') : '';

    // ORDER BY
    const orderByClause = configSorting.length > 0
        ? 'ORDER BY ' + configSorting.map(s => `"${s.column.split('.').pop()}" ${s.direction === 'DESC' ? 'DESC' : 'ASC'}`).join(', ') : '';

    // LIMIT
    const limitClause = limit ? `LIMIT ${Math.min(Number(limit), 10000)}` : '';

    const text = `SELECT ${selectClause} ${fromClause} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause} ${limitClause}`.trim();
    return { text, values: params };
}

/**
 * Build column definitions for frontend from a table config
 */
function buildColumnDefs(config) {
    const columnOrder = config.column_order || [];
    const displayNames = config.column_display_names || {};
    const expressions = config.expressions || [];
    const aggregates = config.aggregates || [];

    const defs = columnOrder.map(key => ({
        field: key.split('.').pop(),
        header: displayNames[key] || key.split('.').pop().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
    for (const expr of expressions) {
        defs.push({ field: expr.alias, header: expr.displayName || expr.name || expr.alias });
    }
    for (const agg of aggregates) {
        defs.push({ field: agg.alias, header: agg.alias.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
    }
    return defs;
}

// Helpers
function toJsonb(val) { return typeof val === 'string' ? val : JSON.stringify(val || []); }
function toJsonbObj(val) { return typeof val === 'string' ? val : JSON.stringify(val || {}); }

module.exports = { buildTableSQL, buildColumnDefs, toJsonb, toJsonbObj };
```

---

## FRONTEND API CALLS → BACKEND ENDPOINTS MAPPING

| Frontend Function | HTTP Method | Endpoint | Notes |
|---|---|---|---|
| `createReport(data)` | POST | `/api/report-builder/reports` | Now handles both modes based on `is_multi_sheet` |
| `updateReport(id, data)` | PUT | `/api/report-builder/reports/:id` | Now handles both modes |
| `fetchReportById(id)` | GET | `/api/report-builder/reports/:id` | Returns sheets when multi-sheet |
| `fetchAllReports()` | GET | `/api/report-builder/reports` | Returns all reports with `is_multi_sheet` flag |
| `executeUserReport(id, params)` | POST | `/api/dynamic-reports/:id/execute` | Returns multi-sheet format when applicable |
| `previewTableQuery(config)` | POST | `/api/report-builder/reports/preview-table` | New endpoint for table preview |
| `exportMultiSheetExcel(id, params)` | POST | `/api/dynamic-reports/:id/export/multi-excel` | New endpoint |

**The frontend also has `createMultiSheetReport` and `updateMultiSheetReport` functions in reportBuilder.api.js.** These call `/api/report-builder/reports/multi-sheet` and `/api/report-builder/reports/:id/multi-sheet`. You can EITHER:
- **Option A (Recommended):** Make the existing POST/PUT `/reports` and `/reports/:id` handle multi-sheet (as shown above), and have the frontend `createMultiSheetReport` just call the same endpoint.
- **Option B:** Add separate `/reports/multi-sheet` endpoints that just call the same internal logic.

For simplicity, **Option A is recommended** — just make the existing create/update endpoints detect `is_multi_sheet` in the body.

If you choose Option A, update the frontend `createMultiSheetReport` and `updateMultiSheetReport` to just call `createReport` and `updateReport`:

```javascript
// In reportBuilder.api.js — these can simply delegate:
export const createMultiSheetReport = async (reportData) => {
  return createReport({ ...reportData, is_multi_sheet: true });
};
export const updateMultiSheetReport = async (reportId, reportData) => {
  return updateReport(reportId, { ...reportData, is_multi_sheet: true });
};
```

---

## DEPENDENCY

```bash
npm install exceljs
```

Required for server-side Excel workbook generation with formatting (bold, colors, borders, multiple sheets).

---

## RESPONSE FORMATS

### Single-Table Execute Response (unchanged):
```json
{
    "columns": [{"field": "spool_id", "header": "Spool ID"}],
    "data": [{"spool_id": "SP001"}],
    "totalRows": 1,
    "totalRecords": 1,
    "executionTime": 35
}
```

### Multi-Sheet Execute Response:
```json
{
    "reportName": "Production Summary",
    "is_multi_sheet": true,
    "sheets": [
        {
            "sheetName": "Draw Details",
            "tables": [
                {
                    "title": "Draw Entry Summary",
                    "columns": [{"field": "spool_id", "header": "Spool ID"}],
                    "data": [{"spool_id": "SP001"}],
                    "rowCount": 1,
                    "spacing": 2
                }
            ]
        }
    ],
    "executionTime": 145
}
```

### GET Report (multi-sheet):
```json
{
    "id": 1,
    "report_name": "Production Report",
    "is_multi_sheet": true,
    "main_table": "multi_sheet",
    "sheets": [
        {
            "id": 1, "sheet_name": "Draw", "display_order": 1,
            "tables": [
                {
                    "id": 1, "table_name": "Draw Summary", "main_table": "draw_entry",
                    "columns": [...], "column_order": [...], "joins": [...],
                    "display_order": 1, "spacing": 2, "formatting": {...}
                }
            ]
        }
    ]
}
```

---

## BACKWARD COMPATIBILITY

- Existing reports have `is_multi_sheet = FALSE` (the default)
- They continue to create/update/execute/export through the same endpoints
- No migration needed — the existing data and behavior is completely unaffected
- The `main_table` column stores `'multi_sheet'` as a placeholder for multi-sheet reports (since it's NOT NULL)

---

## VALIDATION

1. Report must have at least one sheet (when `is_multi_sheet = true`)
2. Each sheet must have at least one table
3. Sheet names unique within a report, max 31 chars, no `\ / * ? [ ] :`
4. Each table must have `main_table` and at least one column in `column_order`
5. `display_order` values should be sequential (1, 2, 3...)

---

## FILE STRUCTURE (backend changes)

```
backend/
├── routes/
│   ├── reportBuilder.routes.js    (MODIFY: create/update/get handle multi-sheet + add preview-table)
│   └── dynamicReports.routes.js   (MODIFY: execute detects multi-sheet + add export/multi-excel)
├── utils/
│   └── sqlBuilder.js              (NEW: buildTableSQL, buildColumnDefs, toJsonb helpers)
└── server.js                      (NO CHANGES needed - same route registrations)
```

---

## TESTING CHECKLIST

1. Create single-table report → works exactly as before
2. Edit single-table report → works exactly as before
3. Execute single-table report → same response format
4. Create multi-sheet report → sheets/tables saved in DB
5. Edit multi-sheet report → old sheets soft-deleted, new ones created
6. GET report by ID (multi-sheet) → returns nested sheets/tables
7. Execute multi-sheet report → returns `{ sheets: [...] }` format
8. Export multi-sheet Excel → workbook with multiple named sheets, tables formatted
9. List all reports → both types shown, `is_multi_sheet` flag visible
10. Preview table (in wizard) → returns table data and SQL for a single table config
