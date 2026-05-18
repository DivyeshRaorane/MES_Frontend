import React from 'react';
import { Formik, Form } from 'formik';
import { BarChart3 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Static table data (from screenshot) ── */
const TABLE_DATA = [
  { srNo: 1,  spoolId: 'Z194240040713', ptBreaks: 7, breakChecked: 0, ptBrksK: 0,    bsaPct: 0   },
  { srNo: 2,  spoolId: 'TEF524245060',  ptBreaks: 3, breakChecked: 0, ptBrksK: 0,    bsaPct: 0   },
  { srNo: 3,  spoolId: 'TEF524228106',  ptBreaks: 3, breakChecked: 0, ptBrksK: 0,    bsaPct: 0   },
  { srNo: 4,  spoolId: 'TEF524195030',  ptBreaks: 1, breakChecked: 1, ptBrksK: 2.7,  bsaPct: 100 },
  { srNo: 5,  spoolId: 'TEF524194011',  ptBreaks: 2, breakChecked: 2, ptBrksK: 18.2, bsaPct: 100 },
  { srNo: 6,  spoolId: 'TEF524194012',  ptBreaks: 1, breakChecked: 2, ptBrksK: 4.5,  bsaPct: 200 },
  { srNo: 7,  spoolId: 'TEF524208022',  ptBreaks: 4, breakChecked: 0, ptBrksK: 0,    bsaPct: 0   },
  { srNo: 8,  spoolId: 'TEF524228105',  ptBreaks: 4, breakChecked: 0, ptBrksK: 0,    bsaPct: 0   },
  { srNo: 9,  spoolId: 'TEF524190051',  ptBreaks: 1, breakChecked: 0, ptBrksK: 0,    bsaPct: 0   },
  { srNo: 10, spoolId: 'TEF524159032',  ptBreaks: 5, breakChecked: 0, ptBrksK: 0,    bsaPct: 0   },
];

const initialValues = {
  entry_date:         new Date().toISOString().split('T')[0],
  bsa_technician:     '',
  brk_pt_id:          '',
  main_break_type:    '',
  sub_reason:         '',
  next_sub_reason:    '',
  dist_from_periphery:'',
  particle_size:      '',
  flaw_size:          '',
  preform_type:       '',
  pt_len_km:          '',
  draw_cumm_len_km:   '',
  tower_no:           '',
  pt_mc_no:           '',
  pt_operator:        '',
  draw_barcode_id:    '',
  preform_id:         '',
  pt_breaks:          '',
  breaks_checkd:      '',
  pending:            '',
  spool_id:           '',
  bsa_remark:         '',
};

/* ══════════════════════════════════════════════════════════ */
const PTBreakAnalysis = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('PT Break Analysis:', v); alert('Saved!'); }}
      >
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
<div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Break Analysis</span>
                <div className="flex gap-1.5">
                  <button type="button" className="px-3 py-1 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">Save</button>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
            {/* ── Form fields ── */}
            <ModuleCard compact title="PT Break Analysis Entry" icon={<BarChart3 size={13} className="text-blue-600" />}>
              <div className="grid grid-cols-8 gap-2">
                {/* Row 1 */}
                <FormikInput  compact label="Entry Date"          name="entry_date"          type="date" />
                <FormikSelect compact label="BSA Technician"      name="bsa_technician"      options={['Select','Technician A','Technician B','Technician C']} />
                <FormikInput  compact label="Brk PT ID"           name="brk_pt_id"           placeholder="" />
                <FormikSelect compact label="Main Break Type"     name="main_break_type"     options={['Select','Core Break','Surface Scratches','Neckdown','Particle']} />
                {/* Row 2 */}
                <FormikSelect compact label="Sub Reason"          name="sub_reason"          options={['Select','Mechanical','Material','Tension','Other']} />
                <FormikSelect compact label="Next Sub Reason"     name="next_sub_reason"     options={['Select','Tension','Winding','Coating','Other']} />
                <FormikInput  compact label="Dist. From Periphery" name="dist_from_periphery" placeholder="" />
                <FormikInput  compact label="Particle Size"       name="particle_size"       placeholder="" />
                {/* Row 3 */}
                <FormikInput  compact label="Flaw Size"           name="flaw_size"           placeholder="" />
                <FormikInput  compact label="Preform Type"        name="preform_type"        placeholder="" />
                <FormikInput  compact label="PT Len (Km)"         name="pt_len_km"           type="number" />
                <FormikInput  compact label="Draw Cumm Len (Km)"  name="draw_cumm_len_km"    type="number" />
                {/* Row 4 */}
                <FormikInput  compact label="Tower No."           name="tower_no" />
                <FormikInput  compact label="PT Mc No."           name="pt_mc_no" />
                <FormikInput  compact label="PT Operator"         name="pt_operator" />
                <FormikInput  compact label="Draw Barcode Id"     name="draw_barcode_id" />
                {/* Row 5 */}
                <FormikInput  compact label="Preform ID"          name="preform_id" />
                <FormikInput  compact label="PT Breaks"           name="pt_breaks"           type="number" />
                <FormikInput  compact label="Breaks Checkd"       name="breaks_checkd"       type="number" />
                <FormikInput  compact label="Pending"             name="pending" />
                {/* Row 6 — Spool ID + BSA Remark */}
                <div className="col-span-2">
                  <FormikInput compact label="Spool ID" name="spool_id" />
                </div>
                <div className="col-span-2">
                  <FormikInput compact label="BSA Remark" name="bsa_remark" placeholder="Enter observation details..." />
                </div>
              </div>
            </ModuleCard>

            {/* ── Analysis table — fills remaining height ── */}
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <BarChart3 size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Analysis Data Logs</span>
                </div>
                <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">Live Logs</span>
              </div>

              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200">
                      {['SR.NO','SPOOL ID','PT BREAKS','BREAK CHECKED','PT BRKS/K (1000)','BSA %'].map(h => (
                        <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {TABLE_DATA.map(row => (
                      <tr key={row.srNo} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-2 text-xs font-bold text-slate-400 border-r border-slate-100">{row.srNo}</td>
                        <td className="px-3 py-2 text-xs font-bold text-slate-700 border-r border-slate-100">{row.spoolId}</td>
                        <td className="px-3 py-2 text-xs font-mono text-slate-600 border-r border-slate-100">{row.ptBreaks}</td>
                        <td className="px-3 py-2 text-xs font-mono text-slate-600 border-r border-slate-100">{row.breakChecked}</td>
                        <td className="px-3 py-2 text-xs font-mono text-slate-600 border-r border-slate-100">{row.ptBrksK}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.bsaPct > 100
                              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                              : row.bsaPct === 100
                              ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {row.bsaPct}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default PTBreakAnalysis;
