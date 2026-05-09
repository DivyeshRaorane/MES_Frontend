import React, { useState, useRef } from 'react';
import { Formik, Form } from 'formik';
import { 
  Download, 
  Plus, 
  ClipboardList,
  History,
  X,
  Keyboard,
  Settings,
  Building2,
  ListOrdered
} from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { FormikInput, FormikSelect, ModuleCard } from '../../../components/common_fields';
import FormHeader from '../../../components/header_template';

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

  const initialValues = {
    entryDate: '2024-05-31',
    dtNo: 'DT01',
    shift: 'A',
    seq: '',
    loadedBy: 'Operator A',
    remarks: '',
    ...Array.from({ length: 5 }).reduce((acc, _, i) => ({ ...acc, [`dia${i + 1}`]: '' }), {}),
    coneL: '',
    avgDia: ''
  };

  const handleSelectPreform = (item) => {
    setSelectedPreform(item);
    setTimeout(() => {
      entryFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClearForm = () => {
    setSelectedPreform(null);
  };

  const handleSubmit = (values, { resetForm }) => {
    const payload = { ...values, preformId: selectedPreform.id };
    console.log('Submission Payload:', payload);
    alert(`Success! Allocated ${selectedPreform.id}`);
    handleClearForm();
    resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <FormHeader 
                          title="Preform Tower Management"
                          subtitle="MES Production Portal"
                          userName="Divyesh"
                          userRole="Software Developer"
                          icon={Building2}
                        />

        <div className="space-y-6 m-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT: WIP List */}
            <ModuleCard 
              title="Available WIP" 
              icon={<ClipboardList size={18} className="text-blue-600" />}
            >
              <div className="-m-5"> {/* Offset ModuleCard padding for flush table */}
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Action</th>
                      <th className="px-5 py-3">Preform ID</th>
                      <th className="px-5 py-3 text-right">Weight (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wipData.map((item) => (
                      <tr key={item.id} className={`hover:bg-blue-50/50 transition-colors ${selectedPreform?.id === item.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-5 py-3">
                          <button 
                            onClick={() => handleSelectPreform(item)}
                            className={`p-1.5 rounded-lg transition-all ${selectedPreform?.id === item.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                          >
                            <Plus size={16} />
                          </button>
                        </td>
                        <td className="px-5 py-3 font-semibold">{item.id}</td>
                        <td className="px-5 py-3 text-right font-mono">{item.weight.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModuleCard>

            {/* RIGHT: Recent History */}
            <ModuleCard 
              title="Recent Allocations" 
              icon={<History size={18} className="text-blue-600" />}
            >
              <div className="-m-5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b text-[10px] font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Line</th>
                      <th className="px-5 py-3">Preform</th>
                      <th className="px-5 py-3 text-right">Consumed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allocations.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium">{row.dtNo}</td>
                        <td className="px-5 py-3 text-blue-700 font-bold">{row.preformId}</td>
                        <td className="px-5 py-3 text-right font-mono text-green-600">{row.consumed} KG</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModuleCard>
          </div>

          {/* BOTTOM: Formik Form */}
          {selectedPreform && (
            <div ref={entryFormRef} className="animate-in slide-in-from-bottom duration-300">
              <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
              >
                {({ resetForm }) => (
                  <Form className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 overflow-hidden">
                    <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-700 p-2 rounded-lg"><Keyboard size={20} /></div>
                        <div>
                          <h2 className="text-lg font-bold">Entry Form: {selectedPreform.id}</h2>
                          <p className="text-blue-200 text-xs font-medium">Stock Weight: {selectedPreform.weight} KG</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleClearForm} 
                        className="text-blue-200 hover:text-white transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Logistics Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Settings size={16} className="text-blue-600" />
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Logistics & Tracking</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormikInput label="Allocation Date" name="entryDate" type="date" />
                          <FormikSelect 
                            label="Tower Line (DT)" 
                            name="dtNo" 
                            options={['DT01', 'DT02', 'DT03', 'DT10']} 
                          />
                          <FormikSelect 
                            label="Working Shift" 
                            name="shift" 
                            options={['A', 'B', 'C']} 
                          />
                          <FormikInput label="Sequence No" name="seq" placeholder="e.g. 1" />
                        </div>
                        <FormikSelect 
                          label="Loading Operator" 
                          name="loadedBy" 
                          options={['Operator A', 'Operator B', 'Supervisor X']} 
                        />
                      </div>

                      {/* Parameters Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <ListOrdered size={16} className="text-blue-600" />
                          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Measurements (MM)</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {[...Array(5)].map((_, i) => (
                            <FormikInput key={i} label={`Dia ${i + 1}`} name={`dia${i + 1}`} type="number" placeholder="0.00" />
                          ))}
                          <FormikInput label="Cone L" name="coneL" type="number" placeholder="0.00" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <FormikInput label="Average Diameter" name="avgDia" type="number" placeholder="Calculated average" />
                          <FormikInput 
                            label="Process Remarks" 
                            name="remarks" 
                            as="textarea" 
                            rows="2" 
                            placeholder="Enter observations..." 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex justify-between gap-3 border-t border-slate-200">
                      <ResetButton type="button" onClick={() => resetForm()}>
                        Clear Fields
                      </ResetButton>
                      <SubmitButton type="submit">
                        Confirm Allocation
                      </SubmitButton>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrerformAllocation;
