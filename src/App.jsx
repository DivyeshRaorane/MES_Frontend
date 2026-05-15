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
import TRH_Cycle from './pages/trh_cycle/ui/trh_cycle'
import TEMP_Cycle from './pages/temp_cycle/ui/temp_cycle'
import TRHTempCycleContainer from './components/trhTempContainer'
import ComplaintStatusMonitor from './pages/complaintTable/ui/complaintTable'
import ComplaintClosure from './pages/complaintClosure/ui/complainClosure'
import HandleJoining from './pages/handleJoining/ui/handleJoining'
import PrerformAllocation from './pages/preformAllocation/ui/preformAllocation'
import D2Issue from './pages/d2Egeing/ui/d2egeing'
import D2gas_ConeEntry from './pages/d2gas_coneEntry/ui/d2gas_cone_entry'
import D2Recieving from './pages/d2_Recieving/ui/d2_Recieving'
import PTReport from './pages/pt_Report/ui/pt_Report'
import CustomerAllocation from './pages/customer_Allocation/ui/customer_Allocation'
import QCInOut from './pages/qc_in_out/ui/qc_in_out'
import DispatchChecking from './pages/dispatch_Checking/ui/dispatch_checking'
import FiberMakingCheck from './pages/dispatch_fiber_making/ui/dispatch_fiber_making'
import DrawShiftReport from './pages/draw_shift_report/ui/draw_shift_report'
import DrawTimelossEntry from './pages/draw_timeloss_entry/ui/draw_timeloss_entry'
import Splicing from './pages/splicing/ui/splicing'
import ShortTermContainer from './components/short_term_container'
import CustomerComplaintContainer from './components/customer_complaint_container'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route element={<Layout/>}>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='drawmange' element={<DrawManagementPage/>}/>
        <Route path='drawmange/acceptance' element={<PerformAcceptance/>}/>
        <Route path='drawmange/handlejoining' element={<HandleJoining/>}/>
        <Route path='drawmange/allocation' element={<PrerformAllocation/>}/>
        <Route path='drawmange/drawspoolentry' element={<DrwaSpoolEntry/>}/>
        <Route path='drawmange/drawbrakanalysis' element={<DrawBrakAnalysis/>}/>
        <Route path='drawmange/drawshiftplan' element={<DrawShiftPlan/>}/>
        <Route path='drawmange/drawshiftreport' element={<DrawShiftReport/>}/>
        <Route path='drawmange/drawtimeloss' element={<DrawTimelossEntry/>}/>
        <Route path='prooftesting/ptentry' element={<PTEntry/>}/>
        <Route path='prooftesting/rewcolztentry' element={<RewColContainer/>}/>
        <Route path='prooftesting/ptallocation' element={<PTAllocationContainer/>}/>
        <Route path='prooftesting/ptreport' element={<PTReport/>}/>
        <Route path='prooftesting/ptbreakanalysis' element={<PTBreakAnalysis/>}/>
        <Route path='quality/qcentry' element={<QCEntryScreen/>}/>
        <Route path='quality/pventry' element={<PVEntry/>}/>
        <Route path='quality/d2issue' element={<D2Issue/>}/>
        <Route path='quality/d2gasconeentry' element={<D2gas_ConeEntry/>}/>
        <Route path='quality/d2recieving' element={<D2Recieving/>}/>
        <Route path='quality/h2egeing' element={<H2Ageing/>}/>
        <Route path='quality/qcinout' element={<QCInOut/>}/>
        <Route path='quality/customerallocation' element={<CustomerAllocation/>}/>
        <Route path='dispatch/dispatchchecking' element={<DispatchChecking/>}/>
        <Route path='dispatch/fibermakingcheck' element={<FiberMakingCheck/>}/>
        <Route path='dispatch/boxscanningentry' element={<BoxScanningEntry/>}/>
        <Route path='dispatch/fgfiberallocation' element={<FGFiberAllocation/>}/>
        <Route path='dispatch/fgrejection' element={<FGRejectinContainer/>}/>
        <Route path='dispatch/tcgeneration' element={<TCGenerationDashboard/>}/>
        <Route path='qa/macrobendC' element={<MacrobendContainer/>}/>
        <Route path='qa/trhtempentry' element={<TRHTempCycleContainer/>}/>
        <Route path='qa/trhcycle' element={<TRH_Cycle/>}/>
        <Route path='qa/shorttermentry' element={<ShortTermContainer/>}/>
        <Route path='qa/splicing' element={<Splicing/>}/>
        <Route path='qa/customer' element={<CustomerComplaintContainer/>}/>
        <Route path='customer/complaintstatus' element={<ComplaintStatusMonitor/>}/>
        <Route path='customer/complaintclosure' element={<ComplaintClosure/>}/>
        <Route path='underdev' element={<UnderDevelopment/>}/>
        <Route path='/*' element={<PageNotFound/>}/>
        </Route>
        </Routes>   
    </>
  )
}

export default App
