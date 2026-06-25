import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { Settings, Droplets, Ruler, Search } from 'lucide-react';
import { ModuleCard, FormikInput, FormikTextarea } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import SelectionModal from '../../../components/selectionModal';
import { getPreformForHandleJoin, handleJoin } from '../services/handle_join.api';
import { showSuccess, showError } from '../../../utils/toastService';
import Loader from '../../../components/loader';






/* ── Flame recipe row definitions ── */
const FLAME_ROWS = [
  { key: 'h2Flow1',      label: 'H 2 Flow 1'       },
  { key: 'h2Flow2',      label: 'H 2 Flow 2'       },
  { key: 'h2Flow3',      label: 'H 2 Flow 3'       },
  { key: 'o2Line1Flow1', label: 'O 2 Line 1 Flow 1' },
  { key: 'o2Line1Flow2', label: 'O 2 Line 1 Flow 2' },
  { key: 'o2Line1Flow3', label: 'O 2 Line 1 Flow 3' },
];

/* ── Modal column definitions — match API response keys ── */
const modalColumns = [
  { key: 'preform_id',           label: 'Preform ID'           },
  { key: 'material_description', label: 'Material Description' },
  { key: 'preform_weight',       label: 'Weight (kg)'          },
  { key: 'charge_length',        label: 'Charge Length'        },
];

/* ── Consumption calc ── */
const cons = (flow, time) => {
  const f = parseFloat(flow) || 0;
  const t = parseFloat(time) || 0;
  return ((f * t) / 1000).toFixed(3);
};

/* ── Auto-display field labels ── */
const AUTO_FIELDS = [
  { key: 'preform_weight', label: 'Weight'       },
  { key: 'cut_off',        label: 'Cut Off'      },
  { key: 'mfd',            label: 'MFD'          },
  { key: 'preform_type',   label: 'Preform Type' },
];

/* ══════════════════════════════════════════════════════════ */
const HandleJoining = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  /* ── Redux state ── */
  const { preformForHandleJoinData = [], phjLoading } = useSelector(
    (state) => state.preformForHandleJoin || {}
  );
  const { hjLoading } = useSelector(
    (state) => state.handleJoin || {}
  );

  /* ── Fetch preforms on mount ── */
  useEffect(() => {
    dispatch(getPreformForHandleJoin());
  }, [dispatch]);

  /* ── Initial form values ── */
  const initialValues = {
    /* Preform info — auto-filled from modal selection */
    preform_id:     '',
    preform_weight: '',
    cut_off:        '',
    mfd:            '',
    preform_type:   '',

    /* Diameter measurements */
    dia1: '', dia2: '', dia3: '', dia4: '', dia5: '',

    /* Handle details */
    handle_length:   '',
    handle_diameter: '',
    cone_length:     '',
    handle_number:   '',

    /* Remarks */
    additional_notes: '',

    /* Flame recipe — nested flow/time per row */
    h2Flow1:      { flow: 0, time: 0 },
    h2Flow2:      { flow: 0, time: 0 },
    h2Flow3:      { flow: 0, time: 0 },
    o2Line1Flow1: { flow: 0, time: 0 },
    o2Line1Flow2: { flow: 0, time: 0 },
    o2Line1Flow3: { flow: 0, time: 0 },
    
  };

  /* ── Submit handler ── */
  const onSubmit = async (values, { resetForm }) => {
  try {
    const payload = {
      preform_id: values.preform_id,

      dia1: values.dia1,
      dia2: values.dia2,
      dia3: values.dia3,
      dia4: values.dia4,
      dia5: values.dia5,

      handle_length: values.handle_length,
      handle_diameter: values.handle_diameter,
      cone_length: values.cone_length,
      handle_number: values.handle_number,
      additional_notes: values.additional_notes,

      // Flame recipe
      h2flow1: values.h2Flow1.flow,
      h2flow2: values.h2Flow2.flow,
      h2flow3: values.h2Flow3.flow,

      o2line1_flow1: values.o2Line1Flow1.flow,
      o2line1_flow2: values.o2Line1Flow2.flow,
      o2line1_flow3: values.o2Line1Flow3.flow,

      h2flow1_time: values.h2Flow1.time,
      h2flow2_time: values.h2Flow2.time,
      h2flow3_time: values.h2Flow3.time,

      o2line1_flow1_time: values.o2Line1Flow1.time,
      o2line1_flow2_time: values.o2Line1Flow2.time,
      o2line1_flow3_time: values.o2Line1Flow3.time,

      // Consumption
      h2flow1_cons: cons(values.h2Flow1.flow, values.h2Flow1.time),
      h2flow2_cons: cons(values.h2Flow2.flow, values.h2Flow2.time),
      h2flow3_cons: cons(values.h2Flow3.flow, values.h2Flow3.time),

      o2line1_flow1_cons: cons(
        values.o2Line1Flow1.flow,
        values.o2Line1Flow1.time
      ),
      o2line1_flow2_cons: cons(
        values.o2Line1Flow2.flow,
        values.o2Line1Flow2.time
      ),
      o2line1_flow3_cons: cons(
        values.o2Line1Flow3.flow,
        values.o2Line1Flow3.time
      ),
      joined_by:1111,
    logged_in_user:1111,
    };

    console.log("Submitting:", payload);

    const result = await dispatch(handleJoin(payload));

    if (handleJoin.fulfilled.match(result)) {
      showSuccess("Join Data Submitted Successfully");
      resetForm();
    } else {
      showError(result?.payload?.message || "Submission Failed");
    }
  } catch (error) {
    showError(error?.message || "Something went wrong");
    console.error(error);
  }
};

  return (
    <>
    {hjLoading && <Loader/>}
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {({ values, setFieldValue, resetForm }) => (
            <>
              <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">

                {/* ── Action bar ── */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Handle Joining</span>
                  <div className="flex gap-1.5">
                    <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                    <SubmitButton compact type="submit" disabled={hjLoading}>
                      {hjLoading ? 'Saving...' : 'Submit'}
                    </SubmitButton>
                  </div>
                </div>

                {/* ── Row 1: Preform & WIP | Measurement Logs ── */}
                <div className="grid grid-cols-2 gap-3">

                  {/* Preform & WIP Details */}
                  <ModuleCard compact title="Preform & WIP Details"
                    icon={<Settings size={13} className="text-indigo-600" />}>
                    <div className="space-y-2">
                      {/* Preform ID + Browse */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <FormikInput compact label="Preform ID" name="preform_id"
                            placeholder="Click Browse to select..." readOnly />
                        </div>
                        <button type="button" onClick={() => setIsModalOpen(true)}
                          disabled={phjLoading}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase hover:bg-indigo-700 disabled:opacity-50 transition-all h-[28px]">
                          <Search size={10} />
                          {phjLoading ? 'Loading...' : 'Browse'}
                        </button>
                      </div>

                      {/* Auto-filled fields from API */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                        {AUTO_FIELDS.map(({ key, label }) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
                            <span className="text-[11px] font-semibold text-slate-700">
                              {values[key] || <span className="text-slate-300 text-[9px]">—</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ModuleCard>

                  {/* Measurement Logs */}
                  <ModuleCard compact title="Measurement Logs"
                    icon={<Ruler size={13} className="text-indigo-600" />}>
                    <div className="space-y-2">
                      {/* 5 diameter inputs */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {['dia1','dia2','dia3','dia4','dia5'].map((d, i) => (
                          <FormikInput key={d} compact label={`Dia ${i+1}`} name={d}
                            type="number" placeholder="0.00" />
                        ))}
                      </div>
                      {/* Handle details */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <FormikInput compact label="Handle Length"   name="handle_length"   type="number" />
                        <FormikInput compact label="Handle Diameter" name="handle_diameter" type="number" />
                        <FormikInput compact label="Cone Length"     name="cone_length"     type="number" />
                        <FormikInput compact label="Handle Number"   name="handle_number"   type="number" />
                      </div>
                    </div>
                  </ModuleCard>
                </div>

                {/* ── Row 2: Flame Recipe Parameters ── */}
                <ModuleCard compact title="Flame Recipe Parameters"
                  icon={<Droplets size={13} className="text-indigo-600" />}>
                  {/* Column headers */}
                  <div className="grid grid-cols-[1.6fr_2fr_2fr_1fr] gap-2 px-1 mb-1">
                    {['Parameter','Flow (LPM)','Time (Min)','Cons. (M3)'].map(h => (
                      <span key={h} className="text-[9px] font-bold text-slate-500 uppercase">{h}</span>
                    ))}
                  </div>
                  {/* Data rows */}
                  <div className="space-y-1">
                    {FLAME_ROWS.map(({ key, label }) => (
                      <div key={key} className="grid grid-cols-[1.6fr_2fr_2fr_1fr] gap-2 items-center">
                        <span className="text-[11px] font-medium text-slate-700 pl-1">{label}</span>
                        <FormikInput compact name={`${key}.flow`} type="number" />
                        <FormikInput compact name={`${key}.time`} type="number" />
                        <span className="text-[11px] font-bold text-emerald-600 font-mono text-right pr-1">
                          {cons(values[key]?.flow, values[key]?.time)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ModuleCard>

                {/* ── Row 3: Additional Notes ── */}
                <div className="flex-shrink-0">
                  <FormikTextarea compact label="Additional Notes" name="additional_notes"
                    rows={2} placeholder="Enter quality or process remarks..." />
                </div>

              </Form>

              {/* ── Preform Selection Modal ── */}
              <SelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Accepted Preform"
                data={preformForHandleJoinData || []}
                columns={modalColumns}
                onSelect={(row) => {
                  /* Map API response fields → form field names */
                  setFieldValue('preform_id',     row.preform_id     ?? '');
                  setFieldValue('preform_weight', row.preform_weight  ?? '');
                  setFieldValue('cut_off',        row.cut_off         ?? '');
                  setFieldValue('mfd',            row.mfd             ?? '');
                  setFieldValue('preform_type',   row.preform_type_id ?? '');
                  setIsModalOpen(false);
                }}
              />
            </>
          )}
        </Formik>
      </div>
    </div>
    </>
  );
};

export default HandleJoining;