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

const ALL_INDIAN_STATES = [
  'Andhra Pradesh',
  'Bihar',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh',
];

const StateSchemeSelector = ({ initialSelectedState = 'Haryana' }) => {
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'state-search'
  const [stateSearchText, setStateSearchText] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Flatten all state schemes into a single list
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

  // Filter schemes based on active tab and state search
  const displayedSchemes = useMemo(() => {
    if (activeTab === 'recommended') {
      const userState = (initialSelectedState || 'Haryana').toLowerCase();
      const matched = allStateSchemesList.filter(
        (s) =>
          s.state.toLowerCase() === userState ||
          userState.includes(s.state.toLowerCase()) ||
          s.state.toLowerCase().includes(userState)
      );
      return matched.length > 0 ? matched : allStateSchemesList.slice(0, 4);
    }

    // 'state-search' tab
    let result = allStateSchemesList;
    const query = (selectedState || stateSearchText).toLowerCase().trim();

    if (query && query !== 'all') {
      result = result.filter((s) => s.state.toLowerCase().includes(query));
    }

    return result;
  }, [allStateSchemesList, activeTab, stateSearchText, selectedState, initialSelectedState]);

  const handleClearStateSearch = () => {
    setStateSearchText('');
    setSelectedState('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card: Tabs & State Search */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        
        {/* Simple 2-Tab Navigation: Recommended vs State Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('recommended');
                handleClearStateSearch();
              }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'recommended'
                  ? 'bg-violet-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Recommended Schemes</span>
              {initialSelectedState && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'recommended' ? 'bg-violet-800 text-violet-200' : 'bg-slate-200 text-slate-700'}`}>
                  {initialSelectedState}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('state-search')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'state-search'
                  ? 'bg-violet-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search by State</span>
            </button>
          </div>

          <span className="text-xs font-bold text-slate-400 self-end sm:self-auto">
            {displayedSchemes.length} {displayedSchemes.length === 1 ? 'Scheme' : 'Schemes'} Found
          </span>
        </div>

        {/* Tab 1: Recommended Banner */}
        {activeTab === 'recommended' && (
          <div className="p-3.5 bg-violet-50/80 border border-violet-100 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-violet-900 font-bold">
              <MapPin className="w-4 h-4 text-violet-700 flex-shrink-0" />
              <span>
                Showing state agricultural subsidies &amp; incentives matching your location: <strong>{initialSelectedState || 'Haryana'}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('state-search')}
              className="text-violet-700 hover:text-violet-900 font-extrabold underline whitespace-nowrap cursor-pointer text-xs"
            >
              Search Other States →
            </button>
          </div>
        )}

        {/* Tab 2: Dedicated State Search Input & Dropdown */}
        {activeTab === 'state-search' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Enter State Name or Select from Dropdown:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Type State Name Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type state name (e.g. Punjab, UP, Maharashtra, Rajasthan, Bihar...)"
                  value={stateSearchText}
                  onChange={(e) => {
                    setStateSearchText(e.target.value);
                    setSelectedState('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              {/* State Dropdown Selector */}
              <div className="relative sm:w-60">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setStateSearchText(e.target.value === 'ALL' ? '' : e.target.value);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none cursor-pointer"
                >
                  <option value="ALL">All States (India)</option>
                  {ALL_INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear button */}
              {(stateSearchText || (selectedState && selectedState !== 'ALL')) && (
                <button
                  type="button"
                  onClick={handleClearStateSearch}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Schemes Cards Grid */}
      {displayedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedSchemes.map((scheme) => (
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
          <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-800">No schemes found for this state</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find state-specific schemes matching "{stateSearchText || selectedState}". All central government schemes remain fully applicable.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearStateSearch}
            className="px-4 py-2 rounded-xl bg-violet-700 text-white font-bold text-xs shadow-sm hover:bg-violet-800 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset State Search</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StateSchemeSelector;
