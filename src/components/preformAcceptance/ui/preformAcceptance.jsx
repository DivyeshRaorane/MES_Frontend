import React,{useState} from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { CheckCircle, XCircle, Package,Search } from 'lucide-react';
import { FormikInput, FormikSelect } from '../../common_fields';
import { SubmitButton, ResetButton } from '../../common_buttons';
import FormHeader from '../../header_template';
import SelectionModal from '../../selectionModal';

const PreformAcceptance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Dummy Data for Selection ---
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
    preformId: '',
    weight: '',
    material_code: '',
    qty: '',
    material_desc: '',
    productType: 'Standard',
    preformDia: '',
    topDia: '',
    bottomDia: '',
    coneLength: '',
    diaVariation: '',
    cutOff: '',
    mfd: '',
    accepted_by: '',
    remarks: '',
    drawInstruction: '',
    status: 'accept',
    rejectionNote: ''
  };

  const validationSchema = Yup.object({
    preformId: Yup.string().required('Required'),
    weight: Yup.number().required('Required'),
  });

  const onSubmit = (values) => {
    console.log('Final Form Data:', values);
    alert('Entry Submitted Successfully');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-slate-800">
      <div className="max-w-full mx-auto">
        
        <FormHeader 
          title="Preform Acceptance Entry"
          subtitle="MES Production Portal"
          userName="Divyesh"
          userRole="Software Developer"
          icon={Package}
        />

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue, resetForm }) => (
            <>
              <Form className="bg-white rounded-b-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-4 md:p-8 space-y-10">
                  
                  {/* --- Section 1: Basic Information --- */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-600 pl-3">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Basic Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Preform ID with Integrated Search Button */}
                      <div className="relative group">
                        <FormikInput 
                          label="Preform ID" 
                          name="preformId" 
                          placeholder="Search or enter ID..." 
                        />
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="absolute right-2 top-[26px] p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        >
                          <Search size={16} />
                        </button>
                      </div>

                      <FormikInput label="Weight (kg)" name="weight" type="number" />
                      <FormikInput label="Material Code" name="material_code" type="number" />
                      <FormikInput label="Quantity" name="qty" type="number" />
                      
                      <div className="md:col-span-2 lg:col-span-2">
                        <FormikInput label="Material Description" name="material_desc" type="text" />
                      </div>
                      <div className="md:col-span-2 lg:col-span-2">
                        <FormikSelect
                          label="Product Type"
                          name="productType"
                          options={['Standard', 'Premium', 'Custom']}
                        />
                      </div>
                    </div>
                  </div>

                  {/* --- Section 2: Diameter Specifications --- */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-600 pl-3">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Diameter Specifications</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <FormikInput label="Preform Dia" name="preformDia" />
                      <FormikInput label="Top Dia" name="topDia" />
                      <FormikInput label="Bottom Dia" name="bottomDia" />
                      <FormikInput label="Cone Length" name="coneLength" />
                      <FormikInput label="Dia Variation" name="diaVariation" />
                      <FormikInput label="Cut Off" name="cutOff" />
                      <FormikInput label="MFD" name="mfd" />
                      <FormikSelect
                        label="Accepted By"
                        name="accepted_by"
                        options={['User1', 'User2', 'User3']}
                      />
                    </div>
                  </div>

                  {/* --- Section 3: Instructions --- */}
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-600 pl-3">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Instructions</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <FormikInput label="Remarks" name="remarks" as="textarea" rows={3} />
                      <FormikInput label="Draw Instruction" name="drawInstruction" as="textarea" rows={3} />
                    </div>
                  </div>

                  {/* --- Section 4: Decision Section --- */}
                  <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200">
                    <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
                      <div className="w-full lg:w-auto space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Acceptance Status</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setFieldValue('status', 'accept')}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                              values.status === 'accept'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                            }`}
                          >
                            <CheckCircle size={18} /> ACCEPT
                          </button>
                          <button
                            type="button"
                            onClick={() => setFieldValue('status', 'reject')}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                              values.status === 'reject'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-100'
                                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                            }`}
                          >
                            <XCircle size={18} /> REJECT
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <FormikInput
                          label="Rejection Note"
                          name="rejectionNote"
                          placeholder={values.status === 'accept' ? "Not required" : "Specify reason..."}
                          disabled={values.status === 'accept'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* --- Form Footer --- */}
                  <div className="flex flex-col md:flex-row justify-between gap-4 pt-6 border-t border-slate-100">
                    <ResetButton type="button" onClick={() => resetForm()}>
                      Reset Form
                    </ResetButton>
                    <SubmitButton type="submit">
                      SUBMIT ACCEPTANCE
                    </SubmitButton>
                  </div>
                </div>
              </Form>

              {/* Selection Modal Implementation */}
              <SelectionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Preform Record"
                data={dummyPreforms}
                columns={modalColumns}
                onSelect={(selectedRow) => {
                  // Automatically map selected row data to Formik fields
                  Object.keys(selectedRow).forEach(key => {
                    setFieldValue(key, selectedRow[key]);
                  });
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