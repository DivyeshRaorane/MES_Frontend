import React from "react";
import { Send, RotateCcw } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   SubmitButton
   compact={true}  → smaller padding + text for dense layouts
   disabled        → muted style, no pointer events
   ───────────────────────────────────────────────────────────── */
export const SubmitButton = ({
  children = "Submit",
  compact = false,
  className = "",
  disabled = false,
  ...props
}) => (
  <button
    type="submit"
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2
      bg-indigo-600 text-white rounded-xl font-bold
      shadow-lg shadow-indigo-100
      transition-all active:scale-95
      ${compact ? 'px-4 py-1.5 text-xs' : 'px-5 py-3 text-sm'}
      ${disabled
        ? 'opacity-40 cursor-not-allowed pointer-events-none'
        : 'hover:bg-indigo-700 hover:shadow-indigo-200'}
      ${className}
    `}
    {...props}
  >
    <Send size={compact ? 12 : 15} />
    {children}
  </button>
);

/* ─────────────────────────────────────────────────────────────
   ResetButton
   compact={true}  → smaller padding + text for dense layouts
   disabled        → muted style, no pointer events
   ───────────────────────────────────────────────────────────── */
export const ResetButton = ({
  children = "Reset",
  compact = false,
  className = "",
  disabled = false,
  ...props
}) => (
  <button
    type="reset"
    disabled={disabled}
    className={`
      flex items-center justify-center gap-2
      bg-red-100 text-red-600 rounded-xl font-bold
      shadow-sm transition-all active:scale-95
      ${compact ? 'px-4 py-1.5 text-xs' : 'px-8 py-3 text-sm'}
      ${disabled
        ? 'opacity-40 cursor-not-allowed pointer-events-none'
        : 'hover:bg-red-200'}
      ${className}
    `}
    {...props}
  >
    <RotateCcw size={compact ? 12 : 18} />
    {children}
  </button>
);
