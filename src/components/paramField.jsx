const ParamField = ({ label }) => (
  <div className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-b-0">
    <label className="text-[10px] font-semibold text-slate-600 w-12">{label}</label>
    <input type="text" className="w-16 rounded border border-slate-200 bg-slate-50 px-1 py-1 text-center text-xs outline-none" placeholder="Val" />
    <input type="text" className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-center text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all shadow-sm" placeholder="Entry" />
  </div>
);

export default ParamField