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
import { getCurrentShift } from '../../../utils/shiftHelper';
import { getAllDrawUsers } from '../../Admin_Folder/draw_management/draw_users/service/draw_user.api';
import { getAllDrawWindingObservations } from '../../Admin_Folder/draw_management/winding_observation/service/winding_observation.api';
import { getAllDrawFiberCutReason, getFiberCutReasonsByIndication } from '../../Admin_Folder/draw_management/fiber_cut_reason/service/draw_fiber_cut_reason.api';
import { getAllFiberCutIndications } from '../../Admin_Folder/draw_management/fiber_cut_indication/service/fiber_cut_indication.api';
import { showSuccess, showError } from '../../../utils/toastService';
import { useFormikContext } from 'formik';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

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

const today = new Date().toISOString().split('T')[0];

/* ── Configurable threshold for preform end (KG) ── */
const PRE_END_THRESHOLD = 4;

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
  tower_no: Yup.string().required('Tower No is required'),
  preform_id: Yup.string().required('Preform ID is required'),
  spool_id: Yup.string().required('Spool ID is required').length(10, 'Spool ID must be exactly 10 characters'),
  process_type: Yup.string().required('Process Type Required'),
  start_date: Yup.string().required('Start Date is required'),
  start_time: Yup.string().required('Start Time is required'),
  end_date: Yup.string().required('End Date is required'),
  end_time: Yup.string().required('End Time is required'),
  drawn_weight: Yup.number().typeError('Drawn Weight must be a number').required('Drawn Weight is required').min(0, 'Cannot be negative'),
  drawn_length: Yup.number().typeError('Drawn Length must be a number').required('Drawn Length is required').min(0, 'Cannot be negative'),
  shift: Yup.string().required('Shift is required'),
  drawn_line_speed: Yup.string().required('Draw Line Speed is required'),
  draw_tension: Yup.string().required('Draw Tension is required'),
  furnace_power: Yup.string().required('Furnace Power is required'),
  furnace_argon: Yup.string().required('Furnace Argon is required'),
  furnace_he: Yup.string().required('Furnace HE is required'),
  tube_he: Yup.string().required('Tube HE is required'),
  co2_flow: Yup.string().required('CO2 Flow is required'),
  n2_flow: Yup.string().required('N2 Flow is required'),
  uv_air: Yup.string().required('UV Air is required'),
  winding_observation: Yup.string().required('Winding Observation is required'),
  scr_observation: Yup.string().required('Scr Observation is required'),
  top_end_scrap: Yup.string().required('Top End Scrap is required'),
  bottom_end_scrap: Yup.string().required('Bottom End Scrap is required'),
  die_clean: Yup.string().required('Die Clean is required'),
  spool_status: Yup.string().required('Spool Status is required'),
  indication_fiber_cut: Yup.string().required('Indication Fiber Cut is required'),
  indication_reason: Yup.string().when('indication_fiber_cut', {
    is: (val) => !!val,
    then: (s) => s.notRequired(),
    otherwise: (s) => s.notRequired(),
  }),
  remark: Yup.string().required('Remarks is required'),
  primary_coating: Yup.string().required('Primary Coating is required'),
  secondary_coating: Yup.string().required('Secondary Coating is required'),
  coating_type: Yup.string().required('Coating Type is required'),
  primary_pressure: Yup.string().required('Primary Pressure is required'),
  secondary_pressure: Yup.string().required('Secondary Pressure is required'),
  primary_batch: Yup.string().required('Primary Batch is required'),
  secondary_batch: Yup.string().required('Secondary Batch is required'),
  shift_incharge: Yup.string().required('Shift Incharge is required'),
  furnace_operator: Yup.string().required('Furnace Operator is required'),
  die_operator: Yup.string().required('Die Operator is required'),
  ground_operator: Yup.string().required('Ground Operator is required'),
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
  const [fiberCutIndications, setFiberCutIndications] = useState([]);
  const [showPreformEndPopup, setShowPreformEndPopup] = useState(false);
  const [preformEndScenario, setPreformEndScenario] = useState(null); // 'balance' | 'fiber_cut' | 'preform_remove'
  const [pendingSubmitValues, setPendingSubmitValues] = useState(null);
  const [pendingResetForm, setPendingResetForm] = useState(null);
  const [processTypeOptions, setProcessTypeOptions] = useState([]);
  const formikRef = React.useRef(null);
  const { towerForAllocationData, taLoading, taError } = useSelector((state) => state.towersForAllocation)
  const { preformByTowerData, pbtLoading, pbtError } = useSelector((state) => state.preformByTower)

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await getAllShifts();
        setShifts(data.data);
        const detected = getCurrentShift(data.data);
        if (detected && formikRef.current) formikRef.current.setFieldValue('shift', detected);
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
    const fetchFiberCutIndications = async () => {
      try {
        const data = await getAllFiberCutIndications();
        setFiberCutIndications(data.data || []);
      } catch (error) {
        console.error("Error Fetching Fiber Cut Indications:", error);
      }
    };
    fetchFiberCutIndications();
  }, [])

  /* ── Fetch process types when preform_type changes (set after tower selection) ── */
  const fetchProcessTypesByPreformType = async (preformType) => {
    if (!preformType) {
      setProcessTypeOptions([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/admin/process-types/by-preform/${preformType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.data || [];
      setProcessTypeOptions(data.map(pt => ({
        label: String(pt.process_type),
        value: pt.process_type,
      })));
    } catch (e) {
      console.error("Error fetching process types:", e);
      setProcessTypeOptions([]);
    }
  };




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
  }));

  const fiberCutIndicationOptions = fiberCutIndications.map((ind) => ({
    label: ind.indication_name,
    value: String(ind.indication_fiber_cut_id),
  }));

  /* ── Fetch reasons dynamically when indication changes ── */
  const handleIndicationChange = async (indicationId, setFieldValue) => {
    setFieldValue('indication_fiber_cut', indicationId);
    setFieldValue('indication_reason', '');
    setDrawFiberCutReasons([]);
    if (!indicationId) return;
    try {
      const data = await getFiberCutReasonsByIndication(indicationId);
      setDrawFiberCutReasons(data.data || []);
    } catch (error) {
      console.error("Error fetching reasons for indication:", error);
    }
  };

  const rows = [
    { Message: "Message not defined for language English (United Kingdom), en" },

    { Message: "Good fibre start @ 2.00" },
    { Message: "Bare fibre diameter High @ 2.315 Diameter = 125.612" },
    { Message: "Coated fibre diameter Low @ 4.981" },

    // Fast Layer 1
    { Message: "Fast Layer Start @ 12.457" },
    { Message: "Fast Layer Start @ 12.458" },
    { Message: "Coated fibre diameter High @ 12.463" },
    { Message: "Lump at length= @ 12.512" },
    { Message: "Bare fibre diameter Low @ 12.640 Diameter = 123.948" },
    { Message: "Fast Layer Stop @ 13.106" },
    { Message: "Fast Layer Stop @ 13.107" },

    { Message: "Coated fibre diameter High @ 55.341" },

    // Fast Layer 2
    { Message: "Fast Layer Start @ 88.750" },
    { Message: "Fast Layer Start @ 88.751" },
    { Message: "Coated fibre diameter Low @ 88.760" },
    { Message: "Lump at length= @ 88.799" },
    { Message: "Fast Layer Stop @ 89.260" },
    { Message: "Fast Layer Stop @ 89.261" },

    { Message: "Bare fibre diameter High @ 125.620 Diameter = 125.831" },
    { Message: "Lump at length= @ 181.215" },

    // Fast Layer 3
    { Message: "Fast Layer Start @ 205.812" },
    { Message: "Fast Layer Start @ 205.813" },
    { Message: "Coated fibre diameter High @ 205.822" },
    { Message: "Coated fibre diameter High @ 205.860" },
    { Message: "Fast Layer Stop @ 206.455" },
    { Message: "Fast Layer Stop @ 206.456" },

    { Message: "Bare fibre diameter Low @ 260.115 Diameter = 124.015" },

    // Fast Layer 4
    { Message: "Fast Layer Start @ 320.501" },
    { Message: "Fast Layer Start @ 320.502" },
    { Message: "Lump at length= @ 320.520" },
    { Message: "Bare fibre diameter High @ 320.571 Diameter = 126.002" },
    { Message: "Fast Layer Stop @ 321.190" },
    { Message: "Fast Layer Stop @ 321.191" },
    

   { Message: "Coated fibre diameter High @ 412.880" },
    { Message: "Bare fibre diameter Low @ 455.224 Diameter = 123.741" },
  
    // Fast Layer 5
    { Message: "Fast Layer Start @ 520.110" },
    { Message: "Fast Layer Start @ 520.111" },
    { Message: "Coated fibre diameter Low @ 520.140" },
    { Message: "Lump at length= @ 520.165" },
    { Message: "Fast Layer Stop @ 520.790" },
    { Message: "Fast Layer Stop @ 520.791" },
  
    { Message: "Bare fibre diameter High @ 601.442 Diameter = 125.910" },
    { Message: "Coated fibre diameter Low @ 622.181" },
  
    // Fibre Break around 640 km
    { Message: "TowerFibre Break @ 650.37" },

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
          tower_id: values.tower_no,
          start_date: values.start_date,
          start_time: values.start_time,
          end_date: values.end_date,
          end_time: values.end_time,
        })
      );

      const events = res.payload?.data || [];
      console.log("WHat is the events:", events)

      const mappedFlaws = drawFlawAutomation(rows);
      console.log("Mapped:", mappedFlaws)

      setFieldValue("draw_flaws", mappedFlaws?.results);
      setFieldValue("drawn_length", parseFloat((mappedFlaws?.totalKm || 0).toFixed(2)))
      setFieldValue("bottom_end_scrap", parseFloat((mappedFlaws?.goodFiberKm?.[0] || 0).toFixed(2)))
      setFieldValue("drawn_weight", parseFloat(((mappedFlaws?.totalKm || 0) / 35.714).toFixed(2)))
      const flawBalance = values.preform_weight - ((mappedFlaws?.totalKm || 0) / 35.714);
      setFieldValue("balance_weight", parseFloat((flawBalance < 0 ? 0 : flawBalance).toFixed(2)))
      

    } catch (err) {
      console.log("Error fetching flaws:", err);
    }
  };



  const DrawWeightWatcher = () => {
    const { values, setFieldValue } = useFormikContext();

    useEffect(() => {
      const drawnWeight = parseFloat((Number(values.drawn_length || 0) / 35.714).toFixed(2));

      setFieldValue("drawn_weight", drawnWeight);
      const calcBalance = parseFloat((Number(values.preform_weight || 0) - drawnWeight).toFixed(2));
      setFieldValue("balance_weight", calcBalance < 0 ? 0 : calcBalance);
    }, [values.drawn_length, values.preform_weight]);

    return null;
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        <Formik innerRef={formikRef} initialValues={initialValues}
          validateOnChange={false} validateOnBlur={true}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm }) => {

            

            // Calculate pt_flaws from current draw_flaws at submit time (not from initial fetch)
            const ptFlaws = reverseFlawPositions(values.drawn_length, values.draw_flaws);
            const submitValues = { ...values, pt_flaws: ptFlaws };

            // Resolve indication name from ID for backend storage
            const selectedIndication = fiberCutIndications.find(
              ind => String(ind.indication_fiber_cut_id) === String(values.indication_fiber_cut)
            );
            if (selectedIndication) {
              submitValues.indication_fiber_cut = selectedIndication.indication_name;
              submitValues.indication_fiber_cut_id = selectedIndication.indication_fiber_cut_id;
            }

            // Scenario 3: Fiber Cut with reason = "Preform Remove" — deallocation only, NOT preform end
            if (values.indication_fiber_cut && values.indication_reason) {
              const reason = values.indication_reason.toLowerCase();
              if (reason.includes('preform') && reason.includes('remove')) {
                if (!values.tower_no) {
                  showError("Please select a tower before performing Preform Remove.");
                  return;
                }
                setPendingSubmitValues(submitValues);
                setPendingResetForm(() => resetForm);
                setPreformEndScenario('preform_remove');
                setShowPreformEndPopup(true);
                return;
              }
            }

            // Scenario 2: Fiber Cut with reason containing "preform end" — mark preform as completed
            if (values.indication_fiber_cut && values.indication_reason) {
              const reason = values.indication_reason.toLowerCase();
              if (reason.includes('preform') && reason.includes('end')) {
                submitValues.balance_weight = 0;
                setPendingSubmitValues(submitValues);
                setPendingResetForm(() => resetForm);
                setPreformEndScenario('fiber_cut');
                setShowPreformEndPopup(true);
                return;
              }
            }

            // Scenario 1: Balance weight exhausted — show confirmation
            const actualBalance = Number(values.preform_weight || 0) - Number(submitValues.drawn_weight || 0);
            if (actualBalance <= 0) {
              submitValues.balance_weight = 0;
              setPendingSubmitValues(submitValues);
              setPendingResetForm(() => resetForm);
              setPreformEndScenario('balance');
              setShowPreformEndPopup(true);
              return;
            }

            // Normal save — no preform end
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
              <DrawWeightWatcher />
              {/* ── Top action bar ── */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Draw Spool Entry</span>
                <div className="flex gap-1.5">
                  <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                  {/* Show Preform End button when balance_weight is low */}
                  {Number(values.preform_weight) > 0 && Number(values.balance_weight) <= PRE_END_THRESHOLD && values.balance_weight !== '' && (
                    <button type="button"
                      onClick={() => {
                        if (!values.tower_no) {
                          showError("Please select a tower before marking the preform as completed.");
                          return;
                        }
                        // Bypass validation — only send tower free payload
                        const preformEndPayload = {
                          tower_no: values.tower_no,
                          preform_id: values.preform_id,
                          balance_weight: 0,
                          handle_active: true,
                          preform_end: true,
                          is_last: true,
                          preform_remove: false,
                        };
                        setPendingSubmitValues(preformEndPayload);
                        setPendingResetForm(null);
                        setPreformEndScenario('balance');
                        setShowPreformEndPopup(true);
                      }}
                      className="px-3 py-1 bg-amber-600 text-white text-[9px] font-bold rounded hover:bg-amber-700 transition-all">
                      Mark Preform End
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
                            setProcessTypeOptions([]);
                            return;
                          }

                          // fetch allocated preform for this tower
                          const res = await dispatch(getPreformByTower(towerId));
                          const data = res.payload?.data[0];
                          

                          if (data) {
                            setFieldValue("preform_id", data.preform_id || '');
                            setFieldValue("preform_weight", data.balance_qty || '');
                            setFieldValue("preform_type", data.preform_type || '');
                            setFieldValue("process_type", ''); // user selects from dropdown
                            setFieldValue("product_type", data.product_type || '');
                            setFieldValue("drawn_line_speed", 2700 || '');
                            setFieldValue("draw_tension", 150 || '');
                            setFieldValue("furnace_power", 50  || '');
                            setFieldValue("furnace_argon", 5 || '');
                            setFieldValue("furnace_he", 5 || '');
                            setFieldValue("tube_he", 4 || '');
                            setFieldValue("co2_flow", 5 || '');
                            setFieldValue("n2_flow", 5 || '');
                            setFieldValue("uv_air", 10 || '');

                            // Load process type options for this preform type
                            fetchProcessTypesByPreformType(data.preform_type);

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
                            setProcessTypeOptions([]);
                          }
                        }} />
                      <FormikInput compact label="Preform ID" name="preform_id" readOnly />
                      <FormikInput compact label="Preform Wt(KG)" name="preform_weight" type="number" step="0.01" />
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
                      <FormikInput compact label="Drawn Wt(KG)" name="drawn_weight" type="number" step="0.01"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) < 0) { showError("Drawn Weight cannot be negative"); setFieldValue("drawn_weight", ''); }
                          else if (val && val.includes('.') && val.split('.')[1]?.length > 2) { return; }
                          else { setFieldValue("drawn_weight", val); }
                        }} />
                      <FormikInput compact label="Drawn Len(KM)" name="drawn_length" type="number" step="0.01"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) < 0) { showError("Drawn Length cannot be negative"); setFieldValue("drawn_length", ''); }
                          else if (val && val.includes('.') && val.split('.')[1]?.length > 2) { return; }
                          else { setFieldValue("drawn_length", val); }
                        }} />
                      <FormikInput compact label="Balance Weight" name="balance_weight" type="number" step="0.01" readOnly />
                      <FormikSelect compact label="Shift" name="shift" options={shiftOptions} />

                      <FormikInput compact label="Spool ID" name="spool_id" type='text' maxLength={10} />
                      <FormikInput compact label="Spool FID" name="spool_fid" readOnly />
                      <FormikSelect compact label="Process Type" name="process_type" options={processTypeOptions} />

                    </div>
                  </div>

                  {/* Draw Parameters */}
                  <div className="border border-slate-200 rounded bg-white px-2 py-1.5 flex-shrink-0">
                    <SL title="Draw Parameters" />
                    <div className="grid grid-cols-8 gap-x-2 gap-y-1">
                      <FormikInput compact label="Draw Line Speed" name="drawn_line_speed" type="number" />
                      <FormikInput compact label="Draw Tension" name="draw_tension" type="number" />
                      <FormikInput compact label="Furnace Power" name="furnace_power" type="number" />
                      <FormikInput compact label="Furnace Argon" name="furnace_argon" type="number" />
                      <FormikInput compact label="Furnace HE" name="furnace_he" type="number" />

                      <FormikInput compact label="Tube HE" name="tube_he" type="number" />
                      <FormikInput compact label="CO2 Flow" name="co2_flow" type="number" />
                      <FormikInput compact label="N2 Flow" name="n2_flow" type="number" />
                      <FormikInput compact label="UV Air" name="uv_air" type="number" />
                      <FormikSelect compact label="Winding Observation" name="winding_observation" options={drawWindingObsOptions} />
                      <FormikSelect compact label="Scr Observation" name="scr_observation" options={['Yes', 'No']} />

                      <FormikInput compact label="Top End Scrap" name="top_end_scrap" type="number" step="0.01" />
                      <FormikInput compact label="Bottom End Scrap" name="bottom_end_scrap" type='number' step="0.01" />

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
                        options={fiberCutIndicationOptions}
                        onChange={(e) => handleIndicationChange(e.target.value, setFieldValue)}
                      />

                      {/* Fiber Cut Reason — shown when selected indication has active reasons */}
                      {drawFiberCutReasons.length > 0 && values.indication_fiber_cut && (
                        <FormikSelect
                          compact
                          label="Fiber Cut Reason *"
                          name="indication_reason"
                          options={drawFiberCutReasonOptions}
                        />
                      )}

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
                        <FormikSelect compact label="Coating Type" name="coating_type" options={['Single', 'Double']} />
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

        {/* ── Preform End / Tower Free Confirmation Popup ── */}
        {showPreformEndPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">
                {preformEndScenario === 'preform_remove' ? 'Preform Remove Confirmation' : 'Preform End Confirmation'}
              </h3>

              {preformEndScenario === 'balance' && (
                <p className="text-xs text-slate-500 mb-2">
                  The remaining preform weight is below the configured threshold (<strong>{PRE_END_THRESHOLD} KG</strong>).<br />
                  Do you want to mark this preform as completed and free the tower?
                </p>
              )}
              {preformEndScenario === 'fiber_cut' && (
                <p className="text-xs text-slate-500 mb-2">
                  The selected cut reason is <strong className="text-rose-600">"Preform End"</strong>.<br />
                  Do you want to mark this preform as completed and free the tower?
                </p>
              )}
              {preformEndScenario === 'preform_remove' && (
                <p className="text-xs text-slate-500 mb-2">
                  You have selected <strong className="text-rose-600">Preform Remove</strong>.<br />
                  This will <strong>deallocate</strong> the preform and <strong>free the tower</strong>.<br />
                  This is <strong>NOT</strong> a preform end — the preform can be re-allocated later.
                </p>
              )}

              <p className="text-xs text-slate-500 mb-1">
                Tower: <strong className="text-blue-700">DT {pendingSubmitValues?.tower_no}</strong>
              </p>
              {preformEndScenario !== 'preform_remove' && (
                <p className="text-xs text-slate-400 mb-4">
                  Balance will be set to <strong>0</strong>, entry marked as last, tower freed.
                </p>
              )}
              {preformEndScenario === 'preform_remove' && (
                <p className="text-xs text-slate-400 mb-4">
                  Tower will be freed. Preform deallocated (can be re-allocated). No preform end marked.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPreformEndPopup(false); setPendingSubmitValues(null); setPendingResetForm(null); setPreformEndScenario(null); }}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowPreformEndPopup(false);

                    // Validate tower selected
                    if (!pendingSubmitValues?.tower_no) {
                      showError("Please select a tower before performing this action.");
                      setPendingSubmitValues(null);
                      setPendingResetForm(null);
                      setPreformEndScenario(null);
                      return;
                    }

                    try {
                      const payload = {
                        ...pendingSubmitValues,
                        handle_active: true,
                        preform_end: preformEndScenario !== 'preform_remove',
                        preform_remove: preformEndScenario === 'preform_remove',
                        is_last: preformEndScenario !== 'preform_remove',
                      };
                      if (preformEndScenario !== 'preform_remove') {
                        payload.balance_weight = 0;
                      }

                      const response = await dispatch(createDrawEntry(payload));

                      if (response.payload?.success) {
                        showSuccess(preformEndScenario === 'preform_remove'
                          ? "Preform Removed & Tower Freed"
                          : "Saved & Tower Freed — Preform End");
                        if (pendingResetForm) pendingResetForm();
                        else if (formikRef.current) formikRef.current.resetForm();
                      } else {
                        showError(response?.payload?.message || "Save Failed");
                      }
                    } catch (error) {
                      console.error("Submit Error", error);
                      showError(error?.message || "Something went wrong");
                    }
                    setPendingSubmitValues(null);
                    setPendingResetForm(null);
                    setPreformEndScenario(null);
                  }}
                  className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-all"
                >
                  Yes
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
