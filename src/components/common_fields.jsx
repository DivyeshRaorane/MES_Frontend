import React, { useRef, useState, useEffect } from "react";
import { Field } from "formik";
import { ChevronDown, X } from "lucide-react";

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
// export const FormikInput = ({ label, name, type = "text", compact = false, readOnly = false, className = "",error, touched, ...props }) => (
//   <div className="flex flex-col gap-0.5">
//     {label && (
//       <label className={`font-bold text-slate-800 uppercase ml-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
//         {label}
//       </label>
//     )}
//     <Field
//       name={name}
//       type={type}
//       readOnly={readOnly}
//       className={`w-full border border-slate-200 outline-none transition-all
//         ${compact ? 'rounded px-2 py-1.5 text-xs' : 'rounded-sm px-3 py-2 text-sm'}
//         ${readOnly
//           ? 'bg-slate-200 text-slate-500 cursor-default'
//           : error && touched
//       ? 'bg-slate-100 border-red-500 focus:ring-2 focus:ring-red-200 focus:border-red-500'
//       : 'bg-slate-100 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
//     }
//         ${className}`}
//       {...props}
//     />
//     {error && touched && (
//       <p className="text-red-500 text-[10px] mt-1">
//         {error}
//       </p>
//     )}
//   </div>
// );



export const FormikInput = ({
  label,
  name,
  type = "text",
  compact = false,
  readOnly = false,
  className = "",
  onChange: customOnChange,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-0.5">
      {label && (
        <label
          className={`font-bold text-slate-800 uppercase ml-0.5 ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
        >
          {label}
        </label>
      )}

      <Field name={name}>
        {({ field, meta }) => {
          const showError = meta.touched && meta.error;
          return (
            <>
              <input
                {...field}
                type={type}
                readOnly={readOnly}
                onChange={(e) => {
                  if (customOnChange) {
                    customOnChange(e);
                  } else {
                    field.onChange(e);
                  }
                }}
                className={`w-full border outline-none transition-all
                  ${compact ? "rounded px-2 py-1.5 text-xs" : "rounded-sm px-3 py-2 text-sm"}
                  ${readOnly
                    ? "bg-slate-200 text-slate-500 cursor-default"
                    : showError
                    ? "bg-slate-100 border-red-500 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                    : "bg-slate-100 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"}
                  ${className}`}
                {...props}
              />
              {showError && (
                <p className="text-red-500 text-[9px] mt-0.5">{meta.error}</p>
              )}
            </>
          );
        }}
      </Field>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   FormikSelect
   compact={true}  → py-1.5, text-xs, text-[9px] label
   ───────────────────────────────────────────────────────────── */
/*export const FormikSelect = ({ label, name, options, compact = false, className = "", labelClassName = "" }) => (
  <div className={`flex flex-col gap-0.5 ${className}`}>
    {label && (
      <label className={`font-bold text-slate-800 uppercase ml-0.5 ${labelClassName} ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
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
        {options.map((opt, index) => (
  <option key={opt.value ?? opt ?? index} value={opt.value ?? opt}>
    {opt.label ?? opt}
  </option>
))}
      </Field>
      <ChevronDown
        size={compact ? 12 : 14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
);*/

import { useField } from "formik";

export const FormikSelect = ({
  label,
  name,
  options,
  compact = false,
  className = "",
  labelClassName = "",
  onChange,
  disabled = false,
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && (
        <label className={`font-bold text-slate-800 uppercase ml-0.5 ${labelClassName} ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          {...field}
          disabled={disabled}
          value={field.value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            const parsed =
    val === ""
      ? null
      : isNaN(val)
        ? val
        : Number(val);

  helpers.setValue(parsed);


            if (onChange) {
      onChange(e); // <-- call parent handler
    }
          }}
          className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all cursor-pointer
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
        >
          <option value="">Select</option>

          {options.map((opt, index) => (
            <option
              key={opt.value ?? opt ?? index}
              value={opt.value ?? opt}
            >
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      </div>

      {meta.touched && meta.error && (
        <div className="text-red-500 text-[10px]">{meta.error}</div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   FormikMultiSelect
   Tag/checkbox style multi-select. Stores an ARRAY in Formik state.
   compact={true}  → py-1.5, text-xs, text-[9px] label
   options: [{ label, value }]
   ───────────────────────────────────────────────────────────── */
export const FormikMultiSelect = ({
  label,
  name,
  options = [],
  compact = false,
  className = "",
  labelClassName = "",
  placeholder = "Select",
  onChange,
  disabled = false,
}) => {
  const [field, meta, helpers] = useField(name);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = Array.isArray(field.value) ? field.value : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isChecked = (value) => selected.some((v) => String(v) === String(value));

  const toggleValue = (value) => {
    let next;
    if (isChecked(value)) {
      next = selected.filter((v) => String(v) !== String(value));
    } else {
      next = [...selected, value];
    }
    helpers.setValue(next);
    if (onChange) onChange(next);
  };

  const removeValue = (value, e) => {
    e.stopPropagation();
    const next = selected.filter((v) => String(v) !== String(value));
    helpers.setValue(next);
    if (onChange) onChange(next);
  };

  const selectedOptions = options.filter((opt) => isChecked(opt.value));

  return (
    <div className={`flex flex-col gap-0.5 ${className}`} ref={containerRef}>
      {label && (
        <label className={`font-bold text-slate-800 uppercase ml-0.5 ${labelClassName} ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <div
          onClick={() => !disabled && setOpen((o) => !o)}
          className={`w-full flex items-center flex-wrap gap-1 bg-slate-50 border rounded-lg outline-none transition-all cursor-pointer
            ${compact ? 'px-2 py-1 min-h-[28px] text-xs' : 'px-3 py-1.5 min-h-[36px] text-sm'}
            ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}
            ${meta.touched && meta.error ? 'border-red-500' : 'border-slate-200'}`}
        >
          {selectedOptions.length === 0 && (
            <span className="text-slate-400">{placeholder}</span>
          )}
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className={`flex items-center gap-1 bg-indigo-100 text-indigo-700 font-semibold rounded ${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-xs'}`}
            >
              {opt.label}
              {!disabled && (
                <X size={compact ? 9 : 11} className="cursor-pointer hover:text-indigo-900" onClick={(e) => removeValue(opt.value, e)} />
              )}
            </span>
          ))}
          <ChevronDown size={compact ? 12 : 14} className="ml-auto text-slate-400 pointer-events-none" />
        </div>

        {open && !disabled && (
          <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
            {options.length === 0 && (
              <div className="px-3 py-2 text-[10px] text-slate-400 italic">No options</div>
            )}
            {options.map((opt, index) => (
              <label
                key={opt.value ?? index}
                className="flex items-center gap-2 px-2.5 py-1.5 text-[11px] hover:bg-indigo-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                  className="w-3 h-3 rounded border-slate-300 text-indigo-600 cursor-pointer accent-indigo-600"
                />
                <span className="text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {meta.touched && meta.error && (
        <div className="text-red-500 text-[10px]">{meta.error}</div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   FormikTextarea
   compact={true}  → text-xs, text-[9px] label, smaller padding
   ───────────────────────────────────────────────────────────── */
export const FormikTextarea = ({ label, name, rows = 3, placeholder = "", compact = false, className = "", readOnly }) => (
  <div className="flex flex-col gap-0.5 h-full">
    {label && (
      <label className={`font-bold text-slate-500 uppercase ml-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </label>
    )}
    <Field name={name}>
      {({ field, meta }) => (
        <>
          <textarea
            {...field}
            rows={rows}
            disabled={readOnly}
            placeholder={placeholder}
            className={`w-full bg-slate-50 border outline-none transition-all resize-none
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              ${compact ? 'rounded px-2 py-1.5 text-xs' : 'rounded-sm px-3 py-2 text-sm'}
              ${meta.touched && meta.error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-slate-200'}
              ${className}`}
          />
          {meta.touched && meta.error && (
            <p className="text-red-500 text-[9px] mt-0.5">{meta.error}</p>
          )}
        </>
      )}
    </Field>
  </div>
);
