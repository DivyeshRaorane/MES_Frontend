import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, Calendar, Clock } from 'lucide-react';

const FormHeader = ({ 
  title = "Module Title", 
  subtitle = "Unit Name", 
  userName = "User", 
  userRole = "Operator",
  icon: Icon, // Allows you to pass a specific Lucide icon
  onHomeClick 
}) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit', // Added seconds for a more dynamic look
      hour12: true 
    });
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-t-2xl border-b border-white/10 shadow-2xl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-1 -mr-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-1 -ml-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>

      <div className="relative px-6 py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
        
        {/* Left Side: Dynamic Identity */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate/10 rounded-xl ring-1">
            {Icon ? <Icon size={24} className="text-white" /> : <Monitor size={24} className="text-white" />}
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none">
              {title}
            </h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: User & Meta Data */}
        <div className="flex items-center gap-6">
          
          <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm font-bold tracking-wide">{userName}</span>
              <div className="p-1 bg-slate-800 rounded-full border border-slate-700">
                <User size={14} className="text-blue-400" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{userRole}</span>
          </div>

          <div className="flex flex-col items-start min-w-[140px]">
            <div className="flex items-center gap-2 text-white">
              <Calendar size={12} className="text-indigo-400" />
              <span className="text-xs font-semibold">{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-white mt-0.5">
              <Clock size={12} className="text-emerald-400" />
              <span className="text-xs font-bold tracking-wider uppercase">{formatTime(currentTime)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onHomeClick || (() => navigate('/dashboard'))}
            className="group flex items-center justify-center p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-inner"
          >
            <Home size={20} className="text-slate-300 group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;