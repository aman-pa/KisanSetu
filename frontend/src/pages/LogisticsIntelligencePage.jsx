import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import {
  Fuel,
  Thermometer,
  Timer,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Compass,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart3,
  Layers,
  Truck,
  Scale,
  MapPin,
  Activity,
  Leaf,
  ArrowRight,
  Droplets,
  DollarSign,
  Navigation,
  GitFork,
  Route,
  Target,
  CircleDot,
  Users,
  Phone,
} from 'lucide-react';

// Specialized Logistics Intelligence Modules
const LOGISTICS_MODULES = [
  {
    id: 'directional-split-ai',
    title: 'AI Multi-Rider Cost Optimizer',
    question: 'Optimal Fleet Size ($k^*=1..5$) & Cost Minimizer',
    shortDesc: 'Calculates global lowest logistics cost (Fuel + Wages + Spoilage) across 1 to 5 delivery riders based on order spread.',
    icon: GitFork,
    iconBg: 'bg-emerald-100 text-emerald-800',
    activeCard: 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'fuel-toll-optimizer',
    title: 'Fuel, Toll & Backhaul Forecaster',
    question: 'Highway Diesel, Fastag & Empty-Miles Reduction',
    shortDesc: 'Route simulation for dynamic fuel consumption, Fastag toll bypass, and return backhaul freight matching.',
    icon: Fuel,
    iconBg: 'bg-blue-100 text-blue-800',
    activeCard: 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'perishability-spoilage',
    title: 'Perishability & Thermal Risk AI',
    question: 'Cold-Chain Shelf-Life vs Ambient Temp Delta',
    shortDesc: 'Produce degradation models, temperature delta curves, and thermal insulation buffer predictions.',
    icon: Thermometer,
    iconBg: 'bg-purple-100 text-purple-800',
    activeCard: 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-400/20 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'eco-batch-analytics',
    title: '20km Area-Batch Pooling Analytics',
    question: '5-Hour Aggregation Window & Density Impact',
    shortDesc: 'Doorstep consumer clustering analytics, route consolidation density, and 48% freight cost cuts.',
    icon: Timer,
    iconBg: 'bg-teal-100 text-teal-800',
    activeCard: 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-400/20 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'apmc-gate-congestion',
    title: 'APMC & DC Terminal Queue AI',
    question: 'Gate Turnaround Time & Optimal Arrival Window',
    shortDesc: 'Hourly entry dock queue predictions, fast-track QR bypass lanes, and early-morning turnaround savings.',
    icon: Clock,
    iconBg: 'bg-amber-100 text-amber-800',
    activeCard: 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
];

// =========================================================================
// 1. FLAGSHIP: AI DIRECTIONAL SPLIT & SPATIAL MULTI-FLEET PROFIT OPTIMIZER WIDGET
// =========================================================================
const DirectionalSplitOptimizer = () => {
  const [selectedScenario, setSelectedScenario] = useState('opposite_directions');
  const [selectedFleetSize, setSelectedFleetSize] = useState(2);
  const [customAngle, setCustomAngle] = useState(162);
  const [applySuccess, setApplySuccess] = useState('');

  const deliveryRoster = [
    {
      riderId: 'rider_1',
      name: 'Vikram Rawat',
      phone: '+91 97234 11223',
      vehicleNo: 'HR-05-CC-5521',
      vehicleType: 'Eco Electric 3-Wheeler (1 Ton)',
      color: '#059669',
      roleTitle: 'North Sector Delivery Lead',
    },
    {
      riderId: 'rider_2',
      name: 'Rohan Verma',
      phone: '+91 98111 22334',
      vehicleNo: 'HR-05-EV-3310',
      vehicleType: 'Eco EV Van 2 (1 Ton)',
      color: '#6366f1',
      roleTitle: 'South Sector Delivery Lead',
    },
    {
      riderId: 'rider_3',
      name: 'Amit Sen',
      phone: '+91 98991 44556',
      vehicleNo: 'HR-05-EV-8820',
      vehicleType: 'Express EV Cargo Scooter (150 kg)',
      color: '#f59e0b',
      roleTitle: 'East Sector Rapid Courier',
    },
    {
      riderId: 'rider_4',
      name: 'Deepak Joshi',
      phone: '+91 98777 66554',
      vehicleNo: 'HR-05-EV-1140',
      vehicleType: 'High-Speed Express EV Bike (80 kg)',
      color: '#e11d48',
      roleTitle: 'West G.T. Road Express Rider',
    },
    {
      riderId: 'rider_5',
      name: 'Rahul Sharma',
      phone: '+91 98120 77889',
      vehicleNo: 'HR-05-EV-9905',
      vehicleType: 'Urban Rapid Runner EV Scooter (100 kg)',
      color: '#0891b2',
      roleTitle: 'Central Transit Buffer Shuttle',
    },
  ];

  const scenarios = {
    opposite_directions: {
      name: 'Scenario 1: Opposite North vs South Sector Orders (162° Spread)',
      description: '2 orders in North (Sector 14 & Urban Estate) and 2 orders in South (Model Town & GT Road).',
      divergenceAngle: 162,
      recommendation: 'SPLIT_INTO_2_DIRECTIONAL_BATCHES',
      optimalRiders: 2,
      reasoning:
        'Destination bearings diverge by 162° (North vs South). 2 parallel directional riders cut criss-crossing completely. Delivers in 45 mins with 0 spoilage, minimizing total logistics cost to ₹210 and maximizing net profit to ₹470 (+67.8%).',
      revenueRs: 680,
      fleetMatrix: [
        {
          ridersCount: 1,
          label: '1 Delivery Boy (Solo Van)',
          combinedDistanceKm: 34.2,
          maxDurationMins: 105,
          fuelCostRs: 210,
          driverWageRs: 130,
          spoilagePenaltyRs: 60,
          totalCostRs: 400,
          netProfitRs: 280,
          profitMarginPct: 41.2,
          isOptimal: false,
          verdict: 'High Delay (105m) & ₹400 Cost',
        },
        {
          ridersCount: 2,
          label: '2 Delivery Boys (North + South Shuttles)',
          combinedDistanceKm: 24.8,
          maxDurationMins: 45,
          fuelCostRs: 120,
          driverWageRs: 90,
          spoilagePenaltyRs: 0,
          totalCostRs: 210,
          netProfitRs: 470,
          profitMarginPct: 69.1,
          isOptimal: true,
          verdict: '⭐ OPTIMAL LOWEST COST (₹210)',
        },
        {
          ridersCount: 3,
          label: '3 Delivery Boys (North + South + East)',
          combinedDistanceKm: 27.0,
          maxDurationMins: 25,
          fuelCostRs: 110,
          driverWageRs: 140,
          spoilagePenaltyRs: 0,
          totalCostRs: 250,
          netProfitRs: 430,
          profitMarginPct: 63.2,
          isOptimal: false,
          verdict: 'Fast (25m) but +₹40 Higher Cost',
        },
        {
          ridersCount: 4,
          label: '4 Delivery Boys (1 Drop Per Rider)',
          combinedDistanceKm: 32.0,
          maxDurationMins: 18,
          fuelCostRs: 120,
          driverWageRs: 200,
          spoilagePenaltyRs: 0,
          totalCostRs: 320,
          netProfitRs: 360,
          profitMarginPct: 52.9,
          isOptimal: false,
          verdict: 'Hyper-Fast (18m) but +₹110 Cost',
        },
        {
          ridersCount: 5,
          label: '5 Delivery Boys',
          combinedDistanceKm: 36.0,
          maxDurationMins: 15,
          fuelCostRs: 140,
          driverWageRs: 250,
          spoilagePenaltyRs: 0,
          totalCostRs: 390,
          netProfitRs: 290,
          profitMarginPct: 42.6,
          isOptimal: false,
          verdict: '+₹180 Over-Allocated',
        },
      ],
      clusterA: [
        { name: 'Drop 1: Anita Verma', area: 'Sector 14 (North)', distanceKm: 4.2, bearing: '025° NNE', crop: 'Tomato (3 kg), Potato (5 kg)' },
        { name: 'Drop 2: Sunita Sharma', area: 'Urban Estate (North-East)', distanceKm: 13.8, bearing: '048° NE', crop: 'Wheat (10 kg), Tomato (2 kg)' },
      ],
      clusterB: [
        { name: 'Drop 3: Rajesh Gupta', area: 'Model Town (South-East)', distanceKm: 8.5, bearing: '135° SE', crop: 'Spinach (2 kg), Onion (4 kg)' },
        { name: 'Drop 4: Deepak Malik', area: 'G.T. Road (South-West)', distanceKm: 18.4, bearing: '210° SSW', crop: 'Potato (5 kg), Tomato (4 kg)' },
      ],
    },
    linear_corridor: {
      name: 'Scenario 2: Single Linear Corridor (34° Spread)',
      description: 'All 4 consumer orders fall along the same straight North-East highway corridor.',
      divergenceAngle: 34,
      recommendation: 'SINGLE_CONSOLIDATED_LOOP',
      optimalRiders: 1,
      reasoning:
        'Orders are aligned along the same radial corridor (only 34° divergence). 1 delivery boy completes the run at minimum cost (₹180) without duplicate rider wage overhead.',
      revenueRs: 680,
      fleetMatrix: [
        {
          ridersCount: 1,
          label: '1 Delivery Boy (Solo Van)',
          combinedDistanceKm: 19.4,
          maxDurationMins: 48,
          fuelCostRs: 110,
          driverWageRs: 70,
          spoilagePenaltyRs: 0,
          totalCostRs: 180,
          netProfitRs: 500,
          profitMarginPct: 73.5,
          isOptimal: true,
          verdict: '⭐ OPTIMAL LOWEST COST (₹180)',
        },
        {
          ridersCount: 2,
          label: '2 Delivery Boys (Dual Shuttles)',
          combinedDistanceKm: 26.5,
          maxDurationMins: 40,
          fuelCostRs: 160,
          driverWageRs: 120,
          spoilagePenaltyRs: 0,
          totalCostRs: 280,
          netProfitRs: 400,
          profitMarginPct: 58.8,
          isOptimal: false,
          verdict: '+₹100 Duplicate Wage',
        },
        {
          ridersCount: 3,
          label: '3 Delivery Boys',
          combinedDistanceKm: 29.0,
          maxDurationMins: 28,
          fuelCostRs: 175,
          driverWageRs: 155,
          spoilagePenaltyRs: 0,
          totalCostRs: 330,
          netProfitRs: 350,
          profitMarginPct: 51.5,
          isOptimal: false,
          verdict: '+₹150 Inefficient',
        },
        {
          ridersCount: 4,
          label: '4 Delivery Boys',
          combinedDistanceKm: 34.0,
          maxDurationMins: 20,
          fuelCostRs: 190,
          driverWageRs: 190,
          spoilagePenaltyRs: 0,
          totalCostRs: 380,
          netProfitRs: 300,
          profitMarginPct: 44.1,
          isOptimal: false,
          verdict: '+₹200 Overstaffed',
        },
        {
          ridersCount: 5,
          label: '5 Delivery Boys',
          combinedDistanceKm: 38.0,
          maxDurationMins: 18,
          fuelCostRs: 210,
          driverWageRs: 240,
          spoilagePenaltyRs: 0,
          totalCostRs: 450,
          netProfitRs: 230,
          profitMarginPct: 33.8,
          isOptimal: false,
          verdict: '+₹270 Wasteful',
        },
      ],
      clusterA: [
        { name: 'Drop 1: Anita Verma', area: 'Sector 14', distanceKm: 4.2, bearing: '025° NNE', crop: 'Tomato (3 kg)' },
        { name: 'Drop 2: Sunita Sharma', area: 'Urban Estate', distanceKm: 8.5, bearing: '034° NE', crop: 'Wheat (10 kg)' },
      ],
      clusterB: [
        { name: 'Drop 3: Mohit Sen', area: 'Taraori Gate', distanceKm: 14.0, bearing: '038° NE', crop: 'Potato (5 kg)' },
        { name: 'Drop 4: Pooja Jain', area: 'Nilokheri Hub', distanceKm: 18.2, bearing: '040° NE', crop: 'Spinach (4 kg)' },
      ],
    },
    dense_plus_outlier: {
      name: 'Scenario 3: Dense Urban Cluster + 1 Far Outlier (118° Spread)',
      description: '3 orders in high-density city center (2–6 km) + 1 far order (18.4 km away).',
      divergenceAngle: 118,
      recommendation: 'MAIN_VAN_PLUS_EV_OUTLIER',
      optimalRiders: 2,
      reasoning:
        '3 dense urban drops are served by 1 electric 3-wheeler, while 1 far drop is served via direct EV bike to minimize transit time and optimize total cost (₹210).',
      revenueRs: 680,
      fleetMatrix: [
        {
          ridersCount: 1,
          label: '1 Delivery Boy (Solo Van)',
          combinedDistanceKm: 31.0,
          maxDurationMins: 90,
          fuelCostRs: 180,
          driverWageRs: 110,
          spoilagePenaltyRs: 30,
          totalCostRs: 320,
          netProfitRs: 360,
          profitMarginPct: 52.9,
          isOptimal: false,
          verdict: '₹320 Cost & Spoilage Delay',
        },
        {
          ridersCount: 2,
          label: '2 Delivery Boys (Van + EV Bike)',
          combinedDistanceKm: 27.6,
          maxDurationMins: 35,
          fuelCostRs: 115,
          driverWageRs: 80,
          spoilagePenaltyRs: 0,
          totalCostRs: 195,
          netProfitRs: 485,
          profitMarginPct: 71.3,
          isOptimal: true,
          verdict: '⭐ OPTIMAL LOWEST COST (₹195)',
        },
        {
          ridersCount: 3,
          label: '3 Delivery Boys',
          combinedDistanceKm: 28.5,
          maxDurationMins: 25,
          fuelCostRs: 120,
          driverWageRs: 135,
          spoilagePenaltyRs: 0,
          totalCostRs: 255,
          netProfitRs: 425,
          profitMarginPct: 62.5,
          isOptimal: false,
          verdict: '+₹60 Extra Cost',
        },
        {
          ridersCount: 4,
          label: '4 Delivery Boys',
          combinedDistanceKm: 32.0,
          maxDurationMins: 18,
          fuelCostRs: 130,
          driverWageRs: 180,
          spoilagePenaltyRs: 0,
          totalCostRs: 310,
          netProfitRs: 370,
          profitMarginPct: 54.4,
          isOptimal: false,
          verdict: '+₹115 Extra Cost',
        },
        {
          ridersCount: 5,
          label: '5 Delivery Boys',
          combinedDistanceKm: 36.0,
          maxDurationMins: 15,
          fuelCostRs: 140,
          driverWageRs: 240,
          spoilagePenaltyRs: 0,
          totalCostRs: 380,
          netProfitRs: 300,
          profitMarginPct: 44.1,
          isOptimal: false,
          verdict: '+₹185 Inefficient',
        },
      ],
      clusterA: [
        { name: 'Drop 1: Anita Verma', area: 'Sector 14', distanceKm: 4.2, bearing: '025° NNE', crop: 'Tomato (3 kg)' },
        { name: 'Drop 2: Rajesh Gupta', area: 'Model Town', distanceKm: 5.5, bearing: '085° E', crop: 'Spinach (2 kg)' },
        { name: 'Drop 3: Sunita Sharma', area: 'Urban Estate', distanceKm: 6.8, bearing: '048° NE', crop: 'Wheat (10 kg)' },
      ],
      clusterB: [
        { name: 'Drop 4: Deepak Malik', area: 'G.T. Road Outlier (Far)', distanceKm: 18.4, bearing: '210° SSW', crop: 'Potato (5 kg)' },
      ],
    },
  }[selectedScenario];

  const handleApply = () => {
    setApplySuccess(`✅ AI Dispatch Recommendation applied! Dispatched ${selectedFleetSize} delivery personnel with minimum total logistics cost.`);
    setTimeout(() => setApplySuccess(''), 4000);
  };

  const isDynamicSplitRecommended = customAngle >= 100;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Dynamic Multi-Rider Cost Minimization AI
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            20km Local Order Multi-Fleet Cost Optimizer
          </h2>
          <p className="text-xs text-slate-500">
            AI dynamically evaluates 1 to 5 delivery personnel and selects the lowest cost route allocation (Total Cost = Fuel + Wages + Spoilage Penalty).
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-500 block">Angular Divergence</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {scenarios.divergenceAngle}° Spread
          </span>
        </div>
      </div>

      {applySuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{applySuccess}</span>
        </div>
      )}

      {/* Scenario Selector Tabs */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">Simulate Order Destination Scenarios:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => {
              setSelectedScenario('opposite_directions');
              setSelectedFleetSize(2);
              setCustomAngle(162);
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedScenario === 'opposite_directions'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <span className="text-xs font-black text-slate-900 block">Opposite Directions (162°)</span>
            <span className="text-[10px] text-emerald-700 font-bold">AI Verdict: 2 Delivery Boys (₹210 Min Cost) ⚡</span>
          </button>

          <button
            onClick={() => {
              setSelectedScenario('linear_corridor');
              setSelectedFleetSize(1);
              setCustomAngle(34);
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedScenario === 'linear_corridor'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <span className="text-xs font-black text-slate-900 block">Linear Corridor (34°)</span>
            <span className="text-[10px] text-blue-700 font-bold">AI Verdict: 1 Solo Van (₹180 Min Cost) 🚗</span>
          </button>

          <button
            onClick={() => {
              setSelectedScenario('dense_plus_outlier');
              setSelectedFleetSize(2);
              setCustomAngle(118);
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedScenario === 'dense_plus_outlier'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <span className="text-xs font-black text-slate-900 block">Urban + 1 Outlier (118°)</span>
            <span className="text-[10px] text-purple-700 font-bold">AI Verdict: 2 Shuttles (₹195 Min Cost) 🛵</span>
          </button>
        </div>
      </div>

      {/* Fleet Size Selector Bar (1 to 5 Delivery Boys) */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-700" />
            Simulate Fleet Size (1 to 5 Delivery Personnel):
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            Selected: <b className="text-emerald-800">{selectedFleetSize} Delivery Personnel</b>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((k) => {
            const stat = scenarios.fleetMatrix.find((f) => f.ridersCount === k);
            const isOpt = stat?.isOptimal;
            const isSelected = selectedFleetSize === k;

            return (
              <button
                key={k}
                onClick={() => setSelectedFleetSize(k)}
                className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs text-slate-900'
                    : 'bg-white/70 hover:bg-white border-slate-200 text-slate-700'
                }`}
              >
                {isOpt && (
                  <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    ⭐ Lowest Cost
                  </span>
                )}
                <span className="text-xs font-black block">
                  {k === 1 ? '1 Solo Van' : `${k} Delivery Boys`}
                </span>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-500">Cost:</span>
                  <b className={`font-mono ${isOpt ? 'text-emerald-700 font-black' : 'text-slate-700'}`}>
                    ₹{stat?.totalCostRs || '—'}
                  </b>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Profit:</span>
                  <span className="font-mono font-bold text-slate-600">₹{stat?.netProfitRs || '—'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0A2412] to-slate-900 text-white shadow-md space-y-2 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              AI Lowest-Cost Dispatch Recommendation
            </span>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {scenarios.fleetMatrix.find((f) => f.isOptimal)?.verdict || '⭐ OPTIMAL LOWEST COST'}
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {scenarios.reasoning}
        </p>
      </div>

      {/* 1 to 5 Delivery Boys Full Comparison Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-700" />
            1 to 5 Delivery Boys Cost & Margin Matrix
          </h4>
          <span className="text-[11px] text-slate-500 font-semibold">
            Objective: min(Total Cost) = Fuel + Rider Wages + Spoilage Penalty
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-black">Fleet Setup</th>
                <th className="p-3 font-black">Combined Distance</th>
                <th className="p-3 font-black">Max Transit Time</th>
                <th className="p-3 font-black">Fuel / Energy</th>
                <th className="p-3 font-black">Rider Wages</th>
                <th className="p-3 font-black">Spoilage Risk</th>
                <th className="p-3 font-black text-slate-900 bg-emerald-50/70">Total Cost (₹)</th>
                <th className="p-3 font-black text-emerald-800">Net Profit (₹)</th>
                <th className="p-3 font-black">AI Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenarios.fleetMatrix.map((stat) => {
                const isOpt = stat.isOptimal;
                const isSelected = selectedFleetSize === stat.ridersCount;

                return (
                  <tr
                    key={stat.ridersCount}
                    onClick={() => setSelectedFleetSize(stat.ridersCount)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/90 font-bold'
                        : isOpt
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          stat.ridersCount === 1 ? 'bg-amber-500' :
                          stat.ridersCount === 2 ? 'bg-emerald-600' :
                          stat.ridersCount === 3 ? 'bg-indigo-600' :
                          stat.ridersCount === 4 ? 'bg-rose-600' : 'bg-cyan-600'
                        }`} />
                        <span className="font-bold text-slate-900">{stat.label}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">{stat.combinedDistanceKm} km</td>
                    <td className="p-3 font-mono text-slate-700">{stat.maxDurationMins} mins</td>
                    <td className="p-3 font-mono text-slate-700">₹{stat.fuelCostRs}</td>
                    <td className="p-3 font-mono text-slate-700">₹{stat.driverWageRs}</td>
                    <td className="p-3 font-mono">
                      {stat.spoilagePenaltyRs > 0 ? (
                        <span className="text-rose-600 font-bold">₹{stat.spoilagePenaltyRs}</span>
                      ) : (
                        <span className="text-emerald-700 font-bold">₹0</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-black text-slate-900 bg-emerald-50/50">
                      <span className={isOpt ? 'text-emerald-800 text-sm' : 'text-slate-800'}>
                        ₹{stat.totalCostRs}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <span className="text-emerald-700 font-black">
                        ₹{stat.netProfitRs} ({stat.profitMarginPct}%)
                      </span>
                    </td>
                    <td className="p-3">
                      {isOpt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                          ⭐ Lowest Cost
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {stat.verdict}
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

      {/* Assigned Delivery Personnel Roster */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-emerald-700" />
          Active Assigned Delivery Personnel Roster ({selectedFleetSize} Riders Assigned)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deliveryRoster.slice(0, selectedFleetSize).map((rider, rIdx) => (
            <div
              key={rider.riderId}
              className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 relative overflow-hidden"
              style={{ borderLeft: `4px solid ${rider.color}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-900">{rider.name}</h5>
                  <span className="text-[10px] text-slate-500 font-semibold">{rider.roleTitle}</span>
                </div>
                <a
                  href={`tel:${rider.phone}`}
                  className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-1"
                >
                  <Phone className="w-2.5 h-2.5 text-emerald-600" />
                  {rider.phone}
                </a>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-[11px] flex justify-between items-center">
                <span className="text-slate-500 font-mono">{rider.vehicleNo}</span>
                <span className="text-[10px] text-emerald-700 font-bold truncate max-w-[140px]">{rider.vehicleType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-semibold max-w-sm">
          AI spatial cost engine automatically picks the lowest cost fleet to eliminate transit delays and perishability loss.
        </span>
        <div className="flex items-center gap-2">
          <a
            href="/logistics/dashboard?tab=route-map"
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-700" />
            Live Dispatch Operations
          </a>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-300" />
            Apply Recommended Strategy ({selectedFleetSize} Riders)
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. FUEL & TOLL COST OPTIMIZER WIDGET
// ==========================================
const FuelAndTollOptimizer = () => {
  const [corridor, setCorridor] = useState('karnal-delhi');
  const [vehicleType, setVehicleType] = useState('8TON_REEFER');

  const corridorData = {
    'karnal-delhi': {
      name: 'Karnal FPO Hub ➔ Azadpur APMC Gateway (Delhi NCR)',
      distanceKm: 132,
      normalDieselLiters: 38,
      optimizedDieselLiters: 31,
      dieselCostPerLiter: 89.5,
      normalTollCost: 480,
      optimizedTollCost: 280,
      emptyReturnProbability: 86,
      co2SavedKg: 19.5,
    },
    'kaithal-noida': {
      name: 'Kaithal Hub ➔ FreshMart Regional DC (Noida Sector 62)',
      distanceKm: 184,
      normalDieselLiters: 54,
      optimizedDieselLiters: 43,
      dieselCostPerLiter: 89.5,
      normalTollCost: 620,
      optimizedTollCost: 380,
      emptyReturnProbability: 78,
      co2SavedKg: 28.2,
    },
    'panipat-jaipur': {
      name: 'Panipat Depot ➔ Muhana Mandi Central DC (Jaipur)',
      distanceKm: 295,
      normalDieselLiters: 88,
      optimizedDieselLiters: 71,
      dieselCostPerLiter: 89.5,
      normalTollCost: 950,
      optimizedTollCost: 650,
      emptyReturnProbability: 72,
      co2SavedKg: 44.0,
    },
  }[corridor];

  const fuelCostNormal = Math.round(corridorData.normalDieselLiters * corridorData.dieselCostPerLiter);
  const fuelCostOptimized = Math.round(corridorData.optimizedDieselLiters * corridorData.dieselCostPerLiter);
  const fuelSavings = fuelCostNormal - fuelCostOptimized;
  const tollSavings = corridorData.normalTollCost - corridorData.optimizedTollCost;
  const totalTripSavings = fuelSavings + tollSavings;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Route Optimization Engine
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">AI Fuel, Toll & Backhaul Forecaster</h2>
          <p className="text-xs text-slate-500">Calculate net savings via optimal highway speed, Fastag toll bypasses, and return load matches.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 block">Total Trip Savings</span>
          <span className="text-2xl font-black text-emerald-700">₹{totalTripSavings.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Transit Corridor</label>
          <select
            value={corridor}
            onChange={(e) => setCorridor(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="karnal-delhi">Karnal ➔ Azadpur APMC (132 km)</option>
            <option value="kaithal-noida">Kaithal ➔ Noida Supermarket DC (184 km)</option>
            <option value="panipat-jaipur">Panipat ➔ Jaipur Central DC (295 km)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Classification</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="8TON_REEFER">8-Ton Multi-Axle Refrigerated Reefer</option>
            <option value="3.5TON_SHUTTLE">3.5-Ton Tata 407 Cold Shuttle</option>
            <option value="1.5TON_CLUSTER">1.5-Ton Mahindra Bolero Maxi (20km Cluster)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-800">Diesel Fuel Saved</span>
          <p className="text-2xl font-black text-emerald-950 font-mono">
            ₹{fuelSavings.toLocaleString()}
          </p>
          <span className="text-[10px] font-bold text-emerald-700 block">
            {corridorData.normalDieselLiters - corridorData.optimizedDieselLiters} Liters Less
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-blue-800">Fastag Toll Saved</span>
          <p className="text-2xl font-black text-blue-950 font-mono">
            ₹{tollSavings.toLocaleString()}
          </p>
          <span className="text-[10px] font-bold text-blue-700 block">Express Lane Optimization</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-purple-800">Backhaul Match</span>
          <p className="text-2xl font-black text-purple-950 font-mono">
            {corridorData.emptyReturnProbability}%
          </p>
          <span className="text-[10px] font-bold text-purple-700 block">Zero Empty Miles</span>
        </div>

        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-center space-y-1">
          <span className="text-[10px] font-black uppercase text-teal-800">Carbon Reduced</span>
          <p className="text-2xl font-black text-teal-950 font-mono">
            {corridorData.co2SavedKg} <span className="text-xs">kg</span>
          </p>
          <span className="text-[10px] font-bold text-teal-700 block">Green Supply Chain</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-emerald-600" />
          AI Highway Navigation Advice
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Take the <b>Eastern Peripheral Expressway (EPE)</b> exit at km 84 to bypass Kundli toll plaza congestion. Maintaining a steady cruise speed of <b>52–56 km/h</b> ensures optimal reefer compressor fuel efficiency, cutting thermal engine drag by 18%.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 3. PERISHABILITY & SPOILAGE AI WIDGET
// ==========================================
const PerishabilitySpoilageAI = () => {
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [ambientTempC, setAmbientTempC] = useState(38);

  const cropSpecs = {
    tomato: {
      name: 'Organic Tomato (Grade A)',
      optimumTemp: '3.0°C - 5.0°C',
      idealHumidity: '85% - 90%',
      shelfLifeHoursAtOptimal: 72,
      shelfLifeHoursAtAmbient: 14,
      spoilageRiskScore: 'LOW',
      thermalInertiaHours: 18,
      recommendedPackaging: 'Perforated Ventilated Crates',
    },
    strawberry: {
      name: 'Hydroponic Strawberries / Berries',
      optimumTemp: '1.5°C - 3.0°C',
      idealHumidity: '90% - 95%',
      shelfLifeHoursAtOptimal: 48,
      shelfLifeHoursAtAmbient: 6,
      spoilageRiskScore: 'HIGH',
      thermalInertiaHours: 8,
      recommendedPackaging: 'Modified Atmosphere Packaging (MAP)',
    },
    spinach: {
      name: 'Fresh Leafy Spinach & Herbs',
      optimumTemp: '2.0°C - 4.0°C',
      idealHumidity: '95%',
      shelfLifeHoursAtOptimal: 60,
      shelfLifeHoursAtAmbient: 8,
      spoilageRiskScore: 'MODERATE',
      thermalInertiaHours: 12,
      recommendedPackaging: 'Moisture Lock Insulated Liner',
    },
    potato: {
      name: 'Seed & Table Potato (Kufri)',
      optimumTemp: '8.0°C - 12.0°C',
      idealHumidity: '80% - 85%',
      shelfLifeHoursAtOptimal: 360,
      shelfLifeHoursAtAmbient: 120,
      spoilageRiskScore: 'VERY_LOW',
      thermalInertiaHours: 48,
      recommendedPackaging: 'Jute Mesh Breathable Bags',
    },
  }[selectedCrop];

  const thermalDelta = ambientTempC - 4; // Assuming 4°C inside Reefer

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Cold-Chain Risk Engine
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Perishability & Spoilage AI</h2>
          <p className="text-xs text-slate-500">Calculate produce shelf-life retention against highway weather conditions.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 block">Cold-Chain Retention</span>
          <span className="text-2xl font-black text-emerald-700">99.4% Safe</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Consignment Crop</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="tomato">Organic Tomato (Grade A)</option>
            <option value="strawberry">Strawberries & Berries</option>
            <option value="spinach">Fresh Leafy Spinach & Greens</option>
            <option value="potato">Potato & Root Crops</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Ambient Outside Highway Temp: <b className="text-blue-700">{ambientTempC}°C</b>
          </label>
          <input
            type="range"
            min="20"
            max="48"
            value={ambientTempC}
            onChange={(e) => setAmbientTempC(Number(e.target.value))}
            className="w-full accent-blue-600 mt-2 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
          <span className="text-[10px] font-black uppercase text-blue-800">Thermal Delta</span>
          <p className="text-2xl font-black text-blue-950 font-mono">+{thermalDelta}°C Differential</p>
          <span className="text-[11px] text-blue-700 font-semibold">Outside {ambientTempC}°C ➔ Inside 4°C</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-800">Reefer Safe Window</span>
          <p className="text-2xl font-black text-emerald-950 font-mono">{cropSpecs.shelfLifeHoursAtOptimal} Hours</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Target Temp: {cropSpecs.optimumTemp}</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
          <span className="text-[10px] font-black uppercase text-rose-800">Uncooled Ambient Decay</span>
          <p className="text-2xl font-black text-rose-950 font-mono">{cropSpecs.shelfLifeHoursAtAmbient} Hours Only</p>
          <span className="text-[11px] text-rose-700 font-semibold">Rapid spoilage without reefer</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          FSSAI & APEDA Thermal Compliance Protocol
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          For <b>{cropSpecs.name}</b>, recommended humidity is <b>{cropSpecs.idealHumidity}</b>. Packaging should utilize <b>{cropSpecs.recommendedPackaging}</b>. In the event of a compressor failure, the container thermal inertia provides <b>{cropSpecs.thermalInertiaHours} hours</b> of emergency insulation buffer before internal temperatures breach the 7°C threshold.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 4. 20KM ECO-BATCH CLUSTERING WIDGET
// ==========================================
const EcoBatchClusteringAnalytics = () => {
  const [radiusKm, setRadiusKm] = useState(20);

  const clusterSavings = {
    10: {
      dropsPooled: 3,
      totalWeightKg: 28,
      individualMilesKm: 42,
      batchedMilesKm: 18.5,
      costSavingsPct: 44,
      co2ReducedKg: 12.4,
    },
    15: {
      dropsPooled: 4,
      totalWeightKg: 35,
      individualMilesKm: 58,
      batchedMilesKm: 26.2,
      costSavingsPct: 46,
      co2ReducedKg: 16.8,
    },
    20: {
      dropsPooled: 5,
      totalWeightKg: 46,
      individualMilesKm: 76,
      batchedMilesKm: 34.2,
      costSavingsPct: 48,
      co2ReducedKg: 21.5,
    },
  }[radiusKm];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Urban & Semi-Urban Delivery Matrix
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">20km Area-Batch Pooling Analytics</h2>
          <p className="text-xs text-slate-500">How KisanSetu 5-hour batch window consolidates retail orders to save 48% delivery costs.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 block">Pooling Efficiency</span>
          <span className="text-2xl font-black text-teal-700">{clusterSavings.costSavingsPct}% Saved</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[10, 15, 20].map((r) => (
          <button
            key={r}
            onClick={() => setRadiusKm(r)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              radiusKm === r
                ? 'bg-teal-700 text-white shadow-xs font-extrabold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {r} km Hub Radius Bubble
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1">
          <span className="text-[10px] font-black uppercase text-teal-800">Drops Pooled</span>
          <p className="text-2xl font-black text-teal-950 font-mono">{clusterSavings.dropsPooled} Consumer Drops</p>
          <span className="text-[10px] font-bold text-teal-700 block">{clusterSavings.totalWeightKg} kg consolidated</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-800">Total Route Km</span>
          <p className="text-2xl font-black text-emerald-950 font-mono">{clusterSavings.batchedMilesKm} km</p>
          <span className="text-[10px] font-bold text-emerald-700 block">vs {clusterSavings.individualMilesKm} km unpooled</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
          <span className="text-[10px] font-black uppercase text-blue-800">Cost Savings</span>
          <p className="text-2xl font-black text-blue-950 font-mono">{clusterSavings.costSavingsPct}%</p>
          <span className="text-[10px] font-bold text-blue-700 block">₹60 delivery vs ₹115 individual</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
          <span className="text-[10px] font-black uppercase text-purple-800">Carbon Offset</span>
          <p className="text-2xl font-black text-purple-950 font-mono">{clusterSavings.co2ReducedKg} kg</p>
          <span className="text-[10px] font-bold text-purple-700 block">Eco-batch friendly</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-teal-600" />
          5-Hour Batching Mechanism Explanation
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Instead of dispatching an individual delivery vehicle for every small 2–5 kg consumer basket, KisanSetu holds doorstep orders within a <b>20 km radius of the local FPO aggregation center</b> in a 5-hour pooling window. When the timer closes, the Travelling Salesperson Problem (TSP) algorithm generates an optimized single-loop multi-drop route, allowing farmers to offer <b>doorstep consumer freshness</b> with near-zero logistics overhead.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 5. APMC GATE CONGESTION PREDICTOR WIDGET
// ==========================================
const APMCGateCongestionPredictor = () => {
  const [selectedMandi, setSelectedMandi] = useState('azadpur');

  const mandiData = {
    azadpur: {
      name: 'Azadpur APMC Mandi (Delhi - Asia’s Largest Produce Hub)',
      peakHours: '05:00 AM - 07:30 AM',
      bestArrivalWindow: '03:30 AM - 04:45 AM',
      peakWaitMinutes: 55,
      offPeakWaitMinutes: 12,
      fastTrackQRLane: 'Gate #3 (E-NAM & KisanSetu Verified)',
      hourlyWait: [
        { time: '2 AM', wait: 8, status: 'GREEN' },
        { time: '4 AM', wait: 12, status: 'GREEN' },
        { time: '6 AM', wait: 55, status: 'RED' },
        { time: '8 AM', wait: 48, status: 'RED' },
        { time: '10 AM', wait: 25, status: 'AMBER' },
        { time: '12 PM', wait: 15, status: 'GREEN' },
      ],
    },
    noida_dc: {
      name: 'FreshMart Supermarket DC (Sector 62, Noida)',
      peakHours: '08:00 AM - 10:30 AM',
      bestArrivalWindow: '06:00 AM - 07:30 AM',
      peakWaitMinutes: 40,
      offPeakWaitMinutes: 10,
      fastTrackQRLane: 'Bay #4 (Direct Cold-Dock Inward)',
      hourlyWait: [
        { time: '4 AM', wait: 5, status: 'GREEN' },
        { time: '6 AM', wait: 10, status: 'GREEN' },
        { time: '8 AM', wait: 38, status: 'RED' },
        { time: '10 AM', wait: 40, status: 'RED' },
        { time: '12 PM', wait: 18, status: 'AMBER' },
        { time: '2 PM', wait: 8, status: 'GREEN' },
      ],
    },
    karnal_apmc: {
      name: 'Karnal APMC Yard (G.T. Road Gateway)',
      peakHours: '06:00 AM - 08:00 AM',
      bestArrivalWindow: '05:00 AM - 05:45 AM',
      peakWaitMinutes: 30,
      offPeakWaitMinutes: 8,
      fastTrackQRLane: 'Gate #1 (Weighbridge Fast-Track)',
      hourlyWait: [
        { time: '4 AM', wait: 6, status: 'GREEN' },
        { time: '6 AM', wait: 30, status: 'RED' },
        { time: '8 AM', wait: 28, status: 'RED' },
        { time: '10 AM', wait: 14, status: 'GREEN' },
        { time: '12 PM', wait: 8, status: 'GREEN' },
        { time: '2 PM', wait: 5, status: 'GREEN' },
      ],
    },
  }[selectedMandi];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Terminal Congestion Predictor
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">APMC & DC Gate Queue Intelligence</h2>
          <p className="text-xs text-slate-500">Avoid 1-hour gate unloading traffic jams by arriving during optimal arrival windows.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 block">Recommended Arrival</span>
          <span className="text-lg font-black text-emerald-700">{mandiData.bestArrivalWindow}</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Select Destination Unloading Terminal</label>
        <select
          value={selectedMandi}
          onChange={(e) => setSelectedMandi(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
        >
          <option value="azadpur">Azadpur APMC Mandi, Delhi NCR</option>
          <option value="noida_dc">FreshMart Supermarket DC, Noida</option>
          <option value="karnal_apmc">Karnal APMC Yard, Haryana</option>
        </select>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">Hourly Gate Entry & Dock Queue Time</span>
        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          {mandiData.hourlyWait.map((slot, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border ${
                slot.status === 'RED'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : slot.status === 'AMBER'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <span className="text-[10px] font-bold block text-slate-500">{slot.time}</span>
              <p className="text-lg font-black mt-1 font-mono">{slot.wait}m</p>
              <span className="text-[9px] font-black uppercase">
                {slot.status === 'RED' ? 'Heavy Peak' : slot.status === 'AMBER' ? 'Moderate' : 'Fast-Track'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-slate-500 font-bold block text-[10px]">Fast-Track QR Lane</span>
          <p className="font-extrabold text-slate-900">{mandiData.fastTrackQRLane}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
          <span className="text-emerald-800 font-bold block text-[10px]">Time Saved via Early Arrival</span>
          <p className="font-extrabold text-emerald-950">~{mandiData.peakWaitMinutes - mandiData.offPeakWaitMinutes} Minutes Turnaround Saved</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN LOGISTICS INTELLIGENCE PAGE
// ==========================================
const LogisticsIntelligencePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = 'directional-split-ai';
  const initialParam = searchParams.get('tool') || searchParams.get('tab') || defaultTab;
  const validInitial = LOGISTICS_MODULES.some((m) => m.id === initialParam) ? initialParam : defaultTab;
  const [activeModule, setActiveModule] = useState(validInitial);

  const handleSelectModule = (moduleId) => {
    setActiveModule(moduleId);
    setSearchParams({ tool: moduleId });
  };

  useEffect(() => {
    const currentTool = searchParams.get('tool') || searchParams.get('tab');
    if (currentTool && LOGISTICS_MODULES.some((m) => m.id === currentTool) && currentTool !== activeModule) {
      setActiveModule(currentTool);
    }
  }, [searchParams]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4 space-y-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              LEFT COLUMN: Logistics Intelligence Modules Selector (~33% Width)
             ========================================================================= */}
          <div className="lg:col-span-4 min-w-0 lg:sticky lg:top-20">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto overscroll-contain">
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Logistics & Fleet AI
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Logistics <span className="text-emerald-800">Intelligence</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  Spatial directional clustering, route splitting AI, fuel calculations, and cold-chain risk preservation.
                </p>
              </div>

              {/* Option Cards */}
              <div className="space-y-3">
                {LOGISTICS_MODULES.map((module) => {
                  const Icon = module.icon;
                  const isSelected = activeModule === module.id;

                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => handleSelectModule(module.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected ? module.activeCard : module.inactiveCard
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl ${module.iconBg} flex items-center justify-center font-bold flex-shrink-0 shadow-2xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-slate-900 leading-snug">
                            {module.title}
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">
                            {module.question}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isSelected ? 'text-emerald-700 translate-x-0.5' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Active Intelligence Module Workspace (~67% Width)
             ========================================================================= */}
          <div className="lg:col-span-8 min-w-0">
            {activeModule === 'directional-split-ai' && <DirectionalSplitOptimizer />}
            {activeModule === 'fuel-toll-optimizer' && <FuelAndTollOptimizer />}
            {activeModule === 'perishability-spoilage' && <PerishabilitySpoilageAI />}
            {activeModule === 'eco-batch-analytics' && <EcoBatchClusteringAnalytics />}
            {activeModule === 'apmc-gate-congestion' && <APMCGateCongestionPredictor />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LogisticsIntelligencePage;
