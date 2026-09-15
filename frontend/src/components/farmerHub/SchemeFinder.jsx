import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { findMatchingSchemes } from '../../services/governmentSchemes';
import SchemeCard from './SchemeCard';

const INDIAN_STATES = [
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
  'West Bengal',
  'Telangana',
  'Kerala',
  'Himachal Pradesh',
  'Assam',
];

const FARMER_TYPES = [
  'Small & Marginal (Up to 5 Acres / 2 Ha)',
  'Medium (5 - 25 Acres)',
  'Large (> 25 Acres)',
  'Tenant Farmer',
  'Sharecropper',
  'Women Farmer',
];

const CROPS = [
  'Wheat',
  'Rice/Paddy',
  'Cotton',
  'Sugarcane',
  'Pulses (Chana/Arhar/Moong)',
  'Oilseeds (Mustard/Soybean)',
  'Vegetables & Horticulture',
  'Fruits & Plantation',
];

const IRRIGATION_TYPES = [
  'Canal / River',
  'Borewell / Tube well',
  'Drip / Sprinkler (Micro-irrigation)',
  'Rainfed (Monsoon dependent)',
];

const FARMING_CATEGORIES = [
  'Conventional Farming',
  'Certified Organic Farming (PKVY/PGS)',
  'Natural / Zero-Budget Farming',
  'Horticulture & Greenhouse',
  'Dairy & Livestock Allied',
];

const SchemeFinder = ({ userProfile }) => {
  const [state, setState] = useState(userProfile?.address?.state || 'Punjab');
  const [farmerType, setFarmerType] = useState('Small & Marginal (Up to 5 Acres / 2 Ha)');
  const [crop, setCrop] = useState('Wheat');
  const [landSizeAcres, setLandSizeAcres] = useState(userProfile?.profileDetails?.farmSizeAcres || 4);
  const [irrigationType, setIrrigationType] = useState('Borewell / Tube well');
  const [ageGroup, setAgeGroup] = useState('18-35');
  const [farmingCategory, setFarmingCategory] = useState('Conventional Farming');

  const [loading, setLoading] = useState(false);
  const [matchedResults, setMatchedResults] = useState(null);

  const handleFindSchemes = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      const criteria = {
        state,
        farmerType: farmerType.split(' ')[0], // e.g., 'Small'
        crop: crop.split(' ')[0],
        landSizeAcres: Number(landSizeAcres),
        irrigationType,
        ageGroup,
        farmingCategory,
      };

      const result = await findMatchingSchemes(criteria);
      setMatchedResults(result.matchedSchemes || []);
    } catch (err) {
      console.error('Scheme finder error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setState('Punjab');
    setFarmerType('Small & Marginal (Up to 5 Acres / 2 Ha)');
    setCrop('Wheat');
    setLandSizeAcres(4);
    setIrrigationType('Borewell / Tube well');
    setAgeGroup('18-35');
    setFarmingCategory('Conventional Farming');
    setMatchedResults(null);
  };

  return (
    <section id="scheme-finder" className="scroll-mt-24 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase text-agri-accent tracking-widest flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Personalized Eligibility Finder
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Find Schemes For You
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Answer a few quick questions about your farm to calculate instant scheme eligibility and subsidy matches.
          </p>
        </div>

        {matchedResults && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Questionnaire
          </button>
        )}
      </div>

      {/* Questionnaire Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <form onSubmit={handleFindSchemes} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. State */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                State / UT
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-agri-primary focus:border-transparent transition-all"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Farmer Type */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Farmer Category
              </label>
              <select
                value={farmerType}
                onChange={(e) => setFarmerType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-agri-primary focus:border-transparent transition-all"
              >
                {FARMER_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Primary Crop */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Primary Crop Cultivated
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-agri-primary focus:border-transparent transition-all"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Land Size */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Landholding Size (Acres)
              </label>
              <input
                type="number"
                min="0.25"
                max="500"
                step="0.25"
                value={landSizeAcres}
                onChange={(e) => setLandSizeAcres(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-agri-primary focus:border-transparent transition-all"
                placeholder="e.g. 4"
                required
              />
            </div>

            {/* 5. Irrigation Type */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Irrigation Source
              </label>
              <select
                value={irrigationType}
                onChange={(e) => setIrrigationType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-agri-primary focus:border-transparent transition-all"
              >
                {IRRIGATION_TYPES.map((it) => (
                  <option key={it} value={it}>
                    {it}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Age Group */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Farmer Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-agri-primary focus:border-transparent transition-all"
              >
                <option value="18-35">18 - 35 Years (Young Farmer)</option>
                <option value="36-55">36 - 55 Years</option>
                <option value="Above 55">Above 55 Years (Senior Farmer)</option>
              </select>
            </div>

            {/* 7. Farming Category */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Farming Practice / Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {FARMING_CATEGORIES.map((fc) => (
                  <label
                    key={fc}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      farmingCategory === fc
                        ? 'border-agri-primary bg-emerald-50 text-agri-dark shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="farmingCategory"
                      checked={farmingCategory === fc}
                      onChange={() => setFarmingCategory(fc)}
                      className="text-agri-primary focus:ring-agri-primary"
                    />
                    <span className="truncate">{fc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <span className="text-slate-400 text-xs font-medium">
              * Matching uses standard Ministry of Agriculture eligibility parameters.
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-agri-dark via-agri-primary to-agri-accent hover:opacity-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-agri-gold animate-spin-slow" />
              <span>{loading ? 'Evaluating Eligibility...' : 'Find Relevant Schemes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Matched Results Grid */}
      {matchedResults && (
        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-950 font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Found {matchedResults.length} schemes matching your profile ({state} • {crop} • {landSizeAcres} Acres)
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200">
              Sorted by Match Compatibility
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedResults.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default SchemeFinder;
