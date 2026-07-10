import { useState, useEffect } from 'react';
import { Grid3X3, Plus, Eye, Power, ArrowLeft, Loader2, Search, X, Minus } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../../../components/common_buttons';
import { showSuccess, showError } from '../../../../../utils/toastService';
import { getAllTrays, createTray, deactivateTray, getTrayPositions, addPositions, removePositions } from '../services/tray.api';

/* ══════════════════════════════════════════════════════════ */
const TrayManagement = () => {
  const [trays, setTrays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [viewTray, setViewTray] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const fetchTrays = async () => {
    setLoading(true);
    try { const res = await getAllTrays(); setTrays(res?.data || []); }
    catch (_) {}
    setLoading(false);
  };
  useEffect(() => { fetchTrays(); }, []);

  const handleDeactivate = async () => {
    try {
      const res = await deactivateTray(confirmDeactivate.tray_id);
      if (res?.success) { showSuccess('Tray deactivated'); fetchTrays(); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
    setConfirmDeactivate(null);
  };

  /* ── View Positions ── */
  if (viewTray) return <TrayPositionsView tray={viewTray} onBack={() => { setViewTray(null); fetchTrays(); }} />;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Grid3X3 size={15} className="text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tray Management</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{trays.length}</span>
          </div>
          <button type="button" onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
            <Plus size={11} /> Create Tray
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 size={18} className="text-blue-500 animate-spin" /></div> : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['Tray No','Tray Name','Total Positions','Active','Created','Actions'].map(h =>
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trays.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">No trays</td></tr> :
              trays.map(t => (
                <tr key={t.tray_id} className="hover:bg-blue-50/30">
                  <td className="px-4 py-2.5 text-xs font-bold text-blue-700 border-r border-slate-100">{t.tray_no}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-700 border-r border-slate-100">{t.tray_name || '—'}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-600 border-r border-slate-100">{t.total_positions}</td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${t.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setViewTray(t)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-bold rounded hover:bg-blue-100"><Eye size={9} /> Positions</button>
                      {t.is_active && <button type="button" onClick={() => setConfirmDeactivate(t)}
                        className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-bold rounded hover:bg-rose-100"><Power size={9} /> Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>)}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && <CreateTrayModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchTrays(); }} />}

      {/* Deactivate Confirm */}
      {confirmDeactivate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-80 text-center">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Deactivate Tray {confirmDeactivate.tray_no}?</h3>
            <p className="text-xs text-slate-500 mb-4">This will mark the tray as inactive.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDeactivate(null)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={handleDeactivate} className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700">Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Create Tray Modal ── */
const CreateTrayModal = ({ onClose, onCreated }) => {
  const [trayNo, setTrayNo] = useState('');
  const [trayName, setTrayName] = useState('');
  const [totalPositions, setTotalPositions] = useState('60');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!trayNo) { showError('Tray Number is required'); return; }
    if (!totalPositions || Number(totalPositions) < 1) { showError('Minimum 1 position'); return; }
    setSubmitting(true);
    try {
      const res = await createTray({ tray_no: Number(trayNo), tray_name: trayName, total_positions: Number(totalPositions) });
      if (res?.success) { showSuccess('Tray created successfully'); onCreated(); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">Create Tray</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded"><X size={16} /></button>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Tray Number *</label>
            <input type="number" value={trayNo} onChange={e => setTrayNo(e.target.value)} placeholder="e.g. 1"
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Tray Name</label>
            <input value={trayName} onChange={e => setTrayName(e.target.value)} placeholder="e.g. Tray A"
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Total Positions</label>
            <input type="number" min="1" value={totalPositions} onChange={e => setTotalPositions(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={onClose} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Tray Positions View ── */
const TrayPositionsView = ({ tray, onBack }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addCount, setAddCount] = useState('');
  const [removeCount, setRemoveCount] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    try { const res = await getTrayPositions(tray.tray_id); setPositions(res?.data || []); }
    catch (_) {}
    setLoading(false);
  };
  useEffect(() => { fetchPositions(); }, []);

  const handleAdd = async () => {
    if (!addCount || Number(addCount) < 1) { showError('Enter valid count'); return; }
    setProcessing(true);
    try {
      const res = await addPositions(tray.tray_id, Number(addCount));
      if (res?.success) { showSuccess(`${addCount} positions added`); fetchPositions(); setShowAddModal(false); setAddCount(''); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
    setProcessing(false);
  };

  const handleRemove = async () => {
    if (!removeCount || Number(removeCount) < 1) { showError('Enter valid count'); return; }
    setProcessing(true);
    try {
      const res = await removePositions(tray.tray_id, Number(removeCount));
      if (res?.success) { showSuccess(`${removeCount} positions removed`); fetchPositions(); setShowRemoveModal(false); setRemoveCount(''); }
      else showError(res?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
    setProcessing(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={11} /> Back</button>
            <Grid3X3 size={14} className="text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700">Tray {tray.tray_no} — {tray.tray_name || ''}</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{positions.length} positions</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded-lg hover:bg-emerald-700"><Plus size={10} /> Add Positions</button>
            <button type="button" onClick={() => setShowRemoveModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[9px] font-bold rounded-lg hover:bg-rose-700"><Minus size={10} /> Remove Positions</button>
          </div>
        </div>

        {/* Position Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 size={18} className="text-blue-500 animate-spin" /></div> : (
          <div className="grid grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
            {positions.map(pos => (
              <div key={pos.tray_position_id}
                className={`flex flex-col items-center justify-center rounded-lg border p-2 min-h-[60px] transition-all ${
                  pos.status === 'OCCUPIED'
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                <span className="text-[8px] font-bold text-slate-500">Pos {pos.position_no}</span>
                {pos.status === 'OCCUPIED' ? (
                  <span className="text-[7px] font-mono font-bold text-blue-700 mt-0.5 text-center break-all">{pos.bobbin_no}</span>
                ) : (
                  <span className="text-[8px] text-emerald-600 font-bold mt-0.5">EMPTY</span>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-72">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Add Positions</h3>
            <input type="number" min="1" value={addCount} onChange={e => setAddCount(e.target.value)} placeholder="How many?"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={handleAdd} disabled={processing} className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">{processing ? 'Adding...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl shadow-2xl p-5 w-72">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Remove Last Positions</h3>
            <p className="text-[9px] text-slate-500 mb-3">Only empty positions from the end can be removed.</p>
            <input type="number" min="1" value={removeCount} onChange={e => setRemoveCount(e.target.value)} placeholder="How many?"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setShowRemoveModal(false)} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={handleRemove} disabled={processing} className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-50">{processing ? 'Removing...' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrayManagement;
