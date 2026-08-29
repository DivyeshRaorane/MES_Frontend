import { useState, useEffect, useMemo } from 'react';
import { Eye, Loader2, FileText, RefreshCw } from 'lucide-react';
import { getMailTemplates } from '../services/mailService';
import { showError } from '../../../utils/toastService';

const TemplatePreview = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateVars, setTemplateVars] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getMailTemplates();
      if (res?.success) {
        setTemplates(res.data || []);
      }
    } catch (e) {
      showError('Failed to load templates');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const currentTemplate = templates.find((t) => t.name === selectedTemplate);

  const handleTemplateChange = (name) => {
    setSelectedTemplate(name);
    setShowPreview(false);
    const tpl = templates.find((t) => t.name === name);
    if (tpl?.variables) {
      const vars = {};
      tpl.variables.forEach((v) => { vars[v] = ''; });
      setTemplateVars(vars);
    } else {
      setTemplateVars({});
    }
  };

  const updateVar = (key, value) => {
    setTemplateVars((prev) => ({ ...prev, [key]: value }));
  };

  // Client-side preview: simple {{var}} replacement on a sample structure
  const renderedPreview = useMemo(() => {
    if (!currentTemplate) return '';

    // Build a basic preview HTML based on template name and variables
    let html = buildSampleHtml(currentTemplate.name, templateVars);
    
    // Replace any remaining {{var}} placeholders
    Object.entries(templateVars).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(regex, val || `<span style="color:#94a3b8;font-style:italic">{{${key}}}</span>`);
    });

    return html;
  }, [currentTemplate, templateVars]);

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Template Preview</span>
          </div>
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-lg hover:bg-slate-200 transition-all"
          >
            <RefreshCw size={10} /> Reload
          </button>
        </div>

        {/* Content - Split layout */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left: Controls */}
          <div className="w-full lg:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-auto p-4 space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Select Template
              </label>
              {loading ? (
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Loader2 size={12} className="animate-spin" /> Loading templates...
                </div>
              ) : (
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all"
                >
                  <option value="">— Choose a template —</option>
                  {templates.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Template Info */}
            {currentTemplate && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Template Info</p>
                <p className="text-[10px] text-slate-700"><strong>Name:</strong> {currentTemplate.name}</p>
                {currentTemplate.fileName && (
                  <p className="text-[10px] text-slate-500"><strong>File:</strong> {currentTemplate.fileName}</p>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  <strong>Variables:</strong> {currentTemplate.variables?.length || 0}
                </p>
              </div>
            )}

            {/* Template Variables */}
            {currentTemplate?.variables && currentTemplate.variables.length > 0 && (
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Fill Variables
                </label>
                <div className="space-y-2">
                  {currentTemplate.variables.map((varName) => (
                    <div key={varName}>
                      <label className="text-[9px] font-semibold text-slate-500 mb-0.5 block">{varName}</label>
                      <input
                        type="text"
                        value={templateVars[varName] || ''}
                        onChange={(e) => updateVar(varName, e.target.value)}
                        placeholder={`Enter ${varName}`}
                        className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-emerald-300"
                      />
                    </div>
                  ))}
                </div>

                {/* Preview Button */}
                <button
                  onClick={() => setShowPreview(true)}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all w-full justify-center"
                >
                  <Eye size={11} /> Preview
                </button>
              </div>
            )}

            {/* How it works */}
            {!currentTemplate && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText size={11} className="text-slate-500" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">How it works</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Select a template from the dropdown. The required variables will appear as input fields. 
                  Fill them in and click "Preview" to see the rendered email.
                </p>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
            {!selectedTemplate ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Eye size={32} className="text-slate-200" />
                <p className="text-[11px] text-slate-400">Select a template to preview</p>
              </div>
            ) : !showPreview ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <FileText size={32} className="text-slate-200" />
                <p className="text-[11px] text-slate-400">Fill in variables and click "Preview"</p>
              </div>
            ) : (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    {currentTemplate?.name}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <iframe
                    title="Template Preview"
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{margin:0;padding:16px;font-family:Arial,sans-serif;}</style></head><body>${renderedPreview}</body></html>`}
                    className="w-full border-0"
                    style={{ minHeight: '450px' }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Build sample HTML for known templates (client-side preview).
 * In production, you'd fetch the actual HTML from the server via POST /api/mail/preview-template.
 * This is a fallback for client-side rendering.
 */
function buildSampleHtml(templateName, vars) {
  switch (templateName) {
    case 'welcome':
      return `
        <div style="max-width:600px;margin:0 auto;">
          <div style="background:#4f46e5;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:22px;">Welcome, {{userName}}!</h1>
          </div>
          <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#334155;font-size:14px;line-height:1.6;">
              Hello <strong>{{userName}}</strong>,<br/><br/>
              Welcome to our platform! Your Employee ID is <strong>{{empId}}</strong>.<br/>
              Department: <strong>{{department}}</strong><br/>
              Role: <strong>{{role}}</strong><br/><br/>
              Login here: <a href="{{loginUrl}}" style="color:#4f46e5;">{{loginUrl}}</a>
            </p>
            <p style="color:#64748b;font-size:12px;margin-top:20px;">&copy; {{year}} MES Team</p>
          </div>
        </div>`;

    case 'notification':
      return `
        <div style="max-width:600px;margin:0 auto;">
          <div style="background:#f59e0b;color:white;padding:16px 20px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;font-size:18px;">&#9888; Notification</h2>
          </div>
          <div style="background:#fffbeb;padding:24px;border:1px solid #fde68a;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#92400e;font-size:14px;line-height:1.6;">
              <strong>{{title}}</strong><br/><br/>
              {{message}}<br/><br/>
              Action required by: <strong>{{assignedTo}}</strong>
            </p>
            <p style="color:#b45309;font-size:11px;margin-top:16px;">&copy; {{year}} MES Automated Notification</p>
          </div>
        </div>`;

    case 'report':
      return `
        <div style="max-width:600px;margin:0 auto;">
          <div style="background:#059669;color:white;padding:16px 20px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;font-size:18px;">&#128202; Report: {{reportName}}</h2>
          </div>
          <div style="background:#f0fdf4;padding:24px;border:1px solid #bbf7d0;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#166534;font-size:14px;line-height:1.6;">
              Report generated on: <strong>{{date}}</strong><br/>
              Department: <strong>{{department}}</strong><br/><br/>
              {{summary}}
            </p>
            <p style="color:#15803d;font-size:11px;margin-top:16px;">&copy; {{year}} MES Reporting System</p>
          </div>
        </div>`;

    case 'production_report':
      return `
        <div style="max-width:600px;margin:0 auto;">
          <div style="background:#1e40af;color:white;padding:16px 20px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;font-size:18px;">&#128200; Production Report</h2>
          </div>
          <div style="background:#eff6ff;padding:24px;border:1px solid #bfdbfe;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#1e3a5f;font-size:14px;line-height:1.6;">
              <strong>Date:</strong> {{reportDate}}<br/>
              <strong>Generated At:</strong> {{generatedAt}}<br/>
              <strong>Prepared By:</strong> {{preparedBy}}<br/><br/>
              <em style="color:#3b82f6;">The production report Excel file is auto-generated and attached to this email.</em>
            </p>
            <p style="color:#1e40af;font-size:11px;margin-top:16px;">&copy; {{year}} MES Production System</p>
          </div>
        </div>`;

    default:
      // Generic fallback for unknown templates
      return `
        <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;">
          <h2 style="color:#334155;margin-top:0;">Template: ${templateName}</h2>
          <p style="color:#64748b;font-size:13px;">Variables:</p>
          <ul style="color:#334155;font-size:13px;">
            ${Object.entries(vars).map(([k, v]) => `<li><strong>${k}:</strong> {{${k}}}</li>`).join('')}
          </ul>
        </div>`;
  }
}

export default TemplatePreview;
