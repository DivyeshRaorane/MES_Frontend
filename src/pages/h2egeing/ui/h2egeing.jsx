import React from 'react';
import { Formik, Form, Field } from 'formik';
import { FlaskConical, AlertCircle } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Auto-generate batch ID ── */
const makeBatchId = (tankNo, date) => {
  if (!tankNo || tankNo === 'Select' || !date) return '';
  const d = date.replace(/-/g, '');
  const t = tankNo.replace(/\D/g, '').padStart(2, '0');
  return `H2G-${d}-T${t}`;
};

const today = new Date().toISOString().split('T')[0];
const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

/* ── Table row definitions ── */
const TABLE_ROWS = [
  { key: 'date', label: 'Date' },
  { key: 'attn_1240', label: 'Attn 1240' },
  { key: 'attn_1310', label: 'Attn 1310' },
  { key: 'attn_1383_oh', label: 'Attn 1383(OH)' },
  { key: 'attn_1550', label: 'Attn 1550' },
  { key: 'attn_1625', label: 'Attn 1625' },
  { key: 'attn_testing_opr', label: 'Attn Testing Opr' },
];

const PERIODS = ['before', 'after', '14_days'];

/* Build flat initialValues for the table */
const tableInit = TABLE_ROWS.reduce((acc, row) => {
  PERIODS.forEach(p => { acc[`${row.key}_${p}`] = ''; });
  return acc;
}, {});

const initialValues = {
  tank_no: '',
  batch_id: '',
  date: today,
  time: nowTime,
  operator: '',
  ...tableInit,
};

/* ── Compact editable table cell ── */
const TCell = ({ name }) => (
  <Field name={name}
    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-center" />
);

/* ══════════════════════════════════════════════════════════ */
const H2Ageing = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

      <Formik
        initialValues={initialValues}
        onSubmit={(v) => { console.log('H2 Ageing:', v); alert('Saved!'); }}
      >
        {({ values, setFieldValue, resetForm }) => {
          const syncBatch = (tank, date) =>
            setFieldValue('batch_id', makeBatchId(tank, date));

          return (
            <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Break Analysis</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
              {/* ── Header fields ── */}
              <ModuleCard compact title="H2 Ageing Entry" icon={<FlaskConical size={13} className="text-blue-600" />}>
                <div className="grid grid-cols-5 gap-2">
                  <FormikSelect
                    compact label="Select Tank No" name="tank_no"
                    options={['Select', 'Tank 01', 'Tank 02', 'Tank 03', 'Tank 04', 'Tank 05']}
                    onChange={(e) => {
                      setFieldValue('tank_no', e.target.value);
                      syncBatch(e.target.value, values.date);
                    }}
                  />
                  <FormikInput
                    compact label="Batch ID (Auto)" name="batch_id"
                    readOnly placeholder="Auto-generated..."
                  />
                  <FormikInput
                    compact label="Date" name="date" type="date"
                    onChange={(e) => {
                      setFieldValue('date', e.target.value);
                      syncBatch(values.tank_no, e.target.value);
                    }}
                  />
                  <FormikInput compact label="Time" name="time" type="time" />
                   <FormikSelect compact label="Operator" name="operator"
                      options={['Select', 'Operator A', 'Operator B', 'Operator C', 'Senior Op']} />
                </div>
              </ModuleCard>

              {/* ── Measurement table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <AlertCircle size={12} className="text-indigo-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Measurement Data</span>
                </div>

                <div className="overflow-y-auto flex-1 p-3">
                  <table className="w-full border-collapse">
                    {/* Column headers */}
                    <thead>
                      <tr>
                        {/* empty top-left cell */}
                        <th className="w-36 pb-2" />
                        {['Before', 'After', '14 Days'].map(h => (
                          <th key={h}
                            className="pb-2 px-4 text-sm font-bold text-slate-700 text-center">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TABLE_ROWS.map(({ key, label }) => (
                        <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                          {/* Row label */}
                          <td className="py-2 pr-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                            {label}
                          </td>
                          {/* Before / After / 14 Days cells */}
                          {PERIODS.map(period => (
                            <td key={period} className="py-2 px-4">
                              <TCell name={`${key}_${period}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </Form>
          );
        }}
      </Formik>
    </div>
  </div>
);

export default H2Ageing;
