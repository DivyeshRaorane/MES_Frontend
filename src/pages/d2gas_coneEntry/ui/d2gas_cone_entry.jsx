import React from 'react';
import { Formik, Form } from 'formik';
import { Database, FileText, Activity, Save, LogOut, ClipboardList } from 'lucide-react';
import { ModuleCard,FormikSelect,FormikInput } from '../../../components/common_fields';

const NitrogenConsumptionPortal = () => {
  const initialValues = {
    tankNo: '',
    batchId: '',
    gasConcentration: '',
    freshGas: '',
    usedGas: '',
    n2Gas: '',
    tankPressure: '',
    startTimeDate: '',
    startTimeTime: '',
    gasType: '',
    cylinderNo: '',
    cycleTime: '',
    opr: '',
    materialCode: '',
    batch: '',
    totalBobbin: '',
    qty: '',
    sideGasType: '',
    sideCylinderNo: '',
    sideStatus: '',
    sidePassword: '',
    fromDate: '',
    toDate: ''
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-2xl text-white flex justify-between items-center shadow-lg">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">D2 Gas Entry</h2>
                    <p className="text-blue-100 text-xs mt-1">Gas And Cone Entry</p>
                  </div>
                  
                </div>
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => console.log(values)}
      >
        {() => (
          <Form className="bg-white rounded-b-2xl shadow-xl border-x border-b border-slate-200 p-6 space-y-6">
            
            <div className="grid grid-cols-12 gap-6">
              
              {/* Main Section: Nitrogen Consumption Entry in D2 */}
              <div className="col-span-9">
                <ModuleCard 
                  title="Nitrogen Consumption Entry in D2" 
                  icon={<Activity size={18} className="text-blue-500" />}
                >
                  <div className="grid grid-cols-12 gap-x-8 gap-y-4">
                    {/* Header Row: Tank and Date */}
                    <div className="col-span-8">
                      <FormikSelect 
                        label="Select Tank no" 
                        name="tankNo" 
                        options={['Tank 01', 'Tank 02', 'Tank 03']} 
                      />
                    </div>
                    <div className="col-span-4 flex items-end gap-2 pb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Date</span>
                      <span className="text-sm font-bold bg-slate-200 px-3 py-1 rounded">5/6/2026</span>
                    </div>

                    {/* Column 1: Batch, Concentration, Consumption */}
                    <div className="col-span-6 space-y-4">
                      <FormikInput label="Batchid" name="batchId" />
                      <FormikInput label="Gas Concentration" name="gasConcentration" />
                      
                      <div className="pt-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Gas Consumption</label>
                        <div className="pl-4 mt-2 space-y-3">
                          <FormikInput label="Fresh" name="freshGas" />
                          <FormikInput label="Used" name="usedGas" />
                          <FormikInput label="N2" name="n2Gas" />
                        </div>
                      </div>
                      
                      <FormikInput label="Tank Pressure" name="tankPressure" />
                    </div>

                    {/* Column 2: Opr, Material, Batch, Qty */}
                    <div className="col-span-6 space-y-4">
                      <FormikInput label="Opr" name="opr" />
                      
                      <div className="grid grid-cols-2 gap-2">
                         <FormikInput label="Material Code" name="materialCode" />
                         <div className="flex items-end pb-0.5">
                            <div className="h-9 w-12 bg-orange-400 rounded-lg shadow-inner" />
                         </div>
                      </div>

                      <FormikInput label="Batch" name="batch" />
                      <FormikInput label="Total No of Bobbin" name="totalBobbin" />
                      <FormikInput label="Qty" name="qty" />
                    </div>

                    {/* Bottom Row: Start Time and Cycle Time */}
                    <div className="col-span-12 grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div className="flex gap-2">
                        <FormikInput label="Start Time of Pressure Date" name="startTimeDate" type="date" />
                        <FormikInput label="Time" name="startTimeTime" type="time" />
                      </div>
                      <div className="flex gap-2">
                        <FormikInput label="Gas Type" name="gasType" />
                        <FormikInput label="Cyliner No" name="cylinderNo" />
                      </div>
                      <FormikInput label="Cycle Time" name="cycleTime" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-4 mt-8">
                    <button type="submit" className="flex items-center gap-2 bg-slate-600 text-white px-10 py-2 rounded font-bold text-xs uppercase hover:bg-slate-700 transition-all shadow-md">
                      <Save size={14} /> Save
                    </button>
                    <button type="button" className="flex items-center gap-2 bg-slate-400 text-white px-10 py-2 rounded font-bold text-xs uppercase hover:bg-slate-500 transition-all shadow-md">
                      <LogOut size={14} /> Exit
                    </button>
                  </div>
                </ModuleCard>
              </div>

              {/* Sidebar: Registry Section */}
              <div className="col-span-3 space-y-4">
                <ModuleCard title="Cylinder Registry" icon={<Database size={16} className="text-blue-500" />}>
                  <div className="space-y-3">
                    <FormikInput label="Gas Type" name="sideGasType" />
                    <FormikInput label="Cylinder No" name="sideCylinderNo" />
                    <FormikInput label="Status" name="sideStatus" />
                    <FormikInput label="Password" name="sidePassword" type="password" />
                    
                    <button type="button" className="w-full bg-slate-600 text-white py-2 rounded font-bold text-xs uppercase mt-2">
                      Save
                    </button>
                  </div>

                  <div className="mt-6 border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-2">Gas Type</th>
                          <th className="p-2 border-x">Cyliner No</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <tr key={i} className="h-7">
                            <td></td><td className="border-x"></td><td></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ModuleCard>
              </div>

              {/* Bottom: Report Section */}
              <div className="col-span-12">
                <ModuleCard title="Report" icon={<ClipboardList size={16} className="text-emerald-500" />}>
                  <div className="flex items-end gap-6">
                    <div className="w-64">
                      <FormikInput label="From Date" name="fromDate" type="date" />
                    </div>
                    <div className="w-64">
                      <FormikInput label="To date" name="toDate" type="date" />
                    </div>
                    <button type="button" className="bg-slate-600 text-white px-10 py-2 rounded font-bold text-xs uppercase hover:bg-slate-700 transition-all">
                      Report
                    </button>
                  </div>
                </ModuleCard>
              </div>

            </div>
          </Form>
        )}
      </Formik>
      </div>
    </div>
  );
};

export default NitrogenConsumptionPortal;