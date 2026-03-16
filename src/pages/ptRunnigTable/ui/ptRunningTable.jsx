import React, { useState } from 'react';
import { 
  ChevronDown, 
  RefreshCcw, 
  Search, 
  Filter, 
  MoreHorizontal,
  LayoutGrid,
  FileText
} from 'lucide-react';

import FormField from '../../../components/formInputs';

const PTRunningTable = () => {
  // Mock data representing the uploaded image rows
  const [data, setData] = useState([
    { id: 1, operator: "Tapas Mondal", shiftIncharge: "Saurav Pandey", ptNo: "PT05", barcode: "DTB0025750", spoolId: "TEF524245062", identifier: "A", drawnLen: 947.890, totalPtLen: 706.495, balLen: 241.395 },
    { id: 2, operator: "Tapas Mondal", shiftIncharge: "Dumne Venkatesh", ptNo: "PT03", barcode: "DTB0025759", spoolId: "TEF524234081", identifier: "A", drawnLen: 971.330, totalPtLen: 491.863, balLen: 479.467 },
    { id: 3, operator: "Tapas Mondal", shiftIncharge: "Dumne Venkatesh", ptNo: "PT12", barcode: "DTB0025763", spoolId: "TEF524210021", identifier: "A", drawnLen: 925.540, totalPtLen: 498.540, balLen: 427.000 },
    { id: 4, operator: "Tapas Mondal", shiftIncharge: "Dumne Venkatesh", ptNo: "PT10", barcode: "DTB0025762", spoolId: "TEF524249062", identifier: "A", drawnLen: 906.760, totalPtLen: 498.040, balLen: 408.720 },
    { id: 5, operator: "Tapas Mondal", shiftIncharge: "Dumne Venkatesh", ptNo: "PT04", barcode: "DTB0025761", spoolId: "TEF524234082", identifier: "A", drawnLen: 715.140, totalPtLen: 158.420, balLen: 556.720 },
    { id: 6, operator: "Bholanath Maji", shiftIncharge: "Dumne Venkatesh", ptNo: "PT08", barcode: "CA10001716", spoolId: "TEF524190052", identifier: "A", drawnLen: 790.040, totalPtLen: 189.900, balLen: 600.140 },
    { id: 7, operator: "Bholanath Maji", shiftIncharge: "Dumne Venkatesh", ptNo: "PT07", barcode: "CA10001714", spoolId: "TEF524220100", identifier: "A", drawnLen: 313.400, totalPtLen: 125.676, balLen: 187.724 },
    { id: 8, operator: "Bappa Namata", shiftIncharge: "Dumne Venkatesh", ptNo: "PT06", barcode: "CA10001712", spoolId: "TEF524194013", identifier: "A", drawnLen: 576.740, totalPtLen: 158.086, balLen: 418.654 },
  ]);

  const [selectedRows, setSelectedRows] = useState([]);

  const toggleRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-slate-900">
      {/* Dashboard Header Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <LayoutGrid size={20} className="text-blue-600" />
            <h1 className="text-sm font-bold text-slate-700">Production Control Panel</h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:bg-white rounded-md transition-colors border border-transparent hover:border-slate-200 shadow-sm">
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <FormField 
            label="Total Running On machine" 
            value="11622.967" 
            placeholder="0.000"
          />
          <FormField 
            label="Total WIP" 
            value="26262.132" 
            placeholder="0.000"
          />
          <FormField 
            label="Selected Fiber ID" 
            placeholder="Search Fiber..."
          />
          <FormField 
            label="Remarks" 
            type="select" 
            options={["Urgent", "Pending Review", "Quality Check", "Completed"]}
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="p-3 w-10 text-center">
                  <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
                {[
                  "Operator", "Shift Incharge", "PT NO", "Draw Barcode", 
                  "Spool ID", "ID", "Drawn (m)", "Total PT (m)", "Bal (m)", "Remarks", "Action"
                ].map((header) => (
                  <th key={header} className="p-3 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-blue-50/30 transition-colors group ${selectedRows.includes(row.id) ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                  </td>
                  <td className="p-3 text-xs font-medium text-slate-700">{row.operator}</td>
                  <td className="p-3 text-xs text-slate-500">{row.shiftIncharge}</td>
                  <td className="p-3 text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold">
                      {row.ptNo}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-600 font-mono">{row.barcode}</td>
                  <td className="p-3 text-xs text-slate-600 font-mono">{row.spoolId}</td>
                  <td className="p-3 text-xs font-bold text-center">
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{row.identifier}</span>
                  </td>
                  <td className="p-3 text-xs text-right font-mono text-slate-700">{row.drawnLen.toLocaleString(undefined, {minimumFractionDigits: 3})}</td>
                  <td className="p-3 text-xs text-right font-mono text-slate-700">{row.totalPtLen.toLocaleString(undefined, {minimumFractionDigits: 3})}</td>
                  <td className="p-3 text-xs text-right font-mono font-bold text-slate-800">{row.balLen.toLocaleString(undefined, {minimumFractionDigits: 3})}</td>
                  <td className="p-3 text-xs">
                    <div className="w-full h-4 border-b border-dotted border-slate-300"></div>
                  </td>
                  <td className="p-3 text-right">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase py-1.5 px-3 rounded shadow-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1">
                      <RefreshCcw size={10} />
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer Statistics */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>Showing <b>{data.length}</b> running fiber batches</div>
          <div className="flex gap-4">
            <span>Average Drawn: <b>768.23m</b></span>
            <span>Critical Remainder: <b className="text-red-500">2 Batches</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTRunningTable;