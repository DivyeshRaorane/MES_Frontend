import { useMemo, useState } from 'react';
import { Tag } from 'lucide-react';
import { getTemplateOptions, getTemplate } from '../core/templateRegistry';
import LabelRenderer from '../components/LabelRenderer';
import PrintButton from '../components/PrintButton';
import { showError } from '../../../utils/toastService';
import '../templates'; // ensure templates are registered

/**
 * Demo / playground page: pick a template, edit its fields, live-preview the
 * sticker, choose copies, and print. Driven entirely by the template registry,
 * so any newly-registered template shows up here automatically.
 */
const LabelPrintPlayground = () => {
  const options = useMemo(() => getTemplateOptions(), []);
  const [templateKey, setTemplateKey] = useState(options[0]?.key || '');
  const [copies, setCopies] = useState(1);

  const template = getTemplate(templateKey);
  const [data, setData] = useState(() => ({ ...(template?.defaults || {}) }));

  const switchTemplate = (key) => {
    setTemplateKey(key);
    setData({ ...(getTemplate(key)?.defaults || {}) });
  };

  const setField = (name, value) => setData((d) => ({ ...d, [name]: value }));

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50/60">
          <span className="flex items-center gap-2 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
            <Tag size={14} className="text-emerald-600" /> Label Print Playground
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Copies</label>
            <input
              type="number"
              min={1}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 px-2 py-1 text-xs rounded border border-slate-300 text-center"
            />
            <PrintButton
              compact
              templateKey={templateKey}
              data={data}
              copies={copies}
              onError={(err) => showError(err.message || 'Print failed')}
            />
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left: controls */}
          <div className="w-80 border-r border-slate-200 p-4 overflow-auto flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Template</label>
              <select
                value={templateKey}
                onChange={(e) => switchTemplate(e.target.value)}
                className="px-2 py-1.5 text-xs rounded border border-slate-300"
              >
                {options.map((o) => (
                  <option key={o.key} value={o.key}>{o.name}</option>
                ))}
              </select>
            </div>

            <div className="h-px bg-slate-100 my-1" />

            {(template?.fields || []).map((f) => (
              <div key={f.name} className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={data[f.name] ?? ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  className="px-2 py-1.5 text-xs rounded border border-slate-300"
                />
              </div>
            ))}
          </div>

          {/* Right: live preview */}
          <div className="flex-1 min-h-0 overflow-auto p-6 bg-slate-100 flex items-start justify-center">
            <LabelRenderer templateKey={templateKey} data={data} zoom={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPrintPlayground;
