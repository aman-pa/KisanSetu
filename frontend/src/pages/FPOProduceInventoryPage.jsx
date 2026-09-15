import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Package,
  Users,
  TrendingUp,
  MapPin,
  RefreshCw,
  Phone,
  Mail,
  ShieldCheck,
  Wheat,
  Scale,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  X,
  Award,
  Layers,
  Search,
  Filter,
  DollarSign,
  QrCode,
  Calendar,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

// Isolated Demo Fallback Data for Offline / Development Mode
const DEMO_INVENTORY = [
  {
    cropName: 'Tomato',
    category: 'VEGETABLES',
    totalQuantityKg: 2000,
    totalOriginalQuantityKg: 2000,
    contributingFarmersCount: 3,
    pricePerKgMin: 28,
    pricePerKgMax: 32,
    weightedAvgPricePerKg: 30.0,
    estimatedTotalValue: 60000,
    grades: ['GRADE_A', 'GRADE_B'],
    representativeGrade: 'GRADE_A',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    latestHarvestDate: '2026-09-14T08:00:00.000Z',
    lastUpdatedAt: '2026-09-14T10:30:00.000Z',
    status: 'AVAILABLE',
    farmerContributions: [
      {
        listingId: 'demo_list_1',
        batchId: 'KS-BATCH-991201',
        farmerId: 'usr_farmer_1',
        farmerName: 'Baldev Singh',
        phone: '+91 98765 43210',
        email: 'farmer.baldev@kisansetu.in',
        village: 'Kheri Guran',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 800,
        totalQuantityKg: 800,
        pricePerKg: 30,
        lotValue: 24000,
        grade: 'GRADE_A',
        aiQualityScore: 95,
        harvestDate: '2026-09-14T08:00:00.000Z',
        listedAt: '2026-09-14T09:30:00.000Z',
        trustScore: 94,
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
      },
      {
        listingId: 'demo_list_2',
        batchId: 'KS-BATCH-991202',
        farmerId: 'usr_farmer_2',
        farmerName: 'Gurpreet Singh Dhillon',
        phone: '+91 98123 45678',
        email: 'farmer.gurpreet@kisansetu.in',
        village: 'Samalkha Rural',
        district: 'Panipat',
        state: 'Haryana',
        availableQuantityKg: 700,
        totalQuantityKg: 700,
        pricePerKg: 28,
        lotValue: 19600,
        grade: 'GRADE_A',
        aiQualityScore: 92,
        harvestDate: '2026-09-13T10:00:00.000Z',
        listedAt: '2026-09-13T16:15:00.000Z',
        trustScore: 89,
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
      },
      {
        listingId: 'demo_list_3',
        batchId: 'KS-BATCH-991203',
        farmerId: 'usr_farmer_3',
        farmerName: 'Jaswinder Kaur',
        phone: '+91 94160 99887',
        email: 'farmer.jaswinder@kisansetu.in',
        village: 'Nilokheri Cluster',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 500,
        totalQuantityKg: 500,
        pricePerKg: 32,
        lotValue: 16000,
        grade: 'GRADE_B',
        aiQualityScore: 88,
        harvestDate: '2026-09-12T07:30:00.000Z',
        listedAt: '2026-09-12T11:00:00.000Z',
        trustScore: 96,
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
      },
    ],
  },
  {
    cropName: 'Kufri Potato',
    category: 'VEGETABLES',
    totalQuantityKg: 3500,
    totalOriginalQuantityKg: 3500,
    contributingFarmersCount: 2,
    pricePerKgMin: 22,
    pricePerKgMax: 24,
    weightedAvgPricePerKg: 22.9,
    estimatedTotalValue: 80000,
    grades: ['GRADE_A'],
    representativeGrade: 'GRADE_A',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    latestHarvestDate: '2026-09-13T09:00:00.000Z',
    lastUpdatedAt: '2026-09-13T12:00:00.000Z',
    status: 'AVAILABLE',
    farmerContributions: [
      {
        listingId: 'demo_list_4',
        batchId: 'KS-BATCH-991204',
        farmerId: 'usr_farmer_ramesh',
        farmerName: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        email: 'farmer.ramesh@kisansetu.in',
        village: 'Kheri',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 2000,
        totalQuantityKg: 2000,
        pricePerKg: 22,
        lotValue: 44000,
        grade: 'GRADE_A',
        aiQualityScore: 94,
        harvestDate: '2026-09-13T09:00:00.000Z',
        listedAt: '2026-09-13T10:00:00.000Z',
        trustScore: 94,
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
      },
      {
        listingId: 'demo_list_5',
        batchId: 'KS-BATCH-991205',
        farmerId: 'usr_farmer_suresh',
        farmerName: 'Suresh Singh',
        phone: '+91 98765 43211',
        email: 'farmer.suresh@kisansetu.in',
        village: 'Samalkha',
        district: 'Panipat',
        state: 'Haryana',
        availableQuantityKg: 1500,
        totalQuantityKg: 1500,
        pricePerKg: 24,
        lotValue: 36000,
        grade: 'GRADE_A',
        aiQualityScore: 91,
        harvestDate: '2026-09-12T11:00:00.000Z',
        listedAt: '2026-09-12T14:30:00.000Z',
        trustScore: 88,
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
      },
    ],
  },
  {
    cropName: 'Sharbati Wheat',
    category: 'GRAINS',
    totalQuantityKg: 6000,
    totalOriginalQuantityKg: 6000,
    contributingFarmersCount: 3,
    pricePerKgMin: 26,
    pricePerKgMax: 28,
    weightedAvgPricePerKg: 27.0,
    estimatedTotalValue: 162000,
    grades: ['GRADE_A'],
    representativeGrade: 'GRADE_A',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    latestHarvestDate: '2026-09-10T08:00:00.000Z',
    lastUpdatedAt: '2026-09-10T11:00:00.000Z',
    status: 'AVAILABLE',
    farmerContributions: [
      {
        listingId: 'demo_list_6',
        batchId: 'KS-BATCH-991206',
        farmerId: 'usr_farmer_harpreet',
        farmerName: 'Harpreet Singh',
        phone: '+91 98111 22334',
        email: 'farmer.harpreet@kisansetu.in',
        village: 'GT Road Hub',
        district: 'Ambala',
        state: 'Haryana',
        availableQuantityKg: 3000,
        totalQuantityKg: 3000,
        pricePerKg: 27,
        lotValue: 81000,
        grade: 'GRADE_A',
        aiQualityScore: 96,
        harvestDate: '2026-09-10T08:00:00.000Z',
        listedAt: '2026-09-10T09:00:00.000Z',
        trustScore: 96,
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
      },
      {
        listingId: 'demo_list_7',
        batchId: 'KS-BATCH-991207',
        farmerId: 'usr_farmer_1',
        farmerName: 'Baldev Singh',
        phone: '+91 98765 43210',
        email: 'farmer.baldev@kisansetu.in',
        village: 'Kheri Guran',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 2000,
        totalQuantityKg: 2000,
        pricePerKg: 26,
        lotValue: 52000,
        grade: 'GRADE_A',
        aiQualityScore: 93,
        harvestDate: '2026-09-09T14:00:00.000Z',
        listedAt: '2026-09-09T16:00:00.000Z',
        trustScore: 94,
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
      },
      {
        listingId: 'demo_list_8',
        batchId: 'KS-BATCH-991208',
        farmerId: 'usr_farmer_ramesh',
        farmerName: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        email: 'farmer.ramesh@kisansetu.in',
        village: 'Kheri',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 1000,
        totalQuantityKg: 1000,
        pricePerKg: 29,
        lotValue: 29000,
        grade: 'GRADE_A',
        aiQualityScore: 92,
        harvestDate: '2026-09-08T10:00:00.000Z',
        listedAt: '2026-09-08T12:00:00.000Z',
        trustScore: 94,
        images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'],
      },
    ],
  },
  {
    cropName: 'Organic Spinach',
    category: 'VEGETABLES',
    totalQuantityKg: 600,
    totalOriginalQuantityKg: 600,
    contributingFarmersCount: 1,
    pricePerKgMin: 35,
    pricePerKgMax: 35,
    weightedAvgPricePerKg: 35.0,
    estimatedTotalValue: 21000,
    grades: ['GRADE_A'],
    representativeGrade: 'GRADE_A',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    latestHarvestDate: '2026-09-14T06:00:00.000Z',
    lastUpdatedAt: '2026-09-14T07:30:00.000Z',
    status: 'AVAILABLE',
    farmerContributions: [
      {
        listingId: 'demo_list_9',
        batchId: 'KS-BATCH-991209',
        farmerId: 'usr_farmer_3',
        farmerName: 'Jaswinder Kaur',
        phone: '+91 94160 99887',
        email: 'farmer.jaswinder@kisansetu.in',
        village: 'Nilokheri Cluster',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 600,
        totalQuantityKg: 600,
        pricePerKg: 35,
        lotValue: 21000,
        grade: 'GRADE_A',
        aiQualityScore: 97,
        harvestDate: '2026-09-14T06:00:00.000Z',
        listedAt: '2026-09-14T07:30:00.000Z',
        trustScore: 96,
        images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'],
      },
    ],
  },
];

const FPOProduceInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({
    totalAggregatedQuantityKg: 0,
    activeProduceTypesCount: 0,
    contributingFarmersCount: 0,
    totalEstimatedInventoryValue: 0,
  });
  const [fpoInfo, setFpoInfo] = useState({ orgName: 'Punjab Kisan Co-operative HQ', serviceRadiusKm: 15 });
  const [isDemoData, setIsDemoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCropModal, setSelectedCropModal] = useState(null);

  const fetchFPOInventory = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/fpo/inventory');

      if (data.success && data.inventory && data.inventory.length > 0) {
        setInventory(data.inventory);
        setSummary(data.summary || {
          totalAggregatedQuantityKg: 0,
          activeProduceTypesCount: 0,
          contributingFarmersCount: 0,
          totalEstimatedInventoryValue: 0,
        });
        if (data.fpo) setFpoInfo(data.fpo);
        setIsDemoData(false);
      } else {
        // Isolated Offline / Seed Demo Fallback
        setInventory(DEMO_INVENTORY);
        const totalKg = DEMO_INVENTORY.reduce((sum, item) => sum + item.totalQuantityKg, 0);
        const totalVal = DEMO_INVENTORY.reduce((sum, item) => sum + item.estimatedTotalValue, 0);
        const allFarmers = new Set();
        DEMO_INVENTORY.forEach((c) => c.farmerContributions.forEach((fc) => allFarmers.add(fc.farmerId)));
        setSummary({
          totalAggregatedQuantityKg: totalKg,
          activeProduceTypesCount: DEMO_INVENTORY.length,
          contributingFarmersCount: allFarmers.size,
          totalEstimatedInventoryValue: totalVal,
        });
        setIsDemoData(true);
      }
    } catch (err) {
      console.error('Failed to fetch FPO aggregated inventory:', err);
      // Fallback to isolated demo
      setInventory(DEMO_INVENTORY);
      const totalKg = DEMO_INVENTORY.reduce((sum, item) => sum + item.totalQuantityKg, 0);
      const totalVal = DEMO_INVENTORY.reduce((sum, item) => sum + item.estimatedTotalValue, 0);
      setSummary({
        totalAggregatedQuantityKg: totalKg,
        activeProduceTypesCount: DEMO_INVENTORY.length,
        contributingFarmersCount: 4,
        totalEstimatedInventoryValue: totalVal,
      });
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFPOInventory();
  }, []);

  // Filter crops by search query and category
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerContributions?.some((fc) =>
        fc.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fc.village.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'VEGETABLES', 'FRUITS', 'GRAINS', 'PULSES', 'SPICES'];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* ========================================================================= */}
        {/* TOP HERO BANNER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {fpoInfo.orgName || 'Farmer Producer Organisation Portal'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              FPO Aggregated Inventory 🌾
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              Live produce automatically pooled from verified active member farmers within your 10–20 km co-operative cluster. Manage collective lots for Bulk Buyer contracts and Consumer fulfillment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
            {isDemoData && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                Offline Demo Mode
              </span>
            )}
            <button
              onClick={fetchFPOInventory}
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Inventory
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 SUMMARY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Aggregated Quantity */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Aggregated Quantity</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {summary.totalAggregatedQuantityKg >= 1000
                  ? `${(summary.totalAggregatedQuantityKg / 1000).toFixed(1)} `
                  : `${summary.totalAggregatedQuantityKg.toLocaleString()} `}
                <span className="text-sm font-bold text-slate-500">
                  {summary.totalAggregatedQuantityKg >= 1000 ? 'Tonnes' : 'kg'}
                </span>
              </p>
              <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pooled Active Stock
              </p>
            </div>
          </div>

          {/* Card 2: Active Produce Types */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Produce Types</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Wheat className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-teal-700">
                {summary.activeProduceTypesCount} <span className="text-sm font-bold text-slate-500">Crops</span>
              </p>
              <p className="text-[11px] font-bold text-teal-700 mt-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Distinct Crop Lines
              </p>
            </div>
          </div>

          {/* Card 3: Contributing Member Farmers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Contributing Farmers</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-blue-700">
                {summary.contributingFarmersCount} <span className="text-sm font-bold text-slate-500">Members</span>
              </p>
              <p className="text-[11px] font-bold text-blue-700 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Approved FPO Members
              </p>
            </div>
          </div>

          {/* Card 4: Total Estimated Value */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Estimated Value</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-700">
                ₹{summary.totalEstimatedInventoryValue.toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-purple-700 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Collective Market Worth
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH & CATEGORY FILTER BAR */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search aggregated crop name, farmer name, or village..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0A2412] text-emerald-300 font-extrabold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'All Crops' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AGGREGATED PRODUCE INVENTORY DIRECTORY TABLE */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Member-Aggregated Produce Directory</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                FPO automatically consolidates lots listed by approved active member farmers.
              </p>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900 font-black">{filteredInventory.length}</span> Aggregated Crop(s)
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-bold">Aggregating member farmer produce...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-700">No Aggregated Produce Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'No crops matched your search filters. Try adjusting your query.'
                  : 'Approved member farmers have not listed any active produce yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-extrabold tracking-wider uppercase text-[11px]">
                    <th className="py-3.5 px-6">Produce / Crop</th>
                    <th className="py-3.5 px-6">Contributing Farmers</th>
                    <th className="py-3.5 px-6">Total Available Qty</th>
                    <th className="py-3.5 px-6">Quality / Grade</th>
                    <th className="py-3.5 px-6">Price Range / Avg</th>
                    <th className="py-3.5 px-6">Est. Total Worth</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Farmer Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((crop, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Crop Name & Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={crop.image}
                            alt={crop.cropName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm leading-tight">{crop.cropName}</p>
                            <span className="inline-block mt-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                              {crop.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contributing Farmers */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/80 font-extrabold text-xs">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            {crop.contributingFarmersCount} {crop.contributingFarmersCount === 1 ? 'Farmer' : 'Farmers'}
                          </span>
                        </div>
                      </td>

                      {/* Total Available Quantity */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-black text-slate-900 text-sm">
                            {crop.totalQuantityKg.toLocaleString()} <span className="text-xs font-bold text-slate-500">kg</span>
                          </p>
                          {crop.totalQuantityKg >= 1000 && (
                            <p className="text-[10px] text-slate-400 font-bold">
                              ({(crop.totalQuantityKg / 1000).toFixed(2)} Tonnes)
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Quality Grade */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[11px]">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            {crop.representativeGrade.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Price Range & Weighted Avg */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-black text-emerald-700 text-xs">
                            Avg ₹{crop.weightedAvgPricePerKg}/kg
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {crop.pricePerKgMin === crop.pricePerKgMax
                              ? `₹${crop.pricePerKgMin}/kg`
                              : `₹${crop.pricePerKgMin} – ₹${crop.pricePerKgMax}/kg`}
                          </p>
                        </div>
                      </td>

                      {/* Estimated Worth */}
                      <td className="py-4 px-6 font-black text-slate-900 text-xs">
                        ₹{crop.estimatedTotalValue.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Available
                        </span>
                      </td>

                      {/* Actions: View Breakdown */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedCropModal(crop)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Breakdown
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FARMER-LEVEL BREAKDOWN MODAL / DRAWER */}
        {/* ========================================================================= */}
        {selectedCropModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCropModal.image}
                    alt={selectedCropModal.cropName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{selectedCropModal.cropName}</h2>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                        {selectedCropModal.category}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      {selectedCropModal.totalQuantityKg.toLocaleString()} kg Total Aggregated Supply • {selectedCropModal.contributingFarmersCount} Contributing Member(s)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCropModal(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Close Breakdown"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Aggregation Context Alert */}
              <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 text-xs text-emerald-900 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>
                  <b>Order Allocation Engine:</b> When orders are placed, quantities will be fulfilled against these specific member lots with end-to-end QR batch traceability.
                </span>
              </div>

              {/* Scrollable Farmers List */}
              <div className="p-6 overflow-y-auto space-y-4">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Member Farmer Contributions ({selectedCropModal.farmerContributions?.length || 0})
                </h3>

                <div className="space-y-3">
                  {selectedCropModal.farmerContributions?.map((fc, i) => (
                    <div
                      key={fc.listingId || i}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                            {fc.farmerName?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm">{fc.farmerName}</h4>
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                Active Member
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              {fc.village ? `${fc.village}, ` : ''}{fc.district}, {fc.state}
                            </p>
                          </div>
                        </div>

                        <div className="text-right sm:text-right">
                          <p className="text-base font-black text-emerald-700">
                            {fc.availableQuantityKg.toLocaleString()} kg
                          </p>
                          <p className="text-[10px] font-bold text-slate-500">
                            @ ₹{fc.pricePerKg}/kg • Worth ₹{fc.lotValue?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Details row: Quality, Batch, Harvest Date */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Grade</span>
                          <span className="font-extrabold text-slate-800">{fc.grade.replace('_', ' ')}</span>
                        </div>

                        <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">AI Quality Score</span>
                          <span className="font-extrabold text-emerald-700">{fc.aiQualityScore || 90}/100 ★</span>
                        </div>

                        <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Harvest Date</span>
                          <span className="font-bold text-slate-700">
                            {fc.harvestDate ? new Date(fc.harvestDate).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Batch QR</span>
                            <span className="font-mono font-bold text-slate-700 text-[10px]">
                              {fc.batchId || 'KS-BATCH'}
                            </span>
                          </div>
                          {fc.batchId && (
                            <Link
                              to={`/trace/${fc.batchId}`}
                              className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="View Batch Traceability"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 font-bold">
                  Total Lot Worth: <span className="text-slate-900 font-black">₹{selectedCropModal.estimatedTotalValue.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setSelectedCropModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Close Breakdown
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FPOProduceInventoryPage;
