import React, { useState } from 'react';
import { LogOut, CheckCircle, Award } from 'lucide-react';

/**
 * High-density data field for the sidebar
 */
const SidebarField = ({ label, value }) => (
  <div className="flex flex-col mb-1.5">
    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight leading-tight">{label}</label>
    <input 
      type="text" 
      className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-0.5 outline-none focus:border-blue-400" 
      value={value} 
      readOnly 
    />
  </div>
);

/**
 * Standard input for parameter groups
 */
const ParamField = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2 mb-1 justify-between">
    <label className="text-[10px] text-slate-600 font-medium leading-tight flex-1">{label}</label>
    <input 
      type="text" 
      className="w-20 text-[11px] border border-slate-300 rounded px-1.5 py-0.5 focus:border-blue-500 outline-none" 
      value={value} 
      onChange={onChange}
    />
  </div>
);

export const QCEntryScreen = () => {
  return (
    <div className="bg-[#f1f5f9] min-h-screen font-sans text-slate-800 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex justify-between items-center shrink-0">
        <h1 className="text-lg font-bold text-[#1e40af] tracking-tight">QC Entry Screen</h1>
        <button className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 transition-all">
          <LogOut size={14} /> Exit
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        {/* Left Sidebar - Primary ID Info */}
        <div className="w-56 bg-white border border-slate-200 rounded-lg p-3 overflow-y-auto shadow-sm shrink-0 custom-scrollbar">
          <SidebarField label="Fiber ID" value="" />
          <SidebarField label="PT Id" value="" />
          <SidebarField label="Selected Fiber Id" value="" />
          <SidebarField label="Preform ID" value="" />
          <SidebarField label="Tower No" value="" />
          <SidebarField label="Draw Barcode ID" value="" />
          <SidebarField label="PT Length (Km)" value="" />
          <SidebarField label="Spool ID" value="" />
          <SidebarField label="OTDR Length (m)" value="" />
          <SidebarField label="Avg.LSA 1310 (dB/Km)" value="" />
          <SidebarField label="Avg.LSA 1550 (dB/Km)" value="" />
          <SidebarField label="Max 1310 TB (dB/Km)" value="" />
          <SidebarField label="Max 1550 TB (dB/Km)" value="" />
          <SidebarField label="Atten Uni 1310 (dB)" value="" />
          <SidebarField label="Atten Uni 1550 (dB)" value="" />
          <SidebarField label="MFD Uni 1310 (dB)" value="" />
          <SidebarField label="MFD Uni 1550 (dB)" value="" />
          <SidebarField label="OH (1383) (dB/Km)" value="" />
          <SidebarField label="Atten 1625 (dB/Km)" value="" />
          <SidebarField label="Step 1310 Max" value="" />
          <SidebarField label="Step 1550 Max" value="" />
          <SidebarField label="Max 1625 TB (dB/Km)" value="" />
          <SidebarField label="Grade" value="" />
          
          <div className="mt-4 pt-3 border-t border-slate-200">
             <SidebarField label="Temp Grade" value="" />
             <button className="w-full py-1.5 bg-orange-500 text-white text-[11px] font-black uppercase rounded shadow-sm hover:bg-orange-600 transition-colors">
                Grade
             </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* Machine Info Top Bar */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-blue-800 mb-2 uppercase">Machine Name</h3>
            <div className="grid grid-cols-5 gap-4">
              {['PT. No', 'OTDR No.', 'Spec. No', 'CD No.', 'MBEND No.'].map(label => (
                <div key={label} className="flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 mb-0.5">{label}</label>
                  <input type="text" className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Parameters Grid - Height adjusted to fit content without internal scrollbars */}
          <div className="grid grid-cols-4 gap-3 items-start">
            {/* Category: Coating */}
            <div className="bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm">
              <div className="bg-slate-50 border-b px-3 py-1.5"><h4 className="text-[11px] font-bold text-blue-800 uppercase tracking-tight">Coating</h4></div>
              <div className="p-3">
                {['Sec Coat Dia Top (um)', 'Sec Coat Dia Bot (um)', 'Sec Conc Top (um)', 'Sec Conc Bot (um)', 'Coat Ovality Top (um)', 'Coat Ovality Bot (um)', 'Pri Coat Dia Top (um)', 'Pri Coat Dia Bot (um)', 'Pri Conc Top (um)', 'Pri Conc Bot (um)', 'Fiber Color', 'Color Dia Top', 'Ring Type'].map(l => <ParamField key={l} label={l} />)}
              </div>
            </div>

            {/* Category: Geometry */}
            <div className="bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm">
              <div className="bg-slate-50 border-b px-3 py-1.5"><h4 className="text-[11px] font-bold text-blue-800 uppercase tracking-tight">Geometry</h4></div>
              <div className="p-3">
                {['Clad Dia Top (um)', 'Clad Dia Bot (um)', 'Clad Ovl Top (%)', 'Clad Ovl Bot (%)', 'CCC Top (um)', 'CCC Bot (um)', 'Core Dia Top (um)', 'Core Dia Bot (um)', 'Core Ovl Top (%)', 'Core Ovl Bot (%)', 'Fiber Curl Top', 'Fiber Curl Bot'].map(l => <ParamField key={l} label={l} />)}
              </div>
            </div>

            {/* Category: CD/PMD */}
            <div className="bg-white border border-slate-200 rounded-lg flex flex-col shadow-sm">
              <div className="bg-slate-50 border-b px-3 py-1.5"><h4 className="text-[11px] font-bold text-blue-800 uppercase tracking-tight">CD/PMD</h4></div>
              <div className="p-3">
                {['ZD Wave Len(nm)', 'Slope (ps/nm2)', 'CD 1285 (ps/nm.km)', 'CD 1550 (ps/nm.km)', 'CD 1625 (ps/nm.km)', 'CD 1270', 'PMD 1310 (ps/root km)', 'PMD 1550 (ps/root km)', 'ZTPMD 1550', 'Attn 1490', 'MFD_T 1310 (um)', 'MFD_B 1310 (um)', 'MFD_T 1550 (um)', 'MFD_B 1550 (um)', 'CableCutoff T', 'GSN_T 1310', 'GSN_B 1310', 'GSN_T 1550', 'GSN_B 1550', 'Cutoff Top (nm)', 'Cutoff Bot (nm)'].map(l => <ParamField key={l} label={l} />)}
              </div>
            </div>

            {/* Category: M-BEND & Sidebar Fields */}
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
                <div className="bg-slate-50 border-b px-3 py-1.5 flex justify-center"><h4 className="text-[11px] font-bold text-blue-800 uppercase tracking-tight">M-BEND</h4></div>
                <table className="w-full text-[10px] border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="p-1 border-r text-center">TRN</th>
                      <th className="p-1 border-r text-center">1310</th>
                      <th className="p-1 border-r text-center">1550</th>
                      <th className="p-1 text-center">1625</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {['10', '15', '20', '30', '32'].map(val => (
                      <tr key={val}>
                        <td className="p-1 border-r text-center font-bold bg-slate-50/50">{val}</td>
                        <td className="p-1 border-r"><input type="text" className="w-full outline-none text-center" /></td>
                        <td className="p-1 border-r"><input type="text" className="w-full outline-none text-center" /></td>
                        <td className="p-1"><input type="text" className="w-full outline-none text-center" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-1.5 shadow-sm">
                 <SidebarField label="Parent Barcode Id" value="" />
                 <SidebarField label="REW.No" value="" />
                 <SidebarField label="Col No." value="" />
                 <SidebarField label="OTDR Date" value="" />
                 <SidebarField label="Product Type" value="" />
              </div>
            </div>
          </div>

          {/* Bottom Actions Form */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-md shrink-0">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Fail Reason</label>
                  <select className="text-xs border border-slate-300 rounded px-2 py-1 bg-white outline-none">
                    <option>select</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">OTDR Opr</label>
                  <input type="text" className="text-xs border border-slate-300 rounded px-2 py-1" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Rew Reason</label>
                  <select className="text-xs border border-slate-300 rounded px-2 py-1 bg-white outline-none">
                    <option>select</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">CD Opr</label>
                  <input type="text" className="text-xs border border-slate-300 rounded px-2 py-1" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Sub Reason</label>
                  <select className="text-xs border border-slate-300 rounded px-2 py-1 bg-white outline-none">
                    <option>select</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Spec Opr</label>
                  <input type="text" className="text-xs border border-slate-300 rounded px-2 py-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Fiber Type</label>
                  <input type="text" className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" readOnly />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Mbend Opr</label>
                  <input type="text" className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" readOnly />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rew Reason</label>
                <input type="text" className="text-xs border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rew Sub Reason</label>
                <input type="text" className="text-xs border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Fail Reason</label>
                <input type="text" className="text-xs border border-slate-300 rounded px-2 py-1" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Final Length(km)</label>
                <input type="text" className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1" readOnly />
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Remarks</label>
                  <input type="text" className="text-xs border border-slate-300 rounded px-2 py-1 w-full" />
               </div>
               <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white text-xs font-black uppercase rounded shadow-lg hover:bg-rose-600 transition">
                    <Award size={14} /> M Grade
                  </button>
                  <button className="flex items-center gap-2 px-10 py-2 bg-emerald-600 text-white text-xs font-black uppercase rounded shadow-lg hover:bg-emerald-700 transition">
                    <CheckCircle size={14} /> Submit
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding/Info */}
      <div className="bg-[#1e293b] text-white px-4 py-1.5 flex justify-between items-center text-[10px] font-medium tracking-wide shrink-0">
        <span>QC MODULE V4.2</span>
        <span className="opacity-50 italic uppercase tracking-widest">Validation active</span>
        <span>SERVER STATUS: ONLINE</span>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default QCEntryScreen;