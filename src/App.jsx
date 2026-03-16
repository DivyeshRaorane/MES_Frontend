import './App.css'

import { Route,Routes } from 'react-router'
import LoginPage from './pages/login/ui/login'
import Layout from './components/layout'
import Dashboard from './pages/dashboard/ui/dashboard'
import PerformWipAcceptance from './pages/performWip/ui/performWitAcce'
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
import ShortTermEntry from './pages/shortTermEntry/ui/shortTermEntry'
import LongTermEntry from './pages/longTermEntry/ui/longTermEntry'
import ComplaintRegister from './pages/complaintReg/ui/cRegister'
import ComplaintStatusMonitor from './pages/complaintTable/ui/complaintTable'
import ComplaintClosure from './pages/complaintClosure/ui/complainClosure'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route element={<Layout/>}>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='drawmange' element={<DrawManagementPage/>}/>
        <Route path='drawmange/allowance' element={<PerformWipAcceptance/>}/>
        <Route path='drawmange/drawspoolentry' element={<DrwaSpoolEntry/>}/>
        <Route path='drawmange/drawbrakanalysis' element={<DrawBrakAnalysis/>}/>
        <Route path='drawmange/drawshiftplan' element={<DrawShiftPlan/>}/>
        <Route path='drawmange/gwlperformjoinhandling' element={<GWLPerformHandleJoining/>}/>
        <Route path='prooftesting/ptentry' element={<PTEntry/>}/>
        <Route path='prooftesting/rewcolztentry' element={<RewColContainer/>}/>
        <Route path='prooftesting/ptallocation' element={<PTAllocationContainer/>}/>
        <Route path='prooftesting/ptbreakanalysis' element={<PTBreakAnalysis/>}/>
        <Route path='quality/qcentry' element={<QCEntryScreen/>}/>
        <Route path='quality/pventry' element={<PVEntry/>}/>
        <Route path='quality/d2egeing' element={<D2Egeing/>}/>
        <Route path='quality/h2egeing' element={<H2Ageing/>}/>
        <Route path='dispatch/boxscanningentry' element={<BoxScanningEntry/>}/>
        <Route path='dispatch/fgfiberallocation' element={<FGFiberAllocation/>}/>
        <Route path='dispatch/fgrejection' element={<FGRejectinContainer/>}/>
        <Route path='dispatch/tcgeneration' element={<TCGenerationDashboard/>}/>
        <Route path='qa/macrobendC' element={<MacrobendContainer/>}/>
        <Route path='qa/trhtempentry' element={<TRHTempCycleContainer/>}/>
        <Route path='qa/shorttermentry' element={<ShortTermEntry/>}/>
        <Route path='qa/longtermentry' element={<LongTermEntry/>}/>
        <Route path='customer/complaint' element={<ComplaintRegister/>}/>
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
