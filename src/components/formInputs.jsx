import {
  ChevronDown,
} from 'lucide-react';

const FormField = ({ label, type = "text", placeholder = "", value, onChange, options = [] }) => {
  // Use a no-op function if onChange is not provided to avoid React warnings
  const handleChange = onChange || (() => {});
  
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate">{label}</label>
      {type === "select" ? (
        <div className="relative">
          <select 
            className="w-full text-xs border border-slate-300 rounded px-2 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
            value={value || ""}
            onChange={handleChange}
          >
            <option value="">--Please Select--</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
      ) : (
        <input 
          type={type}
          placeholder={placeholder}
          className="text-xs border border-slate-300 rounded px-2 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white placeholder:text-slate-500"
          value={value || ""}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default FormField