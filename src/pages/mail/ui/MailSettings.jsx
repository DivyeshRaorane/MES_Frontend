import { useState } from 'react';
import { Settings, CheckCircle, XCircle, Loader2, Shield, Server, Info } from 'lucide-react';
import { verifyMailConnection } from '../services/mailService';
import { showSuccess, showError } from '../../../utils/toastService';

const PROVIDERS = [
  { value: 'gmail', label: 'Gmail' },
  { value: 'org', label: 'Organization' },
];

const MailSettings = () => {
  const [provider, setProvider] = useState('gmail');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }

  const handleVerify = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await verifyMailConnection(provider);
      if (res?.success) {
        setStatus({ type: 'success', message: res.message || `${provider === 'gmail' ? 'Gmail' : 'Organization'} connection verified successfully` });
        showSuccess(`${provider === 'gmail' ? 'Gmail' : 'Organization'} connection verified`);
      } else {
        setStatus({ type: 'error', message: res?.message || 'Connection verification failed' });
        showError(res?.message || 'Connection verification failed');
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Connection verification failed';
      setStatus({ type: 'error', message: msg });
      showError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50/60 flex-shrink-0">
          <Settings size={14} className="text-blue-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Mail Settings</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-lg mx-auto space-y-8">

            {/* Section: Test Connection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={15} className="text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Test Connection</h2>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Select a mail provider and verify the SMTP connection is working correctly.
              </p>

              {/* Provider Dropdown */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => { setProvider(e.target.value); setStatus(null); }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <Settings size={13} />}
                {loading ? 'Verifying...' : 'Verify Connection'}
              </button>

              {/* Status Display */}
              {status && (
                <div className={`mt-4 flex items-start gap-2 px-4 py-3 rounded-lg border text-[11px] font-semibold ${
                  status.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={14} className="flex-shrink-0 mt-0.5" /> : <XCircle size={14} className="flex-shrink-0 mt-0.5" />}
                  <span>{status.message}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="border-slate-200" />

            {/* Section: Configuration Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Server size={15} className="text-slate-600" />
                <h2 className="text-sm font-bold text-slate-800">Configuration Info</h2>
              </div>

              <div className="space-y-3">
                {/* Gmail Config */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">Gmail</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Host:</span>
                      <span className="text-[10px] font-mono text-slate-700">smtp.gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Port:</span>
                      <span className="text-[10px] font-mono text-slate-700">587 (TLS)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Email:</span>
                      <span className="text-[10px] font-mono text-slate-700">*****@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Auth:</span>
                      <span className="text-[10px] font-mono text-slate-700">App Password</span>
                    </div>
                  </div>
                </div>

                {/* Organization Config */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Organization</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Host:</span>
                      <span className="text-[10px] font-mono text-slate-700">Configured in .env</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Port:</span>
                      <span className="text-[10px] font-mono text-slate-700">465 (SSL)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Email:</span>
                      <span className="text-[10px] font-mono text-slate-700">*****@yourcompany.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 w-20">Auth:</span>
                      <span className="text-[10px] font-mono text-slate-700">Username / Password</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Info size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 font-semibold">
                  To update mail credentials, modify the <code className="bg-amber-100 px-1 rounded">.env</code> file on the server and restart the backend service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailSettings;
