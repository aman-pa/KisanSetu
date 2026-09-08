import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import MarketDataCard from '../components/MarketDataCard';
import DemandForecastCard from '../components/DemandForecastCard';
import PriceIntelligenceCard from '../components/PriceIntelligenceCard';
import FarmerActionCard from '../components/FarmerActionCard';
import MandiOptimizerCard from '../components/MandiOptimizerCard';
import {
  Sparkles,
  TrendingUp,
  Database,
  Compass,
  ArrowRight,
  Layers,
  Building2,
  Activity,
  ShieldCheck,
  Zap,
  Truck,
} from 'lucide-react';

const COMMODITIES = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Apple'];

const MarketIntelligencePage = () => {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [activeStage, setActiveStage] = useState('all'); // 'all' | 'data' | 'forecast' | 'price' | 'action' | 'optimizer'

  const stages = [
    {
      id: 'all',
      title: 'Full Pipeline Flow',
      subtitle: 'Complete 5-Stage Intelligence Engine',
      icon: Layers,
      color: 'bg-slate-900 text-white',
    },
    {
      id: 'optimizer',
      title: '5. Mandi Optimizer',
      subtitle: 'Net Realization & Transport Freight',
      icon: Compass,
      color: 'bg-emerald-700 text-white',
    },
    {
      id: 'data',
      title: '1. Market Data',
      subtitle: 'Observed Spot Prices & Arrivals',
      icon: Database,
      color: 'bg-emerald-600 text-white',
    },
    {
      id: 'forecast',
      title: '2. Demand Forecast',
      subtitle: 'Absorption & Pressure Proxy',
      icon: TrendingUp,
      color: 'bg-teal-600 text-white',
    },
    {
      id: 'price',
      title: '3. Price Intelligence',
      subtitle: 'Selling Timing & Multi-Mandi',
      icon: Building2,
      color: 'bg-indigo-600 text-white',
    },
    {
      id: 'action',
      title: '4. Farmer Action',
      subtitle: 'Personalized Decision Support',
      icon: Zap,
      color: 'bg-amber-600 text-white',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header Hero */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-agri-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                KisanSetu End-to-End Market Intelligence Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Agricultural Market Intelligence & Decision Support 🌾
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                Seamless flow from ground-truth mandi prices to AI demand forecasting, price timing, and personalized farmer actions.
              </p>
            </div>

            {/* Global Crop Quick-Filter */}
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md space-y-1 self-start md:self-auto">
              <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">
                Select Active Crop:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMODITIES.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCrop(crop)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedCrop === crop
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5-Stage Visual Stepper Flow */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs flex-shrink-0">
                1
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-extrabold text-white block truncate">Market Data</span>
                <span className="text-[10px] text-slate-400 block truncate">Observed Spot & Arrivals</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold text-xs flex-shrink-0">
                2
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-extrabold text-white block truncate">Demand Forecast</span>
                <span className="text-[10px] text-slate-400 block truncate">Market Absorption Proxy</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
                3
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-extrabold text-white block truncate">Price Intelligence</span>
                <span className="text-[10px] text-slate-400 block truncate">Timing & Multi-Mandi</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold text-xs flex-shrink-0">
                4
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-extrabold text-white block truncate">Farmer Action</span>
                <span className="text-[10px] text-slate-400 block truncate">Personalized Decisions</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-400/20 flex items-center justify-center text-amber-300 font-bold text-xs flex-shrink-0">
                5
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-extrabold text-white block truncate">Mandi Optimizer</span>
                <span className="text-[10px] text-slate-400 block truncate">Net Realization & Freight</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {stages.map((st) => {
            const Icon = st.icon;
            const isCurrent = activeStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setActiveStage(st.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-agri-dark to-agri-primary text-white shadow-agri-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {st.title}
              </button>
            );
          })}
        </div>

        {/* Stage 5: Net Realization & Mandi Optimizer */}
        {(activeStage === 'all' || activeStage === 'optimizer') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                Stage 5: Net Realization & Mandi Optimizer
              </span>
              <span className="text-xs text-slate-500 font-medium">
                True take-home economic optimization after vehicle-tiered freight, toll allowances & circuity routing
              </span>
            </div>
            <MandiOptimizerCard defaultCommodity={selectedCrop} />
          </div>
        )}

        {/* Stage 4: Personalized Farmer Decision Support (Top Action Layer) */}
        {(activeStage === 'all' || activeStage === 'action') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Stage 4: Farmer Action Intelligence
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Personalized lot valuation, risk assessment & explainable selling recommendations
              </span>
            </div>
            <FarmerActionCard defaultCommodity={selectedCrop} defaultMandi="Karnal" />
          </div>
        )}

        {/* Stage 1: Agricultural Market Data Layer */}
        {(activeStage === 'all' || activeStage === 'data') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                Stage 1: Agricultural Market Data Layer
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Observed spot prices, historical price spread bands & daily mandi arrival volumes
              </span>
            </div>
            <MarketDataCard defaultCommodity={selectedCrop} defaultMarket="" />
          </div>
        )}

        {/* Stage 3: Price Intelligence & Multi-Mandi Comparison */}
        {(activeStage === 'all' || activeStage === 'price') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-100 text-indigo-900 border border-indigo-300">
                Stage 3: Price Intelligence & Multi-Mandi Ranking
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Heuristic price scoring, sell vs wait signal, and cross-mandi price arbitrage
              </span>
            </div>
            <PriceIntelligenceCard defaultCommodity={selectedCrop} defaultMandi="Karnal" />
          </div>
        )}

        {/* Stage 2: Real Data-Driven AI Demand Forecasting Pipeline */}
        {(activeStage === 'all' || activeStage === 'forecast') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-teal-100 text-teal-900 border border-teal-300">
                Stage 2: Demand Forecasting Pipeline
              </span>
              <span className="text-xs text-slate-500 font-medium">
                7/15/30-Day Market Absorption & Pressure Proxy time-series forecast
              </span>
            </div>
            <DemandForecastCard defaultCommodity={selectedCrop} defaultDistrict="Delhi NCR" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketIntelligencePage;
