import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Plus, Trash2 } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { FormikSelect, FormikInput, FormikTextarea } from '../../../components/common_fields';
import { useDispatch, useSelector } from 'react-redux';
import { createDrawEntry, getTowerEvent } from '../services/draw_spool_entry.api';
import { getTowerForAllocation } from '../../draw_tower/service/draw_tower.api';
import { getPreformByTower } from '../services/draw_spool_entry.api';
import { drawFlawAutomation, exportFlawReport, reverseFlawPositions } from './draw_flaw_automate';
import { getAllShifts } from '../../Admin_Folder/shift/service/shift.api';
import { getAllDrawUsers } from '../../Admin_Folder/draw_management/draw_users/service/draw_user.api';
import { getAllDrawWindingObservations } from '../../Admin_Folder/draw_management/winding_observation/service/winding_observation.api';
import { getAllDrawFiberCutReason } from '../../Admin_Folder/draw_management/fiber_cut_reason/service/draw_fiber_cut_reason.api';
import { showSuccess, showError } from '../../../utils/toastService';
import { useFormikContext } from 'formik';

/* ── Compact section label ── */
const SL = ({ title, color = 'text-blue-700' }) => (
  <p className={`text-[9px] font-bold uppercase tracking-wider ${color} border-b border-slate-100 pb-0.5 mb-1`}>{title}</p>
);

/* ── Error display — only shows after form submit attempt ── */
const FieldError = ({ name, errors, submitCount }) => {
  if (submitCount === 0 || !errors[name]) return null;
  return <span className="text-[8px] text-rose-500 ml-0.5 block mt-0.5">{errors[name]}</span>;
};

/* ── Submit error toast — call once in onSubmit when validation fails ── */
const showFirstValidationError = (errors) => {
  const firstErr = Object.values(errors).find(e => typeof e === 'string');
  if (firstErr) showError(firstErr);
};

/* ── Fires toast only once per submit attempt with errors ── */
const ValidationToast = ({ errors, submitCount }) => {
  const [lastCount, setLastCount] = useState(0);
  useEffect(() => {
    if (submitCount > lastCount && Object.keys(errors).length > 0) {
      const firstErr = Object.values(errors).find(e => typeof e === 'string');
      if (firstErr) showError(firstErr);
      setLastCount(submitCount);
    }
  }, [submitCount, errors, lastCount]);
  return null;
};

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
  tower_no: '', preform_id: '',
  spool_id: '', spool_fid: '', start_date: '', end_date: '', start_time: '',
  end_time: '', drawn_weight: '', drawn_length: '', balance_weight: '',
  shift: '', drawn_line_speed: '', draw_tension: '', furnace_power: '',
  furnace_argon: '', furnace_he: '', tube_he: '', co2_flow: '', n2_flow: '',
  uv_air: '', winding_observation: '', scr_observation: '', top_end_scrap: '',
  bottom_end_scrap: '', die_clean: '', spool_status: '', indication_fiber_cut: '',
  indication_reason: "", remark: '', primary_coating: '', secondary_coating: '', coating_type: '',
  primary_pressure: '', secondary_pressure: '', primary_batch: '', secondary_batch: '',
  process_type: '', preform_type: '', product_type: '', logged_in_user: '', shift_incharge: '', furnace_operator: '',
  die_operator: '', ground_operator: '',
  draw_flaws: [], pt_flaws: []
};

const CONSUMPTION_TABS = ['Coating'];

/* ── Yup Validation Schema ── */
const validationSchema = Yup.object({
  tower_no:              Yup.string().required('Tower No is required'),
  preform_id:            Yup.string().required('Preform ID is required'),
  spool_id:              Yup.string().required('Spool ID is required'),
  start_date:            Yup.string().required('Start Date is required'),
  start_time:            Yup.string().required('Start Time is required'),
  end_date:              Yup.string().required('End Date is required'),
  end_time:              Yup.string().required('End Time is required'),
  drawn_weight:          Yup.number().typeError('Drawn Weight must be a number').required('Drawn Weight is required').min(0, 'Cannot be negative'),
  drawn_length:          Yup.number().typeError('Drawn Length must be a number').required('Drawn Length is required').min(0, 'Cannot be negative'),
  shift:                 Yup.string().required('Shift is required'),
  drawn_line_speed:      Yup.string().required('Draw Line Speed is required'),
  draw_tension:          Yup.string().required('Draw Tension is required'),
  furnace_power:         Yup.string().required('Furnace Power is required'),
  furnace_argon:         Yup.string().required('Furnace Argon is required'),
  furnace_he:            Yup.string().required('Furnace HE is required'),
  tube_he:               Yup.string().required('Tube HE is required'),
  co2_flow:              Yup.string().required('CO2 Flow is required'),
  n2_flow:               Yup.string().required('N2 Flow is required'),
  uv_air:                Yup.string().required('UV Air is required'),
  winding_observation:   Yup.string().required('Winding Observation is required'),
  scr_observation:       Yup.string().required('Scr Observation is required'),
  top_end_scrap:         Yup.string().required('Top End Scrap is required'),
  bottom_end_scrap:      Yup.string().required('Bottom End Scrap is required'),
  die_clean:             Yup.string().required('Die Clean is required'),
  spool_status:          Yup.string().required('Spool Status is required'),
  indication_fiber_cut:  Yup.string().required('Indication Fiber Cut is required'),
  indication_reason:     Yup.string().required('Fiber Cut Reason is required'),
  remark:                Yup.string().required('Remarks is required'),
  primary_coating:       Yup.string().required('Primary Coating is required'),
  secondary_coating:     Yup.string().required('Secondary Coating is required'),
  coating_type:          Yup.string().required('Coating Type is required'),
  primary_pressure:      Yup.string().required('Primary Pressure is required'),
  secondary_pressure:    Yup.string().required('Secondary Pressure is required'),
  primary_batch:         Yup.string().required('Primary Batch is required'),
  secondary_batch:       Yup.string().required('Secondary Batch is required'),
  shift_incharge:        Yup.string().required('Shift Incharge is required'),
  furnace_operator:      Yup.string().required('Furnace Operator is required'),
  die_operator:          Yup.string().required('Die Operator is required'),
  ground_operator:       Yup.string().required('Ground Operator is required'),
});
{/*['Coating', 'Furnace Gas', 'Nitrogen Gas', 'Helium Gas', 'CO2 Gas'];*/ }

/* ══════════════════════════════════════════════════════════ */
const DrawSpoolEntry = () => {
  const dispatch = useDispatch();
  const [activeConsTab, setActiveConsTab] = useState('Coating');
  const [shifts, setShifts] = useState([]);
  const [drawUsers, setDrawUsers] = useState([]);
  const [drawWindingObs, setDrawWindingObs] = useState([]);
  const [drawFiberCutReasons, setDrawFiberCutReasons] = useState([]);
  const [showPreformEndPopup, setShowPreformEndPopup] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState(null);
  const [pendingResetForm, setPendingResetForm] = useState(null);
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
    value: users.draw_user_name
  }))

  const shiftOptions = shifts.map((shift) => ({
    label: `${shift.shift_name}`,
    value: shift.shift_name,
  }));

  const drawWindingObsOptions = drawWindingObs.map((obs) => ({
    label: `${obs.w_o_name}`,
    value: obs.w_o_name,
  }));

  const drawFiberCutReasonOptions = drawFiberCutReasons.map((reasons) => ({
    label: `${reasons.dfcr_name}`,
    value: reasons.dfcr_name,
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
    { Message: "TowerFibre Break @ 850.831" },
    { Message: "TowerFibre Break @ 0.116" },

    // More Noise
    { Message: "Message not defined for language English (United Kingdom), en" }
  ];


  useEffect(() => {
    dispatch(getTowerForAllocation())
  }, [dispatch])

  const handleGetDrawFlaws = async (values, setFieldValue) => {
    try {
      console.log("What is the date:", values.start_date, values.start_time, values.end_date, values.end_time)
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

      const mappedFlaws = drawFlawAutomation(rows);

      setFieldValue("draw_flaws", mappedFlaws?.results);
      setFieldValue("drawn_length", mappedFlaws?.totalKm)
      setFieldValue("drawn_weight", mappedFlaws?.totalKm / 37)
      setFieldValue("balance_weight", values.preform_weight - (mappedFlaws?.totalKm / 37) )
      console.log("What is the mapped flaws:", mappedFlaws)

    } catch (err) {
      console.log("Error fetching flaws:", err);
    }
  };

 

const DrawWeightWatcher = () => {
  const { values, setFieldValue } = useFormikContext();

  useEffect(() => {
    const drawnWeight = Number(values.drawn_length || 0) / 37;

    setFieldValue("drawn_weight", drawnWeight);
    setFieldValue(
      "balance_weight",
      Number(values.preform_weight || 0) - drawnWeight
    );
  }, [values.drawn_length, values.preform_weight]);

  return null;
};

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik initialValues={initialValues}
          validateOnChange={false} validateOnBlur={true}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm }) => {

          console.log('Submit:', values)

          // Calculate pt_flaws from current draw_flaws at submit time (not from initial fetch)
          const ptFlaws = reverseFlawPositions(values.drawn_length, values.draw_flaws);
          const submitValues = { ...values, pt_flaws: ptFlaws };

          // If balance_weight is negative, show preform end confirmation popup
          if (Number(submitValues.balance_weight) < 0) {
            setPendingSubmitValues(submitValues);
            setPendingResetForm(() => resetForm);
            setShowPreformEndPopup(true);
            return;
          }

          try {
            const response = await dispatch(createDrawEntry(submitValues));

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
          {({ values, resetForm, setFieldValue, errors, submitCount, validateForm, setTouched, handleSubmit }) => (
            <Form className="flex flex-col flex-1 overflow-hidden" noValidate>
<DrawWeightWatcher/>
              {/* ── Top action bar ── */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Spool Entry</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  {/* Show Preform End button when balance_weight < 4 */}
                  {Number(values.balance_weight) < 4 && values.balance_weight !== '' && (
                    <button type="button"
                      onClick={() => {
                        setPendingSubmitValues(values);
                        setPendingResetForm(() => resetForm);
                        setShowPreformEndPopup(true);
                      }}
                      className="px-3 py-1 bg-amber-600 text-white text-[9px] font-bold rounded hover:bg-amber-700 transition-all">
                      Confirm Preform End
                    </button>
                  )}
                  <SubmitButton compact type="button" onClick={async () => {
                    const errs = await validateForm();
                    if (Object.keys(errs).length > 0) {
                      const touched = Object.keys(initialValues).reduce((acc, k) => ({ ...acc, [k]: true }), {});
                      setTouched(touched);
                      const firstErr = Object.values(errs).find(e => typeof e === 'string');
                      if (firstErr) showError(firstErr);
                      console.log("Validation errors:", errs);
                      return;
                    }
                    handleSubmit();
                  }}>Submit</SubmitButton>
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
                      <FormikSelect compact label="Tower No" name="tower_no"
                        options={[
                          ...(Array.isArray(towerForAllocationData)
                            ? towerForAllocationData.map((t) => ({
                              label: `Tower ${t.tower_no}`,
                              value: t.tower_no,
                            }))
                            : [])
                        ]}

                        onChange={async (e) => {
                          const towerId = e.target.value;

                          // If tower deselected or no value, clear all auto-filled fields
                          if (!towerId || towerId === 'Select') {
                            setFieldValue("preform_id", '');
                            setFieldValue("preform_weight", '');
                            setFieldValue("preform_type", '');
                            setFieldValue("process_type", '');
                            setFieldValue("product_type", '');
                            setFieldValue("spool_fid", '');
                            setFieldValue("draw_flaws", []);
                            setFieldValue("pt_flaws", []);
                            setFieldValue("drawn_length", '');
                            setFieldValue("drawn_weight", '');
                            setFieldValue("balance_weight", '');
                            return;
                          }

                          // fetch allocated preform for this tower
                          const res = await dispatch(getPreformByTower(towerId));
                          const data = res.payload?.data[0];
                          console.log("allocated preform:", data)

                          if (data) {
                            setFieldValue("preform_id", data.preform_id || '');
                            setFieldValue("preform_weight", data.balance_qty || '');
                            setFieldValue("preform_type", data.preform_type || '');
                            setFieldValue("process_type", data.process_type || '');
                            setFieldValue("product_type", data.product_type || '');

                            // Generate spool_fid: strip any existing trailing letter from last_fid, then append new suffix
                            // p_count 0=A, 1=B, 2=C...
                            const pCount = Number(data.p_count) || 0;
                            const lastFid = data.last_fid || '';
                            const suffix = String.fromCharCode(65 + pCount);
                            // Remove trailing uppercase letter if present (e.g. ...043A -> ...043)
                            const baseFid = lastFid.replace(/[A-Z]$/, '');
                            const generatedFid = baseFid ? `${baseFid}${suffix}` : '';
                            setFieldValue("spool_fid", generatedFid);
                          } else {
                            // No data for this tower — clear all and alert
                            showError("This tower has no preform allocated");
                            setFieldValue("preform_id", '');
                            setFieldValue("preform_weight", '');
                            setFieldValue("preform_type", '');
                            setFieldValue("process_type", '');
                            setFieldValue("product_type", '');
                            setFieldValue("spool_fid", '');
                            setFieldValue("draw_flaws", []);
                            setFieldValue("pt_flaws", []);
                            setFieldValue("drawn_length", '');
                            setFieldValue("drawn_weight", '');
                            setFieldValue("balance_weight", '');
                          }
                        }} />
                      <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                      <FormikInput compact label="Preform Wt(KG)" name="preform_weight" type="number" />
                      <FormikInput compact label="Preform Type" name="preform_type" readOnly />
                      <FormikInput compact label="Product Type" name="product_type" readOnly />
                      <FormikInput compact label="Start Date" name="start_date" type="date" />
                      <FormikInput compact label="Start Time" name="start_time" type="time" />

                      <FormikInput compact label="End Date" name="end_date" type="date"
                        onChange={(e) => {
                          const endDate = e.target.value;
                          if (values.start_date && endDate && endDate < values.start_date) {
                            showError("End Date cannot be before Start Date");
                            setFieldValue("end_date", '');
                          } else {
                            setFieldValue("end_date", endDate);
                          }
                        }} />
                      <FormikInput compact label="End Time" name="end_time" type="time"
                        onChange={(e) => {
                          const endTime = e.target.value;
                          // If same date and end time is before start time, show error
                          if (values.start_date && values.end_date && values.start_date === values.end_date
                              && values.start_time && endTime && endTime < values.start_time) {
                            showError("End Time cannot be before Start Time on the same date");
                            setFieldValue("end_time", '');
                          } else {
                            setFieldValue("end_time", endTime);
                          }
                        }} />
                      <FormikInput compact label="Drawn Wt(KG)" name="drawn_weight" type="number"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) < 0) { showError("Drawn Weight cannot be negative"); setFieldValue("drawn_weight", ''); }
                          else { setFieldValue("drawn_weight", val); }
                        }} />
                      <FormikInput compact label="Drawn Len(KM)" name="drawn_length" type="number"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) < 0) { showError("Drawn Length cannot be negative"); setFieldValue("drawn_length", ''); }
                          else { setFieldValue("drawn_length", val); }
                        }} />
                      <FormikInput compact label="Balance Weight" name="balance_weight" type="number" />
                      <FormikSelect compact label="Shift" name="shift" options={shiftOptions} />

                      <FormikInput compact label="Spool ID" name="spool_id" type='text' />
                      <FormikInput compact label="Spool FID" name="spool_fid" readOnly />

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
                      <FormikSelect compact label="Winding Observation" name="winding_observation" options={drawWindingObsOptions} />
                      <FormikSelect compact label="Scr Observation" name="scr_observation" options={['Yes', 'No']} />

                      <FormikInput compact label="Top End Scrap" name="top_end_scrap" type="number"/>
                      <FormikInput compact label="Bottom End Scrap" name="bottom_end_scrap" type='number' />

                      <FormikSelect compact label="Die Clean" name="die_clean" options={['Yes', 'No']} />
                      <FormikSelect compact label="Spool Status" name="spool_status" options={['Ok', 'Not Ok']} />
                      {values.spool_status == "Not Ok" && (
                        <FormikSelect
                          compact
                          label="Reason"
                          name="spool_not_ok_reason"
                          options={["Scrap", "Hold", "Rework"]}
                        />
                      )}
                      <FormikSelect
                        compact
                        label="Indication Fiber Cut"
                        name="indication_fiber_cut"
                        options={['cut', 'sample', 'break', 'trial']}
                      />

                      {/* Conditional Reason Dropdown */}

                      <FormikSelect
                        compact
                        label="Fiber Cut Reason"
                        name="indication_reason"
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
                      <FormikSelect compact label="Shift Incharge" name="shift_incharge" options={drawUsersOption} />
                      <FormikSelect compact label="Furnace Operator" name="furnace_operator" options={drawUsersOption} />
                      <FormikSelect compact label="Die Operator" name="die_operator" options={drawUsersOption} />
                      <FormikSelect compact label="Ground Operator" name="ground_operator" options={drawUsersOption} />
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
                              onClick={() => push({ reason: '', pos1: '', pos2: '', defect_length: '', actual_cutting: '' })}
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
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.reason`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.pos1`} /></td>
                                    <td className="px-0.5 py-0.5"><TCell name={`draw_flaws.${idx}.pos2`} /></td>
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

        {/* ── Preform End Confirmation Popup ── */}
        {showPreformEndPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Preform End — Please Confirm</h3>
              <p className="text-xs text-slate-500 mb-1">
                Balance weight is <strong className="text-rose-600">{Number(pendingSubmitValues?.balance_weight).toFixed(3)} KG</strong> (negative).
              </p>
              <p className="text-xs text-slate-500 mb-4">
                This indicates the preform is exhausted. Confirming will <strong>save this entry</strong> and <strong>free the tower</strong> (mark as active/available).
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPreformEndPopup(false); setPendingSubmitValues(null); setPendingResetForm(null); }}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowPreformEndPopup(false);
                    try {
                      // Submit with handle_active: true to free the tower
                      const payload = { ...pendingSubmitValues, handle_active: true, preform_end: true };
                      const response = await dispatch(createDrawEntry(payload));

                      if (response.payload?.success) {
                        showSuccess("Saved & Tower Freed Successfully");
                        if (pendingResetForm) pendingResetForm();
                      } else {
                        showError(response?.payload?.message || "Save Failed");
                      }
                    } catch (error) {
                      console.error("Submit Error", error);
                      showError(error?.message || "Something went wrong");
                    }
                    setPendingSubmitValues(null);
                    setPendingResetForm(null);
                  }}
                  className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all"
                >
                  Confirm Preform End
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DrawSpoolEntry;
