import React from 'react';
import { Hammer, Mail, Construction, Github, Twitter } from 'lucide-react';

const UnderDevelopment = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Main Card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
        
        {/* Animated Icon */}
        <div className="relative flex justify-center mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative bg-blue-600 p-5 rounded-2xl shadow-lg rotate-3">
            <Construction className="text-white w-10 h-10" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Under Development
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          We're busy building something amazing. Our This page is coming soon with more features and a fresh look!
        </p>

        {/* Progress Bar (Optional) */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8">
          <div className="bg-blue-600 h-2.5 rounded-full w-2/3 animate-transition-width duration-1000"></div>
          <p className="text-xs text-slate-400 mt-2 text-right font-medium uppercase tracking-wider">
            65% Complete
          </p>
        </div>

        {/* Action Button */}
        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group">
          <Mail size={18} className="group-hover:scale-110 transition-transform" />
          Notify Me
        </button>
      </div>

      {/* Footer / Socials */}
      <footer className="mt-12">
        <div className="flex gap-6 text-slate-400">
          <a href="#" className="hover:text-blue-600 transition-colors"><Twitter size={20} /></a>
          <a href="#" className="hover:text-slate-900 transition-colors"><Github size={20} /></a>
        </div>
        <p className="mt-4 text-sm text-slate-400 italic">
          &copy; 2026 MES Portal. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default UnderDevelopment;