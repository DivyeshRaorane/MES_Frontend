import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Save, CheckCircle, XCircle, FileText, Settings, ClipboardList } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../common_fields';

const PreformAcceptance = () => {
  const initialValues = {
    preformId: '',
    weight: '',
    productType: '',
    preformDia: '',
    topDia: '',
    bottomDia: '',
    coneLength: '',
    diaVariation: '',
    cutOff: '',
    mfd: '',
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
    console.log('Form Data:', values);
    alert('Entry Submitted Successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Preform Acceptance Entry</h2>
            <p className="text-blue-100 text-xs mt-1">Quality Control & SAP Integration</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Save size={18} /> Get Preform From SAP
          </button>
        </div>

        <Formik 
          initialValues={initialValues} 
          validationSchema={validationSchema} 
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200 p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Basic Info */}
                <div className="md:col-span-1 space-y-6">
                  <ModuleCard title="Basic Information" icon={<FileText size={16} className="text-blue-600" />}>
                    <div className="space-y-4">
                      <FormikInput label="Preform ID" name="preformId" placeholder="Enter ID..." />
                      <FormikInput label="Weight (kg)" name="weight" type="number" />
                      <FormikSelect 
                        label="Product Type" 
                        name="productType" 
                        options={['Standard', 'Premium', 'Custom']} 
                      />
                    </div>
                  </ModuleCard>

                  <ModuleCard title="Instructions" icon={<ClipboardList size={16} className="text-blue-600" />}>
                    <div className="space-y-4">
                      <FormikInput label="Remarks" name="remarks" as="textarea" rows={2} />
                      <FormikInput label="Draw Instruction" name="drawInstruction" as="textarea" rows={2} />
                    </div>
                  </ModuleCard>
                </div>

                {/* Column 2 & 3: Diameter Specs & Decision */}
                <div className="md:col-span-2 space-y-6">
                  <ModuleCard title="Diameter Specifications" icon={<Settings size={16} className="text-blue-600" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormikInput label="Preform Dia" name="preformDia" />
                      <FormikInput label="Top Dia" name="topDia" />
                      <FormikInput label="Bottom Dia" name="bottomDia" />
                      <FormikInput label="Cone Length" name="coneLength" />
                      <FormikInput label="Dia Variation" name="diaVariation" />
                      <FormikInput label="Cut Off" name="cutOff" />
                      <FormikInput label="MFD" name="mfd" />
                    </div>
                  </ModuleCard>

                  {/* Decision Section */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Acceptance Status</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setFieldValue('status', 'accept')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
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
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                              values.status === 'reject' 
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' 
                                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                            }`}
                          >
                            <XCircle size={18} /> REJECT
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <FormikInput 
                          label="Rejection Note" 
                          name="rejectionNote" 
                          placeholder={values.status === 'accept' ? "Not required for acceptance" : "Specify reason for rejection..."}
                          disabled={values.status === 'accept'} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Footer */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-100 transition-all active:scale-95"
                    >
                      <Save size={22} /> SUBMIT ENTRY
                    </button>
                  </div>
                </div>

              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PreformAcceptance;