import { useState, useEffect, useRef } from 'react';
import { Scan, Search, Info, CheckCircle2, XCircle, Clock, AlertTriangle, Package, Truck } from 'lucide-react';
import { getFiberInformation } from '../services/fg_rejection.api';
import { showError } from '../../../utils/toastService';

/* ── Grade helpers ── */
const gradeColor = (grade) => {
  if (!grade) return 'bg-slate-100 text-slate-500';
  const g = grade.toString().toUpperCase().trim();
  if (g === 'A') return 'bg-emerald-100 text-emerald-700';
  if (g === 'B') return 'bg-blue-100 text-blue-700';
  if (g === 'C') return 'bg-orange-100 text-orange-700';
  if (g === 'REJECT' || g === 'REJ' || g === 'R') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
};

/* ── Param Row (compact) ── */
const P = ({ label, value }) => (
  <div className="flex justify-between items-center py-[2px]">
    <span className="text-[9px] font-semibold text-slate-900 truncate">{label}</span>
    <span className="text-[9px] font-extrabold text-black font-mono ml-1">{value ?? '—'}</span>
  </div>
);

/* ── Section Block ── */
const Section = ({ title, children }) => (
  <div className="border border-slate-200 rounded-md overflow-hidden h-full flex flex-col">
    <div className="bg-slate-100 px-2 py-[3px] border-b border-slate-200 flex-shrink-0">
      <span className="text-[8px] font-extrabold text-slate-900 uppercase tracking-wider">{title}</span>
    </div>
    <div className="px-2 py-1 flex-1 flex flex-col justify-center">
      {children}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */
const FiberInformationPanel = ({ lastScannedBobbin }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState('bobbin_no');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [autoLoadedBobbin, setAutoLoadedBobbin] = useState(null);
  const scanRef = useRef(null);

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
      setError(e?.response?.data?.message || 'Something went wrong');
      setData(null);
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleManualSearch = () => {
    if (!searchInput.trim()) { showError('Enter a bobbin number or FID'); return; }
    fetchFiberInfo(searchInput, searchType);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Search Bar (compact) ── */}
      <div className="px-3 py-2 border-b border-slate-100 flex-shrink-0 bg-slate-50/40">
        <div className="flex items-center gap-2">
          <select value={searchType} onChange={e => setSearchType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-teal-200 cursor-pointer">
            <option value="bobbin_no">Bobbin No</option>
            <option value="fid">FID</option>
          </select>
          <div className="flex gap-1 flex-1 max-w-xs">
            <input ref={scanRef} value={searchInput} onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleManualSearch(); } }}
              placeholder={searchType === 'bobbin_no' ? 'Scan bobbin...' : 'Enter FID...'}
              className="flex-1 bg-teal-50 border border-teal-200 rounded px-2 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-teal-300 placeholder:text-teal-300" />
            <button type="button" onClick={handleManualSearch} disabled={loading}
              className="px-2 py-1.5 bg-teal-600 text-white rounded text-[10px] font-bold hover:bg-teal-700 active:scale-95 disabled:opacity-50">
              {loading ? '...' : 'Search'}
            </button>
          </div>
          {lastScannedBobbin && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded">
              <Scan size={10} className="text-blue-600" />
              <span className="text-[9px] font-bold text-blue-800 font-mono">{lastScannedBobbin}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden p-2">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-slate-400 animate-pulse">Loading...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-[10px] font-bold text-red-700">{error}</span>
            </div>
          </div>
        )}

        {!data && !error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Info size={28} className="mb-1" />
            <p className="text-[10px] font-medium">Scan a bobbin or click a row to view fiber information</p>
          </div>
        )}

        {data && !loading && (
          <div className="h-full flex flex-col gap-1.5">
            {/* ── Top Summary Row ── */}
            <div className="flex items-center gap-2 flex-shrink-0 bg-white border border-slate-200 rounded-md px-3 py-1.5">
              {/* Bobbin Info */}
              <div className="flex items-center gap-3 flex-1">
                <div className="text-[9px]"><span className="text-slate-700 font-semibold">Bobbin:</span> <span className="font-extrabold text-blue-900 font-mono">{data.bobbin_no}</span></div>
                <div className="text-[9px]"><span className="text-slate-700 font-semibold">FID:</span> <span className="font-extrabold text-black font-mono">{data.fid || '—'}</span></div>
                <div className="text-[9px]"><span className="text-slate-700 font-semibold">Product:</span> <span className="font-extrabold text-black">{data.product_type || '—'}</span></div>
                <div className="text-[9px]"><span className="text-slate-700 font-semibold">PT Len:</span> <span className="font-extrabold text-emerald-900 font-mono">{data.fiber_length || '—'}</span></div>
                <div className="text-[9px]"><span className="text-slate-700 font-semibold">Opt Len:</span> <span className="font-extrabold text-emerald-900 font-mono">{data.optical_length || '—'}</span></div>
              </div>
              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* QC Status */}
                {(() => {
                  const fg = data.final_grade?.toString().toUpperCase().trim();
                  if (fg === 'REJECT' || fg === 'REJ' || fg === 'R')
                    return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold bg-red-100 text-red-700"><XCircle size={9} />Failed</span>;
                  if (fg) return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 size={9} />Passed</span>;
                  return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold bg-amber-100 text-amber-700"><Clock size={9} />Pending</span>;
                })()}
                {/* Grade */}
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${gradeColor(data.final_grade)}`}>
                  {data.final_grade?.toString().toUpperCase() || '—'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${gradeColor(data.temp_grade)}`}>
                  T:{data.temp_grade?.toString().toUpperCase() || '—'}
                </span>
                {/* Dispatch */}
                {(() => {
                  const s = data.dispatch_status?.toString().toLowerCase();
                  if (s === 'dispatched' || s === 'yes' || s === 'true' || s === '1')
                    return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-100 text-emerald-700"><Truck size={9} />Dispatched</span>;
                  return <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold bg-amber-100 text-amber-700"><Package size={9} />Not Dispatched</span>;
                })()}
              </div>
            </div>

            {/* ── QC Parameters Grid (fills remaining space) ── */}
            <div className="flex-1 grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 min-h-0">
              {/* Length */}
              <Section title="Length">
                <P label="PT Length" value={data.fiber_length} />
                <P label="Optical Length" value={data.optical_length} />
              </Section>

              {/* Attenuation */}
              <Section title="Attenuation">
                <P label="1310 Top" value={data.atn_1310_top} />
                <P label="1310 Bottom" value={data.atn_1310_bottom} />
                <P label="1550 Top" value={data.atn_1550_top} />
                <P label="1550 Bottom" value={data.atn_1550_bottom} />
                <P label="Spec 1285-1330" value={data.spec_1285_1330} />
                <P label="Spec 1310" value={data.spec_1310} />
                <P label="Spec 1550" value={data.spec_1550} />
              </Section>

              {/* MFD */}
              <Section title="MFD">
                <P label="1310 Top" value={data.mfd_1310_top} />
                <P label="1310 Bottom" value={data.mfd_1310_bottom} />
              </Section>

              {/* Cut Off */}
              <Section title="Cut Off">
                <P label="Top" value={data.cut_off_top} />
                <P label="Bottom" value={data.cut_off_bottom} />
              </Section>

              {/* Cladding */}
              <Section title="Cladding">
                <P label="Clad Dia T" value={data.clad_dia_top} />
                <P label="Clad Dia B" value={data.clad_dia_bottom} />
                <P label="Core Clad Conc T" value={data.core_clad_concentricity_top} />
                <P label="Core Clad Conc B" value={data.core_clad_concentricity_bottom} />
                <P label="Clad Ovality T" value={data.clad_ovality_top} />
                <P label="Clad Ovality B" value={data.clad_ovality_bottom} />
              </Section>

              {/* Core */}
              <Section title="Core">
                <P label="Core Dia T" value={data.core_dia_top} />
                <P label="Core Dia B" value={data.core_dia_bottom} />
                <P label="Core Ovality T" value={data.core_ovality_top} />
                <P label="Core Ovality B" value={data.core_ovality_bottom} />
              </Section>

              {/* Primary Coating */}
              <Section title="Primary Coating">
                <P label="Dia Top" value={data.primary_coating_dia_top} />
                <P label="Dia Bottom" value={data.primary_coating_dia_bottom} />
                <P label="Conc. Top" value={data.primary_coating_concentricity_top} />
                <P label="Conc. Bottom" value={data.primary_coating_concentricity_bottom} />
              </Section>

              {/* Secondary Coating */}
              <Section title="Secondary Coating">
                <P label="Dia Top" value={data.secondary_coating_dia_top} />
                <P label="Dia Bottom" value={data.secondary_coating_dia_bottom} />
                <P label="Conc. Top" value={data.secondary_coating_concentricity_top} />
                <P label="Conc. Bottom" value={data.secondary_coating_concentricity_bottom} />
                <P label="Coat Ovality T" value={data.coating_ovality_top} />
                <P label="Coat Ovality B" value={data.coating_ovality_bottom} />
              </Section>

              {/* Dispersion */}
              <Section title="Dispersion">
                <P label="Zero Disp Wave" value={data.zero_disp_wave} />
                <P label="Slope Zero Disp" value={data.slope_zero_disp} />
                <P label="Disp 1550" value={data.disp_1550} />
                <P label="Disp 1285-1330" value={data.disp_1285_1330} />
                <P label="Disp 1270-1340" value={data.disp_1270_1340} />
                <P label="Disp 1575" value={data.disp_1575} />
              </Section>

              {/* PMD */}
              <Section title="PMD">
                <P label="PMD 1310" value={data.pmd_1310} />
                <P label="PMD 1550" value={data.pmd_1550} />
              </Section>

              {/* Fiber Curl */}
              <Section title="Fiber Curl">
                <P label="Top" value={data.fiber_curl_top} />
                <P label="Bottom" value={data.fiber_curl_bottom} />
              </Section>

              {/* MAC */}
              <Section title="MAC">
                <P label="MAC Value" value={data.mac_value} />
              </Section>

              {/* QC Remarks (if any) */}
              {(data.qc_remark || data.nc_cause || data.rejection_reason || data.otdr_operator || data.otdr_machine || data.qc_test_date) && (
                <Section title="Remarks">
                  {data.qc_remark && <P label="QC Remark" value={data.qc_remark} />}
                  {data.nc_cause && <P label="NC Cause" value={data.nc_cause} />}
                  {data.rejection_reason && <P label="Rej Reason" value={data.rejection_reason} />}
                  {data.otdr_operator && <P label="OTDR Operator" value={data.otdr_operator} />}
                  {data.otdr_machine && <P label="OTDR Machine" value={data.otdr_machine} />}
                  {data.qc_test_date && <P label="QC Test Date" value={data.qc_test_date} />}
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiberInformationPanel;
