import { useState, useEffect } from 'react';
import { Plus, Edit2, XCircle, FileText } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/toastService';
import { getSpecList, deactivateSpec } from './SpecService';

const SpecList = ({ onCreateNew, onEdit }) => {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const fetchSpecs = async () => {
    setLoading(true);
    try {
      const res = await getSpecList();
      if (res?.success) setSpecs(res.data || []);
    } catch (e) { showError('Failed to load specifications'); }
    setLoading(false);
  };

  useEffect(() => { fetchSpecs(); }, []);

  const handleDeactivate = async () => {
    if (!confirmId) return;
    try {
      const res = await deactivateSpec(confirmId);
      if (res?.success) { showSuccess('Specification deactivated'); fetchSpecs(); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError('Deactivation failed'); }
    setConfirmId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-indigo-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Specifications</span>
          <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{specs.length}</span>
        </div>
        <button onClick={onCreateNew}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
          <Plus size={12} /> Create New Spec
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><span className="text-xs text-slate-400">Loading...</span></div>
        ) : specs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <FileText size={32} className="text-slate-200" />
            <p className="text-xs text-slate-400">No specifications found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 text-white z-10">
              <tr>
                {['Customer', 'Spec Name', 'PO No', 'PT Strain', 'Product', 'Coating', 'Priority', 'Qty (KM)', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {specs.map(s => (
                <tr key={s.spec_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-3 py-2 text-[10px] font-semibold text-slate-700">{s.customer_name}</td>
                  <td className="px-3 py-2 text-[10px] text-blue-700 font-mono">{s.cust_spec_name}</td>
                  <td className="px-3 py-2 text-[10px] text-slate-600">{s.po_number || '—'}</td>
                  <td className="px-3 py-2 text-[10px] text-slate-600">{s.pt_strain || '—'}</td>
                  <td className="px-3 py-2 text-[10px] text-slate-600">{s.product_type || '—'}</td>
                  <td className="px-3 py-2 text-[10px] text-slate-600">{s.coating_type || '—'}</td>
                  <td className="px-3 py-2 text-[10px] text-center font-bold text-amber-700">{s.priority}</td>
                  <td className="px-3 py-2 text-[10px] font-mono text-emerald-700">{s.quantity_km || '—'}</td>
                  <td className="px-3 py-2 text-[9px] text-slate-400">{s.created_at ? s.created_at.split('T')[0] : '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(s.spec_id)} className="px-2 py-1 bg-blue-50 text-blue-700 text-[8px] font-bold rounded hover:bg-blue-100"><Edit2 size={9} className="inline mr-0.5" />Edit</button>
                      <button onClick={() => setConfirmId(s.spec_id)} className="px-2 py-1 bg-rose-50 text-rose-700 text-[8px] font-bold rounded hover:bg-rose-100"><XCircle size={9} className="inline mr-0.5" />Deactivate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-80 text-center">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Confirm Deactivation</h3>
            <p className="text-xs text-slate-500 mb-4">This specification will be deactivated. It will no longer appear in the list.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={handleDeactivate} className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecList;
