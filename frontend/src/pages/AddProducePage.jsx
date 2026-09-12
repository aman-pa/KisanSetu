import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import API from '../services/api';
import {
  PackagePlus,
  Sparkles,
  Search,
  Calendar,
  Image as ImageIcon,
  Clock,
  ChevronDown,
  Camera,
} from 'lucide-react';

const CROP_DATABASE = [
  { name: 'Tomato', category: 'VEGETABLES', icon: '🍅', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', defaultPrice: 28 },
  { name: 'Potato (Alu)', category: 'VEGETABLES', icon: '🥔', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', defaultPrice: 18 },
  { name: 'Onion (Pyaz)', category: 'VEGETABLES', icon: '🧅', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80', defaultPrice: 24 },
  { name: 'Sharbati Wheat', category: 'GRAINS', icon: '🌾', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80', defaultPrice: 27 },
  { name: 'Basmati Rice', category: 'GRAINS', icon: '🌾', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', defaultPrice: 65 },
  { name: 'Shimla Apple', category: 'FRUITS', icon: '🍎', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', defaultPrice: 110 },
  { name: 'Alphonso Mango', category: 'FRUITS', icon: '🥭', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80', defaultPrice: 140 },
  { name: 'Green Peas (Matar)', category: 'VEGETABLES', icon: '🫛', image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80', defaultPrice: 42 },
  { name: 'Garlic (Lahsun)', category: 'SPICES', icon: '🧄', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=600&q=80', defaultPrice: 120 },
  { name: 'Red Chilli', category: 'SPICES', icon: '🌶️', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80', defaultPrice: 55 },
  { name: 'Spinach (Palak)', category: 'VEGETABLES', icon: '🥬', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', defaultPrice: 20 },
  { name: 'Cauliflower (Gobi)', category: 'VEGETABLES', icon: '🥦', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80', defaultPrice: 30 },
  { name: 'Chickpeas (Chana)', category: 'PULSES', icon: '🫘', image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=600&q=80', defaultPrice: 58 },
  { name: 'Mustard Seeds', category: 'SPICES', icon: '🌼', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', defaultPrice: 70 },
];

const CATEGORY_LIST = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices'];

const getTodayDateString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const AddProducePage = () => {
  const [cropName, setCropName] = useState('Tomato');
  const [cropSearch, setCropSearch] = useState('Tomato');
  const [showCropDropdown, setShowCropDropdown] = useState(false);

  const [category, setCategory] = useState('Vegetables');
  const [categorySearch, setCategorySearch] = useState('Vegetables');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [quantityKg, setQuantityKg] = useState('2000');
  const [pricePerKg, setPricePerKg] = useState('28');
  const [harvestDate, setHarvestDate] = useState(getTodayDateString());

  // 2 Image Slots
  const [image1, setImage1] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80');
  const [image2, setImage2] = useState('https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const cropRef = useRef(null);
  const categoryRef = useRef(null);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);

  const filteredCrops = CROP_DATABASE.filter((c) =>
    c.name.toLowerCase().includes(cropSearch.toLowerCase())
  );

  const filteredCategories = CATEGORY_LIST.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cropRef.current && !cropRef.current.contains(e.target)) {
        setShowCropDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCrop = (crop) => {
    setCropName(crop.name);
    setCropSearch(crop.name);
    
    const catFormatted = crop.category.charAt(0).toUpperCase() + crop.category.slice(1).toLowerCase();
    setCategory(catFormatted);
    setCategorySearch(catFormatted);
    
    setPricePerKg(String(crop.defaultPrice));
    setImage1(crop.image);
    setShowCropDropdown(false);
  };

  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setCategorySearch(cat);
    setShowCategoryDropdown(false);
  };

  const handleFileChange = (e, slot) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (slot === 1) setImage1(reader.result);
        if (slot === 2) setImage2(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateStockAge = () => {
    if (!harvestDate) return { days: 0, text: 'Harvested Today' };
    const hDate = new Date(harvestDate);
    const today = new Date();
    const diffTime = today - hDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { days: 0, text: 'Harvested Today 🌱 (100% Ultra Fresh)' };
    if (diffDays === 1) return { days: 1, text: 'Harvested 1 Day Ago 🟢 (Fresh Stock)' };
    return { days: diffDays, text: `Harvested ${diffDays} Days Ago 🟢 (Fresh Stock)` };
  };

  const stockAgeInfo = calculateStockAge();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const imagesArray = [image1, image2].filter(Boolean);
      const payload = {
        cropName,
        category: category.toUpperCase(),
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        grade: 'GRADE_A',
        harvestDate,
        images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'],
        location: { district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905 },
      };

      const { data } = await API.post('/products', payload);
      if (data.success) {
        navigate('/farmer/produce');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create produce listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-12">
        {/* Full-Width Header */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Direct Farm Produce Listing
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Add Produce 🌾</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Search produce, select category, upload 2 crop photos, and enter harvest date to list on My Produce.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        {/* Full Width Main Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Crop Name & Category Searchable Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Search Crop Name */}
              <div className="relative" ref={cropRef}>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Search className="w-4 h-4 text-emerald-700" /> Search Produce / Crop Name *
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Type to filter options</span>
                </label>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={cropSearch}
                    onFocus={() => setShowCropDropdown(true)}
                    onChange={(e) => {
                      setCropSearch(e.target.value);
                      setCropName(e.target.value);
                      setShowCropDropdown(true);
                    }}
                    placeholder="Type produce (e.g. Tomato, Potato, Wheat, Rice, Apple...)"
                    className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 focus:outline-none shadow-sm"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>

                {/* Crop Dropdown */}
                {showCropDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                    {filteredCrops.length > 0 ? (
                      filteredCrops.map((crop) => (
                        <div
                          key={crop.name}
                          onClick={() => handleSelectCrop(crop)}
                          className="p-3.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{crop.icon}</span>
                            <div>
                              <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">{crop.name}</span>
                              <span className="text-[11px] text-slate-500 font-semibold">{crop.category}</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ₹{crop.defaultPrice} / kg
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 text-xs text-slate-500 text-center font-medium">
                        Press Enter to use custom produce: "<b>{cropSearch}</b>"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search Category */}
              <div className="relative" ref={categoryRef}>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Search className="w-4 h-4 text-emerald-700" /> Category *
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Type to filter category</span>
                </label>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    value={categorySearch}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setCategory(e.target.value);
                      setShowCategoryDropdown(true);
                    }}
                    placeholder="Type category (e.g. Vegetables, Fruits, Grains, Pulses, Spices...)"
                    className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 focus:outline-none shadow-sm"
                  />
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>

                {/* Category Dropdown */}
                {showCategoryDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <div
                          key={cat}
                          onClick={() => handleSelectCategory(cat)}
                          className="p-3.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">{cat}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 text-xs text-slate-500 text-center font-medium">
                        Press Enter to set category: "<b>{categorySearch}</b>"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Quantity & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Total Quantity (kg) *</label>
                <input
                  type="number"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 2000"
                />
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                  Approx {((Number(quantityKg) || 0) / 100).toFixed(1)} Quintals
                </span>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Price per kg (₹) *</label>
                <input
                  type="number"
                  required
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 28"
                />
                <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                  Total Value: ₹{((Number(quantityKg || 0) * Number(pricePerKg || 0)) || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* 3. Date Harvested & Freshness Stock Age */}
            <div className="p-5 bg-emerald-50/70 rounded-3xl border border-emerald-200/80 space-y-3">
              <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Date Harvested (When was this crop harvested?) *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 inline-flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    {stockAgeInfo.text}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Calculates exact stock age so buyers know harvest freshness.
              </p>
            </div>

            {/* 4. 2 Image Upload Options (Image 1 & Image 2) */}
            <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700" /> Upload 2 Crop Images *
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Upload up to 2 produce photos from your device for buyers to inspect harvest quality.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Image 1 Upload Slot */}
                <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Image 1 (Main Crop Photo)</span>
                    <input
                      type="file"
                      ref={fileInput1Ref}
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 1)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInput1Ref.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" /> Upload File 1
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200 bg-slate-100">
                    <img
                      src={image1}
                      alt="Crop photo 1"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Main Photo
                    </span>
                  </div>
                </div>

                {/* Image 2 Upload Slot */}
                <div className="space-y-2.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Image 2 (Additional Photo)</span>
                    <input
                      type="file"
                      ref={fileInput2Ref}
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 2)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInput2Ref.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" /> Upload File 2
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden h-36 border border-slate-200 bg-slate-100">
                    <img
                      src={image2}
                      alt="Crop photo 2"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Photo 2
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Adding Produce...' : 'Add Produce'} <PackagePlus className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProducePage;
