import React, { useState } from 'react';
import { 
  Pipette, 
  Save, 
  RotateCcw, 
  Clock, 
  Thermometer, 
  Droplets, 
  History, 
  Send,
  CheckCircle,
  Calendar
} from 'lucide-react';

const H2Ageing = () => {
  const [activeTab, setActiveTab] = useState('before');
  const [formData, setFormData] = useState({
    tankNo: '',
    cycleHrs: '',
    barcodeId: '',
    h2BatchId: '',
    length: '',
    attn1310: '',
    attn1383: '',
    attn1550: '',
    before: { date: '2024-05-31', time: '', a1240: '', a1310: '', a1383: '', a1550: '' },
    after: { date: '2024-05-31', time: '', a1240: '', a1310: '', a1383: '', a1550: '' },
    after14: { date: '2024-05-31', time: '', a1240: '', a1310: '', a1383: '', a1550: '' }
  });

  const handleInputChange = (section, field, value) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const tabs = [
    { id: 'before', label: 'Before H2 Ageing', icon: <Clock size={14} />, color: 'bg-slate-800' },
    { id: 'after', label: 'After H2 Ageing', icon: <Thermometer size={14} />, color: 'bg-emerald-700' },
    { id: 'after14', label: 'After 14 Days', icon: <Calendar size={14} />, color: 'bg-indigo-800' }
  ];

  const InputField = ({ label, type = "text", placeholder = "", value, onChange, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="text-[12px] border border-slate-300 rounded px-2 bg-white focus:ring-1 focus:ring-blue-500 outline-none h-8 transition-all"
        value={value}
        onChange={onChange}
      />
    </div>
  );

  const SelectField = ({ label, options = [], value, onChange, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
      <select 
        className="text-[12px] border border-slate-300 rounded px-2 bg-white focus:ring-1 focus:ring-blue-500 outline-none h-8 transition-all appearance-none"
        value={value}
        onChange={onChange}
      >
        <option value="">Select</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 bg-slate-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-blue-600">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Pipette size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">H2 Ageing Module</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Process Control & Attenuation Analysis</p>
            </div>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-500 text-[10px] font-bold rounded uppercase hover:bg-slate-50 transition-all">
               <RotateCcw size={12} /> Reset
             </button>
          </div>
        </div>

        {/* Primary Data Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <SelectField label="Tank No" options={["Tank 01", "Tank 02", "Tank 03", "Tank 04"]} value={formData.tankNo} onChange={(e) => handleInputChange('root', 'tankNo', e.target.value)} />
          <SelectField label="Cycle Hrs" options={["24 Hrs", "48 Hrs", "72 Hrs"]} value={formData.cycleHrs} onChange={(e) => handleInputChange('root', 'cycleHrs', e.target.value)} />
          <InputField label="Barcode ID" placeholder="Scan..." value={formData.barcodeId} onChange={(e) => handleInputChange('root', 'barcodeId', e.target.value)} />
          <InputField label="H2 Batch ID" placeholder="Batch..." value={formData.h2BatchId} onChange={(e) => handleInputChange('root', 'h2BatchId', e.target.value)} />
          <InputField label="Length (m)" value={formData.length} onChange={(e) => handleInputChange('root', 'length', e.target.value)} />
          <InputField label="Attn 1310" value={formData.attn1310} onChange={(e) => handleInputChange('root', 'attn1310', e.target.value)} />
          <InputField label="Attn 1383" value={formData.attn1383} onChange={(e) => handleInputChange('root', 'attn1383', e.target.value)} />
          <InputField label="Attn 1550" value={formData.attn1550} onChange={(e) => handleInputChange('root', 'attn1550', e.target.value)} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 bg-slate-200 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-tight transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-300/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Stage Content */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden min-h-[300px] flex flex-col">
        {/* Stage Header Overlay */}
        <div className={`${tabs.find(t => t.id === activeTab).color} text-white px-6 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {tabs.find(t => t.id === activeTab).icon}
            <span className="text-xs font-black uppercase tracking-widest">Stage Entry: {tabs.find(t => t.id === activeTab).label}</span>
          </div>
          <div className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase">Step {activeTab === 'before' ? '1' : activeTab === 'after' ? '2' : '3'} of 3</div>
        </div>

        <div className="p-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Date/Time Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Timing Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField 
                  label="Date" 
                  type="date" 
                  value={formData[activeTab].date} 
                  onChange={(e) => handleInputChange(activeTab, 'date', e.target.value)}
                />
                <InputField 
                  label="Time" 
                  placeholder="HH:MM" 
                  value={formData[activeTab].time} 
                  onChange={(e) => handleInputChange(activeTab, 'time', e.target.value)}
                />
              </div>
            </div>

            {/* Measurements Section */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Attenuation Measurements (dB/km)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputField 
                  label="Attn @ 1240" 
                  value={formData[activeTab].a1240} 
                  onChange={(e) => handleInputChange(activeTab, 'a1240', e.target.value)}
                />
                <InputField 
                  label="Attn @ 1310" 
                  value={formData[activeTab].a1310} 
                  onChange={(e) => handleInputChange(activeTab, 'a1310', e.target.value)}
                />
                <InputField 
                  label="Attn @ 1383" 
                  value={formData[activeTab].a1383} 
                  onChange={(e) => handleInputChange(activeTab, 'a1383', e.target.value)}
                />
                <InputField 
                  label="Attn @ 1550" 
                  value={formData[activeTab].a1550} 
                  onChange={(e) => handleInputChange(activeTab, 'a1550', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions for Tab */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end gap-3">
          {activeTab === 'before' && (
            <button className="flex items-center gap-2 px-8 py-2.5 bg-slate-800 text-white text-[11px] font-black uppercase rounded-lg hover:bg-black transition-all shadow-lg shadow-slate-200">
              <Send size={14} /> Issue for H2 Ageing
            </button>
          )}
          {activeTab === 'after' && (
            <button className="flex items-center gap-2 px-8 py-2.5 bg-emerald-700 text-white text-[11px] font-black uppercase rounded-lg hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-100">
              <History size={14} /> Receive From H2
            </button>
          )}
          {activeTab === 'after14' && (
            <button className="flex items-center gap-2 px-8 py-2.5 bg-indigo-700 text-white text-[11px] font-black uppercase rounded-lg hover:bg-indigo-800 transition-all shadow-lg shadow-indigo-100">
              <CheckCircle size={14} /> Final Lab Submit
            </button>
          )}
        </div>
      </div>

      {/* Draft Footer */}
      <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-dashed border-slate-300">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">System Online</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter border-l pl-4">Last Saved: 10:15 AM</span>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-300 text-slate-700 text-[11px] font-black uppercase rounded-lg hover:bg-slate-50 transition-all">
          <Save size={14} /> Save Progress
        </button>
      </div>
    </div>
  );
};

export default H2Ageing;