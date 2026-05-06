import React from 'react';
import { Formik, Form } from 'formik';
import { 
  Home, 
  Save, 
  Edit3, 
  RotateCcw, 
  Printer, 
  Trash2, 
  Box, 
  Scan,
  RefreshCw,
  Search,
  Calendar
} from 'lucide-react';
import * as Yup from 'yup';
import { ModuleCard,FormikInput,FormikSelect } from '../../../components/common_fields';

const BoxScanningEntry = () => {
  const initialValues = {
    entryDate: '06-May-2026',
    bobbinType: '50.4',
    boxType: 'Standard',
    specification: 'Spec A',
    bobbinCount: '',
    operator: 'Operator 01',
    boxBarcode: '',
    boxPackedToday: '0',
    allocationBarcode: '',
    labelBobbinBarcode: '',
    labelBoxBarcode: ''
  };

  const validationSchema = Yup.object({
    boxBarcode: Yup.string().required('Required'),
    bobbinCount: Yup.number().typeError('Must be a number').required('Required'),
  });

  const onSubmit = (values) => {
    console.log('Form Submitted:', values);
    alert('Box Entry Saved Successfully');
  };

  // Mock table data for the allocation section
  const tableData = [
    { barcode: 'B0012345', finalLength: '25.400', fiberColor: 'Blue', identifier: 'A' },
    { barcode: 'B0012346', finalLength: '25.405', fiberColor: 'Red', identifier: 'B' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
      <div className="max-w-6xl mx-auto">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ resetForm }) => (
          
          <Form className="bg-white rounded-2xl shadow-xl border-x border-b border-slate-200 space-y-6">
            {/* Sticky Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-slate/10 p-2">
                  <Box size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-tight uppercase leading-none">Box Scanning Entry</h1>
                  <p className="text-[10px] text-white font-bold mt-1 uppercase tracking-widest">Inventory & Packaging Control</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
                  <Save size={14} /> Submit
                </button>
                <button type="button" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
                  <Edit3 size={14} /> Modify
                </button>
                <button type="button" onClick={() => resetForm()} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
                  <RotateCcw size={14} /> Reset
                </button>
                <button type="button" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded text-[11px] flex items-center gap-2 font-bold transition-all shadow-sm active:scale-95">
                  <Home size={14} /> Home
                </button>
              </div>
            </div>

            <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
              {/* Primary Data Input Section */}
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormikInput label="Entry Date" name="entryDate" readOnly />
                  <FormikSelect 
                    label="Bobbin Type" 
                    name="bobbinType" 
                    options={["50.4", "60.2", "45.0"]} 
                  />
                  <FormikInput label="Box Type" name="boxType" placeholder="Standard" />
                  <FormikSelect 
                    label="Specification" 
                    name="specification" 
                    options={["Spec A", "Spec B"]} 
                  />
                  
                  <FormikInput label="Bobbin Count" name="bobbinCount" placeholder="0" />
                  <FormikSelect 
                    label="Operator" 
                    name="operator" 
                    options={["Operator 01", "Operator 02"]} 
                  />
                  <FormikInput label="Box Barcode" name="boxBarcode" placeholder="Scan or Enter" />
                  <FormikInput label="Box Packed Today" name="boxPackedToday" placeholder="0" />
                </div>
              </section>

              {/* Operational Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Panel: Bobbin Allocation */}
                <ModuleCard 
                  title="Bobbin Allocation" 
                  icon={<Scan size={14} className="text-blue-600" />}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-end gap-3">
                      <div className="flex-1">
                        <FormikInput label="Bobbin Barcode ID" name="allocationBarcode" placeholder="Scan Bobbin..." />
                      </div>
                      <div className="flex gap-2 pb-0.5">
                        <button type="button" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all shadow-sm">
                          <Trash2 size={14} /> Remove
                        </button>
                        <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all shadow-sm">
                          <RefreshCw size={14} /> Update Box
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 border border-slate-100 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-tight">
                            <th className="p-3 border-r border-slate-100">Barcode</th>
                            <th className="p-3 border-r border-slate-100">Final Length</th>
                            <th className="p-3 border-r border-slate-100">Fiber Color</th>
                            <th className="p-3">ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {tableData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                              <td className="p-3 border-r border-slate-100 font-medium text-slate-700">{row.barcode}</td>
                              <td className="p-3 border-r border-slate-100 font-mono">{row.finalLength}</td>
                              <td className="p-3 border-r border-slate-100">{row.fiberColor}</td>
                              <td className="p-3 font-bold text-blue-600">{row.identifier}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </ModuleCard>

                {/* Right Panel: Label Generation */}
                <ModuleCard 
                  title="Label Generation" 
                  icon={<Printer size={14} className="text-slate-700" />}
                >
                  <div className="space-y-6">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <FormikInput label="Bobbin Barcode" name="labelBobbinBarcode" placeholder="Scan for Label" />
                      </div>
                      <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-[11px] font-bold transition-all shadow-sm">
                         Bobbin Print
                      </button>
                    </div>

                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <FormikInput label="Box Barcode" name="labelBoxBarcode" placeholder="Scan for Label" />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold transition-all shadow-sm">
                          Box Print
                        </button>
                        <button type="button" className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-[11px] font-bold transition-all shadow-sm">
                          Reprint Box
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mt-4 flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Search size={16}/></div>
                      <p className="text-[10px] text-blue-800 font-bold leading-tight uppercase tracking-tight">
                        Scan a barcode to populate label data. <br/>
                        <span className="text-blue-500 font-normal">Ensure the printer is connected and online.</span>
                      </p>
                    </div>
                  </div>
                </ModuleCard>

              </div>
            </main>
          </Form>
          
        )}
      </Formik>
      </div>
    </div>
  );
};

export default BoxScanningEntry;