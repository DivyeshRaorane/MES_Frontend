import { useState, useEffect } from 'react';
import {
  Plus, Edit2, ArrowLeft, Loader2, Search, Power, FileText, X, Trash2,
} from 'lucide-react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FormikInput, FormikSelect } from '../../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../../components/common_buttons';
import { showSuccess, showError, showWarning } from '../../../../../utils/toastService';
import {
  getAllProcessOrders,
  getProcessOrderByNo,
  createProcessOrder,
  updateProcessOrder,
  toggleProcessOrderStatus,
} from '../services/process_order.api';
import { getMaterialsByCategory, getBOMByMaterialCode } from '../../bom_master/services/bom_master.api';

/* ══════════════════════════════════════════════════════════
   PROCESS ORDER PANEL - Main Component
   ══════════════════════════════════════════════════════════ */
const ProcessOrderPanel = ({ onBack }) => {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editOrderNo, setEditOrderNo] = useState(null);

  const handleCreate = () => {
    setEditOrderNo(null);
    setView('form');
  };

  const handleEdit = (processONo) => {
    setEditOrderNo(processONo);
    setView('form');
  };

  const handleBackToList = () => {
    setEditOrderNo(null);
    setView('list');
  };

  if (view === 'form') {
    return (
      <ProcessOrderForm
        processONo={editOrderNo}
        onBack={handleBackToList}
        onSaved={handleBackToList}
      />
    );
  }

  return (
    <ProcessOrderList
      onBack={onBack}
      onCreate={handleCreate}
      onEdit={handleEdit}
    />
  );
};


/* ══════════════════════════════════════════════════════════
   PROCESS ORDER LIST (Grouped - one row per process_o_no)
   ══════════════════════════════════════════════════════════ */
const ProcessOrderList = ({ onBack, onCreate, onEdit }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllProcessOrders();
      const rawData = res?.data || [];
      
      // If API returns flat rows, group by process_o_no
      // If already grouped (has total_components), use as-is
      if (rawData.length > 0 && rawData[0].total_components !== undefined) {
        setOrders(rawData);
      } else {
        // Group flat rows by process_o_no
        const grouped = {};
        rawData.forEach(row => {
          if (!grouped[row.process_o_no]) {
            grouped[row.process_o_no] = {
              process_o_no: row.process_o_no,
              material_code: row.material_code,
              process_qty: row.process_qty,
              balance_qty: row.balance_qty,
              is_active: row.is_active,
              created_at: row.created_at,
              total_components: 0,
            };
          } else {
            grouped[row.process_o_no].total_components += 1;
          }
        });
        setOrders(Object.values(grouped));
      }
    } catch (e) {
      console.error(e);
      showError('Failed to fetch process orders');
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q
      || o.process_o_no?.toLowerCase().includes(q)
      || o.material_code?.toLowerCase().includes(q);
  });

  const handleToggle = async (item) => {
    try {
      const res = await toggleProcessOrderStatus(item.process_o_no, !item.is_active);
      if (res?.success) {
        showSuccess(`${item.is_active ? 'Deactivated' : 'Activated'} successfully`);
        fetchOrders();
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-600 bg-amber-100">
              <FileText size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Process Order Master</span>
            <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
              {orders.length}
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
              <Plus size={11} /> Create Process Order
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
                  {['Process Order No', 'Finished Material', 'Process Qty (KM)', 'Total Components', 'Status', 'Created Date', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-[9px] font-bold text-slate-300 uppercase border-r border-slate-700 last:border-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">No process orders found</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.process_o_no} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2 text-xs font-mono font-bold text-blue-700 border-r border-slate-100">
                      {o.process_o_no}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700 border-r border-slate-100">
                      {o.material_code}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100 text-right font-mono">
                      {parseFloat(o.process_qty).toFixed(3)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 border-r border-slate-100 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {o.total_components || 0}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-r border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        o.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {o.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500 border-r border-slate-100">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => onEdit(o.process_o_no)}
                          className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all">
                          <Edit2 size={9} /> Edit
                        </button>
                        <button type="button" onClick={() => handleToggle(o)}
                          className={`flex items-center gap-1 px-2 py-1 text-[8px] font-bold rounded transition-all border ${
                            o.is_active
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}>
                          <Power size={9} /> {o.is_active ? 'Deactivate' : 'Activate'}
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
   PROCESS ORDER FORM (Create / Edit with all material rows)
   ══════════════════════════════════════════════════════════ */
const processOrderSchema = Yup.object({
  process_o_no: Yup.string().required('Process Order No is required'),
  material_code: Yup.string().required('Finished Material Code is required'),
  process_qty: Yup.number()
    .typeError('Must be a number')
    .required('Process Qty is required')
    .moreThan(0, 'Must be greater than zero'),
  materials: Yup.array()
    .of(
      Yup.object({
        material_code: Yup.string().required('Material code is required'),
        process_qty: Yup.number()
          .typeError('Must be a number')
          .required('Qty is required')
          .min(0, 'Cannot be negative'),
      })
    )
    .min(1, 'At least one component material is required'),
});

const ProcessOrderForm = ({ processONo, onBack, onSaved }) => {
  const isEdit = !!processONo;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productMaterials, setProductMaterials] = useState([]);
  const [consumableMaterials, setConsumableMaterials] = useState([]);
  const [bomData, setBomData] = useState([]); // BOM components for selected material
  const [initialValues, setInitialValues] = useState({
    process_o_no: '',
    material_code: '',
    process_qty: '',
    materials: [],
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const prodRes = await getMaterialsByCategory('SEMI_FINISHED');
        setProductMaterials(prodRes?.data || []);

        const consRes = await getMaterialsByCategory('CONSUMABLE');
        setConsumableMaterials(consRes?.data || []);

        if (isEdit) {
          const poRes = await getProcessOrderByNo(processONo);
          // poRes could be: { success, data } where data is array or object
          const poData = poRes?.data;
          
          if (poData) {
            let allRows = [];
            let finishedMaterialCode = '';

            if (Array.isArray(poData)) {
              // Backend returns: { success: true, data: [{row1}, {row2}, ...] }
              allRows = poData;
              finishedMaterialCode = allRows[0]?.material_code || '';
            } else if (Array.isArray(poData.rows)) {
              // Backend returns: { success: true, data: { process_o_no, material_code, rows: [...] } }
              allRows = poData.rows;
              finishedMaterialCode = poData.material_code || allRows[0]?.material_code || '';
            } else {
              // Single object — shouldn't happen but handle gracefully
              allRows = [poData];
              finishedMaterialCode = poData.material_code || '';
            }

            if (allRows.length > 0) {
              const finishedRow = allRows[0];
              const componentRows = allRows.slice(1);

              // Load BOM for this material
              try {
                const bomRes = await getBOMByMaterialCode(finishedMaterialCode);
                setBomData(bomRes?.data?.components || []);
              } catch (e) { console.error(e); }

              setInitialValues({
                process_o_no: poData.process_o_no || finishedRow.process_o_no || processONo,
                material_code: finishedMaterialCode,
                process_qty: finishedRow?.process_qty || '',
                materials: componentRows.length > 0
                  ? componentRows.map(r => ({
                      material_code: r.material_code || '',
                      process_qty: r.process_qty || '',
                      balance_qty: r.balance_qty || '',
                    }))
                  : [{ material_code: '', process_qty: '', balance_qty: '' }],
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
        showError('Failed to load form data');
      }
      setLoading(false);
    };
    loadData();
  }, [processONo, isEdit]);

  // When finished material changes, load its BOM and auto-populate components
  const handleProductChange = async (e, setFieldValue, values) => {
    const code = e.target.value;
    setFieldValue('material_code', code);
    if (!code) {
      setBomData([]);
      setFieldValue('materials', [{ material_code: '', process_qty: '', balance_qty: '' }]);
      return;
    }
    try {
      const bomRes = await getBOMByMaterialCode(code);
      const components = bomRes?.data?.components || [];
      setBomData(components);
      // Auto-populate component rows from BOM
      const processQty = parseFloat(values.process_qty) || 0;
      if (components.length > 0) {
        const autoMaterials = components.map(c => {
          const calcQty = processQty > 0 ? parseFloat((processQty * parseFloat(c.consume_qty_per_km)).toFixed(3)) : '';
          return {
            material_code: c.component_material_code,
            process_qty: calcQty,
            balance_qty: calcQty,
          };
        });
        setFieldValue('materials', autoMaterials);
      }
    } catch (e) {
      setBomData([]);
      console.error(e);
    }
  };

  // When process_qty changes, recalculate all component quantities
  const handleProcessQtyChange = (e, setFieldValue, values) => {
    const qty = e.target.value;
    setFieldValue('process_qty', qty);
    const processQty = parseFloat(qty) || 0;
    // Recalculate each component's qty based on BOM
    if (bomData.length > 0 && values.materials.length > 0) {
      values.materials.forEach((mat, index) => {
        const bomComp = bomData.find(b => b.component_material_code === mat.material_code);
        if (bomComp) {
          const calcQty = parseFloat((processQty * parseFloat(bomComp.consume_qty_per_km)).toFixed(3));
          setFieldValue(`materials.${index}.process_qty`, calcQty);
          setFieldValue(`materials.${index}.balance_qty`, calcQty);
        }
      });
    }
  };

  // When a component is selected, auto-calculate its qty from BOM
  const handleComponentChange = (e, index, setFieldValue, values) => {
    const code = e.target.value;
    setFieldValue(`materials.${index}.material_code`, code);
    const bomComp = bomData.find(b => b.component_material_code === code);
    const processQty = parseFloat(values.process_qty) || 0;
    if (bomComp && processQty > 0) {
      const calcQty = parseFloat((processQty * parseFloat(bomComp.consume_qty_per_km)).toFixed(3));
      setFieldValue(`materials.${index}.process_qty`, calcQty);
      setFieldValue(`materials.${index}.balance_qty`, calcQty);
    } else {
      setFieldValue(`materials.${index}.process_qty`, '');
      setFieldValue(`materials.${index}.balance_qty`, '');
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const processQty = parseFloat(values.process_qty);
      const payload = {
        process_o_no: values.process_o_no,
        material_code: values.material_code,
        process_qty: processQty,
        balance_qty: processQty, // balance = process_qty on create
        materials: values.materials.map(m => ({
          material_code: m.material_code,
          process_qty: parseFloat(m.process_qty),
          balance_qty: parseFloat(m.balance_qty || m.process_qty),
        })),
      };

      let res;
      if (isEdit) {
        res = await updateProcessOrder(processONo, payload);
      } else {
        res = await createProcessOrder(payload);
      }

      if (res?.success) {
        showSuccess(isEdit ? 'Process Order updated successfully' : 'Process Order created successfully');
        onSaved();
      } else {
        showError(res?.message || 'Failed to save');
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
    { value: '', label: 'Select Finished Material' },
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
          validationSchema={processOrderSchema}
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
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-600 bg-amber-100">
                    <FileText size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {isEdit ? 'Edit Process Order' : 'Create Process Order'}
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

                {/* Process Order Header Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Process Order Details</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-0.5">
                      <label className="font-bold text-slate-800 uppercase ml-0.5 text-[10px]">Process Order No *</label>
                      <input
                        value={values.process_o_no}
                        onChange={(e) => setFieldValue('process_o_no', e.target.value)}
                        disabled={isEdit}
                        placeholder="e.g. 100030"
                        className={`w-full border border-slate-200 rounded-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                          ${isEdit ? 'bg-slate-200 text-slate-500 cursor-default' : 'bg-slate-100'}`}
                      />
                      {errors.process_o_no && touched.process_o_no && (
                        <p className="text-red-500 text-[9px] mt-0.5">{errors.process_o_no}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="font-bold text-slate-800 uppercase ml-0.5 text-[10px]">Finished Material Code *</label>
                      <select
                        value={values.material_code}
                        onChange={(e) => handleProductChange(e, setFieldValue, values)}
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
                      <label className="font-bold text-slate-800 uppercase ml-0.5 text-[10px]">Process Qty (KM) *</label>
                      <input
                        type="number"
                        value={values.process_qty}
                        onChange={(e) => handleProcessQtyChange(e, setFieldValue, values)}
                        placeholder="e.g. 5000"
                        className="w-full bg-slate-100 border border-slate-200 rounded-sm px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      {errors.process_qty && touched.process_qty && (
                        <p className="text-red-500 text-[9px] mt-0.5">{errors.process_qty}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Component Materials Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Component Materials</h3>
                  </div>

                  <FieldArray name="materials">
                    {({ push, remove }) => (
                      <div className="flex flex-col gap-2 flex-1">
                        {/* Table Header */}
                        <div className="grid grid-cols-[1.5fr_0.7fr_0.8fr_0.8fr_auto] gap-2 px-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Material Code *</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Qty/KM (BOM)</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Process Qty</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Balance Qty</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase w-8"></span>
                        </div>

                        {/* Component Rows */}
                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[300px]">
                          {values.materials.map((mat, index) => {
                            const matErrors = errors.materials?.[index] || {};
                            const matTouched = touched.materials?.[index] || {};
                            // Filter out already-selected materials from other rows
                            const selectedCodes = values.materials
                              .filter((_, i) => i !== index)
                              .map(m => m.material_code)
                              .filter(Boolean);
                            const filteredOptions = [
                              { value: '', label: 'Select Component' },
                              ...consumableMaterials
                                .filter(m => !selectedCodes.includes(m.material_code))
                                .map(m => ({ value: m.material_code, label: m.material_code })),
                            ];
                            // Get BOM rate for this component
                            const bomComp = bomData.find(b => b.component_material_code === mat.material_code);
                            const qtyPerKm = bomComp ? parseFloat(bomComp.consume_qty_per_km) : '';
                            return (
                              <div key={index} className="grid grid-cols-[1.5fr_0.7fr_0.8fr_0.8fr_auto] gap-2 items-start bg-white border border-slate-200 rounded-lg px-2 py-2">
                                {/* Material Code Dropdown */}
                                <div className="flex flex-col gap-0.5">
                                  <select
                                    value={mat.material_code}
                                    onChange={(e) => handleComponentChange(e, index, setFieldValue, values)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                                  >
                                    {filteredOptions.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                  {matErrors.material_code && matTouched.material_code && (
                                    <p className="text-red-500 text-[8px]">{matErrors.material_code}</p>
                                  )}
                                </div>

                                {/* Qty/KM from BOM (read-only) */}
                                <div className="flex flex-col gap-0.5">
                                  <input
                                    type="text"
                                    value={qtyPerKm !== '' ? qtyPerKm : '—'}
                                    readOnly
                                    className="w-full bg-slate-200 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-500 cursor-default outline-none"
                                  />
                                </div>

                                {/* Process Qty (auto-calculated, read-only) */}
                                <div className="flex flex-col gap-0.5">
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={mat.process_qty}
                                    readOnly
                                    className="w-full bg-slate-200 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-600 cursor-default outline-none font-mono"
                                    placeholder="Auto"
                                  />
                                </div>

                                {/* Balance Qty (same as process_qty, read-only) */}
                                <div className="flex flex-col gap-0.5">
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={mat.balance_qty || mat.process_qty}
                                    readOnly
                                    className="w-full bg-slate-200 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-600 cursor-default outline-none font-mono"
                                    placeholder="Auto"
                                  />
                                </div>

                                {/* Delete Row Button */}
                                <div className="flex items-center justify-center pt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (values.materials.length > 1) {
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
                          onClick={() => push({ material_code: '', process_qty: '', balance_qty: '' })}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold rounded-lg hover:bg-blue-100 transition-all self-start mt-1"
                        >
                          <Plus size={11} /> Add Row
                        </button>

                        {/* Array-level error */}
                        {typeof errors.materials === 'string' && (
                          <p className="text-red-500 text-[9px] mt-1">{errors.materials}</p>
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

export default ProcessOrderPanel;
