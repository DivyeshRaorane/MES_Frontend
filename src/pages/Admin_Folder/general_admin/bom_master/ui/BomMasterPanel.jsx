import { useState, useEffect } from 'react';
import {
  Plus, Edit2, ArrowLeft, Loader2, Search, Power, ClipboardList, Trash2, Eye,
} from 'lucide-react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FormikInput, FormikSelect } from '../../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../../components/common_buttons';
import { showSuccess, showError, showWarning } from '../../../../../utils/toastService';
import {
  getAllBOMs,
  getBOMByMaterialCode,
  createBOM,
  updateBOM,
  toggleBOMStatus,
  getMaterialsByCategory,
} from '../services/bom_master.api';

/* ══════════════════════════════════════════════════════════
   BOM MASTER PANEL - Main Component
   ══════════════════════════════════════════════════════════ */
const BomMasterPanel = ({ onBack }) => {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editMaterialCode, setEditMaterialCode] = useState(null);

  const handleCreate = () => {
    setEditMaterialCode(null);
    setView('form');
  };

  const handleEdit = (materialCode) => {
    setEditMaterialCode(materialCode);
    setView('form');
  };

  const handleBackToList = () => {
    setEditMaterialCode(null);
    setView('list');
  };

  if (view === 'form') {
    return (
      <BomForm
        materialCode={editMaterialCode}
        onBack={handleBackToList}
        onSaved={handleBackToList}
      />
    );
  }

  return (
    <BomList
      onBack={onBack}
      onCreate={handleCreate}
      onEdit={handleEdit}
    />
  );
};


/* ══════════════════════════════════════════════════════════
   BOM LIST VIEW
   ══════════════════════════════════════════════════════════ */
const BomList = ({ onBack, onCreate, onEdit }) => {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBoms = async () => {
    setLoading(true);
    try {
      const res = await getAllBOMs();
      setBoms(res?.data || []);
    } catch (e) {
      console.error(e);
      showError('Failed to fetch BOM list');
    }
    setLoading(false);
  };

  useEffect(() => { fetchBoms(); }, []);

  const filtered = boms.filter(b => {
    const q = search.toLowerCase();
    return !q
      || b.material_code?.toLowerCase().includes(q)
      || b.material_desc?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await toggleBOMStatus(item.material_code, !item.is_active);
      if (res?.success) {
        showSuccess(`${item.is_active ? 'Deactivated' : 'Activated'} successfully`);
        fetchBoms();
      } else {
        showError(res?.message || 'Failed');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
              <ArrowLeft size={11} /> Back
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-100">
              <ClipboardList size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">BOM Master</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
              {boms.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500/20 w-40" />
            </div>
            <button type="button" onClick={onCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-lg hover:bg-blue-700 transition-all">
              <Plus size={11} /> Create New BOM
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr>
                  {['Product Material Code', 'Product Description', 'Total Components', 'Status', 'Created Date', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-slate-400">No BOM records found</td></tr>
                ) : filtered.map(b => (
                  <tr key={b.material_code} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">
                      {b.material_code}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700 border-r border-slate-100 max-w-[200px] truncate">
                      {b.material_desc || '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {b.total_components || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        b.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {b.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500 border-r border-slate-100">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => onEdit(b.material_code)}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                          <Edit2 size={9} /> Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(b)}
                          className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                            b.is_active
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}>
                          <Power size={9} /> {b.is_active ? 'Deactivate' : 'Activate'}
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
   BOM FORM VIEW (Create / Edit)
   ══════════════════════════════════════════════════════════ */
const bomValidationSchema = Yup.object({
  material_code: Yup.string().required('Product Material Code is required'),
  components: Yup.array()
    .of(
      Yup.object({
        component_material_code: Yup.string().required('Component code is required'),
        consume_qty_per_km: Yup.number()
          .typeError('Must be a number')
          .required('Qty/KM is required')
          .moreThan(0, 'Must be greater than zero'),
      })
    )
    .min(1, 'At least one component is required'),
});

const BomForm = ({ materialCode, onBack, onSaved }) => {
  const isEdit = !!materialCode;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productMaterials, setProductMaterials] = useState([]);
  const [consumableMaterials, setConsumableMaterials] = useState([]);
  const [initialValues, setInitialValues] = useState({
    material_code: '',
    material_desc: '',
    components: [{ component_material_code: '', component_material_desc: '', consume_qty_per_km: '' }],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch product materials (SEMI_FINISHED)
        const prodRes = await getMaterialsByCategory('SEMI_FINISHED');
        const prodList = prodRes?.data || [];
        setProductMaterials(prodList);

        // Fetch consumable + semi-finished materials
        const [consRes, semiRes] = await Promise.all([
          getMaterialsByCategory('CONSUMABLE'),
          getMaterialsByCategory('SEMI_FINISHED'),
        ]);
        const consList = [...(consRes?.data || []), ...(semiRes?.data || [])];
        setConsumableMaterials(consList);

        // If editing, load existing BOM data
        if (isEdit) {
          const bomRes = await getBOMByMaterialCode(materialCode);
          const bomData = bomRes?.data;
          if (bomData) {
            setInitialValues({
              material_code: bomData.material_code || materialCode,
              material_desc: bomData.material_desc || '',
              components: bomData.components?.length > 0
                ? bomData.components.map(c => ({
                    component_material_code: c.component_material_code || '',
                    component_material_desc: c.component_material_desc || '',
                    consume_qty_per_km: c.consume_qty_per_km || '',
                  }))
                : [{ component_material_code: '', component_material_desc: '', consume_qty_per_km: '' }],
            });
          }
        }
      } catch (e) {
        console.error(e);
        showError('Failed to load form data');
      }
      setLoading(false);
    };
    loadData();
  }, [materialCode, isEdit]);

  const handleProductChange = (e, setFieldValue) => {
    const code = e.target.value;
    setFieldValue('material_code', code);
    const found = productMaterials.find(m => m.material_code === code);
    setFieldValue('material_desc', found?.material_description || '');
  };

  const handleComponentChange = (e, index, setFieldValue) => {
    const code = e.target.value;
    setFieldValue(`components.${index}.component_material_code`, code);
    const found = consumableMaterials.find(m => m.material_code === code);
    setFieldValue(`components.${index}.component_material_desc`, found?.material_description || '');
  };

  const checkDuplicateComponents = (components) => {
    const codes = components.map(c => c.component_material_code).filter(Boolean);
    const duplicates = codes.filter((item, idx) => codes.indexOf(item) !== idx);
    return duplicates.length > 0;
  };

  const handleSubmit = async (values) => {
    // Check for duplicate components
    if (checkDuplicateComponents(values.components)) {
      showWarning('Duplicate component material codes found. Please remove duplicates.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        material_code: values.material_code,
        material_desc: values.material_desc,
        components: values.components.map(c => ({
          component_material_code: c.component_material_code,
          component_material_desc: c.component_material_desc,
          consume_qty_per_km: parseFloat(c.consume_qty_per_km),
        })),
      };

      let res;
      if (isEdit) {
        res = await updateBOM(materialCode, payload);
      } else {
        res = await createBOM(payload);
      }

      if (res?.success) {
        showSuccess(isEdit ? 'BOM updated successfully' : 'BOM created successfully');
        onSaved();
      } else {
        showError(res?.message || 'Failed to save BOM');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  const productOptions = [
    { value: '', label: 'Select Product Material' },
    ...productMaterials.map(m => ({ value: m.material_code, label: m.material_code })),
  ];

  const consumableOptions = [
    { value: '', label: 'Select Component' },
    ...consumableMaterials.map(m => ({ value: m.material_code, label: m.material_code })),
  ];

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik
          initialValues={initialValues}
          validationSchema={bomValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* Form Header */}
              <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onBack}
                    className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
                    <ArrowLeft size={11} /> Back to List
                  </button>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-100">
                    <ClipboardList size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {isEdit ? 'Edit BOM' : 'Create New BOM'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={onBack}>Cancel</ResetButton>
                  <SubmitButton compact type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save'}
                  </SubmitButton>
                </div>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

                {/* Product Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Product</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <label className="font-bold text-slate-800 uppercase ml-0.5 text-[10px]">
                        Product Material Code *
                      </label>
                      <select
                        value={values.material_code}
                        onChange={(e) => handleProductChange(e, setFieldValue)}
                        disabled={isEdit}
                        className={`w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all cursor-pointer
                          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-3 py-2 text-sm
                          ${isEdit ? 'bg-slate-200 text-slate-500 cursor-default' : ''}`}
                      >
                        {productOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.material_code && touched.material_code && (
                        <p className="text-red-500 text-[9px] mt-0.5">{errors.material_code}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="font-bold text-slate-800 uppercase ml-0.5 text-[10px]">
                        Product Description
                      </label>
                      <input
                        value={values.material_desc}
                        readOnly
                        className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm bg-slate-200 text-slate-500 cursor-default outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Consume Materials Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Consume Materials</h3>
                  </div>

                  <FieldArray name="components">
                    {({ push, remove }) => (
                      <div className="flex flex-col gap-2 flex-1">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1fr_2fr_0.8fr_auto] gap-2 px-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Component Code *</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Description</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Qty / KM *</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase w-8"></span>
                        </div>

                        {/* Component Rows */}
                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[300px]">
                          {values.components.map((comp, index) => {
                            const compErrors = errors.components?.[index] || {};
                            const compTouched = touched.components?.[index] || {};
                            // Filter out already-selected components from other rows
                            const selectedCodes = values.components
                              .filter((_, i) => i !== index)
                              .map(c => c.component_material_code)
                              .filter(Boolean);
                            const filteredOptions = [
                              { value: '', label: 'Select Component' },
                              ...consumableMaterials
                                .filter(m => !selectedCodes.includes(m.material_code))
                                .map(m => ({ value: m.material_code, label: m.material_code })),
                            ];
                            return (
                              <div key={index} className="grid grid-cols-[1fr_2fr_0.8fr_auto] gap-2 items-start bg-white border border-slate-200 rounded-lg px-2 py-2">
                                {/* Component Code Dropdown */}
                                <div className="flex flex-col gap-0.5">
                                  <select
                                    value={comp.component_material_code}
                                    onChange={(e) => handleComponentChange(e, index, setFieldValue)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                                  >
                                    {filteredOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                  {compErrors.component_material_code && compTouched.component_material_code && (
                                    <p className="text-red-500 text-[8px]">{compErrors.component_material_code}</p>
                                  )}
                                </div>

                                {/* Component Description (read-only) */}
                                <div className="flex flex-col gap-0.5">
                                  <input
                                    value={comp.component_material_desc}
                                    readOnly
                                    className="w-full bg-slate-200 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-500 cursor-default outline-none"
                                    placeholder="Auto-filled"
                                  />
                                </div>

                                {/* Consume Qty per KM */}
                                <div className="flex flex-col gap-0.5">
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={comp.consume_qty_per_km}
                                    onChange={(e) => setFieldValue(`components.${index}.consume_qty_per_km`, e.target.value)}
                                    className={`w-full bg-slate-50 border rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500
                                      ${compErrors.consume_qty_per_km && compTouched.consume_qty_per_km ? 'border-red-500' : 'border-slate-200'}`}
                                    placeholder="0.000"
                                  />
                                  {compErrors.consume_qty_per_km && compTouched.consume_qty_per_km && (
                                    <p className="text-red-500 text-[8px]">{compErrors.consume_qty_per_km}</p>
                                  )}
                                </div>

                                {/* Delete Row Button */}
                                <div className="flex items-center justify-center pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (values.components.length > 1) {
                                        remove(index);
                                      } else {
                                        showWarning('At least one component is required');
                                      }
                                    }}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"
                                    title="Remove row"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Row Button */}
                        <button
                          type="button"
                          onClick={() => push({ component_material_code: '', component_material_desc: '', consume_qty_per_km: '' })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded-lg hover:bg-blue-100 transition-all self-start mt-1"
                        >
                          <Plus size={11} /> Add Row
                        </button>

                        {/* Array-level error */}
                        {typeof errors.components === 'string' && (
                          <p className="text-red-500 text-[9px] mt-1">{errors.components}</p>
                        )}
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default BomMasterPanel;
