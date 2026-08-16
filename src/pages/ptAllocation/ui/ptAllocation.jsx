import React, { useRef, useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { Barcode, Table as TableIcon } from 'lucide-react';
import { ModuleCard, FormikSelect, FormikInput } from '../../../components/common_fields';
import { SubmitButton, ResetButton } from '../../../components/common_buttons';
import { showSuccess, showError } from '../../../utils/toastService';
import { useDispatch, useSelector } from 'react-redux';
import { ptAllocationEntry, getDrawEntryDetails, ptWip } from '../services/pt_allocation.api';
import { getPTMachines } from '../../Admin_Folder/proof_testing/pt_machine/service/pt_machine.api';
import { getPTUsers } from '../../Admin_Folder/proof_testing/pt_users/service/pt_users.api';


const dummyData = [
  { preform_id: 'PF-9901', drawn_spool_id: 'SP-101', DT_No: 'DT-A1', Drawn_Length: '5000m', PT_Done: 'No', Balance: '5000m' },
  { preform_id: 'PF-9902', drawn_spool_id: 'SP-102', DT_No: 'DT-B2', Drawn_Length: '4500m', PT_Done: 'Yes', Balance: '0m' },
  { preform_id: 'PF-9903', drawn_spool_id: 'SP-103', DT_No: 'DT-C3', Drawn_Length: '6000m', PT_Done: 'No', Balance: '6000m' },
];

const initialValues = {
  spool_id: '',
  spool_fid: '',
  allocation_date: new Date().toISOString().split('T')[0],
  preform_id: '',
  tower_no: '',
  drawn_length: '',
  product_type: "",
  pt_strain: '',
  pt_machine_no: '',
  allocated_by: '',
  is_reject: false,
  shift_incharge: '',
  allocation_remark: '',
};

const PTAllocation = () => {
  const dispatch = useDispatch();
  const formikRef = useRef(null);

  const [ptMachines, setPTMachines] = useState([]);
  const [ptUsers, setPTUsers] = useState([]);
  const [ptWipData, setPtWipData] = useState([]);
  const [loading, setLoading] = useState(true)

 const fetchPtWip = async () => {
    try {
        setLoading(true);

        const response = await ptWip(false);

        if (response.success) {
            setPtWipData(response.data);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchPtWip();
}, []);

  useEffect(() => {
    const fetchPTMAchines = async () => {
      try {
        const data = await getPTMachines();
        setPTMachines(data.data)
      } catch (erro) {
        console.error("Error Fetching PT Machines:", error)
      }
    }
    fetchPTMAchines();
  }, [])

  useEffect(() => {
    const fetchPTUsers = async () => {
      try {
        const data = await getPTUsers();
        setPTUsers(data.data)
      } catch (error) {
        console.error("Error Fetching PT Users:", error)
      }
    }
    fetchPTUsers();
  }, [])

  const ptMachineOptions = ptMachines.map((ptm) => ({
    label: `PT Machine ${ptm.pt_machine_no}`,
    value: ptm.pt_machine_no,
  }))

  const ptUsersOptions = ptUsers.map((user)=>({
    label:`${user.pt_user_name}`,
    value: user.pt_user_name,
  }))

  const handleSpoolScan = async (spool_id) => {
  if (!spool_id) return;

  try {
    const res = await getDrawEntryDetails(spool_id);
    console.log("what is the response:", res)
    if (res?.data) {
      formikRef.current.setValues((prev) => ({
        ...prev,
        spool_id,
        spool_fid: res.data.spool_fid || '',
        preform_id: res.data.preform_id,
        tower_no: res.data.tower_no,
        drawn_length: res.data.drawn_length,
        product_type: res.data.product_type,
      }));
    } else {
      showError("This spool is already allocated or does not exist");
    }
  } catch (error) {
    console.error("Error fetching spool data:", error);
    showError("This spool is already allocated or does not exist");
  }
};


  const handleRowClick = (row) => {
    // Set spool_id first, then call scan handler to fetch all details
    const spoolId = row.spool_id || row.drawn_spool_id || '';
    if (spoolId) {
      formikRef.current?.setFieldValue("spool_id", spoolId);
      handleSpoolScan(spoolId);
    }
  };

  return (
    /* fill the container's render area */
    <div className="h-full flex flex-col gap-3 overflow-hidden">

      {/* ── Entry Form ── */}
      <ModuleCard compact title="Spool Allocation Entry" icon={<Barcode size={13} className="text-indigo-600" />}>
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={async (values, { resetForm }) => {
            try {
              const response = await dispatch(ptAllocationEntry(values))
              if (response.payload?.success) {
                console.log("show success", response)
                showSuccess(response.payload?.message || "Allocation Saved Successfully")
                await fetchPtWip();
                resetForm();
              } else {
                console.log("Error:", response)
                showError(response.payload?.message || "Allocation Failed")
              }
            } catch (error) {
              console.error("Submit Error:", error);
              showError("Something went wrong");
            }
          }}
        >
          {({ handleReset, values, setFieldValue }) => (
            <Form>

              <div className="grid grid-cols-5 gap-2">
                <FormikInput compact label="Scan Drawn Spool Barcode" name="spool_id" placeholder="Scan Spool..." onBlur={(e) => handleSpoolScan(e.target.value)}
   />
                <FormikInput compact label="Date" name="allocation_date" type="date" readOnly />
                <FormikInput compact label="Preform ID" name="preform_id" placeholder="Automatic" readOnly />
                <FormikInput compact label="DT No" name="tower_no" placeholder="Automatic" readOnly />
                <FormikInput compact label="Drawn Length" name="drawn_length" placeholder="Automatic" readOnly />
                <FormikInput compact label="Product Type" name="product_type" placeholder="Automatic" readOnly />
                <FormikSelect compact label="Select PT Strain" name="pt_strain" options={[
                  { label: "1%", value: 1 },
                  { label: "2%", value: 2 },
                ]} />
                <FormikSelect compact label="Select PT Machine" name="pt_machine_no" options={ptMachineOptions} />
                <FormikSelect compact label="Allocated By" name="allocated_by" options={ptUsersOptions} />
                <FormikSelect compact label="Shift Incharge" name="shift_incharge" options={ptUsersOptions} />
                <FormikInput compact label="Remark" name="allocation_remark" placeholder="Remark" />
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-800 uppercase text-[9px]">
                    Rejected
                  </label>

                  <div
                    onClick={() => setFieldValue("is_reject", !values.is_reject)}
                    className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${values.is_reject ? "bg-red-500" : "bg-green-500"
                      }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${values.is_reject ? "translate-x-6" : "translate-x-0.5"
                        }`}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                <ResetButton compact onClick={handleReset}>Clear</ResetButton>
                <div className="flex gap-2">
                  <SubmitButton compact>Allocate</SubmitButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </ModuleCard>

      {/* ── Pending Allocation Table — scrolls internally ── */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50/80 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
          <TableIcon size={13} className="text-indigo-600" />
          <span className="font-bold text-slate-700 text-[9px] uppercase tracking-wider">Pending Allocation List</span>
        </div>
        {/* scrollable body */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b border-slate-200">
                {['Preform ID', 'Draw Spool ID', 'DT No', 'Draw Length','Product Type', 'PT Done', 'Balance Length'].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ptWipData.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row)}
                  className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2 text-xs font-semibold text-indigo-600">{row.preform_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.spool_id}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.tower_no}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.drawn_length}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.product_type.trim()+row.process_type}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row.PT_Done === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {row.PT_Done}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600 font-mono">{row.Balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-1.5 text-[9px] text-slate-400 italic border-t border-slate-100 flex-shrink-0">
          * Click a row to auto-fill the allocation form above.
        </p>
      </div>

    </div>
  );
};

export default PTAllocation;
