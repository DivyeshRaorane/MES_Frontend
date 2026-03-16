import React, { useState } from 'react';
import { 
  Send, 
  Home,
  Search,
  FileText
} from 'lucide-react';
import FormField from '../../../components/formInputs';

export const PTEntry = () => {
  const [formData, setFormData] = useState({
    entryType: 'Manual',
    ptMachineNo: '',
    ptBarcode: '',
    bobbinType: '',
    operator: '',
    shiftIncharge: '',
    ptLength: '',
    drawBarcodeId: '',
    drawTowerNo: '',
    ptId: '',
    cummulativeLength: '',
    spoolId: '',
    startDate: '2024-05-31',
    ptBreak: '',
    breakReason: '',
    drawnLen: ''
  });

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="bg-[#f4f7f9] min-h-screen flex flex-col font-sans text-slate-800">
      {/* Top Header & Action Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap justify-between items-center sticky top-0 z-10 shadow-sm gap-4">
        <h1 className="text-xl font-black text-slate-800 tracking-tighter">PT ENTRY</h1>
        
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 transition-all shadow-sm">
            <Send size={14} /> Submit
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 transition-all shadow-sm">
            <Home size={14} /> Home
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Main Parameters Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
            <FormField 
              label="Entry Type" 
              type="select" 
              options={['Manual', 'Auto']} 
              value={formData.entryType} 
              onChange={handleInputChange('entryType')}
            />
            <FormField 
              label="PT Machine No." 
              type="select" 
              options={['MC-01', 'MC-02', 'MC-03']} 
              value={formData.ptMachineNo}
              onChange={handleInputChange('ptMachineNo')}
            />
            <FormField 
              label="PT Barcode" 
              placeholder="Scan or enter barcode" 
              value={formData.ptBarcode}
              onChange={handleInputChange('ptBarcode')}
            />
            <FormField 
              label="Bobbin Type" 
              type="select" 
              options={['50.4', '100.2', '25.2']} 
              value={formData.bobbinType}
              onChange={handleInputChange('bobbinType')}
            />
            
            <FormField 
              label="Operator" 
              type="select" 
              options={['Operator 1', 'Operator 2']}
              value={formData.operator}
              onChange={handleInputChange('operator')}
            />
            <FormField 
              label="Shift Incharge" 
              type="select" 
              options={['Supervisor A', 'Supervisor B']}
              value={formData.shiftIncharge}
              onChange={handleInputChange('shiftIncharge')}
            />
            <FormField 
              label="PT length (m)" 
              value={formData.ptLength}
              onChange={handleInputChange('ptLength')}
            />
            <FormField 
              label="Draw Barcode ID" 
              value={formData.drawBarcodeId}
              onChange={handleInputChange('drawBarcodeId')}
            />
            
            <FormField 
              label="Draw Tower No." 
              value={formData.drawTowerNo}
              onChange={handleInputChange('drawTowerNo')}
            />
            <FormField 
              label="PT ID" 
              value={formData.ptId}
              onChange={handleInputChange('ptId')}
            />
            <FormField 
              label="Cummulative Length (KM)" 
              value={formData.cummulativeLength}
              onChange={handleInputChange('cummulativeLength')}
            />
            <FormField 
              label="Spool ID" 
              value={formData.spoolId}
              onChange={handleInputChange('spoolId')}
            />
            
            <FormField 
              label="Start Date" 
              type="date" 
              value={formData.startDate} 
              onChange={handleInputChange('startDate')}
            />
            <FormField 
              label="PT Break" 
              type="select" 
              options={['Yes', 'No']} 
              value={formData.ptBreak}
              onChange={handleInputChange('ptBreak')}
            />
            <FormField 
              label="Break Reason" 
              type="select" 
              options={['Tension Issue', 'Material Flaw', 'Machine Stop']} 
              value={formData.breakReason}
              onChange={handleInputChange('breakReason')}
            />
            <FormField 
              label="Drawn Len" 
              value={formData.drawnLen}
              onChange={handleInputChange('drawnLen')}
            />
          </div>
        </div>

        {/* Tables Split View */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* PT Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                PT LOG
              </h3>
            </div>
            <div className="overflow-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white text-[10px] text-slate-400 uppercase font-bold sticky top-0">
                  <tr>
                    <th className="px-5 py-3 border-b">Type</th>
                    <th className="px-5 py-3 border-b">PTID</th>
                    <th className="px-5 py-3 border-b">Barcode</th>
                    <th className="px-5 py-3 border-b">Length</th>
                    <th className="px-5 py-3 border-b">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td colSpan="5" className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <FileText size={32} strokeWidth={1} />
                        <span className="text-xs font-medium">No log entries recorded for this session</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Draw Flaws Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                DRAW FLAWS DETAILS
              </h3>
            </div>
            <div className="overflow-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white text-[10px] text-slate-400 uppercase font-bold sticky top-0">
                  <tr>
                    <th className="px-5 py-3 border-b">Position</th>
                    <th className="px-5 py-3 border-b">Flaw Reason</th>
                    <th className="px-5 py-3 border-b">Identifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td colSpan="3" className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <Search size={32} strokeWidth={1} />
                        <span className="text-xs font-medium">No flaw data fetched</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTEntry;