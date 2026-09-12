import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Package,
  PackagePlus,
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
  Clock,
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

  const calculateStockAgeText = (harvestDateStr) => {
    if (!harvestDateStr) return 'Harvested Recently';
    const hDate = new Date(harvestDateStr);
    const today = new Date();
    const diffDays = Math.floor((today - hDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Harvested Today 🌱';
    if (diffDays === 1) return 'Harvested 1 Day Ago 🟢';
    return `Harvested ${diffDays} Days Ago 🟢`;
  };

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.cropName?.toLowerCase().includes(search.toLowerCase()) ||
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
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Produce Inventory Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Produce 📦</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg">
              Manage your active crop harvests, lot stock, and pricing.
            </p>
          </div>

          <Link
            to="/farmer/add-produce"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0A2412] font-black text-xs shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" /> Add Produce
          </Link>
        </div>

        {/* Status Alerts */}
        {alertMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{alertMessage}</span>
          </div>
        )}

        {alertError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>{alertError}</span>
          </div>
        )}

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider">Active Produce</span>
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{listings.length}</p>
            <span className="text-[11px] font-bold text-slate-500">Total Crop Lots</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider">Available Volume</span>
              <PackagePlus className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalQuantityKg.toLocaleString()} kg</p>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Ready for Buyer Dispatch
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-extrabold uppercase tracking-wider">Total Listed Value</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">₹{totalValue.toLocaleString()}</p>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Direct Farm Produce Value
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search produce name..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {['ALL', 'AVAILABLE', 'SOLD_OUT'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'All Produce' : status === 'AVAILABLE' ? 'Available Stock' : 'Sold Out'}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Cards */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-400 bg-white rounded-3xl border border-slate-200/80 shadow-sm animate-pulse">
            Loading produce...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">No Produce Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {search || statusFilter !== 'ALL'
                  ? 'No produce matched your search query.'
                  : "You haven't added any produce yet. Add your crop harvest to list it here."}
              </p>
            </div>
            <Link
              to="/farmer/add-produce"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 transition-all"
            >
              <PackagePlus className="w-4 h-4" /> Add Produce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => {
              const stockAgeText = calculateStockAgeText(item.harvestDate);
              const img1 = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
              const img2 = item.images && item.images[1] ? item.images[1] : null;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Produce Images Gallery */}
                    <div className="grid grid-cols-2 gap-2 h-36 rounded-2xl overflow-hidden border border-slate-100 bg-slate-100">
                      <img src={img1} alt={item.cropName} className="w-full h-full object-cover col-span-1" />
                      <img
                        src={img2 || img1}
                        alt={`${item.cropName} 2`}
                        className="w-full h-full object-cover col-span-1"
                      />
                    </div>

                    {/* Produce Details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900 truncate">{item.cropName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {item.category || 'VEGETABLES'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{stockAgeText}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 mt-2">
                        <div>
                          <span className="text-slate-500 font-medium block text-[10px]">Volume Available</span>
                          <span className="font-extrabold text-slate-900 text-sm">{item.availableQuantityKg} kg</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 font-medium block text-[10px]">Price per kg</span>
                          <span className="font-black text-emerald-700 text-base">₹{item.pricePerKg} / kg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-500">
                      Total: ₹{((item.availableQuantityKg || 0) * (item.pricePerKg || 0)).toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleDeleteListing(item._id, item.cropName)}
                      disabled={deleteLoading === item._id}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyProducePage;
