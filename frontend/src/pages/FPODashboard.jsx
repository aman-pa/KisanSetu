import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Users,
  Package,
  ShoppingBag,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const FPODashboard = () => {
  const [fpoInfo, setFpoInfo] = useState({
    orgName: 'Punjab Kisan Co-operative HQ',
    registrationNumber: 'FPO-PB-2023-991',
    numberOfMemberFarmers: 240,
  });
  const [activeFarmersCount, setActiveFarmersCount] = useState(240);
  const [inventorySummary, setInventorySummary] = useState({
    totalAggregatedQuantityKg: 12100,
    activeProduceTypesCount: 4,
  });
  const [inventoryList, setInventoryList] = useState([]);
  const [consumerOrdersCount, setConsumerOrdersCount] = useState(0);
  const [pendingConsumerOrdersCount, setPendingConsumerOrdersCount] = useState(0);
  const [bulkOrdersCount, setBulkOrdersCount] = useState(0);
  const [pendingBulkOrdersCount, setPendingBulkOrdersCount] = useState(0);
  const [pendingFarmerRequestsCount, setPendingFarmerRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, membersRes, pendingReqRes, ordersRes, bulkReqRes] = await Promise.allSettled([
          API.get('/fpo/inventory'),
          API.get('/fpo/farmers/members'),
          API.get('/fpo/farmers/pending-requests'),
          API.get('/orders'),
          API.get('/bulk/requests'),
        ]);

        if (invRes.status === 'fulfilled' && invRes.value.data?.success) {
          const invData = invRes.value.data;
          if (Array.isArray(invData.inventory)) {
            setInventoryList(invData.inventory);
          }
          if (invData.summary) {
            setInventorySummary(invData.summary);
          }
          if (invData.fpo) {
            setFpoInfo((prev) => ({ ...prev, ...invData.fpo }));
            if (invData.fpo.numberOfMemberFarmers) {
              setActiveFarmersCount(invData.fpo.numberOfMemberFarmers);
            }
          }
        }

        if (membersRes.status === 'fulfilled' && membersRes.value.data?.success) {
          const mData = membersRes.value.data;
          if (typeof mData.count === 'number' && mData.count > 0) {
            setActiveFarmersCount(mData.count);
          } else if (Array.isArray(mData.members) && mData.members.length > 0) {
            setActiveFarmersCount(mData.members.length);
          }
        }

        if (pendingReqRes.status === 'fulfilled' && pendingReqRes.value.data?.success) {
          const pData = pendingReqRes.value.data;
          const pCount = typeof pData.count === 'number' ? pData.count : pData.requests?.length || 0;
          setPendingFarmerRequestsCount(pCount);
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.success) {
          const allOrders = ordersRes.value.data.orders || [];
          const consumerOrds = allOrders.filter(
            (o) => !o.procurementRequestRef && o.buyer?.role !== 'BULK_BUYER'
          );
          const bulkOrds = allOrders.filter(
            (o) => o.procurementRequestRef || o.buyer?.role === 'BULK_BUYER'
          );

          setConsumerOrdersCount(consumerOrds.length);
          setPendingConsumerOrdersCount(
            consumerOrds.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length
          );

          setBulkOrdersCount(bulkOrds.length);
          setPendingBulkOrdersCount(
            bulkOrds.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length
          );
        }

        if (bulkReqRes.status === 'fulfilled' && bulkReqRes.value.data?.success) {
          const requests = bulkReqRes.value.data.requests || [];
          if (requests.length > 0) {
            setBulkOrdersCount((prev) => Math.max(prev, requests.length));
            const openReqs = requests.filter((r) => r.status === 'OPEN' || r.status === 'ACTIVE').length;
            setPendingBulkOrdersCount((prev) => Math.max(prev, openReqs));
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

  const displayProduceList =
    inventoryList.length > 0
      ? inventoryList.slice(0, 5)
      : [
          { cropName: 'Tomato', totalQuantityKg: 4200 },
          { cropName: 'Potato', totalQuantityKg: 3100 },
          { cropName: 'Onion', totalQuantityKg: 2800 },
          { cropName: 'Wheat', totalQuantityKg: 2000 },
        ];

  const totalAggregatedKg = inventorySummary.totalAggregatedQuantityKg || 12100;
  const formattedTotalProduce =
    totalAggregatedKg >= 1000
      ? `${(totalAggregatedKg / 1000).toFixed(1)} Tonnes`
      : `${totalAggregatedKg.toLocaleString()} kg`;

  const totalPendingItems =
    pendingFarmerRequestsCount + pendingConsumerOrdersCount + pendingBulkOrdersCount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 1. FPO Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Farmer Producer Organisation (FPO) Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{fpoInfo.orgName}</h1>
          <p className="text-xs text-slate-500 font-medium">
            Reg: {fpoInfo.registrationNumber || 'FPO-PB-2023-991'} • Managing {activeFarmersCount} Active Member Farmers • Regional Supply Aggregation
          </p>
        </div>

        {/* 2. Four Simple Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Farmers */}
          <Link
            to="/fpo/farmers"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all block group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold group-hover:text-emerald-700 transition-colors">Active Farmers</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeFarmersCount} Active</p>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              Registered Co-op Members
            </span>
          </Link>

          {/* Card 2: Available Stock */}
          <Link
            to="/fpo/produce"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all block group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold group-hover:text-emerald-700 transition-colors">Available Stock</span>
              <Package className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{formattedTotalProduce}</p>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              {inventoryList.length || 4} Crop Lines Pooled
            </span>
          </Link>

          {/* Card 3: Consumer Orders */}
          <Link
            to="/fpo/consumer-orders"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all block group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold group-hover:text-emerald-700 transition-colors">Consumer Orders</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{consumerOrdersCount} Orders</p>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              {pendingConsumerOrdersCount > 0 ? `${pendingConsumerOrdersCount} Pending Action` : 'All Caught Up'}
            </span>
          </Link>

          {/* Card 4: Bulk Orders */}
          <Link
            to="/fpo/bulk-orders"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all block group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold group-hover:text-emerald-700 transition-colors">Bulk Orders</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{bulkOrdersCount} Orders</p>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              {pendingBulkOrdersCount > 0 ? `${pendingBulkOrdersCount} Open Requests` : 'Procurement Active'}
            </span>
          </Link>
        </div>

        {/* 3. Two-Column Lower Section (50/50 Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT: Current Stock */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Current Stock</h2>
                <p className="text-xs text-slate-500 mt-0.5">Aggregated from active member farmer listings</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {displayProduceList.length} Active Crops
              </span>
            </div>

            {displayProduceList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {displayProduceList.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 px-1 rounded-xl transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-bold text-slate-800 text-sm">{item.cropName}</span>
                    </div>
                    <span className="font-black text-slate-900 text-sm">
                      {item.totalQuantityKg.toLocaleString()} kg
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No active produce listed by member farmers yet.
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/fpo/produce"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                View Stock <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT: Needs Attention */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Needs Attention</h2>
                <p className="text-xs text-slate-500 mt-0.5">Actionable pending items requiring review</p>
              </div>
              {totalPendingItems > 0 && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                  {totalPendingItems} Actionable
                </span>
              )}
            </div>

            {totalPendingItems === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-900">You're all caught up.</p>
                <p className="text-xs text-slate-500">No pending requests or orders requiring action.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingFarmerRequestsCount > 0 && (
                  <Link
                    to="/fpo/farmers"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-50 hover:border-amber-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center text-xs font-black">
                        {pendingFarmerRequestsCount}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-amber-950">
                        Farmer Requests Pending
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}

                {pendingConsumerOrdersCount > 0 && (
                  <Link
                    to="/fpo/consumer-orders"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-emerald-200/80 text-emerald-900 flex items-center justify-center text-xs font-black">
                        {pendingConsumerOrdersCount}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                        Consumer Orders Pending
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}

                {pendingBulkOrdersCount > 0 && (
                  <Link
                    to="/fpo/bulk-orders"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-indigo-200/80 text-indigo-900 flex items-center justify-center text-xs font-black">
                        {pendingBulkOrdersCount}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-950">
                        Bulk Buyer Requests
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-700 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Link
                to={pendingFarmerRequestsCount > 0 ? '/fpo/farmers' : pendingConsumerOrdersCount > 0 ? '/fpo/consumer-orders' : '/fpo/bulk-orders'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Review <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FPODashboard;
