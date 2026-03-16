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

export default FormSelect