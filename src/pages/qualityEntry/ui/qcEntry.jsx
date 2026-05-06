import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Send, Search, Settings, ShieldCheck, ClipboardCheck } from 'lucide-react';

/**
 * Reusable Row Component
 * @param {string} label - The text displayed in the gray sidebar
 * @param {string} name - Formik field name
 * @param {string} type - Input type (default: text)
 */
const DataRow = ({ label, name, type = "text" }) => (
  <div className="flex border-b border-gray-300 h-[24px] hover:bg-blue-50 transition-colors">
    <div className="w-[150px] text-[10px] px-2 flex items-center font-bold bg-gray-100 border-r border-gray-300 uppercase tracking-tight text-gray-700 truncate">
      {label}
    </div>
    <Field 
      name={name} 
      type={type}
      className="flex-1 text-[11px] px-2 outline-none focus:bg-white focus:ring-1 focus:ring-inset focus:ring-blue-400 bg-transparent" 
    />
  </div>
);

const QCEntryScreen = () => {
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
    mb1550_32: '', mb1550_30: '', mb1550_20: '', mb1550_32t: '', mbOpr: '',
    diff1310OH: '', maxOH: '', minOH: '', dispSlope1550: '', macValue: '',
    cableCutoff: '', colDia: '', attnUni1310: '', attnUni1550: '', 
    attnMax1625tb: '', mfdUni1625: '', attnUni1625: ''
  };

  return (
    <div className="p-3 bg-slate-50 min-h-screen font-sans text-slate-800">
       <div className="max-w-6xl mx-auto">
      <Formik initialValues={initialValues} onSubmit={(v) => console.log("QC Data Submitted:", v)}>
        <Form className="flex flex-col gap-3 bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200">
          
          {/* MAIN HEADING SECTION */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded shadow-inner">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white">QUALITY CONTROL ENTRY</h1>
            </div>
            <div className="text-[10px] font-bold text-white flex items-center gap-2">
              <ClipboardCheck size={14} />
              PRODUCTION DEPARTMENT | INDUSTRIAL UNIT 04
            </div>
          </div>

          {/* TOP ACTION BAR */}
          <div className="flex flex-wrap gap-2 items-center bg-white p-2 border border-gray-300 shadow-sm rounded m-2">
            <div className="bg-slate-700 p-1.5 text-white rounded"><Settings size={14}/></div>
            
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <span className="bg-emerald-100 text-[10px] font-bold px-2 py-1.5 border-r border-gray-300">REWIND NO</span>
              <Field name="noOfRewinding" className="w-12 px-2 py-1 text-xs outline-none font-bold" />
            </div>

            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <span className="bg-amber-100 text-[10px] font-bold px-2 py-1.5 border-r border-gray-300">BARCODE ID</span>
              <Field name="barcodeId" className="w-32 px-2 py-1 text-xs outline-none font-bold text-blue-700" />
            </div>

            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <span className="bg-orange-100 text-[10px] font-bold px-2 py-1.5 border-r border-gray-300">FID REF</span>
              <Field name="fid" className="w-32 px-2 py-1 text-xs outline-none font-bold" />
            </div>
            
            <div className="ml-auto flex gap-4 items-center px-2">
              <label className="text-[11px] font-bold flex items-center gap-1.5 cursor-pointer">
                <Field type="checkbox" name="manualEntry" className="accent-blue-600" /> Manual Entry
              </label>
              <label className="text-[11px] font-bold flex items-center gap-1.5 cursor-pointer">
                <Field type="checkbox" name="automatic" className="accent-blue-600" /> Automatic
              </label>
              <button type="submit" className="bg-emerald-600 text-white px-5 py-1.5 rounded text-xs font-black shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2">
                <Send size={14}/> SUBMIT ENTRY
              </button>
            </div>
          </div>

          <div className="flex gap-3 items-start overflow-x-auto pb-6">
            
            {/* COLUMN 1: OPTICAL PARAMETERS */}
            <div className="min-w-[260px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden mx-2">
              <div className="bg-slate-800 text-white text-[10px] font-bold py-1.5 text-center tracking-widest uppercase">Optical Properties</div>
              <DataRow label="PT Len" name="ptLen" />
              <DataRow label="Optical Len" name="opticalLen" />
              <DataRow label="Attn 1310 (T)" name="attn1310Top" />
              <DataRow label="Avg LSA 1550" name="avgLsa1550" />
              <DataRow label="Attn 1310 (B)" name="attn1310Bot" />
              <DataRow label="Attn 1550 B" name="attn1550B" />
              <DataRow label="Spec 1285-1330" name="spec1285_1330" />
              <DataRow label="Spectral 1310" name="spectral1310" />
              <DataRow label="Spectral 1550" name="spectral1550" />
              <DataRow label="MFD UNI 1310" name="mfdUni1310" />
              <DataRow label="MFD UNI 1550" name="mfdUni1550" />
              <DataRow label="Max Attn 1310" name="maxAttn1310" />
              <DataRow label="Max Avg 1550" name="maxAvgAttn1550" />
              <DataRow label="Attn 1310 TB" name="attn1310Tb" />
              <DataRow label="Attn 1550 TB" name="attn1550Tb" />
              <DataRow label="Max TB 1310" name="maxTb1310" />
              <DataRow label="Max TB 1550" name="maxTb1550" />
              <DataRow label="Max Attn 1625" name="maxAttn1625" />
              <DataRow label="Attn 1625 TB" name="attn1625Tb" />
              <div className="bg-slate-200 text-slate-700 text-[10px] font-bold py-1 text-center border-y border-gray-300">GRADING & REWIND</div>
              <DataRow label="Grade Value" name="grade" />
              <DataRow label="Rew Reason" name="rewReason" />
              <DataRow label="Sub Reason" name="rewSubReason" />
            </div>

            {/* COLUMN 2: FID DATA */}
            <div className="min-w-[260px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="bg-orange-500 text-white text-[10px] font-bold py-1.5 text-center tracking-widest uppercase">FID Dimensions</div>
              <DataRow label="MFD T um" name="mfdTum" />
              <DataRow label="MFD B um" name="mfdBum" />
              <DataRow label="Cutoff T nm" name="cutoffTnm" />
              <DataRow label="Cutoff B nm" name="cutoffBnm" />
              <DataRow label="Clad Dia T" name="cladDiaTum" />
              <DataRow label="Core Clad T" name="coreCladConcTum" />
              <DataRow label="Clad Oval T%" name="cladOvalityT" />
              <DataRow label="Core Dia T" name="coreDiaTum" />
              <DataRow label="Core Oval T%" name="coreOvalityT_Percent" />
              <DataRow label="Clad Dia B" name="cladDiaBum" />
              <DataRow label="Core Clad B" name="coreCladConcBum" />
              <DataRow label="Clad Oval B%" name="cladOvalityB" />
              <DataRow label="Core Dia B" name="coreDiaBum" />
              <DataRow label="Core Oval B%" name="coreOvalityB_Percent" />
              
              <div className="p-2 bg-slate-50">
                <table className="w-full text-[9px] border border-gray-300 rounded shadow-sm overflow-hidden">
                  <thead className="bg-slate-200 text-slate-700">
                    <tr>
                      <th className="border border-gray-300 py-1">REW/SCRAP</th>
                      <th className="border border-gray-300 py-1">LEN (MTRS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1,2,3,4].map(i => (
                      <tr key={i} className="bg-white">
                        <td className="border border-gray-300 h-6"><Field name={`rewScrap_${i}`} className="w-full h-full px-1 text-center outline-none focus:bg-blue-50"/></td>
                        <td className="border border-gray-300 h-6"><Field name={`rewScrap_Len${i}`} className="w-full h-full px-1 text-center outline-none focus:bg-blue-50"/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLUMN 3: COATING & CURING */}
            <div className="min-w-[260px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="bg-emerald-600 text-white text-[10px] font-bold py-1.5 text-center tracking-widest uppercase">Coating Parameters</div>
              <button type="button" className="w-full bg-emerald-50 text-[10px] font-bold py-2 border-b border-gray-300 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                <Search size={12}/> FETCH PREFORM DATA
              </button>
              <DataRow label="Pri Coat Dia T" name="priCoatDiaTum" />
              <DataRow label="Sec Coat Dia T" name="secCoatDiaTum" />
              <DataRow label="Pri Coat Conc T" name="priCoatConcTum" />
              <DataRow label="Sec Coat Conc T" name="secCoatConcTum" />
              <DataRow label="Coat Oval T" name="coatOvalityT" />
              <DataRow label="Pri Coat Dia B" name="priCoatDiaBum" />
              <DataRow label="Sec Coat Dia B" name="secCoatDiaBum" />
              <DataRow label="Pri Coat Conc B" name="priCoatConcBum" />
              <DataRow label="Sec Coat Conc B" name="secCoatConcBum" />
              <DataRow label="Coat Oval B" name="coatOvalityB" />
              <DataRow label="Fiber Curl T" name="fiberCurlT" />
              <DataRow label="Fiber Curl B" name="fiberCurlB" />
              <DataRow label="Curl Deflect T" name="curlDeflectionT" />
              <DataRow label="Curl Deflect B" name="curlDeflectionB" />
              <DataRow label="Eff Area Top" name="effAreaTop" />
              <DataRow label="Eff Area Bot" name="effAreaBot" />
              <DataRow label="Attn 1460" name="attn1460" />
              <DataRow label="Attn 1410" name="attn1410" />
              <DataRow label="ST13 Size" name="st13Size" />
              <DataRow label="ST15 Size" name="st15Size" />
              <DataRow label="Spike Size" name="spikeSize" />
              <DataRow label="Fail Reason" name="failReason" />
              <div className="flex border-t border-gray-300 h-[26px]">
                <div className="w-[150px] text-[10px] px-2 flex items-center font-bold bg-gray-100 border-r border-gray-300 uppercase">Curing Level</div>
                <Field name="curing1" className="w-1/2 border-r border-gray-300 px-2 outline-none text-[11px]" placeholder="Val 1"/>
                <Field name="curing2" className="w-1/2 px-2 outline-none text-[11px]" placeholder="Val 2"/>
              </div>
            </div>

            {/* COLUMN 4: DISPERSION & OPERATORS */}
            <div className="min-w-[260px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
              <div className="bg-indigo-600 text-white text-[10px] font-bold py-1.5 text-center tracking-widest uppercase">Manual Log Entry</div>
              <DataRow label="Zero Disp Wave" name="zeroDispWavelen" />
              <DataRow label="Slope Zero Disp" name="slopeZeroDisp" />
              <DataRow label="Disp 1550" name="disp1550" />
              <DataRow label="Disp 1285-1330" name="disp1285_1330" />
              <DataRow label="Disp 1270-1340" name="disp1270_1340" />
              <DataRow label="Disp 1575" name="disp1575" />
              <DataRow label="PMD 1310" name="pmd1310" />
              <DataRow label="PMD 1550" name="pmd1550" />
              <DataRow label="CD 1460" name="cd1460" />
              <DataRow label="TWPMD" name="twpmd" />
              <DataRow label="Disp 1625" name="disp1625" />
              <DataRow label="Disp 1570" name="disp1570" />
              <DataRow label="Disp 1260" name="disp1260" />
              <DataRow label="BDF/Lumps" name="bdfLumps" />
              <div className="bg-slate-200 text-[9px] font-black py-1 px-2 border-y border-gray-300 uppercase">Operator Identifiers</div>
              <DataRow label="Spec Opr" name="specOpr" />
              <DataRow label="OTDR Opr" name="otdrOpr" />
              <DataRow label="CD/PMD Opr" name="cdPmdOpr" />
              <DataRow label="PT Opr" name="ptOpr" />
              <DataRow label="Rew Opr" name="rewOpr" />
              <DataRow label="Col Opr" name="colOpr" />
              <DataRow label="F Type" name="fType" />
              <DataRow label="Colour" name="colour" />
              <DataRow label="OTDR No" name="otdrNo" />
              <DataRow label="PT No" name="ptNo" />
              <DataRow label="DT No" name="dtNo" />
              <DataRow label="Coat Type" name="coatType" />
              <DataRow label="Pri Coat" name="priCoat" />
            </div>

            {/* COLUMN 5: MICROBEND & STATUS */}
            <div className="min-w-[340px] bg-white border border-gray-300 rounded shadow-sm overflow-hidden p-1 m-2">
              <div className="bg-slate-100 p-2 rounded border border-gray-200 mb-2">
                <p className="text-[11px] font-black mb-2 text-slate-700 flex items-center gap-2">
                   MICROBEND LOSS ANALYSIS
                </p>
                <table className="w-full text-[10px] border-collapse border border-gray-300 rounded overflow-hidden">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="border border-gray-400 py-1 font-normal">SPEC</th>
                      <th className="border border-gray-400 py-1">1550</th>
                      <th className="border border-gray-400 py-1">1310</th>
                      <th className="border border-gray-400 py-1">1625</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-2 font-bold bg-gray-50 text-[9px]">100T 50mm</td>
                      <td className="border border-gray-300"><Field name="mb1550_50" className="w-full px-1 text-center outline-none focus:bg-blue-50 h-6"/></td>
                      <td className="border border-gray-300"><Field name="mb1310_50" className="w-full px-1 text-center outline-none focus:bg-blue-50 h-6"/></td>
                      <td className="border border-gray-300"><Field name="mb1625_50" className="w-full px-1 text-center outline-none focus:bg-blue-50 h-6"/></td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-2 font-bold bg-gray-50 text-[9px]">100T 60mm</td>
                      <td className="border border-gray-300"><Field name="mb1550_60" className="w-full px-1 text-center outline-none focus:bg-blue-50 h-6"/></td>
                      <td className="border border-gray-300"><Field name="mb1310_60" className="w-full px-1 text-center outline-none focus:bg-blue-50 h-6"/></td>
                      <td className="border border-gray-300"><Field name="mb1625_60" className="w-full px-1 text-center outline-none focus:bg-blue-50 h-6"/></td>
                    </tr>
                    {/* Simplified mapping for others */}
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-2 font-bold bg-gray-50 text-[9px]">1T 32mm</td>
                      <td colSpan={2} className="bg-gray-100 border border-gray-300"></td>
                      <td className="border border-gray-300"><Field name="mb1550_32" className="w-full px-1 text-center outline-none focus:bg-blue-50 h-6"/></td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-2 font-bold bg-gray-50 text-[9px]">Mb Opr</td>
                      <td colSpan={3} className="border border-gray-300"><Field name="mbOpr" className="w-full px-2 outline-none h-6 uppercase font-bold text-blue-600"/></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 p-1">
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <div className="w-[120px] bg-slate-100 text-[10px] font-bold px-2 py-1.5 border-r border-gray-300">TEMP GRADE</div>
                  <div className="flex-1 bg-emerald-500"></div>
                </div>
                <div className="flex border border-gray-300 rounded overflow-hidden">
                  <div className="w-[120px] bg-slate-100 text-[10px] font-bold px-2 py-1.5 border-r border-gray-300">D2 STATUS</div>
                  <div className="flex-1 bg-emerald-100 px-2 py-1.5 text-[10px] font-black text-emerald-700">PASS</div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <DataRow label="Diff 1310-OH" name="diff1310OH" />
                  <DataRow label="Max OH" name="maxOH" />
                  <DataRow label="Min OH" name="minOH" />
                  <DataRow label="Disp Slope" name="dispSlope1550" />
                  <DataRow label="MAC Value" name="macValue" />
                  <DataRow label="Cable Cutoff" name="cableCutoff" />
                  <DataRow label="Col Dia" name="colDia" />
                  <DataRow label="Attn uni 1310" name="attnUni1310" />
                  <DataRow label="Attn uni 1550" name="attnUni1550" />
                  <DataRow label="Max1625 tb" name="attnMax1625tb" />
                  <DataRow label="MFDUNI 1625" name="mfdUni1625" />
                  <DataRow label="AttnUNI 1625" name="attnUni1625" />
                </div>
              </div>
            </div>

          </div>
        </Form>
      </Formik>
      </div>
    </div>
  );
};

export default QCEntryScreen;