import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  LayoutDashboard,
  PackagePlus,
  Package,
  TrendingUp,
  Award,
  Truck,
  Building2,
  Users,
  Settings,
  AlertTriangle,
  LogOut,
  QrCode,
  DollarSign,
  BarChart3,
  FileCheck2,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    switch (role) {
      case 'FARMER':
        return [
          { label: 'Overview', path: '/farmer/dashboard', icon: LayoutDashboard },
          { label: 'Market Intelligence', path: '/market-intelligence', icon: BarChart3 },
          { label: 'Add Produce Listing', path: '/farmer/add-produce', icon: PackagePlus },
          { label: 'My Listings', path: '/farmer/produce', icon: Package },
          { label: 'Demand Forecast', path: '/farmer/demand-forecast', icon: TrendingUp },
          { label: 'Price Recommendation', path: '/farmer/price-recommendation', icon: DollarSign },
          { label: 'Quality & Trust', path: '/farmer/quality', icon: Award },
        ];
      case 'FPO':
        return [
          { label: 'FPO Overview', path: '/fpo/dashboard', icon: LayoutDashboard },
          { label: 'Market Intelligence', path: '/market-intelligence', icon: BarChart3 },
          { label: 'Member Farmers', path: '/fpo/dashboard', icon: Users },
          { label: 'Bulk Listings', path: '/farmer/add-produce', icon: PackagePlus },
          { label: 'Regional Supply', path: '/farmer/demand-forecast', icon: TrendingUp },
        ];
      case 'BULK_BUYER':
        return [
          { label: 'Procurement Engine', path: '/buyer/procurement', icon: Building2 },
          { label: 'Market Intelligence', path: '/market-intelligence', icon: BarChart3 },
          { label: 'Smart Matches & Orders', path: '/buyer/procurement', icon: Award },
        ];
      case 'LOGISTICS':
        return [
          { label: 'Logistics Overview', path: '/logistics/dashboard', icon: Truck },
          { label: 'Pickup Verification', path: '/logistics/dashboard', icon: FileCheck2 },
          { label: 'Route Map', path: '/logistics/dashboard', icon: QrCode },
        ];
      case 'ADMIN':
        return [
          { label: 'Govt Intelligence', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Purchase Limits', path: '/admin/dashboard', icon: Settings },
          { label: 'Surplus Heatmap', path: '/admin/dashboard', icon: BarChart3 },
          { label: 'Disputes', path: '/admin/dashboard', icon: AlertTriangle },
        ];
      default:
        return [{ label: 'Marketplace', path: '/marketplace', icon: Package }];
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Dashboard Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-6 sticky top-24">
              {/* Profile Header */}
              {user ? (
                <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                  <img
                    src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-agri-primary/20 shadow-sm"
                  />
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">{user?.name}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {role}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60 text-center space-y-2 pb-5 border-b border-slate-100">
                  <p className="text-xs font-bold text-emerald-950">Public Discovery Mode</p>
                  <p className="text-[11px] text-slate-600">Sign in to unlock personalized farm decision support & mandi optimization.</p>
                  <Link
                    to="/login"
                    className="inline-block px-4 py-1.5 rounded-xl bg-agri-primary text-white text-xs font-bold shadow-sm hover:bg-agri-dark transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                {getNavItems().map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path + item.label}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-agri-dark to-agri-primary text-white shadow-agri-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-agri-primary'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-agri-light' : 'text-slate-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              {user ? (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full text-center px-4 py-2 rounded-xl bg-agri-primary text-white text-xs font-bold shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Register Free
                  </Link>
                </div>
              )}
            </div>
          </aside>

          {/* Main Dashboard Content - Full height scrollable */}
          <main className="lg:col-span-9 space-y-6 pb-16">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
