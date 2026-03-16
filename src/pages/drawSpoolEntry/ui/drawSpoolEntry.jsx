import React, { useState } from 'react';
import { 
  Send, 
  Home, 
  ChevronDown, 
  Plus, 
  Monitor,
  User,
  Activity,
  Box,
  Settings,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DrwaSpoolEntry = () => {
const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('Coating');
  const [drawFlaws, setDrawFlaws] = useState([]);

  // Mock function to simulate getting data from a CSV file
  const handleGetDrawFlaws = () => {
    const mockCsvData = [
      { id: Date.now() + 1, preformId: 'TEF524', type: 'Bottom End', startPos: '0.0', endPos: '0.5', length: '0.5', isManual: false },
      { id: Date.now() + 2, preformId: 'TEF524', type: 'Lumps', startPos: '12.4', endPos: '12.45', length: '0.05', isManual: false },
      { id: Date.now() + 3, preformId: 'TEF524', type: 'BFD', startPos: '45.2', endPos: '45.3', length: '0.1', isManual: false },
      { id: Date.now() + 4, preformId: 'TEF524', type: 'SCD', startPos: '88.1', endPos: '88.2', length: '0.1', isManual: false },
    ];
    setDrawFlaws([...drawFlaws, ...mockCsvData]);
  };

  // Function to add a blank manual entry row
  const handleAddManualRow = () => {
    const newRow = {
      id: Date.now(),
      preformId: '',
      type: 'Lumps', // Default type
      startPos: '0.0',
      endPos: '0.0',
      length: '0.0',
      isManual: true
    };
    setDrawFlaws([...drawFlaws, newRow]);
  };

  // Function to update manual row fields
  const updateManualField = (id, field, value) => {
    setDrawFlaws(drawFlaws.map(flaw => {
      if (flaw.id === id) {
        const updated = { ...flaw, [field]: value };
        // Auto-calculate length if start or end changes
        if (field === 'startPos' || field === 'endPos') {
          const s = parseFloat(updated.startPos) || 0;
          const e = parseFloat(updated.endPos) || 0;
          updated.length = (Math.abs(e - s)).toFixed(3);
        }
        return updated;
      }
      return flaw;
    }));
  };

  const removeFlaw = (id) => {
    setDrawFlaws(drawFlaws.filter(f => f.id !== id));
  };

  const renderConsumptionFields = () => {
    if (activeTab === 'Coating') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput label="Primary Pressure" />
          <FormInput label="Primary Cons(kg)" />
          <FormSelect label="Primary Coating" options={['Select']} />
          <FormInput label="Primary Batch" />
          <FormInput label="Secondary Pressure" />
          <FormInput label="Secondary Cons(kg)" />
          <FormSelect label="Secondary Coating" options={['Select']} />
          <FormInput label="Secondary Batch" />
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput label="Gas Cons (M³)" placeholder="Enter cubic meter value" />
          <FormInput label="Flow Rate" placeholder="Optional" />
          <FormInput label="Line Pressure" />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-slate-800 font-sans p-4">
      {/* Top Action Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm mb-4 sticky top-0 z-50 rounded-lg">
        <h1 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <Monitor size={20} className="text-blue-600" /> DRAW SPOOL ENTRY
        </h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-6 py-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition shadow-sm">
            <Send size={14} /> Submit
          </button>
          <button onClick={()=>navigate('/dashboard')} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition shadow-sm">
            <Home size={14} /> Home
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* 1. Initial Parameters */}
        <Section title="Initial Parameters" icon={<Settings size={16}/>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-3">
            <FormSelect label="Tower No." options={['Select', 'Tower 1', 'Tower 2']} />
            <FormSelect label="Preform ID" options={['Select', 'TEF524', 'TEF525']} />
            <FormSelect label="Shift" options={['Select', 'A', 'B', 'C']} />
            <FormInput label="Draw Barcode ID" />
            <FormInput label="Drawn Len(KM)" defaultValue="0" />
            <FormInput label="Cumm Len(KM)" defaultValue="0" />
            <FormInput label="Start Date" type="date" defaultValue="2024-05-31" />
            <FormInput label="Start Time" type="time" />
            <FormInput label="Spool ID" />
            <FormInput label="Preform Wt(KG)" defaultValue="0" />
            <FormInput label="Drawn Wt(KG)" defaultValue="0" />
            <FormInput label="Theoritical Len(KM)" defaultValue="0" />
            <FormInput label="End Date" type="date" defaultValue="2024-05-31" />
            <FormInput label="End Time" type="time" />
            <FormInput label="Piece No." />
            <FormInput label="Preform Type" readOnly />
            <FormInput label="Adjust KM" defaultValue="0.15" />
            <FormInput label="Product Type" readOnly />
          </div>
        </Section>

        {/* 2. Draw Parameters */}
        <Section title="Draw Parameters" icon={<Activity size={16}/>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-3">
            <FormInput label="Line Speed" defaultValue="0" />
            <FormInput label="Bot End Scrap" />
            <FormInput label="Draw Seq." />
            <FormInput label="Power" defaultValue="0" />
            <FormInput label="Bare Fiber Tension" defaultValue="0" />
            <FormSelect label="Die No" options={['Select', 'D1', 'D2']} />
            <FormSelect label="Die Cleaned" options={['Select', 'Yes', 'No']} />
            <FormSelect label="FSU" options={['Select', 'Yes', 'No']} />
            <FormInput label="Temp" defaultValue="0" />
            <FormInput label="Humidity" defaultValue="0" />
            <FormSelect label="Undrawn" options={['Select', 'Yes', 'No']} />
            <FormSelect label="Wind/Spool Cndtn" options={['Select', 'Good', 'Bad']} />
            <FormInput label="Spool Condition" />
            <FlawSelect label="Draw Break" options={['None', 'Process', 'Material']} />
            <FormSelect label="Spool End Type" options={['Select', 'Flat', 'Tapered']} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
            <FormInput label="Remarks" placeholder="Enter remarks..." />
            <FormInput label="Manual Entry Reason" placeholder="Reason if applicable..." />
          </div>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Section title="Operator Details" icon={<User size={16}/>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <FormSelect label="Shift Inc." options={['Please Select']} />
                <FormSelect label="Process Opr." options={['Please Select']} />
                <FormSelect label="Furnace Opr." options={['Please Select']} />
                <FormSelect label="Die Opr." options={['Please Select']} />
                <FormSelect label="Rumpup Opr." options={['Please Select']} />
                <FormSelect label="Spool End Opr." options={['Please Select']} />
              </div>
            </Section>
          </div>

          <div className="lg:col-span-1">
            <Section title="Draw Flaws Details" icon={<Activity size={16}/>}>
              <div className="flex justify-end gap-2 mb-2">
                <button 
                  onClick={handleGetDrawFlaws}
                  className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-sm hover:bg-blue-700 transition"
                >
                  Get Draw Flaws
                </button>
                <button 
                  onClick={handleAddManualRow}
                  className="bg-cyan-500 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 shadow-sm hover:bg-cyan-600 transition"
                >
                  <Plus size={10}/> Add Rows
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-md">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-slate-50 sticky top-0 border-b">
                    <tr className="text-slate-500 font-bold uppercase">
                      <th className="p-1.5 w-20">ID</th>
                      <th className="p-1.5">Type</th>
                      <th className="p-1.5 w-16">Start</th>
                      <th className="p-1.5 w-16">End</th>
                      <th className="p-1.5 w-16">Len</th>
                      <th className="p-1.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drawFlaws.length > 0 ? (
                      drawFlaws.map((flaw) => (
                        <tr key={flaw.id} className={`${flaw.isManual ? 'bg-amber-50/30' : 'hover:bg-blue-50/50'} transition-colors`}>
                          <td className="p-1.5">
                            {flaw.isManual ? (
                              <input 
                                className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-blue-400" 
                                value={flaw.preformId}
                                onChange={(e) => updateManualField(flaw.id, 'preformId', e.target.value)}
                                placeholder="ID"
                              />
                            ) : (
                              <span className="font-medium text-blue-700">{flaw.preformId}</span>
                            )}
                          </td>
                          <td className="p-1.5">
                            {flaw.isManual ? (
                              <select 
                                className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-blue-400"
                                value={flaw.type}
                                onChange={(e) => updateManualField(flaw.id, 'type', e.target.value)}
                              >
                                {['Bottom End', 'Lumps', 'BFD', 'SCD'].map(t => <option key={t}>{t}</option>)}
                              </select>
                            ) : (
                              flaw.type
                            )}
                          </td>
                          <td className="p-1.5 font-mono">
                            {flaw.isManual ? (
                              <input 
                                className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-blue-400" 
                                type="number" step="0.01"
                                value={flaw.startPos}
                                onChange={(e) => updateManualField(flaw.id, 'startPos', e.target.value)}
                              />
                            ) : (
                              flaw.startPos
                            )}
                          </td>
                          <td className="p-1.5 font-mono">
                            {flaw.isManual ? (
                              <input 
                                className="w-full bg-white border border-slate-200 rounded px-1 py-0.5 outline-none focus:border-blue-400" 
                                type="number" step="0.01"
                                value={flaw.endPos}
                                onChange={(e) => updateManualField(flaw.id, 'endPos', e.target.value)}
                              />
                            ) : (
                              flaw.endPos
                            )}
                          </td>
                          <td className="p-1.5 font-mono font-bold text-slate-700">
                            {flaw.length}
                          </td>
                          <td className="p-1.5 text-center">
                            <button onClick={() => removeFlaw(flaw.id)} className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-400 italic">
                          No flaws recorded. Fetch data or add rows manually.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>

        {/* 5. Consumption Details */}
        <Section title="Consumption Details" icon={<Box size={16}/>}>
          <div className="flex border-b mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {['Coating', 'Furnace Gas', 'Nitrogen Gas', 'Helium Gas', 'CO2 Gas'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:text-blue-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-2">
            {renderConsumptionFields()}
          </div>
        </Section>

        {/* 6. Fiber Details */}
        <Section title="Fiber Details" icon={<Activity size={16}/>}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
            <FormSelect label="Spool Results" options={['Select']} />
            <FormInput label="Clad Dia" />
            <FormInput label="Clad Oval" />
            <FormInput label="SCD" />
            <FormInput label="SCC" />
            <FormInput label="PCD" />
            <FormInput label="Cut off" />
            <FormInput label="Mfd" />
            <FormInput label="CCC" />
            <FormInput label="Curl" />
            <FormInput label="PCC" />
            <FormInput label="ZD" />
          </div>
        </Section>

        {/* 7. Order Details */}
        <Section title="Order Details" icon={<Box size={16}/>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
            <FormInput label="Plant" readOnly />
            <FormInput label="Production Order" readOnly />
            <FormInput label="Order Quantity" readOnly />
            <FormInput label="Material Code" readOnly />
            <FormInput label="Material Desc" className="col-span-1 md:col-span-2 lg:col-span-1" readOnly />
            <FormInput label="Work Center" readOnly />
            <FormInput label="Operation" readOnly />
            <FormInput label="PreForm MaterialName" readOnly />
          </div>
        </Section>
      </div>
    </div>
  );
};

// Sub-components
const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors">
      <h2 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2 tracking-wide">
        {icon} {title}
      </h2>
      <ChevronDown size={14} className="text-slate-400" />
    </div>
    <div className="p-4 bg-white">
      {children}
    </div>
  </div>
);

const FormInput = ({ label, className = "", ...props }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
    <input 
      {...props}
      className={`border border-slate-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm ${props.readOnly ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white'}`}
    />
  </div>
);

const FormSelect = ({ label, options, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
    <div className="relative">
      <select className="w-full appearance-none border border-slate-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm transition-all pr-8 cursor-pointer">
        {options.map((opt, i) => <option key={i}>{opt}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const FlawSelect = ({ label, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
    <div className="relative">
      <select className="w-full appearance-none border border-slate-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm transition-all pr-8 cursor-pointer">
        <option>Select</option>
        {options.map((opt, i) => <option key={i}>{opt}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

export default DrwaSpoolEntry;