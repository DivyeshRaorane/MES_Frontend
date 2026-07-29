# Dynamic Report Builder - Aggregate & GROUP BY Enhancement

## OVERVIEW

The frontend now sends `aggregate` and `groupBy` flags per column in the `columns` array.

## UPDATED COLUMN FORMAT

Each column in `report_master.columns` JSONB now has:

```json
[
  {"table": "draw_entry", "column": "preform_id", "dataType": "character varying", "aggregate": "", "groupBy": true},
  {"table": "draw_entry", "column": "drawn_length", "dataType": "numeric", "aggregate": "SUM", "groupBy": false},
  {"table": "draw_entry", "column": "spool_id", "dataType": "character varying", "aggregate": "COUNT", "groupBy": false}
]
```

- `aggregate`: "" (none), "SUM", "COUNT", "COUNT_DISTINCT", "AVG", "MIN", "MAX"
- `groupBy`: true/false - explicitly marked as group by column

## AUTOMATIC GROUP BY RULES

When generating SQL, apply these rules:

### Rule 1: Detect Aggregate Report
```javascript
const hasAggregates = columns.some(c => c.aggregate) || expressions.some(e => {
  const agg = ['SUM(','COUNT(','AVG(','MIN(','MAX(','STRING_AGG(','ARRAY_AGG('];
  return agg.some(a => e.expression.toUpperCase().includes(a));
});
```

### Rule 2: If aggregate report, auto-generate GROUP BY
```javascript
if (hasAggregates) {
  // Columns explicitly marked groupBy OR columns without aggregate = GROUP BY
  const groupByColumns = columns.filter(c => c.groupBy || (!c.aggregate && !c.groupBy));
  // Generate GROUP BY clause
  groupByClause = 'GROUP BY ' + groupByColumns.map(c => `"${c.table}"."${c.column}"`).join(', ');
}
```

### Rule 3: Build SELECT with aggregates
```javascript
for (const col of columns) {
  const ref = `"${col.table}"."${col.column}"`;
  if (col.aggregate === 'COUNT_DISTINCT') {
    selectParts.push(`COUNT(DISTINCT ${ref}) AS "${col.column}"`);
  } else if (col.aggregate) {
    selectParts.push(`${col.aggregate}(${ref}) AS "${col.column}"`);
  } else {
    selectParts.push(`${ref} AS "${col.column}"`);
  }
}
```

## COMPLETE UPDATED EXECUTE ENDPOINT

Replace your existing execute endpoint with this:

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

        // ═══ DETECT AGGREGATE REPORT ═══
        const AGG_KEYWORDS = ['SUM(', 'COUNT(', 'AVG(', 'MIN(', 'MAX(', 'STRING_AGG(', 'ARRAY_AGG('];
        const hasColumnAggregates = columns.some(c => c.aggregate);
        const hasExpressionAggregates = expressions.some(e => 
            AGG_KEYWORDS.some(k => e.expression.toUpperCase().includes(k))
        );
        const isAggregateReport = hasColumnAggregates || hasExpressionAggregates || aggregates.length > 0;

        // ═══ BUILD SELECT ═══
        const selectParts = [];
        const autoGroupByParts = []; // For auto GROUP BY

        for (const key of columnOrder) {
            const [table, column] = key.split('.');
            const colDef = columns.find(c => c.table === table && c.column === column);
            const ref = `"${table}"."${column}"`;

            if (colDef?.aggregate === 'COUNT_DISTINCT') {
                selectParts.push(`COUNT(DISTINCT ${ref}) AS "${column}"`);
            } else if (colDef?.aggregate) {
                selectParts.push(`${colDef.aggregate}(${ref}) AS "${column}"`);
            } else {
                selectParts.push(`${ref} AS "${column}"`);
                // Non-aggregated columns must be in GROUP BY (if report is aggregate)
                if (isAggregateReport) {
                    autoGroupByParts.push(ref);
                }
            }
        }

        // Old-style aggregates (from Step 9)
        for (const agg of aggregates) {
            if (agg.column === '*') {
                selectParts.push(`${agg.function}(*) AS "${agg.alias}"`);
            } else {
                const col = agg.column.split('.').pop();
                const table = agg.column.split('.')[0];
                selectParts.push(`${agg.function}("${table}"."${col}") AS "${agg.alias}"`);
            }
        }

        // Expression columns
        for (const expr of expressions) {
            let safeExpr = expr.expression;
            // Validate
            const dangerous = ['DROP','DELETE','INSERT','UPDATE','ALTER','CREATE','EXEC','EXECUTE','GRANT','REVOKE','TRUNCATE'];
            for (const word of dangerous) {
                if (new RegExp(`\\b${word}\\b`, 'gi').test(safeExpr)) {
                    return res.status(400).json({ message: `Forbidden keyword: ${word}` });
                }
            }
            if (safeExpr.includes('--') || safeExpr.includes('/*') || safeExpr.includes('*/') || safeExpr.includes(';')) {
                return res.status(400).json({ message: 'Forbidden pattern in expression' });
            }
            selectParts.push(`(${safeExpr}) AS "${expr.alias}"`);
        }

        const selectClause = selectParts.length > 0 ? selectParts.join(', ') : '*';

        // ═══ BUILD FROM + JOINs ═══
        let fromClause = `FROM "${report.main_table}"`;
        for (const join of joins) {
            const jt = ['INNER','LEFT','RIGHT','FULL'].includes(join.joinType) ? join.joinType : 'INNER';
            fromClause += ` ${jt} JOIN "${join.rightTable}" ON "${join.leftTable}"."${join.leftColumn}" = "${join.rightTable}"."${join.rightColumn}"`;
        }

        // ═══ BUILD WHERE ═══
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
                const s = textCols.map(c => `"${c.column}"::text ILIKE $${params.length}`);
                conditions.push(`(${s.join(' OR ')})`);
            }
        }
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // ═══ BUILD GROUP BY ═══
        let groupByClause = '';
        if (isAggregateReport) {
            // Combine: explicitly marked groupBy columns + auto-detected non-aggregate columns
            const explicitGroupBy = columns.filter(c => c.groupBy).map(c => `"${c.table}"."${c.column}"`);
            const allGroupBy = [...new Set([...explicitGroupBy, ...autoGroupByParts])];
            
            // Also include groupBy from Step 9 (old format)
            for (const g of groupBy) {
                const col = g.split('.').pop();
                const table = g.split('.')[0] || report.main_table;
                const ref = `"${table}"."${col}"`;
                if (!allGroupBy.includes(ref)) allGroupBy.push(ref);
            }
            
            if (allGroupBy.length > 0) {
                groupByClause = 'GROUP BY ' + allGroupBy.join(', ');
            }
        } else if (groupBy.length > 0) {
            // Old-style explicit GROUP BY
            groupByClause = 'GROUP BY ' + groupBy.map(g => `"${g.split('.').pop()}"`).join(', ');
        }

        // ═══ BUILD HAVING ═══
        let havingClause = '';
        if (havingConds.length > 0) {
            havingClause = 'HAVING ' + havingConds.map(h => `${h.expression} ${h.operator} ${h.value}`).join(' AND ');
        }

        // ═══ BUILD ORDER BY ═══
        let orderByClause = '';
        if (reportSorting.length > 0) {
            orderByClause = 'ORDER BY ' + reportSorting.map(s => {
                const col = s.column.split('.').pop();
                const dir = s.direction === 'DESC' ? 'DESC' : 'ASC';
                // Check if sorting by an aggregate alias
                const isAlias = [...aggregates.map(a=>a.alias), ...expressions.map(e=>e.alias)].includes(col);
                return isAlias ? `"${col}" ${dir}` : `"${col}" ${dir}`;
            }).join(', ');
        }

        // ═══ PAGINATION ═══
        const limit = Math.min(Number(pageSize) || 50, 500);
        const offset = (Math.max(Number(page), 1) - 1) * limit;

        // ═══ EXECUTE ═══
        const dataSQL = `SELECT ${selectClause} ${fromClause} ${whereClause} ${groupByClause} ${havingClause} ${orderByClause} LIMIT ${limit} OFFSET ${offset}`;
        
        // Count query - wrap in subquery for aggregate reports
        let countSQL;
        if (isAggregateReport) {
            countSQL = `SELECT COUNT(*) as total FROM (SELECT ${selectClause} ${fromClause} ${whereClause} ${groupByClause} ${havingClause}) AS count_sub`;
        } else {
            countSQL = `SELECT COUNT(*) as total ${fromClause} ${whereClause}`;
        }

        console.log('[Execute] SQL:', dataSQL);
        console.log('[Execute] Is Aggregate:', isAggregateReport);

        const [dataResult, countResult] = await Promise.all([
            pool.query({ text: dataSQL, values: params }),
            pool.query({ text: countSQL, values: params }),
        ]);

        const totalRows = parseInt(countResult.rows[0]?.total || 0);
        const executionTime = Date.now() - startTime;

        // Build column defs for frontend
        const columnDefs = columnOrder.map(key => {
            const colDef = columns.find(c => `${c.table}.${c.column}` === key);
            const field = key.split('.').pop();
            let header = displayNames[key] || field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            if (colDef?.aggregate) header = `${colDef.aggregate}(${header})`;
            return { field, header };
        });
        for (const expr of expressions) columnDefs.push({ field: expr.alias, header: expr.displayName || expr.name });
        for (const agg of aggregates) columnDefs.push({ field: agg.alias, header: agg.alias.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) });

        // Log
        pool.query(`INSERT INTO report_execution_log (report_id, executed_by, execution_time_ms, row_count, filters_applied, status) VALUES ($1,$2,$3,$4,$5,'success')`,
            [req.params.id, req.user?.id, executionTime, totalRows, JSON.stringify(filters)]).catch(()=>{});

        res.json({ columns: columnDefs, data: dataResult.rows, rows: dataResult.rows, totalRows, totalRecords: totalRows, executionTime });

    } catch (error) {
        console.error('[Execute] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});
```

## BACKWARD COMPATIBILITY

- If no column has `aggregate` set AND no expressions contain aggregate functions → normal SELECT (no GROUP BY)
- Old reports without `aggregate`/`groupBy` fields continue working as before
- The `columns` array defaults to `aggregate: ""` and `groupBy: false` if fields are missing

## SQL GENERATION EXAMPLES

### Example 1: Simple report (no aggregates)
```
Columns: preform_id (none), spool_id (none), drawn_length (none)
→ SELECT "draw_entry"."preform_id", "draw_entry"."spool_id", "draw_entry"."drawn_length" FROM "draw_entry"
```

### Example 2: Aggregate report (auto GROUP BY)
```
Columns: preform_id (groupBy:true), drawn_length (SUM), spool_id (COUNT)
→ SELECT "draw_entry"."preform_id", SUM("draw_entry"."drawn_length") AS "drawn_length", COUNT("draw_entry"."spool_id") AS "spool_id"
  FROM "draw_entry"
  GROUP BY "draw_entry"."preform_id"
```

### Example 3: Multi-group with HAVING
```
Columns: preform_id (groupBy:true), product_type (groupBy:true), drawn_length (SUM)
Having: SUM(drawn_length) > 1000
→ SELECT "draw_entry"."preform_id", "draw_entry"."product_type", SUM("draw_entry"."drawn_length") AS "drawn_length"
  FROM "draw_entry"
  GROUP BY "draw_entry"."preform_id", "draw_entry"."product_type"
  HAVING SUM(drawn_length) > 1000
```

### Example 4: With JOIN and aggregate
```
Main: draw_entry
Join: preform_accept ON draw_entry.preform_id = preform_accept.preform_id
Columns: draw_entry.preform_id (groupBy:true), draw_entry.drawn_length (SUM), preform_accept.mfd (AVG)
→ SELECT "draw_entry"."preform_id", SUM("draw_entry"."drawn_length") AS "drawn_length", AVG("preform_accept"."mfd") AS "mfd"
  FROM "draw_entry"
  INNER JOIN "preform_accept" ON "draw_entry"."preform_id" = "preform_accept"."preform_id"
  GROUP BY "draw_entry"."preform_id"
```

### Example 5: Expression with aggregate
```
Expression: SUM(draw_entry.drawn_length) - SUM(draw_entry.scrap_length) AS net_production
→ Auto-detects as aggregate report, applies GROUP BY to non-aggregated columns
```

## EXPRESSION VALIDATION

Updated dangerous keywords check (DO NOT include * + - / etc):
```javascript
const dangerous = ['DROP','DELETE','INSERT','UPDATE','ALTER','CREATE','EXEC','EXECUTE','GRANT','REVOKE','TRUNCATE'];
const dangerousPatterns = ['--', '/*', '*/', ';'];
```
