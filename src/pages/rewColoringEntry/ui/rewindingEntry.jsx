import { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Layers, Ruler, Clock, Scan, ListChecks } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { scanBobbinForRewinding, saveRewindingEntry, getPTUsers } from '../services/rewinding.api';
import { getBobbinColors } from '../../Admin_Folder/proof_testing/bobbin_color/service/bobbin_color.api';
import { getBobbinTypes } from '../../Admin_Folder/proof_testing/bobbin_type/service/bobbin_type.api';

const MACHINES = [{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }];
const REW_REASONS = ['Select', 'Attn High', 'MFD Fail', 'Customer Req', 'Break', 'Other'];
const REW_TYPES = ['Standard', 'Premium', 'Custom'];

const validationSchema = Yup.object({
  fiber_length: Yup.number().typeError('Must be a number').required('Length is required').min(0.001, 'Must be > 0'),
  machine_no: Yup.mixed().required('Machine is required'),
  operator: Yup.string().required('Operator is required'),
});

/* ── Confirm Dialog ── */
const ConfirmDialog = ({ isOpen, title, message, onYes, onNo }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-96">
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

/* ══════════════════════════════════════════════════════════ */
const RewindingEntry = () => {
  const [scanInput, setScanInput] = useState('');
  const [fgRewind, setFgRewind] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [selectedInstr, setSelectedInstr] = useState([]);
  const [history, setHistory] = useState([]);
  const [ptUsers, setPtUsers] = useState([]);
  const [bobbinTypes, setBobbinTypes] = useState([]);
  const [bobbinColors, setBobbinColors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [generatedFid, setGeneratedFid] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState(null);
  const scanRef = useRef(null);

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

  const nextInstruction = instructions.find(i => !i.is_done);

  /* ── Scan ── */
  const handleScan = async (setValues) => {
    const bobbin_no = scanInput.trim();
    if (!bobbin_no) return;
    try {
      const res = await scanBobbinForRewinding(bobbin_no);
      if (!res?.success) { showError(res?.message || 'No pending rewinding request found for this bobbin.'); return; }
      const { bobbin, rew_record, balance_length, instructions: instr, history: hist } = res.data;
      const effectiveBalance = balance_length ?? rew_record?.balance_length ?? bobbin?.fiber_length ?? '';
      setFgRewind({ ...bobbin, ...rew_record, balance_length: effectiveBalance, parent_bobbin_no: bobbin.bobbin_no });
      setInstructions(instr || []);
      setHistory(hist || []);
      setSelectedInstr([]);
      setGeneratedFid('');
      setValues(prev => ({
        ...prev,
        bobbin_no: '', bobbin_fid: bobbin.fid || '',
        total_length: bobbin.fiber_length || '', balance_length: effectiveBalance,
        rewinding_type: rew_record?.rewinding_type || '', qc_remark: rew_record?.remark || '',
        fiber_length: '', is_scrap: false, machine_no: '', rew_reason: '',
        rew_type: '', bobbin_type: '', operator: '', bobbin_color: '', remark: '',
      }));
    } catch (e) { showError(e?.response?.data?.message || 'Scan failed'); }
  };

  /* ── Generate FID ── */
  const handleGenerateFid = () => {
    if (!fgRewind) return '';
    const parentFid = fgRewind.fid || fgRewind.bobbin_fid || '';
    const lastChild = fgRewind.last_child_fid;
    const count = fgRewind.count || 0;
    let newFid;
    if (!lastChild || count === 0) { newFid = parentFid + 'A'; }
    else { const lastChar = lastChild.slice(-1); newFid = lastChild.slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0) + 1); }
    setGeneratedFid(newFid);
    return newFid;
  };

  /* ── Toggle instruction ── */
  const toggleInstr = (instrId) => {
    setSelectedInstr(prev => prev.includes(instrId) ? prev.filter(id => id !== instrId) : [...prev, instrId]);
  };

  /* ── Submit (called after confirmation if needed) ── */
  const doSubmit = async (values, setFieldValue) => {
    const len = parseFloat(values.fiber_length) || 0;
    const isScrap = values.is_scrap;
    const available = parseFloat(values.balance_length) || 0;
    const remaining = available - len;
    // Only validate if balance_length is actually set (non-zero)
    if (available > 0 && remaining < 0) { showError('Entered rewind length exceeds available balance.'); return; }
    if (!isScrap && !values.bobbin_no?.trim()) { showError('Please enter a Bobbin No.'); return; }

    // Check duplicate bobbin_no in history
    if (!isScrap && values.bobbin_no?.trim()) {
      const isDuplicate = history.some(h => h.bobbin_no === values.bobbin_no.trim());
      if (isDuplicate) { showError('This Bobbin No has already been used. Please enter a different one.'); return; }
    }

    let fid = '';
    if (!isScrap && len > 0) { fid = generatedFid || handleGenerateFid(); }

    setSubmitting(true);
    try {
      const payload = {
        bobbin_no: values.bobbin_no,
        parent_bobbin_no: fgRewind.parent_bobbin_no || scanInput.trim(),
        fiber_length: len, is_scrap: isScrap,
        generated_fid: fid, machine_no: values.machine_no,
        rew_reason: values.rew_reason, rew_type: values.rew_type,
        bobbin_type: values.bobbin_type, operator: values.operator,
        bobbin_color: values.bobbin_color, remark: values.remark,
        selected_instructions: selectedInstr,
      };
      const res = await saveRewindingEntry(payload);
      if (res?.success) {
        // Use backend-returned balance if available, otherwise calculate locally
        const updatedBalance = res.data?.balance_length ?? remaining;
        if (updatedBalance <= 0) showSuccess('Rewinding completed successfully.');
        else showSuccess(`Rewinding Entry saved. ${parseFloat(updatedBalance).toFixed(3)} KM still pending.`);
        setFgRewind(prev => ({ ...prev, balance_length: updatedBalance, is_done: updatedBalance <= 0,
          last_child_fid: fid || prev.last_child_fid, count: fid ? (prev.count || 0) + 1 : prev.count }));
        setHistory(res.data?.history || history);
        // Update instructions: mark selected ones as done, keep the rest
        const updatedInstructions = res.data?.instructions ||
          instructions.map(instr =>
            selectedInstr.includes(instr.rewind_instr_id) ? { ...instr, is_done: true } : instr
          );
        setInstructions(updatedInstructions);
        setSelectedInstr([]);
        setGeneratedFid('');
        setFieldValue('balance_length', parseFloat(updatedBalance).toFixed(3));
        setFieldValue('fiber_length', ''); setFieldValue('is_scrap', false);
        setFieldValue('remark', ''); setFieldValue('bobbin_no', '');
      } else showError(res?.message || 'Save failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  /* ── Handle submit click — check if cut overlaps with pending instruction not booked ── */
  const handleSubmit = async (values, { setFieldValue }) => {
    if (!fgRewind) { showError('Scan a bobbin first'); return; }

    const pendingInstructions = instructions.filter(i => !i.is_done);

    // Only check overlap if there are pending instructions and none selected
    if (pendingInstructions.length > 0 && selectedInstr.length === 0) {
      // Calculate the current entry range
      const totalLength = parseFloat(fgRewind.total_length || values.total_length) || 0;
      const balanceLength = parseFloat(values.balance_length) || 0;
      const entryLength = parseFloat(values.fiber_length) || 0;
      // Entry starts where previous cuts ended: totalLength - balanceLength
      const entryStart = totalLength - balanceLength;
      const entryEnd = entryStart + entryLength;

      // Check if any pending instruction overlaps with this entry range
      const overlapping = pendingInstructions.filter(instr => {
        const instrP1 = parseFloat(instr.p1) || 0;
        const instrP2 = parseFloat(instr.p2) || 0;
        // Overlaps if: entry starts before instruction ends AND entry ends after instruction starts
        return entryStart < instrP2 && entryEnd > instrP1;
      });

      if (overlapping.length > 0) {
        // Cut range overlaps with a pending instruction that's not booked — warn user
        const instr = overlapping[0];
        setPendingSubmitValues({ values, setFieldValue });
        setConfirmDialog(true);
      } else {
        // Cut does NOT overlap with any instruction — proceed normally
        await doSubmit(values, setFieldValue);
      }
    } else {
      // No pending instructions OR instruction already selected — proceed normally
      await doSubmit(values, setFieldValue);
    }
  };

  const handleConfirmYes = async () => {
    setConfirmDialog(false);
    if (pendingSubmitValues) { await doSubmit(pendingSubmitValues.values, pendingSubmitValues.setFieldValue); }
    setPendingSubmitValues(null);
  };

  const initialValues = {
    bobbin_no: '', bobbin_fid: '', total_length: '', balance_length: '',
    rewinding_type: '', qc_remark: '', fiber_length: '', is_scrap: false,
    machine_no: '', rew_reason: '', rew_type: '', bobbin_type: '',
    operator: '', bobbin_color: '', remark: '',
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <Formik initialValues={initialValues} validationSchema={validationSchema} validateOnChange={false} validateOnBlur={true}
          onSubmit={(v, helpers) => handleSubmit(v, helpers)}>
          {({ values, setValues, setFieldValue, resetForm }) => {
            const len = parseFloat(values.fiber_length) || 0;
            const available = parseFloat(values.balance_length) || 0;
            const remaining = available - len;

            return (
              <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

                {/* ── Row 1: 3 Cards ── */}
                <div className="grid grid-cols-3 gap-2 flex-shrink-0">

                  {/* Card 1: Spool & Identification */}
                  <ModuleCard compact title="Spool & Identification" icon={<Layers size={12} className="text-blue-600" />}>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="col-span-2 flex items-end gap-1.5">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 block mb-0.5">Scan Bobbin</label>
                          <input ref={scanRef} value={scanInput} onChange={e => setScanInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleScan(setValues); } }}
                            placeholder="Enter bobbin no..."
                            className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                        </div>
                        <button type="button" onClick={() => handleScan(setValues)}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-[8px] font-bold rounded uppercase hover:bg-indigo-700 h-[28px] whitespace-nowrap">
                          Fetch
                        </button>
                      </div>
                      <FormikInput compact label="Bobbin No" name="bobbin_no" />
                      <FormikInput compact label="Parent FID" name="bobbin_fid" readOnly />
                      <FormikInput compact label="Total Length" name="total_length" readOnly />
                      <FormikInput compact label="Balance Length" name="balance_length" readOnly />
                      <FormikInput compact label="Rew Type" name="rewinding_type" readOnly />
                      <FormikSelect compact label="Rew Reason" name="rew_reason" options={REW_REASONS} />
                      <div className="col-span-2 flex items-end gap-2">
                        <div className="flex-1"><FormikInput compact label="Rewind Length *" name="fiber_length" type="number" step="0.001" placeholder="0.000" /></div>
                        <label className={`flex items-center gap-1.5 px-2 py-1.5 rounded border cursor-pointer transition-all ${values.is_scrap ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                          <Field type="checkbox" name="is_scrap" className="w-3 h-3 accent-rose-600" />
                          <span className="text-[8px] font-bold uppercase">Scrap</span>
                        </label>
                      </div>
                      <FormikSelect compact label="Machine No *" name="machine_no" options={MACHINES} />
                      <FormikSelect compact label="Rew Type" name="rew_type" options={REW_TYPES} />
                    </div>
                  </ModuleCard>

                  {/* Card 2: FID & Details */}
                  <ModuleCard compact title="FID & Details" icon={<Ruler size={12} className="text-indigo-600" />}>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="col-span-2 flex items-end gap-1.5">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 block mb-0.5">Generated FID</label>
                          <input readOnly value={generatedFid || ''} placeholder="Click Generate..."
                            className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none font-mono font-bold text-indigo-700" />
                        </div>
                        <button type="button" onClick={handleGenerateFid} disabled={values.is_scrap}
                          className="px-3 py-1.5 bg-amber-500 text-white text-[8px] font-bold rounded uppercase hover:bg-amber-600 h-[28px] whitespace-nowrap disabled:opacity-40">
                          Gen FID
                        </button>
                      </div>
                      <FormikSelect compact label="Bobbin Type" name="bobbin_type" options={bobbinTypeOptions} />
                      <FormikSelect compact label="Operator *" name="operator" options={operatorOptions} />
                      <FormikSelect compact label="Bobbin Color" name="bobbin_color" options={bobbinColorOptions} />
                      <FormikInput compact label="Remark" name="remark" placeholder="Remark..." />
                      {/* Balance & Done indicator */}
                      {fgRewind && (
                        <div className="col-span-2 grid grid-cols-2 gap-1 mt-1">
                          <div className={`rounded-lg border p-2 text-center ${remaining < 0 ? 'bg-red-50 border-red-200' : remaining === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <span className="text-[7px] font-bold text-slate-500 uppercase block">Remaining</span>
                            <span className={`text-sm font-black font-mono ${remaining < 0 ? 'text-red-700' : remaining === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{remaining.toFixed(3)} KM</span>
                          </div>
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-center">
                            <span className="text-[7px] font-bold text-slate-500 uppercase block">Done</span>
                            <span className="text-sm font-black font-mono text-blue-700">
                              {((parseFloat(values.total_length) || 0) - (parseFloat(values.balance_length) || 0)).toFixed(3)} KM
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Next instruction suggestion */}
                      {nextInstruction && (() => {
                        const done = (parseFloat(values.total_length) || 0) - (parseFloat(values.balance_length) || 0);
                        const instrP1 = parseFloat(nextInstruction.p1) || 0;
                        const suggestedLen = instrP1 - done;
                        return (
                          <div className="col-span-2 bg-orange-50 border border-orange-200 rounded-lg p-2 text-center">
                            <span className="text-[8px] font-bold text-orange-700 uppercase">Next Instruction: </span>
                            <span className="text-xs font-mono font-bold text-orange-800">{nextInstruction.p1} → {nextInstruction.p2}</span>
                            {suggestedLen > 0 && suggestedLen !== (parseFloat(values.balance_length) || 0) && (
                              <div className="mt-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 rounded px-2 py-0.5 inline-block">
                                Please set length to {suggestedLen.toFixed(3)} KM
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </ModuleCard>

                  {/* Card 3: Remark + Actions */}
                  <ModuleCard compact title="Instructions" icon={<ListChecks size={12} className="text-orange-600" />}>
                    <div className="flex flex-col gap-1.5 h-full">
                      <FormikInput compact label="QC Remark" name="qc_remark" readOnly />
                      {instructions.filter(i => !i.is_done).length > 0 ? (
                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded max-h-32">
                          <table className="w-full text-[9px] border-collapse">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr><th className="px-1.5 py-1 text-left">✔</th><th className="px-1.5 py-1 text-left">P1</th><th className="px-1.5 py-1 text-left">P2</th><th className="px-1.5 py-1 text-left">Instr</th></tr>
                            </thead>
                            <tbody>
                              {instructions.filter(instr => !instr.is_done).map(instr => (
                                <tr key={instr.rewind_instr_id}>
                                  <td className="px-1.5 py-0.5"><input type="checkbox" checked={selectedInstr.includes(instr.rewind_instr_id)} onChange={() => toggleInstr(instr.rewind_instr_id)} className="w-3 h-3 accent-indigo-600" /></td>
                                  <td className="px-1.5 py-0.5 font-mono">{instr.p1}</td>
                                  <td className="px-1.5 py-0.5 font-mono">{instr.p2}</td>
                                  <td className="px-1.5 py-0.5 font-mono">{instr.instruction || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-[9px] text-slate-400 text-center py-4">No instructions</p>
                      )}
                    </div>
                  </ModuleCard>
                </div>

                {/* ── Action Buttons ── */}
                <div className="flex justify-between gap-2 flex-shrink-0">
                  <ResetButton compact type="button" onClick={() => { resetForm(); setFgRewind(null); setHistory([]); setInstructions([]); setScanInput(''); setGeneratedFid(''); }}>Reset</ResetButton>
                  <SubmitButton compact type="submit" disabled={submitting || !fgRewind || remaining < 0}>
                    {submitting ? 'Saving...' : 'Submit'}
                  </SubmitButton>
                </div>

                {/* ── Row 2: History Table ── */}
                <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                    <Clock size={12} className="text-emerald-600" />
                    <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Rewinding History</span>
                    {history.length > 0 && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">{history.length}</span>}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-200">
                          {['#', 'Date', 'Length', 'Type', 'FID', 'Machine', 'Reason', 'Operator'].map(h => (
                            <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.length === 0 ? (
                          <tr><td colSpan={8} className="px-3 py-6 text-center text-[9px] text-slate-400">No entries yet — scan a bobbin to begin</td></tr>
                        ) : history.map((h, i) => (
                          <tr key={i} className="hover:bg-blue-50/20">
                            <td className="px-2 py-1.5 text-[9px] text-slate-400 font-bold border-r border-slate-100">{i + 1}</td>
                            <td className="px-2 py-1.5 text-[9px] text-slate-500 border-r border-slate-100">{h.created_at ? new Date(h.created_at).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="px-2 py-1.5 text-[9px] font-mono font-bold text-emerald-700 border-r border-slate-100">{h.fiber_length}</td>
                            <td className="px-2 py-1.5 border-r border-slate-100"><span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${h.is_scrap ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{h.is_scrap ? 'Scrap' : 'Rewind'}</span></td>
                            <td className="px-2 py-1.5 text-[8px] font-mono text-indigo-700 border-r border-slate-100">{h.generated_fid || '—'}</td>
                            <td className="px-2 py-1.5 text-[9px] text-slate-500 border-r border-slate-100">{h.machine_no}</td>
                            <td className="px-2 py-1.5 text-[9px] text-slate-500 border-r border-slate-100">{h.rew_reason || '—'}</td>
                            <td className="px-2 py-1.5 text-[9px] text-slate-500">{h.operator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </Form>
            );
          }}
        </Formik>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog isOpen={confirmDialog}
        title="Pending Cut Instruction"
        message={"A cut instruction is available for this bobbin, but it has not been selected/booked.\n\nIt is recommended to cancel this operation, select the cut instruction, and submit it before continuing.\n\nDo you still want to continue without booking the instruction?"}
        onYes={handleConfirmYes}
        onNo={() => { setConfirmDialog(false); setPendingSubmitValues(null); }} />
    </div>
  );
};

export default RewindingEntry;
