import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import {
  Landmark,
  MapPin,
  Newspaper,
  ChevronRight,
  ShieldCheck,
  Search,
  RotateCcw,
} from 'lucide-react';

import SchemeCard from '../components/farmerHub/SchemeCard';
import NewsCard from '../components/farmerHub/NewsCard';
import StateSchemeSelector from '../components/farmerHub/StateSchemeSelector';
import GovernmentSourceBadge from '../components/farmerHub/GovernmentSourceBadge';
import LoadingCard from '../components/farmerHub/LoadingCard';
import EmptyState from '../components/farmerHub/EmptyState';

import { getGovernmentSchemes } from '../services/governmentSchemes';
import { getGovernmentNews } from '../services/governmentNews';

// ─── Sidebar navigation modules ────────────────────────────────────────────
const MODULES = [
  {
    id: 'schemes',
    title: 'Government Schemes',
    question: 'What support can I get?',
    shortDesc:
      'Central government welfare schemes, crop insurance, subsidies, and direct benefit transfers.',
    icon: Landmark,
    iconBg: 'bg-emerald-100 text-emerald-800',
    activeCard:
      'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/50 shadow-xs',
    inactiveCard:
      'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'state-schemes',
    title: 'State Schemes',
    question: 'What does my state offer?',
    shortDesc:
      'State-sponsored agricultural subsidies, solar pumps, drought relief, and exclusive regional top-up benefits.',
    icon: MapPin,
    iconBg: 'bg-violet-100 text-violet-800',
    activeCard:
      'bg-violet-50/70 border-violet-400 ring-1 ring-violet-400/50 shadow-xs',
    inactiveCard:
      'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
  {
    id: 'news',
    title: 'Latest News',
    question: 'What are the latest announcements?',
    shortDesc:
      'Official press releases and agricultural cabinet decisions from the Press Information Bureau (PIB), Govt of India.',
    icon: Newspaper,
    iconBg: 'bg-blue-100 text-blue-800',
    activeCard:
      'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/50 shadow-xs',
    inactiveCard:
      'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs',
  },
];

// ─── Main Page ──────────────────────────────────────────────────────────────
const FarmerHubPage = () => {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState('schemes');

  // --- Schemes state ---
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('All');

  // --- News state ---
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  // Fetch schemes whenever search/category changes
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoadingSchemes(true);
      try {
        const catParam =
          schemeCategory === 'All'
            ? undefined
            : schemeCategory === 'Loans'
            ? 'Loans & Credit'
            : schemeCategory;
        const data = await getGovernmentSchemes({
          category: catParam,
          search: schemeSearch || undefined,
        });
        if (isMounted) setSchemes(data.schemes || []);
      } catch (err) {
        console.error('Schemes error:', err);
      } finally {
        if (isMounted) setLoadingSchemes(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [schemeSearch, schemeCategory]);

  // Fetch PIB news once
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoadingNews(true);
      try {
        const data = await getGovernmentNews();
        if (isMounted) setNews(data.news || []);
      } catch (err) {
        console.error('News error:', err);
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const handleSelectModule = (id) => {
    setActiveModule(id);
    // On mobile, scroll right panel into view
    if (window.innerWidth < 1024) {
      const el = document.getElementById('hub-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // In-memory filter for schemes
  const CATEGORY_FILTERS = ['All', 'Financial Support', 'Insurance', 'Subsidies', 'Loans'];
  const displayedSchemes = schemes.filter((s) => {
    if (schemeCategory === 'All') return true;
    if (schemeCategory === 'Loans')
      return s.category?.toLowerCase().includes('loan') || s.category?.toLowerCase().includes('credit');
    return s.category?.toLowerCase() === schemeCategory.toLowerCase();
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================================================================
              LEFT SIDEBAR — sticky, independently scrollable
             ================================================================ */}
          <div className="lg:col-span-4 min-w-0 lg:sticky lg:top-20">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto overscroll-contain">

              {/* Heading */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Agri Schemes &amp; Support
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Government{' '}
                  <span className="text-emerald-800">Support Portal</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  Discover central &amp; state schemes, subsidies, news and welfare programs tailored for Indian farmers.
                </p>
              </div>

              {/* Nav Items */}
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
                        <div
                          className={`w-11 h-11 rounded-2xl ${module.iconBg} flex items-center justify-center flex-shrink-0 shadow-2xs`}
                        >
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
                          isSelected
                            ? 'text-emerald-700 translate-x-0.5'
                            : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Legal footnote */}
              <div className="pt-2 border-t border-slate-100">
                <GovernmentSourceBadge
                  source="Government of India Ministries & Open Data"
                  verified={true}
                  lastUpdated="March 2026"
                  showDisclaimer={false}
                />
              </div>
            </div>
          </div>

          {/* ================================================================
              RIGHT PANEL — content for active module
             ================================================================ */}
          <div
            id="hub-panel"
            className="lg:col-span-8 min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto overscroll-contain pr-1 pb-6"
          >
            <div className="animate-in fade-in duration-300 space-y-6">

              {/* ── GOVERNMENT SCHEMES ── */}
              {activeModule === 'schemes' && (
                <div className="space-y-6">
                  {/* Panel header */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-1">
                      <Landmark className="w-3.5 h-3.5" />
                      Central Government Support
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mb-1">
                      Government Schemes &amp; Subsidies
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mb-5">
                      Verified central agricultural welfare schemes with direct bank transfer (DBT), crop insurance, and concessional credit.
                    </p>

                    {/* Search bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search schemes (e.g. PM-KISAN, PMFBY...)"
                          value={schemeSearch}
                          onChange={(e) => setSchemeSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {schemeSearch && (
                        <button
                          type="button"
                          onClick={() => { setSchemeSearch(''); setSchemeCategory('All'); }}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Category filter pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {CATEGORY_FILTERS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSchemeCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                            schemeCategory === cat
                              ? 'bg-emerald-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scheme cards */}
                  {loadingSchemes ? (
                    <LoadingCard count={6} />
                  ) : displayedSchemes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {displayedSchemes.map((scheme) => (
                        <SchemeCard key={scheme.id} scheme={scheme} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No matching schemes"
                      message={`No schemes matched "${schemeSearch}" in category "${schemeCategory}".`}
                      onReset={() => { setSchemeSearch(''); setSchemeCategory('All'); }}
                    />
                  )}
                </div>
              )}

              {/* ── STATE SCHEMES ── */}
              {activeModule === 'state-schemes' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-violet-700 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Regional Agriculture Initiatives
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mb-1">
                      State-Specific Farmer Support
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Explore exclusive subsidies, solar power incentives, drought assistance and top-up benefits from your state government.
                    </p>
                  </div>
                  <StateSchemeSelector
                    initialSelectedState={
                      user?.address?.state ||
                      user?.profileDetails?.state ||
                      'Punjab'
                    }
                  />
                </div>
              )}

              {/* ── LATEST NEWS ── */}
              {activeModule === 'news' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 mb-1">
                      <Newspaper className="w-3.5 h-3.5" />
                      Official Press Releases
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mb-1">
                      Latest Farmer Updates
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      Direct agricultural news and cabinet decisions from the Press Information Bureau (PIB), Government of India.
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      PIB Verified RSS Feed
                    </span>
                  </div>

                  {loadingNews ? (
                    <LoadingCard count={4} />
                  ) : news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {news.map((item) => (
                        <NewsCard key={item.id} news={item} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Government news temporarily unavailable"
                      message="Please try refreshing the page or check pib.gov.in directly."
                    />
                  )}
                </div>
              )}

            </div>
          </div>
          {/* end right panel */}

        </div>
      </div>
    </MainLayout>
  );
};

export default FarmerHubPage;
