import { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Power, ArrowLeft, Loader2, Search, X } from 'lucide-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FormikInput } from '../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../components/common_buttons';
import { showSuccess, showError } from '../../../../utils/toastService';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── All parameter groups with their min/max field pairs ── */
const PARAM_GROUPS = [
  { title: 'Optical Length', fields: [
    ['optical_length'],
  ]},
  { title: 'AVG LSA Attenuation', fields: [
    ['avg_lsa_atn_1310'],['avg_lsa_atn_1550'],['avg_lsa_atn_1625'],['avg_lsa_atn_1383'],
  ]},
  { title: 'MAX LSA Attenuation', fields: [
    ['max_lsa_atn_1310'],['max_lsa_atn_1550'],['max_lsa_atn_1625'],['max_lsa_atn_1383'],
  ]},
  { title: 'MIN LSA Attenuation', fields: [
    ['min_lsa_atn_1310'],['min_lsa_atn_1550'],['min_lsa_atn_1625'],['min_lsa_atn_1383'],
  ]},
  { title: 'ATN Top', fields: [
    ['atn_1310_top'],['atn_1550_top'],['atn_1625_top'],['atn_1383_top'],
  ]},
  { title: 'ATN Bottom', fields: [
    ['atn_1310_bottom'],['atn_1550_bottom'],['atn_1625_bottom'],['atn_1383_bottom'],
  ]},
  { title: 'MAX ATN Top', fields: [
    ['max_atn_1310_top'],['max_atn_1550_top'],['max_atn_1625_top'],['max_atn_1383_top'],
  ]},
  { title: 'MAX ATN Bottom', fields: [
    ['max_atn_1310_bottom'],['max_atn_1550_bottom'],['max_atn_1625_bottom'],['max_atn_1383_bottom'],
  ]},
  { title: 'MAX TB', fields: [
    ['max_tb_1310'],['max_tb_1550'],['max_tb_1625'],['max_tb_1383'],
  ]},
  { title: 'ATN TB', fields: [
    ['atn_1310_tb'],['atn_1550_tb'],['atn_1625_tb'],['atn_1383_tb'],
  ]},
  { title: 'ATN Uniformity', fields: [
    ['atn_uniformity_1310'],['atn_uniformity_1550'],['atn_uniformity_1625'],['atn_uniformity_1383'],
  ]},
  { title: 'MFD Uniformity', fields: [
    ['mfd_uniformity_1310'],['mfd_uniformity_1550'],['mfd_uniformity_1625'],['mfd_uniformity_1383'],
  ]},
  { title: 'Step Size', fields: [
    ['step_1310_size'],['step_1550_size'],['step_1625_size'],['step_1383_size'],
  ]},
  { title: 'Spike Size', fields: [
    ['spike_1310_size'],['spike_1550_size'],['spike_1625_size'],['spike_1383_size'],
  ]},
  { title: 'Spectral', fields: [
    ['spec_1310'],['spec_1550'],['spec_1285_1330'],
  ]},
  { title: 'MFD Top/Bottom', fields: [
    ['mfd_1310_top'],['mfd_1310_bottom'],['mfd_1550_top'],['mfd_1550_bottom'],
  ]},
  { title: 'Effective Area', fields: [
    ['effective_area_1310'],['effective_area_1550'],
  ]},
  { title: 'Cut Off', fields: [
    ['cut_off_top'],['cut_off_bottom'],['cable_cut_off'],
  ]},
  { title: 'MAC Value', fields: [['mac_value']]},
  { title: 'Cladding Diameter', fields: [['clad_dia_top'],['clad_dia_bottom']]},
  { title: 'Core Clad Concentricity', fields: [['core_clad_concentricity_top'],['core_clad_concentricity_bottom']]},
  { title: 'Cladding Ovality', fields: [['clad_ovality_top'],['clad_ovality_bottom']]},
  { title: 'Core Diameter', fields: [['core_dia_top'],['core_dia_bottom']]},
  { title: 'Core Ovality', fields: [['core_ovality_top'],['core_ovality_bottom']]},
  { title: 'Primary Coating Dia', fields: [['primary_coating_dia_top'],['primary_coating_dia_bottom']]},
  { title: 'Secondary Coating Dia', fields: [['secondary_coating_dia_top'],['secondary_coating_dia_bottom']]},
  { title: 'Primary Coating Concentricity', fields: [['primary_coating_concentricity_top'],['primary_coating_concentricity_bottom']]},
  { title: 'Secondary Coating Concentricity', fields: [['secondary_coating_concentricity_top'],['secondary_coating_concentricity_bottom']]},
  { title: 'Coating Ovality', fields: [['coating_ovality_top'],['coating_ovality_bottom']]},
  { title: 'Fiber Curl', fields: [['fiber_curl_top'],['fiber_curl_bottom']]},
  { title: 'Curl Deflection', fields: [['curl_defection_top'],['curl_defection_bottom']]},
  { title: 'Dispersion', fields: [
    ['zero_disp_wave'],['slope_zero_disp'],['disp_1550'],['disp_1285_1330'],['disp_1270_1360'],
    ['disp_1270_1340'],['disp_1575'],['cd_1460'],['disp_1625'],['disp_1570'],['disp_1260'],['disp_1460'],['disp_1490'],['disp_slope'],['slope_1550'],['slope_1290'],['slope_1490']
  ]},
  { title: 'PMD', fields: [['pmd_1310'],['pmd_1550']]},
  { title: 'Microbend 100T 50mm', fields: [['m_100t_50mm_1550'],['m_100t_50mm_1310'],['m_100t_50mm_1625']]},
  { title: 'Microbend 100T 60mm', fields: [['m_100t_60mm_1550'],['m_100t_60mm_1310'],['m_100t_60mm_1625']]},
  { title: 'Microbend 1T 32mm', fields: [['m_1t_32mm_1550'],['m_1t_32mm_1310'],['m_1t_32mm_1625']]},
  { title: 'Microbend 10T 30mm', fields: [['m_10t_30mm_1550'],['m_10t_30mm_1310'],['m_10t_30mm_1625']]},
  { title: 'Microbend 1T 20mm', fields: [['m_1t_20mm_1550'],['m_1t_20mm_1310'],['m_1t_20mm_1625']]},
  { title: 'Microbend 1T 15mm', fields: [['m_1t_15mm_1550'],['m_1t_15mm_1310'],['m_1t_15mm_1625']]},
  { title: 'Microbend 1T 10mm', fields: [['m_1t_10mm_1550'],['m_1t_10mm_1310'],['m_1t_10mm_1625']]},
];

/* Build all field names (min_ and max_ prefixed) */
const ALL_LIMIT_FIELDS = [];
PARAM_GROUPS.forEach(g => g.fields.forEach(([f]) => {
  ALL_LIMIT_FIELDS.push(`min_${f}`, `max_${f}`);
}));

const buildInitialValues = (data) => {
  const vals = {
    grade: data?.grade || '',
    product_type: data?.product_type || '',
    color_type: data?.color_type || '',
    priority: data?.priority || '',
    status: data?.status ?? true
  };
  ALL_LIMIT_FIELDS.forEach(f => {
    if (data?.[f] !== undefined && data?.[f] !== null) {
      vals[f] = data[f];
    } else {
      // Default: min = 0, max = 1000 for new entries
      vals[f] = f.startsWith('min_') ? 0 : f.startsWith('max_') ? 1000 : '';
    }
  });
  return vals;
};

/* ══════════════════════════════════════════════════════════ */
const GradeManagement = ({ onBack }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editGrade, setEditGrade] = useState(null); // null = list, object = form
  const [isCreating, setIsCreating] = useState(false);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/admin/grades`, { headers: authHeaders() });
      setGrades(res.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchGrades(); }, []);

  const filtered = grades.filter(g => {
    const q = search.toLowerCase();
    return !q || g.grade?.toLowerCase().includes(q) || g.product_type?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await axios.put(`${API}/api/admin/grades/${item.qc_entry_id}`, { status: !item.status }, { headers: authHeaders() });
      if (res.data?.success) { showSuccess(`${!item.status ? 'Enabled' : 'Disabled'}`); fetchGrades(); }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Failed'); }
  };

  /* ── Show Form ── */
  if (editGrade !== null || isCreating) {
    return (
      <GradeForm
        data={editGrade}
        allGrades={grades}
        onBack={() => { setEditGrade(null); setIsCreating(false); }}
        onSaved={() => { setEditGrade(null); setIsCreating(false); fetchGrades(); }}
      />
    );
  }

  /* ── List View ── */
  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {onBack && <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={11} /> Back</button>}
            <Award size={15} className="text-amber-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Grade Management</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{grades.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search grade/product_type..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-44" />
            </div>
            <button type="button" onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Add Grade
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2"><Loader2 size={18} className="text-blue-500 animate-spin" /></div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800 z-10">
              <tr>
                {['ID','Grade','product_type','Min OL','Max OL','Color Type','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-400">No grades found</td></tr>
              ) : filtered.map(g => (
                <tr key={g.qc_entry_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-500 border-r border-slate-100">{g.qc_entry_id}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-700 border-r border-slate-100">{g.grade}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">{g.product_type || '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">{g.min_optical_length ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600 border-r border-slate-100">{g.max_optical_length ?? '—'}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-indigo-700 border-r border-slate-100">{g.color_type}</td>
                  <td className="px-4 py-2.5 border-r border-slate-100">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${g.status ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {g.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setEditGrade(g)}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                        <Edit2 size={9} /> Edit
                      </button>
                      <button type="button" onClick={() => handleToggle(g)}
                        className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                          g.status ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}>
                        <Power size={9} /> {g.status ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   GRADE FORM (Create / Edit) — Full screen with categorized min/max fields
   ══════════════════════════════════════════════════════════ */
const GradeForm = ({ data, allGrades = [], onBack, onSaved }) => {
  const isEdit = !!data;
  const [submitting, setSubmitting] = useState(false);
  const [mandatoryFields, setMandatoryFields] = useState({});
  const [mandatoryLoading, setMandatoryLoading] = useState(false);

  // Fetch existing mandatory params when editing
  useEffect(() => {
    if (isEdit && data?.grade && data?.product_type) {
      const fetchMandatory = async () => {
        try {
          const res = await axios.get(`${API}/api/admin/grade-mandatory`, {
            params: { grade: data.grade, product_type: data.product_type },
            headers: authHeaders()
          });
          if (res.data?.data?.mandatory_params) {
            const params = res.data.data.mandatory_params.split(',').map(s => s.trim()).filter(Boolean);
            const obj = {};
            params.forEach(p => { obj[p] = true; });
            setMandatoryFields(obj);
          }
        } catch (e) { console.error('Failed to load mandatory params', e); }
      };
      fetchMandatory();
    }
  }, []);

  const toggleMandatory = (fieldName) => {
    setMandatoryFields(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const saveMandatoryFields = async (grade, product_type) => {
    const checked = Object.entries(mandatoryFields).filter(([, v]) => v).map(([k]) => k);
    const mandatory_params = checked.join(',');
    try {
      setMandatoryLoading(true);
      await axios.post(`${API}/api/admin/grade-mandatory`, {
        grade, product_type, mandatory_params
      }, { headers: authHeaders() });
    } catch (e) { console.error('Failed to save mandatory params', e); }
    setMandatoryLoading(false);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Build payload with only non-empty numeric fields
      const payload = {
        grade: values.grade,
        product_type: values.product_type,
        color_type: values.color_type || null,
        priority: Number(values.priority),
        status: values.status
      };
      ALL_LIMIT_FIELDS.forEach(f => {
        if (values[f] !== '' && values[f] !== null && values[f] !== undefined) payload[f] = Number(values[f]);
        else payload[f] = null;
      });

      let res;
      if (isEdit) {
        res = await axios.put(`${API}/api/admin/grades/${data.qc_entry_id}`, payload, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API}/api/admin/grades`, payload, { headers: authHeaders() });
      }
      if (res.data?.success) {
        // Save mandatory fields after grade is saved
        await saveMandatoryFields(values.grade, values.product_type);
        showSuccess(isEdit ? 'Grade updated' : 'Grade created');
        onSaved();
      }
      else showError(res.data?.message || 'Failed');
    } catch (e) { showError(e?.response?.data?.message || 'Something went wrong'); }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik initialValues={buildInitialValues(data)} onSubmit={handleSubmit} enableReinitialize>
          {({ values, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* Top bar */}
              <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onBack} className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline"><ArrowLeft size={11} /> Back</button>
                  <Award size={15} className="text-amber-600" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase">{isEdit ? `Edit Grade — ${data.grade}` : 'Create New Grade'}</span>
                </div>
                <div className="flex gap-2">
                  <ResetButton compact type="button" onClick={onBack}>Cancel</ResetButton>
                  <SubmitButton compact type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                  </SubmitButton>
                </div>
              </div>

              {/* Header fields */}
              <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0">
                <div className="grid grid-cols-6 gap-3">
                  <FormikInput compact label="Grade Name" name="grade" placeholder="e.g. A+" />
                  <FormikInput compact label="product Type" name="product_type" placeholder="Product Type" />
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-slate-600 mb-0.5">Color Type</label>
                    <Field as="select" name="color_type"
                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-300 text-slate-700">
                      <option value="">— Select —</option>
                      <option value="NATURAL">NATURAL</option>
                      <option value="COLORED">COLORED</option>
                      <option value="RM">RM</option>
                    </Field>
                  </div>
                  <FormikInput compact label="Priority (1=highest)" name="priority" type="number" placeholder="1" />
                  <div className="flex flex-col">
                    <label className="text-[9px] font-bold text-slate-600 mb-0.5">Copy From Grade</label>
                    <select
                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-300 text-slate-700"
                      defaultValue=""
                      onChange={async (e) => {
                        const selectedGrade = allGrades.find(g => g.qc_entry_id === Number(e.target.value));
                        if (selectedGrade) {
                          // Copy all min/max values
                          ALL_LIMIT_FIELDS.forEach(f => {
                            if (selectedGrade[f] !== undefined && selectedGrade[f] !== null) {
                              setFieldValue(f, selectedGrade[f]);
                            }
                          });
                          // Copy mandatory checkboxes
                          try {
                            const res = await axios.get(`${API}/api/admin/grade-mandatory`, {
                              params: { grade: selectedGrade.grade, product_type: selectedGrade.product_type },
                              headers: authHeaders()
                            });
                            if (res.data?.data?.mandatory_params) {
                              const params = res.data.data.mandatory_params.split(',').map(s => s.trim()).filter(Boolean);
                              const obj = {};
                              params.forEach(p => { obj[p] = true; });
                              setMandatoryFields(obj);
                            }
                          } catch (err) { console.error('Failed to copy mandatory params', err); }
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="" disabled>— Select to copy —</option>
                      {allGrades.filter(g => g.status).map(g => (
                        <option key={g.qc_entry_id} value={g.qc_entry_id}>
                          {g.grade} ({g.product_type || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2 pb-0.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                      <Field type="checkbox" name="status" className="w-3.5 h-3.5 accent-emerald-600" />
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Parameter limits — scrollable */}
              <div className="flex-1 overflow-y-auto px-3 py-1.5">
                <div className="grid grid-cols-3 gap-2 auto-rows-min">
                  {PARAM_GROUPS.map(group => (
                    <div key={group.title} className="border border-slate-200 rounded-lg p-1.5">
                      <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1 border-b border-slate-100 pb-0.5">{group.title}</p>
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="text-slate-600">
                            <th className="text-left font-bold py-0 w-5">M</th>
                            <th className="text-left font-bold py-0">Parameter</th>
                            <th className="text-center font-bold py-0">Min</th>
                            <th className="text-center font-bold py-0">Max</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.fields.map(([field]) => (
                            <tr key={field} className="border-t border-slate-50">
                              <td className="py-0.5 pr-0.5">
                                <input
                                  type="checkbox"
                                  checked={!!mandatoryFields[field]}
                                  onChange={() => toggleMandatory(field)}
                                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer accent-indigo-600"
                                  title={`Mark ${field} as mandatory`}
                                />
                              </td>
                              <td className="py-0.5 pr-1 text-[10px] font-semibold text-slate-700 whitespace-nowrap">{field.replace(/_/g, ' ')}</td>
                              <td className="py-0.5 px-0.5">
                                <Field name={`min_${field}`} type="number" step="0.001" placeholder="—"
                                  className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[11px] text-center text-slate-800 outline-none focus:ring-1 focus:ring-blue-300" />
                              </td>
                              <td className="py-0.5 px-0.5">
                                <Field name={`max_${field}`} type="number" step="0.001" placeholder="—"
                                  className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[11px] text-center text-slate-800 outline-none focus:ring-1 focus:ring-blue-300" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default GradeManagement;
