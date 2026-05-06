import React from 'react';
import { Formik, Form, Field } from 'formik';
import { 
  Scan, User, Calendar, Clock, BookOpen, MessageSquare, 
  Save, LogOut, FileText, Activity, Hash, CheckCircle2, LayoutDashboard, ClipboardList
} from 'lucide-react';
import { ModuleCard, FormikSelect, FormikInput } from '../../../components/common_fields';

const PVEntry = () => {
  const today = new Date().toISOString().split('T')[0];

  const initialValues = {
    verificationType: 'online',
    fiberType: 'Nat or Col',
    colType: '',
    pvOpr: '',
    scanBarcode: '',
    qtyInNo: '0',
    qtyInKms: '0.00',
    dateTime: today,
    shift: '',
    pvInstruction: '',
    pvRemarks: '',
    fromDate: today,
    toDate: today,
    entryTable: Array(6).fill({
      barcode: '', fid: '', lenKm: '', status: '', opr: '', grade: '', fType: '', remarks: ''
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => console.log('Form Submitted:', values)}
        >
          {({ values, handleChange, handleSubmit }) => (
            <Form className="bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200 space-y-6">
              
              {/* Top Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate/10  text-white ">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">PV Entry</h1>
                    <p className="text-white text-xs font-medium uppercase tracking-wider">Physical Verification System</p>
                  </div>
                </div>

                {/* Radio Group */}
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  {['online', 're-pv'].map((mode) => (
                    <label key={mode} className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-lg transition-all has-[:checked]:bg-white has-[:checked]:shadow-sm">
                      <Field 
                        type="radio" 
                        name="verificationType" 
                        value={mode}
                        className="w-4 h-4 text-blue-600" 
                      />
                      <span className="text-xs font-bold uppercase text-slate-600">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 m-2">
                {/* Left Column */}
                <div className="xl:col-span-9 space-y-6">
                  
                  <ModuleCard title="Verification Parameters" icon={<LayoutDashboard size={16} className="text-blue-500" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormikInput label="Fiber Type" name="fiberType" readOnly className="bg-amber-50/50 border-amber-100" />
                      <FormikInput label="Date & Time" name="dateTime" type="date" />
                      <FormikSelect label="Shift" name="shift" options={['', 'Shift A', 'Shift B', 'Shift C']} />
                      
                      <FormikInput label="PV Operator" name="pvOpr" placeholder="Enter Opr Name" />
                      <FormikInput label="Scan Barcode" name="scanBarcode" placeholder="Scan now..." />
                      <FormikInput label="Col Type" name="colType" />
                      
                      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormikInput label="PV Instruction" name="pvInstruction" />
                         <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">PV Remarks</label>
                            <Field 
                              as="textarea"
                              name="pvRemarks" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[40px]"
                            />
                         </div>
                      </div>
                    </div>
                  </ModuleCard>

                  {/* Table Section */}
                  <ModuleCard title="Entry Verification Log" icon={<ClipboardList size={16} className="text-blue-500" />}>
                    <div className="overflow-x-auto -m-5">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            {["Sr", "Barcode", "FID", "Len (km)", "Status", "Opr", "Grade", "F-Type", "Remarks"].map((h) => (
                              <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {values.entryTable.map((_, i) => (
                            <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-4 py-2 text-xs font-bold text-slate-400">{i + 1}</td>
                              {['barcode', 'fid', 'lenKm', 'status', 'opr', 'grade', 'fType', 'remarks'].map((field) => (
                                <td key={field} className="px-2 py-1">
                                  <Field 
                                    name={`entryTable[${i}].${field}`}
                                    className="w-full bg-transparent p-1.5 text-xs outline-none focus:bg-white border border-transparent focus:border-blue-200 rounded"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ModuleCard>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-3 space-y-6 mx-2">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md shadow-blue-100 transition-all active:scale-95"
                    >
                      <Save size={18} /> Save Entry
                    </button>
                    <button type="button" className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-all">
                      <LogOut size={18} /> Exit System
                    </button>
                  </div>

                  <ModuleCard title="Reports" icon={<FileText size={16} className="text-blue-500" />}>
                    <div className="space-y-4">
                      <FormikInput label="From Date" name="fromDate" type="date" />
                      <FormikInput label="To Date" name="toDate" type="date" />
                      <button type="button" className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-colors">
                        Generate Report
                      </button>
                    </div>
                  </ModuleCard>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                      <p className="text-[10px] font-bold text-blue-400 uppercase">Qty (No)</p>
                      <p className="text-xl font-black text-blue-700">{values.qtyInNo}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase">Qty (KMs)</p>
                      <p className="text-xl font-black text-indigo-700">{values.qtyInKms}</p>
                    </div>
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

export default PVEntry;