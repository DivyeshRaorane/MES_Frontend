import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Home } from 'lucide-react';

import FormField from '../../../components/formInputs';

const FilePicker = ({ label }) => (
  <div className="flex items-center gap-4 w-full">
    <label className="text-[13px] font-medium text-gray-700 min-w-[100px]">{label}</label>
    <div className="flex flex-1 items-center">
      <div className="flex border border-gray-300 rounded overflow-hidden w-full">
        <input 
          type="text" 
          placeholder="Choose File" 
          readOnly 
          className="flex-1 px-2 py-1.5 text-[13px] bg-white outline-none" 
        />
        <button className="bg-gray-100 border-l border-gray-300 px-4 py-1.5 text-[13px] text-gray-600 hover:bg-gray-200">
          Browse
        </button>
      </div>
      <input type="text" className="ml-2 border border-gray-300 rounded px-2 py-1.5 text-[13px] w-full" />
    </div>
  </div>
);

// --- Main Page Component ---

const FGRejectionForColoring = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      {/* Header Section */}
     

      {/* Form Container */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
       

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          <FormField label="Date" type="date" value="2024-05-31" />
          <FormField label="Operator" type="select" options={["Operator A", "Operator B"]} />
          <FormField label="Rejection Type" type="select" options={["Quality", "Machine", "Material"]} />
          <FormField label="Color Type" type="select" options={["Primary", "Secondary"]} />
          
          <FormField label="Product Type" type="select" options={["Type 1", "Type 2"]} />
          
          <div className="lg:col-span-2">
            <FilePicker label="Select File" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-end">
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition">
              Read File
            </button>
            <button className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FGRejectionForColoring;