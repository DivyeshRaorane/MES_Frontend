import { registerTemplate } from '../core/templateRegistry';
import { renderBarcodeDataUrl } from '../services/barcode.service';

/*
 * Template 2 — Spool / Reel label (starter).
 * A cleaner white label with a single prominent barcode. Refine the layout
 * and fields to your real spool sticker whenever you're ready.
 */

const SpoolLabel = (d) => {
  const barcode = renderBarcodeDataUrl(d.spoolId, { bcid: 'code128', height: 12, scale: 3, includetext: true });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        color: '#111',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: '5mm',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #111',
      }}
    >
      <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid #111', paddingBottom: '2mm' }}>
        {d.company}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5mm', fontSize: '11px', marginTop: '3mm', flex: 1 }}>
        <Row label="Product" value={d.product} />
        <Row label="Spool ID" value={d.spoolId} />
        <Row label="Batch" value={d.batch} />
        <Row label="Length" value={`${d.length} ${d.lengthUnit}`} />
        <Row label="Date" value={d.date} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2mm' }}>
        {barcode && <img src={barcode} alt="spool barcode" style={{ height: '16mm' }} />}
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ fontWeight: 700 }}>{label}</span>
    <span>{value}</span>
  </div>
);

registerTemplate({
  key: 'spool',
  name: 'Spool / Reel Label',
  size: { width: 100, height: 75, unit: 'mm' },
  defaults: {
    company: 'MES Fiber Optics',
    product: 'Single Mode Fiber',
    spoolId: 'SPL-2026-0001',
    batch: 'B-4471',
    length: 25000,
    lengthUnit: 'mtrs',
    date: new Date().toISOString().split('T')[0],
  },
  fields: [
    { name: 'company', label: 'Company' },
    { name: 'product', label: 'Product' },
    { name: 'spoolId', label: 'Spool ID' },
    { name: 'batch', label: 'Batch' },
    { name: 'length', label: 'Length', type: 'number' },
    { name: 'lengthUnit', label: 'Length Unit' },
    { name: 'date', label: 'Date', type: 'date' },
  ],
  render: SpoolLabel,
});
