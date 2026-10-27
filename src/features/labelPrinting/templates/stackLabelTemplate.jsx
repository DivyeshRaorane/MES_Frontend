import { registerTemplate } from '../core/templateRegistry';

/*
 * Stack sticker — 150 x 150 mm. No barcodes, one fixed layout.
 *
 * Data (one object per bobbin, straight from POST /stack/labels):
 *   bobbin_no, packing_order, customer_name, cust_address
 *
 * Layout (top → bottom):
 *   CONSIGNEE heading, customer_name, then cust_address (line breaks preserved)
 *     — when there is no address, only the customer name is shown
 *   ... free space ...
 *   MANUFACTURING UNIT + fixed company address (pinned to the bottom)
 *
 * Everything is inline-styled in mm/pt because the print iframe has no app CSS.
 */

/** Fixed manufacturing unit block, printed on every stack label. */
const MANUFACTURING_UNIT = {
  name: 'West Coast Optilinks (A Division of West Coast Paper Mills Ltd)',
  address: 'Plot No. S-9B & S-9C, E-City Raviryala, Maheshwaram, Telangana 501359 (INDIA)',
  email: 'sales@westcoastoptilinks.com',
  website: 'www.westcoastoptilinks.com',
};

const sans = { fontFamily: 'Arial, Helvetica, sans-serif', color: '#111' };

const StackLabelCard = (d) => {
  const name = String(d.customer_name ?? '').trim();
  const address = String(d.cust_address ?? '').trim();

  return (
    <div
      style={{
        ...sans,
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        background: '#fff',
        padding: '8mm',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Consignee (top): name, then address when one exists */}
      <div style={{ overflowWrap: 'anywhere' }}>
        <div style={{ fontSize: '10pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2mm' }}>
          Consignee
        </div>
        <div style={{ fontSize: '16pt', fontWeight: 700, lineHeight: 1.3 }}>
          {name || '-'}
        </div>
        {address && (
          <div
            style={{
              fontSize: '16pt',
              fontWeight: 700,
              lineHeight: 1.3,
              whiteSpace: 'pre-line', // keep the line breaks stored in cust_address
            }}
          >
            {address}
          </div>
        )}
      </div>

      {/* Manufacturing unit (fixed) — pinned to the bottom of the label */}
      <div style={{ fontSize: '10pt', lineHeight: 1.35, marginTop: 'auto', paddingTop: '4mm' }}>
        <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2mm' }}>
          Manufacturing Unit
        </div>
        <div style={{ fontWeight: 700 }}>{MANUFACTURING_UNIT.name}</div>
        <div>{MANUFACTURING_UNIT.address}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '10mm' }}>
          <span>Email: {MANUFACTURING_UNIT.email}</span>
          <span>Website: {MANUFACTURING_UNIT.website}</span>
        </div>
      </div>
    </div>
  );
};

registerTemplate({
  key: 'stack',
  name: 'Stack Sticker (150×150mm)',
  size: { width: 150, height: 150, unit: 'mm' },
  // Sample data (used by the playground only; real prints pass full objects).
  defaults: {
    bobbin_no: 'SGE3656236',
    packing_order: 'PO-1001',
    customer_name: 'ABC Telecom',
    cust_address: 'ABC Telecom Pvt Ltd\n12, Industrial Area, Phase 2\nMumbai, Maharashtra 400001\nINDIA',
  },
  fields: [],
  render: StackLabelCard,
});
