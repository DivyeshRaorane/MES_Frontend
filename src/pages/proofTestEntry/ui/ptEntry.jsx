import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  ClipboardCheck, Scan, Hash, Ruler, Calendar, 
  User, CheckCircle2, FileText, ShieldCheck, Package, Lock 
} from 'lucide-react';

// Validation Schema
const PreformSchema = Yup.object().shape({
  scanDrawSpoolNo: Yup.string().required('Required'),
  spoolCondition: Yup.string().required('Required'),
  physicalVerifiedBy: Yup.string().required('Required'),
  spoolAcceptedBy: Yup.string().required('Required'),
});

const PTEntry = () => {
  // Mock Master Data for Dropdowns
  const masterOperators = ['Operator A', 'Operator B', 'Supervisor X', 'Quality Lead Y'];

  // PT In Entry Date is today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const initialValues = {
    scanDrawSpoolNo: '',
    // Autofetched fields (Mocking values that would normally come from an API)
    preformId: 'PR-2026-0045', 
    drawLen: '450.5', 
    drawDate: '2026-04-29', 
    dtNo: 'DT-99812', 
    drawOpr: 'John Doe',
    // Logic-driven fields
    ptInEntryDate: today,
    physicalVerifiedBy: '',
    spoolCondition: '',
    spoolAcceptedBy: '',
  };

  const handleSubmit = (values) => {
    console.log('Submitted Data:', values);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <ClipboardCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Preform Acceptance</h1>
              <p className="text-slate-500 text-xs font-bold uppercase">MES Portal</p>
            </div>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={PreformSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  
                  {/* EDITABLE: Scan Spool */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Scan Draw Spool No</label>
                    <div className="relative">
                      <Scan className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field name="scanDrawSpoolNo" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-400 outline-none transition-all" />
                    </div>
                  </div>

                  {/* AUTO-FETCHED: Preform ID */}
                  <div className="space-y-2 opacity-80">
                    <label className="text-sm font-semibold text-slate-500 ml-1 flex items-center gap-1">
                      Preform ID <Lock size={12} />
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field name="preformId" readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>

                  {/* AUTO-FETCHED: Draw Len */}
                  <div className="space-y-2 opacity-80">
                    <label className="text-sm font-semibold text-slate-500 ml-1 flex items-center gap-1">
                      Draw Len <Lock size={12} />
                    </label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field name="drawLen" readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>

                  {/* AUTO-FETCHED: Draw Date */}
                  <div className="space-y-2 opacity-80">
                    <label className="text-sm font-semibold text-slate-500 ml-1 flex items-center gap-1">
                      Draw Date <Lock size={12} />
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field name="drawDate" readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>

                  {/* AUTO-FETCHED: DT No */}
                  <div className="space-y-2 opacity-80">
                    <label className="text-sm font-semibold text-slate-500 ml-1 flex items-center gap-1">
                      DT No <Lock size={12} />
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field name="dtNo" readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>

                  {/* AUTO-FETCHED: Draw Opr */}
                  <div className="space-y-2 opacity-80">
                    <label className="text-sm font-semibold text-slate-500 ml-1 flex items-center gap-1">
                      Draw Opr <Lock size={12} />
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field name="drawOpr" readOnly className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none" />
                    </div>
                  </div>

                  {/* LOGIC: PT In Entry Date (Today) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">PT In Entry Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-indigo-500" size={18} />
                      <Field name="ptInEntryDate" type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none" />
                    </div>
                  </div>

                  {/* MASTER: Physical Verified By */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Physical Verified By</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field as="select" name="physicalVerifiedBy" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-white focus:border-indigo-400 outline-none appearance-none">
                        <option value="">Select Verified By...</option>
                        {masterOperators.map(op => <option key={op} value={op}>{op}</option>)}
                      </Field>
                    </div>
                  </div>

                  {/* EDITABLE: Spool Condition */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Spool Condition</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field name="spoolCondition" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-indigo-400 outline-none transition-all" />
                    </div>
                  </div>

                  {/* MASTER: Spool Accepted By */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Spool Accepted By</label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <Field as="select" name="spoolAcceptedBy" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-100 bg-white focus:border-indigo-400 outline-none appearance-none">
                        <option value="">Select Accepted By...</option>
                        {masterOperators.map(op => <option key={op} value={op}>{op}</option>)}
                      </Field>
                    </div>
                  </div>

                </div>

                <div className="mt-10">
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3">
                    <CheckCircle2 size={24} /> Accepted
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PTEntry;