import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Package, Loader2, Search, Plus, Eye, ArrowLeft } from 'lucide-react';
import { ModuleCard } from './common_fields';
import { SubmitButton, ResetButton } from './common_buttons';
import { showSuccess, showError } from '../utils/toastService';
import { getPackingOrders, loadTCData, saveTC, getAllTCs, getTCById } from '../pages/tc_generation/services/tc_generation.api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/* ── Spec sections ── */
const SPEC_SECTIONS = [
  { title: 'Macro Bend Loss', rows: [
    { label: '1 Turn, 10 mm Radius', key: 'mb_1turn', default: '≤0.75 dB at 1550\n≤1.5 dB at 1625' },
    { label: '10 Turn, 15 mm Radius', key: 'mb_10turn', default: '≤0.25 dB at 1550\n≤1.0 dB at 1625' },
  ]},
  { title: 'Mechanical Characteristics', rows: [
    { label: 'Proof Test Levels', key: 'mech_proof', default: '≥ 100 kpsi (0.69 GPa) or 1% strain' },
    { label: 'Coating strip force', key: 'mech_coat', default: '≥ 1.3 N and 5.0 N' },
    { label: 'Tensile Strength - Aged (Median)', key: 'mech_aged', default: '≥ 3.03 GPa' },
    { label: 'Tensile Strength - Un Aged (Median)', key: 'mech_unaged', default: '≥ 3.80 GPa' },
  ]},
  { title: 'Environmental Characteristics', rows: [
    { label: 'Temperature dependence -60°C to +85°C', key: 'env_temp', default: '≤ 0.05 dB/km' },
    { label: 'Temperature humidity cycling -10°C to +85°C', key: 'env_thc', default: '≤ 0.05 dB/km' },
    { label: 'High temp humidity aging 85°C/85% RH', key: 'env_htha', default: '≤ 0.05 dB/km' },
    { label: 'Water immersion 30 days', key: 'env_water', default: '≤ 0.05 dB/km' },
    { label: 'Accelerated aging 85°C 30 days', key: 'env_accel', default: '≤ 0.05 dB/km' },
  ]},
  { title: 'Other Performance Characteristics', rows: [
    { label: 'Effective group index of refraction', key: 'opc_egir', default: '1.4670 at 1310\n1.4675 at 1550\n1.4680 at 1625' },
    { label: 'Attenuation 1285-1330 nm ref 1310', key: 'opc_attn1', default: '≤ 0.03 dB/km' },
    { label: 'Attenuation 1525-1575 nm ref 1550', key: 'opc_attn2', default: '≤ 0.02 dB/km' },
    { label: 'Point discontinuities at 1310 & 1550', key: 'opc_pd', default: '≤ 0.05 dB' },
    { label: 'Dynamic fatigue parameter (Nd)', key: 'opc_nd', default: '≥ 20' },
  ]},
];

const FIBER_COLS = [
  { key: 'bobbin_no', label: 'Bobbin No' }, { key: 'bobbin_fid', label: 'FID' },
  { key: 'box_no', label: 'Box' }, { key: 'stack_no', label: 'Stack' },
  { key: 'length_km', label: 'Length (KM)' }, { key: 'product_type', label: 'Product' },
  { key: 'avg_lsa_atn_1310', label: 'ATN 1310' }, { key: 'avg_lsa_atn_1550', label: 'ATN 1550' },
  { key: 'avg_lsa_atn_1625', label: 'ATN 1625' }, { key: 'avg_lsa_atn_1383', label: 'ATN 1383' },
  { key: 'mfd_1310_top', label: 'MFD 1310' }, { key: 'mfd_1550_top', label: 'MFD 1550' },
  { key: 'cut_off_top', label: 'Cutoff' }, { key: 'cable_cut_off', label: 'Cable Cutoff' },
  { key: 'mac_value', label: 'MAC' }, { key: 'zero_disp_wave', label: 'ZDW' },
  { key: 'disp_1550', label: 'Disp 1550' }, { key: 'pmd_1550', label: 'PMD' },
  { key: 'clad_dia_top', label: 'Clad Dia' }, { key: 'fiber_curl_top', label: 'Curl' },
  { key: 'final_grade', label: 'Grade' },
];

const exportExcel = (rows, orderNo, header) => {
  if (!rows || rows.length === 0) return;
  const wb = XLSX.utils.book_new();

  // Sheet 1: TC Header + Specs
  const headerData = [
    ['TEST CERTIFICATE'],
    [],
    ['TC Number', header?.tc_number || ''],
    ['Packing Order', header?.packing_order || orderNo || ''],
    ['TC Date', header?.tc_date?.split('T')[0] || ''],
    ['Customer Reference', header?.customer_ref || ''],
    ['Inspection Date', header?.inspection_date?.split('T')[0] || ''],
    ['Inspection By', header?.inspection_by || ''],
    ['Approved By', header?.approved_by || ''],
    ['Revision', header?.revision || ''],
    ['Version', header?.version || ''],
    ['Total KM', header?.total_km || rows.reduce((s, r) => s + (parseFloat(r.length_km) || 0), 0).toFixed(3)],
    ['Total Bobbins', header?.total_bobbins || rows.length],
    ['Remarks', header?.remarks || ''],
    [],
    ['SPECIFICATIONS'],
    [],
  ];
  SPEC_SECTIONS.forEach(section => {
    headerData.push([section.title]);
    section.rows.forEach(row => {
      headerData.push([row.label, header?.[row.key] || row.default]);
    });
    headerData.push([]);
  });
  const wsHeader = XLSX.utils.aoa_to_sheet(headerData);
  wsHeader['!cols'] = [{ wch: 45 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsHeader, 'TC Info');

  // Sheet 2: Fiber Data
  const fiberHeaders = FIBER_COLS.map(c => c.label);
  const fiberData = rows.map(r => FIBER_COLS.map(c => r[c.key] ?? r?.qc_data?.[c.key] ?? ''));
  const wsFiber = XLSX.utils.aoa_to_sheet([fiberHeaders, ...fiberData]);
  wsFiber['!cols'] = fiberHeaders.map(h => ({ wch: Math.max(h.length + 2, 12) }));
  XLSX.utils.book_append_sheet(wb, wsFiber, 'Fiber Data');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout]), `TC_${header?.tc_number || orderNo}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT — List / Create / View
   ══════════════════════════════════════════════════════════ */
const TCGenerationDashboard = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'view'
  const [viewTcId, setViewTcId] = useState(null);

  if (view === 'create') return <TCCreateForm onBack={() => setView('list')} onSaved={() => setView('list')} />;
  if (view === 'view') return <TCViewDetail tcId={viewTcId} onBack={() => setView('list')} />;
  return <TCListView onCreate={() => setView('create')} onView={(id) => { setViewTcId(id); setView('view'); }} />;
};

/* ══════════════════════════════════════════════════════════
   TC LIST VIEW
   ══════════════════════════════════════════════════════════ */
const TCListView = ({ onCreate, onView }) => {
  const [tcs, setTcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => { setLoading(true); try { const r = await getAllTCs(); setTcs(r?.data || []); } catch(e){} setLoading(false); })();
  }, []);

  const filtered = tcs.filter(t => {
    const q = search.toLowerCase();
    return !q || t.tc_number?.toLowerCase().includes(q) || t.packing_order?.toLowerCase().includes(q);
  });

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-1">
        <div className="px-3 py-1.5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shadow-sm"><FileText size={12} className="text-white" /></div>
            <h1 className="text-xs font-bold text-slate-800 leading-none">Test Certificates</h1>
            <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{tcs.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative"><Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-6 pr-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-500/20 w-36" /></div>
            <button type="button" onClick={onCreate}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[9px] font-bold rounded hover:bg-indigo-700 shadow-sm">
              <Plus size={10} /> Create TC</button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? <div className="flex items-center justify-center py-10"><Loader2 size={16} className="text-indigo-500 animate-spin" /></div> : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10"><tr>
              {['#','TC Number','Packing Order','TC Date','Total KM','Total Bobbins','Created','Actions'].map(h=>(<th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? <tr><td colSpan={8} className="px-3 py-6 text-center text-[10px] text-slate-400">No TCs found</td></tr>
              : filtered.map((tc, idx) => (
                <tr key={tc.tc_id} className="hover:bg-blue-50/30"><td className="px-2 py-1 text-[9px] font-bold text-slate-900 border-r border-slate-100">{idx+1}</td>
                  <td className="px-2 py-1 text-[10px] font-bold text-indigo-900 font-mono border-r border-slate-100">{tc.tc_number}</td>
                  <td className="px-2 py-1 text-[10px] text-slate-900 border-r border-slate-100">{tc.packing_order}</td>
                  <td className="px-2 py-1 text-[9px] text-slate-900 border-r border-slate-100">{tc.tc_date?.split('T')[0] || '—'}</td>
                  <td className="px-2 py-1 text-[10px] font-mono text-emerald-900 border-r border-slate-100">{tc.total_km ? parseFloat(tc.total_km).toFixed(3) : '—'}</td>
                  <td className="px-2 py-1 text-[10px] text-slate-900 text-center border-r border-slate-100">{tc.total_bobbins || '—'}</td>
                  <td className="px-2 py-1 text-[9px] text-slate-900 border-r border-slate-100">{tc.created_at?.split('T')[0] || '—'}</td>
                  <td className="px-2 py-1"><button onClick={() => onView(tc.tc_id)}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-bold rounded hover:bg-blue-100"><Eye size={9} /> View</button></td>
                </tr>))}
            </tbody>
          </table>)}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TC VIEW DETAIL
   ══════════════════════════════════════════════════════════ */
const TCViewDetail = ({ tcId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { try { const r = await getTCById(tcId); if (r?.success) setData(r.data); } catch(e){} setLoading(false); })();
  }, [tcId]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>;
  if (!data) return <div className="h-full flex items-center justify-center text-sm text-slate-400">TC not found</div>;

  const header = data.header || {};
  const bobbins = data.bobbins || [];
  const totalKm = bobbins.reduce((s, b) => s + (parseFloat(b.length_km) || 0), 0);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-1">
        <div className="px-3 py-1 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={10} /> Back</button>
            <FileText size={12} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-slate-900 uppercase">View TC — {header.tc_number}</span>
          </div>
          <button onClick={() => exportExcel(bobbins, header.packing_order, header)}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700"><Download size={10} /> Excel</button>
        </div>

        {/* TC Header Information - All fields */}
        <div className="px-3 py-1.5 border-b border-slate-100 flex-shrink-0">
          <p className="text-[7px] font-bold text-indigo-700 uppercase tracking-wider mb-1">TC Header Information</p>
          <div className="grid grid-cols-7 gap-x-3 gap-y-1">
            {[
              ['TC Number', header.tc_number],
              ['Packing Order', header.packing_order],
              ['TC Date', header.tc_date?.split('T')[0]],
              ['Customer Ref', header.customer_ref],
              ['Inspection Date', header.inspection_date?.split('T')[0]],
              ['Inspection By', header.inspection_by],
              ['Approved By', header.approved_by],
              ['Revision', header.revision],
              ['Version', header.version],
              ['Total KM', totalKm.toFixed(3)],
              ['Total Bobbins', bobbins.length],
              ['Remarks', header.remarks],
              ['Created At', header.created_at?.split('T')[0]],
            ].map(([l, v]) => (
              <div key={l} className="flex flex-col">
                <span className="text-[7px] font-bold text-slate-600 uppercase leading-tight">{l}</span>
                <span className="text-[10px] font-bold text-slate-900 leading-tight">{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spec Values */}
        {(header.mb_1turn || header.mech_proof || header.env_temp || header.opc_egir) && (
          <div className="px-3 py-1.5 border-b border-slate-100 flex-shrink-0 overflow-y-auto max-h-[150px]">
            <p className="text-[7px] font-bold text-blue-700 uppercase tracking-wider mb-1">Specifications</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SPEC_SECTIONS.map(section => (
                <div key={section.title} className="border border-slate-200 rounded overflow-hidden">
                  <div className="bg-blue-600 px-2 py-0.5"><span className="text-[7px] font-bold text-white uppercase">{section.title}</span></div>
                  <table className="w-full"><tbody>
                    {section.rows.map(row => (
                      <tr key={row.key} className="border-b border-slate-50 last:border-0">
                        <td className="px-1.5 py-0.5 text-[8px] text-slate-800 w-1/2 border-r border-slate-100">{row.label}</td>
                        <td className="px-1.5 py-0.5 text-[8px] text-slate-900 font-medium whitespace-pre-line">{header[row.key] || row.default}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bobbins Table */}
        <div className="flex-1 overflow-auto">
          <div className="bg-slate-50/80 px-2 py-1 border-b border-slate-200 flex items-center gap-2 sticky top-0 z-5">
            <Package size={10} className="text-blue-600" />
            <span className="font-bold text-slate-900 text-[8px] uppercase">Fiber Data</span>
            <span className="text-[7px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{bobbins.length}</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-[25px] bg-slate-800 z-10"><tr>
              {['#',...FIBER_COLS.map(c=>c.label)].map(h=>(<th key={h} className="px-1.5 py-1 text-[7px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 last:border-0">{h}</th>))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {bobbins.map((b, i) => {
                const qc = b.qc_data || {};
                return (<tr key={i} className="hover:bg-blue-50/20">
                  <td className="px-1.5 py-0.5 text-[8px] text-slate-900 font-bold border-r border-slate-100">{i+1}</td>
                  {FIBER_COLS.map(c => (<td key={c.key} className="px-1.5 py-0.5 text-[10px] font-mono text-slate-900 border-r border-slate-100 last:border-0 whitespace-nowrap">{b[c.key] ?? qc[c.key] ?? '—'}</td>))}
                </tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   TC CREATE FORM
   ══════════════════════════════════════════════════════════ */
const TCCreateForm = ({ onBack, onSaved }) => {
  const [packingOrders, setPackingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [poData, setPoData] = useState(null);
  const [fiberRows, setFiberRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPoModal, setShowPoModal] = useState(false);
  const [poSearch, setPoSearch] = useState('');
  const [tcForm, setTcForm] = useState({
    tc_number: '', tc_date: new Date().toISOString().split('T')[0],
    customer_ref: '', inspection_date: '', inspection_by: '',
    approved_by: '', remarks: '', revision: '0', version: '1.0',
  });
  const [specVals, setSpecVals] = useState(() => {
    const init = {};
    SPEC_SECTIONS.forEach(s => s.rows.forEach(r => { init[r.key] = r.default; }));
    return init;
  });

  const fetchPackingOrders = async () => {
    try { const res = await getPackingOrders(); setPackingOrders(res?.data || []); } catch(e){ showError('Failed to load orders'); }
  };

  const handleLoadPO = async (orderNo) => {
    if (!orderNo) return;
    setLoading(true); setShowPoModal(false); setSelectedOrder(orderNo);
    try {
      const res = await loadTCData(orderNo);
      if (res?.success) {
        const header = res.data?.header || res.data;
        // Block if TC already generated
        if (header.tc_generated) { showError('TC already generated for this order. Cannot create again.'); setLoading(false); setSelectedOrder(''); return; }
        setPoData(header);
        setFiberRows(res.data?.bobbins || []);
        showSuccess(`Loaded ${res.data?.bobbins?.length || 0} bobbin(s)`);
      } else { showError(res?.message || 'Failed'); }
    } catch(e) { showError(e?.response?.data?.message || 'Failed to load'); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedOrder) { showError('Load a Packing Order first'); return; }
    if (!tcForm.tc_number) { showError('TC Number is required'); return; }
    if (fiberRows.length === 0) { showError('No bobbins'); return; }
    setSaving(true);
    try {
      const payload = { packing_order: selectedOrder, ...tcForm, spec_values: specVals,
        total_km: fiberRows.reduce((s, r) => s + (parseFloat(r.length_km) || 0), 0),
        total_bobbins: fiberRows.length, bobbins: fiberRows };
      const res = await saveTC(payload);
      if (res?.success) { showSuccess('TC saved!'); onSaved(); }
      else showError(res?.message || 'Save failed');
    } catch(e) { showError(e?.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const totalKm = fiberRows.reduce((s, r) => s + (parseFloat(r.length_km) || 0), 0);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-1">
        <div className="flex flex-col flex-1 overflow-hidden px-2 py-1 gap-1">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={10} /> Back</button>
              <span className="text-[10px] font-bold text-slate-900 uppercase">Create TC</span>
            </div>
            <div className="flex gap-1.5">
              <ResetButton compact type="button" onClick={onBack}>Cancel</ResetButton>
              <SubmitButton compact type="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save TC'}</SubmitButton>
            </div>
          </div>

          {/* PO Selection + TC Form inline */}
          <div className="flex-shrink-0 flex gap-2">
            {/* PO Selection */}
            <div className="flex items-center gap-2 border border-slate-200 rounded px-2 py-1 bg-slate-50/50">
              <div className="flex flex-col gap-0.5">
                <label className="text-[7px] font-bold text-slate-700 uppercase">Order No</label>
                <input value={selectedOrder} readOnly placeholder="Load PO..."
                  className="w-32 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-900 outline-none" />
              </div>
              <button type="button" onClick={() => { fetchPackingOrders(); setShowPoModal(true); }}
                className="px-2 py-1 bg-blue-600 text-white text-[8px] font-bold rounded hover:bg-blue-700 self-end">Load PO</button>
              {fiberRows.length > 0 && (
                <button type="button" onClick={() => exportExcel(fiberRows, selectedOrder, { ...tcForm, packing_order: selectedOrder, ...specVals })}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-[8px] font-bold rounded hover:bg-emerald-700 self-end"><Download size={9} /> Excel</button>
              )}
              {poData && (
                <>
                  {[['Customer', poData.customer_name],['Req KM', poData.required_km],['Packed KM', totalKm.toFixed(3)],
                    ['Bobbins', fiberRows.length]
                  ].map(([l,v])=>(<div key={l} className="flex flex-col ml-2"><span className="text-[7px] font-bold text-slate-600 uppercase leading-tight">{l}</span><span className="text-[9px] font-bold text-slate-900 leading-tight">{v||'—'}</span></div>))}
                </>
              )}
            </div>
          </div>

          {/* TC Form */}
          {poData && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded px-2 py-1.5 flex-shrink-0">
              <p className="text-[7px] font-bold text-indigo-700 uppercase tracking-wider mb-1">TC Information</p>
              <div className="grid grid-cols-9 gap-1.5">
                {[{l:'TC Number *',k:'tc_number',p:'TR-2024-0001'},{l:'TC Date',k:'tc_date',t:'date'},{l:'Customer Ref',k:'customer_ref',p:'Ref...'},
                  {l:'Inspection Date',k:'inspection_date',t:'date'},{l:'Inspection By',k:'inspection_by',p:'Name...'},
                  {l:'Approved By',k:'approved_by',p:'Name...'},{l:'Remarks',k:'remarks',p:'...'},{l:'Revision',k:'revision'},{l:'Version',k:'version'}
                ].map(({l,k,t,p})=>(<div key={k} className="flex flex-col"><label className="text-[7px] font-bold text-slate-700 uppercase leading-tight">{l}</label>
                  <input type={t||'text'} value={tcForm[k]} onChange={e=>setTcForm(f=>({...f,[k]:e.target.value}))} placeholder={p}
                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] text-slate-900 outline-none focus:ring-1 focus:ring-blue-300" /></div>))}
              </div>
            </div>
          )}

          {/* Fiber Table */}
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '22vh' }}>
            <div className="bg-slate-50/80 px-2 py-0.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
              <Package size={10} className="text-blue-600" />
              <span className="font-bold text-slate-900 text-[8px] uppercase">Fiber Test Data</span>
              {fiberRows.length > 0 && <span className="text-[7px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{fiberRows.length}</span>}
            </div>
            <div className="overflow-auto flex-1">
              {loading ? <div className="flex items-center justify-center py-4"><Loader2 size={14} className="animate-spin text-blue-500" /></div> : (
              <table className="text-left border-collapse" style={{minWidth:'100%'}}>
                <thead className="sticky top-0 bg-slate-800 z-10"><tr>
                  {FIBER_COLS.map(c=>(<th key={c.key} className="px-1.5 py-1 text-[7px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 last:border-0 min-w-[65px]">{c.label}</th>))}
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {fiberRows.length===0 ? <tr><td colSpan={FIBER_COLS.length} className="px-3 py-4 text-center text-[9px] text-slate-400">Load a Packing Order</td></tr>
                  : fiberRows.map((row,idx)=>(<tr key={idx} className="hover:bg-blue-50/20">
                    {FIBER_COLS.map(c=>(<td key={c.key} className="px-1.5 py-0.5 text-[10px] font-mono text-slate-900 border-r border-slate-100 last:border-0 whitespace-nowrap">{row[c.key]??'—'}</td>))}
                  </tr>))}
                </tbody>
              </table>)}
            </div>
          </div>

          {/* Spec Sections - 2 column grid to save space */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1">
              {SPEC_SECTIONS.map(section=>(<div key={section.title} className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-blue-600 px-2 py-0.5"><span className="text-[8px] font-bold text-white uppercase">{section.title}</span></div>
                <table className="w-full border-collapse"><tbody>
                  {section.rows.map(row=>(<tr key={row.key} className="border-b border-slate-100 last:border-0">
                    <td className="px-1.5 py-0.5 text-[9px] text-slate-900 font-medium w-1/2 align-top whitespace-pre-line border-r border-slate-200">{row.label}</td>
                    <td className="px-1.5 py-0.5 w-1/2"><textarea value={specVals[row.key]} onChange={e=>setSpecVals(p=>({...p,[row.key]:e.target.value}))}
                      rows={specVals[row.key]?.split('\n').length||1}
                      className="w-full bg-transparent text-[9px] text-slate-900 outline-none focus:bg-slate-50 focus:ring-1 focus:ring-blue-300 rounded px-1 py-0 resize-none border border-transparent focus:border-blue-200" /></td>
                  </tr>))}
                </tbody></table>
              </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* PO Modal */}
      {showPoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] max-h-[60vh] flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-900 uppercase">Select Packing Order</span>
              <button onClick={()=>setShowPoModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">×</button>
            </div>
            <div className="px-3 py-1.5 border-b border-slate-100"><div className="relative"><Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={poSearch} onChange={e=>setPoSearch(e.target.value)} placeholder="Search..."
                className="w-full pl-6 pr-2 py-1 border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-blue-300" /></div></div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse"><thead className="sticky top-0 bg-slate-100"><tr>
                {['Order No','Customer','Required KM','TC Status','Date'].map(h=>(<th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">{h}</th>))}
              </tr></thead><tbody className="divide-y divide-slate-100">
                {packingOrders.filter(p=>!poSearch||p.order_no?.toLowerCase().includes(poSearch.toLowerCase())||p.customer_name?.toLowerCase().includes(poSearch.toLowerCase()))
                  .map(po=>(<tr key={po.order_no} onClick={()=> !po.tc_generated && handleLoadPO(po.order_no)}
                    className={`transition-colors ${po.tc_generated ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-blue-50 cursor-pointer'}`}>
                    <td className="px-2 py-1.5 text-[10px] font-bold text-blue-900">{po.order_no}</td>
                    <td className="px-2 py-1.5 text-[10px] text-slate-900">{po.customer_name}</td>
                    <td className="px-2 py-1.5 text-[10px] font-mono text-slate-900">{po.required_km}</td>
                    <td className="px-2 py-1.5">{po.tc_generated
                      ? <span className="text-[7px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Generated</span>
                      : <span className="text-[7px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Pending</span>}</td>
                    <td className="px-2 py-1.5 text-[9px] text-slate-800">{po.created_at?.split('T')[0]||'—'}</td>
                  </tr>))}
              </tbody></table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TCGenerationDashboard;
