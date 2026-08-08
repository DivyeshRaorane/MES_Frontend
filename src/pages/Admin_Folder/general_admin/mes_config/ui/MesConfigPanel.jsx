import { useState, useEffect } from 'react';
import {
  Plus, Edit2, ArrowLeft, Loader2, Search, Power, Settings, X,
} from 'lucide-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FormikInput } from '../../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../../components/common_buttons';
import { showSuccess, showError } from '../../../../../utils/toastService';
import {
  getAllConfigs,
  createConfig,
  updateConfig,
  toggleConfigStatus,
} from '../services/mes_config.api';

/* ══════════════════════════════════════════════════════════
   MES CONFIG PANEL - Main Component
   ══════════════════════════════════════════════════════════ */
const MesConfigPanel = ({ onBack }) => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await getAllConfigs();
      setConfigs(res?.data || []);
    } catch (e) {
      console.error(e);
      showError('Failed to fetch configurations');
    }
    setLoading(false);
  };

  useEffect(() => { fetchConfigs(); }, []);

  const filtered = configs.filter(c => {
    const q = search.toLowerCase();
    return !q
      || c.config_key?.toLowerCase().includes(q)
      || c.config_value?.toLowerCase().includes(q)
      || c.description?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await toggleConfigStatus(item.id, !item.disable);
      if (res?.success) {
        showSuccess(`${!item.disable ? 'Disabled' : 'Enabled'} successfully`);
        fetchConfigs();
      } else {
        showError(res?.message || 'Failed to toggle status');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-600 bg-purple-100">
              <Settings size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">MES Config</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
              {configs.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={() => { setEditItem(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Config
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {['ID', 'Config Key', 'Config Value', 'Description', 'Status', 'Updated By', 'Updated At', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-400">No configurations found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{c.id}</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{c.config_key}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-600 border-r border-slate-100 max-w-[180px] truncate">{c.config_value}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 border-r border-slate-100 max-w-[200px] truncate">{c.description || '—'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.disable ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {c.disable ? 'Disabled' : 'Enabled'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 border-r border-slate-100">{c.updated_by || '—'}</td>
                    <td className="px-3 py-2.5 text-[9px] text-slate-400 border-r border-slate-100">
                      {c.updated_at ? new Date(c.updated_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => { setEditItem(c); setShowForm(true); }}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                          <Edit2 size={9} /> Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(c)}
                          className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                            c.disable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}>
                          <Power size={9} /> {c.disable ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ConfigFormModal
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={() => { setShowForm(false); setEditItem(null); fetchConfigs(); }}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   CONFIG FORM MODAL (Create / Edit)
   ══════════════════════════════════════════════════════════ */
const ConfigFormModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item;
  const [submitting, setSubmitting] = useState(false);

  const schema = Yup.object({
    config_key: Yup.string().required('Config key is required').max(100, 'Max 100 characters'),
    config_value: Yup.string().required('Config value is required').max(255, 'Max 255 characters'),
    description: Yup.string().max(500, 'Max 500 characters'),
  });

  const initVals = {
    config_key: item?.config_key || '',
    config_value: item?.config_value || '',
    description: item?.description || '',
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        res = await updateConfig(item.id, values);
      } else {
        res = await createConfig(values);
      }
      if (res?.success) {
        showSuccess(isEdit ? 'Config updated successfully' : 'Config created successfully');
        onSaved();
      } else {
        showError(res?.message || 'Operation failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-700">{isEdit ? 'Edit Config' : 'Create Config'}</span>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
            <X size={16} />
          </button>
        </div>
        <div className="px-4 py-4">
          <Formik initialValues={initVals} validationSchema={schema} onSubmit={handleSubmit} enableReinitialize>
            <Form className="flex flex-col gap-3">
              <FormikInput compact label="Config Key" name="config_key" placeholder="e.g. APP_MODE" disabled={isEdit} />
              <FormikInput compact label="Config Value" name="config_value" placeholder="e.g. production" />
              <FormikInput compact label="Description" name="description" placeholder="Optional description" />
              <div className="flex justify-between gap-3 pt-2 border-t border-slate-100">
                <ResetButton compact type="button" onClick={onClose}>Cancel</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                </SubmitButton>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default MesConfigPanel;
