import { useState } from 'react';
import { CalendarClock, X, Loader2 } from 'lucide-react';
import { scheduleMailApi } from '../services/mailService';
import { showSuccess, showError } from '../../../utils/toastService';

const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'Once (No Repeat)' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

/**
 * Reusable Schedule Modal
 * Props:
 *   - mailData: object with { provider, to, cc, bcc, subject, text, html, templateName, templateVars }
 *   - onClose: () => void
 *   - onScheduled: () => void (callback after successful scheduling)
 */
const ScheduleModal = ({ mailData, onClose, onScheduled }) => {
  const [scheduledAt, setScheduledAt] = useState('');
  const [recurrence, setRecurrence] = useState('once');
  const [submitting, setSubmitting] = useState(false);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleSchedule = async () => {
    if (!scheduledAt) {
      showError('Please select a date and time');
      return;
    }
    if (new Date(scheduledAt) <= new Date()) {
      showError('Scheduled time must be in the future');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...mailData,
        scheduledAt,
        recurrence,
      };
      const res = await scheduleMailApi(payload);
      if (res?.success) {
        showSuccess('Email scheduled successfully!');
        if (onScheduled) onScheduled();
        onClose();
      } else {
        showError(res?.message || 'Failed to schedule email');
      }
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to schedule email');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <CalendarClock size={15} className="text-violet-600" />
            <span className="text-sm font-bold text-slate-700">Schedule Email</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Scheduling email to:</p>
            <p className="text-[11px] font-semibold text-slate-700 truncate">{mailData?.to || '—'}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{mailData?.subject || '(No Subject)'}</p>
          </div>

          {/* Date/Time Picker */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Schedule Date & Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={getMinDateTime()}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Recurrence
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
            >
              {RECURRENCE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Recurrence Info */}
          {recurrence !== 'once' && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-2.5">
              <p className="text-[9px] text-violet-700 font-semibold">
                This email will be sent <strong>{recurrence}</strong> starting from the scheduled time.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={11} className="animate-spin" /> : <CalendarClock size={11} />}
            {submitting ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
