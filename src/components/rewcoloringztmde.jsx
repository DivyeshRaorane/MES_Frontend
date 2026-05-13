import React, { useState } from 'react';
import { Layers, Palette } from 'lucide-react';
import RewindingEntry from '../pages/rewColoringEntry/ui/rewindingEntry';
import ColouringEntry from '../pages/coloringEntry/ui/colringEntry';

const TABS = [
  { id: 'Rewinding', label: 'Rewinding', icon: Layers,  color: 'blue' },
  { id: 'Colouring', label: 'Colouring', icon: Palette, color: 'blue' },
];

const RewColContainer = () => {
  const [activeTab, setActiveTab] = useState('Rewinding');

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Tab Bar ── */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 flex-shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Render Area ── */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'Rewinding' && <RewindingEntry />}
          {activeTab === 'Colouring' && <ColouringEntry />}
        </div>

      </div>
    </div>
  );
};

export default RewColContainer;
