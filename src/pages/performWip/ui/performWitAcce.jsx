import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ChevronDown, 
  Plus, 
  ClipboardList,
  History,
  X,
  Save,
  Grid,
  List,
  Keyboard
} from 'lucide-react';

const PerformWipAcceptance = () => {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'bulk'
  const [selectedPreform, setSelectedPreform] = useState(null);
  const entryFormRef = useRef(null);
  
  const [wipData] = useState([
    { id: 'TEF524220', weight: 54.041, batch: 'B-9921', type: 'Accepted' },
    { id: 'TEF524195', weight: 55.952, batch: 'B-8832', type: 'Accepted' },
    { id: 'TEF524194', weight: 60.997, batch: 'B-7710', type: 'Accepted' },
    { id: 'TEF524180', weight: 52.320, batch: 'B-6605', type: 'Accepted' },
  ]);

  const [allocations] = useState([
    { date: '31-05-2024', dtNo: 'DT10', preformId: 'TEF524220', weight: 54.041, consumed: 8.470, unit: 'KG', seq: '1' },
    { date: '31-05-2024', dtNo: 'DT03', preformId: 'TEF524195', weight: 55.952, consumed: 32.309, unit: 'KG', seq: '2' },
    { date: '30-05-2024', dtNo: 'DT01', preformId: 'TEF524194', weight: 60.997, consumed: 27.591, unit: 'KG', seq: '1' },
  ]);

  const handleSelectPreform = (item) => {
    setSelectedPreform(item);
    // Smooth scroll to the entry form after selection
    setTimeout(() => {
      entryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClearForm = () => {
    setSelectedPreform(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-800">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Preform Tower Management</h1>
          <p className="text-sm text-slate-500">Track and allocate preform stock to tower lines</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView(view === 'dashboard' ? 'bulk' : 'dashboard')}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm"
          >
            {view === 'dashboard' ? <Grid size={16} /> : <List size={16} />}
            {view === 'dashboard' ? 'Preform Acceptance Entry' : 'Back to Dashboard'}
          </button>
          <button className="flex items-center gap-2 rounded bg-white border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition">
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      {view === 'dashboard' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT SIDE: Preform WIP */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2 text-slate-700">
                  <ClipboardList size={20} className="text-blue-600" /> Preform WIP
                </h2>
                <button className="text-xs font-semibold bg-green-600 text-white px-4 py-1.5 rounded-full hover:bg-green-700 transition shadow-sm">
                  Get Preform List
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4 max-w-sm">
                  <label className="text-sm font-semibold text-slate-600">Type:</label>
                  <select className="flex-1 rounded-lg border border-slate-300 p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Accepted Preform WIP</option>
                    <option>Rejected Preform WIP</option>
                  </select>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Select</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Preform ID</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 text-right">Weight (KG)</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Vendor Batch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {wipData.map((item) => (
                        <tr key={item.id} className={`hover:bg-blue-50/50 transition-colors group ${selectedPreform?.id === item.id ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-3">
                            <button 
                              onClick={() => handleSelectPreform(item)}
                              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm ${selectedPreform?.id === item.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}
                            >
                              <Plus size={16} />
                            </button>
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-800">{item.id}</td>
                          <td className="px-4 py-3 text-right font-mono">{item.weight.toFixed(3)}</td>
                          <td className="px-4 py-3 text-slate-500">{item.batch}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* RIGHT SIDE: Allocation List */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-4 border-b">
                <h2 className="font-bold flex items-center gap-2 text-slate-700">
                  <History size={20} className="text-blue-600" /> Recent Allocations
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Tower (DT)</th>
                      <th className="px-4 py-4">Preform ID</th>
                      <th className="px-4 py-4 text-right">Cons. Weight</th>
                      <th className="px-4 py-4 text-center">Seq</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allocations.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.date}</td>
                        <td className="px-4 py-3 font-medium">{row.dtNo}</td>
                        <td className="px-4 py-3 font-semibold text-blue-700">{row.preformId}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">
                            {row.consumed.toFixed(3)} {row.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">#{row.seq}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* BOTTOM SECTION: Inline Allocation Entry Form */}
          {selectedPreform && (
            <section 
              ref={entryFormRef}
              className="bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden animate-in slide-in-from-bottom duration-300"
            >
              {/* Form Header */}
              <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-700 p-2 rounded-lg">
                    <Keyboard size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Quick Allocation Entry</h2>
                    <p className="text-blue-200 text-xs">Assigning parameters for Preform: <span className="font-bold text-white underline underline-offset-2">{selectedPreform.id}</span></p>
                  </div>
                </div>
                <button onClick={handleClearForm} className="text-blue-200 hover:text-white p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b pb-2 mb-2">Technical Info</h3>
                    <FormField label="Entry Date" type="text" defaultValue="31-May-2024" />
                    <FormSelect label="DT No." options={['Select Line', 'DT01', 'DT02', 'DT03', 'DT10']} />
                    <FormSelect label="Shift" options={['Select', 'Shift A', 'Shift B', 'Shift C']} />
                    <FormField label="Pref. Seq" type="text" placeholder="Seq" />
                    <FormSelect label="Loaded By" options={['Select Name', 'Operator 1', 'Operator 2']} />
                    
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-xl">
                      <FormField label="Selected ID" type="text" value={selectedPreform.id} readOnly className="bg-white font-bold text-blue-700" />
                      <FormField label="WIP Weight" type="text" value={`${selectedPreform.weight} KG`} readOnly className="bg-white" />
                    </div>
                  </div>

                  {/* Right Column (Parameters) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider border-b pb-2 mb-2">Diameter Specs (MM)</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      {[...Array(10)].map((_, i) => (
                        <ParamField key={i} label={`Dia ${i + 1}`} />
                      ))}
                      <ParamField label="Cone L" />
                      <ParamField label="Avg Dia" />
                    </div>
                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Notes / Remarks</label>
                      <textarea className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-16 shadow-inner" placeholder="Optional remark..."></textarea>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end items-center gap-4">
                  <p className="text-xs text-slate-400 italic mr-auto font-medium">* Ensure all parameters match physical measurements before saving.</p>
                  <button onClick={handleClearForm} className="px-6 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                  <button onClick={() => { alert('Allocation Saved!'); handleClearForm(); }} className="flex items-center gap-2 px-10 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform active:scale-95">
                    <Save size={18} /> Submit Entry
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      ) : (
        <BulkEntryTable />
      )}
    </div>
  );
};

// COMPONENT: Bulk Entry Table
const BulkEntryTable = () => {
  const [rows] = useState(Array(10).fill({}));
  const headers = [
    "SELECT", "PREFORM ID", "MATERIAL", "PREFORM USABLE WEIGHT", 
    "PREFORM USABLE LENGTH", "DIA", "MAX DIA", "MIN DIA", "ATL DIA VAR", 
    "DIA 1", "DIA 2", "DIA 3", "DIA 4", "DIA 5", "DIA 6", "DIA 7", "DIA 8", "DIA 9", "DIA 10", "CONE LEN"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center shrink-0">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
          <Grid size={22} className="text-blue-600" /> Preform Acceptance Entry
        </h2>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2">
            <Save size={16} /> Save All Rows
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed min-w-[2000px]">
          <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-300">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className={`px-2 py-3 text-[10px] font-bold text-slate-600 uppercase border-r border-slate-200 last:border-r-0 ${i === 0 ? 'w-16' : 'w-32'}`}>
                  <div className="text-center">{header}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-2 border-r border-slate-100"><div className="flex justify-center"><input type="checkbox" className="w-4 h-4" /></div></td>
                {Array(19).fill(0).map((__, colIndex) => (
                  <td key={colIndex} className="px-1 py-1 border-r border-slate-100"><input type="text" className="w-full px-2 py-1.5 text-xs text-center border rounded-md outline-none" placeholder="-" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper Components
const FormField = ({ label, type, ...props }) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
    <input 
      type={type} 
      className={`col-span-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 outline-none transition-all shadow-sm ${props.className || ''}`}
      {...props}
    />
  </div>
);

const FormSelect = ({ label, options }) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
    <div className="relative col-span-2">
      <select className="w-full appearance-none rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 outline-none bg-white shadow-sm transition-all">
        {options.map((opt, i) => <option key={i}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
    </div>
  </div>
);

const ParamField = ({ label }) => (
  <div className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-b-0">
    <label className="text-[10px] font-semibold text-slate-600 w-12">{label}</label>
    <input type="text" className="w-16 rounded border border-slate-200 bg-slate-50 px-1 py-1 text-center text-xs outline-none" placeholder="Val" />
    <input type="text" className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all shadow-sm" placeholder="Entry" />
  </div>
);

export default PerformWipAcceptance;