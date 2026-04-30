import React from 'react';
import { Formik, Form, Field } from 'formik';
import { 
  Scan, Layers, Ruler, Palette, Settings, MessageSquare, 
  CheckSquare, Info, Save, LogOut, Activity, ArrowRightLeft,
  ChevronRight, ListChecks
} from 'lucide-react';

const RewindingEntry = () => {
  const initialValues = {
    barcodeId: '',
    fid: 'FID-99283', // Auto-fetched
    machineNo: 'MC-04', // Auto-fetched
    colour: 'Blue', // Auto-fetched
    length: '1200', // Auto-fetched
    colourBatchCode: 'CBC-X1', // Auto-fetched
    rewType: 'Standard', // Auto-fetched
    rwReason: '',
    remark: '', // Added missing field
    bottomEndChecked: false, // Added missing checkbox
    scrapLen: '',
    opr: '',
    bobbinType: '',
    bobbinColour: '',
    lengthDetails: Array(8).fill({ length: '', fid: '', barcode: '', startPos: '', endPos: '' }),
    instructions: Array(8).fill({ checked: false, instruction: '', lengthKm: '' })
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 lg:p-6 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        <Formik initialValues={initialValues} onSubmit={(v) => console.log(v)}>
          {({ values }) => (
            <Form className="space-y-6">
              
              {/* Header & Main Parameters */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <InputGroup label="Enter Barcode ID" name="barcodeId" icon={Scan} />
                  <InputGroup label="FID" name="fid" icon={Layers} readOnly variant="yellow" />
                  <InputGroup label="Machine No" name="machineNo" icon={Settings} readOnly variant="yellow" />
                  <InputGroup label="Colour" name="colour" icon={Palette} readOnly variant="yellow" />
                  <InputGroup label="Length" name="length" icon={Ruler} readOnly variant="yellow" />
                  <InputGroup label="Colour Batch Code" name="colourBatchCode" icon={Info} readOnly variant="yellow" />
                  <InputGroup label="Rew Type" name="rewType" icon={Activity} readOnly variant="yellow" />
                  <InputGroup label="Rw Reason" name="rwReason" icon={ArrowRightLeft} />
                  
                  {/* Missing Fields Added Here */}
                  <InputGroup label="Remark" name="remark" icon={MessageSquare} />
                  <div className="flex flex-col justify-end pb-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Bottom End</label>
                    <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                      <Field type="checkbox" name="bottomEndChecked" className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                      <span className="text-sm font-bold text-slate-700">Checked</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Enhanced Tables Section */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* Length Allocation Table (Left) */}
                <div className="xl:col-span-8 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
                  <div className="bg-slate-800 px-6 py-3 flex items-center gap-2">
                    <Ruler size={16} className="text-blue-400" />
                    <span className="text-xs font-black uppercase text-white tracking-widest">Length Allocation Details</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-500 uppercase bg-slate-100">
                          <th className="px-4 py-3 border-r border-slate-200">Optlen (m)</th>
                          <th className="px-4 py-3 border-r border-slate-200">Length</th>
                          <th className="px-4 py-3 border-r border-slate-200">FID</th>
                          <th className="px-4 py-3 border-r border-slate-200 bg-yellow-100 text-yellow-800">Barcode/Scrap ID</th>
                          <th className="px-4 py-3 border-r border-slate-200 bg-emerald-100 text-emerald-800">Start Pos</th>
                          <th className="px-4 py-3 bg-emerald-100 text-emerald-800">End Pos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {values.lengthDetails.map((_, i) => (
                          <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50/50 border-r border-slate-100 text-center">{i + 1}</td>
                            <td className="p-1 border-r border-slate-100"><Field name={`lengthDetails.${i}.length`} className="w-full p-2 text-sm outline-none bg-transparent" /></td>
                            <td className="p-1 border-r border-slate-100"><Field name={`lengthDetails.${i}.fid`} className="w-full p-2 text-sm outline-none bg-transparent" /></td>
                            <td className="p-1 border-r border-slate-100 bg-yellow-50/50"><Field name={`lengthDetails.${i}.barcode`} className="w-full p-2 text-sm outline-none bg-transparent font-bold" /></td>
                            <td className="p-1 border-r border-slate-100 bg-emerald-50/50"><Field name={`lengthDetails.${i}.startPos`} className="w-full p-2 text-sm outline-none bg-transparent" /></td>
                            <td className="p-1 bg-emerald-50/50"><Field name={`lengthDetails.${i}.endPos`} className="w-full p-2 text-sm outline-none bg-transparent" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rewinding Instruction Table (Right) */}
                <div className="xl:col-span-4 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden h-fit">
                  <div className="bg-slate-800 px-6 py-3 flex items-center gap-2">
                    <ListChecks size={16} className="text-orange-400" />
                    <span className="text-xs font-black uppercase text-white tracking-widest">Rewinding Instruction</span>
                  </div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-500 uppercase bg-slate-100">
                        <th className="px-4 py-3 border-r border-slate-200 w-12 text-center">✔</th>
                        <th className="px-4 py-3 border-r border-slate-200">Instruction</th>
                        <th className="px-4 py-3">Length (km)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {values.instructions.map((_, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 text-center border-r border-slate-100">
                            <Field type="checkbox" name={`instructions.${i}.checked`} className="w-4 h-4 rounded text-blue-600" />
                          </td>
                          <td className="p-1 border-r border-slate-100"><Field name={`instructions.${i}.instruction`} className="w-full p-2 text-sm outline-none" /></td>
                          <td className="p-1"><Field name={`instructions.${i}.lengthKm`} className="w-full p-2 text-sm outline-none" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Details & Submission */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                  <InputGroup label="Scrap Len (M)" name="scrapLen" icon={ChevronRight} />
                  <InputGroup label="Bobbin Type" name="bobbinType" icon={Layers} />
                  <InputGroup label="Opr" name="opr" icon={CheckSquare} />
                  <InputGroup label="Bobbin Colour" name="bobbinColour" icon={Palette} />
                  
                  <div className="lg:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95">
                      <Save size={18} /> Submit Process
                    </button>
                    <button type="button" className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-10 py-3 rounded-xl font-bold transition-all">
                      <LogOut size={18} /> Exit
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

const InputGroup = ({ label, icon: Icon, variant, ...props }) => {
  const getStyles = () => {
    if (props.readOnly && variant === 'yellow') return "bg-yellow-50 border-yellow-200 text-yellow-800 cursor-not-allowed";
    return "bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5";
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </div>
        <Field 
          {...props} 
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all outline-none ${getStyles()}`}
        />
      </div>
    </div>
  );
};

export default RewindingEntry;