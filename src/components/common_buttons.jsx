import React from "react";
import { Send, RotateCcw } from "lucide-react";

export const SubmitButton = ({
  children = "Submit",
  className = "",
  ...props
}) => {
  return (
    <button
      type="submit"
      className={`
        flex items-center justify-center gap-2
        px-3 py-3
        bg-indigo-600
        text-white
        rounded-xl
        font-bold
        shadow-lg
        shadow-indigo-100
        hover:bg-indigo-700
        hover:shadow-indigo-200
        transition-all
        active:scale-95
        ${className}
      `}
      {...props}
    >
        <Send size={15}/>
      {children}
    </button>
  );
};


export const ResetButton = ({
  children = "Reset",
  className = "",
  ...props
}) => {
  return (
    <button
      type="reset"
      className={`
        px-8 py-3
        bg-red-100
        text-red-600
        rounded-xl
        font-bold
        flex items-center justify-center gap-2
        shadow-sm
        hover:bg-red-200
        transition-all
        active:scale-95
        ${className}
      `}
      {...props}
    >
      <RotateCcw size={18} />
      {children}
    </button>
  );
};


