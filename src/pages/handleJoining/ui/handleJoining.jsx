import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Settings, Droplets, Ruler, Search } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

const FLAME_ROWS = [
  { key: 'h2Flow1',      label: 'H 2 Flow 1' },
  { key: 'h2Flow2',      label: 'H 2 Flow 2' },
  { key: 'h2Flow3',      label: 'H 2 Flow 3' },
  { key: 'o2Line1Flow1', label: 'O 2 Line 1 Flow 1' },
  { key: 'o2Line1Flow2', label: 'O 2 Line 1 Flow 2' },
  { key: 'o2Line1Flow3', label: 'O 2 Line 1 Flow 3' },
];

const HandleJoining = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialValues = {
    preformId: '',
    wt: 'Automatic', dia: 'Automatic', cutoff: 'Automatic', mfd: 'Automatic',preform_type: 'Automatic',
    dia1: '', dia2: '', dia3: '', dia4: '', dia5: '',
    handleLen: '', handleDia: '', handleType: 'New',coneLength: '',
    remarks: '',
    h2Flow1:      { flow: 0, time: 0 },
    h2Flow2:      { flow: 0, time: 0 },
    h2Flow3:      { flow: 0, time: 0 },
    o2Line1Flow1: { flow: 0, time: 0 },
    o2Line1Flow2: { flow: 0, time: 0 },
    o2Line1Flow3: { flow: 0, time: 0 },
  };

  const cons = (flow, time) =>
    ((parseFloat(flow) || 0) * (parseFloat(time) || 0) / 1000).toFixed(3);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik
          initialValues={initialValues}
          onSubmit={(values) => console.log('Submitted Data:', values)}
        >
          {({ values }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">
<div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Handle Joining</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
              {/* ── Row 1: Preform & WIP | Measurement Logs ── */}
              <div className="grid grid-cols-2 gap-3">

                {/* Preform & WIP */}
                <ModuleCard
                  compact
                  title="Preform & WIP Details"
                  icon={<Settings size={13} className="text-indigo-600" />}
                >
                  <div className="space-y-2">
                    {/* ID + Browse */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <FormikInput
                          compact
                          label="Preform ID"
                          name="preformId"
                          placeholder="Enter or Browse ID"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase tracking-wider hover:bg-indigo-700 transition-all h-[30px]"
                      >
                        <Search size={10} /> Browse
                      </button>
                    </div>
                    {/* Auto fields */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                      {['wt', 'cutoff', 'mfd','preform_type'].map((f) => (
                        <div key={f} className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{f}</span>
                          <span className="text-[11px] font-semibold text-slate-700">{values[f]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ModuleCard>

                {/* Measurement Logs */}
                <ModuleCard
                  compact
                  title="Measurement Logs"
                  icon={<Ruler size={13} className="text-indigo-600" />}
                >
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-1.5">
                      {['dia1','dia2','dia3','dia4','dia5'].map((d, i) => (
                        <FormikInput key={d} compact label={`Dia ${i+1}`} name={d} type="number" placeholder="0.00" />
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <FormikInput  compact label="Handle Length"   name="handleLen" type="number" />
                      <FormikInput  compact label="Handle Diameter" name="handleDia" type="number" />
                      <FormikInput compact label="Cone Length"     name="coneLength: '',"  />
                      <FormikInput  compact label="Handle Number" name="handlenumber" type="number" />
                    </div>
                  </div>
                </ModuleCard>
              </div>

              {/* ── Row 2: Flame Recipe Parameters ── */}
              <ModuleCard
                compact
                title="Flame Recipe Parameters"
                icon={<Droplets size={13} className="text-indigo-600" />}
              >
                {/* Header row */}
                <div className="grid grid-cols-[1.6fr_2fr_2fr_1fr] gap-2 px-1 mb-1">
                  {['Parameter','Flow (LPM)','Time (Min)','Cons. (M3)'].map(h => (
                    <span key={h} className="text-[9px] font-bold text-slate-500 uppercase">{h}</span>
                  ))}
                </div>
                {/* Data rows */}
                <div className="space-y-1">
                  {FLAME_ROWS.map(({ key, label }) => (
                    <div key={key} className="grid grid-cols-[1.6fr_2fr_2fr_1fr] gap-2 items-center">
                      <span className="text-[11px] font-medium text-slate-700 pl-1">{label}</span>
                      <FormikInput compact name={`${key}.flow`} type="number" />
                      <FormikInput compact name={`${key}.time`} type="number" />
                      <span className="text-[11px] font-bold text-emerald-600 font-mono text-right pr-1">
                        {cons(values[key].flow, values[key].time)}
                      </span>
                    </div>
                  ))}
                </div>
              </ModuleCard>

              {/* ── Row 3: Notes + Actions ── */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <FormikTextarea
                    compact
                    label="Additional Notes"
                    name="remarks"
                    rows={2}
                    placeholder="Enter quality or process remarks..."
                  />
                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default HandleJoining;
