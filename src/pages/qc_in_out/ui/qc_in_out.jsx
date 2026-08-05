import { useState, useRef, useEffect } from 'react';
import { Scan, Trash2, ClipboardCheck } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { Formik, Form } from 'formik';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';
import axios from 'axios';
import { validateBobbinForQCOut, submitQCOut } from '../services/qc_out.api';

const API = import.meta.env.VITE_API_URL;
const getQCUsers = async () => (await axios.get(`${API}/api/getqcusers`)).data;

const today = new Date().toISOString().split('T')[0];
const nowTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const initialFormValues = {
  date: today,
  user: '',
  shift: '',
  barcode: '',
};

/* ══════════════════════════════════════════════════════════ */
const QCInOut = () => {
  const [rows, setRows] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [qcUsers, setQcUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const scanRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, uRes] = await Promise.all([getAllShifts(), getQCUsers()]);
        setShifts(sRes?.data || []);
        setQcUsers(uRes?.data || []);
      } catch (e) { console.error('Load error:', e); }
    })();
  }, []);

  const shiftOptions = shifts.map(s => ({ label: s.shift_name, value: s.shift_name }));
  const userOptions = qcUsers.map(u => ({ label: u.qc_user_name, value: u.qc_user_name }));

  const refocus = (setFieldValue) => {
    setFieldValue('barcode', '');
    setTimeout(() => scanRef.current?.focus(), 50);
  };

  /* ── Scan bobbin ── */
  const handleScan = async (barcode, values, setFieldValue) => {
    const bobbin_no = barcode.trim();
    if (!bobbin_no) return;

    // Validate header fields
    if (!values.user) { showError('Select User first'); return; }
    if (!values.shift) { showError('Select Shift first'); return; }

    // Duplicate check
    if (rows.some(r => r.bobbin_no === bobbin_no)) {
      showError('This bobbin has already been scanned.');
      refocus(setFieldValue); return;
    }

    try {
      const data = await validateBobbinForQCOut(bobbin_no);

      if (!data?.success) {
        showError(data?.message || 'Bobbin not found.');
        refocus(setFieldValue); return;
      }

      const bobbin = data.data;
      
      // Check final_grade
      if (!bobbin.final_grade) {
        showError('Final grade is pending for this bobbin. Cannot proceed with QC Out.');
        refocus(setFieldValue); return;
      }

      const fg = bobbin.final_grade.toUpperCase();
      if (fg === 'FAIL' || fg === 'REW') {
        showError(`This bobbin cannot be QC Out because its final grade is ${fg}.`);
        refocus(setFieldValue); return;
      }

      // All good — add to grid
      setRows(prev => [...prev, {
        id: Date.now(),
        bobbin_no: bobbin.bobbin_no,
        bobbin_fid: bobbin.bobbin_fid || '',
        product_type: bobbin.product_type || '',
        fiber_color: bobbin.fiber_color || '',
        fiber_length: bobbin.fiber_length || '',
        final_grade: bobbin.final_grade || '',
        out_time: nowTime(),
      }]);
      
      refocus(setFieldValue);
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
      refocus(setFieldValue);
    }
  };
  /* ── Remove row ── */
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  /* ── Submit ── */
  const handleSubmit = async (values, resetForm) => {
    if (!rows.length) { showError('No bobbins scanned'); return; }
    if (!values.user) { showError('Select User'); return; }
    if (!values.shift) { showError('Select Shift'); return; }

    setSubmitting(true);
    try {
      const payload = {
        out_date: values.date,
        user: values.user,
        shift: values.shift,
        bobbins: rows.map(r => ({
          bobbin_no: r.bobbin_no,
          bobbin_fid: r.bobbin_fid,
          fiber_length: r.fiber_length,
          out_time: r.out_time,
        })),
      };

      const res = await submitQCOut(payload);

      if (res?.success) {
        showSuccess(`${rows.length} bobbin(s) submitted for QC Out successfully!`);
        setRows([]);
        resetForm();
      } else {
        showError(res?.message || 'Submit failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik initialValues={initialFormValues} onSubmit={() => {}}>
          {({ values, setFieldValue, resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Action bar ── */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">QC Out</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => { resetForm(); setRows([]); }}>Reset</ResetButton>
                  <SubmitButton compact type="button" disabled={submitting || !rows.length}
                    onClick={() => handleSubmit(values, resetForm)}>
                    {submitting ? 'Saving...' : `Submit (${rows.length})`}
                  </SubmitButton>
                </div>
              </div>

              {/* ── Header fields ── */}
              <ModuleCard compact title="QC Out Entry" icon={<ClipboardCheck size={13} className="text-blue-600" />}>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <FormikInput compact label="Date" name="date" type="date" />
                    <FormikSelect compact label="QC User" name="user" options={userOptions} />
                    <FormikSelect compact label="Shift" name="shift" options={shiftOptions} />
                  </div>

                  {/* Scan row */}
                  <div className="flex items-end gap-2 pt-1 border-t border-slate-100">
                    <div className="flex-1 max-w-sm">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 block mb-0.5">Scan Bobbin</label>
                      <input ref={scanRef} value={values.barcode}
                        onChange={e => setFieldValue('barcode', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(values.barcode, values, setFieldValue); } }}
                        placeholder="Scan bobbin barcode..."
                        className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>
                    <button type="button" onClick={() => handleScan(values.barcode, values, setFieldValue)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px]">
                      <Scan size={10} /> Scan
                    </button>
                    <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                      {rows.length} scanned
                    </span>
                  </div>
                </div>
              </ModuleCard>

              {/* ── Table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <ClipboardCheck size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Scanned Bobbins</span>
                  {rows.length > 0 && (
                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">{rows.length}</span>
                  )}
                </div>

                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        {['#', 'Bobbin No', 'Bobbin FID', 'Product Type', 'Color', 'Fiber Length', 'Final Grade', 'Out Time', ''].map(h => (
                          <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.length === 0 ? (
                        <tr><td colSpan={9} className="px-4 py-10 text-center text-[10px] text-slate-400">Scan a bobbin barcode to begin</td></tr>
                      ) : rows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-blue-50/20 transition-colors group">
                          <td className="px-3 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                          <td className="px-3 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.bobbin_no}</td>
                          <td className="px-3 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.bobbin_fid || '—'}</td>
                          <td className="px-3 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.product_type || '—'}</td>
                          <td className="px-3 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.fiber_color || '—'}</td>
                          <td className="px-3 py-1.5 text-xs font-mono text-emerald-700 font-bold border-r border-slate-100">{row.fiber_length || '—'}</td>
                          <td className="px-3 py-1.5 border-r border-slate-100">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{row.final_grade}</span>
                          </td>
                          <td className="px-3 py-1.5 text-xs text-slate-400 border-r border-slate-100">{row.out_time}</td>
                          <td className="px-3 py-1.5 text-center">
                            <button type="button" onClick={() => removeRow(row.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default QCInOut;
