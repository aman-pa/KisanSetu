import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Award,
  TrendingDown,
  Layers,
  ThermometerSnowflake,
  Info,
  MapPin,
} from 'lucide-react';
import { validateImageQuality } from '../utils/imageQualityChecker';

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

  const todayDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const isGrainCategory = useMemo(() => {
    return ['GRAINS', 'PULSES', 'SPICES'].includes((category || '').toUpperCase()) ||
      ['wheat', 'rice', 'chana', 'mustard', 'barley', 'maize', 'dal'].some(kw => (cropName || '').toLowerCase().includes(kw));
  }, [category, cropName]);

  const maxAllowedDays = isGrainCategory ? 365 : 60;

  const minHarvestDateStr = useMemo(() => {
    const d = new Date(Date.now() - maxAllowedDays * 24 * 60 * 60 * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [maxAllowedDays]);

  const [harvestDate, setHarvestDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [storageCondition, setStorageCondition] = useState('Room Temperature');

  const handleHarvestDateChange = (newVal) => {
    if (!newVal) {
      setHarvestDate('');
      return;
    }
    // Future date prevention: immediately reject/clamp to today
    if (newVal > todayDateStr) {
      setError('Harvest date cannot be in the future.');
      setHarvestDate(todayDateStr);
      return;
    }
    // Check if over-aged date entered
    if (newVal < minHarvestDateStr) {
      setError('Harvest date exceeds the allowed freshness period for this produce category.');
    } else {
      if (error && (error.includes('Harvest date') || error.includes('harvest date'))) {
        setError('');
      }
    }
    setHarvestDate(newVal);
  };

  // 2 Image Slots & Stage 1 Validation States
  const [image1, setImage1] = useState('');
  const [image1Checking, setImage1Checking] = useState(false);
  const [image1Validation, setImage1Validation] = useState(null);

  const [image2, setImage2] = useState('');
  const [image2Checking, setImage2Checking] = useState(false);
  const [image2Validation, setImage2Validation] = useState(null);

  // Stage 1.5: Same-Crop Consistency Check State
  const [consistencyChecking, setConsistencyChecking] = useState(false);
  const [consistencyResult, setConsistencyResult] = useState(null);
  const [consistencyError, setConsistencyError] = useState(null);

  // Device Geolocation State
  const [deviceCoords, setDeviceCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('IDLE');

  // Stage 2: AI Crop Quality Assessment State
  const [cropAnalyzing, setCropAnalyzing] = useState(false);
  const [aiQualityResult, setAiQualityResult] = useState(null);
  const [aiQualityError, setAiQualityError] = useState(null);

  // Strict Sequential Verification Pipeline State
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [pipelineError, setPipelineError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to stamp GPS Map Camera overlay onto image canvas
  const stampGeoTagOnCanvas = (dataUrl, slot) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(img.width, 600);
      canvas.height = Math.max(img.height, 600);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const lat = (deviceCoords?.lat ?? 31.251449).toFixed(6);
      const lng = (deviceCoords?.lng ?? 75.704579).toFixed(6);
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const locationStr = 'Jalandhar, Punjab, India';

      const bannerH = Math.max(90, Math.floor(canvas.height * 0.22));
      const y0 = canvas.height - bannerH;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(0, y0, canvas.width, bannerH);

      ctx.fillStyle = '#10B981';
      ctx.fillRect(0, y0, canvas.width, Math.max(4, Math.floor(canvas.height * 0.01)));

      const fontBase = Math.max(14, Math.floor(bannerH * 0.16));
      const padX = Math.max(18, Math.floor(canvas.width * 0.03));
      let curY = y0 + fontBase * 1.5;

      ctx.fillStyle = '#10B981';
      ctx.font = `bold ${fontBase}px sans-serif`;
      ctx.fillText('📍 GPS Map Camera — KisanSetu Geo-Tagged Produce', padX, curY);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = `normal ${Math.max(11, Math.floor(fontBase * 0.82))}px sans-serif`;
      curY += fontBase * 1.35;
      ctx.fillText(`Location: ${locationStr}`, padX, curY);

      curY += fontBase * 1.25;
      ctx.fillText(`Latitude: ${lat}  |  Longitude: ${lng}`, padX, curY);

      curY += fontBase * 1.25;
      ctx.fillText(`Date: ${dateStr}  |  Time: ${timeStr}`, padX, curY);

      const stampedUrl = canvas.toDataURL('image/jpeg', 0.92);
      if (slot === 1) {
        setImage1(stampedUrl);
      } else {
        setImage2(stampedUrl);
      }
      setPipelineResult(null);
    };
    img.src = dataUrl;
  };

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

  // Request actual browser geolocation on page load
  useEffect(() => {
    if (navigator.geolocation) {
      setGeoStatus('LOCATING');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGeoStatus('VERIFIED');
        },
        (err) => {
          console.warn('Geolocation capture unavailable or denied:', err.message);
          setGeoStatus('NOT_AVAILABLE');
        },
        { timeout: 8000 }
      );
    } else {
      setGeoStatus('NOT_AVAILABLE');
    }
  }, []);

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
    // Reset checks if crop changes
    setConsistencyResult(null);
    setAiQualityResult(null);
  };

  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setCategorySearch(cat);
    setShowCategoryDropdown(false);
  };

  // Stage 1 Image File Upload & Validation Handler
  const handleFileChange = (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result;
      if (slot === 1) {
        setImage1(dataUrl);
        setImage1Checking(true);
        setImage1Validation(null);
        setConsistencyResult(null);
        setConsistencyError(null);
        setAiQualityResult(null);
        setAiQualityError(null);

        const val = await validateImageQuality(dataUrl);
        setImage1Checking(false);
        setImage1Validation(val);
      } else {
        setImage2(dataUrl);
        setImage2Checking(true);
        setImage2Validation(null);
        setConsistencyResult(null);
        setConsistencyError(null);
        setAiQualityResult(null);
        setAiQualityError(null);

        const val = await validateImageQuality(dataUrl);
        setImage2Checking(false);
        setImage2Validation(val);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger Strict Sequential Verification Pipeline
  const runVerificationPipeline = async () => {
    const trimmedCrop = (cropName || '').trim();
    if (!trimmedCrop || trimmedCrop.toLowerCase() === 'produce') {
      // Crop name must be selected first
      return;
    }

    if (
      image1 &&
      image2 &&
      image1Validation?.isAcceptable &&
      image2Validation?.isAcceptable &&
      !pipelineRunning
    ) {
      setPipelineRunning(true);
      setPipelineError(null);
      setAiQualityResult(null);
      setAiQualityError(null);

      try {
        const { data } = await API.post('/quality/verify-pipeline', {
          cropName: trimmedCrop,
          category: (category || 'VEGETABLES').toUpperCase(),
          harvestDate: harvestDate || new Date().toISOString(),
          storageCondition: storageCondition || 'Room Temperature',
          image1,
          image2,
          deviceCoords: deviceCoords || null,
        });

        setPipelineResult(data);
        if (data.success && data.qualityAssessment) {
          setAiQualityResult(data.qualityAssessment);
          setConsistencyResult(data.qualityAssessment.imageConsistency || { status: 'PASS' });
        } else {
          setAiQualityResult(null);
          setConsistencyResult(null);
          if (data.rejection?.message) {
            setPipelineError(data.rejection.message);
          }
        }
      } catch (err) {
        const resData = err.response?.data;
        if (resData && resData.gates) {
          setPipelineResult(resData);
          setPipelineError(resData.rejection?.message || 'Verification rejected.');
        } else {
          setPipelineError(err.response?.data?.message || err.message || 'Verification error.');
        }
        setAiQualityResult(null);
        setConsistencyResult(null);
      } finally {
        setPipelineRunning(false);
      }
    }
  };

  useEffect(() => {
    runVerificationPipeline();
  }, [
    image1,
    image2,
    image1Validation,
    image2Validation,
    cropName,
    category,
    harvestDate,
    storageCondition,
    deviceCoords,
  ]);

  const calculateStockAge = () => {
    if (!harvestDate) return null;
    const hDate = new Date(harvestDate);
    if (isNaN(hDate.getTime())) return null;

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfHarvest = new Date(hDate.getFullYear(), hDate.getMonth(), hDate.getDate());
    const diffTime = startOfToday.getTime() - startOfHarvest.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const isGrainCrop = ['GRAINS', 'PULSES', 'SPICES'].includes((category || '').toUpperCase()) ||
      ['wheat', 'rice', 'chana', 'mustard', 'barley', 'maize', 'dal'].some(kw => (cropName || '').toLowerCase().includes(kw));

    // Future Date: Strictly BLOCKED
    if (diffDays < 0) {
      return {
        days: diffDays,
        isFuture: true,
        isInvalid: true,
        text: `Invalid Date (Future Date Not Allowed: ${Math.abs(diffDays)}d in future) ⚠️`,
        subText: 'Harvest date cannot be in the future. Please select today or a past harvest date.',
        badgeClass: 'text-rose-900 bg-rose-100 border-rose-300',
        iconClass: 'text-rose-700',
      };
    }

    // Grains, Pulses & Spices (Max allowable freshness period: 365 days)
    if (isGrainCrop) {
      if (diffDays === 0) {
        return {
          days: 0,
          text: 'Harvested Today 🌱 (100% Ultra Fresh)',
          subText: 'Optimal freshness index. Prime farm-gate grain ready for immediate processing or storage.',
          badgeClass: 'text-emerald-900 bg-emerald-100 border-emerald-300',
          iconClass: 'text-emerald-700',
        };
      }
      if (diffDays <= 3) {
        return {
          days: diffDays,
          text: `Harvested ${diffDays} Day${diffDays === 1 ? '' : 's'} Ago 🟢 (Fresh Stock)`,
          subText: 'Fresh farm-gate grain within standard collection window.',
          badgeClass: 'text-emerald-900 bg-emerald-100 border-emerald-300',
          iconClass: 'text-emerald-700',
        };
      }
      if (diffDays <= 7) {
        return {
          days: diffDays,
          text: `Harvested ${diffDays} Days Ago 🟡 (Moderate Freshness)`,
          subText: 'Recent harvest grain batch within standard initial handling window.',
          badgeClass: 'text-amber-900 bg-amber-100 border-amber-300',
          iconClass: 'text-amber-700',
        };
      }
      if (diffDays <= 30) {
        return {
          days: diffDays,
          text: `Harvested ${diffDays} Days Ago 🌾 (Cured Warehouse Grain)`,
          subText: 'Properly cured grain with stable moisture content suitable for storage/transit.',
          badgeClass: 'text-sky-900 bg-sky-100 border-sky-300',
          iconClass: 'text-sky-700',
        };
      }
      if (diffDays <= 180) {
        return {
          days: diffDays,
          text: `Harvested ${diffDays} Days Ago 🌾 (Season Grain Stock)`,
          subText: 'Grain harvested earlier this season. Verify dry storage conditions and pest-free profile.',
          badgeClass: 'text-amber-900 bg-amber-100 border-amber-300',
          iconClass: 'text-amber-700',
        };
      }
      if (diffDays <= 365) {
        return {
          days: diffDays,
          text: `Harvested ${diffDays} Days Ago 🟠 (Aged Grain — Inspect Moisture)`,
          subText: 'Approaching annual harvest cycle limit. Moisture and grain integrity inspection required.',
          badgeClass: 'text-orange-900 bg-orange-100 border-orange-300',
          iconClass: 'text-orange-700',
        };
      }
      // Over 365 days old: EXPIRED / INELIGIBLE FOR SALE
      return {
        days: diffDays,
        isInvalid: true,
        text: `Harvested ${diffDays} Days Ago ❌ (Expired Grain — Ineligible for Sale)`,
        subText: `Grains older than 365 days exceed the allowed freshness period and cannot be listed on the marketplace.`,
        badgeClass: 'text-red-900 bg-red-100 border-red-300',
        iconClass: 'text-red-700',
      };
    }

    // Perishables: Vegetables & Fruits (Max allowable freshness period: 60 days)
    if (diffDays === 0) {
      return {
        days: 0,
        text: 'Harvested Today 🌱 (100% Ultra Fresh)',
        subText: 'Optimal freshness index. Prime farm-gate harvest ready for immediate dispatch.',
        badgeClass: 'text-emerald-900 bg-emerald-100 border-emerald-300',
        iconClass: 'text-emerald-700',
      };
    }
    if (diffDays <= 3) {
      return {
        days: diffDays,
        text: `Harvested ${diffDays} Day${diffDays === 1 ? '' : 's'} Ago 🟢 (Fresh Stock)`,
        subText: 'Fresh farm-gate produce within standard market dispatch window.',
        badgeClass: 'text-emerald-900 bg-emerald-100 border-emerald-300',
        iconClass: 'text-emerald-700',
      };
    }
    if (diffDays <= 7) {
      return {
        days: diffDays,
        text: `Harvested ${diffDays} Days Ago 🟡 (Moderate Freshness)`,
        subText: 'Approaching mid-shelf life. Prompt consolidation or cold storage recommended.',
        badgeClass: 'text-amber-900 bg-amber-100 border-amber-300',
        iconClass: 'text-amber-700',
      };
    }
    if (diffDays <= 14) {
      return {
        days: diffDays,
        text: `Harvested ${diffDays} Days Ago 🟠 (Significantly Aged Produce)`,
        subText: 'Visual freshness degraded. Risk of lower buyer acceptance or rapid deterioration.',
        badgeClass: 'text-orange-900 bg-orange-100 border-orange-300',
        iconClass: 'text-orange-700',
      };
    }
    if (diffDays <= 30) {
      return {
        days: diffDays,
        isWarning: true,
        text: `Harvested ${diffDays} Days Ago 🔴 (Stale / High Spoilage Risk)`,
        subText: 'Excessive storage time for fresh produce. Highly vulnerable to decay and rotting.',
        badgeClass: 'text-rose-900 bg-rose-100 border-rose-300',
        iconClass: 'text-rose-700',
      };
    }
    if (diffDays <= 60) {
      return {
        days: diffDays,
        isInvalid: true,
        text: `Harvested ${diffDays} Days Ago ❌ (Over-Aged Produce — Ineligible for Fresh Listing)`,
        subText: 'Fresh vegetables/fruits older than 30 days are past acceptable consumer shelf life and cannot be listed.',
        badgeClass: 'text-red-900 bg-red-100 border-red-300',
        iconClass: 'text-red-700',
      };
    }

    // Over 60 days old (e.g. 1990, 2017): SPOILED / EXPIRED
    return {
      days: diffDays,
      isInvalid: true,
      text: `Harvested ${diffDays} Days Ago ❌ (Spoiled / Expired Stock — Ineligible for Sale)`,
      subText: `This produce was harvested ${diffDays} days ago and is completely expired/spoiled. Fresh marketplace strictly rejects produce older than 60 days.`,
      badgeClass: 'text-red-900 bg-red-100 border-red-300',
      iconClass: 'text-red-700',
    };
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
    const hDate = new Date(harvestDate);
    if (isNaN(hDate.getTime())) {
      setError('Please enter a valid harvest date.');
      return;
    }
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    if (hDate > todayEnd) {
      setError('Harvest date cannot be in the future.');
      return;
    }
    const diffDaysFromToday = Math.floor((Date.now() - hDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDaysFromToday > maxAllowedDays) {
      setError('Harvest date exceeds the allowed freshness period for this produce category.');
      return;
    }
    if (stockAgeInfo?.isInvalid) {
      setError(stockAgeInfo.text + ' ' + (stockAgeInfo.subText || ''));
      return;
    }

    // Strict Sequential Pipeline Gate Check
    if (!image1 || !image2) {
      setError('Please upload both Image 1 and Image 2 before listing your produce.');
      return;
    }
    if (pipelineRunning) {
      setError('Please wait for the strict sequential verification checks to complete.');
      return;
    }
    if (!pipelineResult || pipelineResult.finalState !== 'PASSED') {
      const rej = pipelineResult?.rejection;
      setError(
        rej?.message ||
        'All sequential verification gates (Geo-Tag, Device GPS, Freshness, Valid Crop, Crop Name Match, and Quality) must pass before adding produce.'
      );
      return;
    }

    setLoading(true);

    try {
      const imagesArray = [image1, image2].filter(Boolean);
      const qualityAssessmentPayload = pipelineResult.qualityAssessment;

      const payload = {
        cropName: cropName.trim(),
        category: (category || 'VEGETABLES').toUpperCase(),
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        grade: qualityAssessmentPayload?.grade?.includes('A')
          ? 'GRADE_A'
          : qualityAssessmentPayload?.grade?.includes('B')
          ? 'GRADE_B'
          : 'GRADE_C',
        harvestDate,
        storageCondition: storageCondition || 'Room Temperature',
        images: imagesArray,
        strictVerification: true,
        isDeviceGps: true,
        aiQualityAssessment: qualityAssessmentPayload,
        location: {
          district: 'Karnal',
          state: 'Haryana',
          lat: deviceCoords?.lat || 29.6857,
          lng: deviceCoords?.lng || 76.9905,
        },
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

            {/* 3. Date Harvested & Storage Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              {/* Date Harvested */}
              <div className="p-5 bg-emerald-50/70 rounded-3xl border border-emerald-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  Date Harvested *
                </label>

                <div className="space-y-2">
                  <input
                    type="date"
                    required
                    max={todayDateStr}
                    min={minHarvestDateStr}
                    value={harvestDate}
                    onChange={(e) => handleHarvestDateChange(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:outline-none transition-colors ${
                      stockAgeInfo?.isInvalid
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-emerald-500'
                    }`}
                  />

                  {stockAgeInfo && (
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl border inline-flex items-center gap-1.5 shadow-sm transition-all ${stockAgeInfo.badgeClass}`}>
                          <Clock className={`w-4 h-4 ${stockAgeInfo.iconClass}`} />
                          {stockAgeInfo.text}
                        </span>
                      </div>
                      {stockAgeInfo.subText && (
                        <p className={`text-[11px] font-medium leading-relaxed ${stockAgeInfo.isInvalid ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                          {stockAgeInfo.subText}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Used by AI to calculate initial harvest freshness.
                </p>
              </div>

              {/* Storage Condition (Optional) */}
              <div className="p-5 bg-teal-50/70 rounded-3xl border border-teal-200/80 space-y-3">
                <label className="block text-xs font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                  <ThermometerSnowflake className="w-4 h-4 text-teal-700" />
                  Storage Condition (Optional)
                </label>

                <select
                  value={storageCondition}
                  onChange={(e) => setStorageCondition(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Room Temperature">Room Temperature (Standard Ambient)</option>
                  <option value="Refrigerated">Refrigerated (Cold Chain Transit)</option>
                  <option value="Cold Storage">Cold Storage (APMC Facility)</option>
                  <option value="Warehouse">Warehouse / Dry Covered Storage</option>
                  <option value="Open Field">Open Field / Farm-Gate Ambient</option>
                  <option value="Other">Other Condition</option>
                </select>

                <p className="text-[11px] text-slate-600 font-medium">
                  Calibrates the 14-day Estimated Visual Quality Trend.
                </p>
              </div>
            </div>

            {/* 4. Upload 2 Crop Images Dropzones with Stage 1 Quality Gate */}
            <div className="p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-700" /> Upload 2 Crop Photos *
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Images are automatically verified for photographic clarity before AI crop assessment.
                  </p>
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 w-fit">
                  Required Clarity: &ge; 70/100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Image 1 Dropzone */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Image 1 (Main Crop Photo) *</span>
                    {image1Validation && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        image1Validation.isAcceptable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Image Quality: {image1Validation.score}/100
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInput1Ref}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 1)}
                    className="hidden"
                  />

                  {image1 ? (
                    <div className="space-y-2">
                      <div className="relative rounded-2xl overflow-hidden h-44 border-2 border-emerald-500/40 shadow-sm bg-slate-900 group">
                        <img src={image1} alt="Uploaded Image 1" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImage1('');
                            setImage1Validation(null);
                            setAiQualityResult(null);
                            setPipelineResult(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-all cursor-pointer"
                          title="Remove Image 1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <span className="bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                            Main Photo Attached
                          </span>
                          {(image1.toLowerCase().includes('gps') || image1.toLowerCase().includes('geotag')) && (
                            <span className="bg-emerald-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                              📷 GPS Stamped ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* GPS Stamp Action Bar */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => stampGeoTagOnCanvas(image1, 1)}
                          className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          title="Stamp visible GPS location, date, time, and coordinates overlay onto Image 1"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          Stamp GPS Map Camera
                        </button>
                      </div>

                      {/* Stage 1 Status for Image 1 */}
                      {image1Checking && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Checking Image Quality...</span>
                        </div>
                      )}

                      {!image1Checking && image1Validation && !image1Validation.isAcceptable && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-800 animate-in fade-in">
                          <div className="flex items-center gap-1.5 font-black text-rose-900">
                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>Better Photo Required</span>
                          </div>
                          <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                            {image1Validation.reason || 'Image quality is too low to accurately assess crop.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInput1Ref.current?.click()}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" /> Replace Image 1
                          </button>
                        </div>
                      )}

                      {!image1Checking && image1Validation && image1Validation.isAcceptable && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ✓ Image Ready for AI Analysis
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInput1Ref.current?.click()}
                            className="text-[10px] text-emerald-700 hover:underline font-bold"
                          >
                            Replace
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInput1Ref.current?.click()}
                      className="h-44 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer p-4 text-center group"
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">Image 2 (Additional Photo) *</span>
                    {image2Validation && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        image2Validation.isAcceptable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Image Quality: {image2Validation.score}/100
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInput2Ref}
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 2)}
                    className="hidden"
                  />

                  {image2 ? (
                    <div className="space-y-2">
                      <div className="relative rounded-2xl overflow-hidden h-44 border-2 border-emerald-500/40 shadow-sm bg-slate-900 group">
                        <img src={image2} alt="Uploaded Image 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImage2('');
                            setImage2Validation(null);
                            setAiQualityResult(null);
                            setPipelineResult(null);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md transition-all cursor-pointer"
                          title="Remove Image 2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <span className="bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                            Photo 2 Attached
                          </span>
                          {(image2.toLowerCase().includes('gps') || image2.toLowerCase().includes('geotag')) && (
                            <span className="bg-emerald-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                              📷 GPS Stamped ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* GPS Stamp Action Bar */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => stampGeoTagOnCanvas(image2, 2)}
                          className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          title="Stamp visible GPS location, date, time, and coordinates overlay onto Image 2"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                          Stamp GPS Map Camera
                        </button>
                      </div>

                      {/* Stage 1 Status for Image 2 */}
                      {image2Checking && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Checking Image Quality...</span>
                        </div>
                      )}

                      {!image2Checking && image2Validation && !image2Validation.isAcceptable && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-800 animate-in fade-in">
                          <div className="flex items-center gap-1.5 font-black text-rose-900">
                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>Better Photo Required</span>
                          </div>
                          <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                            {image2Validation.reason || 'Image quality is too low to accurately assess crop.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => fileInput2Ref.current?.click()}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" /> Replace Image 2
                          </button>
                        </div>
                      )}

                      {!image2Checking && image2Validation && image2Validation.isAcceptable && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ✓ Image Ready for AI Analysis
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInput2Ref.current?.click()}
                            className="text-[10px] text-emerald-700 hover:underline font-bold"
                          >
                            Replace
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInput2Ref.current?.click()}
                      className="h-44 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer p-4 text-center group"
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

            {/* Waiting for Crop Selection Prompt */}
            {image1 && image2 && (!cropName || !cropName.trim() || cropName.trim().toLowerCase() === 'produce') && !pipelineRunning && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-center gap-3 animate-in fade-in">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs font-semibold">
                  Photos uploaded! Please select or type the <strong>Crop Name</strong> (e.g. Tomato) in Step 1 above so AI verification can begin.
                </p>
              </div>
            )}

            {/* Strict Sequential Verification Pipeline In-Progress Indicator */}
            {pipelineRunning && (
              <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl text-white shadow-xl space-y-3 animate-pulse border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Running Strict Sequential Verification Pipeline...</h4>
                    <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                      Sequentially verifying Visible Geo-Tags → Device GPS → Freshness Deduplication → Crop Validation → Crop Name Match → Quality Index.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Strict Verification Pipeline Rejection Banner (STOP IMMEDIATELY) */}
            {pipelineResult && pipelineResult.finalState === 'BLOCKED' && (
              <div className="p-6 rounded-3xl bg-rose-50/95 border-2 border-rose-500/80 shadow-md space-y-4 animate-in fade-in zoom-in-95 text-rose-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black tracking-wide text-rose-950">
                          {pipelineResult.rejection?.title || 'VERIFICATION REJECTED'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-rose-200/90 text-rose-900 border border-rose-300">
                          CODE: {pipelineResult.rejection?.code || pipelineResult.failedGate}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-rose-800 leading-relaxed whitespace-pre-line">
                        {pipelineResult.rejection?.message || 'Verification checks failed. Please resolve the issue below.'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-rose-600 text-white shadow-sm flex-shrink-0">
                    GATE BLOCKED
                  </span>
                </div>

                {/* Gate-by-Gate Sequential Audit Breakdown */}
                {pipelineResult.gates && (
                  <div className="p-4 bg-white/90 rounded-2xl border border-rose-200/80 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Sequential Gate Audit Status
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.geoTagImage1?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.geoTagImage1?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>1. Geo-Tag Image 1</span>
                        <span className="text-[10px] font-black uppercase">{pipelineResult.gates.geoTagImage1?.status || 'PENDING'}</span>
                      </div>

                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.geoTagImage2?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.geoTagImage2?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>2. Geo-Tag Image 2</span>
                        <span className="text-[10px] font-black uppercase">{pipelineResult.gates.geoTagImage2?.status || 'PENDING'}</span>
                      </div>

                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.deviceGps?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.deviceGps?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>3. Device GPS Cross-Check</span>
                        <span className="text-[10px] font-black uppercase">{pipelineResult.gates.deviceGps?.status || 'PENDING'}</span>
                      </div>

                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.freshPhoto?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.freshPhoto?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>4. Fresh Photo Deduplication</span>
                        <span className="text-[10px] font-black uppercase">{pipelineResult.gates.freshPhoto?.status || 'PENDING'}</span>
                      </div>

                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.cropImage1?.status === 'PASS' && pipelineResult.gates.cropImage2?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.cropImage1?.status === 'FAILED' || pipelineResult.gates.cropImage2?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>5. Agricultural Crop Check</span>
                        <span className="text-[10px] font-black uppercase">
                          {pipelineResult.gates.cropImage1?.status === 'FAILED' || pipelineResult.gates.cropImage2?.status === 'FAILED' ? 'FAILED' :
                           pipelineResult.gates.cropImage1?.status === 'PASS' && pipelineResult.gates.cropImage2?.status === 'PASS' ? 'PASS' : 'PENDING'}
                        </span>
                      </div>

                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.cropNameMatch?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.cropNameMatch?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>6. Crop Name Match ({cropName || 'Selected'})</span>
                        <span className="text-[10px] font-black uppercase">{pipelineResult.gates.cropNameMatch?.status || 'PENDING'}</span>
                      </div>

                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.sameCropMatch?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.sameCropMatch?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>7. Same-Crop Pair Consistency</span>
                        <span className="text-[10px] font-black uppercase">{pipelineResult.gates.sameCropMatch?.status || 'PENDING'}</span>
                      </div>

                      <div className={`p-2 rounded-xl border flex items-center justify-between ${
                        pipelineResult.gates.qualityIndex?.status === 'PASS' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        pipelineResult.gates.qualityIndex?.status === 'FAILED' ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span>8. Quality Index (Score ≥ 60)</span>
                        <span className="text-[10px] font-black uppercase">{pipelineResult.gates.qualityIndex?.status || 'PENDING'}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-1">
                      * Sequential rule: Pipeline stopped immediately at the failed gate. Downstream gates were not executed.
                    </p>
                  </div>
                )}

                {/* Remediation Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={runVerificationPipeline}
                    disabled={pipelineRunning}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {pipelineRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Re-run Verification
                  </button>
                  {(pipelineResult.rejection?.code === 'GEO_TAG_MISSING' || pipelineResult.rejection?.code === 'IMAGE_2_NOT_GEOTAGGED') && (
                    <>
                      <button
                        type="button"
                        onClick={() => stampGeoTagOnCanvas(image1, 1)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Stamp GPS on Image 1
                      </button>
                      <button
                        type="button"
                        onClick={() => stampGeoTagOnCanvas(image2, 2)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Stamp GPS on Image 2
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInput1Ref.current?.click()}
                    className="px-3.5 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Replace Image 1
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInput2Ref.current?.click()}
                    className="px-3.5 py-2 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Replace Image 2
                  </button>
                </div>
              </div>
            )}

            {/* Strict Verification Pipeline Success Panel */}
            {pipelineResult && pipelineResult.finalState === 'PASSED' && (
              <div className="p-5 rounded-3xl bg-emerald-50/95 border-2 border-emerald-500/80 shadow-md space-y-3 animate-in fade-in zoom-in-95 text-emerald-950">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                          ALL VERIFICATION CHECKS PASSED ✓
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          Provider: {pipelineResult.provider || 'AI_ENGINE'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-emerald-800 mt-0.5">
                        Geo-tag overlay, device GPS, fresh photo deduplication, crop identity ({cropName}), and quality score verified.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-emerald-600 text-white shadow-sm w-fit">
                    ALL GATES PASSED
                  </span>
                </div>
              </div>
            )}

            {/* AI Crop Quality Assessment Review Card (Rendered ONLY IF ALL CHECKS PASSED) */}
            {pipelineResult && pipelineResult.finalState === 'PASSED' && aiQualityResult && (
              <div className="p-6 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 rounded-3xl border-2 border-emerald-500/50 shadow-md space-y-6 animate-in fade-in zoom-in-95">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200/80">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      AI Visual Crop Quality Assessment
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Quality Assessment Complete ✓</h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Evaluated across 2 inspected photographs. Review before listing.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Grade</span>
                      <span className="text-2xl font-black text-emerald-700">
                        {aiQualityResult.grade || 'A+'}
                      </span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center font-black shadow-md">
                      <span className="text-base leading-none">{aiQualityResult.overallScore || 92}%</span>
                      <span className="text-[9px] uppercase font-bold mt-0.5">Quality</span>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Freshness</span>
                    <span className="text-base font-black text-emerald-700">{aiQualityResult.freshness || 94}%</span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${aiQualityResult.freshness || 94}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Appearance</span>
                    <span className="text-base font-black text-emerald-700">{aiQualityResult.appearance || 91}%</span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${aiQualityResult.appearance || 91}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Color Quality</span>
                    <span className="text-base font-black text-emerald-700">{aiQualityResult.colorQuality || 95}%</span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${aiQualityResult.colorQuality || 95}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Visible Damage</span>
                    <span className="text-base font-black text-emerald-700">
                      {aiQualityResult.visibleDamage || 96}% (Low)
                    </span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${aiQualityResult.visibleDamage || 96}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Spoilage Risk</span>
                    <span className="text-base font-black text-emerald-700">
                      {aiQualityResult.spoilageRisk || 'Low'}
                    </span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Maturity / Ripeness</span>
                    <span className="text-base font-black text-emerald-700">{aiQualityResult.maturity || 88}%</span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${aiQualityResult.maturity || 88}%` }} />
                    </div>
                  </div>
                </div>

                {/* AI Observations & Concerns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-1.5 shadow-sm">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Observations:
                    </span>
                    <ul className="space-y-1 text-slate-600 font-medium">
                      {aiQualityResult.observations?.map((obs, idx) => (
                        <li key={idx}>• {obs}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-amber-200 space-y-1.5 shadow-sm">
                    <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Potential Concerns:
                    </span>
                    <ul className="space-y-1 text-slate-600 font-medium">
                      {aiQualityResult.concerns?.map((con, idx) => (
                        <li key={idx}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Estimated Visual Quality Trend (Degradation Forecast) */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-teal-600" /> Estimated Visual Quality Trend
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Storage: {storageCondition || 'Room Temperature'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {aiQualityResult.degradationForecast?.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {item.days === 0 ? 'Today' : `After ${item.days} Days`}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {item.score}% <span className="text-xs text-emerald-700">| {item.grade}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    * Estimated visual quality trend depends on temperature, humidity, storage facility, packaging, handling, and transportation duration.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button & Strict Validation Guidance */}
            <div className="pt-2 space-y-2">
              {(!image1 || !image2 || !image1Validation?.isAcceptable || !image2Validation?.isAcceptable) && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Please upload 2 geo-tagged crop photos and pass all verification gates before adding this produce.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !cropName ||
                  !quantityKg ||
                  !pricePerKg ||
                  !harvestDate ||
                  Boolean(stockAgeInfo?.isInvalid) ||
                  !image1 ||
                  !image2 ||
                  pipelineRunning ||
                  !pipelineResult ||
                  pipelineResult.finalState !== 'PASSED'
                }
                className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                  loading ||
                  !cropName ||
                  !quantityKg ||
                  !pricePerKg ||
                  !harvestDate ||
                  Boolean(stockAgeInfo?.isInvalid) ||
                  !image1 ||
                  !image2 ||
                  pipelineRunning ||
                  !pipelineResult ||
                  pipelineResult.finalState !== 'PASSED'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer'
                }`}
              >
                {loading ? 'Adding Produce...' : pipelineRunning ? 'Running Verification Pipeline...' : 'Add Produce'} <PackagePlus className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProducePage;
