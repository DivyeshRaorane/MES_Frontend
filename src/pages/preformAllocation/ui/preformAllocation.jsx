import React, { useState, useRef } from 'react';
import { useFormik } from 'formik';
import { 
  Download, 
  Plus, 
  ClipboardList,
  History,
  X,
  Save,
  Keyboard,
  Settings
} from 'lucide-react';

// --- Sub-Components for Cleanliness ---

const FormField = ({ label, name, formik, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
    <input
      {...formik.getFieldProps(name)}
      {...props}
      className={`rounded-lg border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${props.readOnly ? 'bg-slate-50' : 'bg-white'}`}
    />
  </div>
);

const FormSelect = ({ label, name, options, formik }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
    <select
      {...formik.getFieldProps(name)}
      className="rounded-lg border border-slate-300 p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// --- Main Component ---

const PrerformAllocation = () => {
  const [selectedPreform, setSelectedPreform] = useState(null);
  const entryFormRef = useRef(null);

  // Mock Data
  const [wipData] = useState([
    { id: 'TEF524220', weight: 54.041, batch: 'B-9921' },
    { id: 'TEF524195', weight: 55.952, batch: 'B-8832' },
    { id: 'TEF524194', weight: 60.997, batch: 'B-7710' },
  ]);

  const [allocations] = useState([
    { date: '31-05-2024', dtNo: 'DT10', preformId: 'TEF524220', weight: 54.041, consumed: 8.470, unit: 'KG', seq: '1' },
  ]);

  // Formik Initialization
  const formik = useFormik({
    initialValues: {
      entryDate: '2024-05-31',
      dtNo: '',
      shift: '',
      seq: '',
      loadedBy: '',
      remarks: '',
      // Dynamic keys for Dia 1 to Dia 10
      ...Array.from({ length: 5}).reduce((acc, _, i) => ({ ...acc, [`dia${i + 1}`]: '' }), {}),
      coneL: '',
      avgDia: ''
    },
    onSubmit: (values) => {
      const payload = { ...values, preformId: selectedPreform.id };
      console.log('Submission Payload:', payload);
      alert(`Success! Allocated ${selectedPreform.id}`);
      handleClearForm();
    },
  });

  const handleSelectPreform = (item) => {
    setSelectedPreform(item);
    setTimeout(() => {
      entryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClearForm = () => {
    setSelectedPreform(null);
    formik.resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Preform Tower Management</h1>
          <p className="text-sm text-white">Track and allocate preform stock to tower lines</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 transition shadow-sm">
          <Download size={16} /> Export Data
        </button>
      
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: WIP List */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2 text-slate-700">
                <ClipboardList size={20} className="text-blue-600" /> Available WIP
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Preform ID</th>
                    <th className="px-4 py-3 text-right">Weight (KG)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wipData.map((item) => (
                    <tr key={item.id} className={`hover:bg-blue-50/50 transition-colors ${selectedPreform?.id === item.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleSelectPreform(item)}
                          className={`p-1.5 rounded-lg transition-all ${selectedPreform?.id === item.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                        >
                          <Plus size={16} />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold">{item.id}</td>
                      <td className="px-4 py-3 text-right font-mono">{item.weight.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* RIGHT: Recent History */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-sm">
            <div className="bg-slate-50 px-5 py-4 border-b">
              <h2 className="font-bold flex items-center gap-2 text-slate-700">
                <History size={20} className="text-blue-600" /> Recent Allocations
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[10px] font-bold uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Line</th>
                    <th className="px-4 py-3">Preform</th>
                    <th className="px-4 py-3 text-right">Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{row.dtNo}</td>
                      <td className="px-4 py-3 text-blue-700 font-bold">{row.preformId}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-600">{row.consumed} KG</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* BOTTOM: Formik Form */}
        {selectedPreform && (
          <form 
            onSubmit={formik.handleSubmit}
            ref={entryFormRef}
            className="bg-white rounded-xl shadow-xl border-2 border-blue-200 overflow-hidden animate-in slide-in-from-bottom duration-300"
          >
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-700 p-2 rounded-lg"><Keyboard size={20} /></div>
                <div>
                  <h2 className="text-lg font-bold">Entry Form: {selectedPreform.id}</h2>
                  <p className="text-blue-200 text-xs">Target Weight: {selectedPreform.weight} KG</p>
                </div>
              </div>
              <button type="button" onClick={handleClearForm} className="text-blue-200 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Technical Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                  <Settings size={14}/> Logistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date" name="entryDate" type="date" formik={formik} />
                  <FormSelect label="DT No." name="dtNo" options={['Select', 'DT01', 'DT02', 'DT03', 'DT10']} formik={formik} />
                  <FormSelect label="Shift" name="shift" options={['Select', 'A', 'B', 'C']} formik={formik} />
                  <FormField label="Sequence" name="seq" placeholder="e.g. 1" formik={formik} />
                </div>
                <FormSelect label="Loaded By" name="loadedBy" options={['Select Name', 'Operator A', 'Operator B']} formik={formik} />
              </div>

              {/* Parameters Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest border-b pb-2">Measurements (MM)</h3>
                <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto p-1 custom-scrollbar">
                  {[...Array(5)].map((_, i) => (
                    <FormField key={i} label={`Dia ${i + 1}`} name={`dia${i + 1}`} type="number" formik={formik} />
                  ))}
                  <FormField label="Cone L" name="coneL" type="number" formik={formik} />
                  <FormField label="Avg Dia" name="avgDia" type="number" formik={formik} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Remarks</label>
                  <textarea 
                    {...formik.getFieldProps('remarks')}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm h-16 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter observations..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button type="button" onClick={handleClearForm} className="px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition">Discard</button>
              <button type="submit" className="flex items-center gap-2 px-10 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95">
                <Save size={18} /> Save Allocation
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
};

export default PrerformAllocation;