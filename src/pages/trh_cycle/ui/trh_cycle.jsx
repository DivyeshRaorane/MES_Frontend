import React, { useState } from 'react';
import { Thermometer, Timer, Activity, Layers, UserCheck, PlayCircle } from 'lucide-react';
import FormField from '../../../components/formInputs';

const TRH_Cycle = () => {
    const [activeCycle, setActiveCycle] = useState(1);

    // Mock data structure for the 4 cycles shown in your image
    const cycles = [
        { id: 1, steps: [{ temp: 23, rh: 50 }, { temp: 85, rh: 95 }, { temp: 85, rh: 95 }, { temp: -10, rh: 0 }] },
        { id: 2, steps: [{ temp: 23, rh: 50 }, { temp: 85, rh: 95 }, { temp: 85, rh: 95 }, { temp: -10, rh: 0 }] },
        { id: 3, steps: [{ temp: 23, rh: 50 }, { temp: 85, rh: 95 }, { temp: 85, rh: 95 }, { temp: -10, rh: 0 }] },
        { id: 4, steps: [{ temp: 23, rh: 50 }, { temp: 85, rh: 95 }, { temp: 85, rh: 95 }, { temp: -10, rh: 0 }] },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 p-6 bg-slate-50 min-h-screen">

            {/* 1. Header Metadata Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                    <Layers className="text-violet-600" size={22} />
                    <h2 className="text-lg font-bold text-slate-800">Test Configuration & Initial Attenuation</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-4">
                    <FormField label="Start Date" type="date" />
                    <FormField label="Start Time" type="time" />
                    <FormField label="End Date" type="date" />
                    <FormField label="End Time" type="time" />

                    {/* NEW LINE: Initial Attenuation Card */}
                    <div className="col-span-full mt-2">
                        <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100 flex flex-col md:flex-row md:items-center gap-6 shadow-sm">
                            <div className="flex items-center gap-3 min-w-[180px]">
                                <div className="bg-violet-600 p-2 rounded-lg text-white">
                                    <Activity size={18} />
                                </div>
                                <span className="text-sm font-black text-violet-800 uppercase tracking-wider">Initial Attenuation</span>
                            </div>

                            <div className="flex flex-1 gap-4">
                                <div className="flex-1 max-w-[200px]">
                                    <FormField label="AT 1310 NM" placeholder="Value" />
                                </div>
                                <div className="flex-1 max-w-[200px]">
                                    <FormField label="AT 1550 NM" placeholder="Value" />
                                </div>
                                <div className="flex-1 max-w-[200px]">
                                    <FormField label="AT 1625 NM" placeholder="Value" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <FormField label="Fibre ID" />
                    <FormField label="Preform ID" />
                    <FormField label="Tower No" />
                    <FormField label="Spool ID" />
                    <FormField label="Testing Standard" type="select" options={["IEC", "TIA", "ISO"]} />
                    <FormField label="Length" />
                    <FormField label="Marker A" />
                    <FormField label="Marker B" />
                    <div className="md:col-span-2">
                        <FormField label="Remark" placeholder="General test notes..." />
                    </div>
                </div>
            </div>

            {/* 2. Cycle Data Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <PlayCircle size={18} className="text-orange-500" />
                        Environmental Cycles (Temperature/Humidity)
                    </h3>
                    <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
                        {[1, 2, 3, 4].map(num => (
                            <button
                                key={num}
                                onClick={() => setActiveCycle(num)}
                                className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${activeCycle === num ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`}
                            >
                                Cycle {num}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-7 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider p-3 text-center">
                        <div className="flex items-center justify-center gap-1"><Thermometer size={12} /> Temp (°C)</div>
                        <div className="flex items-center justify-center gap-1"><Timer size={12} /> RH (%)</div>
                        <div>TRH Date</div>
                        <div>TRH Time</div>
                        <div className="col-span-2 border-x border-slate-700">Attenuation (dB/km) [1310 | 1550 | 1625]</div>
                        <div>Tested By</div>
                    </div>

                    {/* Table Body - Only showing active cycle to keep UI clean */}
                    <div className="divide-y divide-slate-100">
                        {cycles.find(c => c.id === activeCycle).steps.map((step, idx) => (
                            <div key={idx} className="grid grid-cols-7 gap-4 p-3 items-center hover:bg-orange-50/30 transition-colors">
                                <div className="text-center font-bold text-slate-700 bg-slate-100 py-2 rounded-lg">{step.temp}°C</div>
                                <div className="text-center font-bold text-blue-600 bg-blue-50 py-2 rounded-lg">{step.rh}%</div>
                                <FormField type="date" />
                                <FormField type="time" />
                                <div className="col-span-2 flex gap-2">
                                    <FormField placeholder="1310" />
                                    <FormField placeholder="1550" />
                                    <FormField placeholder="1625" />
                                </div>
                                <FormField type="select" options={["Divyesh", "Admin", "Operator"]} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4">
                <button className="px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all">SAVE DRAFT</button>
                <button className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center gap-2">
                    <UserCheck size={18} /> COMPLETE TEST
                </button>
            </div>
        </div>
    );
};

export default TRH_Cycle;