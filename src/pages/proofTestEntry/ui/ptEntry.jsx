import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Scan, ClipboardCheck, AlertTriangle, Users, Database, Trash2, Plus, Zap, Lock } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getPTUsers } from '../../Admin_Folder/proof_testing/pt_users/service/pt_users.api';
import { useDispatch, useSelector } from 'react-redux';
import { getBobbinColors } from '../../Admin_Folder/proof_testing/bobbin_color/service/bobbin_color.api';
import { getBobbinTypes } from '../../Admin_Folder/proof_testing/bobbin_type/service/bobbin_type.api';
import { getSpoolDetailsForPT } from '../services/pt_entry.api';
import { ptEntryApi } from '../services/pt_entry.api';

/* ── Password Modal ─────────────────────────────────────── */
const PasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (pwd === '12345') { onSuccess(); onClose(); setPwd(''); setError(''); }
    else setError('Incorrect password');
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-72">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={14} className="text-amber-500" />
          <h3 className="text-xs font-bold text-slate-700 uppercase">Enter Password to Unlock</h3>
        </div>
        <input
          type="password" value={pwd} autoFocus
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20"
          placeholder="Password"
        />
        {error && <p className="text-[9px] text-rose-600 mt-1">{error}</p>}
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={onClose} className="flex-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-bold hover:bg-slate-200">Cancel</button>
          <button type="button" onClick={submit} className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700">Submit</button>
        </div>
      </div>
    </div>
  );
};

/* ── Inline rejection row: checkbox + label + optional inline sub-field ── */
const RejRow = ({ name, label, checked, children }) => (
  <div className="flex items-center gap-2 py-1 border-b border-slate-50 last:border-0">
    <Field type="checkbox" name={name} className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 flex-shrink-0" />
    <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap w-28 flex-shrink-0">{label}</span>
    {/* sub-field appears inline to the right */}
    <div className="flex-1 min-w-0">
      {checked && children}
    </div>
  </div>
);

/* ── helpers ── */
const calcBalance = (dl, pt) => Math.max(0, (parseFloat(dl) || 0) - (parseFloat(pt) || 0)).toFixed(3);
const genPTID = (last) => `PT-${String((parseInt(last.replace(/\D/g, '')) || 0) + 1).padStart(5, '0')}`;
const today = new Date().toISOString().split('T')[0];

const validationSchema = Yup.object({
  drawn_spool_id: Yup.string().required('Required'),
  operator_name: Yup.string().required('Required'),
  shift_incharge: Yup.string().required('Required'),
});

const initialValues = {
  /* spool info */
  spool_id: '', preform_id: '', pt_date: '', fid: '',
  bobbin_no: '', pt_machine_id: '', operator_id: '',
  shift_incharge_id: '', bobbin_color_id: '', bobbin_type_id: '',
  running_strain: '', product_type_id: '', pt_done_length: '',
  payoff_vibration: '', dancer_vibration: '', balance_length: '',
  rejection: '', rejection_reason: '', bal_draw_rejection: '',
  bal_draw_rejection_reason: '', multiple_end: '',
  multiple_end_length: '', scratch: '', scratch_length: '',
  pt_scrap: '', pt_scrap_lenght: '', ztmd: '', ztmd_id: '',
  doc: '', doc_id: ''
};



/* ══════════════════════════════════════════════════════════ */
const PTEntry = () => {
  const [lastPTID, setLastPTID] = useState('PT-00000');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdFormik, setPwdFormik] = useState(null);
  const [ptUsers, setPTUsers] = useState([])
  const [bobbinColors, setBobbinColors] = useState([]);
  const [bobbinTypes, setBobbinTypes] = useState([]);
  const [spoolDetails, setSpoolDetails] = useState();
  const {ptEntryData,ptLoading,ptError} = useSelector((state)=> state.ptEntry)
  const dispatch = useDispatch();

  const handleScan = async (spool_id, setFieldValue) => {
  try {
    const response = await getSpoolDetailsForPT(spool_id);

    console.log(response);

    const data = response.data;

    setFieldValue("preform_id", data.preform_id);
    setFieldValue("drawn_length", data.drawn_length);
    setFieldValue("tower_id", data.tower_id);
    setFieldValue("drawn_date", data.created_at?.split("T")[0]);
    setFieldValue("pt_date", data.allocation_date?.split("T")[0]);
    setFieldValue("pt_machine_id", data.pt_machine_id)
    setFieldValue("drawn_remark", data.remark)
    

  } catch (error) {
    console.error(error);
    showError(
      error.response?.data?.message || "Spool not found"
    );
  }
};

  useEffect(() => {
    const fetchPTUsers = async () => {
      try {
        const data = await getPTUsers();
        setPTUsers(data.data)
      } catch (error) {
        console.error("Error Fetching PT Users:", error)
      }
    }
    fetchPTUsers();
  }, [])

  useEffect(() => {
    const fetchBobbinColor = async () => {
      try {
        const data = await getBobbinColors();
        setBobbinColors(data.data);
      } catch (error) {
        console.error("Error Fetching Bobbin Colors")
      }
    }

    fetchBobbinColor();
  }, [])

  useEffect(() => {
    const fetchBobbinType = async () => {
      try {
        const data = await getBobbinTypes();
        setBobbinTypes(data.data);
      } catch (error) {
        console.log("Error Fetching Bobbin Types")
      }
    }
    fetchBobbinType();
  }, [])

  const ptUsersOptions = ptUsers.map((user) => ({
    label: `${user.pt_user_name}`,
    value: user.pt_user_id,
  }))

  console.log("What is the bobbin :", bobbinColors)

  const bobbinColorsOption = Array.isArray(bobbinColors)
    ? bobbinColors.map((color) => ({
      label: color.bobbin_color_name,
      value: color.bobbin_color_id,
    }))
    : [];

  const bobbinTypesOption = Array.isArray(bobbinTypes)
    ? bobbinTypes.map((type) => ({
      label: type.bobbin_type_name,
      value: type.bobbin_type_id,
    }))
    : [];

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik initialValues={initialValues}
          onSubmit={async(values, {resetForm}) => {
            const {
              multiple_end_weight,
              scratch_weight,
              pt_scrap_weight,

              ...rest
            } = values;
            const payload = {
              ...rest,

              multiple_end_length:
                (parseFloat(values.multiple_end_weight) || 0) * 27,

              scratch_length:
                (parseFloat(values.scratch_weight) || 0) * 27,

              pt_scrap_lenght:
                (parseFloat(values.pt_scrap_weight) || 0) * 27,

                balance_length:
                Math.max(0, (parseFloat(values.drawn_length) || 0) - (parseFloat(values.pt_done_length) || 0)).toFixed(3)
            };



           try {
    const response = await dispatch(ptEntryApi(payload));

    if (response.payload?.success) {
      showSuccess(response.payload.message || "PT Entry saved successfully");
      resetForm();
    } else {
      showError(response.payload || "Failed to save PT Entry");
    }

  } catch (error) {
    console.error(error);
    showError("Something went wrong");
  }

          }}>
          {({ values, setFieldValue, resetForm }) => {
            const me = (parseFloat(values.multiple_end_weight) || 0) * 27;
            const scr = (parseFloat(values.scratch_weight) || 0) * 27;
            const pts = (parseFloat(values.pt_scrap_weight) || 0) * 27;

            return (
              <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Entry</span>
                  <div className="flex gap-1.5">
                    <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                    <SubmitButton compact type="submit">Submit</SubmitButton>
                    <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                  </div>
                </div>
                {/* ══ 4-column main grid ══ */}
                <div className="grid grid-cols-[1fr_1fr_1.1fr_1.2fr] gap-2 flex-1 min-h-0">

                  {/* ── COL 1: Spool Info ── */}
                  <ModuleCard compact title="Spool Info" icon={<Database size={12} className="text-blue-600" />}>
                    <div className="flex flex-col gap-1.5 overflow-y-auto h-full">
                      {/* Scan row — full width */}
                      <div className="flex items-end gap-1.5">
                        <div className="flex-1">
                          <FormikInput compact label="Drawn Spool ID" name="spool_id" placeholder="Scan..." />
                        </div>
                        <button type="button"
                        onClick={() => handleScan(values.spool_id, setFieldValue)}
                          className="flex items-center gap-0.5 px-2 py-1.5 bg-indigo-600 text-white text-[8px] font-bold rounded uppercase hover:bg-indigo-700 h-[28px]">
                          <Scan size={9} /> Scan
                        </button>
                      </div>
                      {/* 2-per-row grid */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                        <FormikInput compact label="Drawn Length (km)" name="drawn_length" readOnly />
                        <FormikInput compact label="DT No" name="tower_id" readOnly />
                        <FormikInput compact label="Drawn Date" name="drawn_date" type="date" />
                        <FormikInput compact label="PT In Entry Date" name="pt_date" type="date" />
                        <FormikInput compact label="FID" name="fid" type="text" />
                        <FormikInput compact label="PT Bobbin No" name="bobbin_no" placeholder="Scan bobbin..." />
                        <FormikInput compact label="Spool Status" name="spool_status" placeholder="Spool Status" />
                      </div>
                      {/* Drawn Remark — full width */}
                      <FormikTextarea compact label="Drawn Remark" name="drawn_remark" rows={2} placeholder="Auto-fetched..." />
                      {/* <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-all h-[30px] self-end">
                        <Field
                          type="checkbox"
                          name="bobbin_Status"
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-indigo-600"
                        />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Bobbin Status Ok</span>
                      </label>*/}
                      {/* PT ID — full width */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">FID</label>
                        <div className="flex gap-1">
                          <input readOnly value={values.fid} placeholder="Click Generate..."
                            className="flex-1 min-w-0 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 outline-none" />
                          <button type="button"
                            disabled={values.rejection}
                            onClick={() => { const id = genPTID(lastPTID); setFieldValue('fid', id); setLastPTID(id); }}
                            className={`px-2 py-1 rounded text-[8px] font-bold uppercase whitespace-nowrap transition-all ${values.rejection
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                            <Zap size={9} className="inline mr-0.5" />Gen ID
                          </button>
                        </div>
                        {values.rejection && <p className="text-[8px] text-rose-500">Disabled — rejection active</p>}
                      </div>
                    </div>
                  </ModuleCard>

                  {/* ── COL 2: Personnel + Metrics ── */}
                  <ModuleCard compact title="Personnel & Metrics" icon={<Users size={12} className="text-emerald-600" />}>
                    <div className="flex flex-col gap-1.5 overflow-y-auto h-full">
                      <div className="grid grid-cols-2 gap-1.5">
                        <FormikInput compact label="PT Machine No" name="pt_machine_id" readOnly />
                        <FormikSelect compact label="Operator Name" name="operator_id" options={ptUsersOptions} />
                        <FormikSelect compact label="Shift Incharge" name="shift_incharge_id" options={ptUsersOptions} />
                        <FormikSelect compact label="Bobbin Color" name="bobbin_color_id" options={bobbinColorsOption} />
                        <FormikSelect compact label="Bobbin Type" name="bobbin_type_id" options={bobbinTypesOption} />
                        <FormikSelect compact label="Running Strain" name="running_strain" options={['1', '2']} />
                        <FormikInput compact label="Product Type" name="product_type_id" type='number'  />
                        <FormikInput compact label="PT Done (km)" name="pt_done_length" type="number" step="0.001" placeholder="0.000" />
                        <FormikInput compact label="BE Scrap" name="be_scrap" type="number" placeholder="0" />
                        <FormikSelect compact label="Payoff Vibration" name="payoff_vibration" options={['Yes', 'No']} />
                        <FormikSelect compact label="Dancer Vibration" name="dancer_vibration" options={['Yes', 'No']} />
                      </div>
                      {/* Balance — full width */}
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Balance (km)</label>
                        <div className="w-full bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-xs font-bold text-indigo-700 font-mono">
                          {calcBalance(values.drawn_length, values.pt_done_length)}
                        </div>
                      </div>
                      {/* Remark — full width */}

                    </div>
                  </ModuleCard>

                  {/* ── COL 3: Rejections + PT Log Table ── */}
                  <div className="flex flex-col gap-2 min-h-0">

                    <ModuleCard compact title="Rejections" icon={<AlertTriangle size={12} className="text-rose-500" />}>
                      <div className="flex flex-col overflow-y-auto h-full">

                        {/* Rejection */}
                        <RejRow name="rejection" label="Rejection" checked={values.rejection}>
                          <FormikSelect compact name="rejection_reason"
                            options={['Select', 'B-BFD', 'L-Lumps', 'C-SCD', 'S-Bot End', 'M-Multiple End', 'D-Scratch']} />
                        </RejRow>

                        {/* Balance Draw Rejection */}
                        <div className="flex items-center gap-2 py-1 border-b border-slate-50">
                          <Field type="checkbox" name="bal_draw_rejection"
                            disabled={!values.bal_draw_rejection}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 flex-shrink-0 disabled:opacity-40" />
                          <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap w-28 flex-shrink-0">Bal. Draw Rej.</span>
                          <div className="flex-1 min-w-0 flex items-center gap-1">
                            {!values.bal_draw_rejection ? (
                              <button type="button"
                                onClick={() => { setPwdFormik({ setFieldValue }); setShowPwdModal(true); }}
                                className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-bold rounded hover:bg-amber-200 whitespace-nowrap">
                                <Lock size={8} className="inline mr-0.5" />Unlock
                              </button>
                            ) : values.bal_draw_rejection ? (
                              <FormikInput compact name="bal_draw_rejection_reason" placeholder="Remark..." />
                            ) : null}
                          </div>
                        </div>

                        {/* Multiple End */}
                        <RejRow name="multiple_end" label="Multiple End" checked={values.multiple_end}>
                          <div className="flex items-center gap-1">
                            <FormikInput compact name="multiple_end_weight" type="number" step="0.001" placeholder="kg" />
                            <div className="bg-emerald-50 border border-emerald-200 rounded px-1.5 py-1 text-[9px] font-bold text-emerald-700 font-mono whitespace-nowrap">
                              ={me.toFixed(2)}
                            </div>
                          </div>
                        </RejRow>

                        {/* Scratch */}
                        <RejRow name="scratch" label="Scratch" checked={values.scratch}>
                          <div className="flex items-center gap-1">
                            <FormikInput compact name="scratch_weight" type="number" step="0.001" placeholder="kg" />
                            <div className="bg-emerald-50 border border-emerald-200 rounded px-1.5 py-1 text-[9px] font-bold text-emerald-700 font-mono whitespace-nowrap">
                              ={scr.toFixed(2)}
                            </div>
                          </div>
                        </RejRow>

                        {/* PT Scrap */}
                        <RejRow name="pt_scrap" label="PT Scrap" checked={values.pt_scrap}>
                          <div className="flex items-center gap-1">
                            <FormikInput compact name="pt_scrap_weight" type="number" step="0.001" placeholder="kg" />
                            <div className="bg-emerald-50 border border-emerald-200 rounded px-1.5 py-1 text-[9px] font-bold text-emerald-700 font-mono whitespace-nowrap">
                              ={pts.toFixed(2)}
                            </div>
                          </div>
                        </RejRow>

                        {/* ZTMD */}
                        <RejRow name="ztmd" label="ZTMD" checked={values.ztmd}>
                          <FormikInput compact name="ztmd_id" placeholder="Enter ZTMD ID..." />
                        </RejRow>

                        {/* DOC */}
                        <RejRow name="doc" label="DOC" checked={values.doc}>
                          <FormikInput compact name="doc_id" placeholder="Enter DOC ID..." />
                        </RejRow>
                      </div>
                    </ModuleCard>

                    {/* PT Process Log — below rejections, scrollable */}
                    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck size={12} className="text-purple-600" />
                          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">PT Process Log</span>
                        </div>
                        <FieldArray name="pt_logs">
                          {({ push }) => (
                            <button type="button"
                              onClick={() => push({ identifier: '', length: '', reason: 'OK' })}
                              className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all">
                              <Plus size={10} />
                            </button>
                          )}
                        </FieldArray>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        <FieldArray name="pt_logs">
                          {({ remove, form }) => (
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  {['Barcode / ID / Flaw', 'Length', 'Reason', ''].map(h => (
                                    <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {form.values.pt_logs?.map((_, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="px -1 py-1">
                                      <Field name={`pt_logs.${idx}.identifier`}
                                        className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:bg-white rounded" />
                                    </td>
                                    <td className="px-1 py-1">
                                      <Field name={`pt_logs.${idx}.length`}
                                        className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:bg-white rounded" />
                                    </td>
                                    <td className="px-1 py-1">
                                      <Field as="select" name={`pt_logs.${idx}.reason`}
                                        className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:bg-white rounded cursor-pointer">
                                        {['OK', 'PT Scrap', 'Draw Scrap', 'PT Break Scrap'].map(o => (
                                          <option key={o}>{o}</option>
                                        ))}
                                      </Field>
                                    </td>
                                    <td className="px-1 py-1 text-center">
                                      <button type="button" onClick={() => remove(idx)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 size={11} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {form.values.pt_logs?.length === 0 && (
                                  <tr>
                                    <td colSpan="4" className="px-3 py-4 text-center text-[9px] text-slate-400">
                                      No entries — click + to add
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          )}
                        </FieldArray>
                      </div>
                    </div>

                  </div>{/* end col 3 flex */}

                  {/* ── COL 4: Draw Flaw Table + Actions ── */}
                  <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck size={12} className="text-indigo-600" />
                          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Draw Flaw Log</span>
                        </div>
                        <FieldArray name="draw_flaws">
                          {({ push }) => (
                            <button type="button"
                              onClick={() => push({ draw_flaw: '', position1: '', position2: '', defect_length: '', act_cutting_length: '' })}
                              className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all">
                              <Plus size={10} />
                            </button>
                          )}
                        </FieldArray>
                      </div>
                      <div className="overflow-y-auto flex-1">
                        <FieldArray name="draw_flaws">
                          {({ remove, form }) => (
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  {['Draw Flaw', 'Pos 1', 'Pos 2', 'Defect Len', 'Act Cut Len', ''].map(h => (
                                    <th key={h} className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {(form.values.draw_flaws || []).length === 0 && (
                                  <tr>
                                    <td colSpan="6" className="px-3 py-4 text-center text-[9px] text-slate-400">
                                      No entries — click + to add
                                    </td>
                                  </tr>
                                )}

                                {(form.values.draw_flaws || []).map((_, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50">

                                    {['draw_flaw', 'position1', 'position2', 'defect_length', 'act_cutting_length'].map((f) => (
                                      <td key={f} className="px-1 py-1">
                                        <Field
                                          name={`draw_flaws.${idx}.${f}`}
                                          className="w-full bg-transparent px-1 py-0.5 text-xs focus:outline-none focus:bg-white rounded"
                                        />
                                      </td>
                                    ))}

                                    <td className="px-1 py-1 text-center">
                                      <button type="button" onClick={() => remove(idx)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 size={11} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </FieldArray>
                      </div>
                    </div>

                    {/* Actions */}

                  </div>

                </div>
                {/* ══ end 4-col grid ══ */}

              </Form>
            );
          }}
        </Formik>

        <PasswordModal
          isOpen={showPwdModal}
          onClose={() => { setShowPwdModal(false); setPwdFormik(null); }}
          onSuccess={() => { if (pwdFormik) pwdFormik.setFieldValue('bal_draw_rejection', true); }}
        />
      </div>
    </div>
  );
};

export default PTEntry;
