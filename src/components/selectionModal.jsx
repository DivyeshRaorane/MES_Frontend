import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

const SelectionModal = ({ isOpen, onClose, title, data, columns, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurry Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="text-indigo-600" /> {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Scrollable Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    className="p-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => {
                    onSelect(row);
                    onClose();
                  }}
                  className="group cursor-pointer hover:bg-indigo-50/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-4 text-sm text-slate-600 group-hover:text-indigo-700">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.length === 0 && (
            <div className="text-center py-12 text-slate-400 italic">
              No records found.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionModal;