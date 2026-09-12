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
  Upload,
  X,
  Plus,
} from 'lucide-react';

const CROP_DATABASE = [
  { name: 'Tomato', category: 'Vegetables', icon: '🍅', defaultPrice: 28 },
  { name: 'Potato (Alu)', category: 'Vegetables', icon: '🥔', defaultPrice: 18 },
  { name: 'Onion (Pyaz)', category: 'Vegetables', icon: '🧅', defaultPrice: 24 },
  { name: 'Sharbati Wheat', category: 'Grains', icon: '🌾', defaultPrice: 27 },
  { name: 'Basmati Rice', category: 'Grains', icon: '🌾', defaultPrice: 65 },
  { name: 'Shimla Apple', category: 'Fruits', icon: '🍎', defaultPrice: 110 },
  { name: 'Alphonso Mango', category: 'Fruits', icon: '🥭', defaultPrice: 140 },
  { name: 'Green Peas (Matar)', category: 'Vegetables', icon: '🫛', defaultPrice: 42 },
  { name: 'Garlic (Lahsun)', category: 'Spices', icon: '🧄', defaultPrice: 120 },
  { name: 'Red Chilli', category: 'Spices', icon: '🌶️', defaultPrice: 55 },
  { name: 'Spinach (Palak)', category: 'Vegetables', icon: '🥬', defaultPrice: 20 },
  { name: 'Cauliflower (Gobi)', category: 'Vegetables', icon: '🥦', defaultPrice: 30 },
  { name: 'Chickpeas (Chana)', category: 'Pulses', icon: '🫘', defaultPrice: 58 },
  { name: 'Mustard Seeds', category: 'Spices', icon: '🌼', defaultPrice: 70 },
];

const CATEGORY_LIST = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices'];

const AddProducePage = () => {
  // Start completely empty with no pre-filled values
  const [cropName, setCropName] = useState('');
  const [cropSearch, setCropSearch] = useState('');
  const [showCropDropdown, setShowCropDropdown] = useState(false);

  const [category, setCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [harvestDate, setHarvestDate] = useState('');

  // 2 Image Slots (starting empty)
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');

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
    setCategory(crop.category);
    setCategorySearch(crop.category);
    setPricePerKg(String(crop.defaultPrice));
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
    if (!harvestDate) return null;
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

    if (!cropName || !cropName.trim()) {
      setError('Please search or select a produce crop name.');
      return;
    }
    if (!quantityKg || Number(quantityKg) <= 0) {
      setError('Please enter a valid produce quantity in kg.');
      return;
    }
    if (!pricePerKg || Number(pricePerKg) <= 0) {
      setError('Please enter a valid price per kg.');
      return;
    }
    if (!harvestDate) {
      setError('Please select the date when this crop was harvested.');
      return;
    }

    setLoading(true);

    try {
      const imagesArray = [image1, image2].filter(Boolean);
      const payload = {
        cropName: cropName.trim(),
        category: (category || 'VEGETABLES').toUpperCase(),
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
        {/* Full-Width Banner Header */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Direct Farm Produce Listing
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Add Produce 🌾</h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Fill in your produce details, upload crop photos, enter harvest date, and list on My Produce.
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
                    placeholder="Search produce (e.g. Tomato, Potato, Wheat, Rice, Apple...)"
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
                  placeholder="Enter total quantity in kg (e.g. 2000)"
                />
                {quantityKg && Number(quantityKg) > 0 && (
                  <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
                    Approx {((Number(quantityKg) || 0) / 100).toFixed(1)} Quintals
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Price per kg (₹) *</label>
                <input
                  type="number"
                  required
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Enter price per kg (e.g. 28)"
                />
                {quantityKg && pricePerKg && Number(quantityKg) > 0 && Number(pricePerKg) > 0 && (
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                    Total Value: ₹{((Number(quantityKg) * Number(pricePerKg)) || 0).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Date Harvested & Stock Freshness */}
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

                {stockAgeInfo && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 inline-flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      {stockAgeInfo.text}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Calculates stock age so buyers know exact harvest freshness.
              </p>
            </div>

            {/* 4. Upload 2 Crop Images Dropzones (Starting Empty) */}
            <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700" /> Upload 2 Crop Photos *
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Select and upload produce photos from your device for buyers to inspect.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Image 1 Dropzone */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-800 block">Image 1 (Main Crop Photo)</span>
                  <input
                    type="file"
                    ref={fileInput1Ref}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 1)}
                    className="hidden"
                  />

                  {image1 ? (
                    <div className="relative rounded-2xl overflow-hidden h-40 border-2 border-emerald-500/40 shadow-sm bg-slate-900 group">
                      <img src={image1} alt="Uploaded Image 1" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage1('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-all cursor-pointer"
                        title="Remove Image 1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                        Main Photo Attached
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInput1Ref.current?.click()}
                      className="h-40 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer p-4 text-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">Click to Upload Image 1</span>
                        <span className="text-[10px] text-slate-500 font-medium">PNG, JPG, WEBP formats</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image 2 Dropzone */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-800 block">Image 2 (Additional Photo)</span>
                  <input
                    type="file"
                    ref={fileInput2Ref}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 2)}
                    className="hidden"
                  />

                  {image2 ? (
                    <div className="relative rounded-2xl overflow-hidden h-40 border-2 border-emerald-500/40 shadow-sm bg-slate-900 group">
                      <img src={image2} alt="Uploaded Image 2" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage2('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-all cursor-pointer"
                        title="Remove Image 2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                        Photo 2 Attached
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInput2Ref.current?.click()}
                      className="h-40 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer p-4 text-center group"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">Click to Upload Image 2</span>
                        <span className="text-[10px] text-slate-500 font-medium">PNG, JPG, WEBP formats</span>
                      </div>
                    </div>
                  )}
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
