import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { showError } from '../../../utils/toastService';
import { getTrhEntryById } from '../services/trhEntryService';

const TRHView = ({ entryId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTrhEntryById(entryId);
        if (res?.success) setData(res.data);
      } catch (e) { console.error('TRH view error:', e?.response?.status, e?.response?.data, e?.message); showError(`Failed to load entry: ${e?.response?.data?.message || e?.message || 'Check backend'}`); }
      setLoading(false);
    })();
  }, [entryId]);

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>TRH Cycling Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #333; padding: 4px 8px; text-align: center; }
        th { background: #e2e8f0; font-size: 11px; }
        .header { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
        .info-table td, .info-table th { border: 1px solid #999; text-align: left; padding: 3px 8px; }
        .info-table th { background: #f1f5f9; width: 160px; }
        .highlight { background: #ffff00; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">Loading...</span></div>;
  if (!data) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">No data</span></div>;

  const m = data.master || {};
  const cycles = data.cycles || [];

  // Group cycles by cycle_no (every 4 rows = 1 cycle)
  const groupedCycles = {};
  cycles.forEach(c => {
    const cn = c.cycle_no || 1;
    if (!groupedCycles[cn]) groupedCycles[cn] = [];
    groupedCycles[cn].push(c);
  });

  // Calculate max change
  const allAt1550 = cycles.map(c => parseFloat(c.at_1550) || 0).filter(v => v > 0);
  const allAt1625 = cycles.map(c => parseFloat(c.at_1625) || 0).filter(v => v > 0);
  const ambientAt1550 = allAt1550.length > 0 ? Math.min(...allAt1550) : 0;
  const ambientAt1625 = allAt1625.length > 0 ? Math.min(...allAt1625) : 0;
  const maxAt1550 = allAt1550.length > 0 ? Math.max(...allAt1550) : 0;
  const maxAt1625 = allAt1625.length > 0 ? Math.max(...allAt1625) : 0;
  const maxChange1550 = (maxAt1550 - ambientAt1550).toFixed(3);
  const maxChange1625 = (maxAt1625 - ambientAt1625).toFixed(3);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-violet-600 hover:text-violet-800"><ArrowLeft size={14} /></button>
            <span className="text-[11px] font-bold text-slate-700 uppercase">TRH Report — {m.bobbin_no}</span>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900">
            <Printer size={12} /> Print
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={printRef}>
          <div style={{ maxWidth: 850, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Test Results for Periodic Temperature and Humidity Cycling Testing</p>

            <table className="info-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
              <tbody>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left', width: 160 }}>Format No:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.format_no || '—'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>Sample IDs:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.bobbin_no}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>GR Clause No:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.gr_clause_no || '—'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>Requirements as per GR:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.req_per_gr || '—'}</td></tr>
              </tbody>
            </table>

            <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', margin: '15px 0' }}>Temperature & Humidity Range : {m.temp_hum_range || '—'}</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
              <tbody>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left', width: 140 }}>FIBRE ID:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.bobbin_no}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Testing standard: {m.testing_standard || '—'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>START DATE/TIME:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.start_date?.split('T')[0]} {m.start_time}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Marker A: {m.marker_a || 'Auto'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>END DATE/TIME:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.end_date?.split('T')[0]} {m.end_time}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Marker B: {m.marker_b || 'Auto'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>LENGTH (KM):</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.fiber_length} KM</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Initial Attn.: (1550: {m.at_1550} / 1625: {m.at_1625}) dB/KM</td></tr>
              </tbody>
            </table>

            {/* Cycle Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr style={{ background: '#cbd5e1' }}>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>No. of Cycle</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>Temperature (°C)</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>RH(%)</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>TIME</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} colSpan={2}>Attenuation (dB/Km)</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>Tested By</th>
                </tr>
                <tr style={{ background: '#e2e8f0' }}>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>At 1550 nm</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>At 1625 nm</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedCycles).map(cn => (
                  groupedCycles[cn].map((c, si) => (
                    <tr key={`${cn}-${si}`}>
                      {si === 0 && <td style={{ border: '1px solid #333', padding: '4px', fontWeight: 'bold', verticalAlign: 'middle' }} rowSpan={groupedCycles[cn].length}>{cn}</td>}
                      <td style={{ border: '1px solid #333', padding: '4px' }}>{c.temperature}</td>
                      <td style={{ border: '1px solid #333', padding: '4px' }}>{c.rh || '—'}</td>
                      <td style={{ border: '1px solid #333', padding: '4px' }}>{c.trh_time || ''}</td>
                      <td style={{ border: '1px solid #333', padding: '4px' }}>{c.at_1550 ?? ''}</td>
                      <td style={{ border: '1px solid #333', padding: '4px' }}>{c.at_1625 ?? ''}</td>
                      <td style={{ border: '1px solid #333', padding: '4px' }}>{c.tested_by || ''}</td>
                    </tr>
                  ))
                ))}
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #333', padding: '4px' }} colSpan={2}></td>
                  <td style={{ border: '1px solid #333', padding: '4px' }} colSpan={2}>Ambient Condition Attenuation</td>
                  <td style={{ border: '1px solid #333', padding: '4px' }}>{ambientAt1550.toFixed(3)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px' }}>{ambientAt1625.toFixed(3)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px' }}></td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #333', padding: '4px' }} colSpan={2}></td>
                  <td style={{ border: '1px solid #333', padding: '4px' }} colSpan={2}>Max. Change in Attenuation</td>
                  <td style={{ border: '1px solid #333', padding: '4px', background: '#ffff00' }}>{maxChange1550}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', background: '#ffff00' }}>{maxChange1625}</td>
                  <td style={{ border: '1px solid #333', padding: '4px' }}></td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 15 }}>
              <p>{m.remark || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TRHView;
