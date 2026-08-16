import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import D2Issue from './d2egeing';
import D2GasConeEntry from '../../d2gas_coneEntry/ui/d2gas_cone_entry';
import D2Recieving from '../../d2_Recieving/ui/d2_Recieving';
import D2Batches from './d2Batches';

const TABS = [
  { key: 'issue', label: 'D2 Issue' },
  { key: 'gas', label: 'D2 Gas Entry' },
  { key: 'receiving', label: 'D2 Receiving' },
  { key: 'batches', label: 'D2 Batches' },
];

const D2Combined = () => {
  const [activeTab, setActiveTab] = useState('issue');

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* ── Tab bar ── */}
        <div className="flex items-center border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 px-4 flex-shrink-0">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FlaskConical size={14} className="text-white" />
            </div>
            <span className="text-xs font-bold text-slate-800">D2 Management</span>
          </div>
          {TABS.map(t => (
            <button key={t.key} type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === t.key
                  ? 'border-blue-600 text-blue-700 bg-white/60'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'issue' && <D2IssueInner />}
          {activeTab === 'gas' && <D2GasInner />}
          {activeTab === 'receiving' && <D2ReceivingInner />}
          {activeTab === 'batches' && <D2BatchesInner />}
        </div>

      </div>
    </div>
  );
};

/* ── Wrapper components that strip the outer chrome from each page ── */
/* Each original component has its own outer div with h-full, m-2, rounded card etc.
   We wrap them so they render inside our tab container without double-nesting */

const D2IssueInner = () => <div className="h-full overflow-hidden [&>div]:h-full [&>div]:m-0 [&>div]:rounded-none [&>div]:shadow-none [&>div]:border-0 [&>div>div]:m-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&>div>div]:border-0"><D2Issue /></div>;
const D2GasInner = () => <div className="h-full overflow-hidden [&>div]:h-full [&>div]:m-0 [&>div]:rounded-none [&>div]:shadow-none [&>div]:border-0 [&>div>div]:m-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&>div>div]:border-0"><D2GasConeEntry /></div>;
const D2ReceivingInner = () => <div className="h-full overflow-hidden [&>div]:h-full [&>div]:m-0 [&>div]:rounded-none [&>div]:shadow-none [&>div]:border-0 [&>div>div]:m-0 [&>div>div]:rounded-none [&>div>div]:shadow-none [&>div>div]:border-0"><D2Recieving /></div>;
const D2BatchesInner = () => <div className="h-full overflow-hidden"><D2Batches /></div>;

export default D2Combined;
