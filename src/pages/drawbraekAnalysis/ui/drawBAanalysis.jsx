import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  AlertCircle, Search, Activity, ClipboardList, Info, Loader2,
} from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { getPendingBreaks, getBobbinByFid, saveBreakAnalysis } from '../services/break_analysis.api';

/* ── Validation Schema ── */
const validationSchema = Yup.object().shape({
  machine_no: Yup.mixed().required('Machine No is required'),
  break_length: Yup.number().typeError('Must be a number').required('Break Length is required'),
  break_type: Yup.string().required('Break Type is required'),
  break_category: Yup.string().required('Break Category is required'),
  break_c_by: Yup.string().required('Break Collected By is required'),
  entry_done_by: Yup.string().required('Entry Done By is required'),
  main_break_type: Yup.string().required('Main Break Type is required'),
  bsa_done_by: Yup.string().required('BSA Done By is required'),
});

const initialValues = {
  machine_no: '',
  break_length: '',
  break_type: '',
  break_category: '',
  break_remark: '',
  break_c_by: '',
  entry_done_by: '',
  main_break_type: '',
  sub_reason: '',
  next_sub_reason: '',
  dist_from_periphery: '',
  particle_size: '',
  flaw_size: '',
  bsa_remark: '',
  bsa_done_by: '',
};

/* ══════════════════════════════════════════════════════════════ */

const DrawBrakAnalysis = () => {
  const [drawPending, setDrawPending] = useState([]);
  const [ptPending, setPtPending] = useState([]);
  const [drawSearch, setDrawSearch] = useState('');
  const [ptSearch, setPtSearch] = useState('');
  const [selectedFid, setSelectedFid] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null); // 'DRAW' | 'PT'
  const [bobbinInfo, setBobbinInfo] = useState(null);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingBobbin, setLoadingBobbin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ── Fetch pending lists ── */
  const fetchPending = async () => {
    try {
      setLoadingPending(true);
      const data = await getPendingBreaks();
      setDrawPending(data?.data?.drawPending || []);
      setPtPending(data?.data?.ptPending || []);
    } catch (err) {
      showError('Failed to load pending breaks');
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  /* ── Fetch bobbin info on FID click ── */
  const handleFidClick = async (fid, source) => {
    try {
      setLoadingBobbin(true);
      setSelectedFid(fid);
      setSelectedSource(source);
      const data = await getBobbinByFid(fid);
      console.log("WHat is the data:", data)
      setBobbinInfo(data?.data);
    } catch (err) {
      showError('Failed to load bobbin details');
      setBobbinInfo(null);
    } finally {
      setLoadingBobbin(false);
    }
  };

  /* ── Submit analysis ── */
  const handleSubmit = async (values, { resetForm }) => {
    if (!selectedFid) {
      showError('Please select a pending FID first');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        fiber_id: selectedFid,
        source: selectedSource,
        ...values,
      };
      await saveBreakAnalysis(payload);
      showSuccess('Break analysis saved successfully');
      resetForm();
      setSelectedFid(null);
      setSelectedSource(null);
      setBobbinInfo(null);
      await fetchPending();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save break analysis';
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Filtered lists ── */
  const drawFiltered = drawPending.filter(id =>
    id.toLowerCase().includes(drawSearch.toLowerCase())
  );
  const ptFiltered = ptPending.filter(id =>
    id.toLowerCase().includes(ptSearch.toLowerCase())
  );

  return (
    <div className="h-full overflow-hidden bg-slate-50 font-sans text-slate-800 flex">

      {/* ════════ LEFT PANEL: Pending IDs ════════ */}
      <div className="w-[280px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white overflow-hidden">

        {/* Draw Pending */}
        <div className="flex-1 flex flex-col overflow-hidden border-b border-slate-200">
          <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle size={12} className="text-rose-500" />
              <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Draw Break Pending</span>
              <span className="text-[8px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">
                {drawPending.length}
              </span>
            </div>
          </div>
          <div className="px-2 py-1.5 flex-shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search FID..." value={drawSearch} onChange={e => setDrawSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-[10px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 px-2 pb-2">
            <div className="flex flex-col gap-1">
              {loadingPending ? (
                <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
              ) : drawFiltered.length === 0 ? (
                <div className="text-center text-[9px] text-slate-400 py-4">No pending Draw breaks</div>
              ) : drawFiltered.map((id) => (
                <div key={id}
                  onClick={() => handleFidClick(id, 'DRAW')}
                  className={`text-[10px] font-semibold py-1.5 px-2.5 rounded border cursor-pointer transition-all truncate
                    ${selectedFid === id
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600'}`}
                  title={id}>{id}</div>
              ))}
            </div>
          </div>
        </div>

        {/* PT Pending */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle size={12} className="text-amber-500" />
              <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">PT Break Pending</span>
              <span className="text-[8px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
                {ptPending.length}
              </span>
            </div>
          </div>
          <div className="px-2 py-1.5 flex-shrink-0">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search FID..." value={ptSearch} onChange={e => setPtSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-[10px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 px-2 pb-2">
            <div className="flex flex-col gap-1">
              {loadingPending ? (
                <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
              ) : ptFiltered.length === 0 ? (
                <div className="text-center text-[9px] text-slate-400 py-4">No pending PT breaks</div>
              ) : ptFiltered.map((id) => (
                <div key={id}
                  onClick={() => handleFidClick(id, 'PT')}
                  className={`text-[10px] font-semibold py-1.5 px-2.5 rounded border cursor-pointer transition-all truncate
                    ${selectedFid === id
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-600 hover:text-white hover:border-amber-600'}`}
                  title={id}>{id}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ RIGHT PANEL: Bobbin Info + Analysis Form ════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* Header bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw / PT Break Analysis</span>
                  {selectedFid && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      selectedSource === 'DRAW' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedSource} — {selectedFid}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => {
                    resetForm();
                    setSelectedFid(null);
                    setSelectedSource(null);
                    setBobbinInfo(null);
                  }} />
                  <SubmitButton compact disabled={submitting || !selectedFid}>
                    {submitting ? 'Saving...' : 'Submit'}
                  </SubmitButton>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">

                {/* ── Bobbin Information (Read-Only) ── */}
                {!selectedFid && !loadingBobbin && (
                  <div className="flex items-center justify-center h-32 text-slate-400 text-xs">
                    <Info size={14} className="mr-2" /> Select a pending FID from the left panel to begin analysis
                  </div>
                )}

                {loadingBobbin && (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                    <span className="ml-2 text-xs text-slate-500">Loading bobbin details...</span>
                  </div>
                )}

                {bobbinInfo && !loadingBobbin && (
                  <>
                    <ModuleCard compact title={`${selectedSource === 'DRAW' ? 'Draw Entry' : 'Bobbin'} Information (Read-Only)`} icon={<Info size={13} className="text-green-600" />}>
                      <div className="grid grid-cols-5 gap-x-3 gap-y-1.5">
                        {selectedSource === 'DRAW' ? (
                          <>
                            <ReadOnlyField label="FID" value={bobbinInfo.fid} />
                            <ReadOnlyField label="Spool ID" value={bobbinInfo.spool_id} />
                            <ReadOnlyField label="Preform ID" value={bobbinInfo.preform_id} />
                            <ReadOnlyField label="Tower No" value={bobbinInfo.tower_no} />
                            <ReadOnlyField label="Drawn Length" value={bobbinInfo.drawn_length} />
                            <ReadOnlyField label="Drawn Date" value={bobbinInfo.drawn_date} />
                            <ReadOnlyField label="Shift" value={bobbinInfo.shift} />
                            <ReadOnlyField label="Operator" value={bobbinInfo.operator_name} />
                            <ReadOnlyField label="Indication" value={bobbinInfo.indication_fiber_cut} />
                            <ReadOnlyField label="Fiber Cut Reason" value={bobbinInfo.fiber_cut_reason} />
                            <ReadOnlyField label="Bobbin Color" value={bobbinInfo.bobbin_color} />
                            <ReadOnlyField label="Bobbin Type" value={bobbinInfo.bobbin_type} />
                            <ReadOnlyField label="Weight Before" value={bobbinInfo.weight_before} />
                            <ReadOnlyField label="Weight After" value={bobbinInfo.weight_after} />
                            <ReadOnlyField label="Balance Weight" value={bobbinInfo.balance_weight} />
                          </>
                        ) : (
                          <>
                            <ReadOnlyField label="FID" value={bobbinInfo.fid} />
                            <ReadOnlyField label="Bobbin No" value={bobbinInfo.bobbin_no} />
                            <ReadOnlyField label="Spool ID" value={bobbinInfo.spool_id} />
                            <ReadOnlyField label="Spool FID" value={bobbinInfo.spool_fid} />
                            <ReadOnlyField label="Tower No" value={bobbinInfo.tower_no} />
                            <ReadOnlyField label="PT Machine No" value={bobbinInfo.pt_machine} />
                            <ReadOnlyField label="Fiber Length" value={bobbinInfo.fiber_length} />
                            <ReadOnlyField label="Drawn Length" value={bobbinInfo.drawn_length} />
                            <ReadOnlyField label="Drawn Date" value={bobbinInfo.drawn_date} />
                            <ReadOnlyField label="PT Date" value={bobbinInfo.pt_date} />
                            <ReadOnlyField label="Operator" value={bobbinInfo.operator_name} />
                            <ReadOnlyField label="Fiber Type" value={bobbinInfo.fiber_type} />
                            <ReadOnlyField label="Fiber Color" value={bobbinInfo.fiber_color} />
                            <ReadOnlyField label="Product Type" value={bobbinInfo.product_type} />
                            <ReadOnlyField label="Preform Type" value={bobbinInfo.preform_type} />
                            <ReadOnlyField label="D2 Status" value={bobbinInfo.d2_status} />
                            <ReadOnlyField label="H2 Status" value={bobbinInfo.h2_status} />
                            <ReadOnlyField label="Temp Grade" value={bobbinInfo.temp_grade} />
                            <ReadOnlyField label="Final Grade" value={bobbinInfo.final_grade} />
                            <ReadOnlyField label="QC Status" value={bobbinInfo.qc_status} />
                          </>
                        )}
                      </div>
                    </ModuleCard>

                    {/* ── Break Analysis Form ── */}
                    <div className="grid grid-cols-2 gap-2">
                      <ModuleCard compact title="Break Information" icon={<Activity size={13} className="text-blue-600" />}>
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1">
                          <FormikSelect compact label="Machine No" name="machine_no"
                            options={[1, 2, 3, 4].map(n => ({ value: n, label: `${n}` }))} />
                          <FormikInput compact label="Break Length" name="break_length" type="number" />
                          <FormikSelect compact label="Break Type" name="break_type"
                            options={['Particle', 'Neckdown', 'Cladding', 'Surface', 'Bubble', 'Other']} />
                          <FormikSelect compact label="Category" name="break_category"
                            options={['Cat A', 'Cat B', 'Cat C']} />
                          <FormikInput compact label="Break Remark" name="break_remark" />
                          <FormikInput compact label="Break Collected By" name="break_c_by" />
                          <FormikInput compact label="Entry Done By" name="entry_done_by" />
                        </div>
                      </ModuleCard>

                      <ModuleCard compact title="BSA Analysis" icon={<ClipboardList size={13} className="text-indigo-600" />}>
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1">
                          <FormikSelect compact label="Main Break Type" name="main_break_type"
                            options={['Particle', 'Neckdown', 'Cladding', 'Surface', 'Bubble', 'Other']} />
                          <FormikSelect compact label="Sub Reason" name="sub_reason"
                            options={['Internal Bubble', 'External Scratch', 'Zirconia', 'Carbon', 'Other']} />
                          <FormikSelect compact label="Next Sub Reason" name="next_sub_reason"
                            options={['N-Sub 1', 'N-Sub 2', 'N-Sub 3']} />
                          <FormikInput compact label="Dist From Periphery" name="dist_from_periphery" type="number" />
                          <FormikInput compact label="Particle Size" name="particle_size" type="number" />
                          <FormikInput compact label="Flaw Size" name="flaw_size" type="number" />
                          <FormikInput compact label="BSA Remark" name="bsa_remark" />
                          <FormikInput compact label="BSA Done By" name="bsa_done_by" />
                        </div>
                      </ModuleCard>
                    </div>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

/* ── Read-only field helper ── */
const ReadOnlyField = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[8px] font-bold text-slate-500 uppercase">{label}</span>
    <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 rounded px-2 py-1 border border-slate-200 truncate">
      {value ?? '—'}
    </span>
  </div>
);

export default DrawBrakAnalysis;
