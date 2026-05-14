import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Palette, Table, Plus, Minus } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table-cell input ── */
const TCell = ({ name }) => (
  <Field name={name}
    className="w-full bg-transparent px-1.5 py-1 text-xs focus:outline-none focus:bg-white rounded transition-all" />
);

const makeRow = () => ({ selected: false, output_length: '', fiber_id: '', barcode: '' });

const initialValues = {
  machine_no:       '',
  barcode:          '',
  coloring_plan_id: '',
  pt_fiber_id:      '',
  color_to_be_done: '',
  scrap_reason:     '',
  actual_color:     '',
  scrap_length:     '',
  sap_length:       '',
  color_qty:        '',
  nitrogen:         '',
  optical_length:   '',
  identifier:       '',
  color_ink_batch:  '',
  product_name:     '',
  material_code:    '',
  coloring_order:   '',
  coloring_type:    '',
  shift:            '',
  nitrogen_batch:   '',
  bottle_batch:     '',
  operator:         '',
  shift_incharge:   '',
  is_break:         'NO',
  col_remark:       '',
  rows:             Array.from({ length: 10 }, makeRow),
};

/* ══════════════════════════════════════════════════════════ */
const ColouringEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 overflow-hidden">
      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('Colouring Submit:', v); alert('Saved!'); }}
      >
        {({ values, resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Header fields — matches screenshot layout ── */}
            <ModuleCard compact title="Colouring Entry" icon={<Palette size={12} className="text-blue-600" />}>
              <div className="flex flex-col gap-1.5">

                {/* Row 1: Machine No, Barcode, Coloring Planning ID, PT Fiber Id */}
                <div className="grid grid-cols-4 gap-2">
                  <FormikSelect compact label="Machine Number"      name="machine_no"       options={['Select','M-01','M-02','M-03']} />
                  <FormikInput  compact label="Barcode"             name="barcode"           placeholder="" />
                  <FormikInput  compact label="Coloring Planning ID" name="coloring_plan_id" placeholder="" />
                  <FormikInput  compact label="PT Fiber Id"         name="pt_fiber_id"       placeholder="" />
                </div>

                {/* Row 2: Color To Be Done, Scrap Reason, Actual Color, Scrap Length, SAP Length */}
                <div className="grid grid-cols-8 gap-2">
                  <FormikInput  compact label="Color To Be Done"  name="color_to_be_done" />
                  <FormikSelect compact label="Scrap Reason"      name="scrap_reason"      options={['Select','Sample','Damage','Other']} />
                  <FormikSelect compact label="Actual Color"      name="actual_color"      options={['Select','Blue','Red','Green','Yellow','White','Orange']} />
                  <FormikInput  compact label="Scrap Length(m)"   name="scrap_length"      type="number" />
                  <FormikInput  compact label="SAP Length(m)"     name="sap_length"        type="number" />
                

                {/* Row 3: Color Qty, Nitrogen, Optical Length, Identifier, Color Ink Batch */}
            
                  <FormikInput compact label="Color Qty"          name="color_qty"         type="number" />
                  <FormikInput compact label="Nitrogen"           name="nitrogen" />
                  <FormikInput compact label="Optical Length(m)"  name="optical_length"    type="number" />
                  <FormikInput compact label="Identifier"         name="identifier" />
                  <FormikInput compact label="Color Ink Batch"    name="color_ink_batch" />
                

                {/* Row 4: Product Name, Material Code, Coloring Order, Coloring Type, Shift */}
              
                  <FormikInput  compact label="Product Name"    name="product_name" />
                  <FormikInput  compact label="Material Code"   name="material_code" />
                  <FormikInput  compact label="Coloring Order"  name="coloring_order" />
                  <FormikInput  compact label="Coloring Type"   name="coloring_type" />
                  <FormikSelect compact label="Shift"           name="shift"           options={['Select','A','B','C']} />
               

                {/* Row 5: Nitrogen Batch, Bottle Batch, Operator, Shift Incharge, Is Break */}
             
                  <FormikSelect compact label="Nitrogen Batch"   name="nitrogen_batch"   options={['Select','Batch-01','Batch-02']} />
                  <FormikInput  compact label="Bottle Batch"     name="bottle_batch" />
                  <FormikSelect compact label="Operator"         name="operator"         options={['Select','Op 1','Op 2','Op 3']} />
                  <FormikSelect compact label="Shift Incharge"   name="shift_incharge"   options={['Select','Incharge A','Incharge B']} />
                  <FormikSelect compact label="Is Break"         name="is_break"         options={['NO','YES']} />
                  <div className='col-span-4'>
                  <FormikTextarea compact label="Col Remark" name="col_remark" rows={1} placeholder="" />
                  </div>
                </div>

                {/* Row 6: Col Remark — full width */}
                
              </div>
            </ModuleCard>

            {/* ── FieldArray table ── */}
            <FieldArray name="rows">
              {({ push, remove, form }) => (
                <div className="flex flex-col flex-1 min-h-0 gap-1.5">

                  {/* Remove / Add buttons above table */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button"
                      onClick={() => form.values.rows.length > 1 && remove(form.values.rows.length - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">
                      <Minus size={11} /> Remove Row
                    </button>
                    <button type="button"
                      onClick={() => push(makeRow())}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 text-white text-[9px] font-bold rounded hover:bg-slate-800 transition-all">
                      <Plus size={11} /> Add Row
                    </button>
                  </div>

                  {/* Scrollable table */}
                  <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-y-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                          <tr className="border-b border-slate-200">
                            <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase w-16 border-r border-slate-100">SELECT</th>
                            <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">OUTPUT LENGTH</th>
                            <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase border-r border-slate-100">COLOURING FIBER ID</th>
                            <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">BARCODE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {form.values.rows.map((_, i) => (
                            <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                              <td className="px-3 py-1 text-center border-r border-slate-100">
                                <Field type="checkbox" name={`rows.${i}.selected`}
                                  className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />
                              </td>
                              <td className="px-1 py-1 border-r border-slate-100"><TCell name={`rows.${i}.output_length`} /></td>
                              <td className="px-1 py-1 border-r border-slate-100"><TCell name={`rows.${i}.fiber_id`} /></td>
                              <td className="px-1 py-1"><TCell name={`rows.${i}.barcode`} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </FieldArray>

            {/* ── Reset + Submit below table — Submit right-aligned like screenshot ── */}
            <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
              <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
              <SubmitButton compact type="submit">Submit</SubmitButton>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default ColouringEntry;
