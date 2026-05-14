import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Clock } from 'lucide-react';
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
  '/quality/customerallocation':   'Customer Allocation',
  '/dispatch/dispatchchecking':    'Dispatch Checking',
  '/dispatch/fibermakingcheck':    'Fiber Making Check',
  '/dispatch/boxscanningentry':    'Box Scanning Entry',
  '/dispatch/fgfiberallocation':   'FG Fiber Allocation',
  '/dispatch/fgrejection':         'FG Rejection',
  '/dispatch/tcgeneration':        'TC Generation',
  '/qa/macrobendC':                'Macrobend',
  '/qa/trhtempentry':              'TRH & Temp Entry',
  '/qa/shorttermentry':            'Short Term Entry',
  '/qa/longtermentry':             'Long Term Entry',
  '/customer/complaint':           'Complaint Entry',
  '/customer/complaintstatus':     'Complaints',
  '/customer/complaintclosure':    'Complaint Closure',
  '/underdev':                     'Under Development',
};

/* ── Slim top bar ────────────────────────────────────────── */
const TopBar = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const title = ROUTE_TITLES[location.pathname] ?? 'MES Portal';

  const fmt = (d) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="h-9 flex-shrink-0 bg-slate-900 flex items-center justify-between px-4 border-b border-slate-700/60">
      {/* Page title */}
      <span className="text-[11px] font-bold text-white uppercase tracking-widest">{title}</span>

      {/* Right: clock + user */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock size={11} className="text-emerald-400" />
          <span className="text-[10px] font-mono font-semibold tracking-wider">{fmt(time)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">OP</div>
          <span className="text-[10px] font-semibold text-slate-300">OP-4012</span>
        </div>
      </div>
    </div>
  );
};

/* ── Layout ──────────────────────────────────────────────── */
const Layout = () => (
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

export default Layout;
