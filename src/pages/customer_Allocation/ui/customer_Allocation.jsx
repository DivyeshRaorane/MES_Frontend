import { useState, useEffect } from 'react';
import { PlayCircle, CheckSquare, Users, AlertTriangle, CheckCircle2, XCircle, Loader2, Download } from 'lucide-react';
import { ModuleCard } from '../../../components/common_fields';
import { showSuccess, showError } from '../../../utils/toastService';
import { getSpecList } from '../../QualityAssurance/SpecCreation/SpecService';
import { runAllocationEngine } from '../services/allocation.api';
import XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

/* ══════════════════════════════════════════════════════════ */
const CustomerAllocation = () => {
  const [customerSpecs, setCustomerSpecs] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { specs: [], rejected: [] }
  const [activeResultTab, setActiveResultTab] = useState('summary');

  /* ── Fetch specs ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await getSpecList();
        if (res?.success && res.data) {
          setCustomerSpecs(res.data.map(s => ({ value: s.spec_id, label: s.cust_spec_name, ...s })));
        }
      } catch (e) { console.error('Failed to load specs:', e); }
    })();
  }, []);

  const [dropdownVal, setDropdownVal] = useState('');
  const addSpec = (val) => { if (!val) return; const n = Number(val); if (!selectedSpecs.includes(n)) setSelectedSpecs(prev => [...prev, n]); setDropdownVal(''); };
  const removeSpec = (val) => setSelectedSpecs(prev => prev.filter(v => v !== val));

  /* ── Run Allocation ── */
  const handleRunAllocation = async () => {
    if (selectedSpecs.length === 0) { showError('Please select at least one customer spec.'); return; }
    setLoading(true);
    setResults(null);
    try {
      const res = await runAllocationEngine(selectedSpecs);
      console.log("Data spec:,", res)
      if (res?.success) {
        setResults(res.data);
        showSuccess(`Allocation complete. ${res.data.specs?.length || 0} spec(s) processed.`);
      } else { showError(res?.message || 'Allocation failed'); }
    } catch (e) { showError(e?.response?.data?.message || 'Allocation engine error'); }
    setLoading(false);
  };

  const handleReset = () => { setSelectedSpecs([]); setResults(null); setActiveResultTab('summary'); };

  /* ── Export allocated bobbins for a specific spec to Excel ── */
  const handleExportSpecBobbins = (spec) => {
    if (!results?.allocated || results.allocated.length === 0) {
      showError('No allocated bobbins to export');
      return;
    }
    // Filter bobbins for this spec
    const specBobbins = results.allocated.filter(b => 
      b.assigned_spec === spec.cust_spec_name || b.spec_id === spec.spec_id
    );
    if (specBobbins.length === 0) {
      showError('No bobbins allocated for this spec');
      return;
    }

    // Header style - dark fill with white bold text
    const headerStyle = {
      fill: { fgColor: { rgb: '1F2937' } },
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      }
    };

    // Build Excel data
    const headers = ['Sr No', 'Bobbin No', 'FID', 'Optical Length (KM)', 'Draw Date', 'PT Strain', 'Product Type', 'Spec', 'E Length', 'Glass', 'Status'];
    const rows = specBobbins.map((b, i) => [
      i + 1,
      b.bobbin_no || '',
      b.fid || '',
      b.optical_length || '',
      b.draw_date || '',
      b.pt_strain || '',
      b.product_type || '',
      b.assigned_spec || '',
      b.effective_length || '',
      b.preform_vendor_id || '',
      'Allocated',
    ]);

    // Calculate Total Allocated KM
    const totalAllocatedKM = spec.total_allocated_km || specBobbins.reduce((sum, b) => sum + (Number(b.optical_length) || 0), 0);

    // Calculate Effective Length wise data grouped by Vendor (Glass/preform_vendor_id)
    const vendorMap = {};
    specBobbins.forEach(b => {
      const vendor = b.preform_vendor_id || 'Unknown';
      if (!vendorMap[vendor]) {
        vendorMap[vendor] = { count: 0, totalLength: 0, effectiveLengths: {} };
      }
      vendorMap[vendor].count += 1;
      vendorMap[vendor].totalLength += (Number(b.optical_length) || 0);
      const eLength = b.effective_length || 'N/A';
      if (!vendorMap[vendor].effectiveLengths[eLength]) {
        vendorMap[vendor].effectiveLengths[eLength] = 0;
      }
      vendorMap[vendor].effectiveLengths[eLength] += 1;
    });

    // Build the sheet data
    const sheetData = [headers, ...rows];

    // Add empty rows as separator
    sheetData.push([]);
    sheetData.push([]);

    // Add Total Allocated KM
    const summaryStartRow = sheetData.length;
    sheetData.push(['Total Allocated KM', '', totalAllocatedKM.toFixed(2) + ' KM']);
    sheetData.push([]);

    // Add Effective Length wise data by Vendor
    sheetData.push(['Effective Length Wise Data']);
    sheetData.push([]);

    Object.entries(vendorMap).forEach(([vendor, data]) => {
      sheetData.push(['Vendor:', vendor, '', 'Bobbins:', data.count, '', 'Total KM:', data.totalLength.toFixed(2)]);
      // Effective length breakdown header
      sheetData.push(['', 'Effective Length', 'Bobbin Count']);
      Object.entries(data.effectiveLengths).forEach(([eLen, count]) => {
        sheetData.push(['', eLen, count]);
      });
      sheetData.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Apply dark header style to the first row
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      if (ws[cellRef]) {
        ws[cellRef].s = headerStyle;
      }
    });

    // Style the summary section labels (bold)
    const boldStyle = { font: { bold: true, sz: 11 } };
    const summaryLabelCell = XLSX.utils.encode_cell({ r: summaryStartRow, c: 0 });
    if (ws[summaryLabelCell]) ws[summaryLabelCell].s = boldStyle;

    const elTitleRow = summaryStartRow + 2;
    const elTitleCell = XLSX.utils.encode_cell({ r: elTitleRow, c: 0 });
    if (ws[elTitleCell]) ws[elTitleCell].s = { font: { bold: true, sz: 12 } };

    // Style vendor rows
    let currentRow = elTitleRow + 2;
    Object.entries(vendorMap).forEach(([, data]) => {
      // Vendor label row - bold
      const vendorCell = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
      if (ws[vendorCell]) ws[vendorCell].s = boldStyle;
      const bobbinsLabelCell = XLSX.utils.encode_cell({ r: currentRow, c: 3 });
      if (ws[bobbinsLabelCell]) ws[bobbinsLabelCell].s = boldStyle;
      const totalKmLabelCell = XLSX.utils.encode_cell({ r: currentRow, c: 6 });
      if (ws[totalKmLabelCell]) ws[totalKmLabelCell].s = boldStyle;
      currentRow++; // sub-header row
      // Style sub-header
      const subH1 = XLSX.utils.encode_cell({ r: currentRow, c: 1 });
      const subH2 = XLSX.utils.encode_cell({ r: currentRow, c: 2 });
      if (ws[subH1]) ws[subH1].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E2E8F0' } } };
      if (ws[subH2]) ws[subH2].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E2E8F0' } } };
      currentRow++; // data rows
      currentRow += Object.keys(data.effectiveLengths).length;
      currentRow++; // empty separator row
    });

    // Set column widths
    ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 16) }));

    const wb = XLSX.utils.book_new();
    const sheetName = (spec.cust_spec_name || 'Allocation').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const fileName = `Allocation_${spec.cust_spec_name || 'Spec'}_${spec.customer_name || ''}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, fileName.replace(/[^a-z0-9_\-\.]/gi, '_'));
    showSuccess(`Exported ${specBobbins.length} bobbin(s) for ${spec.cust_spec_name}`);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Specification-Based Bobbin Allocation</span>
            <div className="flex gap-1.5">
              <button type="button" onClick={handleReset}
                className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold rounded hover:bg-slate-200">Reset</button>
            </div>
          </div>

          {/* ── Spec Selection ── */}
          <ModuleCard compact title="Select Specifications" icon={<Users size={13} className="text-blue-600" />}>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex gap-3 flex-1 min-w-[320px] items-start">
                <div className="flex flex-col gap-1 w-56">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Customer Spec</label>
                  <div className="relative">
                    <select value={dropdownVal} onChange={e => addSpec(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500/20 outline-none cursor-pointer pr-6">
                      <option value="">-- Select Spec --</option>
                      {customerSpecs.filter(s => !selectedSpecs.includes(s.value)).map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▾</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">
                    Selected {selectedSpecs.length > 0 && <span className="ml-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[8px] font-bold">{selectedSpecs.length}</span>}
                  </label>
                  <div className="min-h-[34px] max-h-16 overflow-y-auto border border-slate-200 rounded bg-slate-50 p-1.5 flex flex-wrap gap-1">
                    {selectedSpecs.length === 0 ? (
                      <span className="text-[9px] text-slate-400 italic self-center ml-1">No specs selected</span>
                    ) : selectedSpecs.map(val => {
                      const spec = customerSpecs.find(s => s.value === val);
                      return (
                        <span key={val} className="flex items-center gap-1 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {spec?.label}
                          <button type="button" onClick={() => removeSpec(val)} className="hover:text-blue-200 ml-0.5">×</button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <button type="button" onClick={handleRunAllocation} disabled={loading || selectedSpecs.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95 whitespace-nowrap disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} className="text-blue-400" />}
                {loading ? 'Running...' : 'Run Allocation'}
              </button>
            </div>
          </ModuleCard>

          {/* ── Results Area ── */}
          {results && (
            <div className="flex flex-col flex-1 min-h-0 gap-2">

              {/* Result Tabs */}
              <div className="flex gap-1 flex-shrink-0">
                {[{ key: 'summary', label: 'Summary' }, { key: 'allocated', label: 'Allocated Bobbins' }, { key: 'rejected', label: 'Rejected Bobbins' }].map(t => (
                  <button key={t.key} onClick={() => setActiveResultTab(t.key)}
                    className={`px-3 py-1.5 text-[9px] font-bold rounded transition-all ${activeResultTab === t.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Summary Cards */}
              {activeResultTab === 'summary' && (
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    {results.specs?.map((spec, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-800">{spec.customer_name}</span>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                            spec.status === 'FULLY_ALLOCATED' ? 'bg-emerald-100 text-emerald-700' :
                            spec.status === 'PARTIALLY_ALLOCATED' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>{spec.status?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-[9px] text-blue-700 font-mono font-bold mb-1">{spec.cust_spec_name}</p>
                        <div className="grid grid-cols-3 gap-2 text-[9px]">
                          <div><span className="text-slate-400">PO:</span> <span className="font-bold">{spec.po_number || '—'}</span></div>
                          <div><span className="text-slate-400">PT Strain:</span> <span className="font-bold">{spec.pt_strain || '—'}</span></div>
                          <div><span className="text-slate-400">Priority:</span> <span className="font-bold text-amber-700">{spec.priority}</span></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100">
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase">Total Length</p>
                            <p className="text-xs font-black text-slate-700">{Number(spec.total_allocated_km || 0).toFixed(1)} KM</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase">Product Type</p>
                            <p className="text-xs font-black text-emerald-700">{(spec.product_type || ' ')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase">Remaining</p>
                            <p className="text-xs font-black text-rose-700">{Number(spec.remaining_km || 0).toFixed(1)} KM</p>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1">Bobbins: <span className="font-bold">{spec.bobbin_count || 0}</span></p>
                        {/* Export allocated bobbins for this spec */}
                        {(spec.bobbin_count > 0 || spec.allocated_km > 0) && (
                          <button type="button" onClick={() => handleExportSpecBobbins(spec)}
                            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold rounded-lg hover:bg-emerald-100 transition-all w-full justify-center">
                            <Download size={11} /> Export Bobbins (Excel)
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Allocated Bobbins Table */}
              {activeResultTab === 'allocated' && (
                <div className="flex-1 min-h-0 overflow-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-800 text-white z-10">
                      <tr>
                        {['#', 'Bobbin No', 'FID', 'Fiber Length', 'Draw Date', 'PT Strain', 'Product Type', 'Assigned Spec', 'Status'].map(h => (
                          <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!results.allocated || results.allocated.length === 0) ? (
                        <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-400">No bobbins allocated</td></tr>
                      ) : results.allocated.map((b, i) => (
                        <tr key={i} className="hover:bg-blue-50/30">
                          <td className="px-3 py-1.5 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono font-bold text-blue-700">{b.bobbin_no}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono text-slate-600">{b.fid || '—'}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono text-emerald-700">{b.fiber_length}</td>
                          <td className="px-3 py-1.5 text-[9px] text-slate-500">{b.draw_date || '—'}</td>
                          <td className="px-3 py-1.5 text-[9px]">{b.pt_strain || '—'}</td>
                          <td className="px-3 py-1.5 text-[9px]">{b.product_type || '—'}</td>
                          <td className="px-3 py-1.5 text-[9px] font-bold text-indigo-700">{b.assigned_spec || '—'}</td>
                          <td className="px-3 py-1.5"><span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Allocated</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Rejected Bobbins Table */}
              {activeResultTab === 'rejected' && (
                <div className="flex-1 min-h-0 overflow-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-800 text-white z-10">
                      <tr>
                        {['#', 'Bobbin No', 'Failed Parameter', 'QC Value', 'Spec Min', 'Spec Max', 'Reason'].map(h => (
                          <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!results.rejected || results.rejected.length === 0) ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-400">No rejected bobbins</td></tr>
                      ) : results.rejected.map((b, i) => (
                        <tr key={i} className="hover:bg-rose-50/30">
                          <td className="px-3 py-1.5 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-700">{b.bobbin_no}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono text-rose-700">{b.failed_parameter}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono">{b.qc_value ?? '—'}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono">{b.spec_min ?? '—'}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono">{b.spec_max ?? '—'}</td>
                          <td className="px-3 py-1.5 text-[9px] text-rose-600">{b.reason || 'Out of range'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!results && !loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <CheckSquare size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Select specifications and click <strong>Run Allocation</strong></p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerAllocation;
