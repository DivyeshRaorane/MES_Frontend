import React, { useRef } from 'react';
import { Formik, Form } from 'formik';
import { Barcode, Table as TableIcon } from 'lucide-react';
import { ModuleCard, FormikSelect, FormikInput } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

const dummyData = [
  { preform_id: 'PF-9901', drawn_spool_id: 'SP-101', DT_No: 'DT-A1', Drawn_Length: '5000m', PT_Done: 'No',  Balance: '5000m' },
  { preform_id: 'PF-9902', drawn_spool_id: 'SP-102', DT_No: 'DT-B2', Drawn_Length: '4500m', PT_Done: 'Yes', Balance: '0m'    },
  { preform_id: 'PF-9903', drawn_spool_id: 'SP-103', DT_No: 'DT-C3', Drawn_Length: '6000m', PT_Done: 'No',  Balance: '6000m' },
];

const initialValues = {
  drawn_spool_id: '',
  date: new Date().toISOString().split('T')[0],
  preform_id: '',
  DT_No: '',
  Drawn_Length: '',
  pt_strain: '',
  pt_machine: '',
  allocated_by: '',
  shift_incharge: '',
  pt_Allo_remark: '',
};

const PTAllocation = () => {
  const formikRef = useRef(null);

  const handleRowClick = (row) => {
    formikRef.current?.setValues({
      ...formikRef.current.values,
      drawn_spool_id: row.drawn_spool_id,
      preform_id:     row.preform_id,
      DT_No:          row.DT_No,
      Drawn_Length:   row.Drawn_Length,
    });
  };

  return (
    /* fill the container's render area */
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {/* ── Entry Form ── */}
      <ModuleCard compact title="Spool Allocation Entry" icon={<Barcode size={13} className="text-indigo-600" />}>
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={(values) => {
            console.log('Form Submitted:', values);
            alert('Allocation Saved Successfully!');
          }}
        >
          {({ handleReset }) => (
            <Form>
              
              <div className="grid grid-cols-5 gap-2">
                <FormikInput  compact label="Scan Drawn Spool Barcode" name="drawn_spool_id" placeholder="Scan Spool..." />
                <FormikInput  compact label="Date"                     name="date"           type="date" readOnly />
                <FormikInput  compact label="Preform ID"               name="preform_id"     placeholder="Automatic" readOnly />
                <FormikInput  compact label="DT No"                    name="DT_No"          placeholder="Automatic" readOnly />
                <FormikInput  compact label="Drawn Length"             name="Drawn_Length"   placeholder="Automatic" readOnly />
                <FormikInput  compact label="Product Type"             name="product_Type"   placeholder="Automatic" readOnly />
                <FormikSelect compact label="Select PT Strain"         name="pt_strain"      options={['Select Strain','Strain-A','Strain-B','Strain-C']} />
                <FormikSelect compact label="Select PT Machine"        name="pt_machine"     options={['Select Machine','PT-MAC-01','PT-MAC-02','PT-MAC-03']} />
                <FormikSelect compact label="Allocated By"             name="allocated_by"   options={['Select User','Divyesh','Senior Op','Manager']} />
                <FormikSelect compact label="Shift Incharge"           name="shift_incharge" options={['Select User','Divyesh','Senior Op','Manager']} />
                <FormikInput  compact label="Remark"                   name="pt_Allo_remark" placeholder="Remark" />
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                <ResetButton compact onClick={handleReset}>Clear</ResetButton>
                <div className="flex gap-2">
                  <SubmitButton compact>Reject</SubmitButton>
                  <SubmitButton compact>Allocate</SubmitButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </ModuleCard>

      {/* ── Pending Allocation Table — scrolls internally ── */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
          <TableIcon size={13} className="text-indigo-600" />
          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Pending Allocation List</span>
        </div>
        {/* scrollable body */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200">
                {['Preform ID','Draw Spool ID','DT No','Draw Length','PT Done','Balance Length'].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dummyData.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row)}
                  className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2 text-xs font-semibold text-indigo-600">{row.preform_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.drawn_spool_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.DT_No}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.Drawn_Length}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      row.PT_Done === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {row.PT_Done}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600 font-mono">{row.Balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-1.5 text-[9px] text-slate-400 italic border-t border-slate-100 flex-shrink-0">
          * Click a row to auto-fill the allocation form above.
        </p>
      </div>

    </div>
  );
};

export default PTAllocation;
