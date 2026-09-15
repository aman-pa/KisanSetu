import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Users,
  PackagePlus,
  Package,
  DollarSign,
  Award,
  TrendingUp,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  ShoppingBag,
  MapPin,
  QrCode,
} from 'lucide-react';

const FPODashboard = () => {
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const memberFarmers = [
    { name: 'Ramesh Kumar', village: 'Kheri, Karnal', size: '8.5 Acres', crop: 'Tomato & Wheat', revenue: '₹1,84,000', score: 94 },
    { name: 'Suresh Singh', village: 'Samalkha, Panipat', size: '6.0 Acres', crop: 'Tomato & Onion', revenue: '₹1,42,000', score: 88 },
    { name: 'Harpreet Singh', village: 'GT Road, Ambala', size: '12.0 Acres', crop: 'Potato & Rice', revenue: '₹2,65,000', score: 96 },
    { name: 'Gurmeet Dhillon', village: 'Ludhiana Hub', size: '15.5 Acres', crop: 'Wheat & Mustard', revenue: '₹3,10,000', score: 92 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, ordersRes] = await Promise.all([
          API.get('/products'),
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
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-agri-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
              🏬 Farmers Producer Organization (FPO) Hub
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Punjab Kisan Co-operative HQ</h1>
            <p className="text-xs text-slate-500 font-medium">
              Reg: FPO-PB-2023-991 • Managing 240 Member Farmers & Regional Supply Aggregation
            </p>
          </div>

          <Link
            to="/farmer/add-produce"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center gap-2"
          >
            <PackagePlus className="w-4 h-4" /> Create FPO Bulk Listing
          </Link>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Member Farmers</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">240 Active</p>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
              Punjab & Haryana Co-op
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Aggregated Volume</span>
              <Package className="w-4 h-4 text-agri-accent" />
            </div>
            <p className="text-2xl font-black text-slate-900">14,500 kg</p>
            <span className="text-[10px] font-bold text-slate-500">Pooled Farmer Lots</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Co-op Sales Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">₹8,90,000</p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              This Financial Year
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Co-op Quality Score</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">4.9 / 5.0 ★</p>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Verified Co-operative
            </span>
          </div>
        </div>

        {/* 6-Hour Area Batching Logistics Card for FPO Aggregation */}
        <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 text-white shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-700/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/30 border border-teal-400/40 text-teal-200 flex items-center justify-center font-bold text-lg">
                ⏰
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  FPO 6-Hour Area Batching & Dispatch Hub
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Pincode Route Optimizer
                  </span>
                </h3>
                <p className="text-xs text-teal-200 mt-0.5">
                  Consolidate small 1–5 kg consumer orders from the same area into scheduled 6-hour batch trips to eliminate individual delivery overhead!
                </p>
              </div>
            </div>

            <div className="bg-teal-950/80 px-4 py-2 rounded-2xl border border-teal-700/60 text-right">
              <span className="text-[10px] uppercase font-bold text-teal-300 block">FPO Freight Cost Reduction</span>
              <span className="text-base font-black text-emerald-400">Save 75% on Last-Mile Shipping</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs space-y-1">
              <span className="text-[10px] font-bold text-teal-200">Zone A: Delhi NCR (110016)</span>
              <p className="font-black text-white">4 Orders Pooled (85 kg total)</p>
              <span className="text-[10px] text-emerald-400 font-bold">⏰ Batch Window Ends in ~2h 40m</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs space-y-1">
              <span className="text-[10px] font-bold text-teal-200">Zone B: Karnal Sector 14</span>
              <p className="font-black text-white">6 Orders Pooled (210 kg total)</p>
              <span className="text-[10px] text-emerald-400 font-bold">⏰ Batch Window Ends in ~4h 10m</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs space-y-1">
              <span className="text-[10px] font-bold text-teal-200">Zone C: Panipat Industrial Area</span>
              <p className="font-black text-white">2 Orders Pooled (40 kg total)</p>
              <span className="text-[10px] text-amber-300 font-bold">⏰ Accumulating Area Orders...</span>
            </div>
          </div>
        </div>

        {/* Member Farmers Registry Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" /> Registered Member Farmers (Co-op Network)
            </h3>
            <span className="text-xs text-slate-500 font-bold">240 Members Total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3">Farmer Name</th>
                  <th className="pb-3">Village / District</th>
                  <th className="pb-3">Farm Size</th>
                  <th className="pb-3">Primary Crops</th>
                  <th className="pb-3">YTD Revenue</th>
                  <th className="pb-3">Trust Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberFarmers.map((mf, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-medium text-slate-700">
                    <td className="py-3 font-extrabold text-slate-900">{mf.name}</td>
                    <td className="py-3 flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-rose-500" /> {mf.village}
                    </td>
                    <td className="py-3">{mf.size}</td>
                    <td className="py-3 font-bold text-teal-700">{mf.crop}</td>
                    <td className="py-3 font-black text-slate-900">{mf.revenue}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        {mf.score}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aggregated Co-op Produce Listings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-agri-primary" /> Active Aggregated Produce Lots
            </h3>
            <span className="text-xs text-slate-500 font-bold">{listings.length} Lots Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((l) => (
              <div key={l._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900">{l.cropName} ({l.grade})</h4>
                  <span className="text-sm font-black text-agri-primary">₹{l.pricePerKg}/kg</span>
                </div>
                <p className="text-xs text-slate-500">
                  Batch: <span className="font-mono font-bold text-slate-700">{l.batchId}</span> • Quantity: {l.availableQuantityKg?.toLocaleString()} kg
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Origin: {l.location?.district}, {l.location?.state}</span>
                  <Link to={`/trace/${l.batchId}`} className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> View Batch QR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FPODashboard;
