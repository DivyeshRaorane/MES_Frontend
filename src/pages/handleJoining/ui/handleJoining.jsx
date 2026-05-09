import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { Settings, Droplets, Thermometer, User, Calendar, Activity, Ruler, Search } from 'lucide-react';
import { FormikInput, FormikSelect, ModuleCard } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import FormHeader from '../../../components/header_template';

const HandleJoining = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialValues = {
        preformId: '',
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
        h2Flow3: { flow: 0, time: 0 },
        o2Line1Flow1: { flow: 0, time: 0 },
        o2Line1Flow2: { flow: 0, time: 0 },
        o2Line1Flow3: { flow: 0, time: 0 }
    };

    const calculateConsumption = (flow, time) => {
        return ((parseFloat(flow) || 0) * (parseFloat(time) || 0) / 1000).toFixed(3);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
            <div className="max-w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

                {/* Header Section */}
                 <FormHeader 
                          title="Handle Joining Control Center"
                          subtitle="MES Production Portal"
                          userName="Divyesh"
                          userRole="Software Developer"
                          icon={Activity}
                        />

                <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => console.log('Submitted Data:', values)}
                >
                    {({ values }) => (
                        <Form className="p-8 space-y-8">
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Section 1: Preform & WIP */}
                                <ModuleCard 
                                    title="Preform & WIP Details" 
                                    icon={<Settings size={18} className="text-indigo-600" />}
                                >
                                    <div className="space-y-6">
                                        <div className="flex items-end gap-3">
                                            <div className="flex-1">
                                                <FormikInput label="Preform ID" name="preformId" placeholder="Enter or Browse ID" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(true)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm h-[38px]"
                                            >
                                                <Search size={12} /> Browse
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {['wt', 'dia', 'cutoff', 'mfd'].map((field) => (
                                                <div key={field} className="flex justify-between items-center text-sm">
                                                    <span className="capitalize font-bold text-slate-400 text-[10px] uppercase">{field}</span>
                                                    <span className="font-semibold text-slate-700">{values[field]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ModuleCard>

                                {/* Section 2: Measurement Logs */}
                                <ModuleCard 
                                    title="Measurement Logs" 
                                    icon={<Ruler size={18} className="text-indigo-600" />}
                                >
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                                            {['dia1', 'dia2', 'dia3', 'dia4', 'dia5'].map((d, index) => (
                                                <FormikInput key={d} label={`Dia ${index + 1}`} name={d} type="number" placeholder="0.00" />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            <FormikInput label="Handle Length" name="handleLen" type="number" />
                                            <FormikInput label="Handle Diameter" name="handleDia" type="number" />
                                            <FormikSelect 
                                                label="Handle Type" 
                                                name="handleType" 
                                                options={['New', 'Rework']} 
                                            />
                                        </div>
                                    </div>
                                </ModuleCard>
                            </div>

                            {/* Section 3: Flame Recipe Parameters */}
                            <ModuleCard 
                                title="Flame Recipe Parameters" 
                                icon={<Droplets size={18} className="text-indigo-600" />}
                            >
                                <div className="overflow-hidden border border-slate-200 rounded-xl">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="p-3 font-bold text-[10px] uppercase">Parameter</th>
                                                <th className="p-3 font-bold text-[10px] uppercase text-center">Flow (LPM)</th>
                                                <th className="p-3 font-bold text-[10px] uppercase text-center">Time (Min)</th>
                                                <th className="p-3 font-bold text-[10px] uppercase text-right">Cons. (M3)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {['h2Flow1', 'h2Flow2', 'h2Flow3', 'o2Line1Flow1', 'o2Line1Flow2', 'o2Line1Flow3'].map((item) => (
                                                <tr key={item} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-3 font-medium text-slate-700 capitalize">{item.replace(/([A-Z]|\d+)/g, ' $1')}</td>
                                                    <td className="p-3">
                                                        <FormikInput name={`${item}.flow`} type="number" />
                                                    </td>
                                                    <td className="p-3">
                                                        <FormikInput name={`${item}.time`} type="number" />
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-emerald-600 font-bold bg-emerald-50/30">
                                                        {calculateConsumption(values[item].flow, values[item].time)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ModuleCard>

                            {/* Section 4: Remarks & Settings */}
                            
                                <div className="lg:col-span-2">
                                    
                                        <FormikInput 
                                            label="Additional Notes" 
                                            name="remarks" 
                                            as="textarea" 
                                            rows="4" 
                                            placeholder="Enter quality or process remarks..." 
                                        />
                                
                                </div>
                            

                            {/* Form Actions */}
                            <div className="flex justify-between gap-4 items-center pt-8 border-t border-slate-100">
                                <ResetButton type="reset">Reset Fields</ResetButton>
                                <SubmitButton type="submit">Save Joining Record</SubmitButton>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default HandleJoining;