import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { showError } from '../../../utils/toastService';
import { getAatEntryById } from '../services/aatEntryService';

const AATView = ({ entryId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAatEntryById(entryId);
        if (res?.success) setData(res.data);
        else showError(res?.message || 'Failed to load');
      } catch (e) { showError(`Failed to load: ${e?.response?.data?.message || e?.message}`); }
      setLoading(false);
    })();
  }, [entryId]);

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Accelerated Aging Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #333; padding: 3px 6px; }
        th { background: #e2e8f0; font-size: 10px; }
        .header { text-align: center; font-size: 15px; font-weight: bold; margin-bottom: 10px; }
        @media print { body { margin: 0; } }
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">Loading...</span></div>;
  if (!data) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">No data</span></div>;

  const m = data.master || {};
  const days = data.days || [];

  // Max change in attenuation — stored values from aat_ch table
  const mc = data.maxCh || {};
  const ch1310 = (parseFloat(mc.max_ch_nm_1310) || 0).toFixed(3);
  const ch1550 = (parseFloat(mc.max_ch_nm_1550) || 0).toFixed(3);
  const ch1625 = (parseFloat(mc.max_ch_nm_1625) || 0).toFixed(3);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-amber-600 hover:text-amber-800"><ArrowLeft size={14} /></button>
            <span className="text-[11px] font-bold text-slate-700 uppercase">Accelerated Aging Report — {m.bobbin_no}</span>
          </div>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg hover:bg-slate-900">
            <Printer size={12} /> Print
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" ref={printRef}>
          <div style={{ maxWidth: 850, margin: '0 auto' }}>
            <p style={{ textAlign: 'center', fontSize: 15, fontWeight: 'bold', marginBottom: 12 }}>Periodic High Temperature Aging Test Report</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
              <tbody>
                <tr><td style={{ border: '1px solid #999', padding: '3px 8px', fontWeight: 'bold' }}>Format No: {m.format_no || '—'}</td><td style={{ border: '1px solid #999', padding: '3px 8px' }}></td></tr>
                <tr><td style={{ border: '1px solid #999', padding: '3px 8px' }} colSpan={2}>Title: {m.title || '—'}</td></tr>
              </tbody>
            </table>

            {m.title && <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 'bold', margin: '10px 0', background: '#f1f5f9', padding: '5px' }}>Title: {m.title}</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <tbody>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '3px 8px', background: '#f1f5f9', textAlign: 'left', width: 140 }}>FIBRE ID:</th>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }} colSpan={2}>{m.bobbin_no}</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>Test Std.: {m.testing_standard || '—'}</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '3px 8px', background: '#f1f5f9', textAlign: 'left' }}>START DATE/TIME:</th>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>{m.start_date?.split('T')[0]}</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>{m.start_time}</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>MARKER 'A': {m.marker_a || 'Auto'}  MARKER 'B': {m.marker_b || 'Auto'}</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '3px 8px', background: '#f1f5f9', textAlign: 'left' }}>END DATE/TIME:</th>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>{m.end_date?.split('T')[0]}</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>{m.end_time}</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>TEMPERATURE: {m.temp}°C</td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #999', padding: '3px 8px', background: '#f1f5f9', textAlign: 'left' }}>LENGTH (KM):</th>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }} colSpan={2}>{m.fiber_length} KM</td>
                  <td style={{ border: '1px solid #999', padding: '3px 8px' }}>INITIAL ATTENUATION: ({m.at_1310}/{m.at_1550}/{m.at_1625}) dB/KM</td>
                </tr>
              </tbody>
            </table>

            {/* Day table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#cbd5e1' }}>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>DATE</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} rowSpan={2}>DAY</th>
                  <th style={{ border: '1px solid #333', padding: '4px' }} colSpan={3}>ATTENUATION (dB/km)</th>
                </tr>
                <tr style={{ background: '#e2e8f0', fontSize: 10 }}>
                  <th style={{ border: '1px solid #333', padding: '3px' }}>1310 nm</th>
                  <th style={{ border: '1px solid #333', padding: '3px' }}>1550 nm</th>
                  <th style={{ border: '1px solid #333', padding: '3px' }}>1625nm</th>
                </tr>
              </thead>
              <tbody>
                {days.map((d, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{d.aat_date?.split('T')[0] || ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold' }}>{d.aat_day ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{d.at_1310 ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{d.at_1550 ?? ''}</td>
                    <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{d.at_1625 ?? ''}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #333', padding: '3px 6px' }} colSpan={2}></td>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{ch1310}</td>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{ch1550}</td>
                  <td style={{ border: '1px solid #333', padding: '3px 6px', textAlign: 'center' }}>{ch1625}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 15 }}>
              <tbody>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px', fontWeight: 'bold', fontSize: 12 }} colSpan={2}>RESULTS:</td></tr>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>Maximum Change in attn-1310 nm = {ch1310} dB/Km</td></tr>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>Maximum Change in attn-1550 nm = {ch1550} dB/Km</td></tr>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>Maximum Change in attn-1625 nm = {ch1625} dB/Km</td></tr>
                <tr><td style={{ border: '1px solid #999', padding: '4px 8px' }} colSpan={2}>{m.remark || 'All result are found OK. Sample is passed.'}</td></tr>
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

export default AATView;
