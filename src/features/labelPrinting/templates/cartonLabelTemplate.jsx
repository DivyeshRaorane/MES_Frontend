import { registerTemplate } from '../core/templateRegistry';
import { renderBarcodeDataUrl } from '../services/barcode.service';

/*
 * Template 3 — Carton / Shipping label (starter).
 * Uses a 2D QR code instead of a 1D barcode, to demonstrate that the engine
 * handles any symbology. Refine fields/layout for your real carton label.
 */

const CartonLabel = (d) => {
  const qr = renderBarcodeDataUrl(d.cartonId, { bcid: 'qrcode', scale: 4 });

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
        border: '2px solid #111',
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' }}>{d.title}</div>

      <div style={{ display: 'flex', gap: '4mm', marginTop: '3mm', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm', fontSize: '11px', flex: 1 }}>
          <div><strong>Carton:</strong> {d.cartonId}</div>
          <div><strong>PO:</strong> {d.poNumber}</div>
          <div><strong>Qty:</strong> {d.quantity} {d.unit}</div>
          <div><strong>Gross Wt:</strong> {d.grossWeight} kg</div>
          <div><strong>Destination:</strong></div>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>{d.destination}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {qr && <img src={qr} alt="carton qr" style={{ width: '28mm', height: '28mm' }} />}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #111', paddingTop: '2mm', fontSize: '10px', textAlign: 'center' }}>
        {d.footer}
      </div>
    </div>
  );
};

registerTemplate({
  key: 'carton',
  name: 'Carton / Shipping Label',
  size: { width: 100, height: 100, unit: 'mm' },
  defaults: {
    title: 'Shipping Carton',
    cartonId: 'CTN-2026-0001',
    poNumber: 'PO-998877',
    quantity: 4,
    unit: 'spools',
    grossWeight: 120,
    destination: 'Warehouse 7, Pune, IN',
    footer: 'MES Fiber Optics — Handle With Care',
  },
  fields: [
    { name: 'title', label: 'Title' },
    { name: 'cartonId', label: 'Carton ID' },
    { name: 'poNumber', label: 'PO Number' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unit', label: 'Unit' },
    { name: 'grossWeight', label: 'Gross Weight (kg)', type: 'number' },
    { name: 'destination', label: 'Destination' },
    { name: 'footer', label: 'Footer' },
  ],
  render: CartonLabel,
});
