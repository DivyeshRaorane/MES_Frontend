import React, { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import { ShieldCheck, Scan, ClipboardCheck, User, Plus, Save, Trash2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── helpers ── */
const today   = new Date().toISOString().split('T')[0];
const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

/* Simulate auto-fetch from barcode */
const fetchBarcodeData = (barcode) => ({
  fiber_type:     'Single Mode',
  colour_applied: barcode.startsWith('C') ? 'Blue' : '',
  qty_kms:        (Math.random() * 10 + 1).toFixed(3),
  dt_id:          `DT-${Math.floor(Math.random() * 900 + 100)}`,
  preform_id:     `PRF-${Math.floor(Math.random() * 9000 + 1000)}`,
});

let testCounter = 1;

const initialFormValues = {
  /* verification type */
  pv_type:        '',          // 'online' | 're_pv'
  fiber_category: '',          // 'colour' | 'natural' | 'fr'
  colour_select:  '',
  k_value:        '',
  /* personnel */
  pv_operator:    '',
  date:           today,
  time:           nowTime(),
  shift:          '',
  /* instructions */
  pv_instruction: '',
  pv_remark:      '',
  /* scan */
  barcode:        '',
};

/* ══════════════════════════════════════════════════════════ */
const PVEntry = () => {
  const [tableRows, setTableRows]   = useState([]);
  const barcodeRef                  = useRef(null);

  /* Add a row from scan or test button */
  const addRow = (barcode, formValues) => {
    if (!barcode.trim()) return;
    const fetched = fetchBarcodeData(barcode);
    setTableRows(prev => [...prev, {
      id:             Date.now(),
      barcode,
      fiber_type:     fetched.fiber_type,
      colour_applied: fetched.colour_applied || (formValues.fiber_category === 'colour' ? formValues.colour_select : '—'),
      qty_kms:        fetched.qty_kms,
      dt_id:          fetched.dt_id,
      preform_id:     fetched.preform_id,
      /* fixed form data snapshot */
      pv_type:        formValues.pv_type,
      fiber_category: formValues.fiber_category,
      operator:       formValues.pv_operator,
      date:           formValues.date,
      shift:          formValues.shift,
      instruction:    formValues.pv_instruction,
      remark:         formValues.pv_remark,
    }]);
  };

  const removeRow = (id) => setTableRows(prev => prev.filter(r => r.id !== id));

  const handleSave = (formValues) => {
    if (tableRows.length === 0) { alert('No scanned rows to save.'); return; }
    console.log('Saving to DB:', { fixed: formValues, rows: tableRows });
    alert(`Saved ${tableRows.length} row(s) successfully!`);
    setTableRows([]);   // clear table only — form stays
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik initialValues={initialFormValues} onSubmit={() => {}}>
          {({ values, setFieldValue, resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Top section: form fields ── */}
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 flex-shrink-0">

                {/* ── Verification Type ── */}
                <ModuleCard compact title="Verification Type" icon={<ShieldCheck size={13} className="text-blue-600" />}>
                  <div className="flex flex-col gap-2">
                    {/* Online PV / Re-PV — mutually exclusive */}
                    <div className="flex gap-4">
                      {[
                        { val: 'online', label: 'Online Physical Verification', color: 'text-blue-600' },
                        { val: 're_pv',  label: 'Re-Physical Verification',     color: 'text-indigo-600' },
                      ].map(({ val, label, color }) => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={values.pv_type === val}
                            onChange={() => {
                              setFieldValue('pv_type', values.pv_type === val ? '' : val);
                              setFieldValue('fiber_category', '');
                              setFieldValue('colour_select', '');
                            }}
                            className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                          />
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${values.pv_type === val ? color : 'text-slate-600'} group-hover:${color} transition-colors`}>
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Sub-checkboxes — only when a type is selected */}
                    {values.pv_type && (
                      <div className="flex gap-4 pt-1 border-t border-slate-100">
                        {[
                          { val: 'colour',  label: 'Colour'  },
                          { val: 'natural', label: 'Natural' },
                          { val: 'fr',      label: 'FR'      },
                        ].map(({ val, label }) => (
                          <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={values.fiber_category === val}
                              onChange={() => {
                                setFieldValue('fiber_category', values.fiber_category === val ? '' : val);
                                setFieldValue('colour_select', '');
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-600"
                            />
                            <span className={`text-[10px] font-bold uppercase ${values.fiber_category === val ? 'text-emerald-600' : 'text-slate-600'}`}>
                              {label}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Colour + K dropdowns — only when Colour is selected */}
                    {values.fiber_category === 'colour' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <FormikSelect compact label="Select Colour" name="colour_select"
                          options={['Select','Blue','Red','Green','Yellow','White','Orange','Violet']} />
                        <FormikSelect compact label="K Value" name="k_value"
                          options={['Select','1K','2K','4K','8K','12K','24K']} />
                      </div>
                    )}
                  </div>
                </ModuleCard>

                {/* ── Personnel & Timing ── */}
                <ModuleCard compact title="Personnel & Timing" icon={<User size={13} className="text-orange-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <FormikSelect compact label="PV Operator" name="pv_operator"
                      options={['Select','Operator A','Operator B','Operator C','Senior Op']} />
                    <FormikInput  compact label="Date"  name="date"  type="date" />
                    <FormikInput  compact label="Time"  name="time"  type="time" />
                    <FormikSelect compact label="Shift" name="shift" options={['Select','A','B','C']} />
                  </div>
                </ModuleCard>

                {/* ── Instructions & Remarks ── */}
                <ModuleCard compact title="Instructions & Remarks" icon={<ClipboardCheck size={13} className="text-emerald-600" />}>
                  <div className="flex flex-col gap-2">
                    <FormikTextarea compact label="PV Instruction" name="pv_instruction" rows={2} placeholder="Enter PV instructions..." />
                    <FormikTextarea compact label="PV Remark"      name="pv_remark"      rows={2} placeholder="Enter remarks..." />
                  </div>
                </ModuleCard>
              </div>

              {/* ── Barcode scan row ── */}
              <div className="flex items-end gap-2 flex-shrink-0">
                <div className="flex-1 max-w-sm">
                  <FormikInput
                    compact
                    label="Scan Barcode"
                    name="barcode"
                    placeholder="Scan or enter barcode..."
                    innerRef={barcodeRef}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRow(values.barcode, values);
                        setFieldValue('barcode', '');
                        setTimeout(() => barcodeRef.current?.focus(), 50);
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { addRow(values.barcode, values); setFieldValue('barcode', ''); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 transition-all h-[28px]"
                >
                  <Scan size={10} /> Scan
                </button>
                {/* Test button — simulates a scan */}
                <button
                  type="button"
                  onClick={() => {
                    const testBarcode = `TEST-${String(testCounter++).padStart(4,'0')}`;
                    addRow(testBarcode, values);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase hover:bg-amber-600 transition-all h-[28px]"
                >
                  <Plus size={10} /> Test Scan
                </button>
                <span className="text-[9px] text-slate-400 font-medium">
                  {tableRows.length} row{tableRows.length !== 1 ? 's' : ''} scanned
                </span>
              </div>

              {/* ── Scanned rows table ── */}
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <ClipboardCheck size={12} className="text-blue-600" />
                  <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Scanned Entries</span>
                  {tableRows.length > 0 && (
                    <span className="ml-1 text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                      {tableRows.length}
                    </span>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="border-b border-slate-200">
                        {['#','Barcode','DT ID','Preform ID','Fiber Type','Colour Applied','Qty (Kms)','PV Type','Category','Operator','Date','Shift',''].map(h => (
                          <th key={h} className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-4 py-8 text-center text-[10px] text-slate-400">
                            No entries yet — scan a barcode or click Test Scan
                          </td>
                        </tr>
                      ) : tableRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-2 py-1.5 text-[9px] font-bold text-slate-400 border-r border-slate-100">{idx + 1}</td>
                          <td className="px-2 py-1.5 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.barcode}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.dt_id}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100">{row.preform_id}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.fiber_type}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.colour_applied || '—'}</td>
                          <td className="px-2 py-1.5 text-xs font-mono text-emerald-700 font-bold border-r border-slate-100">{row.qty_kms}</td>
                          <td className="px-2 py-1.5 border-r border-slate-100">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                              row.pv_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {row.pv_type === 'online' ? 'Online PV' : row.pv_type === 're_pv' ? 'Re-PV' : '—'}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100 capitalize">{row.fiber_category || '—'}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.operator || '—'}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.date}</td>
                          <td className="px-2 py-1.5 text-xs text-slate-600 border-r border-slate-100">{row.shift || '—'}</td>
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

              {/* ── Save + Reset below table ── */}
              <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
                <ResetButton compact type="button" onClick={() => { resetForm(); setTableRows([]); }}>
                  Reset All
                </ResetButton>
                <SubmitButton
                  type="button"
                  onClick={() => handleSave(values)}
                  disabled={tableRows.length === 0}
                  >
                  <Save size={12} /> Save {tableRows.length > 0 ? `(${tableRows.length})` : ''}
                </SubmitButton>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PVEntry;
