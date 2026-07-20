import './App.css'

import { Route,Routes } from 'react-router'
import LoginPage from './pages/login/ui/login'
import Layout from './components/layout'
import Dashboard from './pages/dashboard/ui/dashboard'
import PerformAcceptance from './components/preformAcceptance/ui/preformAcceptance'
import DrwaSpoolEntry from './pages/drawSpoolEntry/ui/drawSpoolEntry'
import DrawManagementPage from './components/drawmanagement'
import PTEntry from './pages/proofTestEntry/ui/ptEntry'
import QCEntryScreen from './pages/qualityEntry/ui/qcEntry'
import PVEntry from './pages/pvEntry/ui/pvEntry'
import UnderDevelopment from './components/underDevelopmentPage'
import PageNotFound from './components/404notfound'
import UserHomeScreen from './pages/Admin_Folder/user_management/user/ui/user_home_screen'
import UserCreationForm from './pages/Admin_Folder/user_management/user/ui/user_creation_screen'
import D2Egeing from './pages/d2Egeing/ui/d2egeing'
import H2Ageing from './pages/h2egeing/ui/h2egeing'
import DrawBrakAnalysis from './pages/drawbraekAnalysis/ui/drawBAanalysis'
import DrawShiftPlan from './pages/drawShiftPlan/ui/drawShiftPlan'
import GWLPerformHandleJoining from './pages/gwlperformhandleJoining/ui/gwlPerHandleJoining'
import RewColContainer from './components/rewcoloringztmde'
import PTAllocationContainer from './components/ptAllocationContainer'
import PTBreakAnalysis from './pages/ptBreakAnalysis/ui/ptBreakAnalysis'
import BoxScanningEntry from './pages/boxScanningEntry/ui/boxScanningEntry'
import FGFiberAllocation from './pages/fgFiberAllocation/ui/fgFiberAllocation'
import FGRejectinContainer from './components/fgRejectionContainer'
import TCGenerationDashboard from './components/tcGeneration'
import MacrobendContainer from './components/macrobendContainer'
import TRHList from './pages/trh_entry/ui/TRHList'
import TemperatureList from './pages/temp_entry/ui/TemperatureList'
import ComplaintStatusMonitor from './pages/customer_complaint/complaintTable/ui/complaintTable'
import ComplaintClosure from './pages/customer_complaint/complaintClosure/ui/complainClosure'
import HandleJoining from './pages/handleJoining/ui/handleJoining'
import PrerformAllocation from './pages/preformAllocation/ui/preformAllocation'
import D2Combined from './pages/d2Egeing/ui/d2_combined'
import D2Issue from './pages/d2Egeing/ui/d2egeing'
import D2gas_ConeEntry from './pages/d2gas_coneEntry/ui/d2gas_cone_entry'
import D2Recieving from './pages/d2_Recieving/ui/d2_Recieving'
import PTReport from './pages/pt_Report/ui/pt_Report'
import CustomerAllocation from './pages/customer_Allocation/ui/customer_Allocation'
import QCInOut from './pages/qc_in_out/ui/qc_in_out'
import DispatchChecking from './pages/dispatch_Checking/ui/dispatch_checking'
import FiberMakingCheck from './pages/dispatch_fiber_making/ui/dispatch_fiber_making'
import FGFiberRejection from './pages/fg_fiber_rejection/ui/fg_fiber_rejection'
import PackingListGeneration from './pages/packing_list_gen/ui/packing_list_generation'
import ModulaInOut from './pages/modula_in_out/ui/modula_in_out'
import CustomerEnquiry from './pages/order_and_dispatch_management/customer_enquiry/ui/customer_enquiry'
import CustomerEnquiryList from './pages/order_and_dispatch_management/customer_enquiry_list/ui/customer_enquiry_list'
import CustomerEnquiryFormPage from './pages/order_and_dispatch_management/customer_enquiry/ui/customer_enquiry_form'
import DrawShiftReport from './pages/draw_shift_report/ui/draw_shift_report'
import DrawTimelossEntry from './pages/draw_timeloss_entry/ui/draw_timeloss_entry'
import Splicing from './pages/splicing/ui/SplicingList'
import ShortTermContainer from './components/short_term_container'
import CustomerComplaint from './pages/customer_complaint/ui/customer_complaint'
import { ToastContainer } from 'react-toastify'
import PreformEntryForm from './pages/preform_enrty_SAP/ui/Preform_entry_SAP'
import DrawManagementAdmin from './pages/Admin_Folder/draw_management/ui/draw_management_admin'
import GeneralAdmin from './pages/Admin_Folder/general_admin/ui/general_admin'
import QualityAdmin from './pages/Admin_Folder/quality_admin/ui/quality_admin'
import TrayManagement from './pages/Admin_Folder/FG/tray_management/ui/tray_management'
import OrderRegister from './pages/order_register/ui/order_register'
import HighTempHumidityAgeing from './pages/htha_entry/ui/HTHAList'
import WaterImmersion from './pages/water_immersion/ui/WIList'
import AcceleratedAgeing from './pages/accelerated_ageing/ui/AATList'
import HotWaterTest from './pages/hot_water_test/ui/HWList'
import DynamicFatigue from './pages/dynamic_fatigue/ui/DFList'
import DrawReports from './pages/Reports/DrawManagement/ui/DrawReports'
import SpecCreation from './pages/QualityAssurance/SpecCreation/SpecCreation'


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route element={<Layout/>}>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='drawmange' element={<DrawManagementPage/>}/>
        <Route path='drawmange/prefromentrysap' element= {<PreformEntryForm/>}/>
        <Route path='drawmange/acceptance' element={<PerformAcceptance/>}/>
        <Route path='drawmange/handlejoining' element={<HandleJoining/>}/>
        <Route path='drawmange/allocation' element={<PrerformAllocation/>}/>
        <Route path='drawmange/drawspoolentry' element={<DrwaSpoolEntry/>}/>
        <Route path='drawmange/drawbrakanalysis' element={<DrawBrakAnalysis/>}/>
        <Route path='drawmange/drawshiftplan' element={<DrawShiftPlan/>}/>
        <Route path='drawmange/drawshiftreport' element={<DrawShiftReport/>}/>
        <Route path='drawmange/drawtimeloss' element={<DrawTimelossEntry/>}/>
        <Route path='drawmange/reports' element={<DrawReports/>}/>
        <Route path='prooftesting/ptentry' element={<PTEntry/>}/>
        <Route path='prooftesting/rewcolztentry' element={<RewColContainer/>}/>
        <Route path='prooftesting/ptallocation' element={<PTAllocationContainer/>}/>
        <Route path='prooftesting/ptreport' element={<PTReport/>}/>
        <Route path='prooftesting/ptbreakanalysis' element={<PTBreakAnalysis/>}/>
        <Route path='quality/qcentry' element={<QCEntryScreen/>}/>
        <Route path='quality/pventry' element={<PVEntry/>}/>
        <Route path='quality/d2issue' element={<D2Combined/>}/>
        <Route path='quality/d2gasconeentry' element={<D2Combined/>}/>
        <Route path='quality/d2recieving' element={<D2Combined/>}/>
        <Route path='quality/h2egeing' element={<H2Ageing/>}/>
        <Route path='quality/qcinout' element={<QCInOut/>}/>
        <Route path='fg/customerallocation' element={<CustomerAllocation/>}/>
        <Route path='dispatch/dispatchchecking' element={<DispatchChecking/>}/>
        <Route path='dispatch/fibermakingcheck' element={<FiberMakingCheck/>}/>
        <Route path='dispatch/boxscanningentry' element={<BoxScanningEntry/>}/>
        <Route path='fg/fgfiberallocation' element={<FGFiberAllocation/>}/>
        <Route path='fg/tcgeneration' element={<TCGenerationDashboard/>}/>
        <Route path='fg/orderregister' element={<OrderRegister/>}/>
        <Route path='fg/fiberrejection' element={<FGFiberRejection/>}/>
        <Route path='fg/packinglist' element={<PackingListGeneration/>}/>
        <Route path='fg/modulainout' element={<ModulaInOut/>}/>
        <Route path='order/customerenquiry' element={<CustomerEnquiry/>}/>
        <Route path='order/enquirylist' element={<CustomerEnquiryList/>}/>
        <Route path='order/enquiryform' element={<CustomerEnquiryFormPage/>}/>
        <Route path='order/customerenquirylist' element={<CustomerEnquiryList/>}/>
        <Route path='qa/macrobendC' element={<MacrobendContainer/>}/>
        <Route path='qa/temperature' element={<TemperatureList/>}/>
        <Route path='qa/trhentry' element={<TRHList/>}/>
        <Route path='qa/hthatest' element={<HighTempHumidityAgeing/>}/>
        <Route path='qa/waterimmersion' element={<WaterImmersion/>}/>
        <Route path='qa/acceleratedageing' element={<AcceleratedAgeing/>}/>
        <Route path='qa/hotwatertest' element={<HotWaterTest/>}/>
        <Route path='qa/dynamicfatigue' element={<DynamicFatigue/>}/>
        <Route path='qa/shorttermentry' element={<ShortTermContainer/>}/>
        <Route path='qa/speccreation' element={<SpecCreation/>}/>
        <Route path='qa/splicing' element={<Splicing/>}/>
        <Route path='qa/customer' element={<CustomerComplaint/>}/>
        <Route path='underdev' element={<UnderDevelopment/>}/>
        <Route path='admin/users' element={<UserHomeScreen/>}/>
        <Route path='admin/general' element={<GeneralAdmin/>}/>
        <Route path='admin/usercreation' element={<UserCreationForm onSubmit={(v) => console.log('Create:', v)} title="Create New User" />}/>
        <Route path='admin/drawmanagement' element={<DrawManagementAdmin/>}/>
        <Route path='admin/quality' element={<QualityAdmin/>}/>
        <Route path='admin/traymanagement' element={<TrayManagement/>}/>
        <Route path='/*' element={<PageNotFound/>}/>
        </Route>
        </Routes>  
         <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      /> 
    </>
  )
}

export default App
