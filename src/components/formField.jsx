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

export default FormField