import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import MarketDataCard from '../components/MarketDataCard';
import DemandForecastCard from '../components/DemandForecastCard';
import {
  BarChart3,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

// FPO Intelligence Modules - Strictly APMC Market Data & Demand Forecast
const FPO_MODULES = [
  {
    id: 'market-data',
    title: 'Market Data',
    question: 'What are current spot prices & arrivals?',
    shortDesc: 'Real-time APMC mandi spot prices, intake volumes, and regional supply indicators.',
    icon: BarChart3,
    iconBg: 'bg-emerald-100 text-emerald-800',
    activeCard: 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/50 shadow-xs',
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
];

const FPOIntelligencePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = 'market-data';
  const initialParam = searchParams.get('tool') || searchParams.get('tab') || defaultTab;
  const validInitial = FPO_MODULES.some((m) => m.id === initialParam) ? initialParam : defaultTab;
  const [activeModule, setActiveModule] = useState(validInitial);

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

  useEffect(() => {
    const currentTool = searchParams.get('tool') || searchParams.get('tab');
    if (currentTool && FPO_MODULES.some((m) => m.id === currentTool) && currentTool !== activeModule) {
      setActiveModule(currentTool);
    }
  }, [searchParams]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: INDEPENDENTLY SCROLLABLE SIDEBAR (~33% width on Desktop)
             ========================================================================= */}
          <div className="lg:col-span-4 min-w-0 lg:sticky lg:top-20">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto overscroll-contain">
              
              {/* Heading section */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  FPO Intelligence
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Make <span className="text-emerald-800">Smarter Decisions</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  Real-time APMC mandi spot prices, intake volumes, and time-series demand forecasts.
                </p>
              </div>

              {/* Option Cards */}
              <div className="space-y-3">
                {FPO_MODULES.map((module) => {
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
              RIGHT COLUMN: INDEPENDENTLY SCROLLABLE WORKSPACE (~67% width on Desktop)
             ========================================================================= */}
          <div
            id="selected-tool-details"
            className="lg:col-span-8 min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto overscroll-contain pr-1 pb-6 space-y-6"
          >
            <div className="animate-in fade-in duration-300">
              {/* 1. APMC MARKET DATA MODULE */}
              {activeModule === 'market-data' && <MarketDataCard />}

              {/* 2. DEMAND FORECAST MODULE */}
              {activeModule === 'forecast' && <DemandForecastCard />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FPOIntelligencePage;
