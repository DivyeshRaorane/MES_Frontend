import React from 'react';
import { useFormik, FormikProvider, Field, Form } from 'formik';
import { 
  Zap, Activity, Layers, Maximize, Target, 
  ClipboardCheck, RotateCcw, Save, ShieldAlert, 
  Search, Info, Database, AlertTriangle
} from 'lucide-react';

const DispatchChecking = () => {
  const formik = useFormik({
    initialValues: {
      // Top Level IDs
      barcodeId: '', noOfRewinding: '', fid: '', grade: '',
      // Column 1: Optical & Attenuation
      ptLen: '', opticalLen: '', attn1310Top: '', avgLsa1550: '',
      attn1310Bot: '', attn1550B: '', spec1285_1330: '', spectral1310: '',
      spectral1550: '', mfdUni1310: '', mfdUni1550: '', maxAttn1310: '',
      maxAvgAttn1550: '', attn1310TB: '', attn1550TB: '', maxTB1310: '',
      maxTB1550: '', maxAttn1625: '', attn1625TB: '',
      // Geometry (Center Column)
      mfdT: '', mfdB: '', cutoffT: '', cutoffB: '', cladDiaT: '',
      coreCladConcT: '', cladOvaliT: '', coreDiaT: '', coreOvaliT: '',
      cladDiaB: '', coreCladConcB: '', cladOvaliB: '', coreDiaB: '', coreOvaliB: '',
      // Coating & Curl
      priCoatDiaT: '', secCoatDiaT: '', priCoatConcT: '', secCoatConcT: '',
      coatOvaliT: '', priCoatDiaB: '', secCoatDiaB: '', priCoatConcB: '',
      secCoatConcB: '', coatOvaliB: '', fiberCurlT: '', fiberCurlB: '',
      curlDeflectT: '', curlDeflectB: '', effAreaTop: '', effAreaBot: '',
      attn1460: '', attn1410: '', st13Size: '', st15Size: '', spikeSize: '',
      // Dispersion & Operators
      zeroDispWavelen: '', slopeZeroDisp: '', disp1550: '', disp1285_1330: '',
      disp1270_1340: '', disp1575: '', pmd1310: '', pmd1550: '', cd1460: '',
      twpmd: '', disp1625: '', disp1570: '', disp1260: '', bdfLumps: '',
      specOpr: '', otdrOpr: '', cdPmdOpr: '', ptOpr: '', rewOpr: '',
      colOpr: '', fType: '', colour: '', otdrNo: '', ptNo: '', dtNo: '',
      // Microbend Loss
      mb100T50_1550: '', mb100T50_1310: '', mb100T50_1625: '',
      mb100T60_1550: '', mb1T32_1550: '', mb10T30_1550: '',
      mb1T20_1550: '', mb100T32_1550: '', mbOpr: '',
      // Rejection & Reasons
      diff1310OH: '', maxOH: '', minOH: '', dispSlope1550: '', macValue: '',
      cableCutoff: '', colDia: '', attnUni1310: '', attnUni1550: '',
      attnMax1625TB: '', mfdUni1625: '', rewReason: '', rewSubReason: '', failReason: ''
    },
    onSubmit: (values) => console.log('Saving All Specs:', values),
  });

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-slate-50 p-2 font-sans text-slate-900">
        <Form className="max-w-[100%] mx-auto space-y-4">
          
          {/* Main Header */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
              <Database className="text-blue-600" size={20} />
              <h1 className="font-bold text-sm uppercase tracking-tighter">Master Fiber Specs</h1>
            </div>
            <div className="flex gap-4 flex-1">
              <HeaderField label="No of Rewinding" name="noOfRewinding" color="bg-emerald-50" />
              <HeaderField label="Barcode ID" name="barcodeId" color="bg-yellow-50" />
              <HeaderField label="FID" name="fid" color="bg-orange-50" />
              <HeaderField label="Grade" name="grade" color="bg-slate-100" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">
              <Save size={16} /> Save Master Record
            </button>
          </div>

          {/* 5-Column High Density Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* Column 1: Optical Performance */}
            <Section title="Optical & Attenuation" icon={<Zap size={14}/>}>
              <InputField label="PT Len" name="ptLen" />
              <InputField label="Optical Len" name="opticalLen" />
              <InputField label="Attn1310 nm (Top)" name="attn1310Top" />
              <InputField label="Avg LSA 1550 db/km" name="avgLsa1550" />
              <InputField label="Attn1310 nm (Bot)" name="attn1310Bot" />
              <InputField label="Attn 1550 B(db/km)" name="attn1550B" />
              <InputField label="Spec 1285_1330 nm" name="spec1285_1330" />
              <InputField label="Spectral 1310 nm" name="spectral1310" />
              <InputField label="Spectral 1550 nm" name="spectral1550" />
              <InputField label="MFD UNI 1310" name="mfdUni1310" />
              <InputField label="MFD UNI 1550" name="mfdUni1550" />
              <InputField label="Max Attn 1310nm" name="maxAttn1310" />
              <InputField label="Max Avg Attn 1550 nm" name="maxAvgAttn1550" />
              <InputField label="Attn 1310 TB" name="attn1310TB" />
              <InputField label="Attn 1550 TB" name="attn1550TB" />
              <InputField label="Max TB 1310" name="maxTB1310" />
              <InputField label="Max TB 1550" name="maxTB1550" />
              <InputField label="Max Attn 1625" name="maxAttn1625" />
              <InputField label="Attn 1625 TB" name="attn1625TB" />
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <InputField label="Rew Reason" name="rewReason" />
                <InputField label="Rew Sub Reason" name="rewSubReason" />
                <InputField label="Fail Reason" name="failReason" />
              </div>
            </Section>

            {/* Column 2: Geometry & MFD */}
            <Section title="Geometry & Core" icon={<Maximize size={14}/>}>
              <InputField label="MFD T um" name="mfdT" />
              <InputField label="MFD B um" name="mfdB" />
              <InputField label="Cutoff T nm" name="cutoffT" />
              <InputField label="Cutoff B nm" name="cutoffB" />
              <InputField label="Clad Dia T um" name="cladDiaT" />
              <InputField label="Core Clad Conc. T um" name="coreCladConcT" />
              <InputField label="Clad Ovality T %" name="cladOvaliT" />
              <InputField label="Core Dia T um" name="coreDiaT" />
              <InputField label="Core Ovality T %" name="coreOvaliT" />
              <InputField label="Clad Dia B um" name="cladDiaB" />
              <InputField label="Core Clad Conc. B um" name="coreCladConcB" />
              <InputField label="Clad Ovality B %" name="cladOvaliB" />
              <InputField label="Core Dia B um" name="coreDiaB" />
              <InputField label="Core Ovality B %" name="coreOvaliB" />
              <div className="bg-slate-50 p-3 rounded-lg mt-4">
                <h4 className="text-[10px] font-bold mb-2 uppercase">Rew/Scrap Table</h4>
                <div className="grid grid-cols-2 gap-1">
                   <div className="h-6 bg-white border border-slate-200"></div>
                   <div className="h-6 bg-white border border-slate-200"></div>
                   <div className="h-6 bg-white border border-slate-200"></div>
                   <div className="h-6 bg-white border border-slate-200"></div>
                </div>
              </div>
            </Section>

            {/* Column 3: Coating & Areas */}
            <Section title="Coating & Physical" icon={<Layers size={14}/>}>
              <InputField label="Pri Coat Dia T um" name="priCoatDiaT" />
              <InputField label="Sec Coat Dia T um" name="secCoatDiaT" />
              <InputField label="Pri Coat Conc. T um" name="priCoatConcT" />
              <InputField label="Sec Coat Conc. T um" name="secCoatConcT" />
              <InputField label="Coat Ovality T" name="coatOvaliT" />
              <InputField label="Pri Coat Dia B um" name="priCoatDiaB" />
              <InputField label="Sec Coat Dia B um" name="secCoatDiaB" />
              <InputField label="Pri Coat Conc. B um" name="priCoatConcB" />
              <InputField label="Sec Coat Conc. B um" name="secCoatConcB" />
              <InputField label="Coat Ovality B" name="coatOvaliB" />
              <InputField label="Fiber Curl T" name="fiberCurlT" />
              <InputField label="Fiber Curl B" name="fiberCurlB" />
              <InputField label="Curl Deflection T" name="curlDeflectT" />
              <InputField label="Curl Deflection B" name="curlDeflectB" />
              <InputField label="Eff Area Top" name="effAreaTop" />
              <InputField label="Eff Area Bot" name="effAreaBot" />
              <InputField label="Attn 1460" name="attn1460" />
              <InputField label="Attn 1410" name="attn1410" />
              <InputField label="ST13 Size" name="st13Size" />
              <InputField label="ST15 Size" name="st15Size" />
              <InputField label="Spike Size" name="spikeSize" />
              <div className="bg-yellow-400 py-3 rounded mt-2 text-center font-black uppercase text-xs">FG Stage</div>
            </Section>

            {/* Column 4: Dispersion & Operations */}
            <Section title="Dispersion & Ops" icon={<Activity size={14}/>}>
              <InputField label="Zerp Disp Wavelen nm" name="zeroDispWavelen" />
              <InputField label="Slope Zero Disp ps/nm2" name="slopeZeroDisp" />
              <InputField label="Disp 1550 ps/nm.km" name="disp1550" />
              <InputField label="Disp 1285-1330 ps/nm.km" name="disp1285_1330" />
              <InputField label="Disp 1270-1340 ps/nm.km" name="disp1270_1340" />
              <InputField label="Disp 1575 ps/nm.km" name="disp1575" />
              <InputField label="PMD 1310 ps/root.km" name="pmd1310" />
              <InputField label="PMD 1550 ps/root.km" name="pmd1550" />
              <InputField label="CD 1460" name="cd1460" />
              <InputField label="TWPMD" name="twpmd" />
              <InputField label="Disp 1625" name="disp1625" />
              <InputField label="Disp 1570" name="disp1570" />
              <InputField label="Disp 1260" name="disp1260" />
              <InputField label="BDF/Lumps" name="bdfLumps" />
              <div className="grid grid-cols-1 gap-1 border-t border-slate-100 pt-3 mt-3">
                <InputField label="Spec Opr" name="specOpr" />
                <InputField label="OTDR Opr" name="otdrOpr" />
                <InputField label="CD/PMD Opr" name="cdPmdOpr" />
                <InputField label="PT Opr" name="ptOpr" />
                <InputField label="Rew Opr" name="rewOpr" />
                <InputField label="Col Opr" name="colOpr" />
                <InputField label="F Type" name="fType" />
                <InputField label="Colour" name="colour" />
                <InputField label="OTDR No" name="otdrNo" />
                <InputField label="PT No" name="ptNo" />
                <InputField label="DT No" name="dtNo" />
              </div>
            </Section>

            {/* Column 5: Microbend & Rejection */}
            <Section title="Analysis & Rejection" icon={<AlertTriangle size={14}/>}>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 mb-4">
                <h4 className="text-[10px] font-bold uppercase mb-2">Microbend Loss</h4>
                <div className="grid grid-cols-4 gap-1 text-[8px] font-bold text-slate-400 mb-1">
                  <div className="col-span-1">Param</div>
                  <div>1550</div><div>1310</div><div>1625</div>
                </div>
                <MBRow label="100_T 50" name="mb100T50" />
                <MBRow label="100_T 60" name="mb100T60" />
                <MBRow label="1T 32mm" name="mb1T32" />
                <MBRow label="10T 30mm" name="mb10T30" />
                <MBRow label="1T 20mm" name="mb1T20" />
                <MBRow label="100T 32" name="mb100T32" />
                <InputField label="Mb Opr" name="mbOpr" />
              </div>

              <InputField label="Diff 1310-OH" name="diff1310OH" />
              <InputField label="Max OH" name="maxOH" />
              <InputField label="Min OH" name="minOH" />
              <InputField label="Disp Slope at 1550" name="dispSlope1550" />
              <InputField label="MAC Value" name="macValue" />
              <InputField label="Cable Cutoff" name="cableCutoff" />
              <InputField label="Col Dia" name="colDia" />
              <InputField label="Attn uni 1310" name="attnUni1310" />
              <InputField label="Attn uni 1550" name="attnUni1550" />
              <InputField label="Attn Max1625 tb" name="attnMax1625TB" />
              <InputField label="MFDUNI 1625" name="mfdUni1625" />
              
              <div className="mt-4 space-y-2">
                <h4 className="text-[10px] font-bold uppercase">FG Rejection</h4>
                <div className="flex gap-2">
                  <button type="button" className="flex-1 bg-slate-200 py-2 text-[10px] font-bold rounded">Load For Col</button>
                  <button type="button" className="flex-1 bg-slate-200 py-2 text-[10px] font-bold rounded">Load Retest</button>
                </div>
              </div>
            </Section>

          </div>
        </Form>
      </div>
    </FormikProvider>
  );
};

// UI Components
const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center gap-2">
      <span className="text-blue-500">{icon}</span>
      <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{title}</h2>
    </div>
    <div className="p-3 space-y-1.5">{children}</div>
  </div>
);

const InputField = ({ label, name }) => (
  <div className="flex items-center justify-between gap-2">
    <label className="text-[9px] font-semibold text-slate-500 flex-1 leading-tight">{label}</label>
    <Field name={name} className="w-20 px-1 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:ring-1 focus:ring-blue-500 outline-none text-right" />
  </div>
);

const HeaderField = ({ label, name, color }) => (
  <div className={`flex flex-col p-2 rounded-lg border border-slate-200 ${color} min-w-[120px]`}>
    <label className="text-[9px] font-bold text-slate-500 uppercase">{label}</label>
    <Field name={name} className="bg-transparent border-none outline-none font-bold text-xs" />
  </div>
);

const MBRow = ({ label, name }) => (
  <div className="flex items-center gap-1 mb-1">
    <span className="text-[8px] w-12 font-medium truncate">{label}</span>
    <Field name={`${name}_1550`} className="w-full h-5 bg-white border border-slate-200 rounded text-[9px]" />
    <Field name={`${name}_1310`} className="w-full h-5 bg-white border border-slate-200 rounded text-[9px]" />
    <Field name={`${name}_1625`} className="w-full h-5 bg-white border border-slate-200 rounded text-[9px]" />
  </div>
);

export default DispatchChecking;