import { useState, useEffect } from 'react';
import { ArrowLeft, ClipboardList, Award } from 'lucide-react';
import { Formik, Form, Field } from 'formik';
import { FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { createSpec, updateSpec, getSpecById, getGradeList, getGradeById } from './SpecService';

/* ── Same PARAM_GROUPS as GradeManagement ── */
const PARAM_GROUPS = [
  { title: 'AVG LSA Attenuation', fields: [['avg_lsa_atn_1310'],['avg_lsa_atn_1550'],['avg_lsa_atn_1625'],['avg_lsa_atn_1383']] },
  { title: 'MAX LSA Attenuation', fields: [['max_lsa_atn_1310'],['max_lsa_atn_1550'],['max_lsa_atn_1625'],['max_lsa_atn_1383']] },
  { title: 'MIN LSA Attenuation', fields: [['min_lsa_atn_1310'],['min_lsa_atn_1550'],['min_lsa_atn_1625'],['min_lsa_atn_1383']] },
  { title: 'ATN Top', fields: [['atn_1310_top'],['atn_1550_top'],['atn_1625_top'],['atn_1383_top']] },
  { title: 'ATN Bottom', fields: [['atn_1310_bottom'],['atn_1550_bottom'],['atn_1625_bottom'],['atn_1383_bottom']] },
  { title: 'MAX ATN Top', fields: [['max_atn_1310_top'],['max_atn_1550_top'],['max_atn_1625_top'],['max_atn_1383_top']] },
  { title: 'MAX ATN Bottom', fields: [['max_atn_1310_bottom'],['max_atn_1550_bottom'],['max_atn_1625_bottom'],['max_atn_1383_bottom']] },
  { title: 'MAX TB', fields: [['max_tb_1310'],['max_tb_1550'],['max_tb_1625'],['max_tb_1383']] },
  { title: 'ATN TB', fields: [['atn_1310_tb'],['atn_1550_tb'],['atn_1625_tb'],['atn_1383_tb']] },
  { title: 'ATN Uniformity', fields: [['atn_uniformity_1310'],['atn_uniformity_1550'],['atn_uniformity_1625'],['atn_uniformity_1383']] },
  { title: 'MFD Uniformity', fields: [['mfd_uniformity_1310'],['mfd_uniformity_1550'],['mfd_uniformity_1625'],['mfd_uniformity_1383']] },
  { title: 'Step Size', fields: [['step_1310_size'],['step_1550_size'],['step_1625_size'],['step_1383_size']] },
  { title: 'Spike Size', fields: [['spike_1310_size'],['spike_1550_size'],['spike_1625_size'],['spike_1383_size']] },
  { title: 'Spectral', fields: [['spec_1310'],['spec_1550'],['spec_1285_1330']] },
  { title: 'MFD', fields: [['mfd_1310_top'],['mfd_1310_bottom'],['mfd_1550_top'],['mfd_1550_bottom']] },
  { title: 'Effective Area', fields: [['effective_area_1310'],['effective_area_1550']] },
  { title: 'Cut Off', fields: [['cut_off_top'],['cut_off_bottom'],['cable_cut_off'],['mac_value']] },
  { title: 'Geometry', fields: [['clad_dia_top'],['clad_dia_bottom'],['core_clad_concentricity_top'],['core_clad_concentricity_bottom'],['clad_ovality_top'],['clad_ovality_bottom'],['core_dia_top'],['core_dia_bottom'],['core_ovality_top'],['core_ovality_bottom']] },
  { title: 'Coating', fields: [['primary_coating_dia_top'],['primary_coating_dia_bottom'],['secondary_coating_dia_top'],['secondary_coating_dia_bottom'],['primary_coating_concentricity_top'],['primary_coating_concentricity_bottom'],['secondary_coating_concentricity_top'],['secondary_coating_concentricity_bottom'],['coating_ovality_top'],['coating_ovality_bottom']] },
  { title: 'Curl', fields: [['fiber_curl_top'],['fiber_curl_bottom'],['curl_defection_top'],['curl_defection_bottom']] },
  { title: 'Dispersion', fields: [['zero_disp_wave'],['slope_zero_disp'],['disp_1550'],['disp_1285_1330'],['disp_1270_1340'],['disp_1270_1360'],['disp_1575'],['cd_1460'],['disp_1625'],['disp_1570'],['disp_1260'],['disp_1460'],['disp_1490'],['disp_slope'],['slope_1550'],['slope_1290'],['slope_1490']] },
  { title: 'PMD', fields: [['pmd_1310'],['pmd_1550']] },
  { title: 'Microbend 100T', fields: [['m_100t_50mm_1550'],['m_100t_50mm_1310'],['m_100t_50mm_1625'],['m_100t_60mm_1550'],['m_100t_60mm_1310'],['m_100t_60mm_1625']] },
  { title: 'Microbend 10T/1T', fields: [['m_1t_32mm_1550'],['m_1t_32mm_1310'],['m_1t_32mm_1625'],['m_10t_30mm_1550'],['m_10t_30mm_1310'],['m_10t_30mm_1625'],['m_1t_20mm_1550'],['m_1t_20mm_1310'],['m_1t_20mm_1625'],['m_1t_15mm_1550'],['m_1t_15mm_1310'],['m_1t_15mm_1625'],['m_1t_10mm_1550'],['m_1t_10mm_1310'],['m_1t_10mm_1625']] },
];

const ALL_FIELDS = [];
PARAM_GROUPS.forEach(g => g.fields.forEach(([f]) => { ALL_FIELDS.push(`min_${f}`, `max_${f}`); }));

const buildInitialValues = (data) => {
  const vals = {
    customer_name: data?.customer_name || '', po_number: data?.po_number || '',
    pt_strain: data?.pt_strain || '', cust_spec_name: data?.cust_spec_name || '',
    product_type: data?.product_type || '', coating_type: data?.coating_type || '',
    quantity_km: data?.quantity_km || '', color: data?.color || '',
    priority: data?.priority || 1, remarks: data?.remarks || '',
  };
  ALL_FIELDS.forEach(f => {
    if (data?.[f] !== undefined && data?.[f] !== null) vals[f] = data[f];
    else vals[f] = f.startsWith('min_') ? 0 : 1000;
  });
  return vals;
};

/* ── Compact min/max row ── */
const LimitRow = ({ label, field }) => (
  <tr className="border-b border-slate-50 hover:bg-blue-50/20">
    <td className="px-2 py-0.5 text-[9px] font-mono font-semibold text-slate-700 whitespace-nowrap">{label}</td>
    <td className="px-1 py-0.5"><Field name={`min_${field}`} type="number" step="any" className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-center outline-none focus:ring-1 focus:ring-blue-300" /></td>
    <td className="px-1 py-0.5"><Field name={`max_${field}`} type="number" step="any" className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-center outline-none focus:ring-1 focus:ring-blue-300" /></td>
  </tr>
);

const SpecForm = ({ specId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState(buildInitialValues());
  const [grades, setGrades] = useState([]);
  const isEdit = !!specId;

  useEffect(() => {
    // Load grade list for dropdown
    (async () => {
      try {
        const res = await getGradeList();
        if (res?.success) setGrades(res.data || []);
      } catch (_) {}
    })();

    // Load existing spec if editing
    if (specId) {
      (async () => {
        setLoading(true);
        try {
          const res = await getSpecById(specId);
          if (res?.success) setInitialValues(buildInitialValues(res.data));
        } catch (e) { showError('Failed to load spec'); }
        setLoading(false);
      })();
    }
  }, [specId]);

  const handleGradeSelect = async (gradeId, setValues, currentValues) => {
    if (!gradeId) return;
    try {
      const res = await getGradeById(gradeId);
      if (res?.success && res.data) {
        const gradeData = res.data;
        const updated = { ...currentValues };
        ALL_FIELDS.forEach(f => {
          if (gradeData[f] !== undefined && gradeData[f] !== null) updated[f] = gradeData[f];
        });
        setValues(updated);
        showSuccess('Grade values applied. You can modify them.');
      }
    } catch (e) { showError('Failed to load grade values'); }
  };

  const handleSubmit = async (values) => {
    if (!values.customer_name || !values.cust_spec_name) { showError('Customer Name and Spec Name are required'); return; }
    setSubmitting(true);
    try {
      const payload = { ...values };
      // Convert numeric fields
      ALL_FIELDS.forEach(f => { if (payload[f] !== '' && payload[f] !== null) payload[f] = Number(payload[f]); else payload[f] = null; });
      if (payload.quantity_km) payload.quantity_km = Number(payload.quantity_km);
      if (payload.priority) payload.priority = Number(payload.priority);

      const res = isEdit ? await updateSpec(specId, payload) : await createSpec(payload);
      if (res?.success) { showSuccess(isEdit ? 'Spec updated' : 'Spec created'); onBack(); }
      else showError(res?.message || 'Save failed');
    } catch (e) { showError(e?.response?.data?.message || 'Save failed'); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-xs text-slate-400">Loading...</span></div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-blue-600 hover:text-blue-800"><ArrowLeft size={14} /></button>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{isEdit ? 'Edit Specification' : 'Create New Specification'}</span>
        </div>
      </div>

      {/* Form */}
      <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
        {({ values, setValues }) => (
          <Form className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

              {/* Basic Info + Grade Selector */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={12} className="text-indigo-600" />
                  <span className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider">Basic Information</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <FormikInput compact label="Customer Name *" name="customer_name" />
                  <FormikInput compact label="PO Number" name="po_number" />
                  <FormikSelect compact label="PT Strain" name="pt_strain" options={[{ label: '1%', value: 1 }, { label: '2%', value: 2 }]} />
                  <FormikInput compact label="Spec Name *" name="cust_spec_name" />
                  <FormikInput compact label="Product Type" name="product_type" />
                  <FormikSelect compact label="Coating Type" name="coating_type" options={['Single', 'Dual']} />
                  <FormikInput compact label="Quantity (KM)" name="quantity_km" type="number" />
                  <FormikInput compact label="Color" name="color" />
                  <FormikInput compact label="Priority" name="priority" type="number" />
                  <FormikInput compact label="Remarks" name="remarks" />
                </div>
              </div>

              {/* Grade Selector */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl px-3 py-2 flex items-center gap-3">
                <Award size={12} className="text-amber-600" />
                <span className="text-[8px] font-bold text-amber-700 uppercase tracking-wider whitespace-nowrap">Load from Grade:</span>
                <select onChange={e => handleGradeSelect(e.target.value, setValues, values)}
                  className="border border-slate-200 rounded px-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-amber-300 w-48">
                  <option value="">-- Select Grade to auto-fill --</option>
                  {grades.map(g => <option key={g.qc_entry_id} value={g.qc_entry_id}>{g.grade} ({g.product_type || '—'})</option>)}
                </select>
                <span className="text-[8px] text-slate-400 italic">Values will be applied. You can still change them.</span>
              </div>

              {/* Parameter Groups — same layout as GradeManagement */}
              <div className="grid grid-cols-3 gap-2">
                {PARAM_GROUPS.map((group) => (
                  <div key={group.title} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-700 px-2 py-1">
                      <span className="text-[8px] font-bold text-white uppercase tracking-wider">{group.title}</span>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="px-2 py-0.5 text-[7px] text-slate-500 text-left">Parameter</th>
                          <th className="px-1 py-0.5 text-[7px] text-slate-500 text-center w-20">Min</th>
                          <th className="px-1 py-0.5 text-[7px] text-slate-500 text-center w-20">Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.fields.map(([f]) => <LimitRow key={f} label={f} field={f} />)}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-200 flex justify-between flex-shrink-0">
              <ResetButton compact type="button" onClick={onBack}>Cancel</ResetButton>
              <SubmitButton compact type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </SubmitButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SpecForm;
