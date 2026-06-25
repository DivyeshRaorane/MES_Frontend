import React, {useState,useEffect} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { preformEntrySap } from '../service/preform_entry_SAP.api';
import { showSuccess,showError } from '../../../utils/toastService';
import Loader from '../../../components/loader';

const PreformEntryForm = () => {
    const dispatch = useDispatch();
    const {preformEntrySapData,pesLoading,pesError} = useSelector((state)=> state.preformEntrySap);

  // Initial values for the form fields
  const initialValues = {
    preform_id: '',
    preform_weight: '',
    preform_type_id: '',
    material_code: '',
    material_description: '',
    plant: '',
    storage_location: '',
    uom: '',
  };

  // Basic validation schema (Adjust according to your needs)
  const validationSchema = Yup.object({
    preform_id: Yup.string().required('Preform ID is required'),
    preform_weight: Yup.number().positive('Must be positive').required('Weight is required'),
    preform_type_id: Yup.string().required('Preform Type ID is required'),
    material_code: Yup.string().required('Material Code is required'),
    material_description: Yup.string().required('Description is required'),
    plant: Yup.string().required('Plant is required'),
    storage_location: Yup.string().required('Storage Location is required'),
    uom: Yup.string().required('UOM is required'),
  });

  const handleSubmit = async(values, { resetForm }) => {
    try{
    console.log('Form Data Submitted:', values);

   const response=  await dispatch(preformEntrySap(values)).unwrap();
    const successMsg = response?.message || "Preform Creation Successful SAP";
    showSuccess(successMsg);

    // Handle your API call or state update here
    resetForm();
    }catch(error){
console.error('Failed to submit preform data:', error);

const errorMsg = error?.message || error?.data?.message || "Something went wrong";
    showError("Error: " + errorMsg);
    }
  };

  return (
    <>
    {pesLoading && <Loader/>}
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
        <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
            <div className="flex flex-col flex-1 overflow-hidden px-4 py-3 gap-3">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
        Preform Data Entry
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Preform ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preform ID</label>
              <Field
                type="text"
                name="preform_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter Preform ID"
              />
              <ErrorMessage name="preform_id" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Preform Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preform Weight</label>
              <Field
                type="number"
                name="preform_weight"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter Weight"
              />
              <ErrorMessage name="preform_weight" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Preform Type ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preform Type ID</label>
              <Field
                type="text"
                name="preform_type_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter Preform Type ID"
              />
              <ErrorMessage name="preform_type_id" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Material Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Code</label>
              <Field
                type="text"
                name="material_code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter Material Code"
              />
              <ErrorMessage name="material_code" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Material Description - Full width on desktop */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Description</label>
              <Field
                as="textarea"
                rows="2"
                name="material_description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter Material Description"
              />
              <ErrorMessage name="material_description" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Plant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
              <Field
                type="text"
                name="plant"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter Plant/Factory Code"
              />
              <ErrorMessage name="plant" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Storage Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
              <Field
                type="text"
                name="storage_location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter Storage Location"
              />
              <ErrorMessage name="storage_location" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Unit of Measurement (UOM) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement (UOM)</label>
              <Field
                type="text"
                name="uom"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g. KG, PC, M"
              />
              <ErrorMessage name="uom" component="div" className="text-red-500 text-xs mt-1" />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4 border-t pt-4">
              <button
                type="reset"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Data'}
              </button>
            </div>

          </Form>
        )}
      </Formik>
      </div>
      </div>
    </div>
    </>
  );
};

export default PreformEntryForm;