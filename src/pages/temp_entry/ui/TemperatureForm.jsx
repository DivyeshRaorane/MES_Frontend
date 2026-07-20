import { useState, useEffect } from 'react';
import { X, Thermometer, Activity, FileText } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toastService';
import { getTempEntryById, createTempEntry, updateTempEntry } from '../services/tempEntryService';

const FIXED_TEMPS = [23, -60, 85, -60, -85, 23];

const buildCycleRows = () => FIXED_TEMPS.map(t => ({ temperature: t, date: '', time: '', nm_1550: '', nm_1625: '', ch_nm_1550: '', ch_nm_1625: '', operator: '', remark: '' }));

/* ── Compact Field ── */
const F = ({ label, value, onChange, type = 'text', placeholder = '', className = '' }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      step={type === 'number' ? '0.001' : undefined}
      className="border border-slate-200 rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white transition-all" />
  </div>
);

const TemperatureForm = ({ entryId, onClose }) => {
  const [master, setMaster] = useState({
    tesing_standrd: '', format_no: '', gr_clause_no: '', req_per_gr: '',
    bobbin_no: '', fiber_length: '', marker_a: '', marker_b: '',
    start_date: '', start_time: '', end_date: '', end_time: '',
    remark: '', result: '', prepared_by: '', checked_by: '',
    physical_obs: '', at_1310: '', at_1550: '', at_1625: '',
  });
  const [cycles, setCycles] = useState(buildCycleRows());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!entryId;

  useEffect(() => {
    if (entryId) {
      (async () => {
        setLoading(true);
        try {
          const res = await getTempEntryById(entryId);
          if (res?.success) {
            const m = res.data.master || {};
            setMaster({
              tesing_standrd: m.tesing_standrd || '', format_no: m.format_no || '',
              gr_clause_no: m.gr_clause_no ?? '', req_per_gr: m.req_per_gr || '',
              bobbin_no: m.bobbin_no || '', fiber_length: m.fiber_length ?? '',
              marker_a: m.marker_a || '', marker_b: m.marker_b || '',
              start_date: m.start_date?.split('T')[0] || '', start_time: m.start_time || '',
              end_date: m.end_date?.split('T')[0] || '', end_time: m.end_time || '',
              remark: m.remark || '', result: m.result || '',
              prepared_by: m.prepared_by || '', checked_by: m.checked_by || '',
              physical_obs: m.physical_obs || '',
              at_1310: m.at_1310 ?? '', at_1550: m.at_1550 ?? '', at_1625: m.at_1625 ?? '',
            });
            if (res.data.cycles?.length > 0) {
              setCycles(res.data.cycles.map(c => ({
                temperature: c.temperature,
                date: c.date?.split('T')[0] || '', time: c.time || '',
                nm_1550: c.nm_1550 ?? '', nm_1625: c.nm_1625 ?? '',
                ch_nm_1550: c.ch_nm_1550 ?? '', ch_nm_1625: c.ch_nm_1625 ?? '',
                operator: c.operator || '', remark: c.remark || '',
              })));
            }
          }
        } catch (e) { showError('Failed to load entry'); }
        setLoading(false);
      })();
    }
  }, [entryId]);

  const handleMasterChange = (key, val) => setMaster(prev => ({ ...prev, [key]: val }));
  const handleCycleChange = (idx, key, val) => {
    setCycles(prev => { const u = [...prev]; u[idx] = { ...u[idx], [key]: val }; return u; });
  };

  const handleSubmit = async () => {
    if (!master.bobbin_no) { showError('Bobbin No is required'); return; }
    setSubmitting(true);
    try {
      const payload = { master, cycles };
      const res = isEdit ? await updateTempEntry(entryId, payload) : await createTempEntry(payload);
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
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Thermometer size={16} className="text-white/80" />
            <h2 className="text-sm font-bold text-white">{isEdit ? 'Edit Temperature Entry' : 'New Temperature Entry'}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {/* Body — no scroll needed */}
        <div className="flex-1 px-5 py-3 flex flex-col gap-3 overflow-y-auto">

          {/* Section 1: Document Info */}
          <div className="flex items-start gap-4">
            <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText size={11} className="text-blue-600" />
                <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">Document Info</span>
              </div>
              <div className="grid grid-cols-4 gap-x-3 gap-y-1.5">
                <F label="Testing Standard" value={master.tesing_standrd} onChange={v => handleMasterChange('tesing_standrd', v)} />
                <F label="Format No" value={master.format_no} onChange={v => handleMasterChange('format_no', v)} />
                <F label="GR Clause No" value={master.gr_clause_no} onChange={v => handleMasterChange('gr_clause_no', v)} type="number" />
                <F label="Req as per GR" value={master.req_per_gr} onChange={v => handleMasterChange('req_per_gr', v)} />
              </div>
            </div>
          </div>

          {/* Section 2: Fiber Info + Dates + Personnel */}
          <div className="flex gap-3">
            {/* Fiber */}
            <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity size={11} className="text-emerald-600" />
                <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Fiber Details</span>
              </div>
              <div className="grid grid-cols-4 gap-x-3 gap-y-1.5">
                <F label="Bobbin No *" value={master.bobbin_no} onChange={v => handleMasterChange('bobbin_no', v)} />
                <F label="Fiber Length (KM)" value={master.fiber_length} onChange={v => handleMasterChange('fiber_length', v)} type="number" />
                <F label="Marker A" value={master.marker_a} onChange={v => handleMasterChange('marker_a', v)} />
                <F label="Marker B" value={master.marker_b} onChange={v => handleMasterChange('marker_b', v)} />
                <F label="Start Date" value={master.start_date} onChange={v => handleMasterChange('start_date', v)} type="date" />
                <F label="Start Time" value={master.start_time} onChange={v => handleMasterChange('start_time', v)} type="time" />
                <F label="End Date" value={master.end_date} onChange={v => handleMasterChange('end_date', v)} type="date" />
                <F label="End Time" value={master.end_time} onChange={v => handleMasterChange('end_time', v)} type="time" />
              </div>
            </div>

            {/* Personnel & Result */}
            <div className="w-[280px] bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex flex-col">
              <span className="text-[8px] font-bold text-amber-700 uppercase tracking-wider mb-2">Personnel & Result</span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 flex-1">
                <F label="Prepared By" value={master.prepared_by} onChange={v => handleMasterChange('prepared_by', v)} />
                <F label="Checked By" value={master.checked_by} onChange={v => handleMasterChange('checked_by', v)} />
                <F label="Physical Obs" value={master.physical_obs} onChange={v => handleMasterChange('physical_obs', v)} className="col-span-2" />
                <div className="flex flex-col gap-0.5">
                  <label className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Result</label>
                  <select value={master.result} onChange={e => handleMasterChange('result', e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-blue-400 bg-white">
                    <option value="">Select</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                  </select>
                </div>
                <F label="Remark" value={master.remark} onChange={v => handleMasterChange('remark', v)} />
              </div>
            </div>
          </div>

          {/* Section 3: Initial Attenuation — inline */}
          <div className="bg-violet-50/50 border border-violet-100 rounded-xl px-3 py-2 flex items-center gap-4">
            <span className="text-[8px] font-bold text-violet-700 uppercase tracking-wider whitespace-nowrap">Initial Attenuation (dB/KM):</span>
            <div className="flex gap-3 flex-1">
              <F label="AT 1310" value={master.at_1310} onChange={v => handleMasterChange('at_1310', v)} type="number" className="flex-1" />
              <F label="AT 1550" value={master.at_1550} onChange={v => handleMasterChange('at_1550', v)} type="number" className="flex-1" />
              <F label="AT 1625" value={master.at_1625} onChange={v => handleMasterChange('at_1625', v)} type="number" className="flex-1" />
            </div>
          </div>

          {/* Section 4: Cycle Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex-shrink-0">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-3 py-1.5 flex items-center gap-2">
              <Thermometer size={11} className="text-blue-300" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Temperature Cycle — 6 Fixed Rows</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100">
                <tr>
                  {['Temp (°C)', 'Date', 'Time', '1550 nm', '1625 nm', 'Δ 1550', 'Δ 1625', 'Operator', 'Remark'].map(h => (
                    <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-600 uppercase border-r border-slate-200 last:border-0 text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cycles.map((c, i) => (
                  <tr key={i} className={`border-t border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="px-2 py-1 text-center">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block min-w-[36px] ${
                        c.temperature === 23 ? 'bg-blue-100 text-blue-700' :
                        c.temperature === 85 ? 'bg-rose-100 text-rose-700' :
                        c.temperature === -60 ? 'bg-indigo-100 text-indigo-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>{c.temperature}°</span>
                    </td>
                    <td className="px-1 py-1"><input type="date" value={c.date} onChange={e => handleCycleChange(i, 'date', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 bg-white" /></td>
                    <td className="px-1 py-1"><input type="time" value={c.time} onChange={e => handleCycleChange(i, 'time', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 bg-white" /></td>
                    <td className="px-1 py-1"><input type="number" step="0.001" value={c.nm_1550} onChange={e => handleCycleChange(i, 'nm_1550', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 text-center bg-blue-50/50" placeholder="—" /></td>
                    <td className="px-1 py-1"><input type="number" step="0.001" value={c.nm_1625} onChange={e => handleCycleChange(i, 'nm_1625', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 text-center bg-blue-50/50" placeholder="—" /></td>
                    <td className="px-1 py-1"><input type="number" step="0.001" value={c.ch_nm_1550} onChange={e => handleCycleChange(i, 'ch_nm_1550', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-amber-300 text-center bg-amber-50/50" placeholder="—" /></td>
                    <td className="px-1 py-1"><input type="number" step="0.001" value={c.ch_nm_1625} onChange={e => handleCycleChange(i, 'ch_nm_1625', e.target.value)} className="w-full border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-amber-300 text-center bg-amber-50/50" placeholder="—" /></td>
                    <td className="px-1 py-1"><input value={c.operator} onChange={e => handleCycleChange(i, 'operator', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 bg-white" placeholder="Op" /></td>
                    <td className="px-1 py-1"><input value={c.remark} onChange={e => handleCycleChange(i, 'remark', e.target.value)} className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 bg-white" placeholder="—" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-md">
            {submitting ? 'Saving...' : isEdit ? 'Update Entry' : 'Create Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemperatureForm;
