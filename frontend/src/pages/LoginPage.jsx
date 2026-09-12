import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import {
  Sprout,
  LogIn,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [directResetNotice, setDirectResetNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal States
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const { login, setUser } = useAuth();

  // Check if redirected from Direct Gmail Inbox Reset Link
  useEffect(() => {
    const isDirectReset = searchParams.get('directResetSuccess');
    const token = searchParams.get('token');
    const userRole = searchParams.get('role');

    if (isDirectReset && token) {
      localStorage.setItem('kisansetu_token', token);
      setDirectResetNotice('🔒 Password updated and authenticated directly from your Gmail inbox link! Redirecting to your dashboard...');

      API.get('/auth/me')
        .then(({ data }) => {
          if (data.success) {
            setUser(data.user);
            setTimeout(() => {
              if (userRole === 'FARMER') navigate('/farmer/dashboard');
              else if (userRole === 'FPO') navigate('/fpo/dashboard');
              else if (userRole === 'BULK_BUYER') navigate('/buyer/procurement');
              else if (userRole === 'LOGISTICS') navigate('/logistics/dashboard');
              else if (userRole === 'ADMIN') navigate('/admin/dashboard');
              else navigate('/marketplace');
            }, 2000);
          }
        })
        .catch(console.error);
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'FARMER') navigate('/farmer/dashboard');
      else if (user.role === 'FPO') navigate('/fpo/dashboard');
      else if (user.role === 'BULK_BUYER') navigate('/buyer/procurement');
      else if (user.role === 'LOGISTICS') navigate('/logistics/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  // Handle Real Gmail Dispatch
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setForgotSuccess('');
    setForgotError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/forgot-password', { email: resetEmailInput });
      if (data.success) {
        setForgotSuccess(`Direct password reset link sent to ${resetEmailInput}! Please check your Gmail inbox on your phone or computer.`);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'No registered account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Helper for SIH Evaluation
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <MainLayout>
      <div className="min-h-[84vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8F9FA] via-[#F1F5F2] to-[#F8F9FA] relative overflow-hidden">
        {/* Background Decorative Ambient Glows */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
          
          {/* Left Form Panel */}
          <div className="md:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Header Badge & Title */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bank-Grade Encrypted Portal</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0A2412] via-[#12401E] to-[#1B5E2B] text-white flex items-center justify-center font-bold shadow-md">
                    <Sprout className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Welcome Back</h2>
                    <p className="text-xs font-semibold text-slate-500">Sign in to your KisanSetu AI workspace</p>
                  </div>
                </div>
              </div>

              {directResetNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{directResetNotice}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field with Icon */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* Password Field with Icon & Eye Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalOpen(true);
                        setForgotSuccess('');
                        setForgotError('');
                      }}
                      className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-extrabold text-emerald-700 hover:underline">
                Register Free →
              </Link>
            </div>
          </div>

          {/* Right Role Demo Selection Side */}
          <div className="md:col-span-6 bg-gradient-to-br from-[#061C0E] via-[#0A2916] to-[#041209] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background graphic badge */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Platform Role Portals
              </div>
              
              <div>
                <h3 className="text-lg font-black text-white">Pre-Configured Role Logins</h3>
                <p className="text-xs text-slate-300 mt-0.5">Select any ecosystem role below to auto-fill credentials:</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('farmer.ramesh@kisansetu.in', 'Farmer@123')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-emerald-300 group-hover:translate-x-0.5 transition-transform">🌾 Ramesh (Farmer)</p>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">farmer.ramesh@...</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('fpo.punjab@kisansetu.in', 'Fpo@123')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-teal-300 group-hover:translate-x-0.5 transition-transform">🏬 Punjab (FPO)</p>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">fpo.punjab@...</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('buyer.freshmart@kisansetu.in', 'Buyer@123')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-indigo-300 group-hover:translate-x-0.5 transition-transform">🏬 FreshMart (Bulk)</p>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">buyer.freshmart@...</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('consumer.anita@kisansetu.in', 'Consumer@123')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-green-300 group-hover:translate-x-0.5 transition-transform">🛒 Anita (Consumer)</p>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">consumer.anita@...</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('logistics.express@kisansetu.in', 'Logistics@123')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-amber-300 group-hover:translate-x-0.5 transition-transform">🚚 ColdChain Express</p>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">logistics.express@...</p>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@kisansetu.in', 'Admin@123')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-black text-rose-300 group-hover:translate-x-0.5 transition-transform">🏛️ Govt Admin</p>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">admin@kisansetu.in</p>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-[11px] text-slate-300 text-center relative z-10 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Pre-seeded evaluation credentials auto-populate on click
            </div>
          </div>
        </div>
      </div>

      {/* Gmail Password Reset Link Request Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-slate-900">Gmail Password Reset Link Request</h3>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-start gap-2 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>{forgotSuccess}</span>
                </div>
              </div>
            )}

            {forgotError && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {!forgotSuccess && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <p className="text-xs text-slate-600 font-medium">
                  Enter your registered email address. A <b>direct password reset link</b> will be dispatched via Nodemailer directly to your Gmail inbox.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmailInput}
                    onChange={(e) => setResetEmailInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0A2412] to-[#12401E] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" /> {loading ? 'Sending to Gmail Inbox...' : 'Send Password Reset Link to Gmail Inbox'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default LoginPage;
