import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  ExternalLink,
  Coins,
  CheckCircle2,
  Search,
  Sparkles,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { FALLBACK_STATE_SCHEMES } from '../../services/governmentSchemes';
import GovernmentSourceBadge from './GovernmentSourceBadge';

const ALL_INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const POPULAR_STATES = [
  'Haryana',
  'Punjab',
  'Uttar Pradesh',
  'Jharkhand',
  'Uttarakhand',
  'Bihar',
  'Maharashtra',
  'Rajasthan',
  'Madhya Pradesh',
];

const StateSchemeSelector = ({ initialSelectedState = 'Haryana' }) => {
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'state-search'
  const [stateSearchInput, setStateSearchInput] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Autocomplete matching states as user types (e.g. 'jh' -> Jharkhand, 'utt' -> Uttar Pradesh, Uttarakhand)
  const matchingStateSuggestions = useMemo(() => {
    const q = stateSearchInput.toLowerCase().trim();
    if (!q) return ALL_INDIAN_STATES;
    return ALL_INDIAN_STATES.filter((st) => st.toLowerCase().includes(q));
  }, [stateSearchInput]);

  // Filter schemes based on active tab and state selection
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
    const targetState = selectedState || (stateSearchInput.trim() ? stateSearchInput.trim() : '');
    if (!targetState || targetState.toLowerCase() === 'all') {
      return allStateSchemesList;
    }

    const q = targetState.toLowerCase();
    const matched = allStateSchemesList.filter((s) => s.state.toLowerCase().includes(q));
    return matched.length > 0 ? matched : [];
  }, [allStateSchemesList, activeTab, selectedState, stateSearchInput, initialSelectedState]);

  const handleSelectState = (stateName) => {
    setSelectedState(stateName === 'ALL' ? '' : stateName);
    setStateSearchInput(stateName === 'ALL' ? '' : stateName);
    setIsDropdownOpen(false);
  };

  const handleClearStateSearch = () => {
    setStateSearchInput('');
    setSelectedState('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card: Tabs & State Autocomplete Search */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        
        {/* Simple 2-Tab Switcher: Recommended vs State Search */}
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
              onClick={() => {
                setActiveTab('state-search');
                setIsDropdownOpen(true);
              }}
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

        {/* Tab 1: Recommended State Banner */}
        {activeTab === 'recommended' && (
          <div className="p-4 bg-gradient-to-r from-violet-50/90 via-purple-50/70 to-indigo-50/50 border border-violet-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-violet-900 font-bold">
              <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-extrabold text-violet-950">
                  Targeted State Subsidies for <strong>{initialSelectedState || 'Haryana'}</strong>
                </p>
                <p className="text-[11px] text-violet-700 font-medium">
                  Exclusive regional benefits, power subsidies, and price protection programs for registered farmers.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('state-search');
                setIsDropdownOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white text-violet-800 border border-violet-200 hover:bg-violet-50 font-black text-xs whitespace-nowrap cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              Search Other States →
            </button>
          </div>
        )}

        {/* Tab 2: Interactive State Search Input with Live Autocomplete Dropdown */}
        {activeTab === 'state-search' && (
          <div className="space-y-3" ref={dropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-violet-600" />
                <span>Search State (e.g. Type "Jh" for Jharkhand, "Utt" for UP / Uttarakhand):</span>
              </label>
              {selectedState && (
                <button
                  type="button"
                  onClick={handleClearStateSearch}
                  className="text-[11px] font-bold text-violet-700 hover:text-violet-900 underline cursor-pointer"
                >
                  Show All States ({allStateSchemesList.length})
                </button>
              )}
            </div>

            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Start typing state name (e.g. Jharkhand, Uttar Pradesh, Punjab, Bihar, Rajasthan...)"
                  value={stateSearchInput}
                  onChange={(e) => {
                    setStateSearchInput(e.target.value);
                    setSelectedState('');
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full pl-10 pr-24 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all outline-none"
                />

                <div className="absolute right-2.5 flex items-center gap-1.5">
                  {(stateSearchInput || selectedState) && (
                    <button
                      type="button"
                      onClick={handleClearStateSearch}
                      className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 text-xs font-black transition-all cursor-pointer"
                      title="Clear State Search"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* FLOATING AUTOCOMPLETE SUGGESTION DROPDOWN */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 max-h-64 overflow-y-auto divide-y divide-slate-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Matching States ({matchingStateSuggestions.length})</span>
                    <span>Click to View Schemes</span>
                  </div>

                  {matchingStateSuggestions.length > 0 ? (
                    matchingStateSuggestions.map((st) => {
                      const schemeCount = (FALLBACK_STATE_SCHEMES[st] || []).length;
                      const isSelected = selectedState.toLowerCase() === st.toLowerCase();
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleSelectState(st)}
                          className={`w-full px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-violet-100 text-violet-900 font-black'
                              : 'text-slate-800 hover:bg-violet-50 hover:text-violet-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-violet-700' : 'text-slate-400'}`} />
                            <span className="text-xs">{st}</span>
                          </span>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${schemeCount > 0 ? 'bg-violet-100 text-violet-800' : 'bg-slate-100 text-slate-500'}`}>
                            {schemeCount} {schemeCount === 1 ? 'Scheme' : 'Schemes'}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching state found for "{stateSearchInput}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick State Selection Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-extrabold text-slate-400 mr-1">Popular:</span>
              {POPULAR_STATES.map((st) => {
                const isSelected = selectedState.toLowerCase() === st.toLowerCase();
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSelectState(st)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-700 text-white shadow-2xs font-extrabold'
                        : 'bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-800 border border-slate-200/80'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>

            {/* Active State Filter Tag */}
            {selectedState && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500">Active State Filter:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-100 text-violet-900 border border-violet-200 text-xs font-black">
                  <MapPin className="w-3.5 h-3.5 text-violet-700" />
                  <span>{selectedState}</span>
                  <button
                    type="button"
                    onClick={handleClearStateSearch}
                    className="ml-1 text-violet-600 hover:text-violet-950 font-black cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}
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
              We couldn't find state-specific schemes matching "{stateSearchInput || selectedState}". All central government schemes remain fully applicable.
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
