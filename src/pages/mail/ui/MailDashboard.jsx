import { useState } from 'react';
import { Mail, Settings, Send, Eye, CalendarClock, Bookmark } from 'lucide-react';
import MailSettings from './MailSettings';
import ComposeMail from './ComposeMail';
import TemplatePreview from './TemplatePreview';
import ScheduleMail from './ScheduleMail';
import SavedMails from './SavedMails';

const TABS = [
  { key: 'compose', label: 'Compose Mail', icon: Send },
  { key: 'saved', label: 'Saved Mails', icon: Bookmark },
  { key: 'schedule', label: 'Scheduled Mails', icon: CalendarClock },
  { key: 'settings', label: 'Mail Settings', icon: Settings },
  { key: 'preview', label: 'Template Preview', icon: Eye },
];

const MailDashboard = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [draftData, setDraftData] = useState(null);

  // When user clicks "Edit/Use" on a saved draft, load it into Compose tab
  const handleLoadDraft = (draft) => {
    setDraftData({ ...draft, _loadedAt: Date.now() }); // _loadedAt forces useEffect re-trigger
    setActiveTab('compose');
  };

  // Callback after a draft is saved from Compose
  const handleDraftSaved = () => {
    // Could refresh saved mails if needed
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-0 flex-shrink-0">
        <Mail size={13} className="text-indigo-600 mr-1" />
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-t-lg border border-b-0 transition-all ${
                isActive
                  ? 'bg-white text-indigo-700 border-slate-200 shadow-sm'
                  : 'bg-slate-100 text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <Icon size={11} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'compose' && <ComposeMail draftData={draftData} onDraftSaved={handleDraftSaved} />}
        {activeTab === 'saved' && <SavedMails onLoadDraft={handleLoadDraft} />}
        {activeTab === 'schedule' && <ScheduleMail />}
        {activeTab === 'settings' && <MailSettings />}
        {activeTab === 'preview' && <TemplatePreview />}
      </div>
    </div>
  );
};

export default MailDashboard;
