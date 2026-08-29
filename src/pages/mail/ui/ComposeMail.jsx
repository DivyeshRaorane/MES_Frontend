import { useState, useEffect } from 'react';
import { Send, Loader2, Mail, Plus, Trash2, Bookmark, CalendarClock, AlertCircle } from 'lucide-react';
import { sendMail, sendTemplateMail, saveDraftMail, getMailTemplates } from '../services/mailService';
import { showSuccess, showError } from '../../../utils/toastService';
import ScheduleModal from './ScheduleModal';

const ComposeMail = ({ draftData, onDraftSaved }) => {
  const [provider, setProvider] = useState('gmail');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyType, setBodyType] = useState('plain'); // 'plain' | 'html' | 'template'
  const [plainText, setPlainText] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateVars, setTemplateVars] = useState({});
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDraftNameInput, setShowDraftNameInput] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Templates from API
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const res = await getMailTemplates();
      if (res?.success) {
        setTemplates(res.data || []);
      }
    } catch (e) {
      // Silent fail — templates just won't be available
    }
    setTemplatesLoading(false);
  };

  // Load draft data when passed from SavedMails
  useEffect(() => {
    if (draftData) {
      setProvider(draftData.provider || 'gmail');
      setTo(draftData.to || '');
      setCc(draftData.cc || '');
      setBcc(draftData.bcc || '');
      setSubject(draftData.subject || '');
      if (draftData.templateName) {
        setBodyType('template');
        setTemplateName(draftData.templateName);
        setTemplateVars(draftData.templateVars || {});
      } else if (draftData.html) {
        setBodyType('html');
        setHtmlContent(draftData.html);
      } else {
        setBodyType('plain');
        setPlainText(draftData.text || '');
      }
    }
  }, [draftData]);

  // When template selection changes, reset vars to match template's variables
  const handleTemplateChange = (name) => {
    setTemplateName(name);
    const tpl = templates.find((t) => t.name === name);
    if (tpl?.variables) {
      const vars = {};
      tpl.variables.forEach((v) => {
        vars[v] = templateVars[v] || '';
      });
      setTemplateVars(vars);
    } else {
      setTemplateVars({});
    }
  };

  const updateTemplateVar = (key, value) => {
    setTemplateVars((prev) => ({ ...prev, [key]: value }));
  };

  const selectedTemplate = templates.find((t) => t.name === templateName);
  const isProductionReport = templateName === 'production_report';

  const buildPayload = () => {
    const payload = {
      provider,
      to: to.trim(),
      subject: subject.trim(),
    };
    if (cc.trim()) payload.cc = cc.trim();
    if (bcc.trim()) payload.bcc = bcc.trim();

    if (bodyType === 'plain') {
      payload.text = plainText;
    } else if (bodyType === 'html') {
      payload.html = htmlContent;
    } else if (bodyType === 'template') {
      payload.templateName = templateName;
      payload.templateVars = templateVars;
    }
    return payload;
  };

  const validate = () => {
    if (!to.trim()) { showError('To field is required'); return false; }
    if (!subject.trim()) { showError('Subject is required'); return false; }
    if (bodyType === 'plain' && !plainText.trim()) { showError('Message body is required'); return false; }
    if (bodyType === 'html' && !htmlContent.trim()) { showError('HTML content is required'); return false; }
    if (bodyType === 'template' && !templateName) { showError('Please select a template'); return false; }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      const payload = buildPayload();
      let res;
      if (bodyType === 'template') {
        res = await sendTemplateMail(payload);
      } else {
        res = await sendMail(payload);
      }
      if (res?.success) {
        showSuccess('Email sent successfully!');
        resetForm();
      } else {
        showError(res?.message || 'Failed to send email');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to send email');
    }
    setSending(false);
  };

  const handleSaveDraft = async () => {
    if (!subject.trim() && !to.trim()) {
      showError('Please fill at least To or Subject before saving');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      payload.draft_name = draftName.trim() || `Draft - ${subject.trim() || 'Untitled'}`;
      const res = await saveDraftMail(payload);
      if (res?.success) {
        showSuccess('Mail saved as draft!');
        setShowDraftNameInput(false);
        setDraftName('');
        if (onDraftSaved) onDraftSaved();
      } else {
        showError(res?.message || 'Failed to save draft');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to save draft');
    }
    setSaving(false);
  };

  const handleOpenSchedule = () => {
    if (!validate()) return;
    setShowScheduleModal(true);
  };

  const resetForm = () => {
    setTo(''); setCc(''); setBcc(''); setSubject('');
    setPlainText(''); setHtmlContent('');
    setTemplateName(''); setTemplateVars({});
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <Mail size={14} className="text-indigo-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Compose Mail</span>
          {draftData?.draft_name && (
            <span className="text-[9px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold ml-2">
              Loaded: {draftData.draft_name}
            </span>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 overflow-auto p-5">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Provider Radio */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Provider</label>
              <div className="flex items-center gap-4">
                {[{ value: 'gmail', label: 'Gmail' }, { value: 'org', label: 'Organization' }].map((p) => (
                  <label key={p.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio" name="provider" value={p.value}
                      checked={provider === p.value}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-400"
                    />
                    <span className="text-[11px] font-semibold text-slate-700">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* To */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                To <span className="text-red-400">*</span>
              </label>
              <input
                type="text" value={to} onChange={(e) => setTo(e.target.value)}
                placeholder="email@example.com (comma-separated for multiple)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* CC & BCC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">CC</label>
                <input
                  type="text" value={cc} onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">BCC</label>
                <input
                  type="text" value={bcc} onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Body Type Toggle */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Body Type</label>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 w-fit">
                {[
                  { value: 'plain', label: 'Plain Text' },
                  { value: 'html', label: 'HTML Editor' },
                  { value: 'template', label: 'Template' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBodyType(opt.value)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                      bodyType === opt.value
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Content */}
            {bodyType === 'plain' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={plainText} onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Type your message here..."
                  rows={8}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none"
                />
              </div>
            )}

            {bodyType === 'html' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  HTML Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="<h1>Hello</h1><p>Your HTML email content...</p>"
                  rows={10}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-mono outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none"
                />
                {htmlContent.trim() && (
                  <div className="mt-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Preview</span>
                    <div className="text-[11px] text-slate-700" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  </div>
                )}
              </div>
            )}

            {bodyType === 'template' && (
              <div className="space-y-3">
                {/* Template Dropdown (from API) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Template <span className="text-red-400">*</span>
                  </label>
                  {templatesLoading ? (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Loader2 size={12} className="animate-spin" /> Loading templates...
                    </div>
                  ) : (
                    <select
                      value={templateName}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                    >
                      <option value="">— Select Template —</option>
                      {templates.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Production Report Note */}
                {isProductionReport && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 font-semibold">
                      This template will auto-generate and attach the Production Report Excel when scheduled/sent.
                    </p>
                  </div>
                )}

                {/* Dynamic Template Variables */}
                {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Template Variables
                    </label>
                    <div className="space-y-2">
                      {selectedTemplate.variables.map((varName) => (
                        <div key={varName} className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-500 w-28 flex-shrink-0 truncate" title={varName}>
                            {varName}
                          </span>
                          <input
                            type="text"
                            value={templateVars[varName] || ''}
                            onChange={(e) => updateTemplateVar(varName, e.target.value)}
                            placeholder={`Enter ${varName}`}
                            className="flex-1 border border-slate-200 rounded px-2.5 py-1.5 text-[10px] outline-none focus:ring-1 focus:ring-indigo-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                {sending ? 'Sending...' : 'Send Email'}
              </button>

              {/* Schedule Button */}
              <button
                onClick={handleOpenSchedule}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-[11px] font-bold rounded-lg hover:bg-violet-700 transition-all shadow-sm"
              >
                <CalendarClock size={13} /> Schedule
              </button>

              {/* Save as Draft Button */}
              <button
                onClick={() => setShowDraftNameInput(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-[11px] font-bold rounded-lg hover:bg-teal-700 transition-all shadow-sm"
              >
                <Bookmark size={13} /> Save as Draft
              </button>
            </div>

            {/* Draft Name Input */}
            {showDraftNameInput && (
              <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Give this draft a name (optional)"
                  className="flex-1 border border-teal-200 rounded px-3 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-teal-300"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveDraft(); }}
                />
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white text-[10px] font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={10} className="animate-spin" /> : <Bookmark size={10} />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setShowDraftNameInput(false); setDraftName(''); }}
                  className="px-2 py-1.5 text-slate-500 text-[10px] font-bold hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          mailData={buildPayload()}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => { resetForm(); }}
        />
      )}
    </div>
  );
};

export default ComposeMail;
