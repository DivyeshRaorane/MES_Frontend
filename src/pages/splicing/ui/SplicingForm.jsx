import { useState, useEffect } from 'react';
import { X, Cable } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toastService';
import { getSplicingById, createSplicing, updateSplicing } from '../services/splicingService';

const F = ({ label, value, onChange, type = 'text', className = '' }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    <label className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      step={type === 'number' ? '0.001' : undefined}
      className="border border-slate-200 rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-pink-400 bg-white" />
  </div>
);

const SplicingForm = ({ entryId, onClose }) => {
  const [form, setForm] = useState({
    bobbin_a_no: '', bobbin_b_no: '', machine_loss: '', product_type: '', brand_name: '', remark: '',
    a_1310: '', a_1550: '', a_1625: '',
    b_1310: '', b_1550: '', b_1625: '',
    ave_loss_1310: '', ave_loss_1550: '', ave_loss_1625: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!entryId;

  useEffect(() => {
    if (entryId) {
      (async () => {
        setLoading(true);
        try {
          const res = await getSplicingById(entryId);
          if (res?.success && res.data) {
            const d = res.data;
            setForm({
              bobbin_a_no: d.bobbin_a_no || '', bobbin_b_no: d.bobbin_b_no || '',
              machine_loss: d.machine_loss ?? '', product_type: d.product_type || '',
              brand_name: d.brand_name || '', remark: d.remark || '',
              a_1310: d.a_1310 ?? '', a_1550: d.a_1550 ?? '', a_1625: d.a_1625 ?? '',
              b_1310: d.b_1310 ?? '', b_1550: d.b_1550 ?? '', b_1625: d.b_1625 ?? '',
              ave_loss_1310: d.ave_loss_1310 ?? '', ave_loss_1550: d.ave_loss_1550 ?? '', ave_loss_1625: d.ave_loss_1625 ?? '',
            });
          }
        } catch (e) { showError(`Failed to load: ${e?.response?.data?.message || e?.message}`); }
        setLoading(false);
      })();
    }
  }, [entryId]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.bobbin_a_no || !form.bobbin_b_no) { showError('Bobbin A and Bobbin B are required'); return; }
    setSubmitting(true);
    try {
      const res = isEdit ? await updateSplicing(entryId, form) : await createSplicing(form);
      if (res?.success) { showSuccess(isEdit ? 'Splicing updated' : 'Splicing entry created'); onClose(); }
      else showError(res?.message || 'Save failed');
    } catch (e) { showError(e?.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };

  if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"><span className="text-white">Loading...</span></div>;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl shadow-2xl w-[95vw] max-w-[850px] flex flex-col overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Cable size={16} className="text-white/80" />
            <h2 className="text-sm font-bold text-white">{isEdit ? 'Edit Splicing Entry' : 'New Splicing Entry'}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-3 overflow-y-auto">
          {/* Basic Info */}
          <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-3">
            <span className="text-[8px] font-bold text-pink-700 uppercase tracking-wider">Basic Info</span>
            <div className="grid grid-cols-5 gap-3 mt-2">
              <F label="Bobbin A No *" value={form.bobbin_a_no} onChange={v => set('bobbin_a_no', v)} />
              <F label="Bobbin B No *" value={form.bobbin_b_no} onChange={v => set('bobbin_b_no', v)} />
              <F label="Machine Loss" value={form.machine_loss} onChange={v => set('machine_loss', v)} type="number" />
              <F label="Product Type" value={form.product_type} onChange={v => set('product_type', v)} />
              <F label="Brand Name" value={form.brand_name} onChange={v => set('brand_name', v)} />
            </div>
          </div>

          {/* Direction A */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2">
            <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">Direction A (A→B)</span>
            <div className="grid grid-cols-3 gap-3 mt-1.5">
              <F label="A 1310 (dB)" value={form.a_1310} onChange={v => set('a_1310', v)} type="number" />
              <F label="A 1550 (dB)" value={form.a_1550} onChange={v => set('a_1550', v)} type="number" />
              <F label="A 1625 (dB)" value={form.a_1625} onChange={v => set('a_1625', v)} type="number" />
            </div>
          </div>

          {/* Direction B */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2">
            <span className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider">Direction B (B→A)</span>
            <div className="grid grid-cols-3 gap-3 mt-1.5">
              <F label="B 1310 (dB)" value={form.b_1310} onChange={v => set('b_1310', v)} type="number" />
              <F label="B 1550 (dB)" value={form.b_1550} onChange={v => set('b_1550', v)} type="number" />
              <F label="B 1625 (dB)" value={form.b_1625} onChange={v => set('b_1625', v)} type="number" />
            </div>
          </div>

          {/* Average Loss */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl px-3 py-2">
            <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">Average Loss</span>
            <div className="grid grid-cols-3 gap-3 mt-1.5">
              <F label="Avg Loss 1310 (dB)" value={form.ave_loss_1310} onChange={v => set('ave_loss_1310', v)} type="number" />
              <F label="Avg Loss 1550 (dB)" value={form.ave_loss_1550} onChange={v => set('ave_loss_1550', v)} type="number" />
              <F label="Avg Loss 1625 (dB)" value={form.ave_loss_1625} onChange={v => set('ave_loss_1625', v)} type="number" />
            </div>
          </div>

          {/* Remark */}
          <div className="flex flex-col gap-0.5">
            <label className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">Remark</label>
            <textarea value={form.remark} onChange={e => set('remark', e.target.value)} rows={2}
              className="border border-slate-200 rounded px-2 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-pink-400 bg-white resize-none" />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-white flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 shadow-md">
            {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplicingForm;
