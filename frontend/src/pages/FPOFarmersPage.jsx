import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
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
  Check,
  X,
  Award,
  Layers,
  Search,
  Package,
  ArrowRight,
} from 'lucide-react';

// Isolated Demo Requests & Members for Offline / Development Fallback
const DEMO_PENDING_REQUESTS = [
  {
    _id: 'req_demo_1',
    farmerId: 'usr_farmer_1',
    farmerName: 'Baldev Singh',
    phone: '+91 98765 43210',
    email: 'farmer.baldev@kisansetu.in',
    farmSizeAcres: 8.5,
    cropsGrown: ['Tomato (Grade A)', 'Wheat', 'Basmati Paddy'],
    trustScore: 94,
    qualityScore: 95,
    location: {
      village: 'Kheri Guran',
      district: 'Karnal',
      state: 'Haryana',
    },
    distanceKm: 8.5,
    serviceRadiusKm: 15,
    isWithinRadius: true,
    fpoRequestedAt: '2026-09-14T09:30:00.000Z',
    status: 'PENDING',
  },
  {
    _id: 'req_demo_2',
    farmerId: 'usr_farmer_2',
    farmerName: 'Gurpreet Singh Dhillon',
    phone: '+91 98123 45678',
    email: 'farmer.gurpreet@kisansetu.in',
    farmSizeAcres: 6.0,
    cropsGrown: ['Kufri Potato', 'Mustard', 'Tomato'],
    trustScore: 89,
    qualityScore: 91,
    location: {
      village: 'Samalkha Rural',
      district: 'Panipat',
      state: 'Haryana',
    },
    distanceKm: 14.2,
    serviceRadiusKm: 15,
    isWithinRadius: true,
    fpoRequestedAt: '2026-09-13T16:15:00.000Z',
    status: 'PENDING',
  },
  {
    _id: 'req_demo_3',
    farmerId: 'usr_farmer_3',
    farmerName: 'Jaswinder Kaur',
    phone: '+91 94160 99887',
    email: 'farmer.jaswinder@kisansetu.in',
    farmSizeAcres: 12.0,
    cropsGrown: ['Organic Spinach', 'Green Peas', 'Wheat'],
    trustScore: 96,
    qualityScore: 94,
    location: {
      village: 'Nilokheri Agri Cluster',
      district: 'Karnal',
      state: 'Haryana',
    },
    distanceKm: 11.0,
    serviceRadiusKm: 15,
    isWithinRadius: true,
    fpoRequestedAt: '2026-09-12T11:00:00.000Z',
    status: 'PENDING',
  },
];

const DEMO_APPROVED_MEMBERS = [
  {
    _id: 'mem_demo_1',
    farmerId: 'usr_farmer_ramesh',
    farmerName: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    email: 'farmer.ramesh@kisansetu.in',
    farmSizeAcres: 8.5,
    cropsGrown: ['Tomato', 'Wheat'],
    trustScore: 94,
    qualityScore: 95,
    location: {
      village: 'Kheri',
      district: 'Karnal',
      state: 'Haryana',
    },
    joinedDate: '2026-08-10T10:00:00.000Z',
    status: 'APPROVED',
  },
  {
    _id: 'mem_demo_2',
    farmerId: 'usr_farmer_suresh',
    farmerName: 'Suresh Singh',
    phone: '+91 98765 43211',
    email: 'farmer.suresh@kisansetu.in',
    farmSizeAcres: 6.0,
    cropsGrown: ['Tomato', 'Onion', 'Potato'],
    trustScore: 88,
    qualityScore: 90,
    location: {
      village: 'Samalkha',
      district: 'Panipat',
      state: 'Haryana',
    },
    joinedDate: '2026-08-15T14:30:00.000Z',
    status: 'APPROVED',
  },
  {
    _id: 'mem_demo_3',
    farmerId: 'usr_farmer_harpreet',
    farmerName: 'Harpreet Singh',
    phone: '+91 98111 22334',
    email: 'farmer.harpreet@kisansetu.in',
    farmSizeAcres: 12.0,
    cropsGrown: ['Potato', 'Rice', 'Wheat'],
    trustScore: 96,
    qualityScore: 93,
    location: {
      village: 'GT Road Hub',
      district: 'Ambala',
      state: 'Haryana',
    },
    joinedDate: '2026-07-20T08:45:00.000Z',
    status: 'APPROVED',
  },
];

const FPOFarmersPage = () => {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'MEMBERS'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [demoPending, setDemoPending] = useState(DEMO_PENDING_REQUESTS);
  const [members, setMembers] = useState([]);
  const [demoMembers, setDemoMembers] = useState(DEMO_APPROVED_MEMBERS);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [fpoInfo, setFpoInfo] = useState({ orgName: 'Punjab Kisan Co-operative HQ', serviceRadiusKm: 15 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Pending Requests & Approved Members
  const fetchFarmersData = async () => {
    try {
      setLoading(true);
      const [pendingRes, membersRes] = await Promise.allSettled([
        API.get('/fpo/farmers/pending-requests'),
        API.get('/fpo/farmers/members'),
      ]);

      if (pendingRes.status === 'fulfilled' && pendingRes.value?.data?.success) {
        setPendingRequests(pendingRes.value.data.requests || []);
        if (pendingRes.value.data.fpo) {
          setFpoInfo(pendingRes.value.data.fpo);
        }
      }

      if (membersRes.status === 'fulfilled' && membersRes.value?.data?.success) {
        setMembers(membersRes.value.data.members || []);
      }
    } catch (err) {
      console.error('Error fetching FPO farmers data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmersData();
  }, []);

  // Handle Accept Farmer Request
  const handleAcceptRequest = async (farmer) => {
    setSuccessMessage('');
    setErrorMessage('');
    setActionLoading(true);

    // Handle demo items locally
    if (farmer._id && farmer._id.startsWith('req_demo')) {
      const approvedMember = {
        ...farmer,
        _id: `mem_${farmer._id}`,
        status: 'APPROVED',
        joinedDate: new Date().toISOString(),
      };
      setDemoPending((prev) => prev.filter((item) => item._id !== farmer._id));
      setDemoMembers((prev) => [approvedMember, ...prev]);
      setSuccessMessage(`Farmer ${farmer.farmerName} has been approved as an active FPO member!`);
      setActionLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/fpo/farmers/accept', { farmerProfileId: farmer._id });
      if (data.success) {
        setSuccessMessage(data.message || `Farmer approved successfully!`);
        fetchFarmersData();
      } else {
        setErrorMessage(data.message || 'Failed to accept membership request.');
      }
    } catch (err) {
      console.error('Failed to accept request:', err);
      setErrorMessage(err.response?.data?.message || 'Error approving farmer membership.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Farmer Request
  const handleRejectRequest = async (farmer) => {
    setSuccessMessage('');
    setErrorMessage('');
    setActionLoading(true);

    // Handle demo items locally
    if (farmer._id && farmer._id.startsWith('req_demo')) {
      setDemoPending((prev) => prev.filter((item) => item._id !== farmer._id));
      setSuccessMessage(`Membership request for ${farmer.farmerName} has been rejected.`);
      setActionLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/fpo/farmers/reject', { farmerProfileId: farmer._id });
      if (data.success) {
        setSuccessMessage(data.message || `Membership request rejected.`);
        fetchFarmersData();
      } else {
        setErrorMessage(data.message || 'Failed to reject membership request.');
      }
    } catch (err) {
      console.error('Failed to reject request:', err);
      setErrorMessage(err.response?.data?.message || 'Error rejecting farmer membership.');
    } finally {
      setActionLoading(false);
    }
  };

  // Active display lists
  const displayPending = pendingRequests.length > 0 ? pendingRequests : demoPending;
  const displayMembers = members.length > 0 ? members : demoMembers;
  const combinedFarmers = [
    ...displayPending.map((p) => ({ ...p, status: 'PENDING' })),
    ...displayMembers.map((m) => ({ ...m, status: 'APPROVED' })),
  ];

  const filteredFarmers = combinedFarmers.filter((f) => {
    if (activeFilter === 'PENDING' && f.status !== 'PENDING') return false;
    if (activeFilter === 'MEMBERS' && f.status !== 'APPROVED') return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const nameMatch = (f.farmerName || '').toLowerCase().includes(query);
    const villageMatch = (f.location?.village || '').toLowerCase().includes(query);
    const districtMatch = (f.location?.district || '').toLowerCase().includes(query);
    const phoneMatch = (f.phone || '').toLowerCase().includes(query);
    const cropsMatch = (f.cropsGrown || []).join(' ').toLowerCase().includes(query);

    return nameMatch || villageMatch || districtMatch || phoneMatch || cropsMatch;
  });

  const selectedFarmer =
    filteredFarmers.find((f) => f._id === selectedFarmerId) ||
    filteredFarmers[0] ||
    null;

  const totalAcreage = displayMembers.reduce((sum, m) => sum + (Number(m.farmSizeAcres) || 0), 0);

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
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{fpoInfo.orgName || 'FPO Co-operative Network'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Farmers <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">Directory & Membership</span>
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Review nearby farmer membership applications, verify cluster proximity limit (10–20 km), and manage active co-operative members.
              </p>
            </div>

            <button
              onClick={() => {
                fetchFarmersData();
              }}
              disabled={loading}
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Farmers</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer">✕</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-rose-700 hover:text-rose-900 text-xs font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. FOUR SUMMARY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Pending Requests</span>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{displayPending.length}</div>
              <p className="text-[10px] text-slate-500 font-medium">Awaiting FPO review</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-amber-100 transition-all">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Active Members</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">{displayMembers.length}</div>
              <p className="text-[10px] text-slate-500 font-medium">Approved co-op network</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-emerald-100 transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Service Radius</span>
              <div className="text-xl sm:text-2xl font-black text-blue-950 mt-0.5">
                {fpoInfo.serviceRadiusKm || 15} <span className="text-xs font-bold text-slate-500">km</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Cluster Boundary Limit</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex items-center justify-between group">
            <div>
              <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block">Farmland Base</span>
              <div className="text-xl sm:text-2xl font-black text-purple-950 mt-0.5">
                {totalAcreage.toFixed(1)} <span className="text-xs font-bold text-slate-500">Acres</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Aggregated member land</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-purple-100 transition-all">
              <Wheat className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FILTER TABS BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: `All Farmers (${combinedFarmers.length})` },
            { id: 'PENDING', label: `Pending Requests (${displayPending.length})` },
            { id: 'MEMBERS', label: `Active Members (${displayMembers.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Loading farmer records...</p>
          </div>
        )}

        {/* Empty State - If Total Farmers is 0 */}
        {!loading && combinedFarmers.length === 0 && (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-black text-slate-900">No Farmers Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Nearby farmers will appear here when they submit membership requests.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DUAL INDEPENDENT SCROLLABLE MASTER-DETAIL LAYOUT */}
        {/* ========================================================================= */}
        {!loading && combinedFarmers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT INDEPENDENT SCROLLABLE LIST PANE (lg:col-span-5) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-[560px] lg:h-[650px]">
              {/* Header & Fixed Search Bar */}
              <div className="space-y-2 pb-2.5 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Farmers</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px] font-black">
                      {filteredFarmers.length}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">Select to inspect</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name, village, crops, phone..."
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
                {filteredFarmers.length > 0 ? (
                  filteredFarmers.map((farmer) => {
                    const isSelected = selectedFarmer?._id === farmer._id;
                    const isPending = farmer.status === 'PENDING';

                    return (
                      <div
                        key={farmer._id}
                        onClick={() => setSelectedFarmerId(farmer._id)}
                        className={`p-3 rounded-2xl transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white border-y border-r border-emerald-300 border-l-4 border-l-emerald-600 shadow-sm ring-2 ring-emerald-500/15'
                            : 'bg-white hover:bg-slate-50/90 border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:translate-x-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center font-black text-sm flex-shrink-0 shadow-2xs">
                              {farmer.farmerName?.charAt(0) || 'F'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-900 truncate">
                                  {farmer.farmerName}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-slate-600 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                <span>{farmer.location?.village || 'Cluster'}, {farmer.location?.district}</span>
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium block">
                                {farmer.farmSizeAcres || 5} Acres • {farmer.cropsGrown?.slice(0, 2).join(', ') || 'Produce'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-amber-50 text-amber-800 border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-emerald-50 text-emerald-800 border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span>Member</span>
                              </span>
                            )}
                            {farmer.distanceKm !== undefined && (
                              <span className="text-[9px] text-slate-400 font-bold block mt-1">
                                ~{farmer.distanceKm} km
                              </span>
                            )}
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
                      <h4 className="text-xs font-black text-slate-800">No Farmers Found</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] leading-relaxed">
                        {searchQuery
                          ? `No results matching "${searchQuery}"`
                          : `No farmers under "${activeFilter}"`}
                      </p>
                    </div>
                    {(searchQuery || activeFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilter('ALL');
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
              {selectedFarmer ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
                  
                  {/* Fixed Sticky Header for Selected Farmer */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex-shrink-0 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
                          {selectedFarmer.farmerName?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {selectedFarmer.farmerName}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                selectedFarmer.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  selectedFarmer.status === 'PENDING' ? 'bg-amber-500' : 'bg-emerald-600'
                                }`}
                              />
                              <span>{selectedFarmer.status === 'PENDING' ? 'Pending Approval' : 'Active FPO Member'}</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {selectedFarmer.status === 'PENDING'
                              ? `Requested on ${selectedFarmer.fpoRequestedAt ? new Date(selectedFarmer.fpoRequestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}`
                              : `Member since ${selectedFarmer.joinedDate ? new Date(selectedFarmer.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active Record'}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Trust {selectedFarmer.trustScore || 92}/100</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Independently Scrollable Detail Body */}
                  <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    
                    {/* Proximity / Radius Eligibility Box */}
                    {selectedFarmer.distanceKm !== undefined && (
                      <div className="p-3.5 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-slate-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between shadow-2xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider block">
                            Service Radius Proximity Check
                          </span>
                          <p className="text-xs font-bold text-slate-900">
                            ~{selectedFarmer.distanceKm} km from FPO HQ ({fpoInfo.serviceRadiusKm || 15} km service limit)
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${
                            selectedFarmer.isWithinRadius !== false
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {selectedFarmer.isWithinRadius !== false ? 'Within Service Radius' : 'Outside Radius'}
                        </span>
                      </div>
                    )}

                    {/* 3 Quick KPI Stat Boxes */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Farmland</span>
                        <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                          {selectedFarmer.farmSizeAcres || 5} Acres
                        </span>
                      </div>
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Trust Score</span>
                        <span className="text-sm sm:text-base font-black text-emerald-700 mt-0.5 block">
                          {selectedFarmer.trustScore || 92} / 100
                        </span>
                      </div>
                      <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 text-center shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">AI Quality</span>
                        <span className="text-sm sm:text-base font-black text-blue-800 mt-0.5 block">
                          {selectedFarmer.qualityScore || 94}%
                        </span>
                      </div>
                    </div>

                    {/* Contact & Location Details */}
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2.5 shadow-2xs text-xs">
                      <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Farmer Details & Location</span>
                      </h4>

                      <div className="space-y-2 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Farm Village:</span>
                          <span className="font-bold text-slate-900">
                            {selectedFarmer.location?.village || 'Cluster Village'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">District & State:</span>
                          <span className="font-bold text-slate-900">
                            {selectedFarmer.location?.district || 'Karnal'}, {selectedFarmer.location?.state || 'Haryana'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> Phone:
                          </span>
                          <a
                            href={`tel:${selectedFarmer.phone}`}
                            className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                          >
                            {selectedFarmer.phone || '+91 98765 43210'}
                          </a>
                        </div>
                        {selectedFarmer.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> Email:
                            </span>
                            <span className="font-mono text-[11px] text-slate-700">{selectedFarmer.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Primary Crops Grown */}
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 shadow-2xs text-xs">
                      <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <Wheat className="w-3.5 h-3.5 text-amber-600" />
                        <span>Primary Crops & Capacity</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedFarmer.cropsGrown && selectedFarmer.cropsGrown.length > 0 ? (
                          selectedFarmer.cropsGrown.map((crop, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 text-xs shadow-2xs"
                            >
                              {crop}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">Mixed seasonal harvest</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fixed Sticky Footer for Actions */}
                  <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Farmer ID</span>
                      <span className="text-xs font-mono font-bold text-slate-700">#{selectedFarmer.farmerId || selectedFarmer._id}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedFarmer.status === 'PENDING' ? (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleRejectRequest(selectedFarmer)}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>Reject</span>
                          </button>

                          <button
                            disabled={actionLoading}
                            onClick={() => handleAcceptRequest(selectedFarmer)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {actionLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Accept & Add Member</span>
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/fpo/produce"
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Package className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Pooled Stock</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 text-center text-slate-400 space-y-3.5 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-300 shadow-2xs">
                    <Users className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h3 className="text-sm font-black text-slate-800">No Farmer Selected</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Select a farmer from the left list or adjust your search to inspect farm acreage, cluster proximity, and membership actions.
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

export default FPOFarmersPage;
