import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Package,
  PackagePlus,
  QrCode,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const MyProducePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertError, setAlertError] = useState('');

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products/farmer/my-listings');
      if (data.success) {
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error('Failed to fetch farmer listings:', err);
      setAlertError('Failed to load your produce listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDeleteListing = async (listingId, cropName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove the listing for "${cropName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeleteLoading(listingId);
    setAlertMessage('');
    setAlertError('');

    try {
      const { data } = await API.delete(`/products/${listingId}`);
      if (data.success) {
        setAlertMessage(`Produce listing for ${cropName} deleted successfully.`);
        setListings((prev) => prev.filter((item) => item._id !== listingId));
      }
    } catch (err) {
      console.error('Delete listing error:', err);
      setAlertError(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.cropName?.toLowerCase().includes(search.toLowerCase()) ||
      item.batchId?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.district?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && item.status === 'AVAILABLE' && item.availableQuantityKg > 0) ||
      (statusFilter === 'SOLD_OUT' && (item.status === 'SOLD_OUT' || item.availableQuantityKg === 0));

    return matchesSearch && matchesStatus;
  });

  const totalQuantityKg = listings.reduce((sum, item) => sum + (item.availableQuantityKg || item.quantityKg || 0), 0);
  const totalValue = listings.reduce((sum, item) => sum + (item.pricePerKg || 0) * (item.availableQuantityKg || item.quantityKg || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-agri-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Produce Inventory Management
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Produce Listings 📦</h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage your active crop harvests, lot stock, pricing, and QR traceability certificates
            </p>
          </div>

          <Link
            to="/farmer/add-produce"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <PackagePlus className="w-4 h-4" /> Add Produce Listing
          </Link>
        </div>

        {/* Status Alerts */}
        {alertMessage && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{alertMessage}</span>
          </div>
        )}

        {alertError && (
          <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>{alertError}</span>
          </div>
        )}

        {/* 4 Inventory Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Active Listings</span>
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{listings.length}</p>
            <span className="text-[10px] font-bold text-slate-500">Total Harvest Lots</span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Available Volume</span>
              <PackagePlus className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalQuantityKg.toLocaleString()} kg</p>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ready for Dispatch
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Total Listed Value</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">₹{totalValue.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Direct Farm Value
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">Traceability Protected</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-indigo-900">100%</p>
            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
              Batch QR Enabled
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-agri-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by crop, batch ID, city..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-4 h-4 text-slate-400 mr-1" />
            {['ALL', 'AVAILABLE', 'SOLD_OUT'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Listings' : status === 'AVAILABLE' ? 'Available Stock' : 'Sold Out'}
              </button>
            ))}
          </div>
        </div>

        {/* Listings List */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-agri-sm animate-pulse">
            Loading your produce listings...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-100 shadow-agri-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">No Produce Listings Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {search || statusFilter !== 'ALL'
                  ? 'No listings matched your current filter criteria. Try resetting your search or filter.'
                  : "You haven't added any produce listings yet. List your crop harvest to reach verified buyers and generate instant QR traceability certificates."}
              </p>
            </div>
            <Link
              to="/farmer/add-produce"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-sm hover:shadow-agri-md transition-all"
            >
              <PackagePlus className="w-4 h-4" /> Add Produce Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail and Details */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={
                      item.images && item.images[0]
                        ? item.images[0]
                        : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={item.cropName}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-xs flex-shrink-0"
                  />

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{item.cropName}</h3>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.grade?.replace('GRADE_', 'Grade ') || 'Grade A'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.category || 'VEGETABLES'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          item.status === 'AVAILABLE' && item.availableQuantityKg > 0
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {item.status === 'AVAILABLE' && item.availableQuantityKg > 0 ? 'AVAILABLE' : 'SOLD OUT'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Batch: <b>{item.batchId}</b>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {item.location?.district || 'Karnal'}, {item.location?.state || 'Haryana'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Harvest: {item.harvestDate ? new Date(item.harvestDate).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    {item.aiPriceRecommendation && (
                      <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 rounded-xl inline-block mt-1">
                        💡 AI Recommended Range: <b>₹{item.aiPriceRecommendation.min} – ₹{item.aiPriceRecommendation.max} / kg</b> ({item.aiPriceRecommendation.reasoning})
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle: Stock & Pricing */}
                <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto justify-between lg:justify-start">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Stock</span>
                    <p className="text-base font-black text-slate-900">
                      {item.availableQuantityKg?.toLocaleString() || item.quantityKg?.toLocaleString()} <span className="text-xs text-slate-500 font-bold">/ {item.quantityKg?.toLocaleString()} kg</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asking Price</span>
                    <p className="text-xl font-black text-emerald-700">
                      ₹{item.pricePerKg} <span className="text-xs text-slate-400 font-bold">/ kg</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                  <Link
                    to={`/trace/${item.batchId}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="View Batch QR Traceability Certificate"
                  >
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>QR Trace</span>
                  </Link>

                  <Link
                    to="/market-intelligence"
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-all flex items-center gap-1.5"
                    title="Compare Mandi Realization"
                  >
                    <TrendingUp className="w-4 h-4 text-amber-700" />
                    <span>Mandi Optimizer</span>
                  </Link>

                  <button
                    onClick={() => handleDeleteListing(item._id, item.cropName)}
                    disabled={deleteLoading === item._id}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                    title="Remove Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyProducePage;
