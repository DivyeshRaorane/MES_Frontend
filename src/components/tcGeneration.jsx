import React from 'react';
import { useFormik, FormikProvider, Field, Form } from 'formik';
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

const TCGenerationDashboard = () => {
  const formik = useFormik({
    initialValues: {
      scanBarcode: '',
      fid: '',
      coatType: '',
      productType: '',
      grade: '',
      customerLen: '',
      tcSelection: '',
      boxSelection: ''
    },
    onSubmit: (values) => console.log('Processing Logistics Data:', values),
  });

  return (
    <FormikProvider value={formik}>
      {/* Main Background: Light Gray for contrast */}
      <div className="min-h-screen bg-slate-100 text-slate-800 p-4 font-sans">
        <Form className="max-w-[1600px] mx-auto space-y-4">
          
          {/* Top Control Bar: White/Clean */}
          <header className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-100">
                <Truck size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Logistics & TC Management</h1>
            </div>
            <div className="flex gap-3">
              <button type="button" className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg font-bold transition-all border border-slate-300">
                <Edit3 size={18} /> Modify
              </button>
              <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-md">
                <Save size={18} /> Save Entry
              </button>
            </div>
          </header>

          {/* Primary Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <LogisticsInput label="Scan Barcode" name="scanBarcode" icon={<Barcode size={16}/>} highlight />
            </div>
            <LogisticsInput label="Fid" name="fid" />
            <LogisticsInput label="Coat Type" name="coatType" />
            <LogisticsInput label="Product Type" name="productType" />
            <LogisticsInput label="Grade" name="grade" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column: Tables */}
            <div className="lg:col-span-4 space-y-4">
              <TableCard title="Current Box Details" icon={<Package size={18} className="text-indigo-500"/>}>
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
              </TableCard>

              <TableCard title="Box Summary" icon={<Layers size={18} className="text-indigo-500"/>}>
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
              </TableCard>
            </div>

            {/* Middle Column: Specs & Generation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Customer Specification</h3>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div className="p-4 space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-slate-100 transition-colors">
                      <span className="text-xs font-medium text-slate-700">Spec Parameter Alpha-{i}</span>
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </div>
                  ))}
                </div>
              </div>

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
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-[180px]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Customer Details</h3>
                <div className="text-sm text-slate-400 italic flex items-center justify-center h-full border-2 border-dashed border-slate-100 rounded-lg">
                  No customer selected
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <PrintButton label="Print Cust Details" barcode="CUST-99" small />
                <div className="grid grid-cols-1 gap-2">
                  <SelectField label="Select TC" name="tcSelection" />
                  <SelectField label="Select Box" name="boxSelection" />
                </div>
              </div>

              {/* Scanning Remarks Area: Highlighted Background */}
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
    </FormikProvider>
  );
};

// UI Helpers (Styled for Light Mode)
const LogisticsInput = ({ label, name, icon, highlight }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <Field 
        name={name} 
        className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2 bg-white border ${highlight ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'} rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500 transition-all`} 
      />
    </div>
  </div>
);

const TableCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
      {icon}
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const ActionButton = ({ label, icon }) => (
  <button type="button" className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition-all uppercase tracking-tight shadow-sm active:scale-95">
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

const SelectField = ({ label, name }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
    <Field as="select" name={name} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-700 outline-none focus:border-indigo-500">
      <option value="">Choose...</option>
      <option value="1">Batch 001-A</option>
      <option value="2">Batch 002-B</option>
    </Field>
  </div>
);

export default TCGenerationDashboard;