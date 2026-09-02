import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import { PackagePlus, Award, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

const AddProducePage = () => {
  const [cropName, setCropName] = useState('Tomato');
  const [category, setCategory] = useState('VEGETABLES');
  const [quantityKg, setQuantityKg] = useState('2000');
  const [pricePerKg, setPricePerKg] = useState('28');
  const [grade, setGrade] = useState('GRADE_A');
  const [harvestDate, setHarvestDate] = useState('2026-09-07');
  const [district, setDistrict] = useState('Karnal');
  const [state, setState] = useState('Haryana');

  const [aiPriceRec, setAiPriceRec] = useState(null);
  const [aiQualityScore, setAiQualityScore] = useState(94);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Fetch AI Price Recommendation whenever crop or grade changes
  useEffect(() => {
    const fetchAIPrice = async () => {
      try {
        const { data } = await API.get('/prices/recommendation', {
          params: { crop: cropName, grade, district },
        });
        if (data.success) {
          setAiPriceRec(data.recommendedPriceRange);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAIPrice();
  }, [cropName, grade, district]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        cropName,
        category,
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        grade,
        harvestDate,
        location: { district, state, lat: 29.6857, lng: 76.9905 },
      };

      const { data } = await API.post('/products', payload);
      if (data.success) {
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create produce listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Add Produce Listing 🌾</h1>
          <p className="text-xs text-slate-500">List crop lots directly with AI price recommendation and instant batch QR generation</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none font-bold"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Onion">Onion</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Rice">Rice</option>
                    <option value="Apple">Apple</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none font-bold"
                  >
                    <option value="VEGETABLES">Vegetables</option>
                    <option value="FRUITS">Fruits</option>
                    <option value="GRAINS">Grains</option>
                    <option value="PULSES">Pulses</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-agri-primary focus:outline-none"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price per kg (₹)</label>
                  <input
                    type="number"
                    required
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-agri-primary focus:outline-none"
                    placeholder="28"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Declared Quality Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none font-bold"
                  >
                    <option value="GRADE_A">Grade A (Premium)</option>
                    <option value="GRADE_B">Grade B (Standard)</option>
                    <option value="GRADE_C">Grade C (Processing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-agri-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Farm District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-md hover:shadow-agri-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Publishing Produce Listing...' : 'Publish Listing & Generate Batch QR'} <PackagePlus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* AI Intelligence Widget Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Price Widget */}
            <div className="bg-gradient-to-br from-emerald-950 to-agri-dark p-6 rounded-3xl text-white space-y-3 shadow-agri-md">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-agri-gold" /> AI Price Recommendation
              </div>

              <div>
                <p className="text-[11px] text-slate-300">Recommended Range for {cropName}:</p>
                <p className="text-2xl font-black text-agri-light">
                  ₹{aiPriceRec?.min || 27} – ₹{aiPriceRec?.max || 29} / kg
                </p>
              </div>

              <p className="text-[10px] text-slate-300 leading-relaxed border-t border-white/10 pt-2">
                Bypassing 4 mandi agents saves ₹6.5/kg. Delhi NCR demand index is HIGH.
              </p>
            </div>

            {/* Quality Widget */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-emerald-600" /> Visual Quality Rating</span>
                <span className="text-emerald-700 font-extrabold">{aiQualityScore}%</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Surface defect inspection, color score (96%), and size uniformity estimated by computer vision.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProducePage;
