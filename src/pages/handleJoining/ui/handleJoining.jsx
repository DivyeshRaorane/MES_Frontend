import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Settings, Droplets, Thermometer, User, Calendar, Activity, Ruler, Search } from 'lucide-react';
import SelectionModal from '../../../components/selectionModal';

const HandleJoining = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialValues = {
        preformId: '',
        batch: 'Auto-Batch-001',
        wt: 'Automatic',
        dia: 'Automatic',
        cutoff: 'Automatic',
        mfd: 'Automatic',
        shift: 'Day Shift',
        entryDate: new Date().toLocaleDateString(),
        entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        operatorName: 'System Admin',
        remarks: '',
        dia1: '', dia2: '', dia3: '', dia4: '', dia5: '',
        handleLen: '',
        handleDia: '',
        handleType: 'New',
        h2Flow1: { flow: 0, time: 0 },
        h2Flow2: { flow: 0, time: 0 },
        o2Line1Flow1: { flow: 0, time: 0 },
        o2Line1Flow2: { flow: 0, time: 0 },
        o2Line1Flow3: { flow: 0, time: 0 },
        o2Line2Flow1: { flow: 0, time: 0 },
        o2Line2Flow2: { flow: 0, time: 0 },
        o2Line2Flow3: { flow: 0, time: 0 },
    };

    const acceptedPreforms = [
        { id: 'P-101', batch: 'BT-992', wt: '45.2', dia: '120mm', status: 'Accepted' },
        { id: 'P-102', batch: 'BT-995', wt: '44.8', dia: '118mm', status: 'Accepted' },
        { id: 'P-103', batch: 'BT-998', wt: '46.1', dia: '122mm', status: 'Accepted' },
    ];

    const columns = [
        { key: 'id', label: 'Preform ID' },
        { key: 'batch', label: 'Batch No' },
        { key: 'wt', label: 'Weight' },
        { key: 'dia', label: 'Diameter' },
        { key: 'status', label: 'Status' },
    ];

    const calculateConsumption = (flow, time) => {
        return ((parseFloat(flow) || 0) * (parseFloat(time) || 0) / 1000).toFixed(3);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Activity size={28} /> Handle Joining Control Center
                        </h1>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                            <User size={14} /> <span>{initialValues.operatorName}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                            <Calendar size={14} /> <span>{initialValues.entryDate}</span>
                        </div>
                    </div>
                </div>

                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => console.log('Submitted Data:', values)}
                >
                    {({ values, setFieldValue }) => (
                        <>
                            <Form className="p-8 space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                    {/* Left Column: Preform & Expanded Dimensions */}
                                    <div className="space-y-6">
                                        <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-indigo-600 font-semibold flex items-center gap-2">
                                                    <Settings size={18} /> Preform & WIP
                                                </h3>
                                                {/* Browse Button inside the Section */}
                                                <button
                                                    type="button"
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="flex items-center gap-1.5 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-sm"
                                                >
                                                    <Search size={12} /> Browse
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preform ID</label>
                                                    <Field name="preformId" className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                                                </div>
                                                {['batch', 'wt', 'dia', 'cutoff', 'mfd'].map((field) => (
                                                    <div key={field} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0 text-sm">
                                                        <span className="capitalize text-slate-500">{field}</span>
                                                        <span className="font-semibold text-slate-700">{values[field]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Measurement Logs (Dia1 - Dia5) */}
                                        <section className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                                            <h3 className="text-indigo-600 font-semibold mb-4 flex items-center gap-2">
                                                <Ruler size={18} /> Measurement Logs (Dia)
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                {['dia1', 'dia2', 'dia3', 'dia4', 'dia5'].map((d, index) => (
                                                    <div key={d} className="flex items-center gap-3">
                                                        <label className="text-xs font-bold text-slate-400 w-12 uppercase italic">Dia {index + 1}</label>
                                                        <Field
                                                            name={d}
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-md focus:border-indigo-400 outline-none text-sm transition-colors"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Handle Len</label>
                                                    <Field name="handleLen" type="number" className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Handle Dia</label>
                                                    <Field name="handleDia" type="number" className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-md" />
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column: Recipe Table & Submission */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                            <h3 className="text-indigo-600 font-semibold mb-4 flex items-center gap-2">
                                                <Droplets size={18} /> Flame Recipe Parameters
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 text-slate-500">
                                                        <tr>
                                                            <th className="p-3 font-semibold uppercase tracking-tighter">Parameter</th>
                                                            <th className="p-3 font-semibold uppercase tracking-tighter">Flow (LPM)</th>
                                                            <th className="p-3 font-semibold uppercase tracking-tighter">Time (Min)</th>
                                                            <th className="p-3 font-semibold uppercase tracking-tighter text-right">Cons. (M3)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {['h2Flow1', 'h2Flow2', 'o2Line1Flow1', 'o2Line1Flow2', 'o2Line1Flow3'].map((item) => (
                                                            <tr key={item} className="hover:bg-slate-50/50 transition-colors">
                                                                <td className="p-3 font-medium text-slate-700 capitalize">{item.replace(/([A-Z]|\d+)/g, ' $1')}</td>
                                                                <td className="p-3">
                                                                    <Field name={`${item}.flow`} type="number" className="w-24 p-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-400 outline-none" />
                                                                </td>
                                                                <td className="p-3">
                                                                    <Field name={`${item}.time`} type="number" className="w-24 p-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-400 outline-none" />
                                                                </td>
                                                                <td className="p-3 text-right font-mono text-emerald-600 font-bold bg-emerald-50/30">
                                                                    {calculateConsumption(values[item].flow, values[item].time)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>

                                        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                                            <label className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-2">
                                                <Thermometer size={16} /> Remarks & Observations
                                            </label>
                                            <Field
                                                as="textarea"
                                                name="remarks"
                                                className="w-full p-3 bg-white border border-amber-200 rounded-lg h-24 outline-none focus:ring-2 focus:ring-amber-400"
                                                placeholder="Enter quality or process remarks..."
                                            />
                                        </div>

                                        <div className="flex justify-end gap-4 items-center">
                                            <button type="reset" className="text-slate-400 hover:text-slate-600 font-medium transition-colors">Clear All</button>
                                            <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transform transition-all active:scale-95">
                                                Save Record
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Form>

                            {/* REUSABLE SELECTION MODAL */}
                            <SelectionModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                title="Select Accepted Preform"
                                data={acceptedPreforms}
                                columns={columns}
                                onSelect={(selectedRow) => {
                                    // Update Formik state fields with data from selected row
                                    setFieldValue('preformId', selectedRow.id);
                                    setFieldValue('batch', selectedRow.batch);
                                    setFieldValue('wt', selectedRow.wt);
                                    setFieldValue('dia', selectedRow.dia);
                                    console.log("Selected Preform:", selectedRow);
                                }}
                            />
                        </>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default HandleJoining;