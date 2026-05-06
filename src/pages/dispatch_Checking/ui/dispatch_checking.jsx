import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { 
  Save, Zap, Maximize, Layers, Activity, 
  AlertTriangle, Database, Search, FileText, 
  Settings, ClipboardList, RefreshCcw 
} from 'lucide-react';
import { ModuleCard,FormikInput,FormikSelect } from '../../../components/common_fields';

const DispatchChecking = () => {
  const initialValues = {
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
  };

  const validationSchema = Yup.object({
    barcodeId: Yup.string().required('Required'),
    fid: Yup.string().required('Required'),
  });

  const onSubmit = (values) => {
    console.log('Dispatch Specs Saved:', values);
    alert('Master Record Saved Successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
      <div className="max-w-[100%] mx-auto">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-t-2xl text-white flex justify-between items-center shadow-lg border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-slate/10 p-2 rounded-lg">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight uppercase">Master Fiber Specs</h2>
              <p className="text-white text-[10px] font-bold uppercase tracking-widest mt-0.5">Quality Assurance & Dispatch Control</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button type="button" className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-xs font-bold transition-all">
                <RefreshCcw size={14} /> Retest Load
             </button>
             <button type="button" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20">
                <Search size={14} /> Search Record
             </button>
          </div>
        </div>

        <Formik 
          initialValues={initialValues} 
          validationSchema={validationSchema} 
          onSubmit={onSubmit}
        >
          {({ values }) => (
            <Form className="bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200 p-4 space-y-6">
              
              {/* Top Level Identification */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <FormikInput label="Barcode ID" name="barcodeId" placeholder="Scan Barcode..." />
                <FormikInput label="No of Rewinding" name="noOfRewinding" type="number" />
                <FormikInput label="FID" name="fid" />
                <FormikInput label="Grade" name="grade" />
              </div>

              {/* High-Density Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                
                {/* Column 1: Optical Performance */}
                <ModuleCard title="Optical & Attenuation" icon={<Zap size={16} className="text-blue-600" />}>
                  <div className="space-y-2">
                    <FormikInput label="PT Len" name="ptLen" />
                    <FormikInput label="Optical Len" name="opticalLen" />
                    <FormikInput label="Attn1310 (Top)" name="attn1310Top" />
                    <FormikInput label="Avg LSA 1550" name="avgLsa1550" />
                    <FormikInput label="Attn1310 (Bot)" name="attn1310Bot" />
                    <FormikInput label="Attn 1550 B" name="attn1550B" />
                    <FormikInput label="Spec 1285-1330" name="spec1285_1330" />
                    <FormikInput label="Spectral 1310" name="spectral1310" />
                    <FormikInput label="Spectral 1550" name="spectral1550" />
                    <FormikInput label="MFD UNI 1310" name="mfdUni1310" />
                    <FormikInput label="MFD UNI 1550" name="mfdUni1550" />
                    <FormikInput label="Max Attn 1310" name="maxAttn1310" />
                    <FormikInput label="Max Avg 1550" name="maxAvgAttn1550" />
                  </div>
                </ModuleCard>

                {/* Column 2: Geometry */}
                <ModuleCard title="Geometry & Core" icon={<Maximize size={16} className="text-blue-600" />}>
                  <div className="space-y-2">
                    <FormikInput label="MFD T um" name="mfdT" />
                    <FormikInput label="MFD B um" name="mfdB" />
                    <FormikInput label="Cutoff T nm" name="cutoffT" />
                    <FormikInput label="Cutoff B nm" name="cutoffB" />
                    <FormikInput label="Clad Dia T" name="cladDiaT" />
                    <FormikInput label="Core Clad T" name="coreCladConcT" />
                    <FormikInput label="Clad Oval T" name="cladOvaliT" />
                    <FormikInput label="Core Dia T" name="coreDiaT" />
                    <FormikInput label="Clad Dia B" name="cladDiaB" />
                    <FormikInput label="Core Clad B" name="coreCladConcB" />
                    <FormikInput label="Clad Oval B" name="cladOvaliB" />
                    <FormikInput label="Core Dia B" name="coreDiaB" />
                    <FormikInput label="Core Oval B" name="coreOvaliB" />
                  </div>
                </ModuleCard>

                {/* Column 3: Coating */}
                <ModuleCard title="Coating & Curl" icon={<Layers size={16} className="text-blue-600" />}>
                  <div className="space-y-2">
                    <FormikInput label="Pri Coat T" name="priCoatDiaT" />
                    <FormikInput label="Sec Coat T" name="secCoatDiaT" />
                    <FormikInput label="Coat Oval T" name="coatOvaliT" />
                    <FormikInput label="Fiber Curl T" name="fiberCurlT" />
                    <FormikInput label="Curl Deflect T" name="curlDeflectT" />
                    <FormikInput label="Pri Coat B" name="priCoatDiaB" />
                    <FormikInput label="Sec Coat B" name="secCoatDiaB" />
                    <FormikInput label="Coat Oval B" name="coatOvaliB" />
                    <FormikInput label="Fiber Curl B" name="fiberCurlB" />
                    <FormikInput label="Eff Area Top" name="effAreaTop" />
                    <FormikInput label="Eff Area Bot" name="effAreaBot" />
                    <FormikInput label="ST13 Size" name="st13Size" />
                    <FormikInput label="Spike Size" name="spikeSize" />
                  </div>
                </ModuleCard>

                {/* Column 4: Dispersion */}
                <ModuleCard title="Dispersion & Ops" icon={<Activity size={16} className="text-blue-600" />}>
                  <div className="space-y-2">
                    <FormikInput label="Zero Disp WL" name="zeroDispWavelen" />
                    <FormikInput label="Slope Zero" name="slopeZeroDisp" />
                    <FormikInput label="Disp 1550" name="disp1550" />
                    <FormikInput label="PMD 1310" name="pmd1310" />
                    <FormikInput label="PMD 1550" name="pmd1550" />
                    <FormikInput label="TWPMD" name="twpmd" />
                    <FormikInput label="BDF/Lumps" name="bdfLumps" />
                    <div className="pt-2 mt-2 border-t border-slate-100 space-y-2">
                      <FormikInput label="Spec Opr" name="specOpr" />
                      <FormikInput label="OTDR Opr" name="otdrOpr" />
                      <FormikInput label="PT Opr" name="ptOpr" />
                      <FormikSelect label="F Type" name="fType" options={['G652D', 'G657A1', 'G657A2']} />
                      <FormikInput label="OTDR No" name="otdrNo" />
                    </div>
                  </div>
                </ModuleCard>

                {/* Column 5: Analysis */}
                <ModuleCard title="Analysis & Rejection" icon={<AlertTriangle size={16} className="text-blue-600" />}>
                  <div className="space-y-2">
                    <FormikInput label="Diff 1310-OH" name="diff1310OH" />
                    <FormikInput label="Max OH" name="maxOH" />
                    <FormikInput label="MAC Value" name="macValue" />
                    <FormikInput label="Cable Cutoff" name="cableCutoff" />
                    <FormikInput label="Attn Uni 1310" name="attnUni1310" />
                    <FormikInput label="MFDUNI 1625" name="mfdUni1625" />
                    
                    <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 mt-4 space-y-2">
                      <h4 className="text-[10px] font-black text-rose-700 uppercase">Failure Details</h4>
                      <FormikInput label="Rew Reason" name="rewReason" />
                      <FormikInput label="Fail Reason" name="failReason" />
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
                        <Save size={18} /> SAVE MASTER
                      </button>
                    </div>
                  </div>
                </ModuleCard>

              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DispatchChecking;