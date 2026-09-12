import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import {
  Sprout,
  Home,
  Menu,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Search,
  ChevronDown,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Building2,
  Lock,
  Key,
  CheckCircle2,
  X,
  FileText,
  Save,
  CreditCard,
  Truck,
  Sparkles,
  TrendingUp,
  Package,
  PackagePlus,
} from 'lucide-react';

const Navbar = () => {
  const { user, setUser, logout, role } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('PERSONAL'); // 'PERSONAL' | 'BUSINESS' | 'SECURITY' | 'ORDERS'

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getNavLinks = () => {
    if (!user) {
      return [
        {
          label: 'Home',
          path: '/',
          icon: Home,
          isActive: (pathname) => pathname === '/',
        },
        {
          label: 'Market Intelligence',
          path: '/market-intelligence',
          icon: TrendingUp,
          isActive: (pathname) =>
            pathname === '/market-intelligence' ||
            pathname.startsWith('/farmer/market-intelligence') ||
            pathname.startsWith('/farmer/demand-forecast') ||
            pathname.startsWith('/farmer/price-recommendation'),
        },
        {
          label: 'Batch QR Trace',
          path: '/trace/KS-BATCH-994821',
          icon: ShieldCheck,
          isActive: (pathname) => pathname.startsWith('/trace'),
        },
      ];
    }

    switch (role) {
      case 'FARMER':
        return [
          {
            label: 'Home',
            path: '/',
            icon: Home,
            isActive: (pathname) => pathname === '/',
          },
          {
            label: 'Dashboard',
            path: '/farmer/dashboard',
            icon: LayoutDashboard,
            isActive: (pathname) => pathname === '/farmer/dashboard',
          },
          {
            label: 'My Produce',
            path: '/farmer/produce',
            icon: Package,
            isActive: (pathname) => pathname === '/farmer/produce',
          },
          {
            label: 'Add Produce',
            path: '/farmer/add-produce',
            icon: PackagePlus,
            isActive: (pathname) => pathname === '/farmer/add-produce',
          },
          {
            label: 'Market Intelligence',
            path: '/market-intelligence',
            icon: TrendingUp,
            isActive: (pathname) =>
              pathname === '/market-intelligence' ||
              pathname.startsWith('/farmer/market-intelligence') ||
              pathname.startsWith('/farmer/demand-forecast') ||
              pathname.startsWith('/farmer/price-recommendation'),
          },
        ];

      case 'FPO':
        return [
          {
            label: 'Home',
            path: '/',
            icon: Home,
            isActive: (pathname) => pathname === '/',
          },
          {
            label: 'FPO Hub',
            path: '/fpo/dashboard',
            icon: LayoutDashboard,
            isActive: (pathname) => pathname === '/fpo/dashboard',
          },
          {
            label: 'Add Bulk Listing',
            path: '/farmer/add-produce',
            icon: PackagePlus,
            isActive: (pathname) => pathname === '/farmer/add-produce',
          },
          {
            label: 'Market Intelligence',
            path: '/market-intelligence',
            icon: TrendingUp,
            isActive: (pathname) =>
              pathname === '/market-intelligence' ||
              pathname.startsWith('/farmer/market-intelligence') ||
              pathname.startsWith('/farmer/demand-forecast') ||
              pathname.startsWith('/farmer/price-recommendation'),
          },
          {
            label: 'Batch QR Trace',
            path: '/trace/KS-BATCH-994821',
            icon: ShieldCheck,
            isActive: (pathname) => pathname.startsWith('/trace'),
          },
        ];

      case 'BULK_BUYER':
        return [
          {
            label: 'Home',
            path: '/',
            icon: Home,
            isActive: (pathname) => pathname === '/',
          },
          {
            label: 'Procurement Engine',
            path: '/buyer/procurement',
            icon: Building2,
            isActive: (pathname) => pathname === '/buyer/procurement',
          },
          {
            label: 'Market Intelligence',
            path: '/market-intelligence',
            icon: TrendingUp,
            isActive: (pathname) =>
              pathname === '/market-intelligence' ||
              pathname.startsWith('/farmer/market-intelligence') ||
              pathname.startsWith('/farmer/demand-forecast') ||
              pathname.startsWith('/farmer/price-recommendation'),
          },
          {
            label: 'Batch QR Trace',
            path: '/trace/KS-BATCH-994821',
            icon: ShieldCheck,
            isActive: (pathname) => pathname.startsWith('/trace'),
          },
        ];

      case 'LOGISTICS':
        return [
          {
            label: 'Home',
            path: '/',
            icon: Home,
            isActive: (pathname) => pathname === '/',
          },
          {
            label: 'Logistics Hub',
            path: '/logistics/dashboard',
            icon: Truck,
            isActive: (pathname) => pathname === '/logistics/dashboard',
          },
          {
            label: 'Batch QR Trace',
            path: '/trace/KS-BATCH-994821',
            icon: ShieldCheck,
            isActive: (pathname) => pathname.startsWith('/trace'),
          },
        ];

      case 'ADMIN':
        return [
          {
            label: 'Home',
            path: '/',
            icon: Home,
            isActive: (pathname) => pathname === '/',
          },
          {
            label: 'Admin Command',
            path: '/admin/dashboard',
            icon: LayoutDashboard,
            isActive: (pathname) => pathname === '/admin/dashboard',
          },
          {
            label: 'Market Intelligence',
            path: '/market-intelligence',
            icon: TrendingUp,
            isActive: (pathname) =>
              pathname === '/market-intelligence' ||
              pathname.startsWith('/farmer/market-intelligence') ||
              pathname.startsWith('/farmer/demand-forecast') ||
              pathname.startsWith('/farmer/price-recommendation'),
          },
          {
            label: 'Batch QR Trace',
            path: '/trace/KS-BATCH-994821',
            icon: ShieldCheck,
            isActive: (pathname) => pathname.startsWith('/trace'),
          },
        ];

      case 'BUYER':
      case 'CONSUMER':
      default:
        return [
          {
            label: 'Home',
            path: '/',
            icon: Home,
            isActive: (pathname) => pathname === '/',
          },
          {
            label: 'Marketplace',
            path: '/marketplace',
            icon: Search,
            isActive: (pathname) => pathname === '/marketplace' || pathname.startsWith('/product/'),
          },
          {
            label: 'Market Intelligence',
            path: '/market-intelligence',
            icon: TrendingUp,
            isActive: (pathname) =>
              pathname === '/market-intelligence' ||
              pathname.startsWith('/farmer/market-intelligence') ||
              pathname.startsWith('/farmer/demand-forecast') ||
              pathname.startsWith('/farmer/price-recommendation'),
          },
          {
            label: 'Batch QR Trace',
            path: '/trace/KS-BATCH-994821',
            icon: ShieldCheck,
            isActive: (pathname) => pathname.startsWith('/trace'),
          },
        ];
    }
  };

  const navLinks = getNavLinks();

  // Editable Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Editable Role Details
  const [farmSizeAcres, setFarmSizeAcres] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [cropsGrown, setCropsGrown] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');

  // FPO / Buyer / Logistics details
  const [orgName, setOrgName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [numberOfMemberFarmers, setNumberOfMemberFarmers] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleCapacityKg, setVehicleCapacityKg] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Alerts
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setPincode(user.address?.pincode || '');

      const pd = user.profileDetails || {};
      setFarmSizeAcres(pd.farmSizeAcres || 4);
      setVillage(pd.location?.village || 'Kheri');
      setDistrict(pd.location?.district || 'Karnal');
      setCropsGrown(Array.isArray(pd.cropsGrown) ? pd.cropsGrown.join(', ') : 'Tomato, Wheat');
      setAccountNumber(pd.bankDetails?.accountNumber || '998877665544');
      setIfscCode(pd.bankDetails?.ifscCode || 'SBIN0001234');
      setBankName(pd.bankDetails?.bankName || 'State Bank of India');

      setOrgName(pd.orgName || 'Punjab Kisan Producer Co-op');
      setRegistrationNumber(pd.registrationNumber || 'FPO-PB-2023-991');
      setNumberOfMemberFarmers(pd.numberOfMemberFarmers || 240);

      setBusinessName(pd.businessName || 'FreshMart Supermarkets Ltd');
      setGstNumber(pd.gstNumber || '07AAAAA1234A1Z2');

      setVehicleNumber(pd.vehicleNumber || 'HR-05-CC-9988');
      setVehicleType(pd.vehicleType || 'REFRIGERATED_TRUCK');
      setVehicleCapacityKg(pd.vehicleCapacityKg || 8000);
    }
  }, [user, profileModalOpen]);

  const getDashboardPath = () => {
    if (!role) return '/login';
    switch (role) {
      case 'FARMER':
        return '/farmer/dashboard';
      case 'FPO':
        return '/fpo/dashboard';
      case 'BULK_BUYER':
        return '/buyer/procurement';
      case 'LOGISTICS':
        return '/logistics/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/marketplace';
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'FARMER':
        return { label: 'Farmer Producer', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'FPO':
        return { label: 'FPO Co-op Leader', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'BULK_BUYER':
        return { label: 'Bulk Supermarket Buyer', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'LOGISTICS':
        return { label: 'Cold-Chain Logistics', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'ADMIN':
        return { label: 'Govt Agriculture Admin', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: 'Retail Consumer', color: 'bg-green-100 text-green-800 border-green-300' };
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');
    setLoading(true);

    try {
      const payload = {
        email, // Email & address editable
        address: { street, city, state, pincode },
        profileDetails: {
          farmSizeAcres: Number(farmSizeAcres),
          village,
          district,
          state,
          cropsGrown: typeof cropsGrown === 'string' ? cropsGrown.split(',').map((c) => c.trim()) : cropsGrown,
          bankDetails: {
            accountNumber,
            ifscCode,
            bankName,
            accountHolderName: name,
          },
          orgName,
          registrationNumber,
          numberOfMemberFarmers: Number(numberOfMemberFarmers),
          businessName,
          gstNumber,
          vehicleNumber,
          vehicleType,
          vehicleCapacityKg: Number(vehicleCapacityKg),
        },
      };

      const { data } = await API.put('/auth/profile', payload);
      if (data.success) {
        setUser(data.user);
        setSaveSuccess('Email, address and profile details updated successfully!');
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaveSuccess('');
    setSaveError('');

    if (newPassword !== confirmPassword) {
      setSaveError('New password and confirm password do not match!');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (data.success) {
        setSaveSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Current password does not match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand Link to Home */}
            <Link
              to="/"
              aria-label="KisanSetu Home"
              title="KisanSetu Home - Return to Landing Page"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-agri-primary/20 rounded-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-agri-dark via-agri-primary to-agri-accent flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-agri-dark via-agri-primary to-agri-accent bg-clip-text text-transparent">
                  KisanSetu<span className="text-agri-gold font-extrabold ml-0.5">AI</span>
                </span>
                <p className="text-[10px] font-medium text-slate-500 tracking-wider uppercase -mt-1">
                  Predict • Connect • Aggregate
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2 text-sm font-medium" aria-label="Global Navigation">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = item.isActive(location.pathname);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-emerald-50 text-agri-dark font-extrabold border border-emerald-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-agri-primary hover:bg-slate-50 font-semibold'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-700 stroke-[2.5]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" aria-hidden="true" />
                    )}
                    {active && <span className="sr-only">(Current Page)</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Authenticated Buyer Cart Icon (Available only for Purchaser / Buyer / Consumer roles) */}
              {Boolean(user) && ['CONSUMER', 'BUYER', 'BULK_BUYER'].includes(role) && (
                <Link
                  to="/cart"
                  className="relative p-2 rounded-xl text-slate-600 hover:text-agri-primary hover:bg-slate-100 transition-all"
                  title="View Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-agri-accent text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Profile Photo Trigger */}
              {user ? (
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-agri-primary/40 hover:bg-emerald-50/60 transition-all cursor-pointer shadow-sm group"
                  title="Click to view profile, manage email, address & password"
                >
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover border-2 border-agri-primary/30 group-hover:scale-105 transition-transform"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-extrabold text-slate-900 leading-tight">{user.name}</p>
                    <span className={`inline-block text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${getRoleBadge().color}`}>
                      {getRoleBadge().label}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-agri-primary" />
                </button>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-2 text-xs font-bold text-agri-dark hover:text-agri-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-agri-dark to-agri-primary hover:to-agri-accent rounded-xl shadow-agri-sm hover:shadow-agri-md transition-all"
                  >
                    Register Free
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-agri-primary hover:bg-slate-100 transition-all focus:outline-none"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-emerald-900/10 px-4 pt-2 pb-4 shadow-md space-y-1 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = item.isActive(location.pathname);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs transition-all ${
                    active
                      ? 'bg-emerald-50 text-agri-dark font-extrabold border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-agri-primary hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-700 stroke-[2.5]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                      Active
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Enterprise Profile & Account Management Modal */}
      {profileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-agri-gold shadow-md"
                />
                <div>
                  <h2 className="text-xl font-black text-white">{user.name}</h2>
                  <p className="text-xs text-emerald-300 font-medium">{user.email}</p>
                  <span className="inline-block mt-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {user.role} ACCOUNT MANAGEMENT
                  </span>
                </div>
              </div>

              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-6 pt-3 text-xs font-bold">
              <button
                onClick={() => setActiveTab('PERSONAL')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'PERSONAL'
                    ? 'border-agri-primary text-agri-primary font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" /> Personal & Address
              </button>

              <button
                onClick={() => setActiveTab('BUSINESS')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'BUSINESS'
                    ? 'border-agri-primary text-agri-primary font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" /> Role & Business Info
              </button>

              <button
                onClick={() => setActiveTab('SECURITY')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'SECURITY'
                    ? 'border-agri-primary text-agri-primary font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Key className="w-4 h-4" /> Change Password
              </button>

              <button
                onClick={() => setActiveTab('ORDERS')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'ORDERS'
                    ? 'border-agri-primary text-agri-primary font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" /> Transactions Log
              </button>
            </div>

            {/* Notification Alerts */}
            {saveSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="mx-6 mt-4 p-3 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2">
                <X className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
              {/* TAB 1: PERSONAL DETAILS (STRICT FRAUD PREVENTION: NAME & PHONE LOCKED) */}
              {activeTab === 'PERSONAL' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-[11px] font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      <b>Identity Fraud Security Lock Active:</b> Full Name, Registered Phone Number, and Role are permanently verified and locked. Only Email & Address can be modified.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                        Full Name <Lock className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        disabled
                        value={name}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (Editable)
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-agri-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                        Verified Mobile Phone <Lock className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        disabled
                        value={phone}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Street Address (Editable)
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                        placeholder="Kheri Village / GT Road"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">City / District</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Email & Address Changes
                  </button>
                </form>
              )}

              {/* TAB 2: ROLE-SPECIFIC BUSINESS DETAILS */}
              {activeTab === 'BUSINESS' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {role === 'FARMER' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Farm Size (Acres)</label>
                          <input
                            type="number"
                            value={farmSizeAcres}
                            onChange={(e) => setFarmSizeAcres(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Primary Crops Grown</label>
                          <input
                            type="text"
                            value={cropsGrown}
                            onChange={(e) => setCropsGrown(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                            placeholder="Tomato, Wheat, Potato"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                        <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-700" /> Direct Escrow Bank Account Payout Info
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Account Number</label>
                            <input
                              type="text"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">IFSC Code</label>
                            <input
                              type="text"
                              value={ifscCode}
                              onChange={(e) => setIfscCode(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'FPO' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">FPO Org Name</label>
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Govt Reg Number</label>
                        <input
                          type="text"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {role === 'BULK_BUYER' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">GST Number</label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {role === 'LOGISTICS' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Reg Number</label>
                        <input
                          type="text"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Payload Capacity (kg)</label>
                        <input
                          type="number"
                          value={vehicleCapacityKg}
                          onChange={(e) => setVehicleCapacityKg(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-agri-sm transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Business Profile Details
                  </button>
                </form>
              )}

              {/* TAB 3: SECURITY & PASSWORD CHANGE */}
              {activeTab === 'SECURITY' && (
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <p className="text-xs text-slate-600 font-medium">
                    Change your password by entering your current password below. If you forgot your password, use the <b>Forgot Password</b> link on the Sign In page.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary"
                      placeholder="••••••••"
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
                    className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" /> Change Account Password
                  </button>
                </form>
              )}

              {/* TAB 4: ORDERS & TRANSACTIONS OVERVIEW */}
              {activeTab === 'ORDERS' && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Total Account Activity</span>
                      <span className="font-black text-slate-900">18 Direct Orders Verified</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Direct Escrow Protection</span>
                      <span className="font-extrabold text-emerald-700">100% Guaranteed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Modal Footer (Redundant dashboard button removed) */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">KisanSetu AI Security Policy Compliance Active</span>
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
