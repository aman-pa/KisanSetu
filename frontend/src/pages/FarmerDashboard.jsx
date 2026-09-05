import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  DollarSign,
  Package,
  CheckCircle2,
  Award,
  TrendingUp,
  PackagePlus,
  ShieldCheck,
  Calendar,
  QrCode,
  ShoppingBag,
  Truck,
  Sparkles,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DemandForecastCard from '../components/DemandForecastCard';
import PriceIntelligenceCard from '../components/PriceIntelligenceCard';
import FarmerActionCard from '../components/FarmerActionCard';

const FarmerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchFarmerData = async () => {
    try {
      const [listingsRes, ordersRes] = await Promise.all([
        API.get('/products/farmer/my-listings'),
        API.get('/orders'),
      ]);
      if (listingsRes.data.success) setListings(listingsRes.data.listings);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setActionSuccess('');
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        setActionSuccess(`Order updated to ${newStatus} successfully!`);
        fetchFarmerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const salesTrendData = [
    { month: 'Apr', earnings: 28000 },
    { month: 'May', earnings: 42000 },
    { month: 'Jun', earnings: 35000 },
    { month: 'Jul', earnings: 51000 },
    { month: 'Aug', earnings: 64000 },
    { month: 'Sep (Target)', earnings: 82000 },
  ];

  const totalEarnings = orders.reduce((sum, o) => sum + (o.totalProduceCost || 0), 184000);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-agri-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Verified Producer Dashboard
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Farmer Command Center 🌾</h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage crops, inspect AI market forecasts, and track direct escrow payments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/farmer/add-produce"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center gap-2"
            >
              <PackagePlus className="w-4 h-4" /> Add Produce Listing
            </Link>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 4 Primary KPI Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Total Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{totalEarnings.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Zero Commission Loss
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Active Listings</span>
              <Package className="w-4 h-4 text-agri-accent" />
            </div>
            <p className="text-2xl font-black text-slate-900">{listings.length || 3}</p>
            <span className="text-[10px] font-bold text-slate-500">Marketplace Listed</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Farmer Trust Score</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">94 / 100</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Top Tier Supplier
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">AI Quality Score</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">95% Avg</p>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Grade A Verified
            </span>
          </div>
        </div>

        {/* Secondary KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <span className="text-[11px] text-slate-500 font-bold block">Pending Orders</span>
            <span className="text-xl font-black text-slate-900">2 Orders</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <span className="text-[11px] text-slate-500 font-bold block">Fulfilled Lots</span>
            <span className="text-xl font-black text-emerald-700">18 Lots</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <span className="text-[11px] text-slate-500 font-bold block">Upcoming Harvest</span>
            <span className="text-xl font-black text-amber-600">In 5 Days</span>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <span className="text-[11px] text-slate-500 font-bold block">Escrow Protected</span>
            <span className="text-xl font-black text-slate-900">₹45,000</span>
          </div>
        </div>

        {/* AI Market Intelligence Banner */}
        <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 p-6 rounded-3xl text-white shadow-agri-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> High Regional Demand Alert
            </div>
            <h3 className="text-base font-extrabold text-white">Tomato demand in Delhi NCR is predicted to peak in 5 days!</h3>
            <p className="text-xs text-slate-300 font-medium">Recommended price range for Grade A Tomato: <b>₹27 – ₹29 / kg</b> (+22% profit margin vs local mandi).</p>
          </div>
          <Link
            to="/farmer/add-produce"
            className="px-6 py-3 rounded-2xl bg-agri-gold hover:bg-amber-500 text-slate-950 font-black text-xs whitespace-nowrap shadow-md transition-all"
          >
            Create Produce Listing →
          </Link>
        </div>

        {/* Phase 4: Farmer Action Intelligence & Personalized Decision Support */}
        <FarmerActionCard defaultCommodity="Wheat" defaultMandi="Karnal" />

        {/* Phase 3: AI Price Intelligence & Farmer Selling Recommendation Engine */}
        <PriceIntelligenceCard defaultCommodity="Tomato" defaultMandi="Karnal" />

        {/* Phase 2: Real Data-Driven AI Demand Forecasting Engine */}
        <DemandForecastCard defaultCommodity="Tomato" defaultDistrict="Delhi NCR" />

        {/* Sales & Revenue Analytics Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Monthly Farm Revenue & Direct Sales Growth
            </h3>
            <span className="text-xs font-bold text-emerald-700">+34% Direct Growth</span>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorEarning)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comprehensive Table 1: My Produce Listings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-agri-primary" /> My Active Produce Listings
            </h3>
            <span className="text-xs text-slate-500 font-bold">{listings.length} Listings Total</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400">Loading listings...</p>
          ) : listings.length === 0 ? (
            <p className="text-xs text-slate-400">No active produce listings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3">Crop Name</th>
                    <th className="pb-3">Batch ID</th>
                    <th className="pb-3">Grade</th>
                    <th className="pb-3">Price/kg</th>
                    <th className="pb-3">Available Qty</th>
                    <th className="pb-3">AI Quality</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 font-medium text-slate-700">
                      <td className="py-3 font-extrabold text-slate-900">{item.cropName}</td>
                      <td className="py-3 font-mono text-[11px] text-slate-500">{item.batchId}</td>
                      <td className="py-3 font-bold text-emerald-700">{item.grade.replace('GRADE_', 'Grade ')}</td>
                      <td className="py-3 font-black text-slate-900">₹{item.pricePerKg}</td>
                      <td className="py-3">{item.availableQuantityKg.toLocaleString()} kg</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {item.aiQualityEstimateScore}% Score
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/trace/${item.batchId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-agri-primary hover:underline"
                        >
                          <QrCode className="w-3.5 h-3.5" /> View QR Trace
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comprehensive Table 2: Recent Orders & Fulfillment Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Incoming Customer Orders & Dispatch Actions
            </h3>
            <span className="text-xs text-slate-500 font-bold">{orders.length} Total Orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No pending orders at this moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900">Order #{ord.orderNumber}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        STATUS: {ord.status}
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        {ord.paymentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Buyer: <b>{ord.buyer?.name || 'Customer'}</b> • Deliver to: {ord.deliveryAddress?.city}, {ord.deliveryAddress?.state}
                    </p>

                    <div className="text-xs text-slate-800 font-semibold pt-1">
                      Items: {ord.items.map((i) => `${i.quantityKg} kg ${i.cropName}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <span className="text-xs text-slate-500 block">Total Produce Value</span>
                      <span className="text-lg font-black text-agri-primary">₹{ord.totalProduceCost.toLocaleString()}</span>
                    </div>

                    {ord.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, 'ACCEPTED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Accept Order
                      </button>
                    )}

                    {ord.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, 'IN_TRANSIT')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" /> Dispatch Lot
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Harvest Schedule & Regional Price Matrix Widget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-amber-500" /> Upcoming Farm Harvest Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Tomato (Grade A) - 2,000 kg</p>
                  <p className="text-[11px] text-slate-500">Expected Harvest: In 5 Days (Sep 7)</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Est: ₹56,000
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Potato (Grade A) - 5,000 kg</p>
                  <p className="text-[11px] text-slate-500">Expected Harvest: In 10 Days (Sep 12)</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Est: ₹90,000
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-4 h-4 text-emerald-600" /> Quality Audit & Farmer Trust Metrics
            </h3>
            <div className="space-y-3 text-xs text-slate-700 font-medium">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span>Successful Delivery Rate</span>
                <span className="font-extrabold text-emerald-700">98.4%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span>Zero Quality Dispute Ratio</span>
                <span className="font-extrabold text-emerald-700">100% Clean</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span>Average Buyer Rating</span>
                <span className="font-extrabold text-amber-600">4.9 / 5.0 ★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
