import React, { useState, useRef } from 'react';
import { PlayCircle, Upload, CheckSquare, Users, FileText, Trash2 } from 'lucide-react';
import { ModuleCard } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

/* ── Dummy customer specs ── */
const CUSTOMER_SPECS = [
  { value: 'SPEC-G652D', label: 'G.652.D — Standard SMF' },
  { value: 'SPEC-G657A1', label: 'G.657.A1 — Bend Insensitive' },
  { value: 'SPEC-G657A2', label: 'G.657.A2 — High Bend Insensitive' },
  { value: 'SPEC-G654E', label: 'G.654.E — Ultra Low Loss' },
  { value: 'SPEC-G651', label: 'G.651 — Multimode 50/125' },
  { value: 'SPEC-CUSTOM1', label: 'Custom Spec — Batch A' },
  { value: 'SPEC-CUSTOM2', label: 'Custom Spec — Batch B' },
];

/* ── Dummy fiber table data ── */
const DUMMY_FIBERS = [
  { id: 'FIB-001', fiber_id: 'TEF524220', length: '450.320', remark: 'Normal', status: 'Available' },
  { id: 'FIB-002', fiber_id: 'TEF524195', length: '380.100', remark: 'Normal', status: 'Available' },
  { id: 'FIB-003', fiber_id: 'TEF524194', length: '512.750', remark: 'Hold', status: 'On Hold' },
  { id: 'FIB-004', fiber_id: 'TEF524180', length: '290.000', remark: 'Normal', status: 'Available' },
  { id: 'FIB-005', fiber_id: 'TEF524175', length: '601.200', remark: 'Rework', status: 'Rework' },
  { id: 'FIB-006', fiber_id: 'TEF524160', length: '420.500', remark: 'Normal', status: 'Available' },
  { id: 'FIB-007', fiber_id: 'TEF524145', length: '355.800', remark: 'Normal', status: 'Available' },
  { id: 'FIB-008', fiber_id: 'TEF524130', length: '480.000', remark: 'Inspection', status: 'On Hold' },
  { id: 'FIB-009', fiber_id: 'TEF524115', length: '390.600', remark: 'Normal', status: 'Available' },
  { id: 'FIB-010', fiber_id: 'TEF524100', length: '525.300', remark: 'Normal', status: 'Available' },
];

/* ══════════════════════════════════════════════════════════ */
const CustomerAllocation = () => {
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [uploadEnabled, setUploadEnabled] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [checkedRows, setCheckedRows] = useState({});
  const [allChecked, setAllChecked] = useState(false);
  const fileRef = useRef(null);

  /* ── Dropdown select → add to side box ── */
  const [dropdownVal, setDropdownVal] = useState('');

  const addSpec = (val) => {
    if (!val || selectedSpecs.includes(val)) return;
    setSelectedSpecs(prev => [...prev, val]);
    setDropdownVal('');
  };

  const removeSpec = (val) => setSelectedSpecs(prev => prev.filter(v => v !== val));

  /* ── File upload ── */
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setUploadedFile(f);
  };

  /* ── Run Allocation — distribute fibers across selected specs ── */
  const runAllocation = () => {
    if (selectedSpecs.length === 0) { alert('Please select at least one customer spec.'); return; }
    /* Distribute dummy fibers round-robin across selected specs */
    const enriched = DUMMY_FIBERS.map((f, i) => ({
      ...f,
      spec: selectedSpecs[i % selectedSpecs.length],
      spec_label: CUSTOMER_SPECS.find(s => s.value === selectedSpecs[i % selectedSpecs.length])?.label || '',
    }));
    setTableData(enriched);
    setCheckedRows({});
    setAllChecked(false);
  };

  /* ── Row checkbox ── */
  const toggleRow = (id) => setCheckedRows(prev => ({ ...prev, [id]: !prev[id] }));

  /* ── Select all ── */
  const toggleAll = () => {
    const next = !allChecked;
    setAllChecked(next);
    const map = {};
    tableData.forEach(r => { map[r.id] = next; });
    setCheckedRows(map);
  };

  /* ── Submit allocation ── */
  const handleSubmit = () => {
    const selected = tableData.filter(r => checkedRows[r.id]);
    if (selected.length === 0) { alert('Please select at least one fiber row to allocate.'); return; }
    console.log('Allocating to customer:', selectedSpecs, 'Fibers:', selected);
    alert(`Allocated ${selected.length} fiber(s) to selected customer spec(s).`);
    setCheckedRows({});
    setAllChecked(false);
  };

  const selectedCount = tableData.filter(r => checkedRows[r.id]).length;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Break Analysis</span>
            <div className="flex gap-1.5">
              <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
              <SubmitButton compact type="submit">Submit</SubmitButton>
              <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
            </div>
          </div>
          {/* ── Top controls ── */}
          <ModuleCard compact title="Customer Allocation" icon={<Users size={13} className="text-blue-600" />}>
            <div className="flex flex-wrap items-end gap-4">

              {/* Dropdown + selected specs side box */}
              <div className="flex gap-3 flex-1 min-w-[320px] items-start">
                {/* Dropdown */}
                <div className="flex flex-col gap-1 w-56">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Select Customer Spec</label>
                  <div className="relative">
                    <select
                      value={dropdownVal}
                      onChange={e => addSpec(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500/20 outline-none cursor-pointer pr-6"
                    >
                      <option value="">-- Select Spec --</option>
                      {CUSTOMER_SPECS.filter(s => !selectedSpecs.includes(s.value)).map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▾</span>
                  </div>
                </div>

                {/* Selected specs side box */}
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">
                    Selected Specs
                    {selectedSpecs.length > 0 && (
                      <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[8px] font-bold">{selectedSpecs.length}</span>
                    )}
                  </label>
                  <div className="min-h-[34px] max-h-16 overflow-y-auto border border-slate-200 rounded bg-slate-50 p-1.5 flex flex-wrap gap-1">
                    {selectedSpecs.length === 0 ? (
                      <span className="text-[9px] text-slate-400 italic self-center ml-1">No specs selected</span>
                    ) : selectedSpecs.map(val => {
                      const spec = CUSTOMER_SPECS.find(s => s.value === val);
                      return (
                        <span key={val} className="flex items-center gap-1 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {spec?.label}
                          <button type="button" onClick={() => removeSpec(val)} className="hover:text-blue-200 transition-colors ml-0.5">×</button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Upload checkbox + file input */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadEnabled}
                    onChange={e => { setUploadEnabled(e.target.checked); if (!e.target.checked) setUploadedFile(null); }}
                    className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                  />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Upload File</span>
                </label>
                {uploadEnabled && (
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".xlsx,.pdf"
                      onChange={handleFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold rounded hover:bg-slate-200 transition-all"
                    >
                      <Upload size={11} /> Choose File
                    </button>
                    {uploadedFile ? (
                      <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                        <FileText size={10} />
                        <span className="max-w-[120px] truncate">{uploadedFile.name}</span>
                        <button type="button" onClick={() => setUploadedFile(null)} className="ml-1 text-rose-500 hover:text-rose-700">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400">xlsx or pdf</span>
                    )}
                  </div>
                )}
              </div>

              {/* Run Allocation button */}
              <button
                type="button"
                onClick={runAllocation}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                <PlayCircle size={14} className="text-blue-400" />
                Run Allocation
              </button>
            </div>
          </ModuleCard>

          {/* ── Fiber table ── */}
          <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <CheckSquare size={12} className="text-blue-600" />
                <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Fiber Allocation List</span>
                {tableData.length > 0 && (
                  <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                    {tableData.length} records
                  </span>
                )}
              </div>
              {selectedCount > 0 && (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {selectedCount} selected
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="border-b border-slate-200">
                    <th className="px-3 py-2 w-10 border-r border-slate-100">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        disabled={tableData.length === 0}
                        className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600 disabled:opacity-40"
                      />
                    </th>
                    {['Fiber ID', 'Spec', 'Length (km)', 'Remark', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap border-r border-slate-100 last:border-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[10px] text-slate-400">
                        Select customer specs and click <strong>Run Allocation</strong> to load fiber data
                      </td>
                    </tr>
                  ) : tableData.map(row => (
                    <tr key={row.id}
                      className={`transition-colors ${checkedRows[row.id] ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-3 py-2 border-r border-slate-100">
                        <input
                          type="checkbox"
                          checked={!!checkedRows[row.id]}
                          onChange={() => toggleRow(row.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">{row.fiber_id}</td>
                      <td className="px-3 py-2 text-xs font-mono text-slate-600 border-r border-slate-100">{row.length}</td>
                      <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100">{row.remark}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${row.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                            row.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                          }`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerAllocation;
