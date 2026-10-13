import { registerTemplate } from '../core/templateRegistry';
import { renderBarcodeDataUrl } from '../services/barcode.service';

/*
 * Template 1 — Single Mode Optical Fiber label (yellow spool sticker).
 * Reproduces the physical label: title, colour + standard, two Code128
 * barcodes (Fibre ID + Billed Length) with human-readable values, and an
 * attenuation / parameter block.
 */

const mono = {
  fontFamily: "'Courier New', Courier, monospace",
  color: '#111',
};

const FiberLabel = (d) => {
  const idBarcode = renderBarcodeDataUrl(d.fibreId, { bcid: 'code128', height: 9, scale: 2 });
  const lenBarcode = renderBarcodeDataUrl(String(d.billedLength), { bcid: 'code128', height: 9, scale: 2 });

  return (
    <div
      style={{
        ...mono,
        width: '100%',
        height: '100%',
        background: d.background || '#FFD400',
        padding: '5mm 6mm',
        display: 'flex',
        flexDirection: 'column',
        gap: '2mm',
        fontWeight: 700,
      }}
    >
      {/* Title */}
      <div style={{ fontSize: '15px', letterSpacing: '1px' }}>{d.title}</div>

      {/* Colour + Standard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <span>{d.color}</span>
        <span style={{ marginRight: '8mm' }}>{d.standard}</span>
      </div>

      {/* Fibre ID + barcode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3mm' }}>
        <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>FIBRE ID</span>
        {idBarcode && <img src={idBarcode} alt="fibre id barcode" style={{ height: '9mm', flex: 1, objectFit: 'fill' }} />}
      </div>
      <div style={{ fontSize: '20px', textAlign: 'center', letterSpacing: '1px', marginTop: '-1mm' }}>
        {d.fibreId}
      </div>

      {/* Billed length + barcode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3mm' }}>
        <span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>BILLED LENGTH</span>
        {lenBarcode && <img src={lenBarcode} alt="billed length barcode" style={{ height: '9mm', flex: 1, objectFit: 'fill' }} />}
      </div>
      <div style={{ fontSize: '20px', textAlign: 'center', marginTop: '-1mm' }}>
        {d.billedLength} <span style={{ fontSize: '12px' }}>{d.lengthUnit}</span>
      </div>

      {/* Parameter block */}
      <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '1.5mm', marginTop: '1mm' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>ATTN1310nm:{d.attn1310} dB/Km</span>
          <span>MFD   :{d.mfd} um</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>ATTN1550nm:{d.attn1550} dB/Km</span>
          <span>CUTOFF:{d.cutoff} nm</span>
        </div>
        <div>ATTN1383nm:{d.attn1383} dB/Km</div>
      </div>
    </div>
  );
};

registerTemplate({
  key: 'fiber',
  name: 'Single Mode Optical Fiber',
  size: { width: 100, height: 75, unit: 'mm' },
  defaults: {
    title: 'Single Mode Optical Fiber',
    color: 'NATURAL',
    standard: 'ITU-T G.652.D',
    fibreId: 'SYE0706853,DA',
    billedLength: 50400,
    lengthUnit: 'mtrs',
    attn1310: '0.325',
    attn1550: '0.184',
    attn1383: '0.328',
    mfd: '8.97',
    cutoff: '1276',
    background: '#FFD400',
  },
  fields: [
    { name: 'title', label: 'Title' },
    { name: 'color', label: 'Colour' },
    { name: 'standard', label: 'Standard' },
    { name: 'fibreId', label: 'Fibre ID' },
    { name: 'billedLength', label: 'Billed Length', type: 'number' },
    { name: 'lengthUnit', label: 'Length Unit' },
    { name: 'attn1310', label: 'ATTN 1310nm' },
    { name: 'attn1550', label: 'ATTN 1550nm' },
    { name: 'attn1383', label: 'ATTN 1383nm' },
    { name: 'mfd', label: 'MFD (um)' },
    { name: 'cutoff', label: 'Cutoff (nm)' },
  ],
  render: FiberLabel,
});
