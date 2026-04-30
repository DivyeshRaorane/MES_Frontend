import React, { useState } from 'react';
import { 
  Send, 
  ChevronDown, 
  Plus, 
  Monitor,
  Activity,
  Box,
  Settings,
  Trash2,
  ChevronRight,
  Menu,
  X,
  ClipboardCheck,
  LayoutDashboard,
  BarChart3,
  FileText,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Zap,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { Outlet } from 'react-router-dom';
import logOut from '../pages/login/controller/user.slice'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';


const Sidebar = ()=>{
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState('');
      const [sidebarOpen, setSidebarOpen] = useState(true);
      const [drawMenuExpanded, setDrawMenuExpanded] = useState(true);
      const [proofMenuExpanded, setProofMenuExpanded] = useState(false);
      const [qualityMenuExpanded, setQualityMenuExpanded] = useState(false);
      const [gradingDispatchMenuExpanded, setGradingDispatchMenuExpanded] = useState(false);
      const [qaMenuExpanded, setQaMenuExpanded] = useState(false) 
      const [ccExpanded, setCCExpanded] = useState(false)

      const handleLogOut = ()=>{
        navigate("/")
        dispatch(logOut())
        
      }
       return (
          <div className="flex h-screen bg-[#f4f7f9] overflow-hidden">
            {/* --- Sidebar --- */}
            <aside className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col shadow-2xl z-[60] ${sidebarOpen ? 'w-64' : 'w-20'}`}>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between h-16">
                <div className={`flex items-center gap-3 overflow-hidden transition-all ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Activity size={20} /></div>
                  <span className="font-bold text-white whitespace-nowrap">MES PORTAL</span>
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400">
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
      
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" onClick={()=>navigate('/dashboard')} />
                
                {/* Draw Management */}
                <div className="pt-2">
                  <div 
                    onClick={() => {
                      if(!sidebarOpen) {
                        setSidebarOpen(true);
                      } else {
                        setDrawMenuExpanded(!drawMenuExpanded);
                        setCurrentPage('DrawManagement');
                        navigate('/drawmange')
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${currentPage.includes('Draw') || currentPage === 'Reports' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'} ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Box size={20} className={currentPage.includes('Draw') ? 'text-blue-400' : ''} />
                      {sidebarOpen && <span className="text-sm font-medium">Draw Management</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={14} className={`transition-transform ${drawMenuExpanded ? '' : '-rotate-90'}`} />}
                  </div>
      
                  {(drawMenuExpanded && sidebarOpen) && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-700">
                      <SubNavItem label="Preform Acceptance" active={location.pathname == '/drawmange/acceptance'} onClick={()=>navigate('/drawmange/acceptance')} />
                      <SubNavItem label="Handle Joining" active={location.pathname == '/drawmange/handlejoining'} onClick={()=>navigate('/drawmange/handlejoining')} />
                      <SubNavItem label="Preform Allocation" active={location.pathname == '/drawmange/allocation'} onClick={()=>navigate('/drawmange/allocation')} />
                      <SubNavItem label="Draw Spool Entry" active={location.pathname == '/drawmange/drawspoolentry'} onClick={()=>navigate('/drawmange/drawspoolentry')} />
                      <SubNavItem label="Draw Break Analysis" active={location.pathname == '/drawmange/drawbrakanalysis'} onClick={()=>navigate('/drawmange/drawbrakanalysis')} />
                      <SubNavItem label="Draw Plan Shift" active={location.pathname == '/drawmange/drawshiftplan'} onClick={()=>navigate('/drawmange/drawshiftplan')} />
                      <SubNavItem label="Reports" active={location.pathname == '/underdev'} onClick={()=>navigate('/underdev')} />
                    </div>
                  )}
                </div>
      
                {/* Proof Testing */}
                <div className="pt-1">
                  <div 
                    onClick={() => {
                      if(!sidebarOpen) {
                        setSidebarOpen(true);
                        setCurrentPage('ProofTesting');
                      } else {
                        setProofMenuExpanded(!proofMenuExpanded);
                        setCurrentPage('ProofTesting');
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${currentPage.includes('Proof') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'} ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className={currentPage.includes('Proof') ? 'text-purple-400' : ''} />
                      {sidebarOpen && <span className="text-sm font-medium">Proof Testing</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={14} className={`transition-transform ${proofMenuExpanded ? '' : '-rotate-90'}`} />}
                  </div>
      
                  {(proofMenuExpanded && sidebarOpen) && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-700">
                      <SubNavItem label="Proof Test Entry" active={location.pathname == '/prooftesting/ptentry'}  onClick={() => navigate('/prooftesting/ptentry')} />
                      <SubNavItem label="REW/COL Entry" active={location.pathname == '/prooftesting/rewcolztentry'}  onClick={() => navigate('/prooftesting/rewcolztentry')} />
                      <SubNavItem label="Allocation" active={location.pathname == '/prooftesting/ptallocation'}  onClick={() => navigate('/prooftesting/ptallocation')} />
                      <SubNavItem label="Break Analysis" active={location.pathname == '/prooftesting/ptbreakanalysis'}  onClick={() => navigate('/prooftesting/ptbreakanalysis')} />
                      <SubNavItem label="Reports" active={location.pathname== '/underdev'} onClick={() => navigate('/underdev')} />
                    </div>
                  )}
                </div>
      
                {/* Quality Parent Menu */}
                <div className="pt-1">
                  <div 
                    onClick={() => {
                      if(!sidebarOpen) {
                        setSidebarOpen(true);
                        setCurrentPage('QualityManagement');
                      } else {
                        setQualityMenuExpanded(!qualityMenuExpanded);
                        setCurrentPage('QualityManagement');
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${currentPage.includes('Quality') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'} ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className={currentPage.includes('Quality') ? 'text-emerald-400' : ''} />
                      {sidebarOpen && <span className="text-sm font-medium">Quality</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={14} className={`transition-transform ${qualityMenuExpanded ? '' : '-rotate-90'}`} />}
                  </div>
      
                  {(qualityMenuExpanded && sidebarOpen) && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-700">
                      <SubNavItem label="Quality Entry" active={location.pathname === '/quality/qcentry'} onClick={() => navigate('/quality/qcentry')} />
                      <SubNavItem label="PV Entry" active={location.pathname === '/quality/pventry'} onClick={() => navigate('/quality/pventry')} />
                      <SubNavItem label="D2 Issue" active={location.pathname === '/quality/d2issue'} onClick={() => navigate('/quality/d2issue')} />
                      <SubNavItem label="D2 Gas Entry" active={location.pathname === '/quality/d2gasconeentry'} onClick={() => navigate('/quality/d2gasconeentry')} />
                      <SubNavItem label="D2 Recieving" active={location.pathname === '/quality/d2recieving'} onClick={() => navigate('/quality/d2recieving')} />
                      <SubNavItem label="H2 Egeing" active={location.pathname === '/quality/h2egeing'} onClick={() => navigate('/quality/h2egeing')} />
                      <SubNavItem label="Quality Report" active={location.pathname== '/underdev'} onClick={() => navigate('/underdev')} />
                    </div>
                  )}
                </div>

                {/* Dispatch Parent Menu */}
                <div className="pt-1">
                  <div 
                    onClick={() => {
                      if(!sidebarOpen) {
                        setSidebarOpen(true);
                        setCurrentPage('GradingDispatch');
                      } else {
                        setGradingDispatchMenuExpanded(!gradingDispatchMenuExpanded);
                        setCurrentPage('GradingDispatch');
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${currentPage.includes('GradingDispatch') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'} ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className={currentPage.includes('GradingDispatch') ? 'text-emerald-400' : ''} />
                      {sidebarOpen && <span className="text-sm font-medium">Dispatch</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={14} className={`transition-transform ${gradingDispatchMenuExpanded ? '' : '-rotate-90'}`} />}
                  </div>
      
                  {(gradingDispatchMenuExpanded && sidebarOpen) && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-700">
                      <SubNavItem label="Box Scanning Entry" active={location.pathname === '/dispatch/boxscanningentry'} onClick={() => navigate('/dispatch/boxscanningentry')} />
                      <SubNavItem label="FG Fiber Allocation" active={location.pathname === '/dispatch/fgfiberallocation'} onClick={() => navigate('/dispatch/fgfiberallocation')} />
                      <SubNavItem label="FG Rejection" active={location.pathname === '/dispatch/fgrejection'} onClick={() => navigate('/dispatch/fgrejection')} />
                      <SubNavItem label="TC Generation" active={location.pathname === '/dispatch/tcgeneration'} onClick={() => navigate('/dispatch/tcgeneration')} />
                     </div>
                  )}
                </div>

                {/* QA Parent Menu */}
                <div className="pt-1">
                  <div 
                    onClick={() => {
                      if(!sidebarOpen) {
                        setSidebarOpen(true);
                        setCurrentPage('QA');
                      } else {
                        setQaMenuExpanded(!qaMenuExpanded);
                        setCurrentPage('QA');
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${currentPage.includes('QA') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'} ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className={currentPage.includes('QA') ? 'text-emerald-400' : ''} />
                      {sidebarOpen && <span className="text-sm font-medium">QA</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={14} className={`transition-transform ${qaMenuExpanded ? '' : '-rotate-90'}`} />}
                  </div>
      
                  {(qaMenuExpanded && sidebarOpen) && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-700">
                      <SubNavItem label="Macrobend" active={location.pathname === '/qa/macrobendC'} onClick={() => navigate('/qa/macrobendC')} />
                      <SubNavItem label="TRH&TEMP Entry" active={location.pathname === '/qa/trhtempentry'} onClick={() => navigate('/qa/trhtempentry')} />
                      <SubNavItem label="Short Term Entry" active={location.pathname === '/qa/shorttermentry'} onClick={() => navigate('/qa/shorttermentry')} />
                      <SubNavItem label="Long Term Entry" active={location.pathname === '/qa/longtermentry'} onClick={() => navigate('/qa/longtermentry')} />
                      </div>
                  )}
                </div>

                {/* Customer Complaint */}
                <div className="pt-1">
                  <div 
                    onClick={() => {
                      if(!sidebarOpen) {
                        setSidebarOpen(true);
                        setCurrentPage('CustomerComplaint');
                      } else {
                        setCCExpanded(!ccExpanded);
                        setCurrentPage('CustomerComplaint');
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${currentPage.includes('CustomerComplaint') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'} ${!sidebarOpen ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className={currentPage.includes('CustomerComplaint') ? 'text-emerald-400' : ''} />
                      {sidebarOpen && <span className="text-sm font-medium">Customer Complaint</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={14} className={`transition-transform ${ccExpanded ? '' : '-rotate-90'}`} />}
                  </div>
      
                  {(ccExpanded && sidebarOpen) && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-slate-700">
                      <SubNavItem label="Compalint Entry" active={location.pathname === '/customer/complaint'} onClick={() => navigate('/customer/complaint')} />
                      <SubNavItem label="Complaints" active={location.pathname === '/customer/complaintstatus'} onClick={() => navigate('/customer/complaintstatus')} />
                      <SubNavItem label="Closure" active={location.pathname === '/customer/complaintclosure'} onClick={() => navigate('/customer/complaintclosure')} />
                      </div>
                  )}
                </div>
      
                <NavItem icon={<Settings size={20}/>} label="Setting" collapsed={!sidebarOpen} onClick={() => setCurrentPage('Settings')} active={currentPage === 'Settings'} />
                <NavItem icon={<LogOut size={20}/>} label="Logout" collapsed={!sidebarOpen} onClick={handleLogOut} />
              </nav>
      
              <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">OP</div>
                  {sidebarOpen && <div className="flex-1 min-w-0"><p className="text-xs font-bold text-white">OP-4012</p><p className="text-[10px] text-slate-500">Draw Operator</p></div>}
                </div>
              </div>
            </aside>
          </div>
        );
}

const NavItem = ({ icon, label, active, collapsed, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'} ${collapsed ? 'justify-center' : ''}`}>
    {icon}
    {!collapsed && <span className="text-sm font-medium">{label}</span>}
  </div>
);

const SubNavItem = ({ label, active, onClick }) => (
  <div onClick={onClick} className={`py-2 px-4 text-[11px] cursor-pointer transition-colors relative ${active ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-blue-400 rounded-r-full" />}
    {label}
  </div>
);

export default Sidebar