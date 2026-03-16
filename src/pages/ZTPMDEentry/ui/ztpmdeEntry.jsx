import React, { useState } from 'react';
import FormField from '../../../components/formInputs';


const ZTPMDEntry = () => {
  const [activeTab, setActiveTab] = useState('ZTPMD');

  return (
    <div className="bg-[#f4f7f6] min-h-screen p-4 font-sans text-slate-700">
      <div className="max-w-[1400px] mx-auto bg-white shadow-md border border-slate-200 rounded-sm">

        {/* Form Grid Section */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-x-10 gap-y-4 items-end">
          {/* Row 1 */}
          <FormField label="Machine Number" type="select" options={['ZT01', 'ZT02']} value="ZT01" />
          <FormField label="Shift ID" type="select" options={['Shift A', 'Shift B']} />
          <FormField label="Operator" type="select" options={['Op 1', 'Op 2']} />
          <FormField label="Shift Incharge" type="select" options={['Lead 1', 'Lead 2']} />

          {/* Row 2 */}
          <FormField label="Date" value="31-May-2024" />
          <FormField label="Barcode" />
          <FormField label="PT Fiber Id" />
          <FormField label="IsBreak" type="select" options={['Yes', 'No']} value="No" />

          {/* Row 3 */}
          <FormField label="Length(m)" value="220" />
          <FormField label="Speed(m/min)" value="200" />
          <FormField label="Remark" />
          
          {/* Empty spacer to align Submit button properly in the 4-column layout if needed */}
          <div className="md:col-start-4 flex justify-end">
             <button className="bg-[#48bb78] text-white font-bold text-xs px-10 py-2 rounded hover:bg-green-600 transition-all shadow-sm">
                Submit
              </button>
          </div>
        </div>

        {/* Bottom padding for layout consistency */}
        <div className="pb-6"></div>
      </div>
    </div>
  );
};

export default ZTPMDEntry;