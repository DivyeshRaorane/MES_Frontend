import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { CheckCircle, XCircle, Package, Search, Ruler, FileText } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../common_fields';
import { SubmitButton, ResetButton } from '../../common_buttons';
import SelectionModal from '../../selectionModal';

/* ── Dummy data ── */
const dummyPreforms = [
  { preformId: 'PRF-2024-001', weight: 24.5, material_code: 10021, qty: 1500, material_desc: 'Clear PET - Grade A', productType: 'Standard' },
  { preformId: 'PRF-2024-002', weight: 28.0, material_code: 10022, qty: 850, material_desc: 'Amber PET - Premium', productType: 'Premium' },
  { preformId: 'PRF-2024-003', weight: 32.2, material_code: 10045, qty: 2200, material_desc: 'Custom Green HDPE', productType: 'Custom' },
];

const modalColumns = [
  { key: 'preformId', label: 'Preform ID' },
  { key: 'material_desc', label: 'Material Description' },
  { key: 'weight', label: 'Weight (kg)' },
  { key: 'qty', label: 'Quantity' },
];

const initialValues = {
  preformId: '', preform_weight: '', charge_weight: '', charge_length: '', preform_length: '', material_code: '', drawing_length: '',
  material_desc: '', preform_type: 'Standard',
  preformDia: '', topDia: '', bottomDia: '', coneLength: '',
  diaVariation: '', cutOff: '', mfd: '',
  accepted_by: '',
  remarks: '', drawInstruction: '',
  status: 'accept', rejectionNote: '',
};

const validationSchema = Yup.object({
  preformId: Yup.string().required('Required'),
  weight: Yup.number().required('Required'),
});

/* ══════════════════════════════════════════════════════════ */
const PreformAcceptance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => { console.log('Final Form Data:', values); alert('Entry Submitted Successfully'); }}
        >
          {({ values, setFieldValue, resetForm }) => (
            <>
              <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">
<div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Preform Accept</span>
                <div className="flex gap-1.5">
                  <button type="button" className="px-3 py-1 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">Save</button>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
                {/* ── Row 1: Basic Info | Diameter Specs ── */}
                <div className="grid grid-cols-2 gap-3">

                  {/* Basic Information */}
                  <ModuleCard
                    compact
                    title="Basic Information"
                    icon={<Package size={13} className="text-blue-600" />}
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {/* Preform ID with inline search */}
                      <div className="col-span-2 flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Preform ID</label>
                        <div className="relative">
                          <Field
                            name="preformId"
                            placeholder="Search or enter ID..."
                            className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 pr-8 text-xs focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all"
                          >
                            <Search size={12} />
                          </button>
                        </div>
                      </div>

                      <FormikInput compact label="Preform Weight (kg)" name="preform_weight" type="number" />
                      <FormikInput compact label="Charge Weight (kg)" name="charge_weight" type="number" />
                      <FormikInput compact label="Preform Length (mm)" name="preform_length" type="number" />
                      <FormikInput compact label="Charge Length (mm)" name="charge_length" type="number" />
                      <FormikInput compact label="Drawing Length(km)" name="drawing_length" type="number" />
                      <FormikInput compact label="Material Code" name="material_code" type="number" />
                      <FormikInput compact label="Dia Variation" name="diaVariation" type="number" />
                      <FormikInput compact label="Cut Off" name="cutOff" type="number" />
                      <FormikInput compact label="MFD" name="mfd" type="number" />
                      <FormikSelect compact label="Accepted By" name="accepted_by" options={['User1', 'User2', 'User3']} />
                      <div className="col-span-2">
                        <FormikInput compact label="Material Description" name="material_desc" />
                      </div>

                      <FormikSelect compact label="Preform Type" name="preform_type" options={['G652D', 'G667A1', 'G657A2']} />
                    </div>

                  </ModuleCard>


                  {/* Instructions */}
                  <ModuleCard
                    compact
                    title="Instructions"
                    icon={<FileText size={13} className="text-emerald-600" />}
                  >
                    <div className="grid grid-cols-2 gap-2 h-full">
                      <FormikTextarea rows={5} compact label="Remarks" name="remarks" placeholder="Enter remarks..." />
                      <FormikTextarea rows={5} compact label="Draw Instruction" name="drawInstruction" placeholder="Enter draw instructions..." />
                    </div>
                  </ModuleCard>
                </div>

                {/* ── Row 2: Instructions | Decision + Actions ── */}
                <div className="grid grid-cols-1 gap-3">

                  {/* Decision + Actions */}
                  <ModuleCard
                    compact
                    title="Acceptance Decision"
                    icon={<CheckCircle size={13} className="text-rose-500" />}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Accept / Reject toggle */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Acceptance Status</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFieldValue('status', 'accept')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${values.status === 'accept'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                              }`}
                          >
                            <CheckCircle size={13} /> ACCEPT
                          </button>
                          <button
                            type="button"
                            onClick={() => setFieldValue('status', 'reject')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${values.status === 'reject'
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
                              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                              }`}
                          >
                            <XCircle size={13} /> REJECT
                          </button>
                        </div>
                      </div>

                      {/* Rejection note */}
                      <FormikInput
                        compact
                        label="Rejection Note"
                        name="rejectionNote"
                        placeholder={values.status === 'accept' ? 'Not required' : 'Specify reason...'}
                        disabled={values.status === 'accept'}
                      />
                    </div>
                  </ModuleCard>
                </div>

              </Form>

              {/* Selection Modal */}
              <SelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Preform Record"
                data={dummyPreforms}
                columns={modalColumns}
                onSelect={(selectedRow) => {
                  Object.keys(selectedRow).forEach(key => setFieldValue(key, selectedRow[key]));
                }}
              />
            </>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PreformAcceptance;
