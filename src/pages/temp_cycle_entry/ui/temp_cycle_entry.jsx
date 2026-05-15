import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Wind } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Compact table cell ── */
const TC = ({ name, type = 'text', placeholder = '', w = 'w-16' }) => (
  <Field name={name} type={type} placeholder={placeholder}
    className={`${w} bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-center transition-all`} />
);

/* ── Compact select ── */
const TS = ({ name, options }) => (
  <div className="relative">
    <Field as="select" name={name}
      className="w-20 appearance-none bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer pr-4">
      {options.map(o => <option key={o}>{o}</option>)}
    </Field>
    <span className="pointer-events-none absolute right-0.5 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
  </div>
);

const TEMPS      = [23, -60, 85];
const NUM_CYCLES = 7;

/* Build initial values */
const buildInit = () => {
  const v = { result: '', phys_obs: '', prepared_by: '', checked_by: '' };
  for (let c = 1; c <= NUM_CYCLES; c++) {
    TEMPS.forEach(t => {
      const k = `c${c}_t${t < 0 ? 'n' + Math.abs(t) : t}`;
      v[`${k}_date`]    = '';
      v[`${k}_time`]    = '';
      v[`${k}_a1310`]   = '';
      v[`${k}_a1550`]   = '';
      v[`${k}_a1625`]   = '';
      v[`${k}_ch1310`]  = '';
      v[`${k}_ch1550`]  = '';
      v[`${k}_ch1625`]  = '';
      v[`${k}_opr`]     = '';
      v[`${k}_remark`]  = '';
    });
  }
  return v;
};

const CycleWiseEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 overflow-hidden">
      <Formik initialValues={buildInit()}
        onSubmit={(v) => { console.log('Cycle Entry:', v); alert('Saved!'); }}>
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

            {/* ── Table ── */}
            <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                <Wind size={12} className="text-blue-600" />
                <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Cycle Wise Attenuation Log</span>
              </div>

              <div className="overflow-auto flex-1">
                <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-100 border-t-2 border-slate-300">
                        <td colSpan={2} className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">Fiber ID</span>
                          <Field name="fiber_id" placeholder=""
                            className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none" />
                        </div>
                      </td>
                      <td colSpan={2} className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-600 uppercase">Result</span>
                          <div className="relative">
                            <Field as="select" name="result"
                              className="appearance-none bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none pr-5 cursor-pointer w-28">
                              {['Select','PASS','FAIL','RE-TEST'].map(o => <option key={o}>{o}</option>)}
                            </Field>
                            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
                          </div>
                        </div>
                      </td>
                      <td colSpan={3} className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">PHY/D. Observation</span>
                          <Field name="phys_obs" placeholder=""
                            className="flex-1 bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none" />
                        </div>
                      </td>
                      <td colSpan={2} className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">Prepared By</span>
                          <div className="relative">
                            <Field as="select" name="prepared_by"
                              className="appearance-none bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none pr-5 cursor-pointer w-28">
                              {['Select','User A','User B','Manager'].map(o => <option key={o}>{o}</option>)}
                            </Field>
                            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
                          </div>
                        </div>
                      </td>
                      <td colSpan={3} className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">Checked By</span>
                          <div className="relative">
                            <Field as="select" name="checked_by"
                              className="appearance-none bg-white border border-slate-200 rounded px-2 py-0.5 text-[10px] outline-none pr-5 cursor-pointer w-28">
                              {['Select','QA Lead','Manager','Supervisor'].map(o => <option key={o}>{o}</option>)}
                            </Field>
                            <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 text-[8px]">▾</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {/* Group header */}
                    <tr className="bg-slate-800 text-white">
                      <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center w-16 align-middle">No. of Cycle</th>
                      <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center w-14 align-middle">Temp (°C)</th>
                      <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Date</th>
                      <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Time</th>
                      <th colSpan={3} className="px-2 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800">Attenuation in DB</th>
                      <th colSpan={3} className="px-2 py-1.5 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-amber-700">Change in Attenuation in DB</th>
                      <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase border-r border-slate-600 text-center align-middle">Operator</th>
                      <th rowSpan={2} className="px-2 py-2 text-[8px] font-bold uppercase text-center align-middle">Remarks</th>
                    </tr>
                    <tr className="bg-slate-700 text-slate-200">
                      {['1310 MM','1550 MM','1625 MM'].map(h => (
                        <th key={h} className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-blue-800/60">{h}</th>
                      ))}
                      {['1310 MM\n<0.05','1550 MM\n<0.05','1625 MM\n<0.05'].map((h, i) => (
                        <th key={i} className="px-2 py-1 text-[8px] font-bold uppercase text-center border-r border-slate-600 bg-amber-700/60 whitespace-pre">{h}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {Array.from({ length: NUM_CYCLES }, (_, ci) => {
                      const cycleNo = ci + 1;
                      return TEMPS.map((temp, ti) => {
                        const k = `c${cycleNo}_t${temp < 0 ? 'n' + Math.abs(temp) : temp}`;
                        return (
                          <tr key={`${cycleNo}-${temp}`}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${ti === 0 ? 'border-t-2 border-t-slate-300' : ''}`}>
                            {/* Cycle No — only on first temp row */}
                            {ti === 0 && (
                              <td rowSpan={3} className="px-2 py-1 text-xs font-bold text-slate-600 text-center border-r border-slate-200 bg-slate-50/80 align-middle">
                                {cycleNo}
                              </td>
                            )}
                            <td className="px-2 py-1 text-xs font-bold text-center border-r border-slate-100 whitespace-nowrap">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                temp === 23  ? 'bg-blue-100 text-blue-700' :
                                temp === -60 ? 'bg-indigo-100 text-indigo-700' :
                                               'bg-rose-100 text-rose-700'
                              }`}>{temp}°C</span>
                            </td>
                            <td className="px-1 py-1 border-r border-slate-100"><TC name={`${k}_date`} type="date" w="w-24" /></td>
                            <td className="px-1 py-1 border-r border-slate-100"><TC name={`${k}_time`} type="time" w="w-20" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20"><TC name={`${k}_a1310`} placeholder="—" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20"><TC name={`${k}_a1550`} placeholder="—" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-blue-50/20"><TC name={`${k}_a1625`} placeholder="—" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-amber-50/20"><TC name={`${k}_ch1310`} placeholder="—" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-amber-50/20"><TC name={`${k}_ch1550`} placeholder="—" /></td>
                            <td className="px-1 py-1 border-r border-slate-100 bg-amber-50/20"><TC name={`${k}_ch1625`} placeholder="—" /></td>
                            <td className="px-1 py-1 border-r border-slate-100">
                              <TS name={`${k}_opr`} options={['Select','Op A','Op B','Op C']} />
                            </td>
                            <td className="px-1 py-1">
                              <TC name={`${k}_remark`} placeholder="Remark" w="w-24" />
                            </td>
                          </tr>
                        );
                      });
                    })}

                    {/* Max / Min Change rows */}
                    {['Max. Change in Attenuation', 'Min. Change in Attenuation'].map(label => (
                      <tr key={label} className="bg-slate-50 border-t-2 border-slate-300">
                        <td colSpan={4} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 text-right border-r border-slate-200">{label}</td>
                        {[0,1,2].map(i => (
                          <td key={i} className="px-1 py-1 border-r border-slate-100 bg-amber-50/30">
                            <TC name={`${label.toLowerCase().replace(/\W+/g,'_')}_${i}`} placeholder="—" />
                          </td>
                        ))}
                        <td colSpan={4} />
                      </tr>
                    ))}

                    {/* Result / Footer row */}
                    
                  </tbody>
                </table>
              </div>
            </div>

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

export default CycleWiseEntry;
