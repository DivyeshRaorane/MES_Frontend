import { useState } from 'react';
import { ArrowLeft, ClipboardList, PackagePlus } from 'lucide-react';
import IncreaseStockTab from './IncreaseStockTab';

/**
 * Tab registry. To add a new entry service (e.g. "Reverse Entry"), create its
 * component and append one object here. No other change is needed.
 */
const ENTRY_TABS = [
  { key: 'increase_stock', label: 'Increase Stock', icon: PackagePlus, component: IncreaseStockTab },
  // { key: 'reverse_entry', label: 'Reverse Entry', icon: Undo2, component: ReverseEntryTab },
];

/* ══════════════════════════════════════════════════════════
   ENTRY SERVICES PANEL (tabbed shell)
   ══════════════════════════════════════════════════════════ */
const EntryServicesPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState(ENTRY_TABS[0].key);
  const current = ENTRY_TABS.find((t) => t.key === activeTab) || ENTRY_TABS[0];
  const ActiveComponent = current.component;

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Top bar */}
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/60 flex items-center gap-3 flex-shrink-0">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 text-[9px] text-blue-600 font-bold hover:underline">
            <ArrowLeft size={11} /> Back to Admin
          </button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-100">
            <ClipboardList size={14} />
          </div>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Entry Services</span>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Entry services"
          className="px-4 pt-2 border-b border-slate-200 flex items-center gap-1 flex-shrink-0 overflow-x-auto">
          {ENTRY_TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = tab.key === current.key;
            return (
              <button key={tab.key} type="button" role="tab" id={`entry-tab-${tab.key}`}
                aria-selected={selected} aria-controls={`entry-panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wide border-b-2 -mb-px whitespace-nowrap transition-all ${
                  selected
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}>
                <Icon size={12} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active tab content */}
        <div role="tabpanel" id={`entry-panel-${current.key}`} aria-labelledby={`entry-tab-${current.key}`}
          className="flex-1 overflow-y-auto px-4 py-4">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default EntryServicesPanel;
