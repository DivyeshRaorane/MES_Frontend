import React from 'react';
import { Formik, Form } from 'formik';
import { 
  Save, 
  Edit3, 
  Barcode, 
  Package, 
  FileText, 
  Printer, 
  Truck, 
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import * as Yup from 'yup';
import { ModuleCard,FormikInput,FormikSelect } from './common_fields';

const TCGenerationDashboard = () => {
  const initialValues = {
    scanBarcode: '',
    fid: '',
    coatType: '',
    productType: '',
    grade: '',
    customerLen: '',
    tcSelection: '',
    boxSelection: ''
  };

  const validationSchema = Yup.object({
    scanBarcode: Yup.string().required('Required'),
  });

  const onSubmit = (values) => {
    console.log('Processing Logistics Data:', values);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 font-sans">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {() => (
          <div className="max-w-6xl mx-auto">
          <Form className="bg-white rounded-2xl shadow-xl border-x border-b border-slate-200 space-y-6">
            
            {/* Top Control Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-slate/10 p-2 rounded-lg text-white ">
                  <Truck size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">Logistics & TC Management</h1>
              </div>
              <div className="flex gap-3">
                <button type="button" className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg font-bold transition-all border border-slate-300">
                  <Edit3 size={18} /> Modify
                </button>
                <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-md">
                  <Save size={18} /> Save Entry
                </button>
              </div>
            </div>

            {/* Primary Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 m-2">
              <div className="lg:col-span-2">
                <FormikInput 
                  label="Scan Barcode" 
                  name="scanBarcode" 
                  placeholder="Scan..." 
                  className="border-indigo-400 rounded-sm ring-2 ring-indigo-50"
                />
              </div>
              <FormikInput label="Fid" name="fid" />
              <FormikInput label="Coat Type" name="coatType" />
              <FormikInput label="Product Type" name="productType" />
              <FormikInput label="Grade" name="grade" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Tables */}
              <div className="lg:col-span-4 space-y-4 m-2">
                <ModuleCard title="Current Box Details" icon={<Package size={18} className="text-indigo-500"/>}>
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="pb-2">Box No</th>
                        <th className="pb-2">Barcode</th>
                        <th className="pb-2">Opt Len</th>
                        <th className="pb-2">Cust Len</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="text-slate-600 hover:bg-slate-50">
                          <td className="py-2.5 font-medium text-slate-900">BX-00{i}</td>
                          <td className="py-2.5 font-mono">9920-X</td>
                          <td className="py-2.5 text-slate-500">25.4</td>
                          <td className="py-2.5 text-slate-500">25.0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ModuleCard>

                <ModuleCard title="Box Summary" icon={<Layers size={18} className="text-indigo-500"/>}>
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="pb-2">Box No</th>
                        <th className="pb-2 text-center">Bobbin Count</th>
                        <th className="pb-2 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="text-slate-900 font-bold bg-slate-50/50">
                        <td className="py-2.5">TOTAL</td>
                        <td className="py-2.5 text-center">12</td>
                        <td className="py-2.5 text-right text-indigo-600">304.8m</td>
                      </tr>
                    </tbody>
                  </table>
                </ModuleCard>
              </div>

              {/* Middle Column: Specs & Generation */}
              <div className="lg:col-span-5 space-y-4">
                <ModuleCard 
                  title="Customer Specification" 
                  icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                >
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-slate-100 transition-colors">
                        <span className="text-xs font-medium text-slate-700">Spec Parameter Alpha-{i}</span>
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      </div>
                    ))}
                  </div>
                </ModuleCard>

                <div className="grid grid-cols-2 gap-3">
                  <ActionButton label="Generate TC" icon={<FileText size={18}/>} />
                  <ActionButton label="Generate Pallet Sticker" icon={<Package size={18}/>} />
                </div>

                <div className="space-y-2">
                  <PrintButton label="Print Box Sticker" barcode="9920-X-BX01" />
                  <PrintButton label="Print Pallet Sticker" barcode="PLT-2026-04" />
                </div>
              </div>

              {/* Right Column: Details & Scanning Feedback */}
              <div className="lg:col-span-3 space-y-4 mx-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-[180px]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Customer Details</h3>
                  <div className="text-sm text-slate-400 italic flex items-center justify-center h-full border-2 border-dashed border-slate-100 rounded-lg">
                    No customer selected
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <PrintButton label="Print Cust Details" barcode="CUST-99" small />
                  <div className="grid grid-cols-1 gap-2">
                    <FormikSelect 
                      label="Select TC" 
                      name="tcSelection" 
                      options={['Batch 001-A', 'Batch 002-B']} 
                    />
                    <FormikSelect 
                      label="Select Box" 
                      name="boxSelection" 
                      options={['BX-ALPHA-01', 'BX-BETA-02']} 
                    />
                  </div>
                </div>

                {/* Scanning Remarks Area */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col items-center text-center">
                    <AlertCircle size={28} className="text-amber-500 mb-2" />
                    <h2 className="text-lg font-bold text-amber-900 uppercase">Scanning Remarks</h2>
                    <p className="text-amber-700 text-xs font-medium mt-1">AWAITING BARCODE INPUT</p>
                  </div>
                </div>
              </div>

            </div>
          </Form>
          </div>
        )}
      </Formik>
    </div>
  );
};

// Internal UI Helpers
const ActionButton = ({ label, icon }) => (
  <button type="button" className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition-all uppercase tracking-tight shadow-sm active:scale-95 w-full">
    {icon} {label}
  </button>
);

const PrintButton = ({ label, barcode, small }) => (
  <div className={`flex items-center justify-between px-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-white transition-all cursor-pointer group ${small ? 'py-1.5' : 'py-3'}`}>
    <div className="flex items-center gap-2">
      <Printer size={small ? 14 : 18} className="text-slate-400 group-hover:text-indigo-500" />
      <span className={`${small ? 'text-[10px]' : 'text-xs'} font-bold text-slate-600 uppercase`}>{label}</span>
    </div>
    <span className="font-mono text-[10px] text-slate-400 font-bold">{barcode}</span>
  </div>
);

export default TCGenerationDashboard;