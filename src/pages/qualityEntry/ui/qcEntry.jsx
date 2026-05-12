import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Send, Search, Settings, ShieldCheck } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table-cell input ── */
const TCell = ({ name }) => (
  <Field name={name}
    className="w-full h-full px-1.5 py-0.5 text-[10px] outline-none focus:bg-blue-50 bg-transparent text-center" />
);

/* ── Full-width divider label inside a 2-col grid ── */
const GridDivider = ({ label }) => (
  <div className="col-span-2 pt-1 border-t border-slate-100">
    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
  </div>
);

const initialValues = {
  noOfRewinding: '', barcodeId: '', fid: '', manualEntry: false, automatic: false,
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
  mb1550_50: '', mb1310_50: '', mb1625_50: '', mb1550_60: '', mb1310_60: '', mb1625_60: '',
  mb1550_32: '', mbOpr: '',
  diff1310OH: '', maxOH: '', minOH: '', dispSlope1550: '', macValue: '',
  cableCutoff: '', colDia: '', attnUni1310: '', attnUni1550: '',
  attnMax1625tb: '', mfdUni1625: '', attnUni1625: '',
};

/* ══════════════════════════════════════════════════════════ */
const QCEntryScreen = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik initialValues={initialValues} onSubmit={(v) => console.log('QC Submit:', v)}>
        {() => (
          <Form className="flex flex-col flex-1 overflow-hidden">

            {/* ── Action Bar ── */}
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
              <div className="bg-slate-700 p-1.5 text-white rounded flex-shrink-0">
                <ShieldCheck size={13} />
              </div>
              <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                <span className="bg-emerald-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">REWIND NO</span>
                <Field name="noOfRewinding" className="w-10 px-2 py-1 text-xs outline-none font-bold" />
              </div>
              <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                <span className="bg-amber-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">BARCODE ID</span>
                <Field name="barcodeId" className="w-28 px-2 py-1 text-xs outline-none font-bold text-blue-700" />
              </div>
              <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                <span className="bg-orange-100 text-[9px] font-bold px-2 py-1.5 border-r border-slate-200 whitespace-nowrap">FID REF</span>
                <Field name="fid" className="w-28 px-2 py-1 text-xs outline-none font-bold" />
              </div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">
                <Field type="checkbox" name="manualEntry" className="w-3 h-3 accent-blue-600" /> Manual Entry
              </label>
              <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">
                <Field type="checkbox" name="automatic" className="w-3 h-3 accent-blue-600" /> Automatic
              </label>
              <div className="ml-auto flex gap-2">
                <ResetButton compact>Reset</ResetButton>
                <SubmitButton compact><Send size={11} /> Submit Entry</SubmitButton>
              </div>
            </div>

            {/* ── 5-column data grid ── */}
            <div className="flex gap-2 flex-1 overflow-hidden px-2 py-2">

              {/* ── COL 1: Optical Properties ── */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <ModuleCard compact title="Optical Properties" icon={<ShieldCheck size={12} className="text-blue-600" />}>
                  <div className="grid grid-cols-2 gap-1">
                    <FormikInput compact label="PT Len"         name="ptLen" />
                    <FormikInput compact label="Optical Len"    name="opticalLen" />
                    <FormikInput compact label="Attn 1310 (T)"  name="attn1310Top" />
                    <FormikInput compact label="Avg LSA 1550"   name="avgLsa1550" />
                    <FormikInput compact label="Attn 1310 (B)"  name="attn1310Bot" />
                    <FormikInput compact label="Attn 1550 B"    name="attn1550B" />
                    <FormikInput compact label="Spec 1285-1330" name="spec1285_1330" />
                    <FormikInput compact label="Spectral 1310"  name="spectral1310" />
                    <FormikInput compact label="Spectral 1550"  name="spectral1550" />
                    <FormikInput compact label="MFD UNI 1310"   name="mfdUni1310" />
                    <FormikInput compact label="MFD UNI 1550"   name="mfdUni1550" />
                    <FormikInput compact label="Max Attn 1310"  name="maxAttn1310" />
                    <FormikInput compact label="Max Avg 1550"   name="maxAvgAttn1550" />
                    <FormikInput compact label="Attn 1310 TB"   name="attn1310Tb" />
                    <FormikInput compact label="Attn 1550 TB"   name="attn1550Tb" />
                    <FormikInput compact label="Max TB 1310"    name="maxTb1310" />
                    <FormikInput compact label="Max TB 1550"    name="maxTb1550" />
                    <FormikInput compact label="Max Attn 1625"  name="maxAttn1625" />
                    <FormikInput compact label="Attn 1625 TB"   name="attn1625Tb" />
                    <GridDivider label="Grading & Rewind" />
                    <FormikInput  compact label="Grade Value"   name="grade" />
                    <FormikSelect compact label="Rew Reason"    name="rewReason"    options={['Select','Attn High','MFD Fail','Coating','Other']} />
                    <FormikSelect compact label="Sub Reason"    name="rewSubReason" options={['Select','Top','Bottom','Both']} />
                  </div>
                </ModuleCard>
              </div>

              {/* ── COL 2: FID Dimensions ── */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <ModuleCard compact title="FID Dimensions" icon={<Settings size={12} className="text-orange-500" />}>
                  <div className="grid grid-cols-2 gap-1">
                    <FormikInput compact label="MFD T um"       name="mfdTum" />
                    <FormikInput compact label="MFD B um"       name="mfdBum" />
                    <FormikInput compact label="Cutoff T nm"    name="cutoffTnm" />
                    <FormikInput compact label="Cutoff B nm"    name="cutoffBnm" />
                    <FormikInput compact label="Clad Dia T"     name="cladDiaTum" />
                    <FormikInput compact label="Core Clad T"    name="coreCladConcTum" />
                    <FormikInput compact label="Clad Oval T%"   name="cladOvalityT" />
                    <FormikInput compact label="Core Dia T"     name="coreDiaTum" />
                    <FormikInput compact label="Core Oval T%"   name="coreOvalityT_Percent" />
                    <FormikInput compact label="Clad Dia B"     name="cladDiaBum" />
                    <FormikInput compact label="Core Clad B"    name="coreCladConcBum" />
                    <FormikInput compact label="Clad Oval B%"   name="cladOvalityB" />
                    <FormikInput compact label="Core Dia B"     name="coreDiaBum" />
                    <FormikInput compact label="Core Oval B%"   name="coreOvalityB_Percent" />
                    {/* REW/SCRAP table — full width */}
                    <div className="col-span-2 pt-1 border-t border-slate-100">
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
                              <td className="border border-slate-200 h-6"><TCell name={`rewScrap_${i}`} /></td>
                              <td className="border border-slate-200 h-6"><TCell name={`rewScrap_Len${i}`} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ModuleCard>
              </div>

              {/* ── COL 3: Coating Parameters ── */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <ModuleCard compact title="Coating Parameters" icon={<Settings size={12} className="text-emerald-600" />}>
                  <div className="grid grid-cols-2 gap-1">
                    {/* Fetch button — full width */}
                    <div className="col-span-2">
                      <button type="button"
                        className="w-full bg-emerald-50 text-[9px] font-bold py-1.5 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5">
                        <Search size={11} /> Fetch Preform Data
                      </button>
                    </div>
                    <FormikInput compact label="Pri Coat Dia T"  name="priCoatDiaTum" />
                    <FormikInput compact label="Sec Coat Dia T"  name="secCoatDiaTum" />
                    <FormikInput compact label="Pri Coat Conc T" name="priCoatConcTum" />
                    <FormikInput compact label="Sec Coat Conc T" name="secCoatConcTum" />
                    <FormikInput compact label="Coat Oval T"     name="coatOvalityT" />
                    <FormikInput compact label="Pri Coat Dia B"  name="priCoatDiaBum" />
                    <FormikInput compact label="Sec Coat Dia B"  name="secCoatDiaBum" />
                    <FormikInput compact label="Pri Coat Conc B" name="priCoatConcBum" />
                    <FormikInput compact label="Sec Coat Conc B" name="secCoatConcBum" />
                    <FormikInput compact label="Coat Oval B"     name="coatOvalityB" />
                    <FormikInput compact label="Fiber Curl T"    name="fiberCurlT" />
                    <FormikInput compact label="Fiber Curl B"    name="fiberCurlB" />
                    <FormikInput compact label="Curl Deflect T"  name="curlDeflectionT" />
                    <FormikInput compact label="Curl Deflect B"  name="curlDeflectionB" />
                    <FormikInput compact label="Eff Area Top"    name="effAreaTop" />
                    <FormikInput compact label="Eff Area Bot"    name="effAreaBot" />
                    <FormikInput compact label="Attn 1460"       name="attn1460" />
                    <FormikInput compact label="Attn 1410"       name="attn1410" />
                    <FormikInput compact label="ST13 Size"       name="st13Size" />
                    <FormikInput compact label="ST15 Size"       name="st15Size" />
                    <FormikInput compact label="Spike Size"      name="spikeSize" />
                    <FormikInput compact label="Fail Reason"     name="failReason" />
                    {/* Curing — full width split */}
                    <div className="col-span-2 flex flex-col gap-0.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Curing Level</label>
                      <div className="flex gap-1">
                        <Field name="curing1" placeholder="Val 1"
                          className="flex-1 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                        <Field name="curing2" placeholder="Val 2"
                          className="flex-1 bg-slate-100 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                      </div>
                    </div>
                  </div>
                </ModuleCard>
              </div>

              {/* ── COL 4: Manual Log / Dispersion / Operators ── */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <ModuleCard compact title="Manual Log Entry" icon={<Settings size={12} className="text-indigo-600" />}>
                  <div className="grid grid-cols-2 gap-1">
                    <FormikInput compact label="Zero Disp Wave"  name="zeroDispWavelen" />
                    <FormikInput compact label="Slope Zero Disp" name="slopeZeroDisp" />
                    <FormikInput compact label="Disp 1550"       name="disp1550" />
                    <FormikInput compact label="Disp 1285-1330"  name="disp1285_1330" />
                    <FormikInput compact label="Disp 1270-1340"  name="disp1270_1340" />
                    <FormikInput compact label="Disp 1575"       name="disp1575" />
                    <FormikInput compact label="PMD 1310"        name="pmd1310" />
                    <FormikInput compact label="PMD 1550"        name="pmd1550" />
                    <FormikInput compact label="CD 1460"         name="cd1460" />
                    <FormikInput compact label="TWPMD"           name="twpmd" />
                    <FormikInput compact label="Disp 1625"       name="disp1625" />
                    <FormikInput compact label="Disp 1570"       name="disp1570" />
                    <FormikInput compact label="Disp 1260"       name="disp1260" />
                    <FormikInput compact label="BDF / Lumps"     name="bdfLumps" />
                    <GridDivider label="Operator Identifiers" />
                    <FormikInput compact label="Spec Opr"    name="specOpr" />
                    <FormikInput compact label="OTDR Opr"    name="otdrOpr" />
                    <FormikInput compact label="CD/PMD Opr"  name="cdPmdOpr" />
                    <FormikInput compact label="PT Opr"      name="ptOpr" />
                    <FormikInput compact label="Rew Opr"     name="rewOpr" />
                    <FormikInput compact label="Col Opr"     name="colOpr" />
                    <FormikInput compact label="F Type"      name="fType" />
                    <FormikInput compact label="Colour"      name="colour" />
                    <FormikInput compact label="OTDR No"     name="otdrNo" />
                    <FormikInput compact label="PT No"       name="ptNo" />
                    <FormikInput compact label="DT No"       name="dtNo" />
                    <FormikInput compact label="Coat Type"   name="coatType" />
                    <FormikInput compact label="Pri Coat"    name="priCoat" />
                  </div>
                </ModuleCard>
              </div>

              {/* ── COL 5: Microbend + Status + Extra ── */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <ModuleCard compact title="Microbend & Status" icon={<ShieldCheck size={12} className="text-slate-600" />}>
                  <div className="grid grid-cols-2 gap-1">

                    {/* Microbend table — full width */}
                    <div className="col-span-2">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Microbend Loss Analysis</p>
                      <table className="w-full text-[9px] border-collapse border border-slate-200 rounded overflow-hidden">
                        <thead className="bg-slate-700 text-white">
                          <tr>
                            <th className="border border-slate-500 py-1 font-normal px-1">Spec</th>
                            <th className="border border-slate-500 py-1 font-normal">1550</th>
                            <th className="border border-slate-500 py-1 font-normal">1310</th>
                            <th className="border border-slate-500 py-1 font-normal">1625</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="border border-slate-200 px-1 text-[8px] font-bold bg-slate-50">100T 50mm</td>
                            <td className="border border-slate-200 h-6"><TCell name="mb1550_50" /></td>
                            <td className="border border-slate-200 h-6"><TCell name="mb1310_50" /></td>
                            <td className="border border-slate-200 h-6"><TCell name="mb1625_50" /></td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-slate-200 px-1 text-[8px] font-bold bg-slate-50">100T 60mm</td>
                            <td className="border border-slate-200 h-6"><TCell name="mb1550_60" /></td>
                            <td className="border border-slate-200 h-6"><TCell name="mb1310_60" /></td>
                            <td className="border border-slate-200 h-6"><TCell name="mb1625_60" /></td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-slate-200 px-1 text-[8px] font-bold bg-slate-50">1T 32mm</td>
                            <td colSpan={2} className="border border-slate-200 bg-slate-50" />
                            <td className="border border-slate-200 h-6"><TCell name="mb1550_32" /></td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-slate-200 px-1 text-[8px] font-bold bg-slate-50">MB Opr</td>
                            <td colSpan={3} className="border border-slate-200 h-6">
                              <Field name="mbOpr"
                                className="w-full h-full px-2 text-[10px] font-bold text-blue-600 uppercase outline-none focus:bg-blue-50 bg-transparent" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Status indicators — full width */}
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

                    {/* Extra fields — 2 per row */}
                    <GridDivider label="Additional Parameters" />
                    <FormikInput compact label="Diff 1310-OH"  name="diff1310OH" />
                    <FormikInput compact label="Max OH"        name="maxOH" />
                    <FormikInput compact label="Min OH"        name="minOH" />
                    <FormikInput compact label="Disp Slope"    name="dispSlope1550" />
                    <FormikInput compact label="MAC Value"     name="macValue" />
                    <FormikInput compact label="Cable Cutoff"  name="cableCutoff" />
                    <FormikInput compact label="Col Dia"       name="colDia" />
                    <FormikInput compact label="Attn Uni 1310" name="attnUni1310" />
                    <FormikInput compact label="Attn Uni 1550" name="attnUni1550" />
                    <FormikInput compact label="Max 1625 TB"   name="attnMax1625tb" />
                    <FormikInput compact label="MFD UNI 1625"  name="mfdUni1625" />
                    <FormikInput compact label="Attn UNI 1625" name="attnUni1625" />
                  </div>
                </ModuleCard>
              </div>

            </div>
            {/* ── end 5-col grid ── */}

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default QCEntryScreen;
