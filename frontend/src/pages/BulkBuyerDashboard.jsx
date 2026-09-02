import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Building2,
  Award,
  Users,
  CheckCircle2,
  Layers,
  MapPin,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  DollarSign,
  Package,
  Calendar,
  Truck,
} from 'lucide-react';

const BulkBuyerDashboard = () => {
  const [cropName, setCropName] = useState('Tomato');
  const [quantityRequiredKg, setQuantityRequiredKg] = useState(5000);
  const [qualityGrade, setQualityGrade] = useState('GRADE_A');
  const [maxBudgetPerKg, setMaxBudgetPerKg] = useState(30);
  const [district, setDistrict] = useState('Delhi NCR');

  const [activeRequest, setActiveRequest] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders');
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderSuccess('');

    try {
      // 1. Create procurement request
      const { data: reqRes } = await API.post('/bulk/requests', {
        cropName,
        quantityRequiredKg: Number(quantityRequiredKg),
        qualityGrade,
        maxBudgetPerKg: Number(maxBudgetPerKg),
        deliveryLocation: { city: 'Delhi', district, state: 'Delhi', lat: 28.6139, lng: 77.2090 },
        requiredDeliveryDate: '2026-09-07',
      });

      if (reqRes.success) {
        setActiveRequest(reqRes.request);
        // 2. Fetch AI Smart Matches & Aggregation package
        const { data: matchRes } = await API.get(`/bulk/requests/${reqRes.request._id}/match`);
        if (matchRes.success) {
          setMatchData(matchRes);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceAggregatedOrder = async () => {
    if (!matchData || !matchData.aggregationPackage) return;

    setLoading(true);
    try {
      const agg = matchData.aggregationPackage;
      const items = agg.suppliers.map((s) => ({
        listingId: s.listingId,
        quantityKg: s.allocatedQuantityKg,
      }));

      const { data } = await API.post('/orders', {
        items,
        procurementRequestId: activeRequest._id,
        deliveryAddress: { street: 'Sector 62 DC', city: 'Noida', state: 'Delhi NCR', pincode: '201301' },
      });

      if (data.success) {
        setOrderSuccess(`Bulk Order #${data.order.orderNumber} placed successfully! 5,000 kg aggregated across 3 farmer listings.`);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalProcurementSpend = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 485000);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Bulk Procurement Engine 🏬</h1>
          <p className="text-xs text-slate-500 font-medium">FreshMart Supermarkets Procurement Command & AI Smart Matching Engine</p>
        </div>

        {orderSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-agri-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-700" /> {orderSuccess}</span>
          </div>
        )}

        {/* 4 Procurement Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Total Procurement Spend</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{totalProcurementSpend.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Direct Farmer Sourcing
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Volume Sourced</span>
              <Package className="w-4 h-4 text-agri-accent" />
            </div>
            <p className="text-2xl font-black text-slate-900">18,500 kg</p>
            <span className="text-[10px] font-bold text-slate-500">Grade A Quality</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Fulfilled Bulk Orders</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">12 Contracts</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Zero Default Rate
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Active Escrow Funds</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">₹1,20,000</p>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Protected Escrow
            </span>
          </div>
        </div>

        {/* Request Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-agri-primary" /> Create Bulk Procurement Request
          </h3>

          <form onSubmit={handleCreateRequest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crop Needed</label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="Tomato">Tomato</option>
                <option value="Potato">Potato</option>
                <option value="Onion">Onion</option>
                <option value="Wheat">Wheat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Qty (kg)</label>
              <input
                type="number"
                value={quantityRequiredKg}
                onChange={(e) => setQuantityRequiredKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Max Budget (₹/kg)</label>
              <input
                type="number"
                value={maxBudgetPerKg}
                onChange={(e) => setMaxBudgetPerKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="GRADE_A">Grade A (Premium)</option>
                <option value="GRADE_B">Grade B (Standard)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-agri-gold" /> Run AI Matching
            </button>
          </form>
        </div>

        {/* AI Smart Matching & Aggregation Results */}
        {matchData && (
          <div className="space-y-6">
            {/* Section 1: Order Aggregation Package */}
            <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 p-6 rounded-3xl text-white shadow-agri-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-agri-gold" />
                  <h3 className="text-base font-bold text-white">Multi-Farmer Order Aggregation Package</h3>
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  {matchData.aggregationPackage.suppliersCount} Farmer Lots Pooled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matchData.aggregationPackage.suppliers.map((s, idx) => (
                  <div key={idx} className="bg-white/10 p-4 rounded-2xl border border-white/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">{s.farmerName}</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">{s.batchId}</span>
                    </div>
                    <p className="text-xs font-extrabold text-white">
                      Allocated: {s.allocatedQuantityKg.toLocaleString()} kg @ ₹{s.pricePerKg}/kg
                    </p>
                    <p className="text-[10px] text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" /> {s.location} • Trust: {s.trustScore}/100
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-300">Aggregated Quantity: <b>{matchData.aggregationPackage.aggregatedQuantityKg.toLocaleString()} kg</b></p>
                  <p className="text-xl font-black text-agri-light">
                    Grand Total: ₹{matchData.aggregationPackage.totalGrandCost.toLocaleString()}{' '}
                    <span className="text-xs text-slate-300 font-normal">(Includes logistics & cold chain)</span>
                  </p>
                </div>

                <button
                  onClick={handlePlaceAggregatedOrder}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-2xl bg-agri-gold hover:bg-amber-500 text-slate-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" /> Confirm & Place Aggregated Order
                </button>
              </div>
            </div>

            {/* Section 2: AI Smart Matching Score Matrix */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" /> Individual AI Match Scoring Matrix
              </h3>

              <div className="space-y-4">
                {matchData.matches.map((m) => (
                  <div key={m.listingId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">{m.farmer.name}</span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Match Score: {m.matchScore}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {m.cropName} ({m.grade}) • ₹{m.pricePerKg}/kg • {m.availableQuantityKg.toLocaleString()} kg available
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>Price Match: <b>{m.breakdown.priceScore}%</b></span>
                        <span>Distance Match: <b>{m.breakdown.distanceScore}%</b></span>
                        <span>Quality Match: <b>{m.breakdown.qualityScore}%</b></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 block">Estimated Distance</span>
                      <span className="text-sm font-black text-slate-900">~{m.estimatedDistanceKm} km</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Purchase Orders History Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> My Bulk Procurement Orders History
            </h3>
            <span className="text-xs text-slate-500 font-bold">{orders.length} Orders Placed</span>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400">No bulk orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Items Purchased</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Payment Escrow</th>
                    <th className="pb-3">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50 font-medium text-slate-700">
                      <td className="py-3 font-mono font-bold text-slate-900">#{o.orderNumber}</td>
                      <td className="py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 font-bold text-emerald-700">
                        {o.items.map((i) => `${i.quantityKg} kg ${i.cropName}`).join(', ')}
                      </td>
                      <td className="py-3 font-black text-slate-900">₹{o.totalAmount?.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BulkBuyerDashboard;
