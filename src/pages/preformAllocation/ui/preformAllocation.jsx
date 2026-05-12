import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Plus, ClipboardList, History, X, Keyboard, Settings, Building2, ListOrdered } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Mock data ── */
const INITIAL_WIP = [
  { id: 'TEF524220', weight: 54.041, batch: 'B-9921', drawing_length: '578' },
  { id: 'TEF524195', weight: 55.952, batch: 'B-8832', drawing_length: '578' },
  { id: 'TEF524194', weight: 60.997, batch: 'B-7710', drawing_length: '578' },
];

const INITIAL_ALLOCS = [
  { dtNo: 'DT10', preformId: 'TEF524220', consumed: 8.470 },
];

const FORM_INIT = {
  entryDate: '2024-05-31',
  dtNo: 'DT01',
  shift: 'A',
  seq: '',
  loadedBy: 'Operator A',
  remarks: '',
  dia1: '', dia2: '', dia3: '', dia4: '', dia5: '',
  coneL: '',
  avgDia: '',
};

/* ══════════════════════════════════════════════════════════ */
const PrerformAllocation = () => {
  const [selectedPreform, setSelectedPreform] = useState(null);
  const [wipData] = useState(INITIAL_WIP);
  const [allocations] = useState(INITIAL_ALLOCS);

  const handleSubmit = (values, { resetForm }) => {
    console.log('Payload:', { ...values, preformId: selectedPreform.id });
    alert(`Success! Allocated ${selectedPreform.id}`);
    setSelectedPreform(null);
    resetForm();
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">

          {/* ── Row 1: Available WIP | Recent Allocations ── */}
          <div className="grid grid-cols-2 gap-3 min-h-0">

            {/* Available WIP — internal scroll when rows overflow */}
            <ModuleCard
              compact
              title="Available WIP"
              icon={<ClipboardList size={13} className="text-blue-600" />}
            >
              {/* -m-3 offsets ModuleCard's compact p-3 for a flush table */}
              <div className="-m-3 overflow-y-auto max-h-40">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Action</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Preform ID</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-right">Weight (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wipData.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${selectedPreform?.id === item.id ? 'bg-blue-50' : 'hover:bg-blue-50/40'}`}
                      >
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPreform(item)}
                            className={`p-1 rounded-lg transition-all ${selectedPreform?.id === item.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
                              }`}
                          >
                            <Plus size={13} />
                          </button>
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{item.id}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">{item.weight.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModuleCard>

            {/* Recent Allocations — internal scroll when rows overflow */}
            <ModuleCard
              compact
              title="Recent Allocations"
              icon={<History size={13} className="text-indigo-600" />}
            >
              <div className="-m-3 overflow-y-auto max-h-40">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Line</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Preform</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-right">Consumed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allocations.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2 font-medium text-slate-700">{row.dtNo}</td>
                        <td className="px-3 py-2 font-bold text-blue-700">{row.preformId}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600">{row.consumed.toFixed(3)} KG</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModuleCard>
          </div>

          {/* ── Row 2: Entry Form ── */}
          <div className={`flex-1 min-h-0 rounded-2xl border-2 overflow-hidden flex flex-col transition-all duration-300 ${selectedPreform ? 'border-blue-300 shadow-lg' : 'border-slate-200 opacity-60'
            }`}>

            {/* Form header bar */}
            <div className={`px-4 py-2.5 flex justify-between items-center transition-colors duration-300 ${selectedPreform ? 'bg-blue-900' : 'bg-slate-700'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${selectedPreform ? 'bg-blue-700' : 'bg-slate-600'}`}>
                  <Keyboard size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {selectedPreform ? `Entry Form: ${selectedPreform.id}` : 'Entry Form — Select a Preform above'}
                  </h2>
                  {selectedPreform && (
                    <p className="text-blue-200 text-[10px] font-medium">
                      Stock Weight: {selectedPreform.weight} KG || Drawing Length : {selectedPreform.drawing_length}
                    </p>

                  )}
                </div>
              </div>
              {selectedPreform && (
                <button
                  type="button"
                  onClick={() => setSelectedPreform(null)}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Formik form body */}
            <Formik
              initialValues={FORM_INIT}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ resetForm }) => (
                <Form className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-slate-200">

                    {/* Left: Logistics & Tracking */}
                    <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <Settings size={12} className="text-blue-600" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Logistics &amp; Tracking</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <FormikInput compact label="Allocation Date" name="entryDate" type="date" />
                        <FormikSelect compact label="Tower Line (DT)" name="dtNo" options={['DT01', 'DT02', 'DT03', 'DT10']} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <FormikSelect compact label="Working Shift" name="shift" options={['A', 'B', 'C']} />
                        <FormikInput compact label="Sequence No" name="seq" placeholder="e.g. 1" />
                        <FormikSelect compact label="Loading Operator" name="loadedBy" options={['Operator A', 'Operator B', 'Supervisor X']} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <FormikInput compact label="Preform Type" name="preform_type" placeholder="e.g. 1" />
                        <FormikSelect compact label="Product Type" name="product_type" options={['Operator A', 'Operator B', 'Supervisor X']} />
                        <FormikSelect compact label="Process Type" name="process_type" options={['Operator A', 'Operator B', 'Supervisor X']} />
                      </div>
                      <FormikTextarea compact label="Process Remarks" name="remarks" placeholder="Enter observations..." rows={2} />
                    </div>

                    {/* Right: Measurements */}
                    <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <ListOrdered size={12} className="text-blue-600" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Measurements (MM)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <FormikInput key={i} compact label={`Dia ${i}`} name={`dia${i}`} type="number" placeholder="0.00" />
                        ))}
                        <FormikInput compact label="Cone L" name="coneL" type="number" placeholder="0.00" />
                      </div>
                      <FormikInput compact label="Average Diameter" name="avgDia" type="number" placeholder="Calculated average" />
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="bg-slate-50 px-4 py-2 flex justify-between gap-3 border-t border-slate-200">
                    <ResetButton
                      compact
                      type="button"
                      disabled={!selectedPreform}
                      onClick={() => resetForm()}
                    >
                      Clear Fields
                    </ResetButton>
                    <SubmitButton
                      compact
                      type="submit"
                      disabled={!selectedPreform}
                    >
                      Confirm Allocation
                    </SubmitButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrerformAllocation;
