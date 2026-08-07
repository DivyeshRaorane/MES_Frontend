import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../pages/login/controller/user.slice'
import preformDataReducer from '../components/preformAcceptance/controller/preform_data.slice'
import preformAcceptanceReducer from '../components/preformAcceptance/controller/preform_acceptance.slice'
import getPreformForHandleJoinReducer from '../pages/handleJoining/controller/getPreformForHandleJoin.slice'
import handleJoinReducer from '../pages/handleJoining/controller/handle_join.slice'
import getPreformForAllocation from '../pages/preformAllocation/controller/get_preform_for_allocation.slice'
import preformAllocationReducer from '../pages/preformAllocation/controller/preform_allocation.slice'
import towersForAllocationReducer from '../pages/draw_tower/controller/get_tower_for_allocation.slice'
import recentAllocatedPreformReducer from '../pages/preformAllocation/controller/recent_allocated_preform.slice'
import preformEntrySapReducer from '../pages/preform_enrty_SAP/controller/preform_entry_SAP.slice'
import drawEntryReducer from '../pages/drawSpoolEntry/controller/draw_spool_entry.slice'
import preformByTowerReducer from '../pages/drawSpoolEntry/controller/preform_by_tower.slice'
import getUsersReducer from '../pages/Admin_Folder/user_management/user/controller/getUser.slice'
import ptAllocationReducer from '../pages/ptAllocation/controller/pt_allocation.slice'
import ptAllocatedSpoolReducer from '../pages/ptRunnigTable/controller/pt_allocated_spool.controller'
import ptEntryReducer from '../pages/proofTestEntry/controller/pt_entry.slice'
import ptFlawsReducer from '../pages/proofTestEntry/controller/get_pt_flaws.slice' 
import ptLogsReducer from '../pages/proofTestEntry/controller/get_pt_logs.slice'

// Dynamic Reports Module
import reportBuilderReducer from '../pages/DynamicReports/controller/reportBuilder.slice'
import dynamicReportsReducer from '../pages/DynamicReports/controller/dynamicReports.slice'

// Function Reports Module
import functionReportsReducer from '../pages/FunctionReports/controller/functionReports.slice'



export const store = configureStore({
    reducer:{
        auth:authReducer,
        preformData:preformDataReducer,
        preformAcceptance:preformAcceptanceReducer,
        preformForHandleJoin:getPreformForHandleJoinReducer,
        handleJoin:handleJoinReducer,
        preformForAllocation:getPreformForAllocation,
        preformAllocation:preformAllocationReducer,
        towersForAllocation:towersForAllocationReducer,
        recentAllocatedPreform:recentAllocatedPreformReducer,
        preformEntrySap: preformEntrySapReducer,
        drawSpoolEntry: drawEntryReducer,
        preformByTower: preformByTowerReducer,
        getUsers: getUsersReducer,
        ptAllocation: ptAllocationReducer,
        ptAllocatedSpool: ptAllocatedSpoolReducer,
        ptEntry: ptEntryReducer,
        ptFlaws: ptFlawsReducer,
        ptLogs: ptLogsReducer,
        reportBuilder: reportBuilderReducer,
        dynamicReports: dynamicReportsReducer,
        functionReports: functionReportsReducer,
    }
})