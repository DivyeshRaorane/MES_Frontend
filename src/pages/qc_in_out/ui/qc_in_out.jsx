import React, { useState, useRef } from 'react';
import { Scan, Trash2, Plus, ClipboardCheck } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { Formik, Form } from 'formik';

/* ── Simulate barcode fetch ── */
let testCounter = 1;
const fetchBarcode = (barcode) => ({
  barcode,
  fiber_type: 'Single Mode',
  colour: barcode.startsWith('C') ? 'Blue' : '—',
  qty_kms: (Math.random() * 10 + 1).toFixed(3),
  grade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
  pt_len: (Math.random() * 500 + 100).toFixed(1),
  scanned_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
});

const today = new Date().toISOString().split('T')[0];

const initialFormValues = {
  stage: 'QC',
  date: today,
  user: '',
  shift: '',
  barcode: '',
};

/* ══════════════════════════════════════════════════════════ */
const QCInOut = () => {
  const [rows, setRows] = useState([]);
  const scanRef = useRef(null);

  const addRow = (barcode, setFieldValue) => {
    if (!barcode.trim()) return;
    setRows(prev => [...prev, { id: Date.now(), ...fetchBarcode(barcode) }]);
    setFieldValue('barcode', '');
    setTimeout(() => scanRef.current?.focus(), 50);
  };

  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  const handleSave = (values) => {
    if (rows.length === 0) { alert('No scanned entries to submit.'); return; }
    console.log('QC In/Out Submit:', { header: values, rows });
    alert(`Submitted ${rows.length} entr${rows.length === 1 ? 'y' : 'ies'} successfully!`);
    setRows([]);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik initialValues={initialFormValues} onSubmit={() => { }}>
          {({ values, setFieldValue, resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Break Analysis</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
              {/* ── Header fields ── */}
              <ModuleCard compact title="QC In / Out Entry" icon={<ClipboardCheck size={13} className="text-blue-600" />}>
                <div className="flex flex-col gap-2">

                  {/* Stage + Date + User + Shift */}
                  <div className="grid grid-cols-4 gap-2">
                    <FormikInput compact label="Stage" name="stage" readOnly />
                    <FormikInput compact label="Date" name="date" type="date" />
                    <FormikSelect compact label="User" name="user"
                      options={['Select', 'User A', 'User B', 'User C', 'Senior Op']} />
                    <FormikSelect compact label="Shift" name="shift"
                      options={['Select', 'A', 'B', 'C']} />
                  </div>

                  {/* Barcode scan row */}
                  <div className="flex items-end gap-2 pt-1 border-t border-slate-100">
                    <div className="flex-1 max-w-sm">
                      <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5 block mb-0.5">
                        Scan Barcode ID
                      </label>
                      <input
                        ref={scanRef}
                        value={values.barcode}
                        onChange={e => setFieldValue('barcode', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRow(values.barcode, setFieldValue); } }}
                        placeholder="Scan or enter barcode..."
                        className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    {/* Scan button */}
                    <button type="button"
                      onClick={() => addRow(values.barcode, setFieldValue)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px]">
                      <Scan size={10} /> Scan
                    </button>
                    {/* Test button */}
                    <button type="button"
                      onClick={() => addRow(`TEST-${String(testCounter++).padStart(4, '0')}`, setFieldValue)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase hover:bg-amber-600 transition-all h-[28px]">
                      <Plus size={10} /> Test
                    </button>
                    {/* Row count */}
                    <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                      {rows.length} row{rows.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </ModuleCard>

              {/* ── Scanned entries table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <ClipboardCheck size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Scanned Entries</span>
                  {rows.length > 0 && (
                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
                      {rows.length}
                    </span>
                  )}
                </div>

                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        {['#', 'Barcode ID', 'Fiber Type', 'Colour', 'Qty (Kms)', 'Grade', 'PT Len', 'Scanned At', ''].map(h => (
                          <th key={h} className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-10 text-center text-[10px] text-slate-400">
                            No entries yet — scan a barcode or click Test
                          </td>
                        </tr>
                      ) : rows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100 w-8">{idx + 1}</td>
                          <td className="px-2 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.barcode}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.fiber_type}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.colour}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-emerald-700 font-bold border-r border-slate-100">{row.qty_kms}</td>
                          <td className="px-2 py-1.5 border-r border-slate-100">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${row.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                row.grade === 'B' ? 'bg-amber-100 text-amber-700' :
                                  'bg-rose-100 text-rose-700'
                              }`}>{row.grade}</span>
                          </td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.pt_len}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-400 border-r border-slate-100">{row.scanned_at}</td>
                          <td className="px-2 py-1.5 text-center">
                            <button type="button" onClick={() => removeRow(row.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 size={12} />
                            </button>
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
};

export default QCInOut;
