import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Box, ShieldCheck, CheckCircle2,
  Truck, MessageSquareWarning, Settings, LogOut,
  LayoutDashboard, ChevronRight, Shield,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../pages/login/controller/user.slice';

/* ── Menu definition ─────────────────────────────────────── */
const MENU = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    color: 'text-blue-400',
  },
  {
    key: 'draw',
    label: 'Draw Management',
    icon: Box,
    color: 'text-blue-400',
    children: [
      { label: 'SAP Entry Temp', path: '/drawmange/prefromentrysap' },
      { label: 'Preform Acceptance', path: '/drawmange/acceptance' },
      { label: 'Handle Joining',     path: '/drawmange/handlejoining' },
      { label: 'Preform Allocation', path: '/drawmange/allocation' },
      { label: 'Draw Spool Entry',       path: '/drawmange/drawspoolentry' },
      { label:  'Draw/PT Break Analysis', path: '/drawmange/drawbrakanalysis'},
      { label: 'Draw Shift Plan',       path: '/drawmange/drawshiftplan'},
      { label: 'Draw Shift Report',     path: '/drawmange/drawshiftreport'},
      { label: 'Draw Timeloss Entry',   path: '/drawmange/drawtimeloss'},
      { label: 'Reports',               path: '/drawmange/reports' },
    ],
  },
  {
    key: 'proof',
    label: 'Proof Testing',
    icon: ShieldCheck,
    color: 'text-purple-400',
    children: [
      { label: 'PT Allocation',   path: '/prooftesting/ptallocation' },
      { label: 'PT Entry',        path: '/prooftesting/ptentry' },
      { label: 'REW/COL Entry',   path: '/prooftesting/rewcolztentry' },
      { label: 'Reports',         path: '/prooftesting/ptreport' },
    ],
  },
  {
    key: 'quality',
    label: 'Quality',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    children: [
      { label: 'Quality Entry',       path: '/quality/qcentry' },
      { label: 'Physical Verification ',            path: '/quality/pventry' },
      { label: 'D2 Management',     path: '/quality/d2issue' },
      { label: 'H2 Ageing',           path: '/quality/h2egeing' },
      { label: 'QC Out',             path: '/quality/qcinout' },
      { label: 'Report',      path: '/underdev' },
    ],
  },
  {
    key: 'qa',
    label: 'Quality Assuranc',
    icon: MessageSquareWarning,
    color: 'text-rose-400',
    children: [
      { label: 'Temperature', path: '/qa/trhtempentry'},
      { label: 'TRH Cycle',   path: '/qa/trhcycle'},
      { label: 'HTHA Test',   path: '/qa/hthatest'},
      { label: 'Water Immersion', path: '/qa/waterimmersion'},
      { label: 'Accelerated Ageing', path: '/qa/acceleratedageing'},
      { label: 'Splicing', path: '/qa/splicing'},
      { label: 'Short Term Entry', path: '/qa/shorttermentry'},
      { label: 'Customer Complaint',  path: '/qa/customer' },
    ],
  },
  {
    key: 'finishgoods',
    label: 'Finish Goods',
    icon: Truck,
    color: 'text-orange-400',
    children: [
      { label: 'Modula IN/OUT', path: '/fg/modulainout'},
      {/*{ label: 'Dispatch Checking',   path: '/dispatch/dispatchchecking' },
      { label: 'Fiber Make Checking', path: '/dispatch/fibermakingcheck' },
      { label: 'Box Scanning Entry',  path: '/dispatch/boxscanningentry' },*/},
      { label: 'TC Generation',         path: '/fg/tcgeneration' },
      { label: 'Order Register',        path: '/fg/orderregister' },
      { label: 'FG Fiber Rejection',    path: '/fg/fiberrejection' },
      { label: 'Packing List',          path: '/fg/packinglist' },
      { label: 'Customer Allocation', path: '/fg/customerallocation' },
    ],
  },
 
  {
    key: 'admin',
    label: 'Admin',
    icon: Shield,
    color: 'text-slate-400',
    children: [
      { label: 'General Admin',    path: '/admin/general' },
      { label: 'Draw Management',  path: '/admin/drawmanagement' },
      { label: 'Quality Admin',    path: '/admin/quality' },
      { label: 'FG / Tray Mgmt',  path: '/admin/traymanagement' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/underdev',
    color: 'text-slate-400',
  },
];

/* ── Department → Menu Key Mapping ── */
const DEPT_MENU_MAP = {
  'Draw': ['draw'],
  'Proof Testing': ['proof'],
  'Quality': ['quality'],
  'Quality Assurance': ['qa'],
  'Finish Goods': ['finishgoods'],
  'All': ['draw', 'proof', 'quality', 'qa', 'finishgoods', 'admin', 'settings'],
};

/* ── Sidebar ─────────────────────────────────────────────── */
const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const user = useSelector(state => state.auth?.user);

  // Determine which menu keys are allowed
  const getAllowedMenuKeys = () => {
    if (!user) return ['dashboard']; // Not logged in — only dashboard
    if (user.role === 'admin') return null; // Admin sees everything
    // Regular user — filter by departments
    const departments = user.departments || [];
    const allowedKeys = new Set(['dashboard']); // Everyone gets dashboard
    departments.forEach(dept => {
      const keys = DEPT_MENU_MAP[dept] || [];
      keys.forEach(k => allowedKeys.add(k));
    });
    return [...allowedKeys];
  };

  const allowedKeys = getAllowedMenuKeys();

  // Filter MENU based on role/departments
  const visibleMenu = allowedKeys === null
    ? MENU // Admin sees all
    : MENU.filter(item => allowedKeys.includes(item.key));

  // which drawer is open (key string | null)
  const [openDrawer, setOpenDrawer] = useState(null);
  const drawerRef = useRef(null);

  // close drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setOpenDrawer(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleIconClick = (item) => {
    if (item.path) {
      navigate(item.path);
      setOpenDrawer(null);
    } else {
      setOpenDrawer(prev => prev === item.key ? null : item.key);
    }
  };

  const handleSubClick = (path) => {
    navigate(path);
    setOpenDrawer(null);
  };

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/')
  };

  const activeDrawer = visibleMenu.find(m => m.key === openDrawer);

  return (
    <div ref={drawerRef} className="relative flex h-screen z-50">

      {/* ── Icon rail ── */}
      <aside className="w-14 bg-slate-900 flex flex-col items-center py-3 gap-1 shadow-2xl flex-shrink-0">

        {/* Logo */}
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-3 flex-shrink-0">
          <Activity size={16} className="text-white" />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-1 flex-1 w-full px-1.5">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const isOpen   = openDrawer === item.key;
            const isActive = item.path
              ? location.pathname === item.path
              : item.children?.some(c => location.pathname === c.path);

            return (
              <Tooltip key={item.key} label={item.label}>
                <button
                  onClick={() => handleIconClick(item)}
                  className={`
                    w-full flex items-center justify-center p-2 rounded-lg transition-all duration-150
                    ${isOpen   ? 'bg-blue-600 text-white'  : ''}
                    ${isActive && !isOpen ? 'bg-slate-700 ' + item.color : ''}
                    ${!isOpen && !isActive ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-200' : ''}
                  `}
                >
                  <Icon size={18} />
                </button>
              </Tooltip>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <Tooltip label="Logout">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-rose-900/40 hover:text-rose-400 transition-all mx-1.5 mb-1"
          >
            <LogOut size={18} />
          </button>
        </Tooltip>

        {/* User avatar */}
      </aside>

      {/* ── Drawer panel (overlay, not pushing content) ── */}
      {openDrawer && activeDrawer?.children && (
        <div className="absolute left-14 top-0 h-full w-52 bg-slate-800 shadow-2xl flex flex-col border-r border-slate-700 animate-in slide-in-from-left-2 duration-150">

          {/* Drawer header */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2.5 flex-shrink-0">
            {React.createElement(activeDrawer.icon, { size: 15, className: activeDrawer.color })}
            <span className="text-xs font-bold text-white uppercase tracking-wider">{activeDrawer.label}</span>
          </div>

          {/* Sub-items */}
          <nav className="flex-1 py-2 overflow-y-auto">
            {activeDrawer.children.map((child) => {
              const isActive = location.pathname === child.path;
              return (
                <button
                  key={child.path}
                  onClick={() => handleSubClick(child.path)}
                  className={`
                    w-full text-left px-4 py-2 text-[11px] font-medium transition-all flex items-center gap-2
                    ${isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                      : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border-l-2 border-transparent'}
                  `}
                >
                  <ChevronRight size={11} className={isActive ? 'text-blue-400' : 'text-slate-600'} />
                  {child.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};

/* ── Tooltip wrapper ─────────────────────────────────────── */
const Tooltip = ({ label, children }) => (
  <div className="relative group w-full">
    {children}
    <div className="
      pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2
      bg-slate-700 text-white text-[10px] font-semibold px-2 py-1 rounded-md
      whitespace-nowrap shadow-lg
      opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100
      transition-all duration-150 z-[100]
    ">
      {label}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
    </div>
  </div>
);

export default Sidebar;
