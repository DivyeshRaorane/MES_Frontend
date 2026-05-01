import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Send, Search, Beaker, Activity, Layers, Settings, FileText } from 'lucide-react';

const QCEntryScreen = () => {
  // 100% Field Mapping from image_68cc56.png
  const initialValues = {
    // Header
    noOfRewinding: '', barcodeId: '', fid: '', manualEntry: false, automatic: false,
    // Column 1: Optical / Rewinding
    ptLen: '', opticalLen: '', attn1310Top: '', avgLsa1550: '', attn1310Bot: '', 
    attn1550B: '', spec1285_1330: '', spectral1310: '', spectral1550: '',
    mfdUni1310: '', mfdUni1550: '', maxAttn1310: '', maxAvgAttn1550: '',
    attn1310Tb: '', attn1550Tb: '', maxTb1310: '', maxTb1550: '', maxAttn1625: '',
    attn1625Tb: '', grade: '', rewReason: '', rewSubReason: '',
    // Column 2: FID / Dimensions
    mfdTum: '', mfdBum: '', cutoffTnm: '', cutoffBnm: '', cladDiaTum: '',
    coreCladConcTum: '', cladOvalityT: '', coreDiaTum: '', coreOvalityT_Percent: '',
    cladDiaBum: '', coreCladConcBum: '', cladOvalityB: '', coreDiaBum: '', coreOvalityB_Percent: '',
    rewScrap_1: '', rewScrap_2: '', rewScrap_3: '', rewScrap_4: '',
    rewScrap_Len1: '', rewScrap_Len2: '', rewScrap_Len3: '', rewScrap_Len4: '',
    // Column 3: Coating & Submit
    priCoatDiaTum: '', secCoatDiaTum: '', priCoatConcTum: '', secCoatConcTum: '',
    coatOvalityT: '', priCoatDiaBum: '', secCoatDiaBum: '', priCoatConcBum: '',
    secCoatConcBum: '', coatOvalityB: '', fiberCurlT: '', fiberCurlB: '',
    curlDeflectionT: '', curlDeflectionB: '', effAreaTop: '', effAreaBot: '',
    attn1460: '', attn1410: '', st13Size: '', st15Size: '', spikeSize: '',
    failReason: '', curing1: '', curing2: '',
    // Column 4: Manual Entry / Dispersion
    zeroDispWavelen: '', slopeZeroDisp: '', disp1550: '', disp1285_1330: '',
    disp1270_1340: '', disp1575: '', pmd1310: '', pmd1550: '', cd1460: '',
    twpmd: '', disp1625: '', disp1570: '', disp1260: '', bdfLumps: '',
    specOpr: '', otdrOpr: '', cdPmdOpr: '', ptOpr: '', rewOpr: '', colOpr: '',
    fType: '', colour: '', otdrNo: '', ptNo: '', dtNo: '', coatType: '', priCoat: '',
    // Column 5: Microbend & Final Status
    mb1550_50: '', mb1310_50: '', mb1625_50: '', mb1550_60: '', mb1310_60: '', mb1625_60: '',
    mb1550_32: '', mb1550_30: '', mb1550_20: '', mb1550_32t: '', mbOpr: '',
    diff1310OH: '', maxOH: '', minOH: '', dispSlope1550: '', macValue: '',
    cableCutoff: '', colDia: '', attnUni1310: '', attnUni1550: '', 
    attnMax1625tb: '', mfdUni1625: '', attnUni1625: ''
  };

  const Row = ({ label, name, bg = "bg-white" }) => (
    <div className="flex border-b border-gray-300 h-[22px]">
      <div className="w-[140px] text-[10px] px-1 flex items-center font-semibold bg-gray-100 border-r border-gray-300 truncate">
        {label}
      </div>
      <Field name={name} className={`flex-1 text-[11px] px-1 outline-none focus:bg-yellow-50 ${bg}`} />
    </div>
  );

  return (
    <div className="p-2 bg-slate-200 min-h-screen font-sans">
      <Formik initialValues={initialValues} onSubmit={(v) => console.log(v)}>
        <Form className="flex flex-col gap-2">
          
          {/* TOP BAR */}
          <div className="flex gap-1 items-center bg-white p-1 border border-gray-400 shadow-sm">
            <div className="bg-blue-600 p-1 text-white"><Settings size={16}/></div>
            <div className="flex border border-gray-400"><div className="bg-green-200 text-[10px] font-bold px-2 py-1 border-r border-gray-400">No of Rewinding</div><Field name="noOfRewinding" className="w-10 px-1"/></div>
            <div className="flex border border-gray-400"><div className="bg-yellow-300 text-[10px] font-bold px-2 py-1 border-r border-gray-400">Barcodeid</div><Field name="barcodeId" className="w-24 px-1"/></div>
            <div className="flex border border-gray-400"><div className="bg-orange-200 text-[10px] font-bold px-2 py-1 border-r border-gray-400">FID</div><Field name="fid" className="w-24 px-1"/></div>
            
            <div className="ml-auto flex gap-4 items-center px-4">
              <label className="text-[11px] font-bold flex gap-1"><Field type="checkbox" name="manualEntry"/> Manual Entry</label>
              <label className="text-[11px] font-bold flex gap-1"><Field type="checkbox" name="automatic"/> Automatic</label>
              <button type="submit" className="bg-green-700 text-white px-4 py-1 text-xs font-bold flex items-center gap-1 hover:bg-green-800"><Send size={12}/> SUBMIT</button>
            </div>
          </div>

          <div className="flex gap-2 items-start overflow-x-auto pb-4">
            
            {/* COLUMN 1 */}
            <div className="min-w-[240px] bg-white border border-gray-400">
              <Row label="PT Len" name="ptLen" />
              <Row label="Optical Len" name="opticalLen" />
              <Row label="Attn1310 nm (Top)" name="attn1310Top" />
              <Row label="Avg LSA 1550 db/km" name="avgLsa1550" />
              <Row label="Attn1310 nm (Bot)" name="attn1310Bot" />
              <Row label="Attn 1550 B(db/km)" name="attn1550B" />
              <Row label="Spec 1285_1330 nm" name="spec1285_1330" />
              <Row label="Spectral 1310 nm" name="spectral1310" />
              <Row label="Spectral 1550 nm" name="spectral1550" />
              <Row label="MFD UNI 1310" name="mfdUni1310" />
              <Row label="MFD UNI 1550" name="mfdUni1550" />
              <Row label="Max Attn 1310nm" name="maxAttn1310" />
              <Row label="Max Avg Attn 1550 nm" name="maxAvgAttn1550" />
              <Row label="Attn 1310 TB" name="attn1310Tb" />
              <Row label="Attn 1550 TB" name="attn1550Tb" />
              <Row label="Max TB 1310" name="maxTb1310" />
              <Row label="Max TB 1550" name="maxTb1550" />
              <Row label="Max Attn1625" name="maxAttn1625" />
              <Row label="Attn1625 TB" name="attn1625Tb" />
              <div className="bg-gray-600 text-white text-[10px] font-bold py-1 text-center">Grade</div>
              <Row label="Value" name="grade" />
              <Row label="Rew Reason" name="rewReason" />
              <Row label="Rew Sub Reason" name="rewSubReason" />
            </div>

            {/* COLUMN 2 */}
            <div className="min-w-[240px] bg-white border border-gray-400">
              <div className="bg-orange-100 text-center py-1 font-bold text-[10px] border-b border-gray-400">FID DATA</div>
              <Row label="MFD T um" name="mfdTum" />
              <Row label="MFD B um" name="mfdBum" />
              <Row label="Cutoff T nm" name="cutoffTnm" />
              <Row label="Cutoff B nm" name="cutoffBnm" />
              <Row label="Clad Dia T um" name="cladDiaTum" />
              <Row label="Core Clad Conc. T um" name="coreCladConcTum" />
              <Row label="Clad Ovality T %" name="cladOvalityT" />
              <Row label="Core Dia T um" name="coreDiaTum" />
              <Row label="Core Ovality T %" name="coreOvalityT_Percent" />
              <Row label="Clad Dia B um" name="cladDiaBum" />
              <Row label="Core Clad Conc. B um" name="coreCladConcBum" />
              <Row label="Clad Ovality B %" name="cladOvalityB" />
              <Row label="Core Dia B um" name="coreDiaBum" />
              <Row label="Core Ovality B %" name="coreOvalityB_Percent" />
              <div className="mt-2 p-1">
                <table className="w-full text-[10px] border-collapse border border-gray-400">
                  <thead className="bg-gray-100"><tr><th className="border border-gray-400">Rew/Scrap</th><th className="border border-gray-400">Len in Meter</th></tr></thead>
                  <tbody>
                    {[1,2,3,4].map(i => (
                      <tr key={i}><td className="border border-gray-400 h-5"><Field name={`rewScrap_${i}`} className="w-full"/></td><td className="border border-gray-400"><Field name={`rewScrap_Len${i}`} className="w-full"/></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLUMN 3 */}
            <div className="min-w-[240px] bg-white border border-gray-400">
              <div className="bg-green-600 text-white text-center py-1 font-bold text-[10px]">SUBMIT</div>
              <button type="button" className="w-full bg-green-200 text-[10px] font-bold py-1 border-b border-gray-400"><Search size={10} className="inline mr-1"/> Show Preform Data</button>
              <Row label="Pri Coat Dia T um" name="priCoatDiaTum" />
              <Row label="Sec Coat Dia T um" name="secCoatDiaTum" />
              <Row label="Pri Coat Conc. T um" name="priCoatConcTum" />
              <Row label="Sec Coat Conc. T um" name="secCoatConcTum" />
              <Row label="Coat Ovality T" name="coatOvalityT" />
              <Row label="Pri Coat Dia B um" name="priCoatDiaBum" />
              <Row label="Sec Coat Dia B um" name="secCoatDiaBum" />
              <Row label="Pri Coat Conc. B um" name="priCoatConcBum" />
              <Row label="Sec Coat Conc. B um" name="secCoatConcBum" />
              <Row label="Coat Ovality B" name="coatOvalityB" />
              <Row label="Fiber Curl T" name="fiberCurlT" />
              <Row label="Fiber Curl B" name="fiberCurlB" />
              <Row label="Curl Deflection T" name="curlDeflectionT" />
              <Row label="Curl Deflection B" name="curlDeflectionB" />
              <Row label="Eff Area Top" name="effAreaTop" />
              <Row label="Eff Area Bot" name="effAreaBot" />
              <Row label="Attn 1460" name="attn1460" />
              <Row label="Attn 1410" name="attn1410" />
              <Row label="ST13 Size" name="st13Size" />
              <Row label="ST15 Size" name="st15Size" />
              <Row label="Spike Size" name="spikeSize" />
              <div className="mt-2"><Row label="Fail Reason" name="failReason" /></div>
              <div className="flex border-b border-gray-300 h-[22px]">
                <div className="w-[140px] text-[10px] px-1 flex items-center font-semibold bg-gray-100 border-r border-gray-300">Curing</div>
                <Field name="curing1" className="w-1/2 border-r border-gray-300 px-1 outline-none" />
                <Field name="curing2" className="w-1/2 px-1 outline-none" />
              </div>
            </div>

            {/* COLUMN 4 */}
            <div className="min-w-[240px] bg-white border border-gray-400">
              <div className="p-1 bg-gray-100 text-[10px] font-bold border-b border-gray-400 text-center uppercase">Manual Entry</div>
              <Row label="Zero Disp Wavelen nm" name="zeroDispWavelen" />
              <Row label="Slope Zero Disp ps/nm2" name="slopeZeroDisp" />
              <Row label="Disp 1550 ps/nm.km" name="disp1550" />
              <Row label="Disp 1285-1330 ps/nm.km" name="disp1285_1330" />
              <Row label="Disp 1270-1340 ps/nm.km" name="disp1270_1340" />
              <Row label="Disp 1575 ps/nm.km" name="disp1575" />
              <Row label="PMD 1310 ps/root.km" name="pmd1310" />
              <Row label="PMD 1550 ps/root.km" name="pmd1550" />
              <Row label="CD 1460" name="cd1460" />
              <Row label="TWPMD" name="twpmd" />
              <Row label="Disp 1625" name="disp1625" />
              <Row label="Disp 1570" name="disp1570" />
              <Row label="Disp 1260" name="disp1260" />
              <Row label="BDF/Lumps" name="bdfLumps" />
              <Row label="Spec Opr" name="specOpr" />
              <Row label="OTDR Opr" name="otdrOpr" />
              <Row label="CD/PMD Opr" name="cdPmdOpr" />
              <Row label="PT Opr" name="ptOpr" />
              <Row label="Rew Opr" name="rewOpr" />
              <Row label="Col Opr" name="colOpr" />
              <Row label="F Type" name="fType" />
              <Row label="Colour" name="colour" />
              <Row label="OTDR No" name="otdrNo" />
              <Row label="PT No" name="ptNo" />
              <Row label="DT No" name="dtNo" />
              <Row label="Coat Type" name="coatType" />
              <Row label="Pri Coat" name="priCoat" />
            </div>

            {/* COLUMN 5 */}
            <div className="min-w-[320px] bg-white border border-gray-400 p-1">
              <p className="text-[10px] font-bold mb-1 underline">Microbend Loss</p>
              <table className="w-full text-[10px] border-collapse border border-gray-400 mb-2">
                <thead className="bg-gray-100">
                  <tr><th className="border border-gray-400"></th><th className="border border-gray-400">1550</th><th className="border border-gray-400">1310</th><th className="border border-gray-400">1625</th></tr>
                </thead>
                <tbody>
                  <tr><td className="border border-gray-400 px-1 font-bold">100_T 50 mm</td><td className="border border-gray-400"><Field name="mb1550_50" className="w-full"/></td><td className="border border-gray-400"><Field name="mb1310_50" className="w-full"/></td><td className="border border-gray-400"><Field name="mb1625_50" className="w-full"/></td></tr>
                  <tr><td className="border border-gray-400 px-1 font-bold">100_T 60 mm</td><td className="border border-gray-400"><Field name="mb1550_60" className="w-full"/></td><td className="border border-gray-400"><Field name="mb1310_60" className="w-full"/></td><td className="border border-gray-400"><Field name="mb1625_60" className="w-full"/></td></tr>
                  <tr><td className="border border-gray-400 px-1 font-bold">1T 32 mm</td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"><Field name="mb1550_32" className="w-full"/></td></tr>
                  <tr><td className="border border-gray-400 px-1 font-bold">10T 30 mm</td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"><Field name="mb1550_30" className="w-full"/></td></tr>
                  <tr><td className="border border-gray-400 px-1 font-bold">1T 20 mm</td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"><Field name="mb1550_20" className="w-full"/></td></tr>
                  <tr><td className="border border-gray-400 px-1 font-bold">100T 32 mm</td><td className="border border-gray-400"></td><td className="border border-gray-400"></td><td className="border border-gray-400"><Field name="mb1550_32t" className="w-full"/></td></tr>
                  <tr><td className="border border-gray-400 px-1 font-bold">Mb Opr</td><td className="border border-gray-400"><Field name="mbOpr" className="w-full" colSpan={3}/></td></tr>
                </tbody>
              </table>

              <div className="space-y-1">
                <div className="flex border border-gray-400"><div className="w-[120px] bg-gray-100 text-[10px] font-bold px-1 py-1">Temp Grade</div><div className="flex-1 bg-green-500"></div></div>
                <div className="flex border border-gray-400"><div className="w-[120px] bg-gray-100 text-[10px] font-bold px-1 py-1 border-r border-gray-400">D2 Status</div><div className="flex-1 bg-green-200 px-2 py-1 text-[10px]">PASS</div></div>
                <div className="flex border border-gray-400"><div className="w-[120px] bg-gray-100 text-[10px] font-bold px-1 py-1 border-r border-gray-400">PV Status</div><div className="flex-1 bg-green-200 px-2 py-1 text-[10px]">ACTIVE</div></div>
                
                <div className="pt-2">
                  <Row label="Diff 1310-OH" name="diff1310OH" />
                  <Row label="Max OH" name="maxOH" />
                  <Row label="Min OH" name="minOH" />
                  <Row label="Disp Slope at 1550" name="dispSlope1550" />
                  <Row label="MAC Value" name="macValue" />
                  <Row label="Cable Cutoff" name="cableCutoff" />
                  <Row label="Col Dia" name="colDia" />
                  <Row label="Attn uni 1310" name="attnUni1310" />
                  <Row label="Attn uni 1550" name="attnUni1550" />
                  <Row label="Attn Max1625 tb" name="attnMax1625tb" />
                  <Row label="MFDUNI 1625" name="mfdUni1625" />
                  <Row label="AttnUNI 1625" name="attnUni1625" />
                </div>
              </div>
            </div>

          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default QCEntryScreen;