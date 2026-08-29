import { useState, useEffect } from 'react';
import { X, Droplet, Plus, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toastService';
import { getWiEntryById, createWiEntry, updateWiEntry } from '../services/wiEntryService';

const makeDay = () => ({ wi_day: '', wi_date: '', at_1310: '', at_1550: '', at_1625: '' });

const F = ({ label, value, onChange, type = 'text', className = '' }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      step={type === 'number' ? '0.001' : undefined}
      className="border border-slate-200 rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-cyan-400 bg-white" />
  </div>
);

const WIForm = ({ entryId, onClose }) => {
  const [master, setMaster] = useState({
    bobbin_no: '', format_no: '', tite: '', temp: '',
    testing_standard: '', marker_a: '', marker_b: '',
    start_date: '', start_time: '', end_date: '', end_time: '',
    fiber_length: '', remark: '', tested_by: '', checked_by: '',
    at_1310: '', at_1550: '', at_1625: '',
  });
  const [days, setDays] = useState([makeDay()]);
  const [maxCh, setMaxCh] = useState({ max_ch_nm_1310: '', max_ch_nm_1550: '', max_ch_nm_1625: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!entryId;

  useEffect(() => {
    if (entryId) {
      (async () => {
        setLoading(true);
        try {
          const res = await getWiEntryById(entryId);
          if (res?.success) {
            const m = res.data.master || {};
            setMaster({
              bobbin_no: m.bobbin_no || '', format_no: m.format_no || '',
              tite: m.tite || '', temp: m.temp ?? '',
              testing_standard: m.testing_standard || '',
              marker_a: m.marker_a || '', marker_b: m.marker_b || '',
              start_date: m.start_date?.split('T')[0] || '', start_time: m.start_time || '',
              end_date: m.end_date?.split('T')[0] || '', end_time: m.end_time || '',
              fiber_length: m.fiber_length ?? '', remark: m.remark || '',
              tested_by: m.tested_by || '', checked_by: m.checked_by || '',
              at_1310: m.at_1310 ?? '', at_1550: m.at_1550 ?? '', at_1625: m.at_1625 ?? '',
            });
            if (res.data.days?.length > 0) {
              setDays(res.data.days.map(d => ({
                wi_day: d.wi_day ?? '', wi_date: d.wi_date?.split('T')[0] || '',
                at_1310: d.at_1310 ?? '', at_1550: d.at_1550 ?? '', at_1625: d.at_1625 ?? '',
              })));
            }
            const mc = res.data.maxCh || {};
            setMaxCh({
              max_ch_nm_1310: mc.max_ch_nm_1310 ?? '',
              max_ch_nm_1550: mc.max_ch_nm_1550 ?? '',
              max_ch_nm_1625: mc.max_ch_nm_1625 ?? '',
            });
          }
        } catch (e) { showError(`Failed to load: ${e?.response?.data?.message || e?.message}`); }
        setLoading(false);
      })();
    }
  }, [entryId]);

  const setM = (key, val) => setMaster(prev => ({ ...prev, [key]: val }));
  const setMC = (key, val) => setMaxCh(prev => ({ ...prev, [key]: val }));
  const setD = (idx, key, val) => setDays(prev => { const u = [...prev]; u[idx] = { ...u[idx], [key]: val }; return u; });
  const addDay = () => setDays(prev => [...prev, makeDay()]);
  const removeDay = (idx) => setDays(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!master.bobbin_no) { showError('Bobbin No is required'); return; }
    setSubmitting(true);
    try {
      const payload = { master, days, maxCh };
      const res = isEdit ? await updateWiEntry(entryId, payload) : await createWiEntry(payload);
      if (res?.success) { showSuccess(isEdit ? 'Entry updated' : 'Entry created'); onClose(); }
      else showError(res?.message || 'Save failed');
    } catch (e) { showError(e?.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };

  if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"><span className="text-white">Loading...</span></div>;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl shadow-2xl w-[95vw] max-w-[1100px] max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Droplet size={16} className="text-white/80" />
            <h2 className="text-sm font-bold text-white">{isEdit ? 'Edit Water Immersion Entry' : 'New Water Immersion Entry'}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 px-5 py-3 flex flex-col gap-3 overflow-y-auto">
          {/* Master Info */}
          <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-3">
            <span className="text-[8px] font-bold text-cyan-700 uppercase tracking-wider">Document & Master Info</span>
            <div className="grid grid-cols-5 gap-x-3 gap-y-1.5 mt-2">
              <F label="Bobbin No *" value={master.bobbin_no} onChange={v => setM('bobbin_no', v)} />
              <F label="Format No" value={master.format_no} onChange={v => setM('format_no', v)} />
              <F label="Title" value={master.tite} onChange={v => setM('tite', v)} className="col-span-2" />
              <F label="Temperature (°C)" value={master.temp} onChange={v => setM('temp', v)} type="number" />
              <F label="Testing Standard" value={master.testing_standard} onChange={v => setM('testing_standard', v)} />
              <F label="Marker A" value={master.marker_a} onChange={v => setM('marker_a', v)} />
              <F label="Marker B" value={master.marker_b} onChange={v => setM('marker_b', v)} />
              <F label="Tested By" value={master.tested_by} onChange={v => setM('tested_by', v)} />
              <F label="Checked By" value={master.checked_by} onChange={v => setM('checked_by', v)} />
              <F label="Start Date" value={master.start_date} onChange={v => setM('start_date', v)} type="date" />
              <F label="Start Time" value={master.start_time} onChange={v => setM('start_time', v)} type="time" />
              <F label="End Date" value={master.end_date} onChange={v => setM('end_date', v)} type="date" />
              <F label="End Time" value={master.end_time} onChange={v => setM('end_time', v)} type="time" />
              <F label="Fiber Length (KM)" value={master.fiber_length} onChange={v => setM('fiber_length', v)} type="number" />
              <F label="Remark" value={master.remark} onChange={v => setM('remark', v)} className="col-span-5" />
            </div>
          </div>

          {/* Initial Attenuation */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-4">
            <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">Initial Attn (dB/KM):</span>
            <div className="flex gap-3 flex-1">
              <F label="AT 1310" value={master.at_1310} onChange={v => setM('at_1310', v)} type="number" className="flex-1" />
              <F label="AT 1550" value={master.at_1550} onChange={v => setM('at_1550', v)} type="number" className="flex-1" />
              <F label="AT 1625" value={master.at_1625} onChange={v => setM('at_1625', v)} type="number" className="flex-1" />
            </div>
          </div>

          {/* Day Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-3 py-1.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Day-wise Observations ({days.length} rows)</span>
              <button type="button" onClick={addDay} className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded hover:bg-emerald-600">
                <Plus size={9} /> Add Day
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10">
                  <tr>
                    {['#', 'Day', 'Date', 'AT 1310 (dB/km)', 'AT 1550 (dB/km)', 'AT 1625 (dB/km)', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-[8px] font-bold text-slate-600 uppercase border-r border-slate-200 last:border-0 text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((d, i) => (
                    <tr key={i} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-cyan-50/20'}`}>
                      <td className="px-2 py-1 text-center text-[9px] text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-2 py-1 w-20"><input type="number" min="0" value={d.wi_day} onChange={e => setD(i, 'wi_day', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none text-center font-bold focus:ring-1 focus:ring-cyan-300" placeholder="0" /></td>
                      <td className="px-1 py-1"><input type="date" value={d.wi_date} onChange={e => setD(i, 'wi_date', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-cyan-300" /></td>
                      <td className="px-1 py-1"><input type="number" step="0.001" value={d.at_1310} onChange={e => setD(i, 'at_1310', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none text-center bg-blue-50/50 focus:ring-1 focus:ring-blue-300" placeholder="—" /></td>
                      <td className="px-1 py-1"><input type="number" step="0.001" value={d.at_1550} onChange={e => setD(i, 'at_1550', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none text-center bg-blue-50/50 focus:ring-1 focus:ring-blue-300" placeholder="—" /></td>
                      <td className="px-1 py-1"><input type="number" step="0.001" value={d.at_1625} onChange={e => setD(i, 'at_1625', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none text-center bg-blue-50/50 focus:ring-1 focus:ring-blue-300" placeholder="—" /></td>
                      <td className="px-1 py-1 text-center">
                        {days.length > 1 && <button onClick={() => removeDay(i)} className="text-slate-300 hover:text-rose-500"><Trash2 size={11} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Max Change in Attenuation — single row */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-4 flex-shrink-0">
            <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider whitespace-nowrap">Max Change in Attenuation (dB):</span>
            <div className="flex gap-3 flex-1">
              <F label="Max Δ 1310" value={maxCh.max_ch_nm_1310} onChange={v => setMC('max_ch_nm_1310', v)} type="number" className="flex-1" />
              <F label="Max Δ 1550" value={maxCh.max_ch_nm_1550} onChange={v => setMC('max_ch_nm_1550', v)} type="number" className="flex-1" />
              <F label="Max Δ 1625" value={maxCh.max_ch_nm_1625} onChange={v => setMC('max_ch_nm_1625', v)} type="number" className="flex-1" />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-white flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 shadow-md">
            {submitting ? 'Saving...' : isEdit ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WIForm;
