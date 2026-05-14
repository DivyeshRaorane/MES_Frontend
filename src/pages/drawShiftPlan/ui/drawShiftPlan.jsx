import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { RefreshCcw, CheckCircle2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact editable table cell ── */
const TInput = ({ value, onChange, disabled = false, defaultValue }) => (
  <input
    type="text"
    defaultValue={defaultValue}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`w-full px-1.5 py-1 text-xs text-center rounded outline-none transition-all border
      ${disabled
        ? 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
        : 'bg-transparent border-transparent focus:bg-white focus:border-blue-300'}`}
  />
);

const TABLE_COLS = [
  { label: '✔',          key: 'check',          w: 'w-8'  },
  { label: 'DT',         key: 'dt',             w: 'w-10' },
  { label: 'Theo Speed', key: 'theoSpeed',      w: ''     },
  { label: 'Actual Speed',key:'actualSpeed',    w: ''     },
  { label: 'C/O Num',    key: 'coNum',          w: ''     },
  { label: 'C/O Time',   key: 'coTime',         w: ''     },
  { label: 'C/O TL',     key: 'coTl',           w: ''     },
  { label: 'FC TL',      key: 'fcTl',           w: ''     },
  { label: 'PM TL',      key: 'pmTl',           w: ''     },
  { label: 'Downtime',   key: 'downtime',       w: ''     },
  { label: 'Draw Plan',  key: 'drawPlan',       w: ''     },
  { label: 'Shift Time', key: 'shiftTime',      w: ''     },
];

const makeRows = () =>
  Array.from({ length: 10 }, (_, i) => ({
    id:          i + 1,
    check:       false,
    dt:          i + 1,
    theoSpeed:   3000,
    actualSpeed: '',
    coNum:       0,
    coTime:      0,
    coTl:        '',
    fcTl:        0,
    pmTl:        0,
    downtime:    0,
    drawPlan:    '',
    shiftTime:   480,
  }));

const TOTALS = ['30000','0','0','0','—','0','0','0','0','4800'];

const initialValues = {
  entryDate:     new Date().toISOString().split('T')[0],
  shift:         '',
  dieTeam:       '',
  groundTeam:    '',
  furnaceTeam:   '',
  shiftIncharge: '',
};

/* ══════════════════════════════════════════════════════════ */
const DrawShiftPlan = () => {
  const [rows, setRows] = useState(makeRows());

  const updateRow = (id, field, value) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik
          initialValues={initialValues}
          onSubmit={(v) => { console.log('Shift Plan:', v); alert('Saved!'); }}
        >
          {({ resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Form fields — single row ── */}
              <ModuleCard compact title="Shift Plan Entry" icon={<RefreshCcw size={13} className="text-blue-600" />}>
                <div className="grid grid-cols-6 gap-2">
                  <FormikInput  compact label="Entry Date"     name="entryDate"     type="date" />
                  <FormikSelect compact label="Shift"          name="shift"         options={['Select','A','B','C','General']} />
                  <FormikSelect compact label="Die Team"       name="dieTeam"       options={['Select','Team Alpha','Team Beta']} />
                  <FormikSelect compact label="Ground Team"    name="groundTeam"    options={['Select','Ground 1','Ground 2']} />
                  <FormikSelect compact label="Furnace Team"   name="furnaceTeam"   options={['Select','Furnace A','Furnace B']} />
                  <FormikSelect compact label="Shift Incharge" name="shiftIncharge" options={['Select','John Doe','Jane Smith']} />
                </div>
              </ModuleCard>

              {/* ── Action buttons — below form, above table ── */}
              <div className="flex justify-between items-center gap-2 flex-shrink-0">
                <ResetButton compact type="button" onClick={() => { resetForm(); setRows(makeRows()); }}>
                  Reset
                </ResetButton>
                <div className="flex gap-2">
                  <button type="button"
                    className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-[9px] font-bold uppercase hover:bg-orange-200 transition-all">
                    Modify
                  </button>
                  <SubmitButton compact type="submit">Submit Plan</SubmitButton>
                </div>
              </div>

              {/* ── Table — fills remaining height, scrolls internally ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        {TABLE_COLS.map(({ label, w }) => (
                          <th key={label}
                            className={`px-2 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0 ${w}`}>
                            {label === '✔'
                              ? <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />
                              : label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Checkbox */}
                          <td className="px-2 py-1 text-center border-r border-slate-100">
                            <input type="checkbox" checked={row.check}
                              onChange={e => updateRow(row.id, 'check', e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600" />
                          </td>
                          {/* DT number */}
                          <td className="px-2 py-1 text-xs font-bold text-slate-600 text-center border-r border-slate-100">
                            {row.dt}
                          </td>
                          {/* Theo Speed — read-only */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput defaultValue={row.theoSpeed} disabled />
                          </td>
                          {/* Actual Speed */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.actualSpeed}
                              onChange={e => updateRow(row.id, 'actualSpeed', e.target.value)} />
                          </td>
                          {/* C/O Num */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.coNum}
                              onChange={e => updateRow(row.id, 'coNum', e.target.value)} />
                          </td>
                          {/* C/O Time */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.coTime}
                              onChange={e => updateRow(row.id, 'coTime', e.target.value)} />
                          </td>
                          {/* C/O TL — read-only (calculated) */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput defaultValue={row.coTl} disabled />
                          </td>
                          {/* FC TL */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.fcTl}
                              onChange={e => updateRow(row.id, 'fcTl', e.target.value)} />
                          </td>
                          {/* PM TL */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.pmTl}
                              onChange={e => updateRow(row.id, 'pmTl', e.target.value)} />
                          </td>
                          {/* Downtime */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput value={row.downtime}
                              onChange={e => updateRow(row.id, 'downtime', e.target.value)} />
                          </td>
                          {/* Draw Plan — read-only */}
                          <td className="px-1 py-1 border-r border-slate-100">
                            <TInput defaultValue={row.drawPlan} disabled />
                          </td>
                          {/* Shift Time — read-only */}
                          <td className="px-1 py-1">
                            <TInput defaultValue={row.shiftTime} disabled />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Totals footer */}
                    <tfoot className="sticky bottom-0 bg-slate-800 text-white z-10">
                      <tr>
                        <td colSpan={2} className="px-3 py-2 text-[9px] font-black uppercase text-center border-r border-slate-600">
                          Total
                        </td>
                        {TOTALS.map((val, i) => (
                          <td key={i} className="px-2 py-2 border-r border-slate-600 last:border-0">
                            <div className="w-full h-6 bg-slate-700 rounded flex items-center justify-center text-[10px] font-bold">
                              {val}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Status footer */}
                <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3 flex-shrink-0">
                  <span className="text-[8px] text-slate-400 font-medium">DRAW SHIFT PLANNER v2.1</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-[8px] text-emerald-600 font-bold">
                    <CheckCircle2 size={10} /> System Status: Online
                  </span>
                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DrawShiftPlan;
