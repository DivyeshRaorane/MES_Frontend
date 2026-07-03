import { useState, useRef } from 'react';
import { Formik, Form } from 'formik';
import { ShieldCheck, Scan, ClipboardCheck, User, Plus, Trash2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import axios from 'axios';

/* ── API: search bobbin from bobbin_entries ── */
const searchBobbin = async (bobbin_id) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/getbobbinforpv/${bobbin_id}`
  );
  return response.data;
};

/* ── API: submit PV entries ── */
const submitPVEntries = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/pventry`,
    payload,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

const today   = new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

let testCounter = 1;

const initialFormValues = {
  pv_type:     '',       // 'online' | 're_pv'
  pv_operator: '',
  date:        today,
  time:        nowTime(),
  shift:       '',
  pv_remark:   '',
  barcode:     '',
};

/* ══════════════════════════════════════════════════════════ */
const PVEntry = () => {
  const [tableRows, setTableRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const barcodeRef = useRef(null);

  /* ── Scan bobbin — call API ── */
  const handleScanBobbin = async (bobbin_id, setFieldValue) => {
    if (!bobbin_id.trim()) return;

    try {
      const res = await searchBobbin(bobbin_id.trim());

      if (!res?.data) {
        showError('Bobbin not found or already verified');
        return;
      }

      const data = res.data;
      setTableRows(prev => [...prev, {
        id:         Date.now(),
        bobbin_id:  bobbin_id.trim(),
        bobbin_fid: data.bobbin_fid || '',
        spool_fid:  data.spool_fid || '',
        spool_id:   data.spool_id || '',
        preform_id: data.preform_id || '',
        fiber_type: data.fiber_type || '',
        colour:     data.colour || '',
        qty_kms:    data.qty_kms || '',
      }]);

      setFieldValue('barcode', '');
      setTimeout(() => barcodeRef.current?.focus(), 50);
    } catch (error) {
      console.error('Bobbin scan error:', error);
      showError(error?.response?.data?.message || 'Bobbin not found or already verified');
    }
  };

  /* ── Test scan — dummy ── */
  const addTestRow = () => {
    setTableRows(prev => [...prev, {
      id:         Date.now(),
      bobbin_id:  `BOB-${String(testCounter++).padStart(5, '0')}`,
      bobbin_fid: `FID-${Math.floor(Math.random() * 9000 + 1000)}`,
      spool_fid:  `KWCOBF5000039C${String.fromCharCode(65 + (testCounter % 5))}`,
      spool_id:   `SP-${Math.floor(Math.random() * 9000 + 1000)}`,
      preform_id: `PRF-${Math.floor(Math.random() * 9000 + 1000)}`,
      fiber_type: 'Single Mode',
      colour:     testCounter % 2 === 0 ? 'Blue' : '',
      qty_kms:    (Math.random() * 50 + 10).toFixed(3),
    }]);
  };

  /* ── Remove row ── */
  const removeRow = (id) => setTableRows(prev => prev.filter(r => r.id !== id));

  /* ── Submit ── */
  const handleSubmit = async (formValues) => {
    if (tableRows.length === 0) { showError('No bobbins scanned.'); return; }
    if (!formValues.pv_type) { showError('Please select verification type'); return; }
    if (!formValues.pv_operator) { showError('Please select operator'); return; }
    if (!formValues.shift) { showError('Please select shift'); return; }

    setSubmitting(true);
    try {
      const payload = {
        header: {
          pv_type:     formValues.pv_type,
          pv_operator: formValues.pv_operator,
          shift:       formValues.shift,
          pv_date:     formValues.date,
          pv_time:     formValues.time,
          pv_remark:   formValues.pv_remark,
        },
        bobbins: tableRows.map(r => ({
          bobbin_id:  r.bobbin_id,
          bobbin_fid: r.bobbin_fid,
          spool_fid:  r.spool_fid,
          spool_id:   r.spool_id,
          preform_id: r.preform_id,
          fiber_type: r.fiber_type,
          colour:     r.colour,
          qty_kms:    r.qty_kms,
        })),
      };

      const res = await submitPVEntries(payload);

      if (res?.success) {
        showSuccess(`${tableRows.length} bobbin(s) verified successfully!`);
        setTableRows([]);
      } else {
        showError(res?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('PV Submit error:', error);
      showError(error?.response?.data?.message || 'Something went wrong');
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
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Physical Verification</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => { resetForm(); setTableRows([]); }}>Reset</ResetButton>
                  <SubmitButton compact type="button" disabled={submitting || tableRows.length === 0}
                    onClick={() => handleSubmit(values)}>
                    {submitting ? 'Saving...' : `Submit (${tableRows.length})`}
                  </SubmitButton>
                </div>
              </div>

              {/* ── Top: form fields ── */}
              <div className="grid grid-cols-3 gap-2 flex-shrink-0">

                {/* Verification Type */}
                <ModuleCard compact title="Verification Type" icon={<ShieldCheck size={13} className="text-blue-600" />}>
                  <div className="flex gap-4">
                    {[
                      { val: 'online', label: 'Online PV',  color: 'text-blue-600'   },
                      { val: 're_pv',  label: 'Re-PV',      color: 'text-indigo-600' },
                    ].map(({ val, label, color }) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={values.pv_type === val}
                          onChange={() => setFieldValue('pv_type', values.pv_type === val ? '' : val)}
                          className="w-4 h-4 rounded border-slate-300 accent-blue-600" />
                        <span className={`text-[10px] font-bold uppercase ${values.pv_type === val ? color : 'text-slate-600'}`}>{label}</span>
                      </label>
                    ))}
                  </div>
                </ModuleCard>

                {/* Personnel & Timing */}
                <ModuleCard compact title="Personnel & Timing" icon={<User size={13} className="text-orange-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikSelect compact label="PV Operator" name="pv_operator" options={['Select','Operator A','Operator B','Operator C','Senior Op']} />
                    <FormikInput  compact label="Date"  name="date"  type="date" />
                    <FormikInput  compact label="Time"  name="time"  type="time" />
                    <FormikSelect compact label="Shift" name="shift" options={['Select','A','B','C']} />
                  </div>
                </ModuleCard>

                {/* Remark */}
                <ModuleCard compact title="Remarks" icon={<ClipboardCheck size={13} className="text-emerald-600" />}>
                  <FormikTextarea compact label="PV Remark" name="pv_remark" rows={3} placeholder="Enter remarks..." />
                </ModuleCard>
              </div>

              {/* ── Barcode scan row ── */}
              <div className="flex items-end gap-2 flex-shrink-0">
                <div className="flex-1 max-w-sm">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 block mb-0.5">Scan Bobbin Barcode</label>
                  <input
                    ref={barcodeRef}
                    value={values.barcode}
                    onChange={e => setFieldValue('barcode', e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScanBobbin(values.barcode, setFieldValue); } }}
                    placeholder="Scan bobbin barcode..."
                    className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <button type="button" onClick={() => handleScanBobbin(values.barcode, setFieldValue)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px]">
                  <Scan size={10} /> Scan
                </button>
                <button type="button" onClick={addTestRow}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase hover:bg-amber-600 transition-all h-[28px]">
                  <Plus size={10} /> Test
                </button>
                <span className="text-[9px] text-slate-400 font-medium">{tableRows.length} bobbin{tableRows.length !== 1 ? 's' : ''}</span>
              </div>

              {/* ── Scanned bobbins table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <ClipboardCheck size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Scanned Bobbins</span>
                  {tableRows.length > 0 && (
                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">{tableRows.length}</span>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        {['#','Bobbin ID','Bobbin FID','Spool FID','Spool ID','Preform ID','Fiber Type','Colour','Qty (Kms)',''].map(h => (
                          <th key={h} className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-[10px] text-slate-400">
                            No bobbins scanned yet — scan a barcode or click Test
                          </td>
                        </tr>
                      ) : tableRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                          <td className="px-2 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.bobbin_id}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.bobbin_fid || '—'}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.spool_fid || '—'}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.spool_id}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.preform_id}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.fiber_type || '—'}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.colour || '—'}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-emerald-700 font-bold border-r border-slate-100">{row.qty_kms}</td>
                          <td className="px-2 py-1.5 text-center">
                            <button type="button" onClick={() => removeRow(row.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors">
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

export default PVEntry;
