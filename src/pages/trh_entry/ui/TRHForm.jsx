import { useState, useEffect } from 'react';
import { X, Droplets, Plus, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toastService';
import { getTrhEntryById, createTrhEntry, updateTrhEntry } from '../services/trhEntryService';

const CYCLE_TEMPS = [
  { temperature: '85', rh: '85-98' },
  { temperature: '85', rh: '85-98' },
  { temperature: '-10', rh: '0' },
  { temperature: '23', rh: '85-98' },
];

const makeCycle = () => CYCLE_TEMPS.map(t => ({ ...t, trh_date: '', trh_time: '', at_1550: '', at_1625: '', tested_by: '' }));

const F = ({ label, value, onChange, type = 'text', className = '' }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      step={type === 'number' ? '0.001' : undefined}
      className="border border-slate-200 rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-violet-400 bg-white" />
  </div>
);

const TRHForm = ({ entryId, onClose }) => {
  const [master, setMaster] = useState({
    bobbin_no: '', format_no: '', gr_clause_no: '', req_per_gr: '',
    temp_hum_range: '', testing_standard: '', marker_a: '', marker_b: '',
    start_date: '', start_time: '', end_date: '', end_time: '',
    fiber_length: '', remark: '', at_1310: '', at_1550: '', at_1625: '',
  });
  const [cycles, setCycles] = useState([...makeCycle()]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!entryId;

  const cycleCount = Math.ceil(cycles.length / 4);

  useEffect(() => {
    if (entryId) {
      (async () => {
        setLoading(true);
        try {
          const res = await getTrhEntryById(entryId);
          console.log('TRH entry response:', res);
          if (res?.success) {
            const m = res.data?.master || res.data || {};
            setMaster({
              bobbin_no: m.bobbin_no || '', format_no: m.format_no || '',
              gr_clause_no: m.gr_clause_no ?? '', req_per_gr: m.req_per_gr || '',
              temp_hum_range: m.temp_hum_range || '', testing_standard: m.testing_standard || '',
              marker_a: m.marker_a || '', marker_b: m.marker_b || '',
              start_date: m.start_date?.split('T')[0] || '', start_time: m.start_time || '',
              end_date: m.end_date?.split('T')[0] || '', end_time: m.end_time || '',
              fiber_length: m.fiber_length ?? '', remark: m.remark || '',
              at_1310: m.at_1310 ?? '', at_1550: m.at_1550 ?? '', at_1625: m.at_1625 ?? '',
            });
            const cycleSrc = res.data?.cycles || res.data?.cycle_entries || [];
            if (cycleSrc.length > 0) {
              setCycles(cycleSrc.map(c => ({
                temperature: String(c.temperature || 85), rh: c.rh || '',
                trh_date: c.trh_date?.split('T')[0] || '', trh_time: c.trh_time || '',
                at_1550: c.at_1550 ?? '', at_1625: c.at_1625 ?? '', tested_by: c.tested_by || '',
              })));
            }
          }
        } catch (e) { console.error('TRH load error:', e?.response?.status, e?.response?.data, e?.message); showError(`Failed to load entry: ${e?.response?.data?.message || e?.message || 'Check backend'}`); }
        setLoading(false);
      })();
    }
  }, [entryId]);

  const handleMasterChange = (key, val) => setMaster(prev => ({ ...prev, [key]: val }));
  const handleCycleChange = (idx, key, val) => setCycles(prev => { const u = [...prev]; u[idx] = { ...u[idx], [key]: val }; return u; });
  const addRow = () => setCycles(prev => [...prev, ...makeCycle()]);
  const removeCycle = () => {
    if (cycles.length <= 4) return; // Keep at least 1 cycle
    setCycles(prev => prev.slice(0, -4));
  };

  const handleSubmit = async () => {
    if (!master.bobbin_no) { showError('Bobbin No is required'); return; }
    if (cycles.length === 0) { showError('Add at least one cycle row'); return; }
    setSubmitting(true);
    try {
      const payload = { master, cycles: cycles.map((c, i) => ({ ...c, cycle_no: i + 1 })) };
      const res = isEdit ? await updateTrhEntry(entryId, payload) : await createTrhEntry(payload);
      if (res?.success) { showSuccess(isEdit ? 'Entry updated' : 'Entry created'); onClose(); }
      else showError(res?.message || 'Save failed');
    } catch (e) { showError(e?.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };

  if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"><span className="text-white text-sm">Loading...</span></div>;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl shadow-2xl w-[95vw] max-w-[1150px] max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-white/80" />
            <h2 className="text-sm font-bold text-white">{isEdit ? 'Edit TRH Entry' : 'New TRH Entry'}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-3 flex flex-col gap-3 overflow-y-auto">
          {/* Section 1: Document + Fiber Info */}
          <div className="flex gap-3">
            <div className="flex-1 bg-violet-50/50 border border-violet-100 rounded-xl p-3">
              <span className="text-[8px] font-bold text-violet-700 uppercase tracking-wider">Document & Fiber Info</span>
              <div className="grid grid-cols-5 gap-x-3 gap-y-1.5 mt-2">
                <F label="Bobbin No *" value={master.bobbin_no} onChange={v => handleMasterChange('bobbin_no', v)} />
                <F label="Format No" value={master.format_no} onChange={v => handleMasterChange('format_no', v)} />
                <F label="GR Clause No" value={master.gr_clause_no} onChange={v => handleMasterChange('gr_clause_no', v)} type="number" />
                <F label="Fiber Length (KM)" value={master.fiber_length} onChange={v => handleMasterChange('fiber_length', v)} type="number" />
                <F label="Temp/Humidity Range" value={master.temp_hum_range} onChange={v => handleMasterChange('temp_hum_range', v)} />
                <F label="Testing Standard" value={master.testing_standard} onChange={v => handleMasterChange('testing_standard', v)} />
                <F label="Marker A" value={master.marker_a} onChange={v => handleMasterChange('marker_a', v)} />
                <F label="Marker B" value={master.marker_b} onChange={v => handleMasterChange('marker_b', v)} />
                <F label="Start Date" value={master.start_date} onChange={v => handleMasterChange('start_date', v)} type="date" />
                <F label="Start Time" value={master.start_time} onChange={v => handleMasterChange('start_time', v)} type="time" />
                <F label="End Date" value={master.end_date} onChange={v => handleMasterChange('end_date', v)} type="date" />
                <F label="End Time" value={master.end_time} onChange={v => handleMasterChange('end_time', v)} type="time" />
                <F label="Req as per GR" value={master.req_per_gr} onChange={v => handleMasterChange('req_per_gr', v)} className="col-span-2" />
                <F label="Remark" value={master.remark} onChange={v => handleMasterChange('remark', v)} />
              </div>
            </div>
          </div>

          {/* Initial Attenuation */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2 flex items-center gap-4">
            <span className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider whitespace-nowrap">Initial Attn (dB/KM):</span>
            <div className="flex gap-3 flex-1">
              <F label="AT 1310" value={master.at_1310} onChange={v => handleMasterChange('at_1310', v)} type="number" className="flex-1" />
              <F label="AT 1550" value={master.at_1550} onChange={v => handleMasterChange('at_1550', v)} type="number" className="flex-1" />
              <F label="AT 1625" value={master.at_1625} onChange={v => handleMasterChange('at_1625', v)} type="number" className="flex-1" />
            </div>
          </div>

          {/* Cycle Table — Dynamic */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-3 py-1.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">TRH Cycle Entries — {cycleCount} Cycle{cycleCount !== 1 ? 's' : ''}</span>
              <div className="flex gap-1">
                {cycles.length > 4 && (
                  <button type="button" onClick={removeCycle} className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white text-[8px] font-bold rounded hover:bg-rose-600">
                    <Trash2 size={9} /> Remove Cycle
                  </button>
                )}
                <button type="button" onClick={addRow} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded hover:bg-emerald-600">
                  <Plus size={9} /> Add Cycle
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10">
                  <tr>
                    {['Cycle', 'Temp (°C)', 'RH (%)', 'Date', 'Time', 'AT 1550', 'AT 1625', 'Tested By'].map(h => (
                      <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-600 uppercase border-r border-slate-200 last:border-0 text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cycles.map((c, i) => {
                    const cycleNum = Math.floor(i / 4) + 1;
                    const isFirstInCycle = i % 4 === 0;
                    return (
                      <tr key={i} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-violet-50/20'}`}>
                        {isFirstInCycle && (
                          <td className="px-2 py-1 text-center text-[12px] font-black text-violet-700 bg-violet-50/60 align-middle" rowSpan={4}>{cycleNum}</td>
                        )}
                        <td className="px-1 py-1">
                          <select value={c.temperature} onChange={e => handleCycleChange(i, 'temperature', e.target.value)}
                            className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-violet-300 bg-white text-center font-bold">
                            <option value="85">85°C</option>
                            <option value="-10">-10°C</option>
                            <option value="23">23°C</option>
                          </select>
                        </td>
                        <td className="px-1 py-1"><input value={c.rh} onChange={e => handleCycleChange(i, 'rh', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none text-center" placeholder="85-98" /></td>
                        <td className="px-1 py-1"><input type="date" value={c.trh_date} onChange={e => handleCycleChange(i, 'trh_date', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none" /></td>
                        <td className="px-1 py-1"><input type="time" value={c.trh_time} onChange={e => handleCycleChange(i, 'trh_time', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none" /></td>
                        <td className="px-1 py-1"><input type="number" step="0.001" value={c.at_1550} onChange={e => handleCycleChange(i, 'at_1550', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none text-center bg-blue-50/50" placeholder="—" /></td>
                        <td className="px-1 py-1"><input type="number" step="0.001" value={c.at_1625} onChange={e => handleCycleChange(i, 'at_1625', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none text-center bg-blue-50/50" placeholder="—" /></td>
                        <td className="px-1 py-1"><input value={c.tested_by} onChange={e => handleCycleChange(i, 'tested_by', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none" placeholder="Name" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 shadow-md">
            {submitting ? 'Saving...' : isEdit ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TRHForm;
