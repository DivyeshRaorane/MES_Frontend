import React from 'react';
import { 
  BarChart3, 
  RotateCw, 
  Dumbbell, 
  CheckCircle2, 
  Home, 
  RotateCcw, 
  Save, 
  Send 
} from 'lucide-react';
import FormField from '../../../components/formInputs';

const ShortTermEntry = () => {
  // Helper for generating the SR NO columns
  const renderValueInputs = (count, label) => (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-16 flex flex-col gap-1">
            <span className="text-[10px] text-center font-bold text-slate-400 bg-slate-50 py-1 rounded">
              {i + 1}
            </span>
            <FormField placeholder={label} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-6 bg-slate-50 min-h-screen">
      
      {/* 1. Global Header & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <BarChart3 size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Short Term Entry</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all"><Save size={14}/> SAVE</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all"><Send size={14}/> SUBMIT</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all">MODIFY</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"><RotateCcw size={14}/> RESET</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-all"><Home size={14}/> HOME</button>
        </div>
      </div>

      {/* 2. Main Metadata Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <FormField label="RELA ID" />
        <FormField label="Torsion" type="select" options={["Select 1", "Select 2"]} />
        <FormField label="Draw ID" />
        <FormField label="Draw Date" type="date" />
        <FormField label="Tower No" />
        <FormField label="Spool ID" />
        <FormField label="Preform ID" />
      </div>

      {/* 3. Twist Test Card */}
      <div className="bg-white p-6 rounded-2xl border-l-4 border-l-sky-500 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <RotateCw className="text-sky-600" size={18} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Twist Test</h3>
          </div>
          <div className="flex gap-4">
            <div className="w-40"><FormField label="Testing Date" type="date" /></div>
            <div className="w-40"><FormField label="Operator" type="select" options={["Op 1", "Op 2"]} /></div>
            <button className="self-end bg-blue-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-blue-700 uppercase">Draw Chart</button>
          </div>
        </div>
        <FormField label="Remarks" placeholder="Enter twist observations..." />
        <div className="pt-2">
          <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Twist Count (SR 1-19)</span>
          {renderValueInputs(19, "Count")}
        </div>
      </div>

      {/* 4. Tensile Test Cards (Reusable Style) */}
      {[
        { title: "Tensile Test", color: "border-l-indigo-500", icon: <Dumbbell className="text-indigo-600" size={18}/>, count: 19 },
        { title: "Tensile Test 0.5 mtr", color: "border-l-violet-500", icon: <Dumbbell className="text-violet-600" size={18}/>, count: 5 },
        { title: "Tensile Test 20", color: "border-l-purple-500", icon: <Dumbbell className="text-purple-600" size={18}/>, count: 19 }
      ].map((test, idx) => (
        <div key={idx} className={`bg-white p-6 rounded-2xl border-l-4 ${test.color} border border-slate-200 shadow-sm space-y-4`}>
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              {test.icon}
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{test.title}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <FormField label="Testing Date" type="date" />
              <FormField label="Operator" type="select" options={["Op 1", "Op 2"]} />
              <FormField label="Median" disabled />
              <FormField label="Result" type="select" options={["Pass", "Fail"]} />
            </div>
          </div>
          <FormField label="Remarks" />
          <div className="pt-2">
            <span className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Value Readings</span>
            {renderValueInputs(test.count, "Value")}
          </div>
        </div>
      ))}

      {/* 5. Final Confirmation */}
      <div className="bg-slate-900 p-6 rounded-2xl flex justify-center shadow-xl">
        <div className="flex items-center gap-3 text-white">
          <CheckCircle2 className="text-emerald-400" size={24} />
          <span className="text-sm font-medium">Verify all technical readings before final submission</span>
        </div>
      </div>
    </div>
  );
};

export default ShortTermEntry;