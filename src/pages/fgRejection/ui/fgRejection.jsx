import React from 'react';
import { ChevronDown } from 'lucide-react';

import FormField from '../../../components/formInputs';

// --- Main Form Component ---
const FGRejection = () => {
  return (
    <div className="w-full bg-white p-6 rounded-sm border border-gray-200 shadow-sm font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-4">
        
        {/* Row 1 */}
        <FormField label="Barcode" />
        <FormField label="Fiber length(km)" readOnly />
        <FormField label="Grade" readOnly />
        <FormField label="Material code" readOnly />

        {/* Row 2 */}
        <FormField label="Storage location" readOnly />
        <FormField label="Destination Storage location" type="select" />
        <FormField label="REW Reason" type="select" />
        <FormField label="Fail Reason" type="select" />

        {/* Row 3 */}
        <FormField label="Sub Reason" type="select" />
        <FormField label="Operator" type="select" />
        
        {/* Empty cells for grid alignment if needed, or leave blank */}
        <div className="lg:col-span-1"></div>
        <div className="lg:col-span-1"></div>

      </div>

      {/* Footer / Action Section */}
      <div className="mt-8 flex justify-end border-t border-gray-100 pt-4">
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
          onClick={() => console.log("Submitting...")}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default FGRejection;