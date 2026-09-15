import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Users,
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
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wheat,
  Eye,
} from 'lucide-react';

const FPODashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({
    totalAggregatedQuantityKg: 12100,
    activeProduceTypesCount: 4,
    contributingFarmersCount: 9,
    totalEstimatedInventoryValue: 323000,
  });
  const [memberFarmers, setMemberFarmers] = useState([
    { name: 'Ramesh Kumar', village: 'Kheri, Karnal', size: '8.5 Acres', crop: 'Tomato & Wheat', revenue: '₹1,84,000', score: 94 },
    { name: 'Suresh Singh', village: 'Samalkha, Panipat', size: '6.0 Acres', crop: 'Tomato & Onion', revenue: '₹1,42,000', score: 88 },
    { name: 'Harpreet Singh', village: 'GT Road, Ambala', size: '12.0 Acres', crop: 'Potato & Rice', revenue: '₹2,65,000', score: 96 },
    { name: 'Gurmeet Dhillon', village: 'Ludhiana Hub', size: '15.5 Acres', crop: 'Wheat & Mustard', revenue: '₹3,10,000', score: 92 },
  ]);
  const [fpoInfo, setFpoInfo] = useState({ orgName: 'Punjab Kisan Co-operative HQ', numberOfMemberFarmers: 240 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, membersRes] = await Promise.allSettled([
          API.get('/fpo/inventory'),
          API.get('/fpo/farmers/members'),
        ]);

        if (invRes.status === 'fulfilled' && invRes.value.data?.success) {
          if (invRes.value.data.inventory && invRes.value.data.inventory.length > 0) {
            setInventory(invRes.value.data.inventory);
            setInventorySummary(invRes.value.data.summary);
          }
          if (invRes.value.data.fpo) {
            setFpoInfo(invRes.value.data.fpo);
          }
        }

        if (membersRes.status === 'fulfilled' && membersRes.value.data?.success) {
          if (membersRes.value.data.members && membersRes.value.data.members.length > 0) {
            const formatted = membersRes.value.data.members.map((m) => ({
              name: m.farmerName,
              village: `${m.location?.village || ''}, ${m.location?.district || ''}`,
              size: `${m.farmSizeAcres || 5} Acres`,
              crop: Array.isArray(m.cropsGrown) ? m.cropsGrown.join(', ') : 'Mixed Produce',
              revenue: '₹1,50,000',
              score: m.trustScore || 92,
            }));
            setMemberFarmers(formatted);
          }
        }
      } catch (err) {
        console.error('Error loading FPO dashboard data:', err);
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
            <h1 className="text-2xl font-extrabold text-slate-900">{fpoInfo.orgName}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Reg: FPO-PB-2023-991 • Managing {fpoInfo.numberOfMemberFarmers || memberFarmers.length} Member Farmers • Regional Supply Aggregation
            </p>
          </div>

          <Link
            to="/fpo/produce"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> View Aggregated Inventory
          </Link>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/fpo/farmers" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2 hover:border-emerald-300 transition-all block group">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold group-hover:text-emerald-700 transition-colors">Member Farmers</span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{fpoInfo.numberOfMemberFarmers || memberFarmers.length} Active</p>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded flex items-center justify-between">
              Co-op Farmer Network
              <span className="text-emerald-700 font-extrabold group-hover:translate-x-0.5 transition-transform">Manage →</span>
            </span>
          </Link>

          <Link to="/fpo/produce" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2 hover:border-emerald-300 transition-all block group">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold group-hover:text-emerald-700 transition-colors">Aggregated Inventory</span>
              <Package className="w-4 h-4 text-agri-accent" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {inventorySummary.totalAggregatedQuantityKg >= 1000
                ? `${(inventorySummary.totalAggregatedQuantityKg / 1000).toFixed(1)} Tonnes`
                : `${inventorySummary.totalAggregatedQuantityKg.toLocaleString()} kg`}
            </p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center justify-between">
              {inventorySummary.activeProduceTypesCount || 4} Crop Lines Pooled
              <span className="text-emerald-700 font-extrabold group-hover:translate-x-0.5 transition-transform">View →</span>
            </span>
          </Link>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Estimated Stock Worth</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">
              ₹{inventorySummary.totalEstimatedInventoryValue.toLocaleString()}
            </p>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Current Market Value
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

        {/* Member Farmers Registry Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" /> Registered Member Farmers (Co-op Network)
            </h3>
            <Link to="/fpo/farmers" className="text-xs text-emerald-700 font-extrabold hover:underline">
              View All Members →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3">Farmer Name</th>
                  <th className="pb-3">Village / District</th>
                  <th className="pb-3">Farm Size</th>
                  <th className="pb-3">Primary Crops</th>
                  <th className="pb-3">Trust Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberFarmers.slice(0, 5).map((mf, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-medium text-slate-700">
                    <td className="py-3 font-extrabold text-slate-900">{mf.name}</td>
                    <td className="py-3 flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-rose-500" /> {mf.village}
                    </td>
                    <td className="py-3">{mf.size}</td>
                    <td className="py-3 font-bold text-teal-700">{mf.crop}</td>
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

        {/* Aggregated Member Produce Lots */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-agri-primary" /> Active Aggregated Produce Inventory
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Automatically pooled from active member farmers for Bulk Buyer & Consumer orders.
              </p>
            </div>
            <Link to="/fpo/produce" className="text-xs text-emerald-700 font-extrabold hover:underline">
              Manage Inventory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(inventory.length > 0 ? inventory : [
              { cropName: 'Tomato', category: 'VEGETABLES', representativeGrade: 'GRADE_A', totalQuantityKg: 2000, weightedAvgPricePerKg: 30, contributingFarmersCount: 3, estimatedTotalValue: 60000 },
              { cropName: 'Kufri Potato', category: 'VEGETABLES', representativeGrade: 'GRADE_A', totalQuantityKg: 3500, weightedAvgPricePerKg: 23, contributingFarmersCount: 2, estimatedTotalValue: 80000 },
              { cropName: 'Sharbati Wheat', category: 'GRAINS', representativeGrade: 'GRADE_A', totalQuantityKg: 6000, weightedAvgPricePerKg: 27, contributingFarmersCount: 3, estimatedTotalValue: 162000 },
              { cropName: 'Organic Spinach', category: 'VEGETABLES', representativeGrade: 'GRADE_A', totalQuantityKg: 600, weightedAvgPricePerKg: 35, contributingFarmersCount: 1, estimatedTotalValue: 21000 },
            ]).map((crop, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 hover:bg-slate-100/70 transition-all">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {crop.cropName} ({crop.representativeGrade?.replace('_', ' ') || 'Grade A'})
                  </h4>
                  <span className="text-sm font-black text-emerald-700">₹{crop.weightedAvgPricePerKg}/kg</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Pooled Available: <b className="text-slate-900">{crop.totalQuantityKg.toLocaleString()} kg</b>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-[10px]">
                    {crop.contributingFarmersCount} Farmer(s)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-500 font-bold">
                    Est. Value: ₹{crop.estimatedTotalValue?.toLocaleString()}
                  </span>
                  <Link to="/fpo/produce" className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View Farmer Breakdown
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
