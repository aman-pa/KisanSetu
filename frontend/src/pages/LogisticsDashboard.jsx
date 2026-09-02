import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Truck,
  MapPin,
  CheckCircle2,
  FileCheck2,
  Award,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Clock,
  Thermometer,
} from 'lucide-react';

const LogisticsDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pickup Verification Modal state
  const [selectedBatchId, setSelectedBatchId] = useState('KS-BATCH-994821');
  const [weightMeasured, setWeightMeasured] = useState('2000');
  const [gradeVerified, setGradeVerified] = useState('GRADE_A');
  const [comments, setComments] = useState('Farm gate weight and packaging verified clean.');

  const [verifySuccess, setVerifySuccess] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');

  const fetchLogisticsData = async () => {
    try {
      const [tasksRes, routeRes] = await Promise.all([
        API.get('/logistics/tasks'),
        API.post('/logistics/optimize', {}),
      ]);
      if (tasksRes.data.success) setTasks(tasksRes.data.orders);
      if (routeRes.data.success) setRouteData(routeRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const handleVerifyPickup = async (e) => {
    e.preventDefault();
    setVerifySuccess('');
    try {
      const { data } = await API.post('/quality/pickup', {
        batchId: selectedBatchId,
        weightKgMeasured: Number(weightMeasured),
        gradeVerified,
        comments,
      });

      if (data.success) {
        setVerifySuccess(`Pickup quality for Batch ${selectedBatchId} successfully verified! Traceability timeline updated.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdateSuccess('');
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        setStatusUpdateSuccess(`Shipment status updated to ${newStatus}!`);
        fetchLogisticsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Logistics & Cold-Chain Hub 🚚</h1>
          <p className="text-xs text-slate-500 font-medium">ColdChain Express Transport • Multi-Farm TSP Route Optimization & Quality Inspection</p>
        </div>

        {verifySuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-agri-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>{verifySuccess}</span>
          </div>
        )}

        {statusUpdateSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-agri-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>{statusUpdateSuccess}</span>
          </div>
        )}

        {/* 4 Fleet Performance Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Vehicle Fleet</span>
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-slate-900">HR-05-CC-9988</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Refrigerated Truck (8,000 kg)
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Cold Chain Temp</span>
              <Thermometer className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">4.2 °C</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Optimal Freshness Range
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Route Efficiency</span>
              <Navigation className="w-4 h-4 text-agri-accent" />
            </div>
            <p className="text-2xl font-black text-emerald-700">18.4% Fuel Saved</p>
            <span className="text-[10px] font-bold text-slate-500">TSP Multi-Pickup Opt</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">On-Time Delivery</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">99.2% Score</p>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Top Logistics Carrier
            </span>
          </div>
        </div>

        {/* TSP Route Optimization Summary */}
        {routeData && (
          <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 p-6 rounded-3xl text-white shadow-agri-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-agri-gold animate-pulse" />
                <h3 className="text-base font-bold text-white">TSP Multi-Farm Pickup Route Optimization Matrix</h3>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                {routeData.summary.costSavingsPercentage}% Fuel Savings
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                <p className="text-[11px] text-slate-300">Total Distance</p>
                <p className="text-xl font-black text-agri-light">{routeData.summary.totalDistanceKm} km</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                <p className="text-[11px] text-slate-300">Transit Duration</p>
                <p className="text-xl font-black text-agri-light">{routeData.summary.totalDurationHours} hrs</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                <p className="text-[11px] text-slate-300">Total Waypoints</p>
                <p className="text-xl font-black text-agri-gold">{routeData.summary.totalWaypoints} stops</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                <p className="text-[11px] text-slate-300">CO2 Reduced</p>
                <p className="text-xl font-black text-emerald-300">{routeData.summary.estimatedCO2ReducedKg} kg</p>
              </div>
            </div>

            {/* Waypoints Sequence List */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-300">Optimized Route Sequence:</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {routeData.route.waypoints.map((wp, idx) => (
                  <React.Fragment key={idx}>
                    <span className="bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 text-white font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-agri-gold" /> {wp.name}
                    </span>
                    {idx < routeData.route.waypoints.length - 1 && <span className="text-slate-400 font-black">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Digital Pickup Verification Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-agri-primary" /> Record Farm-Gate Quality Verification (Stage 2)
            </h3>

            <form onSubmit={handleVerifyPickup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch ID</label>
                <input
                  type="text"
                  required
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  placeholder="KS-BATCH-994821"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weighed Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={weightMeasured}
                    onChange={(e) => setWeightMeasured(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Verified Grade</label>
                  <select
                    value={gradeVerified}
                    onChange={(e) => setGradeVerified(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="GRADE_A">Grade A (Confirmed)</option>
                    <option value="GRADE_B">Grade B (Minor Defect)</option>
                    <option value="GRADE_C">Grade C (Mismatch)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inspection Comments</label>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-agri-dark text-white font-bold text-xs shadow-agri-sm hover:bg-agri-primary transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Save Stage 2 Pickup Quality Verification
              </button>
            </form>
          </div>

          {/* Active Logistics Orders & Transit Controls */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" /> Active Shipments & Status Updates
            </h3>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400">No active shipments.</p>
              ) : (
                tasks.map((t) => (
                  <div key={t._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Order #{t.orderNumber}</span>
                      <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        STATUS: {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Deliver to: <b>{t.deliveryAddress?.city}, {t.deliveryAddress?.state}</b>
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="font-black text-agri-primary text-sm">₹{t.totalAmount?.toLocaleString()}</span>

                      <div className="flex gap-2">
                        {t.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, 'IN_TRANSIT')}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px]"
                          >
                            Mark In Transit
                          </button>
                        )}

                        {t.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleUpdateStatus(t._id, 'DELIVERED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LogisticsDashboard;
