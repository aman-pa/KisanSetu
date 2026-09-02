import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  LayoutDashboard,
  Users,
  Settings,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Package,
} from 'lucide-react';

const AdminDashboard = () => {
  const [adminStats, setAdminStats] = useState(null);
  const [surplusAlerts, setSurplusAlerts] = useState([]);
  const [purchaseLimitInput, setPurchaseLimitInput] = useState('10');
  const [loading, setLoading] = useState(true);
  const [configSuccess, setConfigSuccess] = useState('');

  const fetchAdminData = async () => {
    try {
      const { data } = await API.get('/admin/dashboard');
      if (data.success) {
        setAdminStats(data.stats);
        setSurplusAlerts(data.surplusShortageAlerts);
        setPurchaseLimitInput(String(data.stats.config.consumerMaxPurchaseLimitKg || 10));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    setConfigSuccess('');
    try {
      const { data } = await API.put('/admin/config/purchase-limit', {
        maxLimitKg: Number(purchaseLimitInput),
      });

      if (data.success) {
        setConfigSuccess(`Consumer max purchase limit updated to ${purchaseLimitInput} kg successfully!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-xs font-bold text-slate-400">Loading government intelligence analytics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Government & Platform Intelligence Hub 🏛️</h1>
          <p className="text-xs text-slate-500">Ministry of Agriculture platform analytics, regional surplus heatmap & policy limit controls</p>
        </div>

        {configSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-agri-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>{configSuccess}</span>
          </div>
        )}

        {/* Platform Overview Stats */}
        {adminStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Registered Users</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{adminStats.users.total}</p>
              <div className="text-[10px] text-slate-500 flex gap-2">
                <span>Farmers: <b>{adminStats.users.farmers}</b></span>
                <span>FPOs: <b>{adminStats.users.fpos}</b></span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Total Produce Traded</span>
                <Package className="w-4 h-4 text-agri-accent" />
              </div>
              <p className="text-2xl font-black text-slate-900">{(adminStats.produce.totalProduceTradedKg || 18500).toLocaleString()} kg</p>
              <span className="text-[10px] font-bold text-slate-500">{adminStats.produce.activeListings} Active Listings</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Middleman Savings</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700">₹{(adminStats.financials.estimatedIntermediarySavingsValue || 52000).toLocaleString()}</p>
              <span className="text-[10px] font-bold text-emerald-800">28% Cost Optimization</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Spoilage Reduced</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700">{adminStats.financials.estimatedSpoilageWastageReducedPercentage}%</p>
              <span className="text-[10px] font-bold text-emerald-800">Direct Route Delivery</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Admin Policy Controller: Configurable Consumer Max Limit */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-agri-primary" /> Admin Configurable Purchase Limits
            </h3>

            <form onSubmit={handleUpdateLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Consumer Max Purchase Limit (kg / order)
                </label>
                <input
                  type="number"
                  required
                  value={purchaseLimitInput}
                  onChange={(e) => setPurchaseLimitInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-agri-primary focus:ring-2 focus:ring-agri-primary focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enforced on all consumer shopping carts and backend order APIs to prevent retail market cornering.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-agri-dark text-white font-bold text-xs shadow-agri-sm hover:bg-agri-primary transition-all"
              >
                Save & Enforce System Limit
              </button>
            </form>
          </div>

          {/* Regional Surplus & Shortage Heatmap Data */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-500" /> Regional Surplus & Shortage Heatmap Alerts
            </h3>

            <div className="space-y-3">
              {surplusAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border space-y-1.5 ${
                    alert.type === 'SURPLUS' ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      {alert.district}, {alert.state} ({alert.crop})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        alert.type === 'SURPLUS' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {alert.type}: {Math.abs(alert.differenceTonnes)} Tonnes
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Supply: <b>{alert.supplyTonnes}T</b> vs Demand: <b>{alert.demandTonnes}T</b>
                  </p>

                  <div className="text-[11px] font-bold text-slate-800 bg-white p-2 rounded-xl border border-slate-100">
                    💡 AI Recommendation: {alert.recommendedRedistribution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
