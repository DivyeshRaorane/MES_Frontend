import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Send, Search, Settings, ShieldCheck } from 'lucide-react';
import { FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table-cell input — respects disabled ── */
const TCell = ({ name, disabled }) => (
  <Field name={name}
    disabled={disabled}
    className={`w-full h-full px-1.5 py-0.5 text-[10px] outline-none text-center transition-all
      ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-transparent focus:bg-blue-50'}`} />
);

/* ── Section wrapper — no card chrome, just a titled block ── */
const Section = ({ label, children, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-0.5 mb-0.5">{label}</p>
    {children}
  </div>
);

/* ── Full-width divider inside a 2-col grid ── */
const GridDivider = ({ label }) => (
  <div className="col-span-2 pt-0.5 border-t border-slate-100">
    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
  </div>
);

/* ── Column wrapper — scrollable, no card ── */
const Col = ({ children }) => (
  <div className="flex-1 min-w-0 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-sm px-2 py-2">
    {children}
  </div>
);

const initialValues = {
  noOfRewinding: '', barcodeId: '', fid: '',
  manualEntry: false, automatic: true,          // automatic ON by default
  ptLen: '', opticalLen: '', attn1310Top: '', avgLsa1550: '', attn1310Bot: '',
  attn1550B: '', spec1285_1330: '', spectral1310: '', spectral1550: '',
  mfdUni1310: '', mfdUni1550: '', maxAttn1310: '', maxAvgAttn1550: '',
  attn1310Tb: '', attn1550Tb: '', maxTb1310: '', maxTb1550: '', maxAttn1625: '',
  attn1625Tb: '', grade: '', rewReason: '', rewSubReason: '',
  mfdTum: '', mfdBum: '', cutoffTnm: '', cutoffBnm: '', cladDiaTum: '',
  coreCladConcTum: '', cladOvalityT: '', coreDiaTum: '', coreOvalityT_Percent: '',
  cladDiaBum: '', coreCladConcBum: '', cladOvalityB: '', coreDiaBum: '', coreOvalityB_Percent: '',
  rewScrap_1: '', rewScrap_2: '', rewScrap_3: '', rewScrap_4: '',
  rewScrap_Len1: '', rewScrap_Len2: '', rewScrap_Len3: '', rewScrap_Len4: '',
  priCoatDiaTum: '', secCoatDiaTum: '', priCoatConcTum: '', secCoatConcTum: '',
  coatOvalityT: '', priCoatDiaBum: '', secCoatDiaBum: '', priCoatConcBum: '',
  secCoatConcBum: '', coatOvalityB: '', fiberCurlT: '', fiberCurlB: '',
  curlDeflectionT: '', curlDeflectionB: '', effAreaTop: '', effAreaBot: '',
  attn1460: '', attn1410: '', st13Size: '', st15Size: '', spikeSize: '',
  failReason: '', curing1: '', curing2: '',
  zeroDispWavelen: '', slopeZeroDisp: '', disp1550: '', disp1285_1330: '',
  disp1270_1340: '', disp1575: '', pmd1310: '', pmd1550: '', cd1460: '',
  twpmd: '', disp1625: '', disp1570: '', disp1260: '', bdfLumps: '',
  specOpr: '', otdrOpr: '', cdPmdOpr: '', ptOpr: '', rewOpr: '', colOpr: '',
  fType: '', colour: '', otdrNo: '', ptNo: '', dtNo: '', coatType: '', priCoat: '',
  mb1550_50: '', mb1310_50: '', mb1625_50: '',
  mb1550_60: '', mb1310_60: '', mb1625_60: '',
  mb1550_32: '', mb1310_32: '', mb1625_32: '',
  mb1550_30: '', mb1310_30: '', mb1625_30: '',
  mb1550_20: '', mb1310_20: '', mb1625_20: '',
  mbOpr: '',
  diff1310OH: '', maxOH: '', minOH: '', dispSlope1550: '', macValue: '',
  cableCutoff: '', colDia: '', attnUni1310: '', attnUni1550: '',
  attnMax1625tb: '', mfdUni1625: '', attnUni1625: '',
};

/* ── Microbend rows config ── */
const MB_ROWS = [
  { label: '100T 50mm', s1550: 'mb1550_50', s1310: 'mb1310_50', s1625: 'mb1625_50', full: true  },
  { label: '100T 60mm', s1550: 'mb1550_60', s1310: 'mb1310_60', s1625: 'mb1625_60', full: true  },
  { label: '100T 32mm', s1550: 'mb1550_32', s1310: 'mb1310_32', s1625: 'mb1625_32', full: true  },
  { label: '10T 30mm',  s1550: 'mb1550_30', s1310: 'mb1310_30', s1625: 'mb1625_30', full: true  },
  { label: '1T 20mm',   s1550: 'mb1550_20', s1310: 'mb1310_20', s1625: 'mb1625_20', full: true  },
];

/* ══════════════════════════════════════════════════════════ */
const QCEntryScreen = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik initialValues={initialValues} onSubmit={(v) => console.log('QC Submit:', v)}>
        {({ values, setFieldValue }) => {
          /* fields are editable only when Manual Entry is checked */
          const locked = !values.manualEntry;

          /* shared disabled-aware input props */
          const fi = (label, name, extra = {}) => (
            <FormikInput compact label={label} name={name} disabled={locked} {...extra} />
          );
          const fs = (label, name, opts) => (
            <FormikSelect compact label={label} name={name} options={opts} disabled={locked} />
          );

          return (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* ── Action Bar ── */}
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <div className="bg-slate-700 p-1.5 text-white rounded flex-shrink-0">
                  <ShieldCheck size={13} />
                </div>

                {/* Rewind No */}
                <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                  <span className="bg-emerald-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">REWIND NO</span>
                  <Field name="noOfRewinding" className="w-10 px-2 py-1 text-xs outline-none font-bold" />
                </div>

                {/* Barcode ID */}
                <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                  <span className="bg-amber-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">BARCODE ID</span>
                  <Field name="barcodeId" className="w-28 px-2 py-1 text-xs outline-none font-bold text-blue-700" />
                </div>

                {/* FID Ref */}
                <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                  <span className="bg-orange-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">FID REF</span>
                  <Field name="fid" className="w-28 px-2 py-1 text-xs outline-none font-bold" />
                </div>

                {/* Manual Entry toggle */}
                <label className={`flex items-center gap-1.5 text-[10px] font-bold cursor-pointer px-2 py-1 border rounded transition-all ${
                  values.manualEntry ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}>
                  <Field type="checkbox" name="manualEntry"
                    onChange={(e) => {
                      setFieldValue('manualEntry', e.target.checked);
                      if (e.target.checked) setFieldValue('automatic', false);
                      else setFieldValue('automatic', true);
                    }}
                    className="w-3 h-3 accent-blue-600" />
                  Manual Entry
                </label>

                {/* Automatic toggle */}
                <label className={`flex items-center gap-1.5 text-[10px] font-bold cursor-pointer px-2 py-1 border rounded transition-all ${
                  values.automatic ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}>
                  <Field type="checkbox" name="automatic"
                    onChange={(e) => {
                      setFieldValue('automatic', e.target.checked);
                      if (e.target.checked) setFieldValue('manualEntry', false);
                    }}
                    className="w-3 h-3 accent-emerald-600" />
                  Automatic
                </label>

                {locked && (
                  <span className="text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                    🔒 Enable Manual Entry to edit fields
                  </span>
                )}

                <div className="ml-auto flex gap-2">
                  <ResetButton compact>Reset</ResetButton>
                  <SubmitButton compact><Send size={11} /> Submit Entry</SubmitButton>
                </div>
              </div>

              {/* ── 5-column data grid ── */}
              <div className="flex gap-2 flex-1 overflow-hidden px-2 py-2">

                {/* ── COL 1: Optical Properties ── */}
                <Col>
                  <Section label="Optical Properties">
                    <div className="grid grid-cols-2 gap-1">
                      {fi('PT Len',         'ptLen')}
                      {fi('Optical Len',    'opticalLen')}
                      {fi('Attn 1310 (T)',  'attn1310Top')}
                      {fi('Avg LSA 1550',   'avgLsa1550')}
                      {fi('Attn 1310 (B)',  'attn1310Bot')}
                      {fi('Attn 1550 B',    'attn1550B')}
                      {fi('Spec 1285-1330', 'spec1285_1330')}
                      {fi('Spectral 1310',  'spectral1310')}
                      {fi('Spectral 1550',  'spectral1550')}
                      {fi('MFD UNI 1310',   'mfdUni1310')}
                      {fi('MFD UNI 1550',   'mfdUni1550')}
                      {fi('Max Attn 1310',  'maxAttn1310')}
                      {fi('Max Avg 1550',   'maxAvgAttn1550')}
                      {fi('Attn 1310 TB',   'attn1310Tb')}
                      {fi('Attn 1550 TB',   'attn1550Tb')}
                      {fi('Max TB 1310',    'maxTb1310')}
                      {fi('Max TB 1550',    'maxTb1550')}
                      {fi('Max Attn 1625',  'maxAttn1625')}
                      {fi('Attn 1625 TB',   'attn1625Tb')}
                      <GridDivider label="Grading & Rewind" />
                      {fi('Grade Value',    'grade')}
                      {fs('Rew Reason',     'rewReason',    ['Select','Attn High','MFD Fail','Coating','Other'])}
                      {fs('Sub Reason',     'rewSubReason', ['Select','Top','Bottom','Both'])}
                      {fs('Fail Reason',     'failRreason', ['Select','Top','Bottom','Both'])}
                    </div>
                  </Section>
                </Col>

                {/* ── COL 2: FID Dimensions ── */}
                <Col>
                  <Section label="FID Dimensions">
                    <div className="grid grid-cols-2 gap-1">
                      {fi('MFD T um',      'mfdTum')}
                      {fi('MFD B um',      'mfdBum')}
                      {fi('Cutoff T nm',   'cutoffTnm')}
                      {fi('Cutoff B nm',   'cutoffBnm')}
                      {fi('Clad Dia T',    'cladDiaTum')}
                      {fi('Core Clad T',   'coreCladConcTum')}
                      {fi('Clad Oval T%',  'cladOvalityT')}
                      {fi('Core Dia T',    'coreDiaTum')}
                      {fi('Core Oval T%',  'coreOvalityT_Percent')}
                      {fi('Clad Dia B',    'cladDiaBum')}
                      {fi('Core Clad B',   'coreCladConcBum')}
                      {fi('Clad Oval B%',  'cladOvalityB')}
                      {fi('Core Dia B',    'coreDiaBum')}
                      {fi('Core Oval B%',  'coreOvalityB_Percent')}

                      {/* REW/SCRAP table */}
                      <div className="col-span-2 pt-0.5 border-t border-slate-100">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rew / Scrap</p>
                        <table className="w-full text-[9px] border-collapse border border-slate-200 rounded overflow-hidden">
                          <thead className="bg-slate-700 text-white">
                            <tr>
                              <th className="border border-slate-500 py-1 font-normal">REW/SCRAP</th>
                              <th className="border border-slate-500 py-1 font-normal">LEN (m)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[1,2,3,4].map(i => (
                              <tr key={i} className="bg-white">
                                <td className="border border-slate-200 h-6"><TCell name={`rewScrap_${i}`}   disabled={locked} /></td>
                                <td className="border border-slate-200 h-6"><TCell name={`rewScrap_Len${i}`} disabled={locked} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Section>
                </Col>

                {/* ── COL 3: Coating Parameters ── */}
                <Col>
                  <Section label="Coating Parameters">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="col-span-2">
                        <button type="button"
                          className="w-full bg-emerald-50 text-[9px] font-bold py-1.5 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5">
                          <Search size={11} /> Fetch Preform Data
                        </button>
                      </div>
                      {fi('Pri Coat Dia T',  'priCoatDiaTum')}
                      {fi('Sec Coat Dia T',  'secCoatDiaTum')}
                      {fi('Pri Coat Conc T', 'priCoatConcTum')}
                      {fi('Sec Coat Conc T', 'secCoatConcTum')}
                      {fi('Coat Oval T',     'coatOvalityT')}
                      {fi('Pri Coat Dia B',  'priCoatDiaBum')}
                      {fi('Sec Coat Dia B',  'secCoatDiaBum')}
                      {fi('Pri Coat Conc B', 'priCoatConcBum')}
                      {fi('Sec Coat Conc B', 'secCoatConcBum')}
                      {fi('Coat Oval B',     'coatOvalityB')}
                      {fi('Fiber Curl T',    'fiberCurlT')}
                      {fi('Fiber Curl B',    'fiberCurlB')}
                      {fi('Curl Deflect T',  'curlDeflectionT')}
                      {fi('Curl Deflect B',  'curlDeflectionB')}
                      {fi('Eff Area Top',    'effAreaTop')}
                      {fi('Eff Area Bot',    'effAreaBot')}
                      {fi('Attn 1460',       'attn1460')}
                      {fi('Attn 1410',       'attn1410')}
                      {fi('ST13 Size',       'st13Size')}
                      {fi('ST15 Size',       'st15Size')}
                      {fi('Spike Size',      'spikeSize')}
                      {fi('Fail Reason',     'failReason')}
                      {/* Curing — full width */}
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Curing Level</label>
                        <div className="flex gap-1">
                          <Field name="curing1" placeholder="Val 1" disabled={locked}
                            className={`flex-1 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 transition-all
                              ${locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100'}`} />
                          <Field name="curing2" placeholder="Val 2" disabled={locked}
                            className={`flex-1 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 transition-all
                              ${locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100'}`} />
                        </div>
                      </div>
                    </div>
                  </Section>
                </Col>

                {/* ── COL 4: Manual Log / Dispersion / Operators ── */}
                <Col>
                  <Section label="Manual Log Entry">
                    <div className="grid grid-cols-2 gap-1">
                      {fi('Zero Disp Wave',  'zeroDispWavelen')}
                      {fi('Slope Zero Disp', 'slopeZeroDisp')}
                      {fi('Disp 1550',       'disp1550')}
                      {fi('Disp 1285-1330',  'disp1285_1330')}
                      {fi('Disp 1270-1340',  'disp1270_1340')}
                      {fi('Disp 1575',       'disp1575')}
                      {fi('PMD 1310',        'pmd1310')}
                      {fi('PMD 1550',        'pmd1550')}
                      {fi('CD 1460',         'cd1460')}
                      {fi('TWPMD',           'twpmd')}
                      {fi('Disp 1625',       'disp1625')}
                      {fi('Disp 1570',       'disp1570')}
                      {fi('Disp 1260',       'disp1260')}
                      {fi('BDF / Lumps',     'bdfLumps')}
                      <GridDivider label="Operator Identifiers" />
                      {fi('Spec Opr',    'specOpr')}
                      {fi('Comb',    'comboopr')}
                      {fi('F Type',      'fType')}
                      {fi('Colour',      'colour')}
                      {fi('OTDR No',     'otdrNo')}
                      {fi('PT No',       'ptNo')}
                      {fi('DT No',       'dtNo')}
                      {fi('Coat Type',   'coatType')}
                      {fi('Pri Coat',    'priCoat')}
                    </div>
                  </Section>
                </Col>

                {/* ── COL 5: Microbend + Status + Extra ── */}
                <Col>
                  <Section label="Microbend & Status">
                    <div className="grid grid-cols-2 gap-1">

                      {/* Microbend table — full width */}
                      <div className="col-span-2">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Microbend Loss Analysis</p>
                        <table className="w-full text-[9px] border-collapse border border-slate-200 rounded overflow-hidden">
                          <thead className="bg-slate-700 text-white">
                            <tr>
                              <th className="border border-slate-500 py-1 font-normal px-1 text-left">Spec</th>
                              <th className="border border-slate-500 py-1 font-normal">1550</th>
                              <th className="border border-slate-500 py-1 font-normal">1310</th>
                              <th className="border border-slate-500 py-1 font-normal">1625</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MB_ROWS.map(({ label, s1550, s1310, s1625 }) => (
                              <tr key={label} className="bg-white">
                                <td className="border border-slate-200 px-1 text-[8px] font-bold bg-slate-50 whitespace-nowrap">{label}</td>
                                <td className="border border-slate-200 h-6"><TCell name={s1550} disabled={locked} /></td>
                                <td className="border border-slate-200 h-6"><TCell name={s1310} disabled={locked} /></td>
                                <td className="border border-slate-200 h-6"><TCell name={s1625} disabled={locked} /></td>
                              </tr>
                            ))}
                            <tr className="bg-white">
                              <td className="border border-slate-200 px-1 text-[8px] font-bold bg-slate-50">MB Opr</td>
                              <td colSpan={3} className="border border-slate-200 h-6">
                                <Field name="mbOpr" disabled={locked}
                                  className={`w-full h-full px-2 text-[10px] font-bold text-blue-600 uppercase outline-none focus:bg-blue-50 transition-all
                                    ${locked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-transparent'}`} />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Status indicators */}
                      <div className="col-span-2 grid grid-cols-2 gap-1">
                        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                          <span className="bg-slate-100 text-[8px] font-bold px-1.5 py-1 border-r border-slate-200 whitespace-nowrap">TEMP GRADE</span>
                          <div className="flex-1 h-5 bg-emerald-500 rounded-r" />
                        </div>
                        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                          <span className="bg-slate-100 text-[8px] font-bold px-1.5 py-1 border-r border-slate-200 whitespace-nowrap">D2 STATUS</span>
                          <span className="text-[9px] font-black text-emerald-700 px-2">PASS</span>
                        </div>
                      </div>

                      {/* Additional parameters */}
                      <GridDivider label="Additional Parameters" />
                      {fi('Diff 1310-OH',  'diff1310OH')}
                      {fi('Max OH',        'maxOH')}
                      {fi('Min OH',        'minOH')}
                      {fi('Disp Slope',    'dispSlope1550')}
                      {fi('MAC Value',     'macValue')}
                      {fi('Cable Cutoff',  'cableCutoff')}
                      {fi('Col Dia',       'colDia')}
                      {fi('Attn Uni 1310', 'attnUni1310')}
                      {fi('Attn Uni 1550', 'attnUni1550')}
                      {fi('Max 1625 TB',   'attnMax1625tb')}
                      {fi('MFD UNI 1625',  'mfdUni1625')}
                      {fi('Attn UNI 1625', 'attnUni1625')}
                    </div>
                  </Section>
                </Col>

              </div>
              {/* ── end 5-col grid ── */}

            </Form>
          );
        }}
      </Formik>
    </div>
  </div>
);

export default QCEntryScreen;
