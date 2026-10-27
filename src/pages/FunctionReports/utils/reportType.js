/**
 * Shared helpers for Function Report types (single / multi_table / multi_sheet).
 */

export const REPORT_TYPES = {
  SINGLE: 'single',
  MULTI_TABLE: 'multi_table',
  MULTI_SHEET: 'multi_sheet',
};

export const REPORT_TYPE_OPTIONS = [
  {
    value: REPORT_TYPES.SINGLE,
    label: 'Single',
    description: 'One function, one table',
  },
  {
    value: REPORT_TYPES.MULTI_TABLE,
    label: 'Multi Table',
    description: 'Several functions as stacked tables (one Excel sheet)',
  },
  {
    value: REPORT_TYPES.MULTI_SHEET,
    label: 'Multi Sheet',
    description: 'Several functions as tabs (one Excel sheet per function)',
  },
];

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.SINGLE]: 'Single',
  [REPORT_TYPES.MULTI_TABLE]: 'Multi Table',
  [REPORT_TYPES.MULTI_SHEET]: 'Multi Sheet',
};

/** Missing / unknown report_type is treated as "single". */
export const getReportType = (report) => {
  const t = report?.report_type;
  return t === REPORT_TYPES.MULTI_TABLE || t === REPORT_TYPES.MULTI_SHEET ? t : REPORT_TYPES.SINGLE;
};

export const isMultiType = (type) =>
  type === REPORT_TYPES.MULTI_TABLE || type === REPORT_TYPES.MULTI_SHEET;

/** Ordered function names for a report (prefers `function_names`, falls back to the comma string). */
export const getFunctionNames = (report) => {
  if (Array.isArray(report?.function_names) && report.function_names.length > 0) {
    return report.function_names;
  }
  return String(report?.function_name || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

/** "schema.fn" -> { schema, fn } (splits on the first dot only). */
export const splitFullName = (fullName) => {
  const str = String(fullName || '');
  const i = str.indexOf('.');
  if (i < 0) return { schema: '', fn: str };
  return { schema: str.slice(0, i), fn: str.slice(i + 1) };
};

/** Short label used in lists: "schema.fn" for single, "schema · N functions" for multi. */
export const getFunctionLabel = (report) => {
  const names = getFunctionNames(report);
  if (isMultiType(getReportType(report))) {
    return `${report?.schema_name || ''} · ${names.length} functions`;
  }
  return `${report?.schema_name}.${names[0] || report?.function_name}`;
};

/**
 * Normalizes result columns to [{ field, header }].
 * Accepts strings or objects (field/name/key + header/label); when no columns are
 * provided they are derived from the first row.
 */
export const normalizeColumns = (columns, rows) => {
  if (Array.isArray(columns) && columns.length > 0) {
    return columns
      .map((c) => {
        if (typeof c === 'string') return { field: c, header: c.replace(/_/g, ' ') };
        const field = c?.field ?? c?.name ?? c?.key ?? c?.column_name;
        if (field === undefined || field === null) return null;
        return { ...c, field, header: c.header ?? c.label ?? String(field).replace(/_/g, ' ') };
      })
      .filter(Boolean);
  }
  if (Array.isArray(rows) && rows.length > 0) {
    return Object.keys(rows[0]).map((key) => ({ field: key, header: key.replace(/_/g, ' ') }));
  }
  return [];
};
