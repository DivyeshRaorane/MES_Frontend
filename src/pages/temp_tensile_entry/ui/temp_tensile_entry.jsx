import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Dumbbell, Scan } from 'lucide-react';
import { ModuleCard, FormikInput } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { fetchTensileByBarcode, saveTensileEntry } from '../services/tensile_entry.api';

const initialValues = {
  barcode_id: '',
  b_dynamic_tensile_strength: '',
  b_avg_strip_force: '',
  b_peak_strip_force: '',
  a_dynamic_tensile_strength: '',
  a_avg_strip_force: '',
  a_peak_strip_force: '',
};

const validationSchema = Yup.object().shape({
  barcode_id: Yup.string().required('Barcode ID is required'),
  b_dynamic_tensile_strength: Yup.number().typeError('Must be a number').required('Required'),
  b_avg_strip_force: Yup.number().typeError('Must be a number').required('Required'),
  b_peak_strip_force: Yup.number().typeError('Must be a number').required('Required'),
  a_dynamic_tensile_strength: Yup.number().typeError('Must be a number').required('Required'),
  a_avg_strip_force: Yup.number().typeError('Must be a number').required('Required'),
  a_peak_strip_force: Yup.number().typeError('Must be a number').required('Required'),
});

const TensileEntry = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [existingId, setExistingId] = useState(null);

  /* ── Fetch existing tensile data by barcode ── */
  const handleBarcodeFetch = async (barcode, setValues) => {
    const val = barcode.trim();
    if (!val) return;
    setLoading(true);
    setExistingId(null);
    try {
      const res = await fetchTensileByBarcode(val);
      if (res?.exists && res.data) {
        const d = res.data;
        setValues({
          barcode_id: val,
          b_dynamic_tensile_strength: d.b_dynamic_tensile_strength ?? '',
          b_avg_strip_force: d.b_avg_strip_force ?? '',
          b_peak_strip_force: d.b_peak_strip_force ?? '',
          a_dynamic_tensile_strength: d.a_dynamic_tensile_strength ?? '',
          a_avg_strip_force: d.a_avg_strip_force ?? '',
          a_peak_strip_force: d.a_peak_strip_force ?? '',
        });
        setExistingId(d.tensile_entry_id);
        setFetched(true);
        showSuccess('Existing tensile entry loaded');
      } else {
        setValues({ ...initialValues, barcode_id: val });
        setFetched(true);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setValues({ ...initialValues, barcode_id: val });
        setFetched(true);
      } else {
        showError(err?.response?.data?.message || 'Failed to fetch tensile data');
        setFetched(false);
      }
    }
    setLoading(false);
  };

  /* ── Submit ── */
  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const payload = {
        bobbin_no: values.barcode_id,
        b_dynamic_tensile_strength: Number(values.b_dynamic_tensile_strength),
        b_avg_strip_force: Number(values.b_avg_strip_force),
        b_peak_strip_force: Number(values.b_peak_strip_force),
        a_dynamic_tensile_strength: Number(values.a_dynamic_tensile_strength),
        a_avg_strip_force: Number(values.a_avg_strip_force),
        a_peak_strip_force: Number(values.a_peak_strip_force),
        existing_id: existingId,
      };
      const res = await saveTensileEntry(payload);
      if (res?.success) {
        showSuccess(existingId ? 'Tensile entry updated successfully' : 'Tensile entry saved successfully');
        resetForm({ values: initialValues });
        setFetched(false);
        setExistingId(null);
      } else {
        showError(res?.message || 'Save failed');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to save tensile entry');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={false}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ resetForm, values, setValues, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden px-3 py-2 gap-2">

              {/* ── Barcode ID ── */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[9px] font-bold text-slate-800 uppercase ml-0.5">Barcode ID</label>
                  <div className="flex items-center border border-slate-200 rounded bg-slate-100 overflow-hidden">
                    <input
                      value={values.barcode_id}
                      onChange={(e) => setFieldValue('barcode_id', e.target.value)}
                      onBlur={() => handleBarcodeFetch(values.barcode_id, setValues)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeFetch(values.barcode_id, setValues); } }}
                      className="w-40 px-2 py-1.5 text-xs outline-none bg-transparent font-semibold"
                      placeholder="Scan barcode..."
                    />
                    <button type="button" onClick={() => handleBarcodeFetch(values.barcode_id, setValues)}
                      disabled={loading}
                      className="px-2 py-1.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all">
                      <Scan size={12} />
                    </button>
                  </div>
                </div>
                {existingId && (
                  <span className="text-[9px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-300 mt-4">
                    Existing — Update Mode
                  </span>
                )}
              </div>

              {/* ── Before Aging ── */}
              <ModuleCard compact title="Before Aging" icon={<Dumbbell size={13} className="text-blue-600" />}>
                <div className="grid grid-cols-3 gap-3">
                  <FormikInput compact label="Dynamic Tensile Strength (GPA)" name="b_dynamic_tensile_strength" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="Avg Strip Force (N)" name="b_avg_strip_force" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="Peak Strip Force (N)" name="b_peak_strip_force" type="number" step="0.001" placeholder="0.000" />
                </div>
              </ModuleCard>

              {/* ── After Aging ── */}
              <ModuleCard compact title="After Aging" icon={<Dumbbell size={13} className="text-orange-600" />}>
                <div className="grid grid-cols-3 gap-3">
                  <FormikInput compact label="Dynamic Tensile Strength (GPA)" name="a_dynamic_tensile_strength" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="Avg Strip Force (N)" name="a_avg_strip_force" type="number" step="0.001" placeholder="0.000" />
                  <FormikInput compact label="Peak Strip Force (N)" name="a_peak_strip_force" type="number" step="0.001" placeholder="0.000" />
                </div>
              </ModuleCard>

              {/* ── Actions ── */}
              <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
                <ResetButton compact type="button" onClick={() => { resetForm(); setFetched(false); setExistingId(null); }}>Reset</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting || !fetched}>
                  {submitting ? 'Saving...' : existingId ? 'Update' : 'Submit'}
                </SubmitButton>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TensileEntry;
