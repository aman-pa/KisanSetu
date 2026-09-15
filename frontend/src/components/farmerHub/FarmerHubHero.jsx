import React from 'react';
import {
  Search,
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Landmark,
  MapPin,
  Newspaper,
  BellRing,
  SlidersHorizontal,
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const FarmerHubHero = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  currentLang,
  onSelectLang,
  translations,
}) => {
  const navOptions = [
    { id: 'All', label: translations?.filterAll ? `${translations.filterAll} Schemes` : 'All Schemes', icon: Landmark, targetSection: 'featured-schemes' },
    { id: 'State Schemes', label: translations?.filterStateSchemes || 'State Schemes', icon: MapPin, targetSection: 'state-schemes' },
    { id: 'News', label: translations?.filterNews || 'Latest News', icon: Newspaper, targetSection: 'farmer-news' },
    { id: 'Alerts', label: 'Important Alerts', icon: BellRing, targetSection: 'farmer-alerts' },
    { id: 'Finder', label: 'Scheme Finder', icon: Sparkles, targetSection: 'scheme-finder' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm relative overflow-hidden space-y-6">
      {/* Decorative top mint bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-agri-dark via-agri-primary to-agri-accent" />

      {/* Top row: Trust indicator and Language selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-black shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          <span>{translations?.verifiedTrust || 'Verified Government Information'}</span>
        </div>

        <LanguageSelector
          currentLang={currentLang}
          onSelectLang={onSelectLang}
        />
      </div>

      {/* Main Titles */}
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {translations?.heroTitle || 'Government Benefits, Made Simple.'}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
          {translations?.heroSubtitle ||
            'Discover government schemes, subsidies, agriculture updates and support programs available for farmers.'}
        </p>
      </div>

      {/* Prominent Search Bar */}
      <div className="relative max-w-2xl">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              translations?.searchPlaceholder ||
              'Search schemes, subsidies, benefits...'
            }
            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 focus:border-agri-primary focus:ring-4 focus:ring-emerald-500/10 text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Direct Section Navigation Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Quick Direct Navigation:</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {navOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectFilter(opt.id, opt.targetSection)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-agri-primary text-white shadow-md scale-102 ring-2 ring-agri-accent/30'
                    : 'bg-slate-50 text-slate-700 hover:text-agri-primary hover:bg-emerald-50 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-agri-light' : 'text-slate-500'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FarmerHubHero;
