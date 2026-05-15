import React from 'react';
import { Formik, Form } from 'formik';
import { ClipboardList } from 'lucide-react';
import { ModuleCard, FormikInput, FormikSelect } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';

const initialValues = {
  rela_id:    '',
  torsion:    'Select',
  draw_id:    '',
  draw_date:  '',
  tower_no:   '',
  spool_id:   '',
  preform_id: '',
};

const ShortTermEntry = () => (
  <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
    <div className="flex flex-col flex-1 overflow-hidden px-3 py-2">
      <Formik initialValues={initialValues}
        onSubmit={(v) => { console.log('Short Term Entry:', v); alert('Saved!'); }}>
        {({ resetForm }) => (
          <Form className="flex flex-col flex-1 overflow-hidden gap-2">
            <ModuleCard compact title="Short Term Entry" icon={<ClipboardList size={12} className="text-blue-600" />}>
              <div className="grid grid-cols-4 gap-2">
                <FormikInput  compact label="Rela ID"    name="rela_id" />
                <FormikSelect compact label="Torsion"    name="torsion"   options={['Select','Left','Right','Both']} />
                <FormikInput  compact label="Draw ID"    name="draw_id" />
                <FormikInput  compact label="Draw Date"  name="draw_date"  type="date" />
                <FormikInput  compact label="Tower No"   name="tower_no" />
                <FormikInput  compact label="Spool ID"   name="spool_id" />
                <FormikInput  compact label="Preform ID" name="preform_id" />
              </div>
            </ModuleCard>
            <div className="flex justify-between gap-3 flex-shrink-0 pt-1 border-t border-slate-100">
              <ResetButton compact type="button" onClick={() => resetForm()}>Reset</ResetButton>
              <SubmitButton compact type="submit">Submit</SubmitButton>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  </div>
);

export default ShortTermEntry;
