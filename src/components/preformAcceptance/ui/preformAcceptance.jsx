import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { CheckCircle, XCircle, Package, Search, Ruler, FileText } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect, FormikTextarea } from '../../common_fields';
import { SubmitButton, ResetButton } from '../../common_buttons';
import SelectionModal from '../../selectionModal';
import { getPreforms } from '../services/preform_data.api';
import { preformAccept } from '../services/preform_acceptance.api';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../loader';
import { showSuccess, showError } from '../../../utils/toastService';
import { getAllDrawUsers } from '../../../pages/Admin_Folder/draw_management/draw_users/service/draw_user.api';





const modalColumns = [
  { key: 'preform_id', label: 'Preform ID' },
  { key: 'material_description', label: 'Material Description' },
  { key: 'preform_weight', label: 'Weight (kg)' },
  { key: 'material_code', label: 'Material Code'},
];

const initialValues = {
  preform_id: '', preform_weight: '', charge_weight: '', preform_length: '', charge_length: '', drawing_length: '', material_code: '',
  dia_variation: '', cut_off: '', mfd: '', accepted_by: '', preform_type: '', product_type: '', material_description: '',
  remarks: '', draw_instruction: '', acceptance_status: '', rejection_note: '', logged_in_user: "",
};

const validationSchema = Yup.object({
  preform_id: Yup.string().required('Required'),
  charge_weight: Yup.number()
    .typeError("Charge Weight must be a number")
    .required("Charge Weight Required"),
  preform_length: Yup.number()
    .typeError("preform length must be a number")
    .required("preofrm length Required"),
    charge_length: Yup.number()
    .typeError("Charge Length must be a number")
    .required("Charge Length Required"),
    drawing_length: Yup.number()
    .typeError("drawing Length must be a number")
    .required("drawing Length Required"),
    dia_variation: Yup.number()
    .typeError("dia variation must be a number")
    .required("dia variation Required"),
    cut_off: Yup.number()
    .typeError("cut off must be a number")
    .required("cut off Required"),
    mfd: Yup.number()
    .typeError("mfd must be a number")
    .required("mfd Required"),
  preform_weight: Yup.number().required('Required'),
});

/* ══════════════════════════════════════════════════════════ */
const PreformAcceptance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ drawUsers, setDrawUsers] = useState([]);

  const dispatch = useDispatch();

  const { preformData, loading, error } = useSelector((state) => state.preformData);
  const { preformAcceptanceData, preformALoading, preformAError } = useSelector((state) => state.preformAcceptance)
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

  const drawUsersOption = drawUsers.map((users) => ({
    label: `${users.draw_user_name}`,
    value: users.draw_user_name
  }))

  useEffect(() => {
    dispatch(getPreforms())
  }, [dispatch])


  return (
    <>
      {preformALoading && <Loader />}
      <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { resetForm }) => {
              try {
                console.log("Submitting:", values);

                const result = await dispatch(preformAccept(values));

                if (preformAccept.fulfilled.match(result)) {
                  showSuccess("Preform Accepted Successfully")
                  dispatch(getPreforms())
                  resetForm();
                }

              } catch (error) {
                showError(`Error:${error}`)
                console.error(error);
              }
            }}

          >
            {({ values, setFieldValue, resetForm, errors, touched }) => (
              <>
                <Form className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Preform Accept</span>
                    <div className="flex gap-1.5">
                      <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
                      <SubmitButton compact type="submit">Submit</SubmitButton>
                      <button type="button" className="px-3 py-1 bg-rose-600 text-white text-[9px] font-bold rounded hover:bg-rose-700 transition-all">Home</button>
                    </div>
                  </div>
                  {/* ── Row 1: Basic Info | Diameter Specs ── */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Basic Information */}
                    <ModuleCard
                      compact
                      title="Basic Information"
                      icon={<Package size={13} className="text-blue-600" />}
                    >
                      <div className="grid grid-cols-4 gap-2">
                        {/* Preform ID with inline search */}
                        <div className="col-span-2 flex flex-col gap-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Preform ID</label>
                          <div className="relative">
                            <Field
                              name="preform_id"
                              placeholder="Search or enter ID..."
                              className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 pr-8 text-xs focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <Search size={12} />
                            </button>
                          </div>
                        </div>

                        <FormikInput compact label="Preform Weight (kg)" name="preform_weight" type="number" disabled={true} />
                        <FormikInput compact label="Charge Weight (kg)" name="charge_weight" type="number" min="0"
                          error={errors.charge_weight}
                          touched={touched.charge_weight} />
                        <FormikInput compact label="Preform Length (mm)" name="preform_length" type="number" min="0"
                        error={errors.preform_length}
                          touched={touched.preform_length} />
                        <FormikInput compact label="Charge Length (mm)" name="charge_length" type="number" min="0"
                        error={errors.charge_length}
                          touched={touched.charge_length} />
                        <FormikInput compact label="Drawing Length(km)" name="drawing_length" type="number" min="0"
                         error={errors.drawing_length}
                          touched={touched.drawing_length}/>
                        <FormikInput compact label="Material Code" name="material_code" disabled={true} 
                        error={errors.material_code}
                          touched={touched.material_code}/>
                        <FormikInput compact label="Dia Variation" name="dia_variation" type="number" min="0"
                        error={errors.dia_variation}
                          touched={touched.dia_variation} />
                        <FormikInput compact label="Cut Off" name="cut_off" type="number" min="0"
                        error={errors.cut_off}
                          touched={touched.cut_off} />
                        <FormikInput compact label="MFD" name="mfd" type="number" min="0" />
                        <FormikSelect compact label="Accepted By" name="accepted_by" options={drawUsersOption} />
                        <div className="col-span-2">
                          <FormikInput compact label="Material Description" name="material_description" disabled={true} />
                        </div>
                        <FormikInput compact label="Preform Type" name="preform_type" type="text" readOnly />
                        {/*<FormikSelect compact label="Preform Type" name="preform_type_id" options={['G652D', 'G667A1', 'G657A2']} />*/}
                      </div>

                    </ModuleCard>


                    {/* Instructions */}
                    <ModuleCard
                      compact
                      title="Instructions"
                      icon={<FileText size={13} className="text-emerald-600" />}
                    >
                      <div className="grid grid-cols-2 gap-2 h-full">
                        <FormikTextarea rows={5} compact label="Remarks" name="remarks" placeholder="Enter remarks..." />
                        <FormikTextarea rows={5} compact label="Draw Instruction" name="draw_instruction" placeholder="Enter draw instructions..." />
                      </div>
                    </ModuleCard>
                  </div>

                  {/* ── Row 2: Instructions | Decision + Actions ── */}
                  <div className="grid grid-cols-1 gap-3">

                    {/* Decision + Actions */}
                    <ModuleCard
                      compact
                      title="Acceptance Decision"
                      icon={<CheckCircle size={13} className="text-rose-500" />}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Accept / Reject toggle */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase ml-0.5">Acceptance Status</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFieldValue('acceptance_status', 'accepted')}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${values.acceptance_status === 'accepted'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100'
                                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                                }`}
                            >
                              <CheckCircle size={13} /> ACCEPT
                            </button>
                            <button
                              type="button"
                              onClick={() => setFieldValue('acceptance_status', 'rejected')}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${values.acceptance_status === 'rejected'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
                                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                                }`}
                            >
                              <XCircle size={13} /> REJECT
                            </button>
                          </div>
                        </div>

                        {/* Rejection note */}
                        <FormikInput
                          compact
                          label="Rejection Note"
                          name="rejection_note"
                          placeholder={values.acceptance_status === 'accepted' ? 'Not required' : 'Specify reason...'}
                          disabled={values.acceptance_status === 'accepted'}
                        />
                      </div>
                    </ModuleCard>
                  </div>

                </Form>

                {/* Selection Modal */}
                <SelectionModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  title="Select Preform Record"
                  data={preformData}
                  columns={modalColumns}
                  onSelect={(selectedRow) => {
                    Object.keys(selectedRow).forEach(key => setFieldValue(key, selectedRow[key]));
                    setFieldValue("preform_type", selectedRow.preform_type);
                    setFieldValue("product_type", selectedRow.product_type);
                    setFieldValue("drawing_length", selectedRow.preform_weight * 37)
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

export default PreformAcceptance;
