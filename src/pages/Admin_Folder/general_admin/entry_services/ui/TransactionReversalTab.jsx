import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import DrawReversalForm from './DrawReversalForm';

/* Transaction types and their sub-options (sub-options only for GRN for now). */
const TRANSACTION_TYPES = ['GRN', 'MTM', 'LTL'];
const GRN_SUB_TYPES = ['DRAW', 'PT', 'Color', 'Rewind'];

const labelCls = 'font-bold text-slate-800 uppercase ml-0.5 text-[9px]';
const selectCls =
  'w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

/* ══════════════════════════════════════════════════════════
   TRANSACTION REVERSAL TAB
   ══════════════════════════════════════════════════════════ */
const TransactionReversalTab = () => {
  const [txnType, setTxnType] = useState('');
  const [subType, setSubType] = useState('');

  const handleTypeChange = (e) => {
    setTxnType(e.target.value);
    setSubType(''); // reset dependent dropdown when the type changes
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="flex items-center gap-2">
        <Undo2 size={14} className="text-indigo-600" />
        <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Transaction Reversal</h2>
      </div>

      <div>
        <label htmlFor="reversal-type" className={labelCls}>Transaction Type</label>
        <select id="reversal-type" value={txnType} onChange={handleTypeChange} className={selectCls}>
          <option value="">Select type</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {txnType === 'GRN' && (
        <div>
          <label htmlFor="reversal-subtype" className={labelCls}>GRN Stage</label>
          <select id="reversal-subtype" value={subType} onChange={(e) => setSubType(e.target.value)} className={selectCls}>
            <option value="">Select stage</option>
            {GRN_SUB_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {txnType === 'GRN' && subType === 'DRAW' && <DrawReversalForm key="draw" />}
    </div>
  );
};

export default TransactionReversalTab;
