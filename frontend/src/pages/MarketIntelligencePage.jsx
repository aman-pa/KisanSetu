import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import MandiOptimizerCard from '../components/MandiOptimizerCard';
import MarketDataCard from '../components/MarketDataCard';
import DemandForecastCard from '../components/DemandForecastCard';
import PriceIntelligenceCard from '../components/PriceIntelligenceCard';
import {
  Compass,
  CloudSun,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const MODULES = [
  {
    id: 'optimizer',
    title: 'Mandi Optimizer',
    question: 'Where should I sell?',
    shortDesc: 'Find the best market for your produce based on price, distance and estimated net realization.',
    icon: Compass,
    iconBg: 'bg-emerald-100 text-emerald-800',
    activeColor: 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/60',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'weather',
    title: 'Weather Forecast',
    question: 'What will the weather be?',
    shortDesc: 'Understand upcoming weather conditions for your crop and selling plans.',
    icon: CloudSun,
    iconBg: 'bg-teal-100 text-teal-800',
    activeColor: 'border-teal-600 ring-2 ring-teal-600/20 bg-teal-50/60',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  {
    id: 'forecast',
    title: 'Demand Forecast',
    question: 'How will demand change?',
    shortDesc: 'Understand how market demand may change over the coming days.',
    icon: TrendingUp,
    iconBg: 'bg-indigo-100 text-indigo-800',
    activeColor: 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/60',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: 'price',
    title: 'Price Recommendation',
    question: 'What price should I consider?',
    shortDesc: 'Get an AI-backed price range to help you decide when and at what price to sell.',
    icon: DollarSign,
    iconBg: 'bg-amber-100 text-amber-800',
    activeColor: 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/60',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
];

const MarketIntelligencePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialParam = searchParams.get('tool') || searchParams.get('tab') || 'optimizer';
  
  const validInitial = MODULES.some((m) => m.id === initialParam) ? initialParam : 'optimizer';
  const [activeModule, setActiveModule] = useState(validInitial);

  useEffect(() => {
    const currentTool = searchParams.get('tool') || searchParams.get('tab');
    if (currentTool && MODULES.some((m) => m.id === currentTool) && currentTool !== activeModule) {
      setActiveModule(currentTool);
    }
  }, [searchParams]);

  const handleSelectModule = (moduleId) => {
    setActiveModule(moduleId);
    setSearchParams({ tool: moduleId });

    // On smaller mobile screens, smooth scroll to the right panel content
    if (window.innerWidth < 1024) {
      const element = document.getElementById('selected-tool-details');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const activeModuleMeta = MODULES.find((m) => m.id === activeModule) || MODULES[0];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              LEFT COLUMN: MARKET INTELLIGENCE TOOL SELECTOR (~33% width on Desktop)
             ========================================================================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Header section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-agri-sm space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>AI Decision Engine</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Market Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Make smarter decisions about your produce with AI-powered market, weather, demand and price insights.
              </p>
            </div>

            {/* Four Option Cards */}
            <div className="space-y-3">
              {MODULES.map((module) => {
                const Icon = module.icon;
                const isSelected = activeModule === module.id;

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => handleSelectModule(module.id)}
                    className={`w-full text-left p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer ${
                      isSelected
                        ? `${module.activeColor} shadow-md`
                        : 'bg-white border-slate-200/80 shadow-agri-sm hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl ${module.iconBg} flex items-center justify-center font-bold flex-shrink-0 shadow-xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                            {module.title}
                          </div>
                          <h2 className="text-base font-black text-slate-900 leading-snug">
                            {module.question}
                          </h2>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${module.badgeColor}`}>
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-normal leading-relaxed pl-13">
                      {module.shortDesc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Provenance Note in Left Column */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Real-time APMC Mandi, Open-Meteo & Logistics telemetry</span>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: SELECTED TOOL DETAILS (~67% width on Desktop)
             ========================================================================= */}
          <div id="selected-tool-details" className="lg:col-span-8 space-y-6">
            {/* Header for the Active Tool */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-agri-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selected Tool
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
                    Live Insights
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeModuleMeta.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {activeModuleMeta.shortDesc}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-100 self-start sm:self-auto">
                <span>{activeModuleMeta.question}</span>
              </div>
            </div>

            {/* Detailed Component Content */}
            <div className="animate-in fade-in duration-300">
              {activeModule === 'optimizer' && <MandiOptimizerCard />}
              {activeModule === 'weather' && <MarketDataCard />}
              {activeModule === 'forecast' && <DemandForecastCard />}
              {activeModule === 'price' && <PriceIntelligenceCard />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketIntelligencePage;
