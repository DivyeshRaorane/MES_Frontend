import React from 'react';
import { useFormik, FormikProvider, Field, FieldArray, Form } from 'formik';
import { 
  Settings, 
  Cpu, 
  Barcode, 
  Database, 
  AlertTriangle, 
  ClipboardList, 
  TrendingUp, 
  Save, 
  Plus, 
  Trash2, 
  Search,
  User,
  Clock
} from 'lucide-react';

const PTAutomation = () => {
  const formik = useFormik({
    initialValues: {
      ptMachine: '',
      allocatedId: '',
      drawSpoolBarcode: '',
      preformId: '',
      ptId: '',
      ptLength: '',
      ptBobbinBarcode: '',
      spoolEndReason: '',
      ptScrapReason: '',
      drawRejectionReason: '',
      meRejectionReason: '',
      scratchesReason: '',
      productType: '',
      operator: '',
      incharge: '',
      bobbinType: '',
      bobbinColor: '',
      // Metrics
      drawLength: '',
      ptDone: '',
      balanceLength: '',
      ptRunningStrain: '',
      nextPtOkLen: '',
      ptBobbinStatus: 'OK',
      timeLoss: '',
      timeLossReason: '',
      speedLoss: '',
      speedLossReason: '',
      // Dynamic Tables
      drawFlaws: [{ type: '', p1: '', p2: '', defectLen: '', actCuttingLen: '' }],
      ptLogs: [{ identifier: '', length: '', reason: 'OK' }]
    },
    onSubmit: (values) => console.log('Submitting Production Data:', values),
  });

  return (
    <FormikProvider value={formik}>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
        <Form className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Section */}
          <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-700">
                <Cpu className="w-8 h-8" /> PT Production Automation
              </h1>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                <Database className="w-4 h-4" /> Auto-fetching from Allocation & Draw Tables
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100 transition-colors">
                <Search className="w-4 h-4" /> Get Allocation
              </button>
              <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                <Save className="w-4 h-4" /> Save Entry
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Identification & Setup */}
            <div className="lg:col-span-4 space-y-6">
              <SectionCard title="Machine Setup" icon={<Settings className="text-blue-500" />}>
                <div className="space-y-4">
                  <CustomInput label="Select PT Machine" name="ptMachine" placeholder="Machine #" />
                  <CustomInput label="Draw Spool Barcode" name="drawSpoolBarcode" icon={<Barcode className="w-4 h-4" />} />
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput label="Preform ID" name="preformId" />
                    <CustomInput label="PT ID" name="ptId" />
                  </div>
                  <CustomInput label="PT Bobbin Barcode" name="ptBobbinBarcode" />
                </div>
              </SectionCard>

              <SectionCard title="Personnel & Bobbin" icon={<User className="text-purple-500" />}>
                <div className="grid grid-cols-2 gap-4">
                  <CustomInput label="Operator" name="operator" />
                  <CustomInput label="Incharge" name="incharge" />
                  <CustomInput label="Bobbin Type" name="bobbinType" />
                  <CustomInput label="Bobbin Color" name="bobbinColor" />
                </div>
              </SectionCard>
            </div>

            {/* Middle Column: Production Metrics */}
            <div className="lg:col-span-4 space-y-6">
              <SectionCard title="Production Metrics" icon={<TrendingUp className="text-emerald-500" />}>
                <div className="grid grid-cols-2 gap-4">
                  <CustomInput label="Draw Length" name="drawLength" />
                  <CustomInput label="PT Done" name="ptDone" />
                  <CustomInput label="Balance Length" name="balanceLength" highlight />
                  <CustomInput label="Running Strain" name="ptRunningStrain" />
                </div>
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Next Instruction</label>
                  <p className="text-lg font-mono font-bold text-emerald-900 mt-1">2,450m or Cutting Len</p>
                </div>
              </SectionCard>

              <SectionCard title="Loss Tracking" icon={<Clock className="text-orange-500" />}>
                <div className="grid grid-cols-2 gap-4">
                  <CustomInput label="Time Loss (min)" name="timeLoss" />
                  <CustomInput label="Speed Loss (m/min)" name="speedLoss" />
                  <div className="col-span-2">
                     <CustomInput label="Loss Reasons" name="timeLossReason" placeholder="Describe delay..." />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Right Column: Quality & Rejection */}
            <div className="lg:col-span-4 space-y-6">
              <SectionCard title="Quality Control" icon={<AlertTriangle className="text-rose-500" />}>
                <div className="space-y-4">
                  <CustomSelect label="Draw Rejection" name="drawRejectionReason" options={['None', 'Surface Defect', 'Ovality', 'Diameter']} />
                  <CustomSelect label="M/E Rejection" name="meRejectionReason" options={['None', 'Machine Error', 'Tool Wear']} />
                  <CustomSelect label="Scratches" name="scratchesReason" options={['None', 'Guide Roll', 'Payoff', 'Winder']} />
                  <CustomSelect label="Bobbin Status" name="ptBobbinStatus" options={['OK', 'Scrap', 'PT Break']} />
                </div>
              </SectionCard>

              <SectionCard title="Reasoning" icon={<ClipboardList className="text-slate-500" />}>
                <div className="space-y-4">
                  <CustomInput label="Spool End Reason" name="spoolEndReason" />
                  <CustomInput label="PT Scrap Reason" name="ptScrapReason" />
                </div>
              </SectionCard>
            </div>

            {/* Dynamic Tables Section */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Draw Flaw Table */}
              <TableSection 
                title="Draw Flaw Log" 
                name="drawFlaws"
                headers={['Flaw', 'Pos 1', 'Pos 2', 'Defect', 'Act Cut']}
                renderRow={(index, remove) => (
                  <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td><Field name={`drawFlaws.${index}.type`} className="table-input" /></td>
                    <td><Field name={`drawFlaws.${index}.p1`} className="table-input" /></td>
                    <td><Field name={`drawFlaws.${index}.p2`} className="table-input" /></td>
                    <td><Field name={`drawFlaws.${index}.defectLen`} className="table-input" /></td>
                    <td><Field name={`drawFlaws.${index}.actCuttingLen`} className="table-input" /></td>
                    <td className="text-center">
                      <button type="button" onClick={() => remove(index)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
                onAdd={(push) => push({ type: '', p1: '', p2: '', defectLen: '', actCuttingLen: '' })}
              />

              {/* PT Log Table */}
              <TableSection 
                title="Process Log (PT Log)" 
                name="ptLogs"
                headers={['Barcode/ID/Flaw', 'Length', 'Reason']}
                renderRow={(index, remove) => (
                  <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td><Field name={`ptLogs.${index}.identifier`} className="table-input" /></td>
                    <td><Field name={`ptLogs.${index}.length`} className="table-input" /></td>
                    <td>
                      <Field as="select" name={`ptLogs.${index}.reason`} className="table-input bg-transparent">
                        <option value="OK">OK</option>
                        <option value="PT Scrap">PT Scrap</option>
                        <option value="Draw Scrap">Draw Scrap</option>
                        <option value="PT Break Scrap">PT Break Scrap</option>
                      </Field>
                    </td>
                    <td className="text-center">
                      <button type="button" onClick={() => remove(index)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
                onAdd={(push) => push({ identifier: '', length: '', reason: 'OK' })}
              />

            </div>
          </div>
        </Form>
      </div>
     <p className="text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md p-3">
  <strong>Note:</strong> Some fields may not exactly match or may be missing in the UI.
  This is expected, as we are still working to better understand and refine them.
</p>
      
      {/* Table Styles */}
      <style jsx>{`
        .table-input {
          @apply w-full p-2 bg-transparent text-sm focus:outline-none focus:bg-white transition-all;
        }
      `}</style>
    </FormikProvider>
  );
};

// UI Components
const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
      {icon}
      <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const CustomInput = ({ label, name, icon, highlight, ...props }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <div className="relative">
      <Field
        name={name}
        className={`w-full rounded-xl border border-slate-200 p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none
          ${icon ? 'pl-9' : ''} ${highlight ? 'bg-indigo-50 font-bold text-indigo-700 border-indigo-200' : 'bg-slate-50/50'}`}
        {...props}
      />
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
    </div>
  </div>
);

const CustomSelect = ({ label, name, options }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <Field as="select" name={name} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-indigo-500/20 outline-none">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </Field>
  </div>
);

const TableSection = ({ title, name, headers, renderRow, onAdd }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
    <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
      <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{title}</h3>
      <button 
        type="button" 
        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        onClick={() => {}} // Handle addition via FieldArray's push passed in props usually
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
    <div className="overflow-x-auto">
      <FieldArray name={name}>
        {({ push, remove, form }) => (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                {headers.map(h => <th key={h} className="px-3 py-2">{h}</th>)}
                <th className="w-10 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {form.values[name].map((_, index) => renderRow(index, remove))}
              <tr>
                <td colSpan={headers.length + 1} className="p-2">
                  <button 
                    type="button"
                    onClick={() => onAdd(push)}
                    className="w-full py-2 border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-500 transition-all"
                  >
                    + Add New Entry
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </FieldArray>
    </div>  
  </div>
);

export default PTAutomation;