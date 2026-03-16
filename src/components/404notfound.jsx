import React from 'react';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertCircle,
  Construction,
  HelpCircle,
  History
} from 'lucide-react';

/**
 * 404 Page Not Found Component
 * Designed to match the MES Portal branding with professional typography and clear navigation.
 */
const PageNotFound=()=> {
  // Mock navigation function
  const goBack = () => console.log("Navigating back...");
  const goHome = () => console.log("Navigating to dashboard...");

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Illustration Area */}
        <div className="relative mb-12 flex justify-center">
          <div className="absolute inset-0 bg-blue-100/50 blur-3xl rounded-full scale-150 transform -z-10 animate-pulse"></div>
          <div className="relative flex items-center justify-center">
            <span className="text-[180px] font-black text-slate-900 leading-none tracking-tighter opacity-10 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Construction size={80} className="text-blue-600 animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          Oops! Page Under Construction
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          The page you're looking for might have been moved, renamed, or is currently under maintenance by the MES engineering team.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={goBack}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <button 
            onClick={goHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
          >
            <Home size={20} />
            Back to Dashboard
          </button>
        </div>

        {/* Support Links */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white transition-colors cursor-default group">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <HelpCircle size={24} />
            </div>
            <span className="text-sm font-semibold text-slate-700">Help Center</span>
            <span className="text-xs text-slate-400">Find tutorials</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white transition-colors cursor-default group">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Search size={24} />
            </div>
            <span className="text-sm font-semibold text-slate-700">Search MES</span>
            <span className="text-xs text-slate-400">Search portal data</span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white transition-colors cursor-default group">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <History size={24} />
            </div>
            <span className="text-sm font-semibold text-slate-700">Activity Log</span>
            <span className="text-xs text-slate-400">View recent changes</span>
          </div>
        </div>

        {/* Footer Identifier */}
        <div className="mt-12 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
          MES Portal System Identity: ER-404-NF
        </div>
      </div>
    </div>
  );
}

export default PageNotFound