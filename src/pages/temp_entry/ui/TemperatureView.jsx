import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { showError } from '../../../utils/toastService';
import { getTempEntryById } from '../services/tempEntryService';

const TemperatureView = ({ entryId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTempEntryById(entryId);
        if (res?.success) setData(res.data);
      } catch (e) { showError('Failed to load entry'); }
      setLoading(false);
    })();
  }, [entryId]);

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Temperature Cycling Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #333; padding: 4px 8px; text-align: center; }
        th { background: #e2e8f0; font-size: 11px; }
        .header { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
        .info-table td { border: 1px solid #999; text-align: left; padding: 3px 8px; }
        .info-table th { border: 1px solid #999; text-align: left; padding: 3px 8px; background: #f1f5f9; width: 150px; }
        .result { font-weight: bold; font-size: 14px; margin-top: 10px; }
        .footer { margin-top: 15px; }
        .highlight { background: #ffff00; font-weight: bold; }
        @media print { body { margin: 0; } }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">Loading...</span></div>;
  if (!data) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">No data</span></div>;

  const m = data.master || {};
  const cycles = data.cycles || [];
  const mc = data.maxCh || {};
  const maxCh1310 = parseFloat(mc.max_ch_nm_1310) || 0;
  const maxCh1550 = parseFloat(mc.max_ch_nm_1550) || 0;
  const maxCh1625 = parseFloat(mc.max_ch_nm_1625) || 0;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-blue-600 hover:text-blue-800"><ArrowLeft size={14} /></button>
            <span className="text-[11px] font-bold text-slate-700 uppercase">Temperature Report — {m.bobbin_no}</span>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900">
            <Printer size={12} /> Print
          </button>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6" ref={printRef}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p className="header" style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Test Results for Temperature Cycling</p>

            {/* Info Table */}
            <table className="info-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 15 }}>
              <tbody>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left', width: 150 }}>Format No:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.format_no || '—'}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}></td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>GR Clause No:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.gr_clause_no || '—'}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}></td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>Requirements as per GR:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={3}>{m.req_per_gr || '—'}</td></tr>
              </tbody>
            </table>

            <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', margin: '15px 0' }}>Testing standard :- {m.tesing_standrd || '—'}</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10 }}>
              <tbody>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left', width: 140 }}>FIBRE ID:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.bobbin_no}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}></td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Marker A: {m.marker_a || 'Auto'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>START DATE/TIME:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.start_date?.split('T')[0]} {m.start_time}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}></td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Marker B: {m.marker_b || 'Auto'}</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>END DATE/TIME:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.end_date?.split('T')[0]} {m.end_time}</td><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>Initial Attenuation :- (1310: {m.at_1310} / 1550: {m.at_1550} / 1625: {m.at_1625})dB/KM</td></tr>
                <tr><th style={{ border: '1px solid #999', padding: '4px 8px', background: '#f1f5f9', textAlign: 'left' }}>LENGTH:</th><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{m.fiber_length} KM</td><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}></td></tr>
              </tbody>
            </table>

            {/* Cycle Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr style={{ background: '#cbd5e1' }}>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>Temp.(°C)</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>Date</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>Time</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} colSpan={3}>Attenuation in dB</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>Operator</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>Remarks</th>
                </tr>
                <tr style={{ background: '#e2e8f0' }}>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>1310 nm</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>1550 nm</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }}>1625 nm</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((c, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>{c.temperature}</td>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{c.date?.split('T')[0] || ''}</td>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{c.time || ''}</td>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{c.nm_1310 ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{c.nm_1550 ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{c.nm_1625 ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{c.operator || ''}</td>
                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{c.remark || ''}</td>
                  </tr>
                ))}
                {/* Max change row */}
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', fontWeight: 'bold' }} colSpan={3}>Max Change in Attenuation</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', background: '#ffff00', fontWeight: 'bold' }}>{maxCh1310.toFixed(3)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', background: '#ffff00', fontWeight: 'bold' }}>{maxCh1550.toFixed(3)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', background: '#ffff00', fontWeight: 'bold' }}>{maxCh1625.toFixed(3)}</td>
                  <td style={{ border: '1px solid #333', padding: '4px' }}></td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center' }}>{m.result === 'pass' ? 'Pass' : m.result === 'fail' ? 'Fail' : ''}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ marginTop: 15, borderTop: '1px solid #333', paddingTop: 8 }}>
              <p style={{ fontWeight: 'bold', fontSize: 13 }}>RESULT: {m.result?.toUpperCase() || '—'}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <tbody>
                  <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Maximum Change in attn - <strong>1310 nm</strong></td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{maxCh1310.toFixed(3)} dB/KM</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}></td></tr>
                  <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Maximum Change in attn - <strong>1550 nm</strong></td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{maxCh1550.toFixed(3)} dB/KM</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}></td></tr>
                  <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }}>Maximum Change in attn - <strong>1625 nm</strong></td><td style={{ border: '1px solid #999', padding: '4px 8px' }}>{maxCh1625.toFixed(3)} dB/KM</td><td style={{ border: '1px solid #999', padding: '4px 8px' }}></td></tr>
                  <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={3}>Physical Observation: {m.physical_obs || 'No Delamination observed'}</td></tr>
                </tbody>
              </table>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 'bold' }}>Prepared By: {m.prepared_by || '—'}</td>
                    <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 'bold' }}>Checked By: {m.checked_by || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureView;
