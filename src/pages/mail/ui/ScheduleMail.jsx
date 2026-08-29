import { useState, useEffect } from 'react';
import {
  CalendarClock, Loader2, XCircle, Trash2, RefreshCw, Mail,
  CheckCircle, AlertCircle, Clock, Info,
} from 'lucide-react';
import { getScheduledMails, cancelScheduledMail, deleteScheduledMail } from '../services/mailService';
import { showSuccess, showError } from '../../../utils/toastService';

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
  sent: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Sent' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', icon: XCircle, label: 'Cancelled' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Failed' },
};

const ScheduleMail = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [tooltipId, setTooltipId] = useState(null); // for error tooltip

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await getScheduledMails();
      if (res?.success) setSchedules(res.data || []);
      else setSchedules([]);
    } catch (e) {
      showError('Failed to load scheduled mails');
    }
    setLoading(false);
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      const res = await cancelScheduledMail(id);
      if (res?.success) {
        showSuccess('Scheduled mail cancelled');
        fetchSchedules();
      } else {
        showError(res?.message || 'Failed to cancel');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to cancel');
    }
    setCancellingId(null);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await deleteScheduledMail(id);
      if (res?.success) {
        showSuccess('Scheduled mail deleted');
        fetchSchedules();
      } else {
        showError(res?.message || 'Failed to delete');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to delete');
    }
    setDeletingId(null);
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
            <CalendarClock size={14} className="text-violet-600" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Scheduled Mails</span>
            <span className="text-[9px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">{schedules.length}</span>
          </div>
          <button
            onClick={fetchSchedules}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-lg hover:bg-slate-200 transition-all"
          >
            <RefreshCw size={10} /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="text-violet-500 animate-spin" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Mail size={28} className="text-slate-300" />
              <span className="text-xs text-slate-400">No scheduled emails</span>
              <p className="text-[10px] text-slate-400 max-w-xs text-center mt-1">
                Use the "Schedule" button in Compose Mail or Saved Mails to schedule an email.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-800 text-white z-10">
                <tr>
                  {['#', 'To', 'Subject', 'Provider', 'Scheduled At', 'Recurrence', 'Status', 'Last Sent', 'Next Run', 'Actions'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((s, i) => {
                  const id = s.id || s._id;
                  const statusConf = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
                  const StatusIcon = statusConf.icon;
                  const isCancelling = cancellingId === id;
                  const isDeleting = deletingId === id;

                  return (
                    <tr key={id || i} className="hover:bg-violet-50/30">
                      <td className="px-3 py-2.5 text-[9px] text-slate-400 font-bold">{i + 1}</td>
                      <td className="px-3 py-2.5 text-[10px] font-semibold text-slate-700 max-w-[130px] truncate">{s.to}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-600 max-w-[160px] truncate">{s.subject}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          s.provider === 'gmail' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {s.provider === 'gmail' ? 'Gmail' : 'Org'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[9px] font-mono text-slate-600">{formatDate(s.scheduledAt || s.scheduled_at)}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                          {s.recurrence || 'once'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 relative">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${statusConf.bg} ${statusConf.text}`}>
                          <StatusIcon size={9} /> {statusConf.label}
                        </span>
                        {/* Error tooltip for failed status */}
                        {s.status === 'failed' && s.error_message && (
                          <button
                            onClick={() => setTooltipId(tooltipId === id ? null : id)}
                            className="ml-1 inline-flex"
                            title="View error"
                          >
                            <Info size={10} className="text-red-500" />
                          </button>
                        )}
                        {tooltipId === id && s.error_message && (
                          <div className="absolute z-20 top-full left-0 mt-1 bg-red-800 text-white text-[9px] px-3 py-2 rounded-lg shadow-lg max-w-[250px] whitespace-normal">
                            <p className="font-bold mb-0.5">Error:</p>
                            <p>{s.error_message}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[9px] font-mono text-slate-500">
                        {formatDate(s.last_sent_at || s.lastSentAt)}
                      </td>
                      <td className="px-3 py-2.5 text-[9px] font-mono text-slate-500">
                        {formatDate(s.next_run_at || s.nextRunAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {s.status === 'pending' && (
                            <button
                              onClick={() => handleCancel(id)}
                              disabled={isCancelling}
                              className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold rounded hover:bg-amber-100 transition-all disabled:opacity-50"
                            >
                              {isCancelling ? <Loader2 size={9} className="animate-spin" /> : <XCircle size={9} />}
                              Cancel
                            </button>
                          )}
                          {(s.status === 'cancelled' || s.status === 'sent' || s.status === 'failed') && (
                            <button
                              onClick={() => handleDelete(id)}
                              disabled={isDeleting}
                              className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 border border-red-200 text-[8px] font-bold rounded hover:bg-red-100 transition-all disabled:opacity-50"
                            >
                              {isDeleting ? <Loader2 size={9} className="animate-spin" /> : <Trash2 size={9} />}
                              Delete
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
    </div>
  );
};

export default ScheduleMail;
