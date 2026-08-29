import { useState, useEffect } from 'react';
import {
  Bookmark, Loader2, Trash2, Send, RefreshCw, Mail, Edit2, CalendarClock, X,
} from 'lucide-react';
import { getSavedDrafts, deleteDraftMail, sendMail, sendTemplateMail } from '../services/mailService';
import { showSuccess, showError } from '../../../utils/toastService';
import ScheduleModal from './ScheduleModal';

/**
 * Props:
 *   - onLoadDraft: (draft) => void — loads draft into Compose tab
 */
const SavedMails = ({ onLoadDraft }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [scheduleData, setScheduleData] = useState(null); // draft to schedule
  const [confirmDelete, setConfirmDelete] = useState(null); // id to confirm delete

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await getSavedDrafts();
      if (res?.success) setDrafts(res.data || []);
      else setDrafts([]);
    } catch (e) {
      showError('Failed to load saved mails');
    }
    setLoading(false);
  };

  useEffect(() => { fetchDrafts(); }, []);

  const handleEdit = (draft) => {
    if (onLoadDraft) {
      onLoadDraft(draft);
    }
  };

  const handleSendNow = async (draft) => {
    const id = draft.id || draft._id;
    setSendingId(id);
    try {
      const payload = {
        provider: draft.provider || 'gmail',
        to: draft.to,
        subject: draft.subject,
      };
      if (draft.cc) payload.cc = draft.cc;
      if (draft.bcc) payload.bcc = draft.bcc;
      if (draft.text) payload.text = draft.text;
      if (draft.html) payload.html = draft.html;
      if (draft.templateName) {
        payload.templateName = draft.templateName;
        payload.templateVars = draft.templateVars || {};
      }

      let res;
      if (draft.templateName) {
        res = await sendTemplateMail(payload);
      } else {
        res = await sendMail(payload);
      }

      if (res?.success) {
        showSuccess('Email sent successfully!');
      } else {
        showError(res?.message || 'Failed to send email');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to send email');
    }
    setSendingId(null);
  };

  const handleSchedule = (draft) => {
    const payload = {
      provider: draft.provider || 'gmail',
      to: draft.to,
      subject: draft.subject,
    };
    if (draft.cc) payload.cc = draft.cc;
    if (draft.bcc) payload.bcc = draft.bcc;
    if (draft.text) payload.text = draft.text;
    if (draft.html) payload.html = draft.html;
    if (draft.templateName) {
      payload.templateName = draft.templateName;
      payload.templateVars = draft.templateVars || {};
    }
    setScheduleData(payload);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await deleteDraftMail(id);
      if (res?.success) {
        showSuccess('Draft deleted');
        fetchDrafts();
      } else {
        showError(res?.message || 'Failed to delete');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to delete');
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark size={14} className="text-teal-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Saved Mails</span>
            <span className="text-[9px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">{drafts.length}</span>
          </div>
          <button
            onClick={fetchDrafts}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-lg hover:bg-slate-200 transition-all"
          >
            <RefreshCw size={10} /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="text-teal-500 animate-spin" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Mail size={28} className="text-slate-300" />
              <span className="text-xs text-slate-400">No saved mails yet</span>
              <p className="text-[10px] text-slate-400 max-w-xs text-center mt-1">
                Use the "Save as Draft" button in Compose Mail to save an email for later use.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 text-white z-10">
                <tr>
                  {['#', 'Draft Name', 'To', 'Subject', 'Provider', 'Updated At', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drafts.map((draft, i) => {
                  const id = draft.id || draft._id;
                  const isSending = sendingId === id;
                  const isDeleting = deletingId === id;
                  return (
                    <tr key={id || i} className="hover:bg-teal-50/30">
                      <td className="px-3 py-2.5 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-3 py-2.5 text-[10px] font-bold text-teal-700 max-w-[120px] truncate">
                        {draft.draft_name || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-600 max-w-[150px] truncate">{draft.to || '—'}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-700 max-w-[180px] truncate">{draft.subject || '(No Subject)'}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          draft.provider === 'gmail' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {draft.provider === 'gmail' ? 'Gmail' : 'Org'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[9px] text-slate-400">
                        {formatDate(draft.updated_at || draft.updatedAt || draft.created_at || draft.createdAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(draft)}
                            className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 text-[8px] font-bold rounded hover:bg-teal-100 transition-all"
                            title="Load into Compose"
                          >
                            <Edit2 size={9} /> Edit
                          </button>
                          {/* Send Now */}
                          <button
                            onClick={() => handleSendNow(draft)}
                            disabled={isSending}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[8px] font-bold rounded hover:bg-indigo-100 transition-all disabled:opacity-50"
                            title="Send immediately"
                          >
                            {isSending ? <Loader2 size={9} className="animate-spin" /> : <Send size={9} />}
                            Send
                          </button>
                          {/* Schedule */}
                          <button
                            onClick={() => handleSchedule(draft)}
                            className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 border border-violet-200 text-[8px] font-bold rounded hover:bg-violet-100 transition-all"
                            title="Schedule for later"
                          >
                            <CalendarClock size={9} /> Schedule
                          </button>
                          {/* Delete */}
                          {confirmDelete === id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(id)}
                                disabled={isDeleting}
                                className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[8px] font-bold rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                {isDeleting ? <Loader2 size={9} className="animate-spin" /> : <Trash2 size={9} />} Yes
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-600 text-[8px] font-bold rounded hover:bg-slate-200"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(id)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-[8px] font-bold rounded hover:bg-red-100 transition-all"
                              title="Delete draft"
                            >
                              <Trash2 size={9} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {scheduleData && (
        <ScheduleModal
          mailData={scheduleData}
          onClose={() => setScheduleData(null)}
          onScheduled={() => { setScheduleData(null); showSuccess('Draft scheduled!'); }}
        />
      )}
    </div>
  );
};

export default SavedMails;
