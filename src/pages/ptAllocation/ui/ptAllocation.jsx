import React, { useRef } from 'react';
import { Formik, Form } from 'formik';
import { 
  Barcode, 
  Table as TableIcon, 
  Save, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';

// Importing your reusable components
import { ModuleCard,FormikSelect,FormikInput } from '../../../components/common_fields';
import { SubmitButton,ResetButton } from '../../../components/common_buttons';

const PTAllocation = () => {
  const formikRef = useRef(null);

  const initialValues = {
    drawn_spool_id: '',
    date: new Date().toISOString().split('T')[0], // Current Date
    preform_id: '',
    DT_No: '',
    Drawn_Length: '',
    pt_strain: '',
    pt_machine: '',
    allocated_by: '',
    shift_incharge:'',
    pt_Allo_remark:''
  };

  // Dummy Data for the table
  const dummyData = [
    { preform_id: 'PF-9901', drawn_spool_id: 'SP-101', DT_No: 'DT-A1', Drawn_Length: '5000m', PT_Done: 'No', Balance: '5000m' },
    { preform_id: 'PF-9902', drawn_spool_id: 'SP-102', DT_No: 'DT-B2', Drawn_Length: '4500m', PT_Done: 'Yes', Balance: '0m' },
    { preform_id: 'PF-9903', drawn_spool_id: 'SP-103', DT_No: 'DT-C3', Drawn_Length: '6000m', PT_Done: 'No', Balance: '6000m' },
  ];

  // Function to handle row click and populate form
  const handleRowClick = (row) => {
    if (formikRef.current) {
      formikRef.current.setValues({
        ...formikRef.current.values,
        drawn_spool_id: row.drawn_spool_id,
        preform_id: row.preform_id,
        DT_No: row.DT_No,
        Drawn_Length: row.Draw_Length,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* SECTION 1: INPUT FORM */}
      <ModuleCard title="Spool Allocation Entry" icon={<Barcode size={18} className="text-indigo-600" />}>
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={(values) => {
            console.log("Form Submitted:", values);
            alert("Allocation Saved Successfully!");
          }}
        >
          {({ handleReset }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormikInput label="Scan Drawn Spool Barcode" name="drawn_spool_id" placeholder="Scan Spool..." />
                <FormikInput label="Date" name="date" type="date" readOnly />
                <FormikInput label="Preform ID" name="preform_id" placeholder="Automatic" readOnly />
                <FormikInput label="DT No" name="DT_No" placeholder="Automatic" readOnly />
                
                <FormikInput label="Drawn Length" name="Drawn_Length" placeholder="Automatic" readOnly />
                <FormikSelect 
                  label="Select PT Strain" 
                  name="pt_strain" 
                  options={['Select Strain', 'Strain-A', 'Strain-B', 'Strain-C']} 
                />
                <FormikSelect 
                  label="Select PT Machine" 
                  name="pt_machine" 
                  options={['Select Machine', 'PT-MAC-01', 'PT-MAC-02', 'PT-MAC-03']} 
                />
                <FormikSelect 
                  label="Allocated By" 
                  name="allocated_by" 
                  options={['Select User', 'Divyesh', 'Senior Op', 'Manager']} 
                />
                <FormikSelect 
                  label="Shift Incharge" 
                  name="shift_incharge" 
                  options={['Select User', 'Divyesh', 'Senior Op', 'Manager']} 
                />
                <FormikInput label="Remark" name="pt_allocation_remark" placeholder="Remark" />
              </div>

              <div className="flex justify-between gap-1 pt-1">
                <ResetButton onClick={handleReset}>Clear</ResetButton>
                <div className="flex justify-between gap-2 pt-1">
                <SubmitButton>Reject</SubmitButton>
                <SubmitButton>Allocate</SubmitButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </ModuleCard>

      {/* SECTION 2: DATA TABLE */}
      <ModuleCard title="Pending Allocation List" icon={<TableIcon size={18} className="text-indigo-600" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Preform ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Draw Spool ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">DT No</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Draw Length</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">PT Done</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Balance Length</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((row, index) => (
                <tr 
                  key={index} 
                  onClick={() => handleRowClick(row)}
                  className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{row.preform_id}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.drawn_spool_id}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.DT_No}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{row.Drawn_Length}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.PT_Done === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {row.PT_Done}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">{row.Balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[10px] text-slate-400 italic italic">
          * Click on a row to select and auto-fill the allocation form above.
        </p>
      </ModuleCard>

    </div>
  );
};

export default PTAllocation;