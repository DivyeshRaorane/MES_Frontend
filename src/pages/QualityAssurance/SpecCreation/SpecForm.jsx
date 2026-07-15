import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, ClipboardList, Settings2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { createSpec, updateSpec, getSpecById } from './SpecService';
import { SPEC_PARAMETERS } from './parameterList';

const validationSchema = Yup.object({
  customer_name: Yup.string().required('Customer Name is required'),
  cust_spec_name: Yup.string().required('Customer Spec Name is required'),
});

const buildInitialValues = () => ({
  customer_name: '', po_number: '', pt_strain: '', cust_spec_name: '',
  product_type: '', coating_type: '', quantity_km: '', color: '',
  priority: 1, remarks: '',
});

const buildInitialParams = () =>
  SPEC_PARAMETERS.map(p => ({ parameter_name: p, min_value: '', max_value: '' }));

const SpecForm = ({ specId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState(buildInitialValues());
  const [params, setParams] = useState(buildInitialParams());
  const isEdit = !!specId;

  useEffect(() => {
    if (specId) {
      (async () => {
        setLoading(true);
        try {
          const res = await getSpecById(specId);
          if (res?.success) {
            const master = res.data.master || {};
            setInitialValues({
              customer_name: master.customer_name || '',
              po_number: master.po_number || '',
              pt_strain: master.pt_strain || '',
              cust_spec_name: master.cust_spec_name || '',
              product_type: master.product_type || '',
              coating_type: master.coating_type || '',
              quantity_km: master.quantity_km || '',
              color: master.color || '',
              priority: master.priority || 1,
              remarks: master.remarks || '',
            });
            // Map existing parameters into fixed list
            const existingParams = res.data.parameters || [];
            const mapped = SPEC_PARAMETERS.map(pName => {
              const existing = existingParams.find(ep => ep.parameter_name === pName);
              return {
                parameter_name: pName,
                min_value: existing?.min_value ?? '',
                max_value: existing?.max_value ?? '',
              };
            });
            setParams(mapped);
          }
        } catch (e) { showError('Failed to load spec'); }
        setLoading(false);
      })();
    }
  }, [specId]);

  const handleParamChange = (idx, field, value) => {
    setParams(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        master: values,
        parameters: params.filter(p => p.min_value !== '' || p.max_value !== '').map(p => ({
          parameter_name: p.parameter_name,
          min_value: p.min_value !== '' ? Number(p.min_value) : null,
          max_value: p.max_value !== '' ? Number(p.max_value) : null,
        })),
      };

      const res = isEdit ? await updateSpec(specId, payload) : await createSpec(payload);
      if (res?.success) {
        showSuccess(isEdit ? 'Specification updated' : 'Specification created');
        onBack();
      } else { showError(res?.message || 'Save failed'); }
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
      <div className="flex-1 overflow-y-auto p-3">
        <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} validateOnChange={false} validateOnBlur={true} onSubmit={handleSubmit}>
          {({ resetForm }) => (
            <Form className="flex flex-col gap-3">
              {/* Card 1: Basic Info */}
              <ModuleCard compact title="Basic Information" icon={<ClipboardList size={13} className="text-indigo-600" />}>
                <div className="grid grid-cols-4 gap-2">
                  <FormikInput compact label="Customer Name *" name="customer_name" />
                  <FormikInput compact label="PO Number" name="po_number" />
                  <FormikSelect compact label="PT Strain" name="pt_strain" options={[{ label: '1%', value: 1 }, { label: '2%', value: 2 }]} />
                  <FormikInput compact label="Customer Spec Name *" name="cust_spec_name" />
                  <FormikInput compact label="Product Type" name="product_type" />
                  <FormikSelect compact label="Coating Type" name="coating_type" options={['Single', 'Dual']} />
                  <FormikInput compact label="Quantity (KM)" name="quantity_km" type="number" />
                  <FormikInput compact label="Color" name="color" />
                  <FormikInput compact label="Priority" name="priority" type="number" />
                  <div className="col-span-3">
                    <FormikTextarea compact label="Remarks" name="remarks" rows={2} placeholder="Optional remarks..." />
                  </div>
                </div>
              </ModuleCard>

              {/* Card 2: Parameters */}
              <ModuleCard compact title="Specification Parameters" icon={<Settings2 size={13} className="text-emerald-600" />}>
                <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-700 text-white z-10">
                      <tr>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase w-8">#</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase">Parameter</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase w-36">Min Value</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase w-36">Max Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {params.map((p, idx) => (
                        <tr key={p.parameter_name} className="hover:bg-blue-50/30">
                          <td className="px-3 py-1.5 text-[9px] text-slate-400 font-bold">{idx + 1}</td>
                          <td className="px-3 py-1.5 text-[10px] font-mono font-semibold text-slate-700">{p.parameter_name}</td>
                          <td className="px-2 py-1">
                            <input type="number" step="any" value={p.min_value} onChange={e => handleParamChange(idx, 'min_value', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="—" />
                          </td>
                          <td className="px-2 py-1">
                            <input type="number" step="any" value={p.max_value} onChange={e => handleParamChange(idx, 'max_value', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300" placeholder="—" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ModuleCard>

              {/* Actions */}
              <div className="flex justify-between gap-3 pt-1">
                <ResetButton compact type="button" onClick={() => { resetForm(); setParams(buildInitialParams()); }}>Reset</ResetButton>
                <SubmitButton compact type="submit" disabled={submitting}>{submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}</SubmitButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SpecForm;
