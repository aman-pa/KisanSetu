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
  IndianRupee,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const MODULES = [
  {
    id: 'optimizer',
    title: 'Mandi Optimizer',
    question: 'Where should I sell?',
    shortDesc: 'Find the best market for your produce based on price, distance and estimated net realization.',
    icon: Compass,
    iconBg: 'bg-emerald-100 text-emerald-800',
    activeCard: 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/50 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'weather',
    title: 'Weather Forecast',
    question: 'What will the weather be?',
    shortDesc: 'Understand upcoming weather conditions for your crop and selling plans.',
    icon: CloudSun,
    iconBg: 'bg-teal-100 text-teal-800',
    activeCard: 'bg-teal-50/70 border-teal-400 ring-1 ring-teal-400/50 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'forecast',
    title: 'Demand Forecast',
    question: 'How will demand change?',
    shortDesc: 'Understand how market demand may change over the coming days.',
    icon: TrendingUp,
    iconBg: 'bg-indigo-100 text-indigo-800',
    activeCard: 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400/50 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'price',
    title: 'Price Recommendation',
    question: 'What price should I consider?',
    shortDesc: 'Get an AI-backed price range to help you decide when and at what price to sell.',
    icon: IndianRupee,
    iconBg: 'bg-amber-100 text-amber-800',
    activeCard: 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400/50 shadow-xs',
    inactiveCard: 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
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

    if (window.innerWidth < 1024) {
      const element = document.getElementById('selected-tool-details');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              LEFT COLUMN: EXACT DESIGN AS USER SCREENSHOT (~32% width on Desktop)
             ========================================================================= */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 lg:sticky lg:top-24">
            {/* Heading section */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Market Intelligence
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Make <span className="text-emerald-800">Smarter Decisions</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Get AI-powered insights on markets, weather, demand and prices to maximize your returns.
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

          {/* =========================================================================
              RIGHT COLUMN: SELECTED TOOL DETAILS (~68% width on Desktop)
             ========================================================================= */}
          <div id="selected-tool-details" className="lg:col-span-8">
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
