import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Save, CheckCircle, XCircle } from 'lucide-react';

const PreformAcceptance = () => {
  const initialValues = {
    preformId: '',
    weight: '',
    grade: '',
    productType: '',
    preformDia: '',
    topDia: '',
    bottomDia: '',
    diaVariation: '',
    remarks: '',
    drawInstruction: '',
    status: 'accept', // default
    rejectionNote: ''
  };

  const validationSchema = Yup.object({
    preformId: Yup.string().required('Required'),
    weight: Yup.number().required('Required'),
    grade: Yup.string().required('Required'),
  });

  const onSubmit = (values) => {
    console.log('Form Data:', values);
    alert('Entry Submitted Successfully');
  };

  // Shared classes for consistent input styling with subtle shadow
  const inputClasses = "w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner transition-all outline-none";
  const labelClasses = "text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
       <div className="bg-slate-100 p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
  {/* Left Side: Title and Subtitle */}
  <div>
    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
      Preform Acceptance Entry
    </h2>
    <p className="text-slate-600 text-sm">Please enter the preform specifications below.</p>
  </div>

  {/* Right Side: Submit Button */}
  <div className="flex items-center">
    <button
      type="submit"
      className="flex items-center gap-2.5 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-semibold text-base shadow-lg shadow-sky-100 transition-all active:scale-95"
    >
      <Save size={20} /> Get Preform From SAP
    </button>
  </div>
</div>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form className="p-6 md:p-10 space-y-8">
              
              {/* Main Grid Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Preform ID */}
                <div className="space-y-1.5">
                  <label htmlFor="preformId" className={labelClasses}>Preform ID</label>
                  <Field name="preformId" id="preformId" className={inputClasses} />
                  <ErrorMessage name="preformId" component="div" className="text-xs text-red-600 pt-1" />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label htmlFor="weight" className={labelClasses}>Weight</label>
                  <Field name="weight" id="weight" className={inputClasses} />
                  <ErrorMessage name="weight" component="div" className="text-xs text-red-600 pt-1" />
                </div>

                {/* Grade - Kept highlighted red, but light theme optimized */}
                <div className="space-y-1.5">
                  <label htmlFor="grade" className="text-sm font-semibold text-red-700">Grade</label>
                  <Field 
                    name="grade" 
                    id="grade"
                    className="w-full bg-red-50 border border-red-300 rounded-lg p-2.5 text-red-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-inner outline-none"
                  />
                  <ErrorMessage name="grade" component="div" className="text-xs text-red-600 pt-1" />
                </div>

                {/* Product Type */}
                <div className="space-y-1.5">
                  <label htmlFor="productType" className={labelClasses}>Product Type</label>
                  <Field name="productType" id="productType" className={inputClasses} />
                </div>


                {/* Additional Specs - 3 Column inside the main grid */}
                <div className="md:col-span-2 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-inner">
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Diameter Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                       <div className="space-y-1">
                          <label htmlFor="preformDia" className="text-xs font-medium text-slate-600">Preform Dia</label>
                          <Field name="preformDia" id="preformDia" className={`${inputClasses} text-sm p-2`} />
                       </div>
                       <div className="space-y-1">
                          <label htmlFor="topDia" className="text-xs font-medium text-slate-600">Top Dia</label>
                          <Field name="topDia" id="topDia" className={`${inputClasses} text-sm p-2`} />
                       </div>
                       <div className="space-y-1">
                          <label htmlFor="bottomDia" className="text-xs font-medium text-slate-600">Bottom Dia</label>
                          <Field name="bottomDia" id="bottomDia" className={`${inputClasses} text-sm p-2`} />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                       <div className="space-y-1">
                          <label htmlFor="coneLength" className="text-xs font-medium text-slate-600">Cone Length</label>
                          <Field name="coneLength" id="coneLength" className={`${inputClasses} text-sm p-2`} />
                       </div>
                       <div className="space-y-1">
                          <label htmlFor="diaVariation" className="text-xs font-medium text-slate-600">Dia Variation</label>
                          <Field name="diaVariation" id="diaVariation" className={`${inputClasses} text-sm p-2`} />
                       </div>
                       <div className="space-y-1">
                          <label htmlFor="cutOff" className="text-xs font-medium text-slate-600">Cut Off</label>
                          <Field name="cutOff" id="cutOff" className={`${inputClasses} text-sm p-2`} />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                       <div className="space-y-1">
                          <label htmlFor="mfd" className="text-xs font-medium text-slate-600">MFD</label>
                          <Field name="mfd" id="mfd" className={`${inputClasses} text-sm p-2`} />
                       </div>
                    </div>
                </div>
              </div>

              {/* Full Width Text Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label htmlFor="remarks" className={labelClasses}>Remarks</label>
                  <Field name="remarks" id="remarks" as="textarea" rows="3" className={`${inputClasses} resize-none`} />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="drawInstruction" className={labelClasses}>Draw Instruction</label>
                  <Field name="drawInstruction" id="drawInstruction" as="textarea" rows="3" className={`${inputClasses} resize-none`} />
                </div>
              </div>

              {/* Decision Section (Accept/Reject) */}
              <div className="border-t border-slate-200 pt-8 mt-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="space-y-2">
                        <label className={labelClasses}>Acceptance Status</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFieldValue('status', 'accept')}
                                className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md ${
                                values.status === 'accept' 
                                    ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                                    : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                                }`}
                            >
                                <CheckCircle size={20} /> ACCEPT
                            </button>
                            <button
                                type="button"
                                onClick={() => setFieldValue('status', 'reject')}
                                className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md ${
                                values.status === 'reject' 
                                    ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700' 
                                    : 'bg-white text-rose-700 border border-rose-300 hover:bg-rose-50'
                                }`}
                            >
                                <XCircle size={20} /> REJECT
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1.5">
                        <label htmlFor="rejectionNote" className={labelClasses}>Rejection Note (if applicable)</label>
                        <Field 
                            name="rejectionNote" 
                            id="rejectionNote"
                            disabled={values.status === 'accept'}
                            className={`${inputClasses} disabled:bg-slate-100 disabled:cursor-not-allowed disabled:shadow-none`} 
                        />
                    </div>
                </div>
              </div>

              {/* Submit Button - Bluish */}
              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center gap-2.5 bg-sky-600 hover:bg-sky-700 text-white px-10 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-sky-100 transition-all active:scale-95"
                >
                  <Save size={20} /> Submit Acceptance Entry
                </button>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PreformAcceptance;