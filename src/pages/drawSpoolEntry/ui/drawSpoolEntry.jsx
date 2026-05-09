import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useNavigate } from 'react-router-dom';
import { 
  Monitor, Database, Layers, Activity, Wind, Users, Table, Eye, Cpu 
} from 'lucide-react';

// Reusing your components
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { FormikSelect, FormikInput, ModuleCard } from '../../../components/common_fields'; 
// Import your new reusable header
import FormHeader from '../../../components/header_template';

const DrawSpoolEntry = () => {
  const navigate = useNavigate();

  // Shift logic remains here as it's specific to the form data
  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 15) return 'A';
    if (hour >= 15 && hour < 23) return 'B';
    return 'C';
  };

  const dummyPitchData = [
    { flowType: 'Standard', startLength: 0, endLength: 50, pitchChange: 50 },
    { flowType: 'HighSpeed', startLength: 50, endLength: 120, pitchChange: 70 },
  ];

  const initialValues = {
    drawTower: '',
    preformId: 'PF-AUTO-9982',
    preformWeight: '',
    preformType: '',
    productType: '',
    spoolId: '',
    entryDate: new Date().toISOString().split('T')[0],
    shift: getCurrentShift(),
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    drawnLength: '',
    spoolStatus: 'OK',
    drawnSpool: '',
    remark: '',
    primaryCoat: 'P-COAT-V1',
    secondaryCoat: 'S-COAT-V2',
    primPress: '',
    secPress: '',
    primCoatBatch: '',
    secCoatBatch: '',
    drawLineSpeed: '',
    drawTension: '',
    furnacePower: '',
    preSequence: '',
    furnaceArgon: '',
    furnaceHe: '',
    tubeHe: '',
    co2Flow: '',
    uvN2: '',
    uvAir: '',
    shiftIncharge: '',
    furnaceOperator: '',
    dieOperator: '',
    rampupOperator: '',
    startupOperator: '',
    pitchDetails: dummyPitchData,
    drawnBreak: false,
    breakReason: '',
    windingObs: '',
    scratchesObs: '',
    spoolChangeOver: '',
    dieClean: '',
    totalPitchChangeLength: '120',
    totalScrap: '5.2'
  };

  const handleSubmit = (values) => {
    console.log("Submitting to Database:", values);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* --- REUSABLE HEADER REPLACING OLD BLOCK --- */}
        <FormHeader 
          title="Draw Spool Entry"
          subtitle="MES Production Portal"
          userName="Divyesh"
          userRole="Software Developer"
          icon={Monitor}
        />

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values }) => (
            <Form id="main-form" className="p-6 flex flex-col gap-6">
              
              <ModuleCard title="Main Requirements" icon={<Database size={16} className="text-blue-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                  <FormikSelect label="Draw Tower" name="drawTower" options={['Select', 'Tower 1', 'Tower 2']} />
                  <FormikInput label="Preform ID" name="preformId" readOnly />
                  <FormikInput label="Preform Weight" name="preformWeight" type="number" step="0.01" />
                  <FormikSelect label="Preform Type" name="preformType" options={['Select', 'Type A', 'Type B']} />
                  <FormikSelect label="Product Type" name="productType" options={['Select', 'Single Mode', 'Multi Mode']} />
                  <FormikInput label="Spool ID" name="spoolId" />
                  <FormikInput label="Entry Date" name="entryDate" type="date" />
                  <FormikInput label="Shift" name="shift" readOnly />
                  <FormikInput label="Start Date" name="startDate" type="date" />
                  <FormikInput label="Start Time" name="startTime" type="time" />
                  <FormikInput label="End Date" name="endDate" type="date" />
                  <FormikInput label="End Time" name="endTime" type="time" />
                  <FormikInput label="Drawn Length" name="drawnLength" type="number" />
                  <FormikSelect label="Spool Status" name="spoolStatus" options={['OK', 'Not OK']} />
                  
                  {values.spoolStatus === 'Not OK' && (
                    <FormikSelect label="Drawn Spool" name="drawnSpool" options={['Select', 'Scrap', 'Hold', 'Rework']} />
                  )}
                  
                  <div className="md:col-span-4 flex flex-col gap-1.5 mt-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Remark</label>
                    <Field as="textarea" name="remark" className="w-full border border-slate-200 rounded-sm p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-20 bg-slate-50" />
                  </div>
                </div>
              </ModuleCard>

              <ModuleCard title="Coating And Batch" icon={<Layers size={16} className="text-indigo-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <FormikInput label="Primary Coat" name="primaryCoat" readOnly />
                  <FormikInput label="Secondary Coat" name="secondaryCoat" readOnly />
                  <FormikInput label="Prim Press" name="primPress" />
                  <FormikInput label="Sec Press" name="secPress" />
                  <FormikSelect label="Prim Coat Batch" name="primCoatBatch" options={['Select', 'Batch-01', 'Batch-02']} />
                  <FormikSelect label="Sec Coat Batch" name="secCoatBatch" options={['Select', 'S-Batch-01', 'S-Batch-02']} />
                </div>
              </ModuleCard>

              <ModuleCard title="Process Parameters" icon={<Activity size={16} className="text-emerald-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <FormikInput label="Draw Line Speed" name="drawLineSpeed" type="number" />
                  <FormikInput label="Draw Tension" name="drawTension" type="number" />
                  <FormikInput label="Furnace Power" name="furnacePower" type="number" />
                  <FormikInput label="Pre. Sequence" name="preSequence" type="number" />
                </div>
              </ModuleCard>

              <ModuleCard title="Gas Flow" icon={<Wind size={16} className="text-sky-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <FormikInput label="Furnace Argon" name="furnaceArgon" />
                  <FormikInput label="Furnace He" name="furnaceHe" />
                  <FormikInput label="Tube He" name="tubeHe" />
                  <FormikInput label="CO2 Flow" name="co2Flow" />
                  <FormikInput label="UV N2" name="uvN2" />
                  <FormikInput label="UV Air" name="uvAir" />
                </div>
              </ModuleCard>

              <ModuleCard title="Work Details" icon={<Users size={16} className="text-orange-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormikSelect label="Shift Incharge" name="shiftIncharge" options={['Select', 'Incharge A', 'Incharge B']} />
                  <FormikSelect label="Furnace Operator" name="furnaceOperator" options={['Select', 'Operator 1', 'Operator 2']} />
                  <FormikSelect label="Die Operator" name="dieOperator" options={['Select', 'Op 3', 'Op 4']} />
                  <FormikSelect label="Rampup Operator" name="rampupOperator" options={['Select', 'Op 5', 'Op 6']} />
                  <FormikSelect label="StartUp Operator" name="startupOperator" options={['Select', 'Op 7', 'Op 8']} />
                </div>
              </ModuleCard>

              {/* PitchChange Details Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Table size={16} className="text-purple-600" />
                    <h2 className="font-bold text-slate-700 text-xs uppercase tracking-wider">PitchChange Details</h2>
                  </div>
                  <button type="button" className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg uppercase">
                    <Cpu size={14} /> Automation
                  </button>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-5 py-3 border-b">Flow Type</th>
                        <th className="px-5 py-3 border-b">Start Length</th>
                        <th className="px-5 py-3 border-b">End Length</th>
                        <th className="px-5 py-3 border-b">Pitchchange Kms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {values.pitchDetails.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 border-b">{row.flowType}</td>
                          <td className="px-5 py-3 border-b">{row.startLength}</td>
                          <td className="px-5 py-3 border-b">{row.endLength}</td>
                          <td className="px-5 py-3 border-b">{row.pitchChange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <ModuleCard title="Observations & Break Details" icon={<Eye size={16} className="text-red-600" />}>
                <div className="flex flex-col gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <Field type="checkbox" name="drawnBreak" className="w-5 h-5 rounded border-slate-300 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">Drawn Break Occurred?</span>
                  </label>
                  {values.drawnBreak && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <FormikSelect label="Break Reason" name="breakReason" options={['Select', 'Tension High', 'Gas Issue', 'Bubble']} />
                      <FormikSelect label="Winding Obs" name="windingObs" options={['Select', 'Poor', 'Good']} />
                      <FormikSelect label="Scratches Obs" name="scratchesObs" options={['Select', 'Nil', 'Minor', 'Major']} />
                      <FormikSelect label="Spool Change Over" name="spoolChangeOver" options={['Select', 'Auto', 'Manual']} />
                      <FormikSelect label="Die Clean" name="dieClean" options={['Select', 'Yes', 'No']} />
                    </div>
                  )}
                </div>
              </ModuleCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-col">
                  <label className="text-[10px] font-bold text-indigo-400 uppercase">Total Pitch Change Length</label>
                  <span className="text-lg font-black text-indigo-700">{values.totalPitchChangeLength} Kms</span>
                </div>
                <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex flex-col">
                  <label className="text-[10px] font-bold text-rose-400 uppercase">Total Scrap</label>
                  <span className="text-lg font-black text-rose-700">{values.totalScrap} Kg</span>
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <ResetButton />
                <SubmitButton />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DrawSpoolEntry;