import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Layers, ListChecks, Ruler } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table-cell input ── */
const TCell = ({ name, type = 'text' }) => (
  <Field name={name} type={type}
    className="w-full bg-transparent px-1.5 py-1 text-xs focus:outline-none focus:bg-white rounded transition-all" />
);

const initialValues = {
  spool_id: '',
  colour: 'Blue',          // auto
  colour_barcode: 'CBC-X1',        // auto
  rew_reason: '',
  length: '',
  rew_type: '',
  remark: '',
  machine_no: '',
  fid: '',              // auto after click
  scrap_length: '',
  bobbin_type: '',
  operator: '',
  bobbin_colour: '',
  instructions: Array(8).fill(null).map(() => ({ checked: false, instruction: '', length_km: '' })),
  length_details: Array(8).fill(null).map(() => ({ length: '', fid: '', barcode: '', start_pos: '', end_pos: '' })),
};

const ColouringEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 overflow-hidden">
      <Formik initialValues={initialValues} onSubmit={(v) => { console.log('Rewinding Submit:', v); alert('Saved!'); }}>
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Row 1: All form fields in 3 cards ── */}
            <div className="grid grid-cols-3 gap-2 flex-shrink-0">

              {/* Card 1: Spool & Identification */}
              <ModuleCard compact title="Spool & Identification" icon={<Layers size={12} className="text-blue-600" />}>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="col-span-2 flex items-end gap-1.5">
                    <div className="flex-1">
                      <FormikInput compact label="Spool ID" name="spool_id" placeholder="Enter spool ID..." />
                    </div>
                    <button type="button"
                      className="px-3 py-1.5 bg-indigo-600 text-white text-[8px] font-bold rounded uppercase hover:bg-indigo-700 h-[28px] whitespace-nowrap">
                      Fetch
                    </button>
                  </div>
                  <FormikInput compact label="Colour" name="colour" readOnly />
                  <FormikInput compact label="Colour Batc Code" name="colour_barcode" readOnly />
                  <FormikSelect compact label="Rew Reason" name="rew_reason" options={['Select', 'Attn High', 'MFD Fail', 'Customer Req', 'Other']} />
                  <FormikInput compact label="Length" name="length" type="number" placeholder="0.000" />
                  <FormikSelect compact label="Rew Type" name="rew_type" options={['Select', 'Standard', 'Premium', 'Custom']} />
                  <FormikSelect compact label="Machine No" name="machine_no" options={['Select', 'MC-01', 'MC-02', 'MC-03', 'MC-04']} />
                </div>
              </ModuleCard>

              {/* Card 2: FID & Scrap */}
              <ModuleCard compact title="FID & Scrap" icon={<Ruler size={12} className="text-indigo-600" />}>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="col-span-2 flex items-end gap-1.5">
                    <div className="flex-1">
                      <FormikInput compact label="FID" name="fid" readOnly placeholder="Click to generate..." />
                    </div>
                    <button type="button"
                      className="px-3 py-1.5 bg-amber-500 text-white text-[8px] font-bold rounded uppercase hover:bg-amber-600 h-[28px] whitespace-nowrap">
                      Get FID
                    </button>
                  </div>
                  <FormikInput compact label="Scrap Length" name="scrap_length" type="number" placeholder="0.000" />
                  <FormikSelect compact label="Bobbin Type" name="bobbin_type" options={['Select', 'Type A', 'Type B', 'Type C']} />
                  <FormikSelect compact label="Operator" name="operator" options={['Select', 'Operator A', 'Operator B', 'Operator C']} />
                  <FormikSelect compact label="Bobbin Colour" name="bobbin_colour" options={['Select', 'Red', 'Blue', 'Green', 'Yellow', 'White']} />
                  <div className="flex-1 col-span-3 overflow-y-auto max-h-25 border rounded">
                    <table className="text-[10px] w-full overflow-y-auto border-collapse">
                      <thead className="bg-slate-50 text">
                        <tr>
                          <th className="sticky top-0 bg-slate-50 p-2 text-left">
                          DFG123
                          </th>
                          <th className="sticky top-0 bg-slate-50 p-2 text-left">
                            Rewinding
                          </th>
                          <th className="sticky top-0 bg-slate-50 p-2 text-left">
                            Scrap
                          </th>
                          <th className="sticky top-0 bg-slate-50 p-2 text-left">
                            Balance
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td className="p-2 border-t">455</td>
                          <td className="p-2 border-t">455</td>
                          <td className="p-2 border-t">475</td>
                          <td className="p-2 border-t">477</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-t">505</td>
                          <td className="p-2 border-t">475</td>
                          <td className="p-2 border-t">477</td>
                          <td className="p-2 border-t">505</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </ModuleCard>

              {/* Card 3: Remark */}
              <div>
              <ModuleCard compact title="Remarks" icon={<ListChecks size={12} className="text-emerald-600" />}>
              <FormikTextarea compact label="Q Remark" name="q_remark" rows={4.5} placeholder="Auto Fetched Remark..." />
                <FormikTextarea compact label="Remark" name="remark" rows={4.5} placeholder="Enter process remarks..." />
              </ModuleCard>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex justify-between gap-2 flex-shrink-0">
              <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
              <SubmitButton compact type="submit">Submit Process</SubmitButton>
            </div>

            {/* ── Row 2: Two Tables ── */}
            <div className="grid grid-cols-[1.8fr_1fr] gap-2 flex-1 min-h-0">

              {/* Length Allocation Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <Ruler size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Length Allocation Details</span>
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase w-8">#</th>
                        <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Length</th>
                        <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">FID</th>
                        <th className="px-2 py-1.5 text-[8px] font-bold text-amber-600 uppercase bg-amber-50">Barcode / Scrap ID</th>
                        <th className="px-2 py-1.5 text-[8px] font-bold text-emerald-600 uppercase bg-emerald-50">Start Pos</th>
                        <th className="px-2 py-1.5 text-[8px] font-bold text-emerald-600 uppercase bg-emerald-50">End Pos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-2 py-1 text-[9px] font-bold text-slate-400 text-center bg-slate-50/50">{i + 1}</td>
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`length_details.${i}.length`} /></td>
                          <td className="px-1 py-1 border-r border-slate-100"><TCell name={`length_details.${i}.fid`} /></td>
                          <td className="px-1 py-1 border-r border-slate-100 bg-amber-50/40"><TCell name={`length_details.${i}.barcode`} /></td>
                          <td className="px-1 py-1 border-r border-slate-100 bg-emerald-50/40"><TCell name={`length_details.${i}.start_pos`} /></td>
                          <td className="px-1 py-1 bg-emerald-50/40"><TCell name={`length_details.${i}.end_pos`} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rewinding Instructions Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <ListChecks size={12} className="text-orange-500" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Rewinding Instructions</span>
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase w-8 text-center">✔</th>
                        <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Instruction</th>
                        <th className="px-2 py-1.5 text-[8px] font-bold text-slate-500 uppercase">Length (km)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-2 py-1 text-center border-r border-slate-100">
                            <Field type="checkbox" name={`instructions.${i}.checked`}
                              className="w-3.5 h-3.5 rounded border-slate-300 accent-indigo-600" />
                          </td>
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TCell name={`instructions.${i}.instruction`} />
                          </td>
                          <td className="px-1 py-1">
                            <TCell name={`instructions.${i}.length_km`} type="number" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            {/* ── end tables ── */}

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default ColouringEntry;
