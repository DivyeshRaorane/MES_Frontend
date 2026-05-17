import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, ChevronRight } from 'lucide-react';

/* ── Stage config ── */
const STAGES = [
  { key: 'enquiry',   label: 'Enquiry Registered' },
  { key: 'order',     label: 'Order Management'   },
  { key: 'inventory', label: 'Inventory'           },
  { key: 'dispatch',  label: 'Dispatch'            },
];

/* ── Dummy enquiry list ── */
const DUMMY_ENQUIRIES = [
  {
    ticket_no:     'ENQ-LB4X2K-A1B2',
    customer_name: 'Rahul Sharma',
    company_name:  'Precision Optics Ltd',
    product_name:  'G.652.D Single Mode Fiber',
    quantity:      '500',
    current_stage: 'dispatch',
    created_at:    '2024-05-01',
    /* stage data */
    enquiry: {
      customer_name: 'Rahul Sharma', company_name: 'Precision Optics Ltd',
      phone_number: '+91 98765 43210', email_address: 'rahul@precisionoptics.com',
      product_name: 'G.652.D Single Mode Fiber', quantity: '500',
      delivery_address: '12, Industrial Area, Mumbai - 400001',
      expected_delivery_date: '2024-06-15', remarks: 'Urgent requirement',
    },
    order: {
      order_no: 'ORD-2024-0451', quotation_amount: '₹ 4,50,000',
      approved_by: 'Manager A', order_status: 'Confirmed',
      payment_terms: '30 days net', production_status: 'In Production',
    },
    inventory: {
      stock_availability: 'Available', warehouse_location: 'WH-A Block 3',
      reserved_quantity: '500 km', inventory_notes: 'Reserved for this order',
    },
    dispatch: {
      dispatch_date: '', transporter_name: '', vehicle_number: '',
      tracking_number: '', shipment_status: 'Pending', delivery_date: '',
    },
  },
  {
    ticket_no:     'ENQ-MC5Y3L-C3D4',
    customer_name: 'Priya Mehta',
    company_name:  'Fiber Tech Inc',
    product_name:  'G.657.A1 Bend Insensitive',
    quantity:      '200',
    current_stage: 'inventory',
    created_at:    '2024-05-08',
    enquiry: {
      customer_name: 'Priya Mehta', company_name: 'Fiber Tech Inc',
      phone_number: '+91 87654 32109', email_address: 'priya@fibertech.in',
      product_name: 'G.657.A1 Bend Insensitive', quantity: '200',
      delivery_address: '45, Tech Park, Delhi - 110001',
      expected_delivery_date: '2024-06-20', remarks: '',
    },
    order: {
      order_no: 'ORD-2024-0388', quotation_amount: '₹ 1,80,000',
      approved_by: 'Manager B', order_status: 'Confirmed',
      payment_terms: '45 days net', production_status: 'Completed',
    },
    inventory: {
      stock_availability: '', warehouse_location: '', reserved_quantity: '', inventory_notes: '',
    },
    dispatch: {
      dispatch_date: '', transporter_name: '', vehicle_number: '',
      tracking_number: '', shipment_status: '', delivery_date: '',
    },
  },
  {
    ticket_no:     'ENQ-ND6Z4M-E5F6',
    customer_name: 'Amit Verma',
    company_name:  'Global Cables Co',
    product_name:  'G.654.E Ultra Low Loss',
    quantity:      '1000',
    current_stage: 'order',
    created_at:    '2024-05-12',
    enquiry: {
      customer_name: 'Amit Verma', company_name: 'Global Cables Co',
      phone_number: '+91 76543 21098', email_address: 'amit@globalcables.com',
      product_name: 'G.654.E Ultra Low Loss', quantity: '1000',
      delivery_address: '78, Export Zone, Chennai - 600001',
      expected_delivery_date: '2024-07-01', remarks: 'Bulk order',
    },
    order: {
      order_no: '', quotation_amount: '', approved_by: '',
      order_status: '', payment_terms: '', production_status: '',
    },
    inventory: {
      stock_availability: '', warehouse_location: '', reserved_quantity: '', inventory_notes: '',
    },
    dispatch: {
      dispatch_date: '', transporter_name: '', vehicle_number: '',
      tracking_number: '', shipment_status: '', delivery_date: '',
    },
  },
  {
    ticket_no:     'ENQ-OE7A5N-G7H8',
    customer_name: 'Sunita Rao',
    company_name:  'TeleNet Solutions',
    product_name:  'G.651 Multimode 50/125',
    quantity:      '300',
    current_stage: 'enquiry',
    created_at:    '2024-05-15',
    enquiry: {
      customer_name: 'Sunita Rao', company_name: 'TeleNet Solutions',
      phone_number: '+91 65432 10987', email_address: 'sunita@telenet.in',
      product_name: 'G.651 Multimode 50/125', quantity: '300',
      delivery_address: '22, IT Hub, Hyderabad - 500001',
      expected_delivery_date: '2024-06-30', remarks: 'Standard delivery',
    },
    order: { order_no: '', quotation_amount: '', approved_by: '', order_status: '', payment_terms: '', production_status: '' },
    inventory: { stock_availability: '', warehouse_location: '', reserved_quantity: '', inventory_notes: '' },
    dispatch: { dispatch_date: '', transporter_name: '', vehicle_number: '', tracking_number: '', shipment_status: '', delivery_date: '' },
  },
];

/* ── Stage badge ── */
const StageBadge = ({ stage }) => {
  const idx = STAGES.findIndex(s => s.key === stage);
  const colors = ['bg-slate-100 text-slate-600','bg-blue-100 text-blue-700','bg-amber-100 text-amber-700','bg-emerald-100 text-emerald-700'];
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors[idx] || colors[0]}`}>
      {STAGES[idx]?.label || stage}
    </span>
  );
};

/* ── Progress mini-bar ── */
const MiniProgress = ({ stage }) => {
  const idx = STAGES.findIndex(s => s.key === stage);
  return (
    <div className="flex gap-0.5 items-center">
      {STAGES.map((s, i) => (
        <div key={s.key} className={`h-1.5 rounded-full transition-all ${
          i <= idx ? 'bg-blue-500' : 'bg-slate-200'
        }`} style={{ width: i <= idx ? '18px' : '10px' }} />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
const CustomerEnquiryList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = DUMMY_ENQUIRIES.filter(e =>
    e.ticket_no.toLowerCase().includes(search.toLowerCase()) ||
    e.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    e.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (enquiry) => {
    /* Find the first incomplete stage to jump to */
    const pendingIdx = STAGES.findIndex(s => {
      const data = enquiry[s.key];
      return Object.values(data).every(v => !v);
    });
    const jumpStage = pendingIdx === -1 ? STAGES.length - 1 : pendingIdx;
    navigate('/order/enquiryform', { state: { enquiry, jumpStage } });
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Action bar ── */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Customer Enquiry List</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{DUMMY_ENQUIRIES.length}</span>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search ticket, customer, company..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-64" />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Ticket No','Customer Name','Company','Product','Qty (km)','Progress','Current Stage','Created',''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">No enquiries found</td></tr>
              ) : filtered.map((e, idx) => (
                <tr key={idx} onClick={() => handleRowClick(e)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
                  <td className="px-3 py-2.5 border-r border-slate-100">
                    <span className="text-xs font-mono font-bold text-blue-700 group-hover:underline">{e.ticket_no}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 border-r border-slate-100">{e.customer_name}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 border-r border-slate-100">{e.company_name}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-600 border-r border-slate-100">{e.product_name}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-600 border-r border-slate-100">{e.quantity}</td>
                  <td className="px-3 py-2.5 border-r border-slate-100"><MiniProgress stage={e.current_stage} /></td>
                  <td className="px-3 py-2.5 border-r border-slate-100"><StageBadge stage={e.current_stage} /></td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 border-r border-slate-100">{e.created_at}</td>
                  <td className="px-3 py-2.5 text-center">
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Footer hint ── */}
        <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
          <p className="text-[8px] text-slate-400">Click any row to open the enquiry workflow and continue from the pending stage</p>
        </div>

      </div>
    </div>
  );
};

export default CustomerEnquiryList;
