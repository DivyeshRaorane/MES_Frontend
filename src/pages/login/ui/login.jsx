import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { userLogin } from '../services/user.api';
import {
  Activity,
  ChevronRight,
  Lock,
  User,
  Eye,
  EyeOff,
  Cpu,
  Globe
} from 'lucide-react';

/**
 * LoginPage Component
 * A standalone, premium login interface for a Manufacturing Execution System.
 * * Props:
 * @param {Function} onLogin - Callback function receiving { username, password }
 * @param {Boolean} loading - Toggles the loading state of the submit button
 */
const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = () => {
    if (formData.email === "admin" && formData.password === "admin") {
      navigate("/dashboard");
    } else {
      alert("Email or Password Is Incorrect");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   
  //   try {
  //     const resultAction = await dispatch(userLogin(formData)); // dispatch returns a promise
  //     if (userLogin.fulfilled.match(resultAction)) { // check if login was successful
  //       navigate("/dashboard"); // ✅ navigate immediately after login
  //     } else {
  //       console.error("Login failed:", resultAction.payload);
  //     }
  //   } catch (err) {
  //     console.error("Unexpected error:", err);
  //   }
  // };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row">
      {/* Left branding pane - Hidden on mobile, visible on Large screens */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-700 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Decorations */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        {/* Logo Section */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
            <Activity size={32} className="text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter italic">MES PORTAL</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-6 max-w-xl">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Advanced Manufacturing <br />
            <span className="text-blue-300">Execution Systems.</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed opacity-80">
            Real-time monitoring, fiber draw optimization, and comprehensive quality control for modern production environments.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Cpu className="text-blue-300 mb-2" size={24} />
              <h4 className="text-white font-bold text-sm">IoT Integration</h4>
              <p className="text-blue-200 text-xs">Direct machine connectivity</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Globe className="text-blue-300 mb-2" size={24} />
              <h4 className="text-white font-bold text-sm">Global Sync</h4>
              <p className="text-blue-200 text-xs">Cloud-ready data pipelines</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-blue-200 text-xs flex gap-6 opacity-60">
          <span>&copy; 2026 FioeT PVT LTD.</span>
          <a href="#" className="hover:text-white transition-colors underline underline-offset-4">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors underline underline-offset-4">Terms of Service</a>
        </div>
      </div>

      {/* Right form pane */}
      <div className="flex-1 bg-white p-8 lg:p-24 flex items-center justify-center">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Login Main Branch</h2>
            <p className="text-slate-500 font-medium">Enter your credentials to access the production floor.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Operator ID Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Operator ID / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. OP-4012"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Access?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="        "
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Sign In to Terminal <ChevronRight size={20} /></>
              )}
            </button>
          </form>

          {/* Compliance & Status Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
            <span className="text-sm text-slate-400">Restricted Access System</span>
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Server: Production</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Demo wrapper for testing the standalone LoginPage
 */

export default LoginPage