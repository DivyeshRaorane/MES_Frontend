import React from "react";
import { Field } from "formik";
import { ChevronDown } from "lucide-react";


export const ModuleCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
    <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
      {icon}
      <h2 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{title}</h2>
    </div>
    <div className="p-5 flex-1 bg-white">
      {children}
    </div>
  </div>
);

export const FormikInput = ({ label, name, type = "text", ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <Field
      name={name}
      type={type}
      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
      {...props}
    />
  </div>
);

export const FormikSelect = ({ label, name, options, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <div className="relative">
      <Field
        as="select"
        name={name}
        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Field>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);
