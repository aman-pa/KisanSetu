import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ExternalLink,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { getSchemesByState } from '../../services/governmentSchemes';
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

const StateSchemeSelector = ({ initialSelectedState = 'Punjab' }) => {
  const [selectedState, setSelectedState] = useState(initialSelectedState);
  const [stateSchemes, setStateSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStateData = async () => {
      setLoading(true);
      try {
        const data = await getSchemesByState(selectedState);
        if (isMounted) {
          setStateSchemes(data.schemes || []);
        }
      } catch (err) {
        console.error('State schemes error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStateData();
    return () => { isMounted = false; };
  }, [selectedState]);

  return (
    <div className="space-y-5">
      {/* Horizontal Scrollable State Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {AVAILABLE_STATES.map((st) => {
          const isActive = selectedState === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedState(st)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-agri-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-agri-primary hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {/* State Schemes Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div className="h-5 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-3/4 bg-slate-200 rounded" />
              <div className="h-16 bg-slate-100 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : stateSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stateSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-violet-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-[11px] font-black border border-violet-100 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-violet-600" />
                    {scheme.state} State Scheme
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-100">
                    {scheme.category || 'Special Subsidy'}
                  </span>
                </div>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">
                  {scheme.ministry}
                </p>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-violet-700 transition-colors leading-snug mb-3">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-extrabold text-xs shadow-2xs transition-all"
                  >
                    <span>State Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-white rounded-3xl border border-slate-100 text-center text-xs text-slate-500">
          No state-specific schemes catalogued for {selectedState} yet.
          All central sector schemes apply in full.
        </div>
      )}
    </div>
  );
};

export default StateSchemeSelector;
