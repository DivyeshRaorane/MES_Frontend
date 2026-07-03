import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { Plus, ClipboardList, History, X, Keyboard, Settings, Building2, ListOrdered,Trash2 } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { useDispatch, useSelector } from 'react-redux';
import { getPreformForAllocation, preformAllocationEntry , getRecentAllocatedPreforms  } from '../services/preform_allocation.api';
import { getTowerForAllocation } from '../../draw_tower/service/draw_tower.api';
import { resume } from 'react-dom/server';
import { showSuccess,showError } from '../../../utils/toastService';
import { array } from 'yup';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';
import { getAllDrawUsers } from '../../Admin_Folder/draw_management/draw_users/service/draw_user.api';
import { preformDiallocation } from '../services/preform_allocation.api';



const FORM_INIT = {
  preform_id: "",
  allocation_date: new Date().toISOString().split('T')[0],
  tower_no: null,
  shift: null,
  seq: null,
  operator: null,
  process_remark: '',
  draw_instruction: '',
  dia1: '', dia2: '', dia3: '', dia4: '', dia5: '',
  cone_length: null,
  average_diameter: null,
};

/* ══════════════════════════════════════════════════════════ */
const PrerformAllocation = () => {
  const dispatch = useDispatch();
  const [selectedPreform, setSelectedPreform] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [drawUsers, setDrawUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
const [selectedAllocation, setSelectedAllocation] = useState(null);


  const { preformForAllocationData, paLoading, paError } = useSelector((state) => state.preformForAllocation);
  console.log("preform allocations:", preformForAllocationData)
  //For diallocation preform
const confirmDeallocation = async () => {
    try {
        const res = await preformDiallocation(selectedAllocation.allocation_id);

        showSuccess(res.message);

        setShowPopup(false);
        setSelectedAllocation(null);

        // Refresh table
        dispatch(getRecentAllocatedPreforms());
        dispatch(getPreformForAllocation());
        dispatch(getTowerForAllocation(true))

    } catch (error) {
        showError(error.response?.data?.message || error.message);
    }
};


  useEffect(() => {
    dispatch(getPreformForAllocation())
  }, [dispatch])

  useEffect(()=>{
    dispatch(getTowerForAllocation(true))
  },[dispatch])

  useEffect(()=>{
    dispatch(getRecentAllocatedPreforms())
  },[dispatch])

  const {towerForAllocationData,taLoading,taError}= useSelector((state)=> state.towersForAllocation)
  const {recentAllocatedPreformData, rapLoading, rapError}= useSelector((state)=> state.recentAllocatedPreform)

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await getAllShifts();
        setShifts(data.data);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };
    fetchShifts();
  }, [])

   useEffect(() => {
      const fetchDrawUsers = async () => {
        try {
          const data = await getAllDrawUsers();
          setDrawUsers(data.data);
        } catch (error) {
          console.error("Error Fetching Draw Users:", error)
        }
      }
      fetchDrawUsers();
    }, [])


  const shiftOptions = shifts.map((shift) => ({
    label: `${shift.shift_name}`,
    value: shift.shift_name,
  }));

   const drawUsersOption = drawUsers.map((users) => ({
    label: `${users.draw_user_name}`,
    value: users.draw_user_id
  }))

   const towerOptions = Array.isArray(towerForAllocationData)
  ? towerForAllocationData.map(t => ({
      label: `Tower ${t.tower_no}`,
      value: t.tower_id
    }))
  : [];



  const avgDia =
    [1, 2, 3, 4, 5].reduce(
      (sum, i) => sum + Number(selectedPreform?.[`dia${i}`] || 0),
      0
    ) / 5;


  const handleSubmit = async(values, { resetForm }) => {
    if (!selectedPreform)  return;

     const payload = {
      ...values,
      preform_id: selectedPreform.preform_id,
      average_diameter: avgDia,
      preform_type:selectedPreform.preform_type,
      product_type:selectedPreform.product_type,

    };

    try{
      const result = await dispatch(preformAllocationEntry(payload))
      dispatch(getPreformForAllocation());
        dispatch(getTowerForAllocation(true))
        dispatch(getRecentAllocatedPreforms())
      console.log("result preform allocation:", result)
      showSuccess(result?.payload?.message)
      setSelectedPreform(null);
      resetForm();
    }catch(error){
 console.error("Allocation failed:", error);
 showError(error?.message)
    }


    
    setSelectedPreform(null);
    resetForm();
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Body ── */}
        <div className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">

          {/* ── Row 1: Available WIP | Recent Allocations ── */}
          <div className="grid grid-cols-2 gap-3 min-h-0">

            {/* Available WIP — internal scroll when rows overflow */}
            <ModuleCard
              compact
              title="Available WIP"
              icon={<ClipboardList size={13} className="text-blue-600" />}
            >
              {/* -m-3 offsets ModuleCard's compact p-3 for a flush table */}
              <div className="-m-3 overflow-y-auto max-h-40">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Action</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Preform ID</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-right">Weight (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.isArray(preformForAllocationData) && preformForAllocationData.map((item) => (
                      <tr
                        key={item.preform_id}
                        className={`transition-colors ${selectedPreform?.preform_id === item.preform_id ? 'bg-blue-50' : 'hover:bg-blue-50/40'}`}
                      >
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPreform(item)}
                            className={`p-1 rounded-lg transition-all ${selectedPreform?.preform_id === item.preform_id
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'
                              }`}
                          >
                            <Plus size={13} />
                          </button>
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{item.preform_id}</td>
                        <td className="px-3 py-2 text-right font-mono text-slate-600">{item.balance_qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModuleCard>

            {/* Recent Allocations — internal scroll when rows overflow */}
            <ModuleCard
              compact
              title="Recent Allocations"
              icon={<History size={13} className="text-indigo-600" />}
            >
              <div className="-m-3 overflow-y-auto max-h-40">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                    <tr>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Line</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Preform</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase text-right">Balance</th>
                      <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.isArray(recentAllocatedPreformData) && 
                    recentAllocatedPreformData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2 font-medium text-slate-700">{row.tower_no}</td>
                        <td className="px-3 py-2 font-bold text-blue-700">{row.preform_id}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600">{row.balance_qty} KG</td>
                        <td className="px-3 py-2">
          <button
    type="button"
    onClick={() => {
        setSelectedAllocation(row);
        setShowPopup(true);
    }}
    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
>
    <Trash2 size={14} />
</button>
        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ModuleCard>
          </div>

          {/* ── Row 2: Entry Form ── */}
          <div className={`flex-1 min-h-0 rounded-2xl border-2 overflow-hidden flex flex-col transition-all duration-300 ${selectedPreform ? 'border-blue-300 shadow-lg' : 'border-slate-200 opacity-60'
            }`}>

            {/* Form header bar */}
            <div className={`px-4 py-2.5 flex justify-between items-center transition-colors duration-300 ${selectedPreform ? 'bg-blue-900' : 'bg-slate-700'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${selectedPreform ? 'bg-blue-700' : 'bg-slate-600'}`}>
                  <Keyboard size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {selectedPreform ? `Entry Form: ${selectedPreform.preform_id}` : 'Entry Form — Select a Preform above'}
                  </h2>
                  {selectedPreform && (
                    <p className="text-blue-200 text-[10px] font-medium">
                      Stock Weight: {selectedPreform.preform_weight} KG || Drawing Length : {selectedPreform.drawing_length}
                    </p>

                  )}
                </div>
              </div>
              {selectedPreform && (
                <button
                  type="button"
                  onClick={() => setSelectedPreform(null)}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Formik form body */}
            <Formik
              initialValues={FORM_INIT}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ resetForm, setFieldValue, values }) => (
                <Form className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-slate-200">

                    {/* Left: Logistics & Tracking */}
                    <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <Settings size={12} className="text-blue-600" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Logistics &amp; Tracking</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <FormikInput compact label="Allocation Date" name="allocation_date" type="date"
                          onChange={(e) => {
                            const selected = e.target.value;
                            const today = new Date().toISOString().split('T')[0];
                            if (selected > today) {
                              showError("Allocation Date cannot be a future date");
                              setFieldValue("allocation_date", '');
                            } else {
                              setFieldValue("allocation_date", selected);
                            }
                          }} />
                        <FormikSelect compact label="Tower Line (DT)" name="tower_no" options={towerOptions}
                          onChange={(e) => {
                            const towerId = e.target.value;
                            if (!towerId) {
                              setFieldValue("seq", '');
                              return;
                            }
                            // Find furnace_count from existing tower data
                            const tower = Array.isArray(towerForAllocationData)
                              ? towerForAllocationData.find(t => String(t.tower_id) === String(towerId))
                              : null;
                            const count = Number(tower?.furnace_count) || 0;
                            setFieldValue("seq", count + 1);
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <FormikSelect compact label="Working Shift" name="shift" options={shiftOptions} />
                        <FormikInput compact label="Sequence No" name="seq" placeholder="e.g. 1" />
                        <FormikSelect compact label="Loading Operator" name="operator" options={drawUsersOption} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <FormikInput compact label="Preform Type" name="preform_type" value={selectedPreform?.preform_type} disabled placeholder="e.g. 1" />
                        <FormikInput compact label="Product Type" name="product_type" value= { selectedPreform?.product_type} disabled />
                        <FormikSelect compact label="Process Type" name="process_type" options={['250', '200', '180','160']} />
                      </div>
                      <FormikTextarea compact label="Draw Instruction" name="draw_instruction" placeholder="Draw Instruction..." rows={2} />
                    </div>

                    {/* Right: Measurements */}
                    <div className="p-3 flex flex-col gap-2 overflow-y-auto">
                      <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                        <ListOrdered size={12} className="text-blue-600" />
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Measurements (MM)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <FormikInput key={i} compact label={`Dia ${i}`} name={`dia${i}`} value={selectedPreform?.[`dia${i}`]} disabled type="number" placeholder="0.00" />
                        ))}
                        <FormikInput compact label="Cone L" name="coneL" value={selectedPreform?.cone_length} type="number" placeholder="0.00" />
                      </div>
                      <FormikInput compact label="Average Diameter" name="average_diameter" type="number" value={avgDia} placeholder="Calculated average" />
                      <div>
                        <FormikTextarea compact label="Process Remark" name="process_remarks" placeholder="Enter observations..." rows={2} />
                      </div>
                    </div>

                  </div>

                  {/* Footer actions */}
                  <div className="bg-slate-50 px-4 py-2 flex justify-between gap-3 border-t border-slate-200">
                    <ResetButton
                      compact
                      type="button"
                      disabled={!selectedPreform}
                      onClick={() => resetForm()}
                    >
                      Clear Fields
                    </ResetButton>
                    <SubmitButton
                      compact
                      type="submit"
                      disabled={!selectedPreform}
                    >
                      Confirm Allocation
                    </SubmitButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

        </div>
      </div>
      {showPopup && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

        <div className="bg-white rounded-xl shadow-xl w-[400px]">

            <div className="border-b px-5 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    Confirm Deallocation
                </h2>
            </div>

            <div className="p-5">

                <p className="text-gray-600">
                    Are you sure you want to deallocate this preform?
                </p>

                {selectedAllocation && (
                    <div className="mt-4 bg-gray-100 rounded-lg p-3">

                        <p>
                            <span className="font-semibold">
                                Preform :
                            </span>{" "}
                            {selectedAllocation.preform_id}
                        </p>

                        <p>
                            <span className="font-semibold">
                                Tower :
                            </span>{" "}
                            {selectedAllocation.tower_no}
                        </p>

                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        onClick={() => {
                            setShowPopup(false);
                            setSelectedAllocation(null);
                        }}
                        className="px-4 py-2 rounded border"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={confirmDeallocation}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Deallocate
                    </button>

                </div>

            </div>

        </div>

    </div>
)}
    </div>
  );
};

export default PrerformAllocation;
