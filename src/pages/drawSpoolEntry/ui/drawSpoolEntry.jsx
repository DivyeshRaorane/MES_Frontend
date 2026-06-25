import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Plus, Trash2 } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { FormikSelect, FormikInput, FormikTextarea } from '../../../components/common_fields';
import { useDispatch, useSelector } from 'react-redux';
import { createDrawEntry, getTowerEvent } from '../services/draw_spool_entry.api';
import { getTowerForAllocation } from '../../draw_tower/service/draw_tower.api';
import { getPreformByTower } from '../services/draw_spool_entry.api';
import { drawFlawAutomation } from './draw_flaw_automate';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';
import { getAllDrawUsers } from '../../Admin_Folder/draw_management/draw_users/service/draw_user.api';
import { getAllDrawWindingObservations } from '../../Admin_Folder/draw_management/winding_observation/service/winding_observation.api';
import { getAllDrawFiberCutReason } from '../../Admin_Folder/draw_management/fiber_cut_reason/service/draw_fiber_cut_reason.api';
import { showSuccess, showError } from '../../../utils/toastService';



/* ── Compact section label ── */
const SL = ({ title, color = 'text-blue-700' }) => (
  <p className={`text-[9px] font-bold uppercase tracking-wider ${color} border-b border-slate-100 pb-0.5 mb-1`}>{title}</p>
);

/* ── Compact table cell ── */
const TCell = ({ name }) => (
  <Field name={name}
    className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-blue-300 transition-all" />
);

const getCurrentShift = () => {
  const h = new Date().getHours();
  if (h >= 7 && h < 15) return 'A';
  if (h >= 15 && h < 23) return 'B';
  return 'C';
};

const today = new Date().toISOString().split('T')[0];

const initialValues = {
  tower_id: '', preform_id: '',
  spool_id: '', start_date: '', end_date: '', start_time: '',
  end_time: '', drawn_weight: '', drawn_length: '', balance_weight: '',
  shift_id: '', drawn_line_speed: '', draw_tension: '', furnace_power: '',
  furnace_argon: '', furnace_he: '', tube_he: '', co2_flow: '', n2_flow: '',
  uv_air: '', winding_observation_id: '', scr_observation: '', top_end_scrap: '',
  bottom_end_scrap: '', die_clean: '', spool_status: '', indication_fiber_cut: '',
  indication_reason_id: "", remark: '', primary_coating: '', secondary_coating: '', coating_type: '',
  primary_pressure: '', secondary_pressure: '', primary_batch: '', secondary_batch: '',
  process_type: '', logged_in_user: '', shift_incharge: '', furnace_operator: '',
  die_operator: '', ground_operator: '',
  draw_flaws: [],
};

const CONSUMPTION_TABS = ['Coating'];
{/*['Coating', 'Furnace Gas', 'Nitrogen Gas', 'Helium Gas', 'CO2 Gas'];*/ }

/* ══════════════════════════════════════════════════════════ */
const DrawSpoolEntry = () => {
  const dispatch = useDispatch();
  const [activeConsTab, setActiveConsTab] = useState('Coating');
  const [shifts, setShifts] = useState([]);
  const [drawUsers, setDrawUsers] = useState([]);
  const [drawWindingObs, setDrawWindingObs] = useState([]);
  const [drawFiberCutReasons, setDrawFiberCutReasons] = useState([]);
  const { towerForAllocationData, taLoading, taError } = useSelector((state) => state.towersForAllocation)
  const { preformByTowerData, pbtLoading, pbtError } = useSelector((state) => state.preformByTower)

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

  useEffect(() => {
    const fetchDrawWindingObs = async () => {
      try {
        const data = await getAllDrawWindingObservations();
        setDrawWindingObs(data.data)
      } catch (error) {
        console.error("Error Fetching Draw Users:", error)
      }
    }
    fetchDrawWindingObs();
  }, [])

  useEffect(() => {
    const fetchDrawFiberCutReason = async () => {
      try {
        const data = await getAllDrawFiberCutReason();
        setDrawFiberCutReasons(data.data);
      } catch (error) {
        console.error("Error Fetching Draw Users:", error)
      }
    };
    fetchDrawFiberCutReason();
  }, [])




  const drawUsersOption = drawUsers.map((users) => ({
    label: `${users.draw_user_name}`,
    value: users.draw_user_id
  }))

  const shiftOptions = shifts.map((shift) => ({
    label: `${shift.shift_name} (${shift.shift_start_time} - ${shift.shift_end_time})`,
    value: shift.shift_id,
  }));

  const drawWindingObsOptions = drawWindingObs.map((obs) => ({
    label: `${obs.w_o_name}`,
    value: obs.wind_obs_id,
  }));

  const drawFiberCutReasonOptions = drawFiberCutReasons.map((reasons) => ({
    label: `${reasons.dfcr_name}`,
    value: reasons.dfcr_id,
  }))

  const rows = [
    // Noise
    { Message: "Message not defined for language English (United Kingdom), en" },

    // Random defects before Fast Layer
    { Message: "Bare fibre diameter Low. Length= @ 0.336 Diameter = 124.248" },
    { Message: "Bare fibre diameter High @ 0.342 Diameter = 125.641" },

    // Fast Layer Cycle 1
    { Message: "Coated fibre diameter High @ 16.253" },
    { Message: "Fast Layer Start @ 16.253" },
    { Message: "Fast Layer Start @ 16.254" }, // duplicate
    { Message: "Coated fibre diameter High @ 16.258" },
    { Message: "Coated fibre diameter High @ 16.303" },
    { Message: "Coated fibre diameter High @ 17.362" },
    { Message: "Fast Layer Stop @ 17.814" },
    { Message: "Fast Layer Stop @ 17.814" }, // duplicate

    // Fast Layer Cycle 2
    { Message: "Coated fibre diameter Low @ 17.895" },
    { Message: "Fast Layer Start @ 17.895" },
    { Message: "Fast Layer Start @ 17.896" },
    { Message: "Coated fibre diameter Low @ 17.910" },
    { Message: "Coated fibre diameter Low @ 17.940" },
    { Message: "Fast Layer Stop @ 18.398" },
    { Message: "Fast Layer Stop @ 18.398" },

    // Fast Layer Cycle 3
    { Message: "Lump at length= @ 476.566" },
    { Message: "Fast Layer Start @ 476.567" },
    { Message: "Fast Layer Start @ 476.568" },
    { Message: "Lump at length= @ 476.577" },
    { Message: "Fast Layer Stop @ 476.977" },
    { Message: "Fast Layer Stop @ 476.978" },

    // Fast Layer Cycle 4
    { Message: "Lump at length= @ 692.563" },
    { Message: "Fast Layer Start @ 692.564" },
    { Message: "Fast Layer Start @ 692.564" },
    { Message: "Bare fibre diameter High @ 692.569 Diameter = 128.161" },
    { Message: "Lump at length= @ 692.574" },
    { Message: "Bare fibre diameter Low. Length= @ 692.656 Diameter = 122.947" },
    { Message: "Fast Layer Stop @ 693.143" },
    { Message: "Fast Layer Stop @ 693.144" },

    // Fibre Breaks
    { Message: "TowerFibre Break @ 834.831" },
    { Message: "TowerFibre Break @ 0.116" },

    // More Noise
    { Message: "Message not defined for language English (United Kingdom), en" }
  ];


  useEffect(() => {
    dispatch(getTowerForAllocation())
  }, [dispatch])

  const handleGetDrawFlaws = async (values, setFieldValue) => {
    try {
      const res = await dispatch(
        getTowerEvent({
          tower_id: values.tower_id,
          start_date: values.start_date,
          start_time: values.start_time,
          end_date: values.end_date,
          end_time: values.end_time,
        })
      );

      const events = res.payload?.data || [];



      const mappedFlaws = drawFlawAutomation(events);

      setFieldValue("draw_flaws", mappedFlaws);

    } catch (err) {
      console.log("Error fetching flaws:", err);
    }
  };



  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik initialValues={initialValues} onSubmit={async (values, { resetForm }) => {

          console.log('Submit:', values)
          try {
            const response = await dispatch(createDrawEntry(values));

            if (response.payload?.success) {
              showSuccess("Saved Successfully")
              resetForm()
            } else {
              showError(response?.payload?.message || "Save Failed")
            }
          } catch (error) {
            console.error("Submit Error", error);
            showError(error?.message || "Something went wrong")
          }
        }}>
          {({ values, resetForm, setFieldValue }) => (
            <Form className="flex flex-col flex-1 overflow-hidden">

              {/* ── Top action bar ── */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Spool Entry</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  <SubmitButton compact type="submit">Submit</SubmitButton>
                  <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                </div>
              </div>

              {/* ── 2-column body — no scroll ── */}
              <div className="flex gap-2 flex-1 min-h-0 px-2 py-2 overflow-hidden">

                {/* ══ LEFT COLUMN ══ */}
                <div className="flex flex-col gap-2 flex-1 min-w-0 overflow-hidden">

                  {/* Initial Parameters */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-shrink-0">
                    <SL title="Initial Parameters" />
                    <div className="grid grid-cols-8 gap-x-2 gap-y-1">
                      <FormikSelect compact label="Tower No" name="tower_id"
                        options={[
                          ...(Array.isArray(towerForAllocationData)
                            ? towerForAllocationData.map((t) => ({
                              label: `Tower ${t.tower_no}`,
                              value: t.tower_id,
                            }))
                            : [])
                        ]}

                        onChange={async (e) => {
                          const towerId = e.target.value;

                          // fetch allocated preform for this tower
                          const res = await dispatch(getPreformByTower(towerId));
                          const data = res.payload?.data[0];

                          if (data) {
                            setFieldValue("preform_id", data.preform_id);
                            setFieldValue("preform_weight", data.preform_weight);

                          }
                        }} />
                      <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                      <FormikInput compact label="Preform Wt(KG)" name="preform_weight" type="number" />
                      <FormikInput compact label="Preform Type" name="preform_type" readOnly />
                      <FormikInput compact label="Product Type" name="product_type" readOnly />
                      <FormikInput compact label="Start Date" name="start_date" type="date" />
                      <FormikInput compact label="Start Time" name="start_time" type="time" />

                      <FormikInput compact label="End Date" name="end_date" type="date" />
                      <FormikInput compact label="End Time" name="end_time" type="time" />
                      <FormikInput compact label="Drawn Wt(KG)" name="drawn_weight" type="number" />
                      <FormikInput compact label="Drawn Len(KM)" name="drawn_length" type="number" />
                      <FormikInput compact label="Balance Weight" name="balance_weight" type="number" />
                      <FormikSelect compact label="Shift" name="shift_id" options={shiftOptions} />

                      <FormikInput compact label="Spool ID" name="spool_id" type='text' />

                    </div>
                  </div>

                  {/* Draw Parameters */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-shrink-0">
                    <SL title="Draw Parameters" />
                    <div className="grid grid-cols-8 gap-x-2 gap-y-1">
                      <FormikInput compact label="Draw Line Speed" name="drawn_line_speed" type="number" />
                      <FormikInput compact label="Draw Tension" name="draw_tension" type="number"/>
                      <FormikInput compact label="Furnace Power" name="furnace_power" type="number" />
                      <FormikInput compact label="Furnace Argon" name="furnace_argon" type="number" />
                      <FormikInput compact label="Furnace HE" name="furnace_he" type="number" />

                      <FormikInput compact label="Tube HE" name="tube_he" type="number" />
                      <FormikInput compact label="CO2 Flow" name="co2_flow" type="number" />
                      <FormikInput compact label="N2 Flow" name="n2_flow" type="number" />
                      <FormikInput compact label="UV Air" name="uv_air" type="number" />
                      <FormikSelect compact label="Winding Observation" name="winding_observation_id" options={drawWindingObsOptions} />
                      <FormikSelect compact label="Scr Observation" name="scr_observation" options={['Select', 'Yes', 'No']} />

                      <FormikInput compact label="Top End Scrap" name="top_end_scrap" type="number"/>
                      <FormikInput compact label="Bottom End Scrap" name="bottom_end_scrap" type='number' />

                      <FormikSelect compact label="Die Clean" name="die_clean" options={['Select', 'Yes', 'No']} />
                      <FormikSelect compact label="Spool Status" name="spool_status" options={['Select', 'Ok', 'Not Ok']} />
                      {values.spool_status == "Not Ok" && (
                        <FormikSelect
                          compact
                          label="Reason"
                          name="spool_not_ok_reason"
                          options={["Select", "Scrap", "Hold", "Rework"]}
                        />
                      )}
                      <FormikSelect
                        compact
                        label="Indication Fiber Cut"
                        name="indication_fiber_cut"
                        options={['Select', 'cut', 'sample', 'break', 'trial']}
                      />

                      {/* Conditional Reason Dropdown */}

                      <FormikSelect
                        compact
                        label="Fiber Cut Reason"
                        name="indication_reason_id"
                        options={drawFiberCutReasonOptions}
                      />

                      <div className="col-span-3">
                        <FormikTextarea compact label="Remarks" name="remark" rows={1} placeholder="" />
                      </div>

                    </div>
                  </div>

                  {/* Consumption Details */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-1 min-h-0">
                    <SL title="Consumption Details" />
                    {/* Tab bar */}
                    <div className="flex gap-1 mb-1.5">
                      {CONSUMPTION_TABS.map(tab => (
                        <button key={tab} type="button" onClick={() => setActiveConsTab(tab)}
                          className={`px-2.5 py-0.5 text-[9px] font-bold rounded transition-all ${activeConsTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}>
                          {tab}
                        </button>
                      ))}
                    </div>
                    {activeConsTab === 'Coating' && (
                      <div className="grid grid-cols-5 gap-x-2 gap-y-1">
                        <FormikSelect compact label="Primary Coating" name="primary_coating" options={[
                          { label: "P-COAT-V1", value: "P-COAT-V1" },
                          { label: "P-COAT-V2", value: "P-COAT-V2" }
                        ]} />
                        <FormikSelect compact label="Secondary Coating" name="secondary_coating" options={[
                          { label: "P-COAT-V1", value: "P-COAT-V1" },
                          { label: "P-COAT-V2", value: "P-COAT-V2" }
                        ]} />
                        <FormikSelect compact label="Coating Type" name="coating_type" options={['S-Batch-01', 'S-Batch-02']} />
                        <FormikInput compact label="Primary Pressure" name="primary_pressure" type="number" />
                        <FormikInput compact label="Secondary Pressure" name="secondary_pressure" type="number" />
                        <FormikSelect compact label="Primary Batch" name="primary_batch" options={[
                          { label: "P-BATCH-V1", value: "P-BATCH-V1" },
                          { label: "P-BATCH-V2", value: "P-BATCH-V2" }
                        ]} />
                        <FormikSelect compact label="Secondary Batch" name="secondary_batch" options={[
                          { label: "P-BATCH-V1", value: "P-BATCH-V1" },
                          { label: "P-BATCH-V2", value: "P-BATCH-V2" }
                        ]} />
                        <FormikInput compact label="Process Type" name="process_type" type="text" />
                      </div>
                    )}
                    {activeConsTab !== 'Coating' && (
                      <p className="text-[9px] text-slate-400 text-center py-3">{activeConsTab} fields — coming soon</p>
                    )}
                  </div>

                </div>
                {/* ══ end left column ══ */}

                {/* ══ RIGHT COLUMN ══ */}
                <div className="flex flex-col gap-2 w-72 flex-shrink-0 overflow-hidden">

                  {/* Operator Details */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-shrink-0">
                    <SL title="Operator Details" />
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <FormikSelect compact label="Shift Incharge." name="shift_incharge" options={drawUsersOption} />
                      <FormikSelect compact label="Furnace Oprerator." name="furnace_oprerator" options={drawUsersOption} />
                      <FormikSelect compact label="Die Oprerator" name="die_oprerator" options={drawUsersOption} />
                      <FormikSelect compact label="Ground Oprerator" name="ground_oprerator" options={drawUsersOption} />
                    </div>
                  </div>

                  {/* Draw Flaws Details */}
                  <FieldArray name="draw_flaws">
                    {({ push, remove, form }) => (
                      <div className="border border-slate-200 rounded bg-white flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 border-b border-slate-200 flex-shrink-0">
                          <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">Draw Flaws Details</span>
                          <div className="flex gap-1">
                            <button type="button"
                              onClick={() => handleGetDrawFlaws(values, setFieldValue)}
                              className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-bold rounded hover:bg-blue-700 transition-all">
                              Get Draw Flaws
                            </button>
                            <button type="button"
                              onClick={() => push({ flaw_desc: '', start_length: '', end_length: '', defect_length: '', actual_cutting: '' })}
                              className="flex items-center gap-0.5 px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-bold rounded hover:bg-emerald-700 transition-all">
                              <Plus size={9} />Add Rows
                            </button>
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 px-2 py-1">
                          {form.values.draw_flaws.length === 0 ? (
                            <p className="text-[9px] text-slate-400 text-center py-4">Click "Add Rows" to add entries</p>
                          ) : (
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="border-b border-slate-200">
                                  {['Flaw', 'P1', 'P2', 'Def Len', 'Act Cut', ''].map(h => (
                                    <th key={h} className="px-0.5 py-1 text-[8px] font-bold text-slate-500 uppercase">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {form.values.draw_flaws.map((_, idx) => (
                                  <tr key={idx}>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.flaw_desc`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.start_length`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.end_length`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.defect_length`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.actual_cutting`} /></td>
                                    <td className="px-0.5 py-0.5 text-center">
                                      <button type="button" onClick={() => remove(idx)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 size={10} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </FieldArray>

                </div>
                {/* ══ end right column ══ */}

              </div>
              {/* ── end 2-col body ── */}

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DrawSpoolEntry;
