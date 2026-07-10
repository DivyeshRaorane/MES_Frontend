import React, { useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ── Dummy data ── */
const COMPLAINTS = [
  {
    id: 'CP00000001',
    name: 'Avik Kumar Mridha',
    regDate: '2021-12-01',
    status: 'Close',
    closeDate: '2021-12-02',
    age: 1,
    /* closure pre-fill data */
    complaint_no:             'CP00000001',
    date_of_closure:          '2021-12-02',
    complaint_closed_by:      'Quality Manager',
    capa_report_no:           'CAPA-001',
    closure_remark:           'Issue resolved after inspection.',
    raised_by:                'Sales',
    name_customer_vendor:     'Vendor A',
    date_of_complaint:        '2021-12-01',
    date_reporting_complaint: '2021-12-01',
    complaint_type:           'Product Performance',
    product_details:          'Fiber spool batch #221',
    purchase_order_no:        'PO-9901',
    po_qty:                   '500',
    reject_qty:               '12',
    shipment_date:            '2021-11-28',
    grn_no:                   'GRN-441',
    test_certificate_no:      'TC-2021-001',
    complaint_feedback:       'Customer reported attenuation out of spec.',
  },
  {
    id: 'CP00000002',
    name: 'Super Admin',
    regDate: '2023-03-09',
    status: 'Open',
    closeDate: '',
    age: 449,
    complaint_no:             'CP00000002',
    date_of_closure:          '',
    complaint_closed_by:      '',
    capa_report_no:           '',
    closure_remark:           '',
    raised_by:                'Quality',
    name_customer_vendor:     'Customer X',
    date_of_complaint:        '2023-03-09',
    date_reporting_complaint: '2023-03-10',
    complaint_type:           'Delivery',
    product_details:          'Batch #330 delayed',
    purchase_order_no:        'PO-1102',
    po_qty:                   '1000',
    reject_qty:               '0',
    shipment_date:            '2023-03-05',
    grn_no:                   'GRN-882',
    test_certificate_no:      'TC-2023-002',
    complaint_feedback:       'Delivery was 4 days late.',
  },
  {
    id: 'CP00000003',
    name: 'Prudvi Aamuru',
    regDate: '2023-04-25',
    status: 'Open',
    closeDate: '',
    age: 402,
    complaint_no:             'CP00000003',
    date_of_closure:          '',
    complaint_closed_by:      '',
    capa_report_no:           '',
    closure_remark:           '',
    raised_by:                'Production',
    name_customer_vendor:     'Vendor B',
    date_of_complaint:        '2023-04-25',
    date_reporting_complaint: '2023-04-26',
    complaint_type:           'Packaging',
    product_details:          'Damaged outer box',
    purchase_order_no:        'PO-2203',
    po_qty:                   '200',
    reject_qty:               '5',
    shipment_date:            '2023-04-20',
    grn_no:                   'GRN-993',
    test_certificate_no:      'TC-2023-003',
    complaint_feedback:       'Packaging was torn on arrival.',
  },
  {
    id: 'CP00000004',
    name: 'Mastanvali Shaik',
    regDate: '2023-12-18',
    status: 'Open',
    closeDate: '',
    age: 155,
    complaint_no:             'CP00000004',
    date_of_closure:          '',
    complaint_closed_by:      '',
    capa_report_no:           '',
    closure_remark:           '',
    raised_by:                'Customer',
    name_customer_vendor:     'Customer Y',
    date_of_complaint:        '2023-12-18',
    date_reporting_complaint: '2023-12-19',
    complaint_type:           'Documentation',
    product_details:          'Missing test certificate',
    purchase_order_no:        'PO-3304',
    po_qty:                   '750',
    reject_qty:               '0',
    shipment_date:            '2023-12-15',
    grn_no:                   'GRN-1104',
    test_certificate_no:      '',
    complaint_feedback:       'Test certificate not included in shipment.',
  },
];

/* ══════════════════════════════════════════════════════════ */
const ComplaintStatusMonitor = () => {
  const navigate   = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = COMPLAINTS.filter(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const total    = COMPLAINTS.length;
  const resolved = COMPLAINTS.filter(c => c.status === 'Close').length;
  const open     = COMPLAINTS.filter(c => c.status === 'Open').length;

  const handleRowClick = (complaint) => {
    navigate('/customer/complaintclosure', { state: { complaint } });
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Action bar ── */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-slate-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Complaint Status</span>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-52"
            />
          </div>
        </div>

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-3 gap-2 px-4 py-2 flex-shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
            <ClipboardList size={14} className="text-indigo-600" />
            <div>
              <p className="text-[8px] font-bold text-indigo-400 uppercase">Total</p>
              <p className="text-sm font-black text-indigo-700">{total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <div>
              <p className="text-[8px] font-bold text-emerald-400 uppercase">Resolved</p>
              <p className="text-sm font-black text-emerald-700">{resolved}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 rounded-lg px-3 py-2">
            <AlertCircle size={14} className="text-rose-600" />
            <div>
              <p className="text-[8px] font-bold text-rose-400 uppercase">Open</p>
              <p className="text-sm font-black text-rose-700">{open}</p>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Complaint No','Customer / Vendor Name','Date of Registration','Status','Date of Closure','Age (Days)'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap border-r border-slate-700 last:border-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">
                    No complaints match &quot;{search}&quot;
                  </td>
                </tr>
              ) : filtered.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  title="Click to open Complaint Closure"
                >
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className="text-xs font-bold text-indigo-600 group-hover:underline">{item.id}</span>
                  </td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 flex-shrink-0">
                        {item.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 border-r border-slate-100">{item.regDate}</td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      item.status === 'Close'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 border-r border-slate-100">{item.closeDate || '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className={item.age > 100 ? 'text-rose-500' : 'text-slate-400'} />
                      <span className={`text-xs font-bold ${item.age > 100 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.age}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Footer hint ── */}
        <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
          <p className="text-[8px] text-slate-400 font-medium">
            Click any row to open Complaint Closure with pre-filled data
          </p>
        </div>

      </div>
    </div>
  );
};

export default ComplaintStatusMonitor;
