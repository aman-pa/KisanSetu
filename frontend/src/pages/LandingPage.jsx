import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Brain,
  Truck,
  Users,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Zap,
  BarChart3,
  Award,
  Scale,
  Building2,
  ShoppingBag,
  Clock,
  Sparkles,
  ChevronRight,
  HeartHandshake,
  Home,
  Check,
  Leaf,
  BadgeCheck,
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  const getFarmerCta = () => {
    if (!user) {
      return {
        to: '/register?role=FARMER',
        label: 'Sell Your Harvest',
      };
    }
    switch (user.role) {
      case 'FARMER':
        return {
          to: '/farmer/dashboard',
          label: 'Farmer Dashboard & Listings',
        };
      case 'FPO':
        return {
          to: '/fpo/dashboard',
          label: 'FPO Produce Aggregation',
        };
      case 'BULK_BUYER':
        return {
          to: '/buyer/procurement',
          label: 'Procurement Dashboard',
        };
      case 'LOGISTICS':
        return {
          to: '/logistics/dashboard',
          label: 'Logistics Dashboard',
        };
      case 'ADMIN':
        return {
          to: '/admin/dashboard',
          label: 'Admin Command Center',
        };
      default:
        return {
          to: '/marketplace',
          label: 'Explore Marketplace',
        };
    }
  };

  const farmerCta = getFarmerCta();

  return (
    <MainLayout>
      {/* 1. HERO SECTION - CLEAN LIGHT MODERN THEME */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#EEF7F1] via-[#F7FCF9] to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct Farm-to-Table Marketplace & Agri Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.14] text-slate-900">
                Fresh From The Farm. <br />
                <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 bg-clip-text text-transparent">
                  Direct to Your Doorstep.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                KisanSetu connects local agricultural growers directly with households, grocery retailers, and bulk buyers. Eliminating multi-tier middleman markups so farmers earn fair returns and consumers enjoy healthy, affordable food.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-lg shadow-emerald-900/15 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-200" />
                  <span>Shop Fresh Produce</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to={farmerCta.to}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border-2 border-emerald-700/30 text-emerald-900 font-bold text-sm hover:bg-emerald-50 hover:border-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  <span>{farmerCta.label}</span>
                </Link>
              </div>

              {/* Quick Categories Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-slate-700">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold mr-1">Popular:</span>
                <Link to="/marketplace" className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors shadow-sm">
                  🥬 Fresh Vegetables
                </Link>
                <Link to="/marketplace" className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors shadow-sm">
                  🍎 Farm Fruits
                </Link>
                <Link to="/marketplace" className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors shadow-sm">
                  🌾 Grains & Pulses
                </Link>
                <Link to="/buyer/procurement" className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors font-bold shadow-sm">
                  📦 Bulk Procurement
                </Link>
              </div>

              {/* Key Value Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-200 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-700">+34%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Higher Farmer Earnings</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-800">25–30%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Consumer Savings</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-teal-700">24 Hours</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Direct Farm Delivery</p>
                </div>
              </div>
            </div>

            {/* Right Hero Clean Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                  alt="Fresh Agricultural Produce Harvest"
                  className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BUILT FOR EVERYONE - 3 USER SEGMENTS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Built for Everyone
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
              One Transparent Platform Serving All Needs
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Whether you are feeding your family, growing crops on your farm, or sourcing wholesale produce for your business, KisanSetu delivers unmatched value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Segment 1: Households & Consumers */}
            <div className="bg-slate-50 hover:bg-emerald-50/40 rounded-3xl p-8 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Home className="w-7 h-7 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Households & Families</h3>
                <p className="text-xs text-emerald-700 font-bold mt-0.5">Farm Fresh, Nutrient-Rich Daily Food</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy vegetables and grains harvested the same day and delivered straight to your home. No stale warehouse storage, no chemical ripening, and savings of 25–30% over grocery apps.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Harvested directly upon order</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Full origin traceability on every order</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Honest rates without middleman surge pricing</span>
                </li>
              </ul>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-2"
              >
                Browse Fresh Produce <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Segment 2: Farmers & Growers */}
            <div className="bg-slate-50 hover:bg-emerald-50/40 rounded-3xl p-8 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sprout className="w-7 h-7 text-amber-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Farmers & FPOs</h3>
                <p className="text-xs text-amber-700 font-bold mt-0.5">Fair Farm-Gate Price & Direct Sales</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                List your produce directly from your field. Get access to verified APMC mandi market intelligence, dynamic price recommendations, and direct settlements straight to your bank account.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Zero commission broker deductions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Real-time mandi price benchmarking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Immediate digital payment settlement</span>
                </li>
              </ul>
              <Link
                to={farmerCta.to}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline pt-2"
              >
                {farmerCta.label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Segment 3: Bulk Buyers & Businesses */}
            <div className="bg-slate-50 hover:bg-emerald-50/40 rounded-3xl p-8 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Building2 className="w-7 h-7 text-teal-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Businesses & Retailers</h3>
                <p className="text-xs text-teal-700 font-bold mt-0.5">Consistent Bulk Quality & Supply</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supermarkets, restaurants, and food processors can procure certified Grade-A produce at scale. Scheduled fulfillment, transparent invoicing, and cold-chain route delivery.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 font-semibold border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Quality-graded agricultural lots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Single GST invoice & predictable deliveries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>Consolidated multi-farm volume</span>
                </li>
              </ul>
              <Link
                to="/buyer/procurement"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline pt-2"
              >
                Explore Procurement Engine <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSPARENCY: TRADITIONAL VS KISANSETU PRICING BREAKDOWN */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Price Transparency
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
              Where Does Your Money Actually Go?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comparing traditional multi-tier broker markups against KisanSetu's direct farm-to-table model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional Fragmented Model */}
            <div className="bg-white border border-rose-200 rounded-3xl p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <h3 className="text-lg font-bold text-rose-950 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" /> Traditional Multi-Broker Chain
                </h3>
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">High Markup & Waste</span>
              </div>
              
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                  <span className="font-semibold text-rose-900">Farmer Receives (Base Price)</span>
                  <span className="font-black text-rose-800">₹12 / kg (26%)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-slate-500">
                  <span>+ Village Aggregator Commission</span>
                  <span>+₹5 / kg</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-slate-500">
                  <span>+ Mandi Broker & Unregulated Fees</span>
                  <span>+₹7 / kg</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-slate-500">
                  <span>+ City Wholesaler Margin & Transport</span>
                  <span>+₹9 / kg</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-slate-500">
                  <span>+ Retailer Markup & Wastage Margin</span>
                  <span>+₹12 / kg</span>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-100 flex items-center justify-between bg-rose-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-rose-700 font-bold">Final Consumer Price</p>
                  <p className="text-2xl font-black text-rose-950">₹45 / kg</p>
                </div>
                <p className="text-[11px] text-rose-700 font-semibold text-right max-w-[160px]">
                  Farmer gets under 30%. Consumer pays heavy markups.
                </p>
              </div>
            </div>

            {/* KisanSetu Unified Direct Model */}
            <div className="bg-white border-2 border-emerald-500/80 rounded-3xl p-8 space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                Direct Value
              </div>

              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> KisanSetu Direct Model
                </h3>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">Fair & Transparent</span>
              </div>
              
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-950">Direct Payment to Farmer</span>
                  <span className="font-black text-emerald-700 text-sm">₹28 / kg (+133% higher!)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-slate-600">
                  <span>+ Temperature-Controlled Logistics</span>
                  <span className="font-semibold">+₹3.50 / kg</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-slate-600">
                  <span>+ Quality Inspection & Eco Packaging</span>
                  <span className="font-semibold">+₹0.50 / kg</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-emerald-800 font-bold bg-emerald-50/50 rounded-lg px-3">
                  <span>Zero Broker Fees or Middleman Markups</span>
                  <span>₹0.00</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-900/15">
                <div>
                  <p className="text-xs text-emerald-100 font-bold">Final Consumer Price</p>
                  <p className="text-2xl font-black text-white">₹32 / kg</p>
                </div>
                <p className="text-[11px] text-emerald-100 font-bold text-right max-w-[160px]">
                  Farmer earns +34% more. Consumer saves 29% per kg!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM INTELLIGENCE FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Intelligent Technology
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
              Data-Driven Agricultural Infrastructure
            </h2>
            <p className="text-sm text-slate-600">
              Modern digital tools designed to bring predictability, fairness, and speed to agricultural commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Demand Forecasting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anticipates regional vegetable and grain demand 30 days in advance to help growers plan harvests and prevent price crashes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Mandi Price Benchmarks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time tracking of APMC mandi arrival volumes and price indices to recommend honest, competitive farm-gate rates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Buyer Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matches bulk procurement orders with nearby verified farmer inventories based on volume, distance, and quality grades.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6 text-indigo-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Route & Cold-Chain Logistics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolidates multiple farm pickups along temperature-controlled transit corridors, minimizing transit time and post-harvest decay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> Transparent Agri-Commerce
          </span>
          <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight">
            Ready to Experience Fresh, Fair Agriculture?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of households, farmers, and business buyers transforming India's produce supply chain today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              to="/marketplace"
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-900 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-700" /> Start Shopping Fresh Produce
            </Link>
            <Link
              to={farmerCta.to}
              className="px-8 py-3.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 text-white font-bold text-sm border border-white/25 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Sprout className="w-4 h-4 text-emerald-300" /> {farmerCta.label}
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
