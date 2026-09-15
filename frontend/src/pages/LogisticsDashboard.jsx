import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Clock,
  Sparkles,
  Building2,
  UserCheck,
  RefreshCw,
  Phone,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  Compass,
} from 'lucide-react';

// Isolated Demo Data for Fallback & Interactive Verification
const DEMO_PICKUP_REQUESTS = [
  {
    _id: 'ord_demo_log_1',
    orderNumber: 'ORD-8921',
    createdAt: '2026-09-14T08:30:00.000Z',
    cropName: 'Organic Tomato (Grade A)',
    quantityKg: 1200,
    totalOrderKg: 1200,
    farmerName: 'Baldev Singh',
    farmerLocation: 'Karnal, Haryana',
    buyerName: 'Ramesh Sharma',
    buyerOrg: 'FreshMart Supermarket',
    deliveryCity: 'Delhi NCR',
    deliveryState: 'Delhi',
    totalAmount: 33600,
    status: 'PENDING',
    vehicleAssigned: 'HR-05-CC-9988',
    storageSpec: 'Refrigerated (2°C - 6°C Target)',
    distanceToPickupKm: 18.5,
    locationMatch: 'NEARBY',
    capacityStatus: 'FITS_CAPACITY',
  },
  {
    _id: 'ord_demo_log_2',
    orderNumber: 'ORD-8854',
    createdAt: '2026-09-13T14:15:00.000Z',
    cropName: 'Kufri Pukhraj Potato',
    quantityKg: 2500,
    totalOrderKg: 2500,
    farmerName: 'Gurpreet Singh',
    farmerLocation: 'Panipat, Haryana',
    buyerName: 'Vikram Singh',
    buyerOrg: 'AgriProcure Cooperative',
    deliveryCity: 'Karnal',
    deliveryState: 'Haryana',
    totalAmount: 45000,
    status: 'ACCEPTED',
    vehicleAssigned: 'HR-05-CC-9988',
    storageSpec: 'Ambient Ventilated',
    distanceToPickupKm: 42.0,
    locationMatch: 'NEARBY',
    capacityStatus: 'FITS_CAPACITY',
  },
  {
    _id: 'ord_demo_log_3',
    orderNumber: 'ORD-8710',
    createdAt: '2026-09-12T10:00:00.000Z',
    cropName: 'Fresh Green Spinach',
    quantityKg: 800,
    totalOrderKg: 800,
    farmerName: 'Harjit Singh',
    farmerLocation: 'Kurukshetra, Haryana',
    buyerName: 'Anita Gupta',
    buyerOrg: 'GreenLeaf Organics',
    deliveryCity: 'Gurgaon',
    deliveryState: 'Haryana',
    totalAmount: 22400,
    status: 'IN_TRANSIT',
    vehicleAssigned: 'HR-05-CC-7712',
    storageSpec: 'Cold-Chain (2°C - 4°C Target)',
    distanceToPickupKm: 110.0,
    locationMatch: 'SERVICE_AREA',
    capacityStatus: 'FITS_CAPACITY',
  },
  {
    _id: 'ord_demo_log_4',
    orderNumber: 'ORD-8640',
    createdAt: '2026-09-10T16:45:00.000Z',
    cropName: 'Sharbati Wheat (Grade A)',
    quantityKg: 1500,
    totalOrderKg: 1500,
    farmerName: 'Rajinder Kumar',
    farmerLocation: 'Ambala, Haryana',
    buyerName: 'Sanjay Verma',
    buyerOrg: 'Reliance Retail Procurement',
    deliveryCity: 'Chandigarh',
    deliveryState: 'Punjab',
    totalAmount: 40500,
    status: 'DELIVERED',
    vehicleAssigned: 'HR-05-CC-7712',
    storageSpec: 'Ambient Dry Storage',
    distanceToPickupKm: 280.0,
    locationMatch: 'FARTHER',
    capacityStatus: 'FITS_CAPACITY',
  },
  {
    _id: 'ord_demo_log_5',
    orderNumber: 'ORD-8512',
    createdAt: '2026-09-14T11:20:00.000Z',
    cropName: 'Premium Basmati Paddy (Bulk)',
    quantityKg: 6500,
    totalOrderKg: 6500,
    farmerName: 'Jaswinder Chahal',
    farmerLocation: 'Kaithal, Haryana',
    buyerName: 'MegaFood Grains Ltd',
    buyerOrg: 'Karnal Processing DC',
    deliveryCity: 'Karnal',
    deliveryState: 'Haryana',
    totalAmount: 195000,
    status: 'PENDING',
    vehicleAssigned: null,
    storageSpec: 'Dry Bulk Cargo',
    distanceToPickupKm: 34.2,
    locationMatch: 'NEARBY',
    capacityStatus: 'EXCEEDS_CAPACITY',
  },
];

const DEMO_FLEET_VEHICLES = [
  {
    vehicleNo: 'HR-05-CC-9988',
    type: 'Refrigerated Eicher Pro (8 Ton)',
    driverName: 'Sukhwinder Singh',
    driverPhone: '+91 98123 45678',
    storageSpec: 'Refrigerated (2°C - 6°C)',
    status: 'IN_TRANSIT',
    capacityKg: 8000,
    utilizedKg: 4500,
    currentLocation: 'Panipat Transit Hub (Assigned Route)',
  },
  {
    vehicleNo: 'HR-05-CC-7712',
    type: 'Cold-Chain Tata 407 (3.5 Ton)',
    driverName: 'Manpreet Singh',
    driverPhone: '+91 98765 43210',
    storageSpec: 'Refrigerated (2°C - 6°C)',
    status: 'AVAILABLE',
    capacityKg: 3500,
    utilizedKg: 0,
    currentLocation: 'Karnal Depot Terminal',
  },
  {
    vehicleNo: 'HR-05-CC-5521',
    type: 'Insulated Mahindra Bolero Maxi (1.5 Ton)',
    driverName: 'Davinder Pal',
    driverPhone: '+91 94160 12345',
    storageSpec: 'Ventilated / Insulated',
    status: 'AVAILABLE',
    capacityKg: 1500,
    utilizedKg: 0,
    currentLocation: 'Kurukshetra Agri Yard',
  },
];

const DEFAULT_ROUTE_DATA = {
  summary: {
    totalDistanceKm: 184,
    totalDurationHours: '4.0',
    totalWaypoints: 5,
    costSavingsPercentage: 34,
    estimatedCO2ReducedKg: 42,
  },
  route: {
    waypoints: [
      { name: 'Karnal Agri-Hub (Origin)' },
      { name: 'Farm A - Ramesh Kumar (Karnal)' },
      { name: 'Farm B - Suresh Singh (Panipat)' },
      { name: 'KisanSetu Cold Hub (Delhi APMC)' },
      { name: 'FreshMart Supermarket DC (Drop)' },
    ],
  },
};

const LogisticsDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [demoTasks, setDemoTasks] = useState(DEMO_PICKUP_REQUESTS);
  const [carrierProfile, setCarrierProfile] = useState({ capacityKg: 5000, serviceAreas: [] });
  const [routeData, setRouteData] = useState(DEFAULT_ROUTE_DATA);
  const [loading, setLoading] = useState(true);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchLogisticsData = async () => {
    try {
      const [tasksRes, routeRes] = await Promise.allSettled([
        API.get('/logistics/tasks'),
        API.post('/logistics/optimize', {}),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data?.success) {
        setTasks(tasksRes.value.data.orders || []);
        if (tasksRes.value.data.carrierProfile) {
          setCarrierProfile(tasksRes.value.data.carrierProfile);
        }
      }
      if (routeRes.status === 'fulfilled' && routeRes.value?.data?.success) {
        setRouteData(routeRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdateSuccess('');
    setErrorMessage('');

    // Handle demo orders locally
    if (orderId && orderId.startsWith('ord_demo')) {
      setDemoTasks((prev) =>
        prev.map((item) => (item._id === orderId ? { ...item, status: newStatus } : item))
      );
      setStatusUpdateSuccess(`Shipment #${orderId} status updated to ${newStatus}!`);
      return;
    }

    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        setStatusUpdateSuccess(`Shipment status updated to ${newStatus} successfully!`);
        fetchLogisticsData();
      } else {
        setErrorMessage(data.message || 'Failed to update shipment status.');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setErrorMessage(err.response?.data?.message || 'Unauthorized or error updating order status.');
    }
  };

  // Determine active display tasks
  const displayTasks = tasks.length > 0 ? tasks : demoTasks;

  // Operational KPIs derived strictly from tasks & fleet data
  const pendingPickupsCount = displayTasks.filter(
    (t) => t.status === 'PENDING' || t.status === 'CONFIRMED' || t.status === 'ACCEPTED'
  ).length;

  const activeDeliveriesCount = displayTasks.filter(
    (t) => t.status === 'IN_TRANSIT'
  ).length;

  const completedDeliveriesCount = displayTasks.filter(
    (t) => t.status === 'DELIVERED' || t.status === 'COMPLETED'
  ).length;

  const availableVehiclesCount = DEMO_FLEET_VEHICLES.filter(
    (v) => v.status === 'AVAILABLE' || v.status === 'STANDBY'
  ).length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Logistics & Cold-Chain Dispatch Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Logistics Operations Hub 🚚
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Multi-farm route planning, consignment status tracking, carrier capacity allocation, and delivery fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => {
                setLoading(true);
                fetchLogisticsData();
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Shipments
            </button>
          </div>
        </div>

        {/* Notifications */}
        {statusUpdateSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusUpdateSuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 4 Operational KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pending Pickups */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending Pickups</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{pendingPickupsCount}</p>
              <p className="text-[11px] font-bold text-amber-700 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Awaiting Transit Dispatch
              </p>
            </div>
          </div>

          {/* Card 2: Active Deliveries */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Deliveries</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeDeliveriesCount}</p>
              <p className="text-[11px] font-bold text-blue-700 mt-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> In-Transit Consignments
              </p>
            </div>
          </div>

          {/* Card 3: Completed Deliveries */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Completed Deliveries</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">{completedDeliveriesCount}</p>
              <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5" /> Delivered to Buyer / DC
              </p>
            </div>
          </div>

          {/* Card 4: Available Vehicles */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Available Vehicles</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-700">
                {availableVehiclesCount} <span className="text-sm font-bold text-slate-500">/ {DEMO_FLEET_VEHICLES.length}</span>
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Ready for Assignment
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Detailed Logistics Shipments & Dispatch Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Shipments & Delivery Orders</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Assigned farmer pickups, buyer destination routes, consignment volume, and lifecycle status updates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                {displayTasks.length} Total Deliveries
              </span>
              {carrierProfile && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                  Vehicle Cap: {(carrierProfile.capacityKg || 5000).toLocaleString()} kg
                </span>
              )}
            </div>
          </div>

          {/* Shipments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3.5 px-6">Order ID & Date</th>
                  <th className="py-3.5 px-6">Produce Lot & Weight</th>
                  <th className="py-3.5 px-6">Pickup (Farmer) & Proximity</th>
                  <th className="py-3.5 px-6">Destination (Buyer)</th>
                  <th className="py-3.5 px-6">Value (₹)</th>
                  <th className="py-3.5 px-6">Delivery & Capacity Spec</th>
                  <th className="py-3.5 px-6 text-right">Logistics Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayTasks.map((ord) => {
                  const cropTitle = ord.cropName || (ord.items && ord.items[0]?.cropName) || (ord.items && ord.items[0]?.listing?.cropName) || 'Harvest Produce';
                  const qtyKg = ord.totalOrderKg || ord.quantityKg || (ord.items && ord.items[0]?.quantityKg) || 0;
                  const farmerName = ord.farmerName || (ord.items && ord.items[0]?.farmer?.name) || 'KisanSetu Farmer';
                  const farmerLoc = ord.farmerLocation || (ord.items && ord.items[0]?.listing?.location ? `${ord.items[0].listing.location.district}, ${ord.items[0].listing.location.state}` : 'Karnal, Haryana');
                  const buyerName = ord.buyerName || ord.buyer?.name || 'Verified Buyer';
                  const buyerDest = ord.buyerOrg || (ord.deliveryAddress ? `${ord.deliveryAddress.city}, ${ord.deliveryAddress.state}` : 'Delhi NCR');
                  const orderDate = ord.date || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent');
                  const totalAmt = ord.totalAmount || (ord.items && ord.items.reduce((s, i) => s + (i.pricePerKg * i.quantityKg), 0)) || 0;

                  return (
                    <tr key={ord._id || ord.orderNumber} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-4 px-6 font-medium">
                        <span className="font-extrabold text-slate-900 block">#{ord.orderNumber}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{orderDate}</span>
                      </td>

                      {/* Produce Lot */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">{cropTitle}</span>
                        <span className="text-[11px] font-extrabold text-slate-700 block">
                          {qtyKg.toLocaleString()} kg <span className="text-slate-400 font-normal">({(qtyKg / 100).toFixed(1)} Qtl)</span>
                        </span>
                      </td>

                      {/* Pickup Farmer */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block">{farmerName}</span>
                            <span className="text-[10px] font-semibold text-slate-500 block flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-600" /> {farmerLoc}
                            </span>
                            {/* Proximity / Distance Tag */}
                            {ord.distanceToPickupKm !== undefined && ord.distanceToPickupKm !== null ? (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                  ord.locationMatch === 'NEARBY'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : ord.locationMatch === 'SERVICE_AREA'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : ord.locationMatch === 'FARTHER'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <Compass className="w-3 h-3" />
                                {ord.distanceToPickupKm} km • {ord.locationMatch === 'NEARBY' ? 'Nearby' : ord.locationMatch === 'SERVICE_AREA' ? 'Service Area' : ord.locationMatch === 'FARTHER' ? 'Farther' : 'Outside Region'}
                              </span>
                            ) : ord.locationMatch ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {ord.locationMatch}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Destination Buyer */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                            <Building2 className="w-3.5 h-3.5 text-blue-700" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{buyerName}</span>
                            <span className="text-[10px] font-semibold text-slate-500 block flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-blue-500" /> {buyerDest}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-6">
                        <span className="font-black text-emerald-700 text-sm">₹{totalAmt.toLocaleString()}</span>
                      </td>

                      {/* Status & Storage Spec */}
                      <td className="py-4 px-6 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                              ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : ord.status === 'IN_TRANSIT'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : ord.status === 'ACCEPTED'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}
                          >
                            {ord.status}
                          </span>
                          {ord.capacityStatus && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                ord.capacityStatus === 'FITS_CAPACITY'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {ord.capacityStatus === 'FITS_CAPACITY' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fits Vehicle
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Exceeds Capacity
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          {ord.storageSpec || 'Cold-Chain Spec'}
                        </span>
                      </td>

                      {/* Logistics Action */}
                      <td className="py-4 px-6 text-right">
                        {(ord.status === 'PENDING' || ord.status === 'CONFIRMED') && (
                          ord.capacityStatus === 'EXCEEDS_CAPACITY' ? (
                            <span
                              title="Consignment weight exceeds current carrier vehicle capacity. Upgrade vehicle to accept."
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Larger Fleet Req.
                            </span>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(ord._id, 'ACCEPTED')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                            >
                              Accept Pickup
                            </button>
                          )
                        )}
                        {ord.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'IN_TRANSIT')}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" /> Start Transit
                          </button>
                        )}
                        {ord.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleUpdateStatus(ord._id, 'DELIVERED')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                          </button>
                        )}
                        {(ord.status === 'DELIVERED' || ord.status === 'COMPLETED') && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: TSP Route Optimization Matrix */}
        {routeData && (
          <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">TSP Multi-Farm Pickup Route Optimization Matrix</h3>
                  <p className="text-xs text-slate-300">Traveling salesperson route sequence for multi-farm pickup consolidation</p>
                </div>
              </div>
              <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                Projected {routeData.summary.costSavingsPercentage}% Multi-Farm Efficiency
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
                <p className="text-[11px] text-slate-300 font-medium">Route Distance</p>
                <p className="text-xl font-black text-emerald-300 mt-0.5">{routeData.summary.totalDistanceKm} km</p>
                <span className="text-[10px] text-slate-400">Estimated Total Route</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
                <p className="text-[11px] text-slate-300 font-medium">Transit Duration</p>
                <p className="text-xl font-black text-white mt-0.5">{routeData.summary.totalDurationHours} hrs</p>
                <span className="text-[10px] text-slate-400">Estimated Trip Time</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
                <p className="text-[11px] text-slate-300 font-medium">Route Waypoints</p>
                <p className="text-xl font-black text-amber-300 mt-0.5">{routeData.summary.totalWaypoints} stops</p>
                <span className="text-[10px] text-slate-400">Multi-Farm Sequence</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-sm">
                <p className="text-[11px] text-slate-300 font-medium">Projected CO2 Impact</p>
                <p className="text-xl font-black text-emerald-300 mt-0.5">{routeData.summary.estimatedCO2ReducedKg} kg</p>
                <span className="text-[10px] text-slate-400">Estimated vs Solo Trips</span>
              </div>
            </div>

            {/* Waypoints Sequence List */}
            <div className="space-y-2 pt-2 relative z-10">
              <p className="text-xs font-bold text-slate-300">Optimized Consolidated Route Sequence:</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {routeData.route.waypoints.map((wp, idx) => (
                  <React.Fragment key={idx}>
                    <span className="bg-white/15 px-3.5 py-1.5 rounded-xl border border-white/20 text-white font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {wp.name}
                    </span>
                    {idx < routeData.route.waypoints.length - 1 && (
                      <span className="text-emerald-400 font-black text-sm">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Fleet Vehicles & Capacity Allocation */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4 text-purple-700" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Fleet Vehicles & Capacity Allocation</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Carrier trucks, driver contacts, temperature specifications, and assigned load capacity.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              {DEMO_FLEET_VEHICLES.length} Fleet Vehicles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_FLEET_VEHICLES.map((v) => (
              <div
                key={v.vehicleNo}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 font-mono">{v.vehicleNo}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : v.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{v.type}</p>
                </div>

                <div className="space-y-2 border-t border-slate-200/60 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-500">Driver</span>
                    <span className="font-bold text-slate-900">{v.driverName}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-500">Contact</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" /> {v.driverPhone}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-500">Storage Spec</span>
                    <span className="font-bold text-emerald-700">
                      {v.storageSpec}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-500">Current Depot / Route</span>
                    <span className="font-medium text-slate-700 text-[11px] truncate max-w-[150px]">
                      {v.currentLocation}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-3">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>Assigned Load</span>
                    <span>
                      {v.utilizedKg.toLocaleString()} / {v.capacityKg.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(v.utilizedKg / v.capacityKg) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LogisticsDashboard;
