import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import {
  Sprout,
  UserCheck,
  ShieldCheck,
  Building2,
  Truck,
  Store,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Key,
  X,
  ArrowRight,
  Phone,
} from 'lucide-react';

import { fetchLocationByPincode, getCurrentGpsLocation } from '../services/locationService';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('FARMER');

  // Real Address & Location Tracing
  const [street, setStreet] = useState('');
  const [pincode, setPincode] = useState('110001');
  const [city, setCity] = useState('Delhi');
  const [state, setState] = useState('Delhi');
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);

  // Area Options for typed pincode
  const [areaOptions, setAreaOptions] = useState([]);
  const [selectedAreaName, setSelectedAreaName] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [locationErrorMsg, setLocationErrorMsg] = useState('');

  // Role details
  const [farmSizeAcres, setFarmSizeAcres] = useState(5);
  const [orgName, setOrgName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // OTP Verification States
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { register, setUser } = useAuth();
  const navigate = useNavigate();

  // Handle Pincode Typing / Lookup via official India Post API
  const handlePincodeLookup = async (val) => {
    setPincode(val);
    setLocationSuccessMsg('');
    setLocationErrorMsg('');
    setAreaOptions([]);
    setSelectedAreaName('');

    if (val.trim().length === 6 && !isNaN(Number(val))) {
      setPincodeLoading(true);
      const res = await fetchLocationByPincode(val);
      setPincodeLoading(false);

      if (res.success) {
        setCity(res.district);
        setState(res.state);
        setLat(res.lat);
        setLng(res.lng);
        setAreaOptions(res.areaOptions || []);
        if (res.areaOptions && res.areaOptions.length > 0) {
          setSelectedAreaName(res.areaOptions[0].name);
        }
        setLocationSuccessMsg(`📍 Pincode ${val} verified via India Post API! District: ${res.district}, State: ${res.state}`);
      } else {
        setLocationErrorMsg(res.message);
      }
    }
  };

  // Handle GPS Location Button Click
  const handleUseGpsLocation = async () => {
    setGpsLoading(true);
    setLocationSuccessMsg('');
    setLocationErrorMsg('');
    try {
      const loc = await getCurrentGpsLocation();
      setLat(loc.lat);
      setLng(loc.lng);
      setPincode(loc.pincode);
      setCity(loc.district);
      setState(loc.state);
      if (loc.street) setStreet(loc.street);

      setLocationSuccessMsg(`🎯 Live GPS Acquired: ${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E (${loc.district}, ${loc.state})`);
    } catch (err) {
      setLocationErrorMsg(err.message || 'Failed to acquire GPS location.');
    } finally {
      setGpsLoading(false);
    }
  };

  // Step 1: Send OTP to Email/Phone
  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setInputOtp('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/send-registration-otp', {
        name,
        email,
        phone,
      });

      if (data.success) {
        setSuccessMsg(data.message || `Verification OTP code dispatched to ${email}!`);
        setOtpModalOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send registration OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    setError('');
    setSuccessMsg('');
    setResending(true);
    setInputOtp('');

    try {
      const { data } = await API.post('/auth/send-registration-otp', {
        name,
        email,
        phone,
      });

      if (data.success) {
        setSuccessMsg(`New verification code dispatched to ${email}!`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP & Create Account
  const handleVerifyOTPAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        address: { street, city, state, pincode, lat, lng },
        profileDetails: {
          farmSizeAcres: Number(farmSizeAcres),
          orgName,
          businessName,
          vehicleNumber,
        },
        otp: inputOtp.trim(),
      };

      const { data } = await API.post('/auth/verify-registration-otp', payload);

      if (data.success) {
        localStorage.setItem('kisansetu_token', data.token);
        setUser(data.user);
        setOtpModalOpen(false);

        if (role === 'FARMER') navigate('/farmer/dashboard');
        else if (role === 'FPO') navigate('/fpo/dashboard');
        else if (role === 'BULK_BUYER') navigate('/buyer/procurement');
        else if (role === 'LOGISTICS') navigate('/logistics/dashboard');
        else navigate('/marketplace');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F6F4]">
        <div className="max-w-3xl w-full bg-white rounded-3xl p-8 sm:p-10 shadow-agri-lg border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-agri-dark text-white flex items-center justify-center font-bold mb-2">
                <Sprout className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Create KisanSetu AI Account</h2>
              <p className="text-xs text-slate-500 font-medium">Real-Time Verified Role-Based Registration</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-2">Select Your Platform Role:</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { id: 'FARMER', label: '🌾 Farmer', desc: 'Sell Crop Lots' },
                { id: 'FPO', label: '🏬 FPO Co-op', desc: 'Aggregate Produce' },
                { id: 'BULK_BUYER', label: '🏬 Bulk Buyer', desc: 'Supermarket Procurement' },
                { id: 'LOGISTICS', label: '🚚 Logistics', desc: 'Cold Transport' },
                { id: 'CONSUMER', label: '🛒 Consumer', desc: 'Direct Buy' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === item.id
                      ? 'border-agri-primary bg-emerald-50 text-agri-dark font-black shadow-sm ring-2 ring-agri-primary/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="font-extrabold">{item.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleInitiateRegistration} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-agri-primary"
                  placeholder="Ramesh Kumar"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-agri-primary"
                  placeholder="amanpandey10a3@gmail.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-agri-primary"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  placeholder="Kheri Village / GT Road"
                />
              </div>
            </div>

            {/* Real Pincode & GPS Location Tracing Section */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
                <div>
                  <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>📍 Real Location Tracing (Pincode or GPS)</span>
                    <span className="bg-emerald-200 text-emerald-950 text-[10px] px-2 py-0.5 rounded-full font-bold">India Post API Verified</span>
                  </label>
                  <p className="text-[10px] text-slate-500 font-medium">Enter ANY 6-digit Indian Pincode OR click GPS to trace your exact coordinates.</p>
                </div>

                <button
                  type="button"
                  onClick={handleUseGpsLocation}
                  disabled={gpsLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <span>🎯 {gpsLoading ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
                </button>
              </div>

              {locationSuccessMsg && (
                <div className="p-2.5 bg-emerald-100/90 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>{locationSuccessMsg}</span>
                </div>
              )}

              {locationErrorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{locationErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Enter Any 6-Digit Pincode:</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength="6"
                      value={pincode}
                      onChange={(e) => handlePincodeLookup(e.target.value)}
                      placeholder="e.g. 110016, 132001, 800001, 400001"
                      className="w-full px-4 py-2 rounded-xl border border-emerald-300 text-xs font-black text-slate-900 bg-white focus:ring-2 focus:ring-agri-primary focus:outline-none"
                    />
                    {pincodeLoading && (
                      <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 animate-pulse">
                        Verifying...
                      </span>
                    )}
                  </div>
                </div>

                {/* Area / Post Office Dropdown (if multiple post offices returned for this pincode) */}
                {areaOptions.length > 0 ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Exact Area / Post Office:</label>
                    <select
                      value={selectedAreaName}
                      onChange={(e) => setSelectedAreaName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white focus:ring-2 focus:ring-agri-primary"
                    >
                      {areaOptions.map((area, idx) => (
                        <option key={idx} value={area.name}>
                          {area.name} ({area.district}, {area.state})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-800 text-[11px]">
                      <span>Traced District &amp; State:</span>
                      <span className="text-emerald-700 font-extrabold">{city}, {state}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      GPS Coordinates: <span className="font-mono text-slate-900 font-bold">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Role-Specific Field */}
            {role === 'FARMER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Farm Size (Acres)</label>
                <input
                  type="number"
                  value={farmSizeAcres}
                  onChange={(e) => setFarmSizeAcres(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Dispatching Verification OTP...' : 'Register & Send Verification OTP →'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-agri-primary hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>

      {/* Real-Time OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-agri-primary" />
                <h3 className="text-base font-extrabold text-slate-900">Verify Real-Time Registration OTP</h3>
              </div>
              <button
                onClick={() => setOtpModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTPAndRegister} className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Enter the <b>6-digit verification OTP code</b> sent to <b>{email}</b>:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Verification OTP Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-mono font-black tracking-widest text-slate-900 focus:ring-2 focus:ring-agri-primary focus:border-emerald-600"
                  placeholder="874053"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Didn't receive code?</span>
                <button
                  type="button"
                  disabled={resending || loading}
                  onClick={handleResendOTP}
                  className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {resending ? 'Dispatching new OTP...' : 'Resend Verification Code ↻'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || inputOtp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying & Creating Account...' : 'Verify OTP & Complete Registration ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default RegisterPage;
