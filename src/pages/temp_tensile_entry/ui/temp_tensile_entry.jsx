import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Dumbbell, Plus, Minus } from 'lucide-react';
import { FormikInput } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table cell ── */
const TC = ({ name }) => (
    <Field name={name}
        className="w-full bg-transparent px-1.5 py-1 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-300 rounded border border-transparent focus:border-blue-200 transition-all text-center" />
);

const makeRow = () => ({
    dts_before: '',
    avg_before: '',
    peak_before: '',
    dts_after: '',
    avg_after: '',
    peak_after: '',
});

const initialValues = {
    rows: Array.from({ length: 3 }, makeRow),
};

const TensileEntry = () => (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
            <Formik initialValues={initialValues}
                onSubmit={(v) => { console.log('Tensile Entry:', v); alert('Saved!'); }}>
                {({ resetForm }) => (
                    <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

                        <FieldArray name="rows">
                            {({ push, remove, form }) => (
                                <div className="flex flex-col flex-1 min-h-0 gap-1.5">

                                    {/* Add / Remove */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button type="button" onClick={() => push(makeRow())}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all">
                                            <Plus size={11} /> Add Row
                                        </button>
                                        <button type="button"
                                            onClick={() => form.values.rows.length > 1 && remove(form.values.rows.length - 1)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">
                                            <Minus size={11} /> Remove Row
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <label className="font-bold text-slate-800 uppercase text-[10px] whitespace-nowrap">
                                                Fiber ID
                                            </label>

                                            <FormikInput
                                                name="fiber_id"
                                                type="text"
                                            />
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                        <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                                            <Dumbbell size={12} className="text-indigo-600" />
                                            <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Tensile Strength Entry</span>
                                        </div>

                                        <div className="overflow-auto flex-1">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="sticky top-0 z-10">
                                                    {/* Group header */}
                                                    <tr className="bg-slate-800 text-white">
                                                        <th rowSpan={2} className="px-3 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center w-12 align-middle">SR.NO</th>
                                                        <th colSpan={3} className="px-3 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-700">
                                                            Before Aging
                                                        </th>
                                                        <th colSpan={3} className="px-3 py-1.5 text-[8px] font-bold uppercase text-center bg-orange-700">
                                                            After Aging
                                                        </th>
                                                    </tr>
                                                    <tr className="bg-slate-700 text-slate-200">
                                                        {[
                                                            'Dynamic Tensile Strength (GPA)',
                                                            'Avg Strip Force (N)',
                                                            'Peak Strip Force (N)',
                                                        ].map(h => (
                                                            <th key={`b-${h}`} className="px-3 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800/60 whitespace-nowrap">{h}</th>
                                                        ))}
                                                        {[
                                                            'Dynamic Tensile Strength (GPA)',
                                                            'Avg Strip Force (N)',
                                                            'Peak Strip Force (N)',
                                                        ].map(h => (
                                                            <th key={`a-${h}`} className="px-3 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 last:border-0 bg-orange-800/60 whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {form.values.rows.map((_, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-3 py-2 text-xs font-bold text-slate-400 text-center border-r border-slate-100 bg-slate-50/50">
                                                                {idx + 1}
                                                            </td>
                                                            {/* Before */}
                                                            <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20"><TC name={`rows.${idx}.dts_before`} /></td>
                                                            <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20"><TC name={`rows.${idx}.avg_before`} /></td>
                                                            <td className="px-1 py-1 border-r border-slate-200 bg-blue-50/20"><TC name={`rows.${idx}.peak_before`} /></td>
                                                            {/* After */}
                                                            <td className="px-1 py-1 border-r border-slate-100 bg-orange-50/20"><TC name={`rows.${idx}.dts_after`} /></td>
                                                            <td className="px-1 py-1 border-r border-slate-100 bg-orange-50/20"><TC name={`rows.${idx}.avg_after`} /></td>
                                                            <td className="px-1 py-1 bg-orange-50/20"><TC name={`rows.${idx}.peak_after`} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            )}
                        </FieldArray>

                        {/* ── Actions ── */}
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

export default TensileEntry;
