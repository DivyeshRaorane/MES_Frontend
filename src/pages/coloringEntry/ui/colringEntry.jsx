import { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Layers, Ruler, Clock, Scan } from 'lucide-react';
import { FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { scanBobbinForColoring, saveColourEntry, getPTUsers } from '../services/coloring.api';
import { getBobbinColors } from '../../Admin_Folder/proof_testing/bobbin_color/service/bobbin_color.api';
import { getBobbinTypes } from '../../Admin_Folder/proof_testing/bobbin_type/service/bobbin_type.api';

const MACHINES = [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }];
const BATCH_CODES = ['Select', 'CBC-001', 'CBC-002', 'CBC-003', 'CBC-004'];

const validationSchema = Yup.object({
  fiber_length: Yup.number().typeError('Must be a number').required('Length is required').min(0.001, 'Must be > 0'),
  machine_no: Yup.mixed().required('Machine is required'),
  operator: Yup.string().required('Operator is required'),
});

/* ══════════════════════════════════════════════════════════ */
const ColoringEntry = () => {
  const [scanInput, setScanInput] = useState('');
  const [fgColor, setFgColor] = useState(null);
  const [history, setHistory] = useState([]);
  const [ptUsers, setPtUsers] = useState([]);
  const [bobbinTypes, setBobbinTypes] = useState([]);
  const [bobbinColors, setBobbinColors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [generatedFid, setGeneratedFid] = useState('');
  const scanRef = useRef(null);
console.log("fgcolor:", fgColor)
  useEffect(() => {
    (async () => {
      try {
        const [uRes, tRes, cRes] = await Promise.all([getPTUsers(), getBobbinTypes(), getBobbinColors()]);
        setPtUsers(uRes?.data || []);
        setBobbinTypes(tRes?.data || []);
        setBobbinColors(cRes?.data || []);
      } catch (_) {}
    })();
  }, []);

  const operatorOptions = ptUsers.map(u => ({ label: u.pt_user_name || u.draw_user_name, value: u.pt_user_name || u.draw_user_name }));
  const bobbinTypeOptions = bobbinTypes.map(t => ({ label: t.bobbin_type_name, value: t.bobbin_type_name }));
  const bobbinColorOptions = bobbinColors.map(c => ({ label: c.bobbin_color_name, value: c.bobbin_color_name }));

  /* ── Scan ── */
  const handleScan = async (setValues) => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;
    try {
      const res = await scanBobbinForColoring(bobbin_no);
      console.log("what is the bobbin res", res)
      if (!res?.success) { showError(res?.message || 'No pending coloring request found for this bobbin.'); return; }
      setFgColor(res.data.fg_color);
      setHistory(res.data.history || []);
      setGeneratedFid('');
      setValues(prev => ({
        ...prev,
        bobbin_no: res.data.fg_color.bobbin_no,
        original_color: res.data.fg_color.current_color || '',
        require_color: res.data.fg_color.require_color || '',
        total_length: res.data.fg_color.total_length || '',
        balance_length: (res.data.fg_color.balance_length ?? res.data.fg_color.total_length) || '',
        qc_remark: res.data.fg_color.remark || '',
        fiber_length: '', is_scrap: false,
        color_batch_code: '', machine_no: '', die_change: 'No',
        bobbin_type: '', operator: '', bobbin_color: '', remark: '',
      }));
    } catch (e) { showError(e?.response?.data?.message || 'Scan failed'); }
  };

  /* ── Generate FID ── */
  const handleGenerateFid = () => {
    if (!fgColor) return;
    const parentFid = fgColor.bobbin_fid || '';
    const lastChild = fgColor.last_child_fid;
    const count = fgColor.count || 0;
    let newFid;
    if (!lastChild || count === 0) { newFid = parentFid + 'CA'; }
    else { const lastChar = lastChild.slice(-1); newFid = lastChild.slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0) + 1); }
    setGeneratedFid(newFid);
    return newFid;
  };

  /* ── Submit ── */
  const handleSubmit = async (values, { setFieldValue }) => {
    console.log('Submit clicked, fgColor:', fgColor, 'values:', values);
    if (!fgColor) { showError('Scan a bobbin first'); return; }
    const len = parseFloat(values.fiber_length) || 0;
    const isScrap = values.is_scrap;
    const available = parseFloat(values.balance_length) || 0;
    const remaining = available - len;

    if (remaining < 0) { showError('Entered length exceeds available balance length.'); return; }

    // FID only when NOT scrap
    let fid = '';
    if (!isScrap && len > 0) { fid = generatedFid || handleGenerateFid(); }

    setSubmitting(true);
    try {
      const payload = {
        bobbin_no: values.bobbin_no, fg_color_id: fgColor.fg_color_id,
        original_color: values.original_color, require_color: values.require_color,
        color_batch_code: values.color_batch_code,
        fiber_length: len,
        is_scrap: isScrap,
        machine_no: values.machine_no, die_change: values.die_change,
        generated_fid: fid, bobbin_type: values.bobbin_type,
        operator: values.operator, bobbin_color: values.bobbin_color, remark: values.remark,
      };

      console.log("payload:", payload);
      const res = await saveColourEntry(payload);
      if (res?.success) {
        if (remaining === 0) showSuccess('Coloring completed successfully.');
        else showSuccess(`Color Entry saved. ${remaining.toFixed(3)} KM still pending.`);
        setFgColor(prev => ({ ...prev, balance_length: remaining, is_done: remaining === 0,
          last_child_fid: fid || prev.last_child_fid, count: fid ? (prev.count || 0) + 1 : prev.count }));
        setHistory(res.data?.history || history);
        setGeneratedFid('');
        setFieldValue('balance_length', remaining.toFixed(3));
        setFieldValue('fiber_length', ''); setFieldValue('is_scrap', false);
        setFieldValue('color_batch_code', ''); setFieldValue('remark', '');
      } else showError(res?.message || 'Save failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  const initialValues = {
    bobbin_no: '', original_color: '', require_color: '', total_length: '', balance_length: '',
    qc_remark: '', fiber_length: '', is_scrap: false, color_batch_code: '', machine_no: '',
    die_change: 'No', bobbin_type: '', operator: '', bobbin_color: '', remark: '',
  };

  return (
    <div className="h-full font-sans text-slate-800 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      <div className="flex flex-col flex-1 overflow-hidden m-2">
        <Formik initialValues={initialValues} validationSchema={validationSchema} validateOnChange={false} validateOnBlur={true}
          onSubmit={(v, helpers) => handleSubmit(v, helpers)}>
          {({ values, setValues, setFieldValue, resetForm, errors, isValid }) => {
            const len = parseFloat(values.fiber_length) || 0;
            const available = parseFloat(values.balance_length) || 0;
            const remaining = available - len;
            if (Object.keys(errors).length > 0) console.log('Formik errors:', errors);

            return (
              <Form className="flex flex-col flex-1 overflow-hidden gap-2">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Layers size={18} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-base font-bold text-slate-900">Coloring Entry</h1>
                      <p className="text-[9px] text-slate-400">Scan bobbin → Enter details → Save</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(setValues); } }}
                        placeholder="Scan bobbin..." className="w-44 px-3 py-2 text-xs outline-none bg-transparent font-medium" />
                      <button type="button" onClick={() => handleScan(setValues)}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-all"><Scan size={14} /></button>
                    </div>
                    <ResetButton compact type="button" onClick={() => { resetForm(); setFgColor(null); setHistory([]); setScanInput(''); setGeneratedFid(''); }}>Reset</ResetButton>
                    <SubmitButton compact type="submit" disabled={submitting || !fgColor || remaining < 0}>
                      {submitting ? 'Saving...' : 'Save Entry'}
                    </SubmitButton>
                  </div>
                </div>

                {/* Body */}
                <div className="grid grid-cols-12 gap-2 flex-1 min-h-0 overflow-hidden">

                  {/* Left: Request Info */}
                  <div className="col-span-3 flex flex-col gap-2 overflow-y-auto">
                    <div className="bg-gradient-to-b from-blue-50/80 to-white rounded-xl border border-blue-100 p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center"><Layers size={10} className="text-white" /></div>
                        <span className="text-[9px] font-bold text-blue-800 uppercase tracking-wider">Request Info</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <FormikInput compact label="Bobbin No" name="bobbin_no" readOnly />
                        <FormikInput compact label="Original Color" name="original_color" readOnly />
                        <FormikInput compact label="Required Color" name="require_color" readOnly />
                        <FormikInput compact label="Total Length (KM)" name="total_length" readOnly />
                        <FormikInput compact label="Available Balance (KM)" name="balance_length" readOnly />
                        <FormikInput compact label="QC Remark" name="qc_remark" readOnly />
                      </div>
                    </div>
                    {fgColor && (
                      <div className={`rounded-xl border p-3 text-center ${remaining < 0 ? 'bg-gradient-to-b from-red-50 to-white border-red-200' : remaining === 0 ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200' : 'bg-gradient-to-b from-amber-50 to-white border-amber-200'}`}>
                        <p className="text-[8px] font-bold uppercase text-slate-500 mb-1">After Save Balance</p>
                        <p className={`text-2xl font-black font-mono ${remaining < 0 ? 'text-red-700' : remaining === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{remaining.toFixed(3)}</p>
                        <p className="text-[8px] text-slate-400">KM</p>
                        {remaining < 0 && <p className="text-[8px] text-red-600 font-bold mt-1">❌ Exceeds balance!</p>}
                        {remaining === 0 && <p className="text-[8px] text-emerald-600 font-bold mt-1">✓ Complete</p>}
                        {remaining > 0 && <p className="text-[8px] text-amber-600 font-bold mt-1">⏳ Pending</p>}
                      </div>
                    )}
                  </div>

                  {/* Middle: Entry Details */}
                  <div className="col-span-4 overflow-y-auto">
                    <div className="bg-gradient-to-b from-indigo-50/80 to-white rounded-xl border border-indigo-100 p-3 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center"><Ruler size={10} className="text-white" /></div>
                        <span className="text-[9px] font-bold text-indigo-800 uppercase tracking-wider">Entry Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Single length field + scrap checkbox */}
                        <div className="col-span-2 flex items-end gap-2">
                          <div className="flex-1">
                            <FormikInput compact label="Length (KM) *" name="fiber_length" type="number" step="0.001" placeholder="0.000" />
                          </div>
                          <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            values.is_scrap ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}>
                            <Field type="checkbox" name="is_scrap" className="w-3.5 h-3.5 accent-rose-600" />
                            <span className="text-[9px] font-bold uppercase">Scrap</span>
                          </label>
                        </div>
                        {values.is_scrap && (
                          <div className="col-span-2">
                            <p className="text-[8px] text-rose-500 bg-rose-50 border border-rose-100 rounded px-2 py-1 font-medium">⚠️ Marked as scrap — no FID will be generated</p>
                          </div>
                        )}
                        <FormikSelect compact label="Color Batch Code" name="color_batch_code" options={BATCH_CODES} />
                        <FormikSelect compact label="Machine No *" name="machine_no" options={MACHINES} />
                        <FormikSelect compact label="Die Change" name="die_change" options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} />
                        <FormikSelect compact label="Bobbin Type" name="bobbin_type" options={bobbinTypeOptions} />
                        <FormikSelect compact label="Operator *" name="operator" options={operatorOptions} />
                        <FormikSelect compact label="Bobbin Color" name="bobbin_color" options={bobbinColorOptions} />
                      </div>
                      <div className="mt-2">
                        <FormikInput compact label="Remark" name="remark" placeholder="Enter remark..." />
                      </div>

                      {/* FID Generation — only when NOT scrap */}
                      {fgColor && !values.is_scrap && (
                        <div className="mt-3 bg-white rounded-lg border border-slate-200 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">Generated FID</p>
                              <p className="text-sm font-mono font-bold text-indigo-700 mt-0.5">{generatedFid || '— not generated —'}</p>
                            </div>
                            <button type="button" onClick={handleGenerateFid}
                              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-bold rounded-lg hover:shadow-lg hover:shadow-amber-200 transition-all">
                              Generate FID
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: History */}
                  <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-emerald-50 to-transparent px-3 py-2 border-b border-emerald-100 flex items-center gap-2 flex-shrink-0">
                      <div className="w-5 h-5 bg-emerald-600 rounded-lg flex items-center justify-center"><Clock size={10} className="text-white" /></div>
                      <span className="font-bold text-emerald-800 text-[9px] uppercase tracking-wider">Coloring History</span>
                      {history.length > 0 && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{history.length}</span>}
                    </div>
                    <div className="overflow-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                          <tr className="border-b border-slate-200">
                            {['#', 'Date', 'Length', 'Type', 'FID', 'Machine', 'Operator'].map(h => (
                              <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {history.length === 0 ? (
                            <tr><td colSpan={7} className="px-3 py-6 text-center text-[9px] text-slate-400">No history yet</td></tr>
                          ) : history.map((h, i) => (
                            <tr key={i} className="hover:bg-blue-50/20">
                              <td className="px-2 py-1 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                              <td className="px-2 py-1 text-[9px] text-slate-500">{h.created_at ? new Date(h.created_at).toLocaleDateString('en-IN') : '—'}</td>
                              <td className="px-2 py-1 text-[9px] font-mono font-bold text-emerald-700">{h.fiber_length}</td>
                              <td className="px-2 py-1">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${h.scrap_length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {h.scrap_length > 0 ? 'Scrap' : 'Color'}
                                </span>
                              </td>
                              <td className="px-2 py-1 text-[8px] font-mono text-indigo-700">{h.generated_fid || '—'}</td>
                              <td className="px-2 py-1 text-[9px] text-slate-500">{h.machine_no}</td>
                              <td className="px-2 py-1 text-[9px] text-slate-500">{h.operator}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default ColoringEntry;
