import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { User, X } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../../../components/common_buttons';

const DEPARTMENTS = ['Select','Draw','Proof Testing','Quality','Dispatch','QA','Admin','HR','IT'];
const ROLES       = ['Select','Operator','Senior Operator','Supervisor','Manager','Admin','QA Engineer','QC Inspector'];
const SHIFTS      = ['Select','A','B','C','General'];

const validationSchema = Yup.object({
  employee_id: Yup.string().required('Required'),
  name:        Yup.string().required('Required'),
  email:       Yup.string().email('Invalid email').required('Required'),
  department:  Yup.string().notOneOf(['Select'],'Required').required('Required'),
  role:        Yup.string().notOneOf(['Select'],'Required').required('Required'),
  username:    Yup.string().required('Required'),
  password:    Yup.string().min(6,'Min 6 chars').required('Required'),
});

const defaultValues = {
  employee_id: '', name: '', email: '', phone: '',
  department: 'Select', role: 'Select', shift: 'Select',
  username: '', password: '', status: 'Active',
};

/* ─────────────────────────────────────────────────────────
   UserCreationForm
   Can be used standalone (full page) or as a popup.

   Props:
   - initialValues : prefill data for update mode
   - onSubmit      : (values) => void
   - onCancel      : () => void  (shown only when isPopup)
   - isPopup       : bool — renders compact popup shell
   - title         : string
───────────────────────────────────────────────────────── */
const UserCreationForm = ({
  initialValues = defaultValues,
  onSubmit,
  onCancel,
  isPopup = false,
  title = 'Create New User',
}) => {
  const handleSubmit = (values, { resetForm }) => {
    onSubmit?.(values);
    if (!isPopup) resetForm();
  };

  const formBody = (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ resetForm, errors, touched }) => (
        <Form className="flex flex-col gap-3">
          <ModuleCard compact title="Personal Information" icon={<User size={13} className="text-blue-600" />}>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <FormikInput compact label="Employee ID"   name="employee_id" placeholder="EMP-001" />
                {touched.employee_id && errors.employee_id && <span className="text-[8px] text-rose-500">{errors.employee_id}</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <FormikInput compact label="Full Name"     name="name"        placeholder="Full name..." />
                {touched.name && errors.name && <span className="text-[8px] text-rose-500">{errors.name}</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <FormikInput compact label="Email"         name="email"       type="email" placeholder="email@company.com" />
                {touched.email && errors.email && <span className="text-[8px] text-rose-500">{errors.email}</span>}
              </div>
              <FormikInput  compact label="Phone"          name="phone"       placeholder="+91 XXXXX XXXXX" />
            </div>
          </ModuleCard>

          <ModuleCard compact title="Role & Assignment" icon={<User size={13} className="text-indigo-600" />}>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <FormikSelect compact label="Department" name="department" options={DEPARTMENTS} />
                {touched.department && errors.department && <span className="text-[8px] text-rose-500">{errors.department}</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <FormikSelect compact label="Role"       name="role"       options={ROLES} />
                {touched.role && errors.role && <span className="text-[8px] text-rose-500">{errors.role}</span>}
              </div>
              <FormikSelect compact label="Shift"        name="shift"      options={SHIFTS} />
              <FormikSelect compact label="Status"       name="status"     options={['Active','Inactive','On Leave']} />
            </div>
          </ModuleCard>

          <ModuleCard compact title="Login Credentials" icon={<User size={13} className="text-emerald-600" />}>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <FormikInput compact label="Username"    name="username"  placeholder="username" />
                {touched.username && errors.username && <span className="text-[8px] text-rose-500">{errors.username}</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                <FormikInput compact label="Password"    name="password"  type="password" placeholder="Min 6 chars" />
                {touched.password && errors.password && <span className="text-[8px] text-rose-500">{errors.password}</span>}
              </div>
            </div>
          </ModuleCard>

          <div className="flex justify-between gap-3 pt-1 border-t border-slate-100">
            <ResetButton compact type="button" onClick={isPopup ? onCancel : () => resetForm()}>
              {isPopup ? 'Cancel' : 'Reset'}
            </ResetButton>
            <SubmitButton compact type="submit">
              {initialValues?.employee_id ? 'Update User' : 'Create User'}
            </SubmitButton>
          </div>
        </Form>
      )}
    </Formik>
  );

  /* ── Standalone page ── */
  if (!isPopup) {
    return (
      <div className="h-full bg-slate-50 font-sans flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="max-w-xl mx-auto">
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <User size={16} className="text-blue-600" /> {title}
              </h2>
              {formBody}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Popup modal ── */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Popup header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <User size={15} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-700">{title}</span>
          </div>
          <button type="button" onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all">
            <X size={16} />
          </button>
        </div>
        {/* Popup body */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {formBody}
        </div>
      </div>
    </div>
  );
};

export default UserCreationForm;
