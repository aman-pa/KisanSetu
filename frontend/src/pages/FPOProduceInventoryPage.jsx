import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Package,
  Users,
  Wheat,
  TrendingUp,
  MapPin,
  RefreshCw,
  Phone,
  Sparkles,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Search,
  QrCode,
  Calendar,
  Award,
  DollarSign,
  Layers,
  ShoppingBag,
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
        listedAt: '2026-09-13T11:30:00.000Z',
        trustScore: 91,
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
      },
      {
        listingId: 'demo_list_5',
        batchId: 'KS-BATCH-991205',
        farmerId: 'usr_farmer_kuldeep',
        farmerName: 'Kuldeep Yadav',
        phone: '+91 98989 12345',
        email: 'farmer.kuldeep@kisansetu.in',
        village: 'Taraori Farm Cluster',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 1500,
        totalQuantityKg: 1500,
        pricePerKg: 24,
        lotValue: 36000,
        grade: 'GRADE_A',
        aiQualityScore: 91,
        harvestDate: '2026-09-12T11:00:00.000Z',
        listedAt: '2026-09-12T14:45:00.000Z',
        trustScore: 88,
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'],
      },
    ],
  },
  {
    cropName: 'Basmati Rice PB-1121',
    category: 'GRAINS',
    totalQuantityKg: 5000,
    totalOriginalQuantityKg: 5000,
    contributingFarmersCount: 2,
    pricePerKgMin: 62,
    pricePerKgMax: 65,
    weightedAvgPricePerKg: 63.8,
    estimatedTotalValue: 319000,
    grades: ['GRADE_A'],
    representativeGrade: 'GRADE_A',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    latestHarvestDate: '2026-09-11T08:00:00.000Z',
    lastUpdatedAt: '2026-09-11T16:00:00.000Z',
    status: 'AVAILABLE',
    farmerContributions: [
      {
        listingId: 'demo_list_6',
        batchId: 'KS-BATCH-991206',
        farmerId: 'usr_farmer_baldev_2',
        farmerName: 'Baldev Singh',
        phone: '+91 98765 43210',
        email: 'farmer.baldev@kisansetu.in',
        village: 'Kheri Guran',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 3000,
        totalQuantityKg: 3000,
        pricePerKg: 65,
        lotValue: 195000,
        grade: 'GRADE_A',
        aiQualityScore: 98,
        harvestDate: '2026-09-11T08:00:00.000Z',
        listedAt: '2026-09-11T12:00:00.000Z',
        trustScore: 94,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
      },
      {
        listingId: 'demo_list_7',
        batchId: 'KS-BATCH-991207',
        farmerId: 'usr_farmer_manpreet',
        farmerName: 'Manpreet Sandhu',
        phone: '+91 98777 66554',
        email: 'farmer.manpreet@kisansetu.in',
        village: 'Assandh Agro Zone',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 2000,
        totalQuantityKg: 2000,
        pricePerKg: 62,
        lotValue: 124000,
        grade: 'GRADE_A',
        aiQualityScore: 96,
        harvestDate: '2026-09-10T14:00:00.000Z',
        listedAt: '2026-09-10T17:30:00.000Z',
        trustScore: 95,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
      },
    ],
  },
  {
    cropName: 'Red Onion (Nashik Quality)',
    category: 'VEGETABLES',
    totalQuantityKg: 1800,
    totalOriginalQuantityKg: 1800,
    contributingFarmersCount: 1,
    pricePerKgMin: 35,
    pricePerKgMax: 35,
    weightedAvgPricePerKg: 35.0,
    estimatedTotalValue: 63000,
    grades: ['GRADE_A'],
    representativeGrade: 'GRADE_A',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    latestHarvestDate: '2026-09-14T06:00:00.000Z',
    lastUpdatedAt: '2026-09-14T08:00:00.000Z',
    status: 'AVAILABLE',
    farmerContributions: [
      {
        listingId: 'demo_list_8',
        batchId: 'KS-BATCH-991208',
        farmerId: 'usr_farmer_sukhwinder',
        farmerName: 'Sukhwinder Gill',
        phone: '+91 97800 11223',
        email: 'farmer.sukhwinder@kisansetu.in',
        village: 'Indri Rural',
        district: 'Karnal',
        state: 'Haryana',
        availableQuantityKg: 1800,
        totalQuantityKg: 1800,
        pricePerKg: 35,
        lotValue: 63000,
        grade: 'GRADE_A',
        aiQualityScore: 93,
        harvestDate: '2026-09-14T06:00:00.000Z',
        listedAt: '2026-09-14T08:00:00.000Z',
        trustScore: 92,
        images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'],
      },
    ],
  },
];

const FPOProduceInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedCropName, setSelectedCropName] = useState(null);
  const [summary, setSummary] = useState({
    totalAggregatedQuantityKg: 0,
    activeProduceTypesCount: 0,
    contributingFarmersCount: 0,
    totalEstimatedInventoryValue: 0,
  });
  const [fpoInfo, setFpoInfo] = useState({ orgName: 'Punjab Kisan Co-operative HQ', serviceRadiusKm: 15 });
  const [isDemoData, setIsDemoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchFPOInventory = async () => {
    try {
      setLoading(true);
      setError('');
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
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchesName = item.cropName.toLowerCase().includes(query);
    const matchesCategoryName = (item.category || '').toLowerCase().includes(query);
    const matchesFarmers = item.farmerContributions?.some((fc) =>
      fc.farmerName?.toLowerCase().includes(query) ||
      fc.village?.toLowerCase().includes(query) ||
      fc.district?.toLowerCase().includes(query)
    );

    return matchesName || matchesCategoryName || matchesFarmers;
  });

  const selectedCrop =
    filteredInventory.find((c) => c.cropName === selectedCropName) ||
    filteredInventory[0] ||
    null;

  const categories = ['ALL', 'VEGETABLES', 'FRUITS', 'GRAINS', 'PULSES', 'SPICES'];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-5 pb-8">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BANNER */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-emerald-800/40">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-1.5 backdrop-blur-md">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>{fpoInfo.orgName || 'FPO Co-operative Stock'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Stock <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Management</span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Aggregated produce inventory pooled from verified member farmers ready for bulk buyer contracts and consumer orders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {isDemoData && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  Demo Stock
                </span>
              )}
              <button
                onClick={fetchFPOInventory}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Stock</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FOUR SUMMARY KPI CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Stock</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {summary.totalAggregatedQuantityKg >= 1000
                  ? `${(summary.totalAggregatedQuantityKg / 1000).toFixed(1)} T`
                  : `${summary.totalAggregatedQuantityKg.toLocaleString()} kg`}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Aggregated Member Stock</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Active Crops</span>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">
                {summary.activeProduceTypesCount} Crops
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Unique pooled lines</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
              <Wheat className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Producers</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">
                {summary.contributingFarmersCount} Farmers
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Active Member Farmers</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Est. Stock Value</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">
                ₹{summary.totalEstimatedInventoryValue?.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Collective Market Value</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CATEGORY FILTER NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {cat === 'ALL' ? `All Stock (${inventory.length})` : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading FPO stock inventory...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State - If Total Inventory is 0 */}
        {!loading && !error && inventory.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">No Stock Listed</h3>
              <p className="text-xs text-slate-500 mt-1">
                Approved member farmers have not listed any produce lots yet. Once farmers list produce, it will automatically aggregate here.
              </p>
            </div>
            <Link
              to="/fpo/farmers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-agri-sm hover:shadow-agri-md transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Manage Member Farmers</span>
            </Link>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DUAL INDEPENDENT SCROLLABLE MASTER-DETAIL LAYOUT */}
        {/* ========================================================================= */}
        {!loading && !error && inventory.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT INDEPENDENT SCROLLABLE LIST PANE (lg:col-span-5) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-[560px] lg:h-[650px]">
              {/* Header & Fixed Search Bar */}
              <div className="space-y-2 pb-2.5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Stock Lots</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] font-black">
                      {filteredInventory.length}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">Select to inspect</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by crop, farmer, village..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer text-xs font-bold leading-none px-1"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Independently Scrollable Left Container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const isSelected = selectedCrop?.cropName === item.cropName;
                    const thumbImg =
                      item.image ||
                      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80';

                    return (
                      <div
                        key={item.cropName}
                        onClick={() => setSelectedCropName(item.cropName)}
                        className={`p-3 rounded-2xl transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white border-y border-r border-emerald-300 border-l-4 border-l-emerald-600 shadow-sm ring-2 ring-emerald-500/15'
                            : 'bg-white hover:bg-slate-50/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={thumbImg}
                              alt={item.cropName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80';
                              }}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 flex-shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {item.cropName}
                                </span>
                                {item.representativeGrade && (
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                                    {item.representativeGrade.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                                {item.contributingFarmersCount || item.farmerContributions?.length || 1} Member Farmer(s)
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {item.category || 'PRODUCE'} • ₹{item.weightedAvgPricePerKg}/kg avg
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs sm:text-sm font-black text-slate-900 block">
                              {item.totalQuantityKg >= 1000
                                ? `${(item.totalQuantityKg / 1000).toFixed(1)} T`
                                : `${item.totalQuantityKg.toLocaleString()} kg`}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border mt-1 bg-emerald-50 text-emerald-800 border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span>In Stock</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                      <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">No Stock Found</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] leading-relaxed">
                        {searchQuery
                          ? `No crops matching "${searchQuery}"`
                          : `No stock in "${selectedCategory}"`}
                      </p>
                    </div>
                    {(searchQuery || selectedCategory !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('ALL');
                        }}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT INDEPENDENT SCROLLABLE DETAIL OVERVIEW PANE (lg:col-span-7) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-7 h-[560px] lg:h-[650px]">
              {selectedCrop ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
                  
                  {/* Fixed Sticky Header for Selected Crop */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex-shrink-0 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            selectedCrop.image ||
                            'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={selectedCrop.cropName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 shadow-2xs flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {selectedCrop.cropName}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {selectedCrop.category || 'VEGETABLES'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Collective Pooled Lot • {selectedCrop.contributingFarmersCount || selectedCrop.farmerContributions?.length} Contributing Farmer(s)
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedCrop.representativeGrade && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{selectedCrop.representativeGrade.replace('_', ' ')}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Aggregated</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Independently Scrollable Detail Body */}
                  <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    
                    {/* 3 Quick KPI Stat Boxes */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Avg Price</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                          ₹{selectedCrop.weightedAvgPricePerKg}/kg
                        </span>
                      </div>
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Price Range</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                          ₹{selectedCrop.pricePerKgMin} - ₹{selectedCrop.pricePerKgMax}
                        </span>
                      </div>
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Available</span>
                        <span className="text-sm sm:text-base font-black text-emerald-800 mt-0.5 block">
                          {selectedCrop.totalQuantityKg?.toLocaleString()} kg
                        </span>
                      </div>
                    </div>

                    {/* Member Farmers Breakdown */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Contributing Member Farmers</span>
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500">
                          {selectedCrop.farmerContributions?.length || 0} Lots
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {selectedCrop.farmerContributions?.map((contrib, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5 shadow-2xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                    {contrib.farmerName || 'Member Farmer'}
                                  </h5>
                                  {contrib.grade && (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                                      {contrib.grade.replace('_', ' ')}
                                    </span>
                                  )}
                                  {contrib.aiQualityScore && (
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                      AI Quality {contrib.aiQualityScore}%
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {contrib.village || 'Cluster'}, {contrib.district || 'Karnal'}, {contrib.state || 'Haryana'}
                                  </span>
                                </p>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span className="text-xs sm:text-sm font-black text-slate-900 block">
                                  {contrib.availableQuantityKg?.toLocaleString() || contrib.totalQuantityKg?.toLocaleString()} kg
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 block">
                                  ₹{contrib.pricePerKg}/kg • ₹{contrib.lotValue?.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                              {contrib.phone && (
                                <a
                                  href={`tel:${contrib.phone}`}
                                  className="text-slate-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{contrib.phone}</span>
                                </a>
                              )}

                              {contrib.batchId && (
                                <Link
                                  to={`/trace/${contrib.batchId}`}
                                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 group ml-auto"
                                >
                                  <QrCode className="w-3 h-3 text-emerald-600" />
                                  <span className="group-hover:underline">Batch #{contrib.batchId} Trace</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fixed Sticky Footer for Total & Actions */}
                  <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Est. Total Lot Value</span>
                      <span className="text-xl font-black text-slate-900">₹{selectedCrop.estimatedTotalValue?.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/fpo/bulk-orders"
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Allocate to Bulk Orders</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center text-slate-400 space-y-3.5 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-300 shadow-2xs">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h3 className="text-sm font-black text-slate-800">No Stock Selected</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Select a crop from the left list or adjust your search to inspect aggregated volumes, price metrics, and contributing member farmers.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FPOProduceInventoryPage;
