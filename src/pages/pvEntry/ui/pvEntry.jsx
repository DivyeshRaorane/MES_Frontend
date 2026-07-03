import { useState, useRef, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { ShieldCheck, Scan, ClipboardCheck, User, Trash2 } from 'lucide-react';
import { ModuleCard, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';
import axios from 'axios';

/* ── APIs ── */
const getQCUsers = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/getqcusers`);
  return res.data;
};

const searchBobbinOnline = async (bobbin_no) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/getbobbinforpv/${bobbin_no}`);
  return res.data;
};

const searchBobbinRePV = async (bobbin_no) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/getbobbinforrepv/${bobbin_no}`);
  return res.data;
};

const updateBobbinColor = async (bobbin_no, fiber_color) => {
  const token = localStorage.getItem('token');
  const res = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/updatebobbincolor/${bobbin_no}`,
    { fiber_color },
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
  );
  return res.data;
};

const submitPVEntries = async (payload) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/pventry`,
    payload,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
  );
  return res.data;
};

const submitRePVEntries = async (payload) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(
    `${import.meta.env.VITE_API_URL}/api/repventry`,
    payload,
    { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } }
  );
  return res.data;
};

/* ── Confirmation Dialog ── */
const ConfirmDialog = ({ isOpen, title, message, onYes, onNo }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-80">
        <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-xs text-slate-600 mb-4 whitespace-pre-line">{message}</p>
        <div className="flex gap-2">
          <button onClick={onNo} className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">No</button>
          <button onClick={onYes} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Yes</button>
        </div>
      </div>
    </div>
  );
};

const today = new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
const FIBER_COLORS = ['Select','Natural','Blue','Red','Green','Yellow','White','Orange','Violet'];

const initialFormValues = {
  pv_type:     '',    // 'online' | 're_pv'
  pv_operator: '',
  shift:       '',
  fiber_color: '',
  pv_remark:   '',
  date:        today,
  time:        nowTime(),
};

/* ══════════════════════════════════════════════════════════ */
const PVEntry = () => {
  const [tableRows, setTableRows]   = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [shifts, setShifts]         = useState([]);
  const [qcUsers, setQcUsers]       = useState([]);
  const [scanInput, setScanInput]   = useState('');
  const [confirm, setConfirm]       = useState({ open: false, title: '', message: '', onYes: null, onNo: null });
  const scanRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sRes, uRes] = await Promise.all([getAllShifts(), getQCUsers()]);
        setShifts(sRes.data || []);
        setQcUsers(uRes.data || []);
      } catch (e) { console.error('Master data load error:', e); }
    };
    fetch();
  }, []);


  const shiftOptions  = shifts.map(s => ({ label: s.shift_name, value: s.shift_name }));
  const qcUserOptions = qcUsers.map(u => ({ label: u.qc_user_name, value: u.qc_user_name }));
  const refocus = () => { setScanInput(''); setTimeout(() => scanRef.current?.focus(), 50); };

  const askConfirm = (title, message) => new Promise((resolve) => {
    setConfirm({
      open: true, title, message,
      onYes: () => { setConfirm(c => ({ ...c, open: false })); resolve(true); },
      onNo:  () => { setConfirm(c => ({ ...c, open: false })); resolve(false); },
    });
  });

  /* ══ ONLINE PV SCAN ══ */
  const handleOnlineScan = async (formValues) => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;

    if (tableRows.some(r => r.bobbin_no === bobbin_no)) {
      showError('This bobbin has already been scanned.');
      refocus(); return;
    }

    let data;
    let d2_status, h2_status, has_pv_record;
    try {
      const res = await searchBobbinOnline(bobbin_no);
      if (!res?.success) { showError(res?.message || 'Bobbin not found or already verified'); refocus(); return; }
      data = res.data;
      d2_status = res.d2_status;
      h2_status = res.h2_status;
      has_pv_record = res.has_pv_record;
    } catch (err) { showError(err?.response?.data?.message || 'Bobbin not found or already verified'); refocus(); return; }

    // PV Record check — if already done, ask confirmation
    if (has_pv_record === true) {
      const proceed = await askConfirm('PV Already Done',
        'Physical Verification has already been completed for this bobbin.\n\nDo you want to perform Physical Verification again?');
      if (!proceed) { refocus(); return; }
    }

    // D2 validation
    if (d2_status) {
      if (d2_status.type === 'info') showError(d2_status.message);
      else if (d2_status.type === 'confirm') {
        if (!(await askConfirm('D2 Status', d2_status.message))) { refocus(); return; }
      }
    }
    // H2 validation
    if (h2_status) {
      if (h2_status.type === 'info') showError(h2_status.message);
      else if (h2_status.type === 'confirm') {
        if (!(await askConfirm('H2 Status', h2_status.message))) { refocus(); return; }
      }
    }
    // Fiber color validation
    const selectedColor = formValues.fiber_color;
    if (selectedColor && selectedColor !== 'Select' && data.fiber_color && data.fiber_color !== selectedColor) {
      const change = await askConfirm('Color Mismatch',
        `Scanned bobbin color is "${data.fiber_color}" but selected PV color is "${selectedColor}".\n\nChange bobbin color to "${selectedColor}"?`);
      if (change) {
        try { await updateBobbinColor(bobbin_no, selectedColor); data.fiber_color = selectedColor; }
        catch (err) { showError(err?.response?.data?.message || 'Failed to update color'); refocus(); return; }
      } else { refocus(); return; }
    }

    setTableRows(prev => [...prev, {
      id: Date.now(), bobbin_no, bobbin_fid: data.fid || '', spool_id: data.spool_id || '',
      spool_fid: data.spool_fid || '', preform_id: data.preform_id || '', fiber_type: data.fiber_type || '',
      fiber_color: data.fiber_color || '', drawn_length: data.drawn_length || '', qty_kms: data.fiber_length || '',
      temp_grade: data.temp_grade || '', final_grade: data.final_grade || '', operator: formValues.pv_operator || '',
      has_pv_record: !!has_pv_record,
    }]);
    refocus();
  };

  /* ══ RE-PV SCAN ══ */
  const handleRePVScan = async (formValues) => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;

    if (tableRows.some(r => r.bobbin_no === bobbin_no)) {
      showError('This bobbin has already been scanned.');
      refocus(); return;
    }

    let data;
    try {
      const res = await searchBobbinRePV(bobbin_no);
      if (!res?.success) { showError(res?.message || 'Bobbin not found.'); refocus(); return; }
      data = res.data;
    } catch (err) { showError(err?.response?.data?.message || 'Bobbin not found.'); refocus(); return; }

    // Final grade validation
    if (!data.final_grade) {
      showError('This bobbin does not have a Final Grade. Re-Physical Verification cannot be performed.');
      refocus(); return;
    }

    // Existing PV record validation (backend should check and return)
    if (!data.has_pv_record) {
      showError('No existing Physical Verification record found for this bobbin.');
      refocus(); return;
    }

    setTableRows(prev => [...prev, {
      id: Date.now(), bobbin_no, bobbin_fid: data.fid || '', spool_id: data.spool_id || '',
      spool_fid: data.spool_fid || '', preform_id: data.preform_id || '', fiber_type: data.fiber_type || '',
      fiber_color: data.fiber_color || '', drawn_length: data.drawn_length || '', qty_kms: data.fiber_length || '',
      temp_grade: data.temp_grade || '', final_grade: data.final_grade || '', operator: formValues.pv_operator || '',
    }]);
    refocus();
  };

  /* ── Unified scan handler ── */
  const handleScan = (formValues) => {
    // Validate header fields before allowing scan
    if (!formValues.pv_type) { showError('Please select PV Type first'); refocus(); return; }
    if (!formValues.pv_operator || formValues.pv_operator === 'Select') { showError('Please select PV Operator first'); refocus(); return; }
    if (!formValues.shift || formValues.shift === 'Select') { showError('Please select Shift first'); refocus(); return; }
    if (formValues.pv_type === 'online' && (!formValues.fiber_color || formValues.fiber_color === 'Select')) {
      showError('Please select Fiber Color first'); refocus(); return;
    }

    if (formValues.pv_type === 'online') return handleOnlineScan(formValues);
    if (formValues.pv_type === 're_pv') return handleRePVScan(formValues);
  };

  const removeRow = (id) => setTableRows(prev => prev.filter(r => r.id !== id));

  /* ── Submit ── */
  const handleSubmit = async (formValues, resetForm) => {
    if (tableRows.length === 0) { showError('No bobbins scanned.'); return; }
    if (!formValues.pv_type) { showError('Please select PV Type'); return; }
    if (!formValues.pv_operator || formValues.pv_operator === 'Select') { showError('Please select Operator'); return; }
    if (!formValues.shift || formValues.shift === 'Select') { showError('Please select Shift'); return; }

    setSubmitting(true);
    try {
      const header = {
        pv_type:     formValues.pv_type,
        pv_operator: formValues.pv_operator,
        shift:       formValues.shift,
        fiber_color: formValues.fiber_color,
        pv_date:     formValues.date,
        pv_time:     formValues.time,
        pv_remark:   formValues.pv_remark,
      };

      const bobbins = tableRows.map(r => ({
        bobbin_no: r.bobbin_no, bobbin_fid: r.bobbin_fid, spool_id: r.spool_id,
        spool_fid: r.spool_fid, preform_id: r.preform_id, fiber_type: r.fiber_type,
        fiber_color: r.fiber_color, drawn_length: r.drawn_length, qty_kms: r.qty_kms,
        temp_grade: r.temp_grade, final_grade: r.final_grade, operator: r.operator,
        has_pv_record: r.has_pv_record || false,
      }));

      console.log("Data submit:", bobbins)

      let res;
      if (formValues.pv_type === 'online') {
        res = await submitPVEntries({ header, bobbins });
      } else {
        // Re-PV: only sends header fields that need updating + bobbin identifiers
        res = await submitRePVEntries({ header, bobbins: bobbins.map(b => ({ bobbin_no: b.bobbin_no })) });
      }

      if (res?.success) {
        const msg = formValues.pv_type === 'online'
          ? `${tableRows.length} bobbin(s) verified successfully!`
          : `${tableRows.length} PV record(s) updated successfully!`;
        showSuccess(msg);
        setTableRows([]);
        resetForm();
      } else {
        showError(res?.message || 'Submission failed');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Something went wrong');
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
                  <ResetButton compact type="button" onClick={() => { resetForm(); setTableRows([]); setScanInput(''); }}>Reset</ResetButton>
                  <SubmitButton compact type="button" disabled={submitting || tableRows.length === 0}
                    onClick={() => handleSubmit(values, resetForm)}>
                    {submitting ? 'Saving...' : `Submit (${tableRows.length})`}
                  </SubmitButton>
                </div>
              </div>

              {/* ── Header fields ── */}
              <div className="grid grid-cols-4 gap-2 flex-shrink-0">

                <ModuleCard compact title="PV Config" icon={<ShieldCheck size={13} className="text-blue-600" />}>
                  <div className="flex flex-col gap-2">
                    <FormikSelect compact label="PV Type" name="pv_type"
                      options={[{ label: 'Online', value: 'online' }, { label: 'Re-Physical Verification', value: 're_pv' }]}
                      disabled={tableRows.length > 0} />
                    {/* Fiber Color — only for Online mode */}
                    {values.pv_type === 'online' && (
                      <FormikSelect compact label="Fiber Color" name="fiber_color" options={FIBER_COLORS}
                        disabled={tableRows.length > 0} />
                    )}
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Personnel" icon={<User size={13} className="text-orange-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikSelect compact label="PV Operator" name="pv_operator" options={qcUserOptions}
                      disabled={tableRows.length > 0} />
                    <FormikSelect compact label="Shift" name="shift" options={shiftOptions}
                      disabled={tableRows.length > 0} />
                  </div>
                </ModuleCard>

                <ModuleCard compact title="Remark" icon={<ClipboardCheck size={13} className="text-emerald-600" />}>
                  <FormikTextarea compact label="PV Remark" name="pv_remark" rows={2} placeholder="Remarks..." />
                </ModuleCard>

                <ModuleCard compact title="Scan Bobbin" icon={<Scan size={13} className="text-indigo-600" />}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Bobbin Barcode</label>
                    <div className="flex gap-1.5">
                      <input ref={scanRef} value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(values); } }}
                        placeholder="Scan bobbin..." autoFocus
                        className="flex-1 bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500" />
                      <button type="button" onClick={() => handleScan(values)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded hover:bg-indigo-700 transition-all">
                        <Scan size={10} />
                      </button>
                    </div>
                    <span className="text-[8px] text-slate-400">{tableRows.length} bobbin{tableRows.length !== 1 ? 's' : ''} scanned</span>
                  </div>
                </ModuleCard>
              </div>

              {/* ── Scanned bobbins table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <ClipboardCheck size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">
                    {values.pv_type === 're_pv' ? 'Re-PV Bobbins' : 'Scanned Bobbins'}
                  </span>
                  {tableRows.length > 0 && (
                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">{tableRows.length}</span>
                  )}
                </div>
                <div className="overflow-auto flex-1">
                  <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        {['#','Bobbin No','Bobbin FID','Spool ID','Spool FID','Preform ID','Fiber Type','Fiber Color','Drawn Len','Qty (KM)','Temp Grade','Final Grade','Operator',''].map(h => (
                          <th key={h} className="px-2 py-2 text-[8px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="px-4 py-10 text-center text-[10px] text-slate-400">
                            {values.pv_type ? 'Scan a bobbin barcode above' : 'Select PV Type to begin'}
                          </td>
                        </tr>
                      ) : tableRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                          <td className="px-2 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.bobbin_no}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.bobbin_fid || '—'}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.spool_id}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.spool_fid || '—'}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.preform_id}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.fiber_type || '—'}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.fiber_color || '—'}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.drawn_length}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-emerald-700 font-bold border-r border-slate-100">{row.qty_kms}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.temp_grade || '—'}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.final_grade || '—'}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.operator || '—'}</td>
                          <td className="px-2 py-1.5 text-center">
                            <button type="button" onClick={() => removeRow(row.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
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

        <ConfirmDialog {...confirm} isOpen={confirm.open} />
      </div>
    </div>
  );
};

export default PVEntry;
