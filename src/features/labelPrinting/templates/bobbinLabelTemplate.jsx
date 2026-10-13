import { registerTemplate } from '../core/templateRegistry';
import { renderBarcodeDataUrl } from '../services/barcode.service';
import { getBobbinPattern } from './bobbinPatterns';

/*
 * Bobbin sticker — 40 x 40 mm.
 *
 * Fixed top (from DB by bobbin_no):
 *   heading   → fiber_info
 *   colour    → fiber_color
 *   fibre id  → bobbin_no  (Code128 barcode + human-readable below)
 *   length    → length
 *
 * Dynamic bottom:
 *   The `pattern` field (A | B | C) selects which parameter rows render.
 *   See bobbinPatterns.js.
 *
 * 40x40 is very tight, so type is small and monospace. Keep heading short.
 */

const mono = { fontFamily: "'Courier New', Courier, monospace", color: '#111' };

const BobbinLabel = (d) => {
  const pattern = getBobbinPattern(d.pattern);

  // Barcode encodes the bobbin number ("Fiber ID").
  const barcode = renderBarcodeDataUrl(d.bobbin_no, { bcid: 'code128', height: 7, scale: 2 });

  const fmt = (row) => {
    const val = d[row.key];
    if (val === undefined || val === null || val === '') return `${row.label}:-`;
    return `${row.label}:${val}${row.unit ? ' ' + row.unit : ''}`;
  };

  return (
    <div
      style={{
        ...mono,
        width: '100%',
        height: '100%',
        background: '#fff',
        padding: '1.5mm 2mm',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6mm',
        overflow: 'hidden',
        fontWeight: 700,
      }}
    >
      {/* Heading: fiber_info */}
      <div style={{ fontSize: '6px', lineHeight: 1.1, textAlign: 'center', textTransform: 'uppercase' }}>
        {d.fiber_info}
      </div>

      {/* Colour: fiber_color */}
      <div style={{ fontSize: '5.5px', lineHeight: 1.1, textAlign: 'center' }}>
        {d.fiber_color}
      </div>

      {/* Fibre ID barcode (bobbin_no) + human-readable */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5mm' }}>
        {barcode && <img src={barcode} alt="bobbin barcode" style={{ height: '7mm', width: '90%', objectFit: 'fill' }} />}
      </div>
      <div style={{ fontSize: '6.5px', textAlign: 'center', letterSpacing: '0.3px', lineHeight: 1 }}>
        {d.bobbin_no}
      </div>

      {/* Billed length */}
      <div style={{ fontSize: '5.5px', textAlign: 'center', lineHeight: 1.1 }}>
        BILLED LENGTH: {d.length} {d.lengthUnit}
      </div>

      {/* Dynamic parameter block */}
      <div
        style={{
          marginTop: 'auto',
          borderTop: '0.3mm solid #111',
          paddingTop: '0.6mm',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2mm',
          fontSize: '5px',
          lineHeight: 1.15,
        }}
      >
        {pattern.rows.map((row) => (
          <div key={row.key}>{fmt(row)}</div>
        ))}
      </div>
    </div>
  );
};

registerTemplate({
  key: 'bobbin',
  name: 'Bobbin Sticker (40×40mm)',
  size: { width: 40, height: 40, unit: 'mm' },
  defaults: {
    pattern: 1,
    fiber_info: 'Single Mode Optical Fiber',
    fiber_color: 'NATURAL',
    bobbin_no: 'SYE0706853',
    length: 50400,
    lengthUnit: 'm',
    // parameter values (used depending on pattern)
    attn1310: '0.325',
    attn1550: '0.184',
    attn1383: '0.328',
    cutoff: '1276',
    mfd: '8.97',
    part_no: 'PN-G652D',
    mfg: '2026-10',
  },
  fields: [
    { name: 'pattern', label: 'Parameter Pattern', type: 'pattern' }, // special: rendered as pattern dropdown
    { name: 'bobbin_no', label: 'Bobbin No (Fiber ID)' },
    { name: 'fiber_info', label: 'Fiber Info (Heading)' },
    { name: 'fiber_color', label: 'Fiber Color' },
    { name: 'length', label: 'Billed Length', type: 'number' },
    { name: 'lengthUnit', label: 'Length Unit' },
    { name: 'attn1310', label: 'ATTN 1310nm' },
    { name: 'attn1550', label: 'ATTN 1550nm' },
    { name: 'attn1383', label: 'ATTN 1383nm' },
    { name: 'cutoff', label: 'Cutoff (nm)' },
    { name: 'mfd', label: 'MFD (um)' },
    { name: 'part_no', label: 'Part No' },
    { name: 'mfg', label: 'MFG' },
  ],
  render: BobbinLabel,
});
