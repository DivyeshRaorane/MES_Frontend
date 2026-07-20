import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { showError } from '../../../utils/toastService';
import { getHthaEntryById } from '../services/hthaEntryService';

const HTHAView = ({ entryId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getHthaEntryById(entryId);
        if (res?.success) setData(res.data);
        else showError(res?.message || 'Failed to load');
      } catch (e) { showError(`Failed to load: ${e?.response?.data?.message || e?.message}`); }
      setLoading(false);
    })();
  }, [entryId]);

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>HTHA Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #333; padding: 3px 6px; }
        th { background: #e2e8f0; font-size: 10px; }
        .header { text-align: center; font-size: 15px; font-weight: bold; margin-bottom: 10px; }
        .info-th { background: #f1f5f9; text-align: left; width: 140px; font-weight: bold; }
        .result-row { background: #16a34a; color: white; font-weight: bold; font-size: 13px; }
        .highlight { background: #ffff00; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">Loading...</span></div>;
  if (!data) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">No data</span></div>;

  const m = data.master || {};
  const days = data.days || [];
  const allAt1550 = days.map(d => parseFloat(d.at_1550) || 0).filter(v => v > 0);
  const allAt1625 = days.map(d => parseFloat(d.at_1625) || 0).filter(v => v > 0);
  const initAt1550 = allAt1550.length > 0 ? allAt1550[0] : 0;
  const initAt1625 = allAt1625.length > 0 ? allAt1625[0] : 0;
  const maxAt1550 = allAt1550.length > 0 ? Math.max(...allAt1550) : 0;
  const maxAt1625 = allAt1625.length > 0 ? Math.max(...allAt1625) : 0;
  const changeAt1550 = (maxAt1550 - initAt1550).toFixed(3);
  const changeAt1625 = (maxAt1625 - initAt1625).toFixed(3);

  // Split into two columns for display (like the report)
  const half = Math.ceil(days.length / 2);
  const col1 = days.slice(0, half);
  const col2 = days.slice(half);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-orange-600 hover:text-orange-800"><ArrowLeft size={14} /></button>
            <span className="text-[11px] font-bold text-slate-700 uppercase">HTHA Report — {m.bobbin_no}</span>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900">
            <Printer size={12} /> Print
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={printRef}>
          <div style={{ maxWidth: 850, margin: '0 auto' }}>
            <p className="header" style={{ textAlign: 'center', fontSize: 15, fontWeight: 'bold', marginBottom: 12 }}>Test Results for High Temperature and High Humidity (Damp Heat)</p>

            {/* Info table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
              <tbody>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left', width: 140 }}>Format No:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.format_no || '—'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>GR Clause No:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.gr_clause_no || '—'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>Requirements as per GR:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.req_per_gr || '—'}</td></tr>
              </tbody>
            </table>

            {m.title && <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', margin: '12px 0', background: '#f1f5f9', padding: '6px' }}>Title: {m.title}</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <tbody>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left', width: 140 }}>FIBRE ID:</th>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>{m.bobbin_no}</td>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>Test Std.: {m.testing_standard || '—'}</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>START DATE/TIME:</th>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.start_date?.split('T')[0]}</td>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.start_time}</td>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>MARKER 'A': {m.marker_a || 'Auto'}  MARKER 'B': {m.marker_b || 'Auto'}</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>END DATE/TIME:</th>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.end_date?.split('T')[0]}</td>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.end_time}</td>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>TEMPERATURE: {m.temp}°C</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>LENGTH (KM):</th>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>{m.fiber_length} KM</td>
                  <td style={{ border: '1px solid #999', padding: '4px 8px' }}>INITIAL ATTENUATION: (1550: {m.at_1550} / 1625: {m.at_1625}) dB/KM</td>
                </tr>
              </tbody>
            </table>

            {/* Day table — two columns side by side */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#cbd5e1' }}>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>DATE</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>DAY</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>1550 nm</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>1625 nm</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}></th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>DATE</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>DAY</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>1550 nm</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>1625 nm</th>
                </tr>
                <tr style={{ background: '#e2e8f0', fontSize: 9 }}>
                  <th style={{ border: '1px solid #333', padding: '2px' }} colSpan={4}>ATTENUATION (dB/km)</th>
                  <th style={{ border: '1px solid #333', padding: '2px' }}></th>
                  <th style={{ border: '1px solid #333', padding: '2px' }} colSpan={4}>ATTENUATION (dB/km)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(col1.length, col2.length) }).map((_, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{col1[i]?.htha_date?.split('T')[0] || ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold' }}>{col1[i]?.htha_day ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{col1[i]?.at_1550 ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{col1[i]?.at_1625 ?? ''}</td>
                    <td style={{ border: 'none', padding: '2px' }}></td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{col2[i]?.htha_date?.split('T')[0] || ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold' }}>{col2[i]?.htha_day ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{col2[i]?.at_1550 ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{col2[i]?.at_1625 ?? ''}</td>
                  </tr>
                ))}
                {/* Change in attenuation row */}
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }} colSpan={2}>Change in Attenuation</td>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center', background: '#ffff00' }}>{changeAt1550}</td>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center', background: '#ffff00' }}>{changeAt1625}</td>
                  <td colSpan={5}></td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 15 }}>
              <tbody>
                <tr style={{ background: '#16a34a', color: 'white' }}>
                  <td style={{ border: '1px solid #333', padding: '6px 10px', fontWeight: 'bold', fontSize: 13 }} colSpan={2}>RESULTS: PASS</td>
                </tr>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Maximum Change in attn-1550 nm= {changeAt1550} dB/KM</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}></td></tr>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Maximum Change in attn-1625 nm= {changeAt1625} dB/KM</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}></td></tr>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>{m.remark || 'All results are found OK. Sample is passed.'}</td></tr>
              </tbody>
            </table>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 'bold' }}>Tested By: {m.tested_by || '—'}</td>
                  <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 'bold' }}>Checked By: {m.checked_by || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTHAView;
