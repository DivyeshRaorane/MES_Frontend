import { useState, useEffect } from 'react';
import { X, Activity, Plus, Trash2 } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toastService';
import { getDfEntryById, createDfEntry, updateDfEntry } from '../services/dfEntryService';

const SPEEDS = ['0.5', '5', '50', '500'];
const FIBER_TYPES = ['Unaged Fiber', 'Aged Fiber'];

const makeRow = (speed) => ({ speed, ts_kg: '', ext_mm: '', gpa: '', time_min: '', stress_rate: '', ln_stress_rate: '', ln_stress: '', slope: '', n_value: '' });

const F = ({ label, value, onChange, type = 'text', className = '' }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      step={type === 'number' ? '0.001' : undefined}
      className="border border-slate-200 rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-400 bg-white" />
  </div>
);

const DFForm = ({ entryId, onClose }) => {
  const [master, setMaster] = useState({ bobbin_no: '', format_no: '', gr_clause_no: '', title: '' });
  const [activeTab, setActiveTab] = useState('Unaged Fiber');
  // Data grouped: { 'Unaged Fiber': { '0.5': [...rows], '5': [...], '50': [...], '500': [...] }, 'Aged Fiber': {...} }
  const [speedData, setSpeedData] = useState(() => {
    const init = {};
    FIBER_TYPES.forEach(ft => { init[ft] = {}; SPEEDS.forEach(s => { init[ft][s] = [makeRow(s)]; }); });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!entryId;

  useEffect(() => {
    if (entryId) {
      (async () => {
        setLoading(true);
        try {
          const res = await getDfEntryById(entryId);
          if (res?.success) {
            const m = res.data.master || {};
            setMaster({ bobbin_no: m.bobbin_no || '', format_no: m.format_no || '', gr_clause_no: m.gr_clause_no ?? '', title: m.title || '' });
            if (res.data.speeds?.length > 0) {
              const grouped = {};
              FIBER_TYPES.forEach(ft => { grouped[ft] = {}; SPEEDS.forEach(s => { grouped[ft][s] = []; }); });
              res.data.speeds.forEach(r => {
                const ft = r.fiber_type || 'Unaged Fiber';
                const rawSpeed = parseFloat(r.speed);
                const sp = rawSpeed === 0.5 ? '0.5' : rawSpeed === 5 ? '5' : rawSpeed === 50 ? '50' : rawSpeed === 500 ? '500' : String(rawSpeed);
                if (!grouped[ft]) grouped[ft] = {};
                if (!grouped[ft][sp]) grouped[ft][sp] = [];
                grouped[ft][sp].push({
                  speed: sp, ts_kg: r.ts_kg ?? '', ext_mm: r.ext_mm ?? '', gpa: r.gpa ?? '',
                  time_min: r.time_min ?? '', stress_rate: r.stress_rate ?? '',
                  ln_stress_rate: r.ln_stress_rate ?? '', ln_stress: r.ln_stress ?? '',
                  slope: r.slope ?? '', n_value: r.n_value ?? '',
                });
              });
              // Ensure at least 1 row per speed
              FIBER_TYPES.forEach(ft => { SPEEDS.forEach(s => { if (!grouped[ft][s]?.length) grouped[ft][s] = [makeRow(s)]; }); });
              setSpeedData(grouped);
            }
          }
        } catch (e) { showError(`Failed to load: ${e?.response?.data?.message || e?.message}`); }
        setLoading(false);
      })();
    }
  }, [entryId]);

  const setM = (key, val) => setMaster(prev => ({ ...prev, [key]: val }));

  const updateCell = (fiberType, speed, idx, key, val) => {
    setSpeedData(prev => {
      const updated = { ...prev };
      updated[fiberType] = { ...updated[fiberType] };
      updated[fiberType][speed] = [...updated[fiberType][speed]];
      updated[fiberType][speed][idx] = { ...updated[fiberType][speed][idx], [key]: val };
      return updated;
    });
  };

  const addRow = (fiberType, speed) => {
    setSpeedData(prev => {
      const updated = { ...prev };
      updated[fiberType] = { ...updated[fiberType] };
      updated[fiberType][speed] = [...updated[fiberType][speed], makeRow(speed)];
      return updated;
    });
  };

  const removeRow = (fiberType, speed, idx) => {
    setSpeedData(prev => {
      const updated = { ...prev };
      updated[fiberType] = { ...updated[fiberType] };
      updated[fiberType][speed] = updated[fiberType][speed].filter((_, i) => i !== idx);
      if (updated[fiberType][speed].length === 0) updated[fiberType][speed] = [makeRow(speed)];
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!master.bobbin_no) { showError('Bobbin No is required'); return; }
    setSubmitting(true);
    try {
      // Flatten all speed data into rows
      const allRows = [];
      FIBER_TYPES.forEach(ft => {
        SPEEDS.forEach(sp => {
          const rows = speedData[ft]?.[sp] || [makeRow(sp)];
          rows.forEach(row => {
            allRows.push({ ...row, fiber_type: ft, speed: sp });
          });
        });
      });
      const payload = { master, speeds: allRows };
      const res = isEdit ? await updateDfEntry(entryId, payload) : await createDfEntry(payload);
      if (res?.success) { showSuccess(isEdit ? 'Entry updated' : 'Entry created'); onClose(); }
      else showError(res?.message || 'Save failed');
    } catch (e) { showError(e?.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };

  if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"><span className="text-white">Loading...</span></div>;

  const currentData = speedData[activeTab] || {};

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-2">
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl shadow-2xl w-[98vw] max-w-[1250px] max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-white/80" />
            <h2 className="text-sm font-bold text-white">{isEdit ? 'Edit Dynamic Fatigue' : 'New Dynamic Fatigue Entry'}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 px-4 py-2 flex flex-col gap-2 overflow-hidden">
          {/* Master */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2 flex-shrink-0">
            <div className="grid grid-cols-4 gap-3">
              <F label="Bobbin No (Sample ID) *" value={master.bobbin_no} onChange={v => setM('bobbin_no', v)} />
              <F label="Format No" value={master.format_no} onChange={v => setM('format_no', v)} />
              <F label="GR Clause No" value={master.gr_clause_no} onChange={v => setM('gr_clause_no', v)} type="number" />
              <F label="Title" value={master.title} onChange={v => setM('title', v)} />
            </div>
          </div>

          {/* Fiber Type Tabs */}
          <div className="flex gap-1 flex-shrink-0">
            {FIBER_TYPES.map(ft => (
              <button key={ft} onClick={() => setActiveTab(ft)}
                className={`px-4 py-1.5 text-[10px] font-bold rounded-t-lg transition-all ${activeTab === ft ? 'bg-yellow-400 text-slate-900' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                {ft}
              </button>
            ))}
          </div>

          {/* Speed Tables */}
          <div className="flex-1 min-h-0 overflow-y-auto border border-slate-200 rounded-xl bg-white">
            {SPEEDS.map(speed => (
              <div key={speed} className="border-b border-slate-200 last:border-0">
                <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between sticky top-0 z-10">
                  <span className="text-[9px] font-bold text-slate-700 uppercase">{speed} mm/min</span>
                  <button type="button" onClick={() => addRow(activeTab, speed)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded hover:bg-emerald-600">
                    <Plus size={8} /> Add
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      {['#', 'T.S (Kg)', 'Ext (mm)', 'GPa', 'Time(min)', 'Stress Rate', 'Ln(Stress Rate)', 'Ln(Stress)', 'Slope', 'N-Value', ''].map(h => (
                        <th key={h} className="px-1 py-1 text-[7px] font-bold text-slate-500 uppercase text-center border-r border-slate-100 last:border-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(currentData[speed] || []).map((row, idx) => (
                      <tr key={idx} className="border-t border-slate-50">
                        <td className="px-1 py-0.5 text-center text-[8px] text-slate-400">{idx + 1}</td>
                        {['ts_kg', 'ext_mm', 'gpa', 'time_min', 'stress_rate', 'ln_stress_rate', 'ln_stress', 'slope', 'n_value'].map(k => (
                          <td key={k} className="px-0.5 py-0.5">
                            <input type="number" step="0.01" value={row[k]} onChange={e => updateCell(activeTab, speed, idx, k, e.target.value)}
                              className="w-full border border-slate-200 rounded px-1 py-0.5 text-[9px] outline-none text-center focus:ring-1 focus:ring-emerald-300" placeholder="—" />
                          </td>
                        ))}
                        <td className="px-0.5 py-0.5 text-center">
                          {(currentData[speed] || []).length > 1 && (
                            <button onClick={() => removeRow(activeTab, speed, idx)} className="text-slate-300 hover:text-rose-500"><Trash2 size={10} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-slate-200 bg-white flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 shadow-md">
            {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DFForm;
