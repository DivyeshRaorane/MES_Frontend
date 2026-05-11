import React from "react";
import { Field } from "formik";
import { ChevronDown } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   ModuleCard
   compact={true}  → tighter header padding + smaller title
   ───────────────────────────────────────────────────────────── */
export const ModuleCard = ({ title, icon, children, compact = false }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
    <div className={`bg-slate-50/80 border-b border-slate-200 flex items-center gap-2 ${compact ? 'px-3 py-1.5' : 'px-5 py-3'}`}>
      {icon}
      <h2 className={`font-bold text-slate-700 uppercase tracking-wider ${compact ? 'text-[9px]' : 'text-xs'}`}>{title}</h2>
    </div>
    <div className={`flex-1 bg-white ${compact ? 'p-3' : 'p-5'}`}>
      {children}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   FormikInput
   compact={true}  → py-1.5, text-xs, text-[9px] label
   readOnly        → grey background, no focus ring
   ───────────────────────────────────────────────────────────── */
export const FormikInput = ({ label, name, type = "text", compact = false, readOnly = false, className = "", ...props }) => (
  <div className="flex flex-col gap-0.5">
    {label && (
      <label className={`font-bold text-slate-500 uppercase ml-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </label>
    )}
    <Field
      name={name}
      type={type}
      readOnly={readOnly}
      className={`w-full border border-slate-200 outline-none transition-all
        ${compact ? 'rounded px-2 py-1.5 text-xs' : 'rounded-sm px-3 py-2 text-sm'}
        ${readOnly
          ? 'bg-slate-200 text-slate-500 cursor-default'
          : 'bg-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}
        ${className}`}
      {...props}
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   FormikSelect
   compact={true}  → py-1.5, text-xs, text-[9px] label
   ───────────────────────────────────────────────────────────── */
export const FormikSelect = ({ label, name, options, compact = false, className = "", labelClassName = "" }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    {label && (
      <label className={`font-bold text-slate-500 uppercase ml-0.5 ${labelClassName} ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </label>
    )}
    <div className="relative">
      <Field
        as="select"
        name={name}
        className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all cursor-pointer
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Field>
      <ChevronDown
        size={compact ? 12 : 14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   FormikTextarea
   compact={true}  → text-xs, text-[9px] label, smaller padding
   ───────────────────────────────────────────────────────────── */
export const FormikTextarea = ({ label, name, rows = 3, placeholder = "", compact = false, className = "" }) => (
  <div className="flex flex-col gap-0.5 h-full">
    {label && (
      <label className={`font-bold text-slate-500 uppercase ml-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </label>
    )}
    <Field
      as="textarea"
      name={name}
      rows={rows}
      placeholder={placeholder}
      className={`w-full bg-slate-50 border border-slate-200 outline-none transition-all resize-none
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        ${compact ? 'rounded px-2 py-1.5 text-xs' : 'rounded-sm px-3 py-2 text-sm'}
        ${className}`}
    />
  </div>
);
