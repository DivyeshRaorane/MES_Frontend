import React, { useState } from 'react';
import { ClipboardList, Rotate3D, Dumbbell, TrendingUp } from 'lucide-react';
import ShortTermEntry       from '../pages/shortTermEntry/ui/shortTermEntry';
import ShortTermTwist       from '../pages/short_term_twist/ui/short_term_twist';
import ShortTermTensile     from '../pages/short_term_tensile/ui/short_term_tensile_test';
import ShortTermTensileLong from '../pages/short_term_tensile_long/ui/short_term_tensile_long';

const TABS = [
  { id: 'entry',       label: 'Short Term Entry',  icon: ClipboardList },
  { id: 'twist',       label: 'Twist Entry',        icon: Rotate3D      },
  { id: 'tensile',     label: 'Tensile Entry',      icon: Dumbbell      },
  { id: 'longTensile', label: 'Long Tensile Entry', icon: TrendingUp    },
];

const ShortTermContainer = () => {
  const [activeTab, setActiveTab] = useState('entry');

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Tab Bar ── */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 flex-shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'
              }`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Render Area ── */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'entry'       && <ShortTermEntry />}
          {activeTab === 'twist'       && <ShortTermTwist />}
          {activeTab === 'tensile'     && <ShortTermTensile />}
          {activeTab === 'longTensile' && <ShortTermTensileLong />}
        </div>

      </div>
    </div>
  );
};

export default ShortTermContainer;
