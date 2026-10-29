import { registerTemplate } from '../core/templateRegistry';
import { renderBarcodeDataUrl } from '../services/barcode.service';

/*
 * Box sticker — 100 x 150 mm. No patterns: one fixed layout.
 *
 * Data (one object per box, straight from POST /box/labels):
 *   customer_name, product, box_no, packing_order, stack_no,
 *   bobbin_details: [{ fid, color, length(m) }]
 *
 * Layout (top → bottom):
 *   customer name
 *   product
 *   BOX NO (big) + Code128 barcode of box_no
 *   table: S.No | Colour | Fiber ID | Length (m)
 *   footer: TOTAL bobbins (+ Code128 barcode of the count) | TOTAL length (m)
 *
 * Everything is inline-styled in mm/pt because the print iframe has no app CSS.
 */

/** Printed in the header of every box label, regardless of the backend's customer_name. */
const COMPANY_NAME = 'WEST COAST OPTILINKS PVT LTD';

/** Rows beyond this cannot fit on 100x150 even at the smallest font. */
export const BOX_LABEL_MAX_ROWS = 30;

const sans = { fontFamily: 'Arial, Helvetica, sans-serif', color: '#111' };
const mono = { fontFamily: "'Courier New', Courier, monospace", color: '#111' };

const fmtNum = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-';
};
const dash = (v) => (v === undefined || v === null || String(v).trim() === '' ? '-' : v);

/** Shrink rows as the bobbin count grows so the list keeps fitting. */
const rowTier = (n) => {
  if (n <= 12) return { h: 5, font: '9pt' };
  if (n <= 16) return { h: 4, font: '8pt' };
  if (n <= 20) return { h: 3.4, font: '7pt' };
  if (n <= 24) return { h: 2.9, font: '6pt' };
  return { h: 2.4, font: '5pt' };
};

const cell = { padding: '0 1mm', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

/** Bobbin table: S.No | Colour | Fiber ID | Length (m). */
export const BoxLabelTable = ({ bobbins = [] }) => {
  if (bobbins.length === 0) {
    return (
      <div style={{ ...sans, fontSize: '9pt', fontWeight: 700, textAlign: 'center', padding: '4mm 0' }}>
        No bobbins
      </div>
    );
  }

  const shown = bobbins.slice(0, BOX_LABEL_MAX_ROWS);
  const hidden = bobbins.length - shown.length;
  const { h, font } = rowTier(shown.length);

  return (
    <table style={{ ...sans, width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: font }}>
      <colgroup>
        <col style={{ width: '10%' }} />
        <col style={{ width: '28%' }} />
        <col style={{ width: '38%' }} />
        <col style={{ width: '24%' }} />
      </colgroup>
      <thead>
        <tr style={{ height: `${Math.max(h, 3.5)}mm`, borderBottom: '0.3mm solid #111', fontWeight: 700 }}>
          <th style={{ ...cell, textAlign: 'left' }}>S.No</th>
          <th style={{ ...cell, textAlign: 'left' }}>Colour</th>
          <th style={{ ...cell, textAlign: 'left' }}>Fiber ID</th>
          <th style={{ ...cell, textAlign: 'right' }}>Length (m)</th>
        </tr>
      </thead>
      <tbody>
        {shown.map((b, i) => (
          <tr key={`${b.fid}-${i}`} style={{ height: `${h}mm`, fontWeight: 700 }}>
            <td style={cell}>{i + 1}</td>
            <td style={{ ...cell, textTransform: 'uppercase' }}>{dash(b.color)}</td>
            <td style={{ ...cell, ...mono }}>{dash(b.fid)}</td>
            <td style={{ ...cell, textAlign: 'right' }}>{fmtNum(b.length)}</td>
          </tr>
        ))}
        {hidden > 0 && (
          <tr style={{ height: `${h}mm` }}>
            <td colSpan={4} style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>
              + {hidden} more not shown
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

/** One box label (100 x 150 mm). */
export const BoxLabelCard = (d) => {
  const bobbins = Array.isArray(d.bobbin_details) ? d.bobbin_details : [];
  const totalCount = bobbins.length;
  const totalLength = bobbins.reduce((sum, b) => sum + (Number(b.length) || 0), 0);

  // Two barcodes: the box number, and the total number of bobbins in the box.
  const boxBarcode = renderBarcodeDataUrl(d.box_no, { bcid: 'code128', height: 10, scale: 3 });
  const countBarcode = renderBarcodeDataUrl(totalCount, { bcid: 'code128', height: 8, scale: 3 });
  // Total length barcode: plain number (no thousands commas), rounded to kill float noise.
  const lengthValue = String(Number(totalLength.toFixed(2)));
  const lengthBarcode = renderBarcodeDataUrl(lengthValue, { bcid: 'code128', height: 8, scale: 3 });

  const small = { fontSize: '6.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2mm' };

  return (
    <div
      style={{
        ...sans,
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        background: '#fff',
        padding: '4mm',
        display: 'flex',
        flexDirection: 'column',
        gap: '2mm',
        overflow: 'hidden',
      }}
    >
      {/* Customer */}
      <div
        style={{
          fontSize: '13pt',
          fontWeight: 700,
          textAlign: 'center',
          textTransform: 'uppercase',
          lineHeight: 1.1,
          paddingBottom: '1.5mm',
          borderBottom: '0.5mm solid #111',
        }}
      >
        {COMPANY_NAME}
      </div>

      {/* Product */}
      <div style={{ lineHeight: 1.15 }}>
        <span style={small}>Product: </span>
        <span style={{ fontSize: '10pt', fontWeight: 700 }}>{dash(d.product)}</span>
      </div>

      {/* Box no + barcode */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '3mm' }}>
        <div style={{ minWidth: 0 }}>
          <div style={small}>Box No</div>
          <div style={{ fontSize: '20pt', fontWeight: 700, lineHeight: 1.05 }}>{dash(d.box_no)}</div>
          <div style={{ fontSize: '6.5pt', marginTop: '0.5mm' }}>
            PO: {dash(d.packing_order)} &nbsp;|&nbsp; Stack: {dash(d.stack_no)}
          </div>
        </div>
        {boxBarcode && (
          <img
            src={boxBarcode}
            alt={`Box ${d.box_no} barcode`}
            style={{ width: '48mm', height: '13mm', objectFit: 'fill', flexShrink: 0 }}
          />
        )}
      </div>

      {/* Bobbin table */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', borderTop: '0.3mm solid #111', paddingTop: '1mm' }}>
        <BoxLabelTable bobbins={bobbins} />
      </div>

      {/* Footer: totals */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '3mm',
          borderTop: '0.5mm solid #111',
          paddingTop: '1.5mm',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3mm' }}>
          <div>
            <div style={small}>Total Bobbins</div>
            <div style={{ fontSize: '16pt', fontWeight: 700, lineHeight: 1.05 }}>{totalCount}</div>
          </div>
          {countBarcode && (
            <img
              src={countBarcode}
              alt={`Total bobbins ${totalCount} barcode`}
              style={{ width: '24mm', height: '9mm', objectFit: 'fill' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={small}>Total Length (m)</div>
          <div style={{ fontSize: '16pt', fontWeight: 700, lineHeight: 1.05 }}>{fmtNum(totalLength)}</div>
          {lengthBarcode && (
            <img
              src={lengthBarcode}
              alt={`Total length ${lengthValue} barcode`}
              style={{ width: '36mm', height: '9mm', objectFit: 'fill', marginTop: '0.5mm' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

registerTemplate({
  key: 'box',
  name: 'Box Sticker (100×150mm)',
  size: { width: 100, height: 150, unit: 'mm' },
  // Sample data (used by the playground only; real prints pass full objects).
  defaults: {
    customer_name: 'ABC Telecom',
    product: 'Single Mode Optical Fiber (G.652.D)',
    box_no: 22113124,
    packing_order: 'PO-1001',
    stack_no: 1,
    bobbin_details: [
      { fid: 'SGE3656236', color: 'Natural', length: 16800 },
      { fid: 'SGE3635544', color: 'Natural', length: 16800 },
      { fid: 'SGE3635400', color: 'Natural', length: 16800 },
      { fid: 'SGE3612828', color: 'Natural', length: 16800 },
    ],
  },
  fields: [],
  render: BoxLabelCard,
});
