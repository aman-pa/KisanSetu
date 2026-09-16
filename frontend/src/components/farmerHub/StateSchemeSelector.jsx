import React, { useState, useMemo } from 'react';
import {
  MapPin,
  ExternalLink,
  Coins,
  CheckCircle2,
  Search,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { FALLBACK_STATE_SCHEMES } from '../../services/governmentSchemes';
import GovernmentSourceBadge from './GovernmentSourceBadge';

const AVAILABLE_STATES = [
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Maharashtra',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Bihar',
  'Odisha',
];

const StateSchemeSelector = ({ initialSelectedState = 'Haryana' }) => {
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  // Flatten all state schemes into a single list for easy searching & filtering
  const allStateSchemesList = useMemo(() => {
    const list = [];
    Object.keys(FALLBACK_STATE_SCHEMES).forEach((stateName) => {
      FALLBACK_STATE_SCHEMES[stateName].forEach((s) => {
        list.push({
          ...s,
          state: stateName,
        });
      });
    });
    return list;
  }, []);

  // Filter schemes based on activeTab, stateFilter, and searchQuery
  const filteredSchemes = useMemo(() => {
    let result = allStateSchemesList;

    // Tab 1: Recommended for user's home state
    if (activeTab === 'recommended') {
      const userState = (initialSelectedState || 'Haryana').toLowerCase();
      const matched = result.filter(
        (s) =>
          s.state.toLowerCase() === userState ||
          userState.includes(s.state.toLowerCase()) ||
          s.state.toLowerCase().includes(userState)
      );
      result = matched.length > 0 ? matched : result.slice(0, 4);
    } else if (selectedStateFilter !== 'ALL') {
      result = result.filter((s) => s.state === selectedStateFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.benefit?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.state?.toLowerCase().includes(q) ||
          s.ministry?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allStateSchemesList, activeTab, selectedStateFilter, searchQuery, initialSelectedState]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStateFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Search & Tabs Controls Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        
        {/* Top Switcher Tabs: Recommended vs All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('recommended');
                setSelectedStateFilter('ALL');
              }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'recommended'
                  ? 'bg-violet-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Recommended for You</span>
              {initialSelectedState && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'recommended' ? 'bg-violet-800 text-violet-200' : 'bg-slate-200 text-slate-700'}`}>
                  {initialSelectedState}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-violet-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>All State Schemes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'all' ? 'bg-violet-800 text-violet-200' : 'bg-slate-200 text-slate-700'}`}>
                {allStateSchemesList.length}
              </span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-400 self-end sm:self-auto">
            {filteredSchemes.length} {filteredSchemes.length === 1 ? 'Scheme' : 'Schemes'} Found
          </span>
        </div>

        {/* Search & State Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Live Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by scheme name, keyword (e.g. Solar, Subsidy), or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* State Dropdown Filter (Visible in 'all' tab or when searching) */}
          {activeTab === 'all' && (
            <div className="relative sm:w-56">
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none cursor-pointer"
              >
                <option value="ALL">All States (India)</option>
                {AVAILABLE_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset button if filter is active */}
          {(searchQuery || (activeTab === 'all' && selectedStateFilter !== 'ALL')) && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-violet-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-800 text-[11px] font-black border border-violet-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-violet-600" />
                    {scheme.state} State Scheme
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-100">
                    {scheme.category || 'Special Subsidy'}
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">
                  {scheme.ministry}
                </p>

                <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-snug mb-3">
                  {scheme.name}
                </h3>

                {/* Key Benefit */}
                <div className="p-3.5 bg-gradient-to-br from-violet-50/80 to-purple-50/40 border border-violet-100 rounded-2xl mb-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-violet-700">
                    <Coins className="w-3.5 h-3.5 shrink-0" />
                    <span>State Scheme Benefit:</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {scheme.benefit}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {scheme.description}
                </p>

                {/* Eligibility */}
                {scheme.eligibility && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2 mb-4">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Eligibility:</strong> {scheme.eligibility}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <GovernmentSourceBadge
                  source={scheme.verifiedSource}
                  lastUpdated={scheme.lastUpdated}
                />
                {scheme.officialUrl && (
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-extrabold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Apply / Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 bg-white rounded-3xl border border-slate-100 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-800">No matching state schemes found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any state schemes matching "{searchQuery}". Try searching with a different keyword or reset filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-violet-700 text-white font-bold text-xs shadow-sm hover:bg-violet-800 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StateSchemeSelector;
