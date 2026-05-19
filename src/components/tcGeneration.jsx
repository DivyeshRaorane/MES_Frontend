import React, { useState } from 'react';
import { FileText, Download, Printer, Package } from 'lucide-react';
import { ModuleCard, FormikInput } from './common_fields';
import { SubmitButton, ResetButton } from './common_buttons';

/* ── Dummy PO data ── */
const PO_MASTER = {
  'PO-2024-001': {
    product:        'G.652.D Single Mode Fiber',
    po_date:        '2024-05-01',
    consignee:      'Precision Optics Ltd, Mumbai',
    test_report_no: 'TR-2024-0451',
    dispatch:       '2024-05-15',
    total_qty_km:   '4500.000',
    total_bobbin:   10,
  },
  'PO-2024-002': {
    product:        'G.657.A1 Bend Insensitive Fiber',
    po_date:        '2024-04-20',
    consignee:      'Fiber Tech Inc, Delhi',
    test_report_no: 'TR-2024-0388',
    dispatch:       '2024-05-10',
    total_qty_km:   '3800.500',
    total_bobbin:   8,
  },
};

/* ── Dummy fiber rows ── */
const makeFiberRows = (n) => Array.from({ length: n }, (_, i) => ({
  id:           i,
  product:      'G.652.D',
  batch_id:     `B-${2024}${String(i+1).padStart(3,'0')}`,
  box_no:       `BOX-${String(Math.floor(i/4)+1).padStart(2,'0')}`,
  charged_len:  (450 + i * 2.5).toFixed(3),
  actual_len:   (449 + i * 2.5).toFixed(3),
  attn_1310:    (0.330 + i * 0.001).toFixed(3),
  attn_1550:    (0.190 + i * 0.001).toFixed(3),
  attn_1383:    (0.400 + i * 0.002).toFixed(3),
  attn_1625:    (0.210 + i * 0.001).toFixed(3),
  mfd_1310:     (9.20  + i * 0.01).toFixed(2),
  mfd_1550:     (10.40 + i * 0.01).toFixed(2),
  fiber_cutoff: (1260  + i).toFixed(0),
  cable_cutoff: (1230  + i).toFixed(0),
  zdw:          (1313  + i * 0.1).toFixed(1),
  zds:          (0.086 + i * 0.0001).toFixed(4),
  disp_1550:    (17.0  + i * 0.05).toFixed(2),
  disp_1625:    (21.5  + i * 0.05).toFixed(2),
  pmd:          (0.04  + i * 0.001).toFixed(3),
  clad_dia:     (125.0 + i * 0.01).toFixed(2),
  core_clad_conc:(0.30 + i * 0.01).toFixed(2),
  clad_noncirc: (0.5   + i * 0.01).toFixed(2),
  coat_noncirc: (0.8   + i * 0.01).toFixed(2),
  coat_dia_unc: (242   + i * 0.1).toFixed(1),
  coat_clad_conc:(1.0  + i * 0.01).toFixed(2),
  fiber_curl:   (4.0   + i * 0.1).toFixed(1),
}));

/* ── Editable spec sections from screenshots ── */
const SPEC_SECTIONS = [
  {
    title: 'Macro Bend Loss',
    rows: [
      { label: '1 Turn, 10 mm Radius',  key: 'mb_1turn',  default: '≤0.75 dB at 1550\n≤1.5 dB at 1625' },
      { label: '10 Turn, 15 mm Radius', key: 'mb_10turn', default: '≤0.25 dB at 1550\n≤1.0 dB at 1625' },
    ],
  },
  {
    title: 'Mechanical Characteristics',
    rows: [
      { label: 'Proof Test Levels',                key: 'mech_proof',    default: '≥ 100 kpsi (0.69 GPa) or 1% strain' },
      { label: 'Coating strip force',              key: 'mech_coat',     default: '≥ 1.3 N (0.3 lbf) and 5.0 N (1.1 lbf)' },
      { label: 'Tensile Strength - Aged (Median)', key: 'mech_aged',     default: '≥ 3.03 GPa' },
      { label: 'Tensile Strength - Un Aged (Median)',key:'mech_unaged',  default: '≥ 3.80 GPa' },
    ],
  },
  {
    title: 'Environmental Characteristics',
    rows: [
      { label: 'Temperature dependence\nInduced attenuation, -60°C to +85°C at 1310,1550,1625 nm',                                          key: 'env_temp',    default: '≤ 0.05 dB/km' },
      { label: 'Temperature humidity cycling\nInduced attenuation, -10°C to +85°C and 95% relative humidity at 1310, 1550,1625 nm',          key: 'env_thc',     default: '≤ 0.05 dB/km' },
      { label: 'High temperature and humidity aging 85°C at 85% RH, 30 days\nInduced attenuation at 1310, 1550, 1625 nm due to aging',       key: 'env_htha',    default: '≤ 0.05 dB/km' },
      { label: 'Water immersion, 30 days\nInduced attenuation due to water immersion at 23 ± 2°C at 1310, 1550, 1625nm',                     key: 'env_water',   default: '≤ 0.05 dB/km' },
      { label: 'Accelerated aging (Temperature), 30 days\nInduced attenuation due to temperature aging at 85 ± 2°C at 1310, 1550, 1625nm',  key: 'env_accel',   default: '≤ 0.05 dB/km' },
    ],
  },
  {
    title: 'Other Performance Characteristics',
    rows: [
      { label: 'Effective group index of refraction',                                                                                          key: 'opc_egir',    default: '1.4670 at 1310 nm\n1.4675 at 1550 nm\n1.4680 at 1625 nm' },
      { label: 'Attenuation in the wavelength region from\n1285 - 1330 nm in reference to the attenuation at 1310 nm',                       key: 'opc_attn1',   default: '≤ 0.03 dB/km' },
      { label: 'Attenuation in the wavelength region from\n1525 - 1575 nm in reference to the attenuation at 1550 nm',                       key: 'opc_attn2',   default: '≤ 0.02 dB/km' },
      { label: 'Point discontinuities at 1310 nm & 1550 nm',                                                                                  key: 'opc_pd',      default: '≤ 0.05 dB' },
      { label: 'Dynamic fatigue parameter (Nd)',                                                                                               key: 'opc_nd',      default: '≥ 20' },
    ],
  },
];

/* ── Table column definitions ── */
const COLS = [
  { key: 'product',      label: 'Product'                          },
  { key: 'batch_id',     label: 'Batch ID'                         },
  { key: 'box_no',       label: 'Box No.'                          },
  { key: 'charged_len',  label: 'Charged Length (km)'              },
  { key: 'actual_len',   label: 'Actual Length (km)'               },
  { key: 'attn_1310',    label: 'Attenuation 1310nm (dB/km)'       },
  { key: 'attn_1550',    label: 'Attenuation 1550nm (dB/km)'       },
  { key: 'attn_1383',    label: 'Attenuation 1383nm (dB/km)'       },
  { key: 'attn_1625',    label: 'Attenuation 1625nm (dB/km)'       },
  { key: 'mfd_1310',     label: 'Mode Field Dia 1310nm (µm)'       },
  { key: 'mfd_1550',     label: 'Mode Field Dia 1550nm (µm)'       },
  { key: 'fiber_cutoff', label: 'Fiber Cutoff Wavelength (nm)'     },
  { key: 'cable_cutoff', label: 'Cable Cutoff Wavelength (nm)'     },
  { key: 'zdw',          label: 'Zero Dispersion Wavelength (nm)'  },
  { key: 'zds',          label: 'Zero Dispersion Slope (ps/nm².km)'},
  { key: 'disp_1550',    label: 'Dispersion at 1550nm (ps/nm.km)'  },
  { key: 'disp_1625',    label: 'Dispersion at 1625nm (ps/nm.km)'  },
  { key: 'pmd',          label: 'PMD Coefficient (ps/√km)'         },
  { key: 'clad_dia',     label: 'Cladding Diameter (µm)'           },
  { key: 'core_clad_conc',label:'Core-Clad Concentricity Error (µm)'},
  { key: 'clad_noncirc', label: 'Cladding Non-Circularity (%)'     },
  { key: 'coat_noncirc', label: 'Coating Non-Circularity (%)'      },
  { key: 'coat_dia_unc', label: 'Coating Diameter Uncolored (µm)'  },
  { key: 'coat_clad_conc',label:'Coating-Cladding Concentricity Error (µm)'},
  { key: 'fiber_curl',   label: 'Fiber Curl (m)'                   },
];

/* ── CSV export ── */
const exportCSV = (rows, poNo) => {
  const header = COLS.map(c => `"${c.label}"`).join(',');
  const body   = rows.map(r => COLS.map(c => `"${r[c.key]}"`).join(',')).join('\n');
  const blob   = new Blob([header + '\n' + body], { type: 'text/csv' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a'); a.href = url; a.download = `TC_${poNo}.csv`; a.click();
  URL.revokeObjectURL(url);
};

/* ══════════════════════════════════════════════════════════ */
const TCGenerationDashboard = () => {
  const [poInput,   setPoInput]   = useState('');
  const [poData,    setPoData]    = useState(null);
  const [fiberRows, setFiberRows] = useState([]);
  const [specVals,  setSpecVals]  = useState(() => {
    const init = {};
    SPEC_SECTIONS.forEach(s => s.rows.forEach(r => { init[r.key] = r.default; }));
    return init;
  });

  /* ── Load PO ── */
  const loadPO = () => {
    const d = PO_MASTER[poInput.trim()];
    if (!d) { alert(`PO not found. Try: PO-2024-001 or PO-2024-002`); return; }
    setPoData(d);
    setFiberRows(makeFiberRows(d.total_bobbin));
  };

  /* ── Reset ── */
  const handleReset = () => { setPoInput(''); setPoData(null); setFiberRows([]); };

  /* ── Submit ── */
  const handleSubmit = () => {
    if (!poData) { alert('Load a PO first.'); return; }
    console.log('TC Submit:', { poInput, poData, fiberRows, specVals });
    alert('Test Certificate generated successfully!');
  };

  /* ── Edit spec cell ── */
  const editSpec = (key, val) => setSpecVals(prev => ({ ...prev, [key]: val }));

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">
 <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">PT Break Analysis</span>
              <div className="flex gap-1.5">
                <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                <SubmitButton compact type="submit">Generate TC</SubmitButton>
                <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
              </div>
            </div>
          {/* ── PO Input + Summary ── */}
          <ModuleCard compact title="TC Generation" icon={<FileText size={13} className="text-blue-600" />}>
            <div className="flex flex-col gap-2">
              {/* PO input row */}
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-0.5 w-44">
                  <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Purchase Order No.</label>
                  <input value={poInput} onChange={e => setPoInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadPO()}
                    placeholder="e.g. PO-2024-001"
                    className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20" />
                </div>
                <button type="button" onClick={loadPO}
                  className="px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded hover:bg-blue-700 transition-all h-[28px]">
                  Load PO
                </button>

                {/* Export buttons */}
                {poData && (
                  <div className="flex gap-1.5 ml-auto">
                    <button type="button" onClick={() => exportCSV(fiberRows, poInput)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700 transition-all">
                      <Download size={10} /> CSV
                    </button>
                    <button type="button" onClick={() => window.print()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded hover:bg-indigo-700 transition-all">
                      <Printer size={10} /> PDF
                    </button>
                  </div>
                )}
              </div>

              {/* PO summary fields */}
              {poData && (
                <div className="grid grid-cols-7 gap-2 pt-1 border-t border-slate-100">
                  {[
                    { label: 'Product',        val: poData.product        },
                    { label: 'PO Date',         val: poData.po_date        },
                    { label: 'Consignee',       val: poData.consignee      },
                    { label: 'Test Report No.', val: poData.test_report_no },
                    { label: 'Dispatch Date',   val: poData.dispatch       },
                    { label: 'Total Qty (km)',  val: poData.total_qty_km   },
                    { label: 'Total Bobbins',   val: poData.total_bobbin   },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{label}</span>
                      <span className="text-[10px] font-bold text-slate-700 truncate" title={String(val)}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModuleCard>

          {/* ── Main fiber data table ── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '35vh' }}>
            <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
              <Package size={12} className="text-blue-600" />
              <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Fiber Test Data</span>
              {fiberRows.length > 0 && (
                <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{fiberRows.length} rows</span>
              )}
            </div>
            <div className="overflow-auto flex-1">
              <table className="text-left border-collapse" style={{ minWidth: '100%' }}>
                <thead className="sticky top-0 bg-slate-800 z-10">
                  <tr>
                    {COLS.map(c => (
                      <th key={c.key}
                        className="px-2 py-2 text-[8px] font-bold text-slate-200 uppercase whitespace-nowrap border-r border-slate-600 last:border-0 min-w-[90px]">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fiberRows.length === 0 ? (
                    <tr>
                      <td colSpan={COLS.length} className="px-4 py-8 text-center text-[10px] text-slate-400">
                        Load a PO to view fiber test data
                      </td>
                    </tr>
                  ) : fiberRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                      {COLS.map(c => (
                        <td key={c.key} className="px-2 py-1.5 text-xs font-mono text-slate-600 border-r border-slate-100 last:border-0 whitespace-nowrap">
                          {row[c.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Editable spec sections ── */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {SPEC_SECTIONS.map(section => (
                <div key={section.title} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Section header — blue like screenshot */}
                  <div className="bg-blue-600 px-3 py-1.5">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{section.title}</span>
                  </div>
                  <table className="w-full border-collapse">
                    <tbody>
                      {section.rows.map(row => (
                        <tr key={row.key} className="border-b border-slate-100 last:border-0">
                          {/* Label */}
                          <td className="px-3 py-2 text-xs text-slate-700 font-medium w-1/2 align-top whitespace-pre-line border-r border-slate-200">
                            {row.label}
                          </td>
                          {/* Editable value */}
                          <td className="px-2 py-1.5 w-1/2">
                            <textarea
                              value={specVals[row.key]}
                              onChange={e => editSpec(row.key, e.target.value)}
                              rows={specVals[row.key]?.split('\n').length || 1}
                              className="w-full bg-transparent text-xs text-slate-700 outline-none focus:bg-slate-50 focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5 resize-none border border-transparent focus:border-blue-200 transition-all"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TCGenerationDashboard;
