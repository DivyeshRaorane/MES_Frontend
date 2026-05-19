import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { AlertCircle, Search, Activity, ClipboardList } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

const pendingIds = [
  'TEFC21081044', 'TEF322227062', 'TEF522026022', 'TEFB22119021', 'TEF223134096',
  'TEF423278081', 'TEF423277100', 'TEF423289023', 'TEF523361010', 'TEF523388022',
  'TEF523127081', 'TEF523349072', 'TEF523349073', 'TEF523323108', 'TEF523329091',
  'TA2A22125052', 'TA2A22127053', 'TEF423006072', 'TEF623020250', 'TEF623248040',
  'TEF623032050', 'TA2A22136105', 'TEF623046062', 'TEF623490030', 'TEF723007040',
  'TEF423074022', 'TEF423028010',
];

const initialValues = {
  fiberId: '',
  dtNo: '',
  breakLen: '',
  breakType: '',
  category: '',
  remark: '',
  brkCollectedBy: '',
  entryDoneBy: '',
  mainBreakType: '',
  subReason: '',
  nextSubReason: '',
  distFromPeriphery: '',
  particleSize: '',
  flawSize: '',
  bsaRemark: '',
  bsaDoneBy: '',
};

/* ══════════════════════════════════════════════════════════ */
const DrawBrakAnalysis = () => {
  const [search, setSearch] = useState('');

  const filtered = pendingIds.filter(id =>
    id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik initialValues={initialValues} onSubmit={(v) => { console.log('Draw Break Analysis:', v); alert('Saved!'); }}>
          {({ resetForm }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Spool Entry</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>
              {/* ── 3-column grid ── */}
              <div className="grid grid-cols-2 gap-2 flex-1 h-auto">

                {/* ══ COL 1: Main Break Info ══ */}
                <ModuleCard compact title="Break Information" icon={<Activity size={13} className="text-blue-600" />}>
                  <div className="grid grid-cols-4 gap-1">
                    <FormikInput compact label="Fiber ID" name="fiberId" />
                    <FormikInput compact label="DT No." name="dtNo" />
                    <FormikInput compact label="Break Len" name="breakLen" type="number" />
                    <FormikSelect compact label="Break Type" name="breakType"
                      options={['Select', 'Particle', 'Neckdown', 'Cladding', 'Surface']} />
                    <FormikSelect compact label="Category" name="category"
                      options={['Select', 'Cat A', 'Cat B', 'Cat C']} />
                    <FormikInput compact label="Remark" name="remark" />
                    <FormikInput compact label="Brk Collected By" name="brkCollectedBy" />
                    <FormikInput compact label="Entry Done By" name="entryDoneBy" />
                  </div>
                </ModuleCard>

                {/* ══ COL 2: BSA Analysis ══ */}
                <ModuleCard compact title="BSA Analysis" icon={<ClipboardList size={13} className="text-indigo-600" />}>
                  <div className="grid grid-cols-4 gap-1">
                    <FormikSelect compact label="Main Break Type" name="mainBreakType"
                      options={['Select', 'Particle', 'Neckdown', 'Cladding', 'Surface']} />
                    <FormikSelect compact label="Sub Reason" name="subReason"
                      options={['Select', 'Internal Bubble', 'External Scratch', 'Other']} />
                    <FormikSelect compact label="Next Sub Reason" name="nextSubReason"
                      options={['Select', 'N-Sub 1', 'N-Sub 2', 'N-Sub 3']} />
                    <FormikInput compact label="Dist From Periphery" name="distFromPeriphery" type="number" />
                    <FormikInput compact label="Particle Size" name="particleSize" type="number" />
                    <FormikInput compact label="Flaw Size" name="flawSize" type="number" />
                    <FormikInput compact label="BSA Remark" name="bsaRemark" />
                    <FormikSelect compact label="BSA Done By" name="bsaDoneBy"
                      options={['Select', 'Analyst A', 'Analyst B', 'Supervisor']} />
                  </div>
                </ModuleCard>

                {/* ══ COL 3: BSA Pending IDs ══ */}
                
                <div className="col-span-2">
                  
                  <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    {/* Header with search */}
                    <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={12} className="text-rose-500" />
                        <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">BSA Pending IDs</span>
                        <span className="text-[8px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-bold">
                          {filtered.length}
                        </span>
                      </div>
                      {/* Search */}
                      <div className="relative">
                        <Search size={15} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          className="pl-6 pr-2 py-1 text-[9px] border border-slate-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-500/20 w-28"
                        />
                      </div>
                    </div>

                    {/* Scrollable ID grid */}
                    <div className="overflow-y-auto flex-1 p-2">
                      <div className="grid grid-cols-5 gap-1">
                        {filtered.map((id, i) => (
                          <div
                            key={i}
                            className="text-[9px] font-bold py-1 px-2 rounded border text-center cursor-pointer transition-all truncate bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600"
                            title={id}
                          >
                            {id}
                          </div>
                        ))}
                        {filtered.length === 0 && (
                          <div className="col-span-2 text-center text-[9px] text-slate-400 py-4">
                            No IDs match &quot;{search}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
</div>
             
              {/* ── end 3-col grid ── */}

              {/* ── Action buttons — below form ── */}


            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DrawBrakAnalysis;
