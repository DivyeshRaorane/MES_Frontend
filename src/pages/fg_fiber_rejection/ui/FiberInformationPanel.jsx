import { useState, useEffect, useRef } from 'react';
import { Scan, Search, Info, CheckCircle2, XCircle, Clock, AlertTriangle, Package, Truck } from 'lucide-react';
import { getFiberInformation } from '../services/fg_rejection.api';
import { showError } from '../../../utils/toastService';

/* ═══════════════════════════════════════════════════════════
   GRADE COLOR HELPERS
   ═══════════════════════════════════════════════════════════ */
const gradeColor = (grade) => {
  if (!grade) return 'bg-slate-100 text-slate-500';
  const g = grade.toString().toUpperCase().trim();
  if (g === 'A') return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
  if (g === 'B') return 'bg-blue-100 text-blue-700 border border-blue-300';
  if (g === 'C') return 'bg-orange-100 text-orange-700 border border-orange-300';
  if (g === 'REJECT' || g === 'REJ' || g === 'R') return 'bg-red-100 text-red-700 border border-red-300';
  return 'bg-slate-100 text-slate-600 border border-slate-300';
};

const gradeLabel = (grade) => {
  if (!grade) return '—';
  return grade.toString().toUpperCase();
};

/* ═══════════════════════════════════════════════════════════
   QC STATUS BADGE
   ═══════════════════════════════════════════════════════════ */
const QCStatusBadge = ({ data }) => {
  if (!data) return null;
  const finalGrade = data.final_grade?.toString().toUpperCase().trim();
  if (finalGrade === 'REJECT' || finalGrade === 'REJ' || finalGrade === 'R') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700"><XCircle size={12} /> QC Failed</span>;
  }
  if (finalGrade && finalGrade !== '') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 size={12} /> QC Passed</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700"><Clock size={12} /> QC Pending</span>;
};

/* ═══════════════════════════════════════════════════════════
   DISPATCH STATUS BADGE
   ═══════════════════════════════════════════════════════════ */
const DispatchBadge = ({ status }) => {
  if (!status) return <span className="text-[10px] text-slate-400">—</span>;
  const s = status.toString().toLowerCase();
  if (s === 'dispatched' || s === 'yes' || s === 'true' || s === '1') {
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700"><Truck size={12} /> Dispatched</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700"><Package size={12} /> Not Dispatched</span>;
};

/* ═══════════════════════════════════════════════════════════
   PROCESS TIMELINE
   ═══════════════════════════════════════════════════════════ */
const ProcessTimeline = ({ data }) => {
  const steps = [
    { label: 'Drawing', done: !!data?.draw_date || !!data?.fid },
    { label: 'Proof Testing', done: !!data?.pt_date || !!data?.fiber_length },
    { label: 'QC Completed', done: !!data?.final_grade },
    { label: 'Rewinding', done: !!data?.rewinding_status },
    { label: 'Coloring', done: !!data?.coloring_status },
    { label: 'Dispatch', done: !!data?.dispatch_status },
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold ${
            step.done ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-200'
          }`}>
            {step.done ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            {step.label}
          </div>
          {i < steps.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   PARAMETER SECTION COMPONENT
   ═══════════════════════════════════════════════════════════ */
const ParamSection = ({ title, params }) => (
  <div className="border border-slate-200 rounded-lg overflow-hidden">
    <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200">
      <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">{title}</h4>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-0 p-3">
      {params.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
          <span className="text-[10px] text-slate-500 font-medium">{label}</span>
          <span className="text-[10px] font-bold text-slate-800 font-mono">{value ?? '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SUMMARY CARD
   ═══════════════════════════════════════════════════════════ */
const SummaryCard = ({ data }) => {
  if (!data) return null;
  const fields = [
    { label: 'Bobbin No', value: data.bobbin_no },
    { label: 'FID', value: data.fid },
    { label: 'Product Type', value: data.product_type },
    { label: 'PT Length', value: data.fiber_length },
    { label: 'Optical Length', value: data.optical_length },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <QCStatusBadge data={data} />
          <DispatchBadge status={data.dispatch_status} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 font-medium">Final Grade:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${gradeColor(data.final_grade)}`}>
            {gradeLabel(data.final_grade)}
          </span>
          <span className="text-[9px] text-slate-500 font-medium ml-2">Temp Grade:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${gradeColor(data.temp_grade)}`}>
            {gradeLabel(data.temp_grade)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {fields.map(f => (
          <div key={f.label} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <div className="text-[9px] text-slate-500 font-medium uppercase">{f.label}</div>
            <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{f.value ?? '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   QC REMARKS SECTION
   ═══════════════════════════════════════════════════════════ */
const QCRemarks = ({ data }) => {
  const remarks = [
    { label: 'QC Remark', value: data?.qc_remark },
    { label: 'NC Cause', value: data?.nc_cause },
    { label: 'Rejection Reason', value: data?.rejection_reason },
    { label: 'OTDR Operator', value: data?.otdr_operator },
    { label: 'OTDR Machine', value: data?.otdr_machine },
    { label: 'QC Test Date', value: data?.qc_test_date },
  ].filter(r => r.value);

  if (remarks.length === 0) return null;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-amber-50 px-3 py-1.5 border-b border-slate-200">
        <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">QC Remarks & Details</h4>
      </div>
      <div className="grid grid-cols-3 gap-3 p-3">
        {remarks.map(r => (
          <div key={r.label} className="bg-slate-50 rounded px-3 py-2 border border-slate-100">
            <div className="text-[9px] text-slate-500 font-medium uppercase">{r.label}</div>
            <div className="text-[10px] font-bold text-slate-700 mt-0.5">{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT: FIBER INFORMATION PANEL
   ═══════════════════════════════════════════════════════════ */
const FiberInformationPanel = ({ lastScannedBobbin }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('bobbin_no');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [autoLoadedBobbin, setAutoLoadedBobbin] = useState(null);
  const scanRef = useRef(null);

  // Auto-load fiber information when lastScannedBobbin changes
  useEffect(() => {
    if (lastScannedBobbin && lastScannedBobbin !== autoLoadedBobbin) {
      setAutoLoadedBobbin(lastScannedBobbin);
      fetchFiberInfo(lastScannedBobbin, 'bobbin_no');
    }
  }, [lastScannedBobbin]);

  const fetchFiberInfo = async (value, type) => {
    if (!value?.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await getFiberInformation(value.trim(), type);
      if (res?.success) {
        if (!res.data?.is_qc_out) {
          setError('This Bobbin is not QC Out.');
          setData(null);
        } else {
          setData(res.data);
          setError('');
        }
      } else {
        setError(res?.message || 'Failed to fetch fiber information');
        setData(null);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Something went wrong';
      setError(msg);
      setData(null);
      showError(msg);
    }
    setLoading(false);
  };

  const handleManualSearch = () => {
    if (!searchInput.trim()) { showError('Enter a bobbin number or FID'); return; }
    fetchFiberInfo(searchInput, searchType);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Search Bar ── */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0 bg-slate-50/40">
        <div className="flex items-end gap-3">
          <div className="w-32 flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Search By</label>
            <select value={searchType} onChange={e => setSearchType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
              <option value="bobbin_no">Bobbin No</option>
              <option value="fid">FID</option>
            </select>
          </div>
          <div className="flex-1 max-w-sm flex flex-col gap-0.5">
            <label className="text-[9px] font-bold text-teal-600 uppercase">
              {searchType === 'bobbin_no' ? 'Scan Bobbin No.' : 'Enter FID'}
            </label>
            <div className="flex gap-1.5">
              <input ref={scanRef} value={searchInput} onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleManualSearch(); } }}
                placeholder={searchType === 'bobbin_no' ? 'Scan or enter bobbin number...' : 'Enter FID...'}
                className="flex-1 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-300 placeholder:text-teal-300" />
              <button type="button" onClick={handleManualSearch} disabled={loading}
                className="w-9 h-9 flex items-center justify-center bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:scale-95 disabled:opacity-50">
                {loading ? <span className="animate-spin">⟳</span> : <Search size={14} />}
              </button>
            </div>
          </div>
          {lastScannedBobbin && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Scan size={12} className="text-blue-600" />
              <span className="text-[9px] text-blue-600 font-medium">Auto-loaded:</span>
              <span className="text-[10px] font-bold text-blue-800 font-mono">{lastScannedBobbin}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="animate-spin text-lg">⟳</span>
              <span className="text-xs font-medium">Loading fiber information...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-xs font-bold text-red-700">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!data && !error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Info size={32} className="mb-2" />
            <p className="text-xs font-medium">Scan a bobbin or enter a Bobbin No / FID to view fiber information</p>
            {lastScannedBobbin && (
              <p className="text-[10px] mt-1 text-blue-500">Fiber info will auto-load when you scan a bobbin in Color or Rewinding mode</p>
            )}
          </div>
        )}

        {/* Data Display */}
        {data && !loading && (
          <>
            {/* Summary Card */}
            <SummaryCard data={data} />

            {/* Process Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-2">Process Timeline</h3>
              <ProcessTimeline data={data} />
            </div>

            {/* QC Remarks */}
            <QCRemarks data={data} />

            {/* QC Parameters Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Length */}
              <ParamSection title="Length" params={[
                { label: 'PT Length', value: data.fiber_length },
                { label: 'Optical Length', value: data.optical_length },
              ]} />

              {/* Attenuation */}
              <ParamSection title="Attenuation" params={[
                { label: 'Attn 1310 Top', value: data.atn_1310_top },
                { label: 'Attn 1310 Bottom', value: data.atn_1310_bottom },
                { label: 'Attn 1550 Top', value: data.atn_1550_top },
                { label: 'Attn 1550 Bottom', value: data.atn_1550_bottom },
                { label: 'Spec 1285-1330', value: data.spec_1285_1330 },
                { label: 'Spec 1310', value: data.spec_1310 },
                { label: 'Spec 1550', value: data.spec_1550 },
              ]} />

              {/* MFD */}
              <ParamSection title="MFD" params={[
                { label: 'MFD 1310 Top', value: data.mfd_1310_top },
                { label: 'MFD 1310 Bottom', value: data.mfd_1310_bottom },
              ]} />

              {/* Cut Off */}
              <ParamSection title="Cut Off" params={[
                { label: 'Cut Off Top', value: data.cut_off_top },
                { label: 'Cut Off Bottom', value: data.cut_off_bottom },
              ]} />

              {/* Cladding */}
              <ParamSection title="Cladding" params={[
                { label: 'Clad Dia Top', value: data.clad_dia_top },
                { label: 'Clad Dia Bottom', value: data.clad_dia_bottom },
                { label: 'Core Clad Concentricity Top', value: data.core_clad_concentricity_top },
                { label: 'Core Clad Concentricity Bottom', value: data.core_clad_concentricity_bottom },
                { label: 'Clad Ovality Top', value: data.clad_ovality_top },
                { label: 'Clad Ovality Bottom', value: data.clad_ovality_bottom },
              ]} />

              {/* Core */}
              <ParamSection title="Core" params={[
                { label: 'Core Dia Top', value: data.core_dia_top },
                { label: 'Core Dia Bottom', value: data.core_dia_bottom },
                { label: 'Core Ovality Top', value: data.core_ovality_top },
                { label: 'Core Ovality Bottom', value: data.core_ovality_bottom },
              ]} />

              {/* Primary Coating */}
              <ParamSection title="Primary Coating" params={[
                { label: 'Primary Coat Dia Top', value: data.primary_coating_dia_top },
                { label: 'Primary Coat Dia Bottom', value: data.primary_coating_dia_bottom },
                { label: 'Primary Coat Conc. Top', value: data.primary_coating_concentricity_top },
                { label: 'Primary Coat Conc. Bottom', value: data.primary_coating_concentricity_bottom },
              ]} />

              {/* Secondary Coating */}
              <ParamSection title="Secondary Coating" params={[
                { label: 'Secondary Coat Dia Top', value: data.secondary_coating_dia_top },
                { label: 'Secondary Coat Dia Bottom', value: data.secondary_coating_dia_bottom },
                { label: 'Secondary Coat Conc. Top', value: data.secondary_coating_concentricity_top },
                { label: 'Secondary Coat Conc. Bottom', value: data.secondary_coating_concentricity_bottom },
                { label: 'Coating Ovality Top', value: data.coating_ovality_top },
                { label: 'Coating Ovality Bottom', value: data.coating_ovality_bottom },
              ]} />

              {/* Dispersion */}
              <ParamSection title="Dispersion" params={[
                { label: 'Zero Dispersion Wavelength', value: data.zero_disp_wave },
                { label: 'Slope Zero Dispersion', value: data.slope_zero_disp },
                { label: 'Dispersion 1550', value: data.disp_1550 },
                { label: 'Dispersion 1285-1330', value: data.disp_1285_1330 },
                { label: 'Dispersion 1270-1340', value: data.disp_1270_1340 },
                { label: 'Dispersion 1575', value: data.disp_1575 },
              ]} />

              {/* PMD */}
              <ParamSection title="PMD" params={[
                { label: 'PMD 1310', value: data.pmd_1310 },
                { label: 'PMD 1550', value: data.pmd_1550 },
              ]} />

              {/* Fiber Curl */}
              <ParamSection title="Fiber Curl" params={[
                { label: 'Fiber Curl Top', value: data.fiber_curl_top },
                { label: 'Fiber Curl Bottom', value: data.fiber_curl_bottom },
              ]} />

              {/* MAC */}
              <ParamSection title="MAC" params={[
                { label: 'MAC Value', value: data.mac_value },
              ]} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FiberInformationPanel;
