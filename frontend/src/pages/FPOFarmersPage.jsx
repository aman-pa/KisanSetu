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
  Building2,
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
  Check,
  X,
  Award,
  Layers,
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
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'MEMBERS'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [demoPending, setDemoPending] = useState(DEMO_PENDING_REQUESTS);
  const [members, setMembers] = useState([]);
  const [demoMembers, setDemoMembers] = useState(DEMO_APPROVED_MEMBERS);
  const [fpoInfo, setFpoInfo] = useState({ orgName: 'Punjab Kisan Co-operative HQ', serviceRadiusKm: 15 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Pending Requests & Approved Members
  const fetchFarmersData = async () => {
    try {
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
      if (detailsModalOpen) setDetailsModalOpen(false);
      setActionLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/fpo/farmers/accept', { farmerProfileId: farmer._id });
      if (data.success) {
        setSuccessMessage(data.message || `Farmer approved successfully!`);
        if (detailsModalOpen) setDetailsModalOpen(false);
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
      if (detailsModalOpen) setDetailsModalOpen(false);
      setActionLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/fpo/farmers/reject', { farmerProfileId: farmer._id });
      if (data.success) {
        setSuccessMessage(data.message || `Membership request rejected.`);
        if (detailsModalOpen) setDetailsModalOpen(false);
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

  const totalAcreage = displayMembers.reduce((sum, m) => sum + (Number(m.farmSizeAcres) || 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* ========================================================================= */}
        {/* TOP WELCOME BANNER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {fpoInfo.orgName || 'Farmer Producer Organisation Portal'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              FPO Farmers Management 🌾
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Review pending membership applications from nearby farmers, verify service radius eligibility (10–20 km), and manage active co-operative members.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => {
                setLoading(true);
                fetchFarmersData();
              }}
              className="px-5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Farmers
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4 SUMMARY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Pending Requests */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pending Requests</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{displayPending.length}</p>
              <p className="text-[11px] font-bold text-amber-700 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Awaiting FPO Review
              </p>
            </div>
          </div>

          {/* Card 2: Active Members */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Members</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">{displayMembers.length}</p>
              <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved Member Network
              </p>
            </div>
          </div>

          {/* Card 3: Service Radius */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Service Radius</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-blue-700">{fpoInfo.serviceRadiusKm || 15} <span className="text-sm font-bold text-slate-500">km</span></p>
              <p className="text-[11px] font-bold text-blue-700 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 10–20 km Member Boundary
              </p>
            </div>
          </div>

          {/* Card 4: Total Aggregated Acreage */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Aggregated Land</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Wheat className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-2xl sm:text-3xl font-black text-purple-700">{totalAcreage.toFixed(1)} <span className="text-sm font-bold text-slate-500">Acres</span></p>
              <p className="text-[11px] font-bold text-purple-700 mt-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Collective Farmland Base
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB CONTROLS & MAIN SECTION */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* Tab Navigation Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Farmer Directory & Applications</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Verify farmer credentials, proximity to FPO hub, and grant membership access.
              </p>
            </div>

            {/* Tab Switches */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl self-start sm:self-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'PENDING'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Pending Requests
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                  {displayPending.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('MEMBERS')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'MEMBERS'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                FPO Members
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  {displayMembers.length}
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PENDING REQUESTS TABLE */}
          {/* ========================================================================= */}
          {activeTab === 'PENDING' && (
            <div className="overflow-x-auto">
              {displayPending.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-extrabold text-slate-700">No Pending Membership Requests</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    When nearby farmers request to join your FPO via the KisanSetu Farmer Dashboard, they will appear here for verification.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                      <th className="py-3.5 px-6">Farmer Name</th>
                      <th className="py-3.5 px-6">Location & Distance</th>
                      <th className="py-3.5 px-6">Farm Size & Crops</th>
                      <th className="py-3.5 px-6">Trust & Quality</th>
                      <th className="py-3.5 px-6">Request Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {displayPending.map((req) => {
                      const reqDate = req.fpoRequestedAt
                        ? new Date(req.fpoRequestedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent';

                      return (
                        <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Farmer Name */}
                          <td className="py-4 px-6 font-medium">
                            <span className="font-extrabold text-slate-900 block">{req.farmerName}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" /> {req.phone || 'Contact on File'}
                            </span>
                          </td>

                          {/* Location & Distance */}
                          <td className="py-4 px-6 space-y-1">
                            <span className="text-xs text-slate-800 font-semibold block flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              {req.location?.village ? `${req.location.village}, ` : ''}
                              {req.location?.district}, {req.location?.state}
                            </span>
                            {req.distanceKm !== undefined && req.distanceKm !== null && (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                  req.isWithinRadius
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                ~{req.distanceKm} km away • {req.isWithinRadius ? 'Within Radius' : 'Outside Radius'}
                              </span>
                            )}
                          </td>

                          {/* Farm Size & Crops */}
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 block">{req.farmSizeAcres} Acres</span>
                            <span className="text-[11px] text-slate-500 block">
                              {req.cropsGrown && req.cropsGrown.length ? req.cropsGrown.join(', ') : 'Mixed Produce'}
                            </span>
                          </td>

                          {/* Trust & Quality */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Award className="w-3 h-3 text-emerald-600" /> {req.trustScore || 90} Score
                            </span>
                          </td>

                          {/* Request Date */}
                          <td className="py-4 px-6 text-slate-500 font-medium">
                            {reqDate}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedFarmer(req);
                                setDetailsModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" /> Details
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() => handleAcceptRequest(req)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept
                            </button>

                            <button
                              disabled={actionLoading}
                              onClick={() => handleRejectRequest(req)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 text-rose-600" /> Reject
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: APPROVED MEMBERS TABLE */}
          {/* ========================================================================= */}
          {activeTab === 'MEMBERS' && (
            <div className="overflow-x-auto">
              {displayMembers.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Users className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-extrabold text-slate-700">No Active Member Farmers Yet</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Accept pending membership requests to build your collective farmer network and aggregate produce volume.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                      <th className="py-3.5 px-6">Member Name</th>
                      <th className="py-3.5 px-6">Location</th>
                      <th className="py-3.5 px-6">Farmland Size</th>
                      <th className="py-3.5 px-6">Primary Crops</th>
                      <th className="py-3.5 px-6">Joined Date</th>
                      <th className="py-3.5 px-6">Membership Status</th>
                      <th className="py-3.5 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {displayMembers.map((mem) => {
                      const joinDate = mem.joinedDate
                        ? new Date(mem.joinedDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Active';

                      return (
                        <tr key={mem._id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Member Name */}
                          <td className="py-4 px-6 font-medium">
                            <span className="font-extrabold text-slate-900 block">{mem.farmerName}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" /> {mem.phone || 'Verified Phone'}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="py-4 px-6">
                            <span className="text-xs text-slate-800 font-semibold block flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              {mem.location?.village ? `${mem.location.village}, ` : ''}
                              {mem.location?.district}, {mem.location?.state}
                            </span>
                          </td>

                          {/* Farmland Size */}
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {mem.farmSizeAcres} Acres
                          </td>

                          {/* Primary Crops */}
                          <td className="py-4 px-6 text-slate-700">
                            {mem.cropsGrown && mem.cropsGrown.length ? mem.cropsGrown.join(', ') : 'Mixed Harvest'}
                          </td>

                          {/* Joined Date */}
                          <td className="py-4 px-6 text-slate-500 font-medium">
                            {joinDate}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Member
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => {
                                setSelectedFarmer(mem);
                                setDetailsModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" /> View Farmer
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FARMER DETAILS MODAL / DRAWER */}
      {/* ========================================================================= */}
      {detailsModalOpen && selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedFarmer.farmerName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedFarmer.status === 'APPROVED' ? 'Active FPO Member Farmer' : 'Incoming Membership Application'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              
              {/* Proximity Banner */}
              {selectedFarmer.distanceKm !== undefined && selectedFarmer.distanceKm !== null && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">FPO Proximity Verification</span>
                    <p className="text-xs font-bold text-emerald-950">
                      ~{selectedFarmer.distanceKm} km from FPO Hub ({selectedFarmer.serviceRadiusKm || 15} km configured limit)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                    {selectedFarmer.isWithinRadius !== false ? 'Eligible' : 'Check Boundary'}
                  </span>
                </div>
              )}

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px]">Farmland Size</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{selectedFarmer.farmSizeAcres || 5} Acres</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px]">Trust Score</span>
                  <span className="text-sm font-black text-emerald-700 mt-0.5 block">{selectedFarmer.trustScore || 92} / 100 ★</span>
                </div>
              </div>

              {/* Location & Contact Details */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Farm Village</span>
                  <span className="font-bold text-slate-900">{selectedFarmer.location?.village || 'Village On Record'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">District & State</span>
                  <span className="font-bold text-slate-900">{selectedFarmer.location?.district}, {selectedFarmer.location?.state}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Contact Phone</span>
                  <span className="font-mono font-bold text-slate-900">{selectedFarmer.phone || 'Available in Directory'}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Primary Crops Grown</span>
                  <span className="font-bold text-slate-900">
                    {selectedFarmer.cropsGrown && selectedFarmer.cropsGrown.length ? selectedFarmer.cropsGrown.join(', ') : 'Mixed Harvest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>

              {selectedFarmer.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleRejectRequest(selectedFarmer)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    Reject
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleAcceptRequest(selectedFarmer)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Member
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FPOFarmersPage;
