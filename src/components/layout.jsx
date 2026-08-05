import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import Sidebar from './sidebar';

/* ── Route → title map ───────────────────────────────────── */
const ROUTE_TITLES = {
  '/dashboard':                    'Dashboard',
  '/drawmange':                    'Draw Management',
  '/drawmange/acceptance':         'Preform Acceptance',
  '/drawmange/handlejoining':      'Handle Joining',
  '/drawmange/allocation':         'Preform Allocation',
  '/drawmange/drawspoolentry':     'Draw Spool Entry',
  '/drawmange/drawbrakanalysis':   'Draw Break Analysis',
  '/drawmange/drawshiftplan':      'Draw Shift Plan',
  '/drawmange/drawshiftreport':    'Draw Shift Report',
  '/drawmange/drawtimeloss':       'Draw Timeloss Entry',
  '/prooftesting/ptallocation':    'PT Allocation',
  '/prooftesting/ptentry':         'PT Entry',
  '/prooftesting/ptbreakanalysis': 'PT Break Analysis',
  '/prooftesting/rewcolztentry':   'REW / COL Entry',
  '/prooftesting/ptreport':        'PT Report',
  '/quality/qcentry':              'Quality Entry',
  '/quality/pventry':              'PV Entry',
  '/quality/d2issue':              'D2 Issue',
  '/quality/d2gasconeentry':       'D2 Gas Cone Entry',
  '/quality/d2recieving':          'D2 Receiving',
  '/quality/h2egeing':             'H2 Ageing',
  '/quality/qcinout':              'QC In / Out',
  '/quality/customerallocation':   'Customer Allocation',
  '/dispatch/dispatchchecking':    'Dispatch Checking',
  '/dispatch/fibermakingcheck':    'Fiber Making Check',
  '/dispatch/boxscanningentry':    'Box Scanning Entry',
  '/dispatch/fgfiberallocation':   'FG Fiber Allocation',
  '/dispatch/fgrejection':         'FG Rejection',
  '/dispatch/tcgeneration':        'TC Generation',
  '/dispatch/fgfiberrejection':    'FG Fiber Rejection',
  '/dispatch/packinglist':         'Packing List Generation',
  '/qa/macrobendC':                'Macrobend',
  '/qa/trhtempentry':              'TRH & Temp Entry',
  '/qa/trhcycle':                  'TRH Cycle',
  '/qa/shorttermentry':            'Short Term Entry',
  '/customer/complaint':           'Complaint Entry',
  '/customer/complaintstatus':     'Complaints',
  '/customer/complaintclosure':    'Complaint Closure',
  '/admin/users':                  'User Management',
  '/admin/usercreation':           'Create User',
  '/admin/reportbuilder':          'Report Builder',
  '/admin/reportbuilder/wizard':   'Report Builder Wizard',
  '/dynamicreports':               'Dynamic Reports',
  '/underdev':                     'Under Development',
};

/* ── Slim top bar ────────────────────────────────────────── */
const TopBar = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const user = useSelector(state => state.auth?.user);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const title = ROUTE_TITLES[location.pathname] ?? 'MES Portal';
  const userName = user?.emp_name || user?.name || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const fmt = (d) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="h-9 flex-shrink-0 bg-slate-900 flex items-center justify-between px-4 border-b border-slate-700/60">
      {/* Page title */}
      <span className="text-[11px] font-bold text-white uppercase tracking-widest">{title}</span>

      {/* Right: clock + user */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-white">
          <Clock size={11} className="text-emerald-400" />
          <span className="text-[10px] font-mono font-semibold tracking-wider">{fmt(time)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">{userInitials}</div>
          <span className="text-[10px] font-semibold text-white">{userName}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Layout ──────────────────────────────────────────────── */
const Layout = () => {
  const navigate = useNavigate();
  const token = useSelector(state => state.auth?.token);

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
