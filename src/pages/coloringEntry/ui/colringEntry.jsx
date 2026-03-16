import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import FormField from '../../../components/formInputs';


const ColouringEntry = () => {
  const [activeTab, setActiveTab] = useState('Colouring');
  const [rows, setRows] = useState([{ id: 1, length: '', fiberId: '', barcode: '' }]);

  const addRow = () => setRows([...rows, { id: Date.now(), length: '', fiberId: '', barcode: '' }]);
  const removeRow = () => rows.length > 1 && setRows(rows.slice(0, -1));

  return (
    <div className="bg-[#f4f7f6] min-h-screen p-4 font-sans text-slate-700">
      <div className="max-w-[1400px] mx-auto bg-white shadow-md border border-slate-200 rounded-sm">
        

        {/* Main Form Area */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-3 items-end">
          {/* Row 1 */}
          <FormField label="Machine Number" type="select" options={['M-01', 'M-02']} />
          <FormField label="Barcode" />
          <FormField label="Coloring Planning ID" />
          <FormField label="PT Fiber Id" />

          {/* Row 2 */}
          <FormField label="Color To Be Done" />
          <FormField label="Scrap Reason" type="select" options={['Sample', 'Damage']} />
          <FormField label="Actual Color" type="select" options={['Blue', 'Red', 'Green']} />
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Scrap Length(m)" />
            <FormField label="SAP Length(m)" />
          </div>

          {/* Row 3 */}
          <FormField label="Color Qty" />
          <FormField label="Nitrogen" />
          <FormField label="Optical Length(m)" />
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Identifier" />
            <FormField label="Color Ink Batch" />
          </div>

          {/* Row 4 */}
          <FormField label="Product Name" />
          <FormField label="Material Code" />
          <FormField label="Coloring Order" />
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Coloring Type" />
            <FormField label="Shift" type="select" options={['A', 'B', 'C']} />
          </div>

          {/* Row 5 */}
          <FormField label="Nitrogen Batch" type="select" />
          <FormField label="Bottle Batch" />
          <FormField label="Operator" type="select" options={['Op 1', 'Op 2']} />
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Shift Incharge" type="select" />
            <FormField label="Is Break" type="select" options={['YES', 'NO']} />
          </div>

          {/* Remark Row */}
          <div className="md:col-span-4 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Col Remark</label>
            <textarea className="w-full text-xs border border-slate-300 rounded px-2 py-1 h-8 outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        {/* Table Section */}
        <div className="px-4 py-2 flex gap-2 border-t border-slate-100 mt-4">
          <button onClick={removeRow} className="bg-[#e53e3e] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 uppercase">
            <Minus size={12} /> Remove Row
          </button>
          <button onClick={addRow} className="bg-[#2d3748] text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 uppercase">
            <Plus size={12} /> Add Row
          </button>
        </div>

        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-[11px] border-collapse">
            <thead className="bg-[#f8fafc] text-slate-500 uppercase font-bold border border-slate-200">
              <tr>
                <th className="px-4 py-2 border-r border-slate-200 text-left w-20">SELECT</th>
                <th className="px-4 py-2 border-r border-slate-200 text-left">OUTPUT LENGTH</th>
                <th className="px-4 py-2 border-r border-slate-200 text-left">COLOURING FIBER ID</th>
                <th className="px-4 py-2 text-left">BARCODE</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border border-slate-200">
                  <td className="px-4 py-1 border-r border-slate-200 text-center">
                    <input type="checkbox" className="accent-blue-600" />
                  </td>
                  <td className="px-4 py-1 border-r border-slate-200">
                    <input type="text" className="w-full outline-none bg-transparent" />
                  </td>
                  <td className="px-4 py-1 border-r border-slate-200">
                    <input type="text" className="w-full outline-none bg-transparent" />
                  </td>
                  <td className="px-4 py-1">
                    <input type="text" className="w-full outline-none bg-transparent" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button className="bg-[#48bb78] text-white font-bold text-xs px-10 py-2 rounded hover:bg-green-600 transition-all">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColouringEntry;