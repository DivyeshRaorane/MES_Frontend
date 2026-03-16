import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
 import FormField from '../../../components/formInputs';

const RewindingEntry = () => {
  const [activeTab, setActiveTab] = useState('Rewinding');
  const [rows, setRows] = useState([{ id: 1, outputLength: '', fiberId: '', barcode: '' }]);

  const addRow = () => setRows([...rows, { id: Date.now(), outputLength: '', fiberId: '', barcode: '' }]);
  const removeRow = () => {
    if (rows.length > 1) setRows(rows.slice(0, -1));
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen p-4 font-sans text-slate-700">
      <div className="max-w-7xl mx-auto bg-white shadow-sm border border-slate-200 rounded-sm">

        {/* Main Form Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3 items-end">
          <FormField label="Machine Number" type="select" options={['M01', 'M02']} />
          <FormField label="Barcode" />
          <FormField label="PT Fiber Id" />
          <FormField label="SAP Length(m)" />
          
          <FormField label="Optical Length" />
          <FormField label="Final Length" />
          <FormField label="Scrap Length(m)" />
          <FormField label="Identifier" />

          <FormField label="Operator" type="select" options={['John Doe', 'Jane Smith']} />
          <FormField label="Shift Incharge" type="select" options={['Manager A', 'Manager B']} />
          <FormField label="Material Code" />
          <FormField label="Rewinding Order" />

          <div className="md:col-span-1">
            <FormField label="Scrap Reason" type="select" options={['Damage', 'Shortage', 'Other']} />
          </div>
          <div className="md:col-span-1">
            <label className="text-[10px] font-bold text-slate-600 uppercase">Rewinding Reason</label>
            <textarea className="w-full text-xs border border-slate-300 rounded px-2 py-1 h-8 bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-600 uppercase">Step/Cutting Remark</label>
            <textarea className="w-full text-xs border border-slate-300 rounded px-2 py-1 h-8 bg-slate-50 outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-slate-600 uppercase">Remark</label>
            <textarea className="w-full text-xs border border-slate-300 rounded px-2 py-1 h-8 bg-white outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        {/* Table Controls */}
        <div className="px-4 py-2 flex gap-2">
          <button 
            onClick={removeRow}
            className="bg-[#e53e3e] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 uppercase"
          >
            <Minus size={12} /> Remove Row
          </button>
          <button 
            onClick={addRow}
            className="bg-[#2d3748] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 uppercase"
          >
            <Plus size={12} /> Add Row
          </button>
        </div>

        {/* Data Table */}
        <div className="px-4 pb-4">
          <div className="border border-slate-200 rounded-sm overflow-hidden">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="px-4 py-2 border-r border-slate-200 w-24">Select</th>
                  <th className="px-4 py-2 border-r border-slate-200">Output Length</th>
                  <th className="px-4 py-2 border-r border-slate-200">Rewind Fiber ID</th>
                  <th className="px-4 py-2">Barcode</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-1.5 border-r border-slate-200 text-center">
                       <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-1.5 border-r border-slate-200">
                       <input type="text" className="w-full bg-transparent outline-none" />
                    </td>
                    <td className="px-4 py-1.5 border-r border-slate-200">
                       <input type="text" className="w-full bg-transparent outline-none" />
                    </td>
                    <td className="px-4 py-1.5">
                       <input type="text" className="w-full bg-transparent outline-none" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Footer */}
        <div className="px-4 py-3 flex justify-end bg-slate-50 border-t border-slate-200">
          <button className="bg-[#48bb78] text-white font-bold text-xs px-8 py-2 rounded hover:bg-green-600 transition-colors shadow-sm">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewindingEntry;