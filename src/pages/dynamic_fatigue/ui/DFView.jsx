import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { showError } from '../../../utils/toastService';
import { getDfEntryById } from '../services/dfEntryService';

const SPEEDS = ['0.5', '5', '50', '500'];
const FIBER_TYPES = ['Unaged Fiber', 'Aged Fiber'];

const DFView = ({ entryId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Unaged Fiber');
  const printRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDfEntryById(entryId);
        if (res?.success) setData(res.data);
        else showError('Failed to load');
      } catch (e) { showError(`Failed: ${e?.message}`); }
      setLoading(false);
    })();
  }, [entryId]);

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Dynamic Fatigue Report</title>
      <style>body{font-family:Arial,sans-serif;padding:15px;font-size:10px;}table{width:100%;border-collapse:collapse;margin-top:6px;}th,td{border:1px solid #333;padding:2px 4px;text-align:center;}th{background:#e2e8f0;font-size:9px;}.header{text-align:center;font-size:14px;font-weight:bold;margin-bottom:8px;}.type-header{background:#ffff00;font-weight:bold;font-size:12px;text-align:center;padding:5px;}@media print{body{margin:0;}}</style>
      </head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">Loading...</span></div>;
  if (!data) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">No data</span></div>;

  const m = data.master || {};
  const speeds = data.speeds || [];

  // Group by fiber_type then speed
  const grouped = {};
  FIBER_TYPES.forEach(ft => { grouped[ft] = {}; SPEEDS.forEach(s => { grouped[ft][s] = []; }); });
  speeds.forEach(r => {
    const ft = r.fiber_type || 'Unaged Fiber';
    const sp = String(r.speed);
    if (grouped[ft]?.[sp]) grouped[ft][sp].push(r);
  });

  const renderTable = (fiberType) => (
    <div>
      <p className="type-header" style={{ background: '#ffff00', fontWeight: 'bold', fontSize: 12, textAlign: 'center', padding: 5, margin: '10px 0 5px' }}>{fiberType}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#cbd5e1' }}>
            <th style={{ border: '1px solid #333', padding: '3px' }}>Speed (m/min)</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>T.S (Kg)</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>Ext (mm)</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>Gpa</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>Time(min)</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>Stress Rate</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>Ln (Stress rate)</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>Ln(Stress)</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>SLOPE</th>
            <th style={{ border: '1px solid #333', padding: '3px' }}>N-VALUE</th>
          </tr>
        </thead>
        <tbody>
          {SPEEDS.map(sp => {
            const rows = grouped[fiberType]?.[sp] || [];
            return rows.map((r, ri) => (
              <tr key={`${sp}-${ri}`}>
                {ri === 0 && <td style={{ border: '1px solid #333', padding: '3px', fontWeight: 'bold', verticalAlign: 'middle' }} rowSpan={rows.length}>{sp} mm/min</td>}
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.ts_kg ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.ext_mm ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.gpa ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.time_min ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.stress_rate ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.ln_stress_rate ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.ln_stress ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px' }}>{r.slope ?? ''}</td>
                <td style={{ border: '1px solid #333', padding: '2px', background: r.n_value ? '#90EE90' : '' }}>{r.n_value ?? ''}</td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-emerald-600 hover:text-emerald-800"><ArrowLeft size={14} /></button>
            <span className="text-[11px] font-bold text-slate-700 uppercase">Dynamic Fatigue Report — {m.bobbin_no}</span>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900">
            <Printer size={12} /> Print
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={printRef}>
          <div style={{ maxWidth: 950, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>Test Results for Fiber Dynamic Fatigue (Nd)</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #999', padding: '3px 8px', fontWeight: 'bold' }}>Sample IDs: {m.bobbin_no}</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>Format No: {m.format_no || '—'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>GR Clause No: {m.gr_clause_no || '—'}</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>{m.title || ''}</td>
                </tr>
              </tbody>
            </table>
            {renderTable('Unaged Fiber')}
            {renderTable('Aged Fiber')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DFView;
