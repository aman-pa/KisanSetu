import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import FPOMembershipCard from '../components/FPOMembershipCard';
import {
  DollarSign,
  Package,
  PackagePlus,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Scale,
  UserCheck,
  Building2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const FarmerDashboard = () => {
  const { user } = useAuth();
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
      if (listingsRes.data?.success) setListings(listingsRes.data.listings || []);
      if (ordersRes.data?.success) setOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.error('Error fetching farmer data:', err);
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

  // Sample sales history data for rich presentation if live database orders are empty
  const defaultSalesHistory = [
    {
      _id: 'ord_demo_1',
      orderNumber: 'ORD-8921',
      date: '11 Sep 2026',
      cropName: 'Organic Tomato (Grade A)',
      quantityKg: 1200,
      totalProduceCost: 33600,
      buyerName: 'Ramesh Sharma',
      buyerOrg: 'FreshMart Supermarket Chain',
      buyerLocation: 'Delhi NCR',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
    },
    {
      _id: 'ord_demo_2',
      orderNumber: 'ORD-8854',
      date: '09 Sep 2026',
      cropName: 'Kufri Pukhraj Potato',
      quantityKg: 2500,
      totalProduceCost: 45000,
      buyerName: 'Vikram Singh',
      buyerOrg: 'AgriProcure FPO Cooperative',
      buyerLocation: 'Karnal, Haryana',
      status: 'IN_TRANSIT',
      paymentStatus: 'PAID',
    },
    {
      _id: 'ord_demo_3',
      orderNumber: 'ORD-8710',
      date: '05 Sep 2026',
      cropName: 'Fresh Green Spinach',
      quantityKg: 800,
      totalProduceCost: 22400,
      buyerName: 'Anita Gupta',
      buyerOrg: 'GreenLeaf Organics Ltd',
      buyerLocation: 'Gurgaon, Haryana',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
    },
    {
      _id: 'ord_demo_4',
      orderNumber: 'ORD-8640',
      date: '28 Aug 2026',
      cropName: 'Sharbati Wheat (Grade A)',
      quantityKg: 1500,
      totalProduceCost: 40500,
      buyerName: 'Sanjay Verma',
      buyerOrg: 'Reliance Retail Procurement',
      buyerLocation: 'Chandigarh',
      status: 'DELIVERED',
      paymentStatus: 'PAID',
    },
  ];

  // Combined sales list: database orders merged with demo entries if orders are empty
  const displayOrders = orders.length > 0 ? orders : defaultSalesHistory;

  // Calculate Key Performance Metrics
  const calculatedTotalEarnings = displayOrders.reduce((sum, o) => sum + (o.totalProduceCost || 0), 0);
  const calculatedTotalKgSold = displayOrders.reduce((sum, o) => {
    if (o.quantityKg) return sum + o.quantityKg;
    if (o.items && Array.isArray(o.items)) {
      return sum + o.items.reduce((itemSum, item) => itemSum + (item.quantityKg || 0), 0);
    }
    return sum;
  }, 0);

  const totalQuintalsSold = (calculatedTotalKgSold / 100).toFixed(1);
  const pendingOrdersCount = displayOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT'
  ).length;

  return (
    <DashboardLayout role="FARMER">
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Direct Farm Produce Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Produce Sales & Earnings 🌾
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Track direct buyer purchases, check total crop earnings, manage active produce lots, and monitor payment status.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              to="/farmer/add-produce"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0A2412] font-black text-xs shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              Add Produce Listing
            </Link>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 4 Essential KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Earnings */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Earnings</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">₹{calculatedTotalEarnings.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Farmer Payouts
              </p>
            </div>
          </div>

          {/* Card 2: Total Produce Sold */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Quantity Sold</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{calculatedTotalKgSold.toLocaleString()} <span className="text-sm font-bold text-slate-500">kg</span></p>
              <p className="text-[11px] font-bold text-blue-700 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Approx {totalQuintalsSold} Quintals
              </p>
            </div>
          </div>

          {/* Card 3: Active Produce Listings */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Produce Listings</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{listings.length}</p>
              <Link
                to="/farmer/produce"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 mt-1 inline-flex items-center gap-1 group"
              >
                Manage Listed Lots <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 4: Orders in Progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Orders In-Progress</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{pendingOrdersCount}</p>
              <p className="text-[11px] font-bold text-purple-700 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Awaiting Fulfillment
              </p>
            </div>
          </div>
        </div>

        {/* Area Batch Logistics Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  Area Batch Logistics
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    6-Hour Window Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Nearby consumer orders are grouped by area so you dispatch together in single low-cost trips.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Freight Savings</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 inline-block">
                ~75% Transport Cost Saved
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                <span>Delhi NCR (110016)</span>
                <span className="text-emerald-700 font-extrabold">Active</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">2 Orders • 45 kg</p>
              <p className="text-[10px] text-slate-400 font-medium">Dispatch window: ~3h 15m remaining</p>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                <span>Karnal District</span>
                <span className="text-emerald-700 font-extrabold">Active</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">3 Orders • 120 kg</p>
              <p className="text-[10px] text-slate-400 font-medium">Dispatch window: ~4h 45m remaining</p>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
                <span>Gurgaon Sector 45</span>
                <span className="text-amber-700 font-extrabold">Accumulating</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">1 Order • 25 kg</p>
              <p className="text-[10px] text-slate-400 font-medium">Gathering neighborhood orders...</p>
            </div>
          </div>
        </div>

        {/* FPO Membership Card: "Be a Part of an FPO" */}
        <FPOMembershipCard user={user} />

        {/* Section 1: Detailed Sales History ("What I Have Sold & To Whom") */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Direct Sales & Buyer Orders</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                History of crop sales, buyer details, sold quantities, revenue earned, and order status.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
              {displayOrders.length} Total Sales Records
            </span>
          </div>

          {/* Sales History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3.5 px-6">Order ID & Date</th>
                  <th className="py-3.5 px-6">Crop Produce</th>
                  <th className="py-3.5 px-6">Quantity Sold</th>
                  <th className="py-3.5 px-6">Purchased By (Buyer)</th>
                  <th className="py-3.5 px-6">Total Amount (₹)</th>
                  <th className="py-3.5 px-6">Payment & Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayOrders.map((ord) => {
                  const cropTitle = ord.cropName || (ord.items && ord.items[0]?.cropName) || 'Harvest Produce';
                  const qtyKg = ord.quantityKg || (ord.items && ord.items[0]?.quantityKg) || 0;
                  const buyerName = ord.buyerName || ord.buyer?.name || 'Verified Buyer';
                  const buyerOrg = ord.buyerOrg || ord.buyer?.businessName || ord.deliveryAddress?.city || 'Direct Buyer';
                  const orderDate = ord.date || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent');

                  return (
                    <tr key={ord._id || ord.orderNumber} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-4 px-6 font-medium">
                        <span className="font-extrabold text-slate-900 block">#{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{orderDate}</span>
                      </td>

                      {/* Crop Produce */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">{cropTitle}</span>
                        <span className="text-[11px] text-slate-500">Grade A Quality</span>
                      </td>

                      {/* Quantity Sold */}
                      <td className="py-4 px-6 font-extrabold text-slate-800">
                        {qtyKg.toLocaleString()} kg
                        <span className="text-[10px] font-semibold text-slate-500 block">({(qtyKg / 100).toFixed(1)} Quintals)</span>
                      </td>

                      {/* Buyer Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{buyerName}</span>
                            <span className="text-[10px] font-semibold text-slate-500 block flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" /> {buyerOrg}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6">
                        <span className="font-black text-emerald-700 text-sm">₹{(ord.totalProduceCost || 0).toLocaleString()}</span>
                      </td>

                      {/* Status & Payment */}
                      <td className="py-4 px-6 space-y-1.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                            ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : ['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(ord.status)
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              : ord.status === 'ACCEPTED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : ord.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(ord.status)
                            ? '🚚 Picked Up & In Transit'
                            : ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                            ? 'Delivered ✅'
                            : ord.status === 'ACCEPTED'
                            ? 'Order Confirmed'
                            : ord.status === 'CANCELLED'
                            ? 'Cancelled ❌'
                            : 'Pending Approval ⏳'}
                        </span>

                        {ord.vehicleAssigned && ['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP'].includes(ord.status) && (
                          <span className="text-[10px] font-semibold text-indigo-700 block">
                            Carrier: <b>{ord.vehicleAssigned}</b>
                          </span>
                        )}

                        <span
                          className={`text-[11px] font-bold block ${
                            ord.status === 'DELIVERED' || ord.status === 'COMPLETED' || ord.paymentStatus === 'RELEASED_TO_FARMER'
                              ? 'text-emerald-700 font-extrabold'
                              : ['PAID', 'PAID_ESCROW'].includes(ord.paymentStatus)
                              ? 'text-indigo-700 font-bold'
                              : ord.status === 'CANCELLED'
                              ? 'text-rose-600'
                              : 'text-amber-700'
                          }`}
                        >
                          {ord.status === 'DELIVERED' || ord.status === 'COMPLETED' || ord.paymentStatus === 'RELEASED_TO_FARMER'
                            ? 'Payment Done ✅'
                            : ['PAID', 'PAID_ESCROW'].includes(ord.paymentStatus)
                            ? 'Payment Done (In Transit) 💳'
                            : ord.status === 'CANCELLED'
                            ? 'Payment Cancelled'
                            : 'Payment Pending ⏳'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        {ord._id && !ord._id.startsWith('ord_demo') && (
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                            {['PAID', 'PAID_ESCROW'].includes(ord.paymentStatus) && ord.status === 'ACCEPTED' && (
                              <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Ready for Pickup
                              </span>
                            )}

                            {ord.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord._id, 'ACCEPTED')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord._id, 'CANCELLED')}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {ord.status === 'ACCEPTED' && !['PAID', 'PAID_ESCROW'].includes(ord.paymentStatus) && (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                Payment Pending
                              </span>
                            )}

                            {['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(ord.status) && (
                              <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 inline-flex items-center gap-1">
                                <Truck className="w-3 h-3 text-indigo-600" /> In Transit
                              </span>
                            )}

                            {(ord.status === 'DELIVERED' || ord.status === 'COMPLETED') && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
                              </span>
                            )}

                            <Link
                              to={`/ticket/${ord._id}`}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1"
                            >
                              <span>Ticket</span>
                              <ChevronRight className="w-3 h-3 opacity-60" />
                            </Link>
                          </div>
                        )}
                        {(!ord._id || ord._id.startsWith('ord_demo')) && (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
                            </span>
                            <Link
                              to={`/ticket/${ord._id || 'demo_1'}`}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold shadow-2xs transition-all flex items-center gap-1"
                            >
                              <span>Ticket</span>
                              <ChevronRight className="w-3 h-3 opacity-60" />
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Active Crop Listings Inventory */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4 text-amber-700" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">My Active Produce Listings</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Harvest lots currently listed on KisanSetu AI for buyers and FPOs.
              </p>
            </div>

            <Link
              to="/farmer/produce"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              Manage Produce Listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="p-8 bg-slate-50/60 rounded-2xl text-center space-y-3 border border-dashed border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-700">No active produce listings yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add your harvest crops to the KisanSetu market to enable direct procurement from verified buyers.
                </p>
              </div>
              <Link
                to="/farmer/add-produce"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <PackagePlus className="w-4 h-4" /> Create Produce Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((item) => (
                <div key={item._id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{item.cropName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {item.qualityGrade || 'Grade A'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Location: {item.location?.district || 'Karnal'}, {item.location?.state || 'Haryana'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block">Available Quantity</span>
                      <span className="text-xs font-extrabold text-slate-800">{item.quantityKg} kg</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-500 block">Price / kg</span>
                      <span className="text-xs font-black text-emerald-700">₹{item.pricePerKg} / kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
