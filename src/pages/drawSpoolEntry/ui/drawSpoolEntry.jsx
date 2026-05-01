import React from 'react';
import { useFormik, FormikProvider, Field, Form, FieldArray } from 'formik';
import { 
  Send, Home, Monitor, Settings, Activity, User, Wind, 
  Droplets, Zap, Clock, ChevronDown, Plus, Trash2, ListTree
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DrawSpoolEntry = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      // Initial Parameters
      towerNo: '', drawLength: '', preformId: '', spoolId: '', 
      preformWeight: '', preformLen: '', entryDate: '2026-04-30',
      balancePreWt: '', balanceThLen: '',
      startDate: '', startTime: '', endDate: '', endTime: '',

      // Operating Details
      roomTemp: '', humidity: '', coTime: '', spoolCoTime: '',
      dieClean: '', primaryFilter: '2um', secondaryFilter: '2um',

      // Draw Parameters
      drawLineSpeed: '', drawTension: '', furnacePower: '', preSequence: '',
      beScrap: '', breakType: '', breakReason: '', spoolChangeOver: '',

      // Pitchchange details (New Dynamic Table)
      pitchChanges: [
        { flawType: '', startLength: '', endLength: '', pitchKms: '' }
      ],

      // Coating Details
      primaryCoat: '', secondaryCoat: '', primCoatPress: '', secCoatPress: '',
      batchNo1: '', batchNo2: '',

      // Gas Flow Details
      furnaceArgon: '', furnaceHe: '', coolingTubeHe: '', co2Flow: '',
      uvN2Flow: '', uvComprAir: '',

      // Operator Details
      drawnShift: 'A', shiftIncharge: '', furnaceOpr: '', 
      dieOpr: '', rampUpOpr: '', leftoverOpr: '',
      windingObs: 'OK', scratchesObs: 'NO'
    },
    onSubmit: (values) => {
      console.log('Submitting Form Data:', values);
    },
  });

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans">
        {/* Sticky Header */}
        <header className="bg-white border border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm mb-6 sticky top-0 z-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
              <Monitor size={22} />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">DRAW SPOOL ENTRY</h1>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={formik.handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <Send size={18} /> Submit Entry
            </button>
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all"
            >
              <Home size={18} />
            </button>
          </div>
        </header>

        <Form className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <section className="lg:col-span-8 space-y-6">
            {/* Section 1: Core Identification */}
            <ModuleCard title="Initial Parameters" icon={<Settings className="text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormikInput name="towerNo" label="Draw Tower No." />
                <FormikInput name="drawLength" label="Draw Length" />
                <FormikInput name="preformId" label="Preform ID" />
                <FormikInput name="spoolId" label="Spool ID" />
                <FormikInput name="preformWeight" label="Preform Weight (KG)" />
                <FormikInput name="preformLen" label="Preform Length" />
                <FormikInput name="balancePreWt" label="Balance Pre Wt." />
                <FormikInput name="balanceThLen" label="Balance Th. Length" />
                <FormikInput name="entryDate" label="Entry Date" type="date" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <FormikInput name="startDate" label="Start Date" type="date" />
                <FormikInput name="startTime" label="Start Time" type="time" />
                <FormikInput name="endDate" label="End Date" type="date" />
                <FormikInput name="endTime" label="End Time" type="time" />
              </div>
            </ModuleCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModuleCard title="Operating Details" icon={<Activity className="text-rose-500" />}>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormikInput name="roomTemp" label="Room Temp" />
                    <FormikInput name="humidity" label="Humidity" />
                  </div>
                  <FormikInput name="coTime" label="C/O Time (mins)" />
                  <FormikInput name="spoolCoTime" label="Spool C/O Time (mins)" />
                  <FormikSelect name="dieClean" label="Die Clean" options={['Select', 'Yes', 'No']} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormikSelect name="primaryFilter" label="Prim. Filter" options={['2um', '5um']} />
                    <FormikSelect name="secondaryFilter" label="Sec. Filter" options={['2um', '5um']} />
                  </div>
                </div>
              </ModuleCard>

              <ModuleCard title="Draw & Process" icon={<Zap className="text-amber-500" />}>
                <div className="space-y-3">
                  <div className="bg-emerald-500 text-white text-center py-2 rounded-lg font-bold text-xs mb-2">
                    PROCESS TYPE: 250 / 200 / 180
                  </div>
                  <FormikInput name="drawLineSpeed" label="Draw Line Speed" />
                  <FormikInput name="drawTension" label="Draw Tension" />
                  <FormikInput name="furnacePower" label="Furnace Power" />
                  <FormikInput name="preSequence" label="Pre. Sequence" />
                  <FormikInput name="beScrap" label="B/E Scrap" />
                </div>
              </ModuleCard>
            </div>

            {/* NEW: Pitchchange Details Table */}
            <ModuleCard title="Pitchchange Details" icon={<ListTree className="text-slate-600" />}>
              <FieldArray name="pitchChanges">
                {({ push, remove }) => (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200">
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Flaw Type</th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Start Length</th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">End Length</th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase">Pitchchange Kms</th>
                          <th className="px-3 py-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formik.values.pitchChanges.map((_, index) => (
                          <tr key={index} className="group">
                            <td className="p-2">
                              <Field name={`pitchChanges.${index}.flawType`} className="w-full bg-transparent border-none focus:ring-0 text-sm p-1" placeholder="Enter type..." />
                            </td>
                            <td className="p-2">
                              <Field name={`pitchChanges.${index}.startLength`} className="w-full bg-transparent border-none focus:ring-0 text-sm p-1" placeholder="0" />
                            </td>
                            <td className="p-2">
                              <Field name={`pitchChanges.${index}.endLength`} className="w-full bg-transparent border-none focus:ring-0 text-sm p-1" placeholder="0" />
                            </td>
                            <td className="p-2">
                              <Field name={`pitchChanges.${index}.pitchKms`} className="w-full bg-transparent border-none focus:ring-0 text-sm p-1" placeholder="0.0" />
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      onClick={() => push({ flawType: '', startLength: '', endLength: '', pitchKms: '' })}
                      className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors px-2"
                    >
                      <Plus size={14} /> Add Flaw Row
                    </button>
                  </div>
                )}
              </FieldArray>
            </ModuleCard>
          </section>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <ModuleCard title="Coating & Batch" icon={<Droplets className="text-cyan-500" />}>
              <div className="grid grid-cols-2 gap-3">
                <FormikInput name="primaryCoat" label="Primary Coat (KG)" />
                <FormikInput name="secondaryCoat" label="Secondary Coat (KG)" />
                <FormikInput name="primCoatPress" label="Prim. Press" />
                <FormikInput name="secCoatPress" label="Sec. Press" />
              </div>
              <div className="mt-3 space-y-2">
                <FormikInput name="batchNo1" label="Coat Batch No 1" />
                <FormikInput name="batchNo2" label="Coat Batch No 2" />
              </div>
            </ModuleCard>

            <ModuleCard title="Gas Flow (LPM)" icon={<Wind className="text-indigo-500" />}>
              <div className="grid grid-cols-2 gap-3">
                <FormikInput name="furnaceArgon" label="Furnace Argon" />
                <FormikInput name="furnaceHe" label="Furnace He" />
                <FormikInput name="coolingTubeHe" label="Tube He" />
                <FormikInput name="co2Flow" label="CO2 Flow" />
                <FormikInput name="uvN2Flow" label="UV N2" />
                <FormikInput name="uvComprAir" label="UV Air" />
              </div>
            </ModuleCard>

            <ModuleCard title="Personnel" icon={<User className="text-violet-500" />}>
              <div className="space-y-3">
                <FormikSelect name="drawnShift" label="Drawn Shift" options={['A', 'B', 'C']} />
                <FormikSelect name="shiftIncharge" label="Shift Incharge" options={['SIC Name 1', 'SIC Name 2']} />
                <FormikSelect name="furnaceOpr" label="Furnace Operator" options={['FF Operator 1', 'FF Operator 2']} />
                <FormikSelect name="dieOpr" label="Die Operator" options={['Die Operator 1', 'Die Operator 2']} />
                <FormikSelect name="rampUpOpr" label="Ramp Up Operator" options={['Opr 1', 'Opr 2']} />
              </div>
            </ModuleCard>
          </aside>

          {/* Bottom Full-Width */}
          <section className="lg:col-span-12">
            <ModuleCard title="Observations & Break Details" icon={<Clock className="text-slate-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <FormikInput name="breakReason" label="Break Reason (Coating, S/C, Cut, Sample...)" />
                  <FormikInput name="spoolChangeOver" label="Spool Change Over (Pass/Fail)" />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <FormikSelect name="windingObs" label="Winding Obs" options={['OK', 'NOT OK']} />
                  <FormikSelect name="scratchesObs" label="Scratches Obs" options={['NO', 'YES']} />
                  <FormikSelect name="leftoverOpr" label="Leftover Removal Opr" options={['Select Opr']} className="col-span-2" />
                </div>
              </div>
            </ModuleCard>
          </section>
        </Form>
      </div>
    </FormikProvider>
  );
};

/* --- UI Helper Components --- */

const ModuleCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
    <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
      {icon}
      <h2 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{title}</h2>
    </div>
    <div className="p-5 flex-1 bg-white">
      {children}
    </div>
  </div>
);

const FormikInput = ({ label, name, type = "text", ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <Field
      name={name}
      type={type}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
      {...props}
    />
  </div>
);

const FormikSelect = ({ label, name, options, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <div className="relative">
      <Field
        as="select"
        name={name}
        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Field>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

export default DrawSpoolEntry;