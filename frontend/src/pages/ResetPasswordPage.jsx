import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import { Sprout, Key, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    if (emailParam) setEmail(emailParam);
    if (otpParam) setOtp(otpParam);
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-otp-reset-password', {
        email,
        otp,
        newPassword,
      });

      if (data.success) {
        setSuccessMsg(data.message || 'Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to verify OTP or update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F6F4]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
          <div>
            <div className="w-10 h-10 rounded-xl bg-agri-dark text-white flex items-center justify-center font-bold mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Reset Account Password</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Verified OTP email link authentication for KisanSetu AI
            </p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-emerald-600" /> Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-agri-primary"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> 6-Digit Email Verification OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-agri-primary"
                placeholder="849201"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying OTP & Updating...' : 'Verify OTP & Reset Password'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-agri-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;
