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
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-[#061c0e] via-[#0b2f17] to-[#041209] text-white">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct Farm-to-Buyer Agricultural Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Direct From Farms. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Fresh for You. Fair for Farmers.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                KisanSetu connects agricultural growers directly with households, grocery retailers, and bulk buyers. Eliminating 5 layers of middleman markups so farmers earn more and consumers enjoy fresh, affordable produce.
              </p>

              {/* Dual Action Buttons for Everyone */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-200" />
                  <span>Shop Fresh Produce</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to={farmerCta.to}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 text-white font-bold text-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Sprout className="w-5 h-5 text-emerald-400" />
                  <span>{farmerCta.label}</span>
                </Link>
              </div>

              {/* Quick Categories Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-slate-300">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold mr-1">Popular:</span>
                <Link to="/marketplace" className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors">
                  🥬 Fresh Vegetables
                </Link>
                <Link to="/marketplace" className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors">
                  🍎 Farm Fruits
                </Link>
                <Link to="/marketplace" className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors">
                  🌾 Grains & Pulses
                </Link>
                <Link to="/buyer/procurement" className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors">
                  📦 Bulk Procurement
                </Link>
              </div>

              {/* Key Value Metrics */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-emerald-500/20 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">+34%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Farmer Realization</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">25–30%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Buyer Cost Savings</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">24 hrs</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Harvest to Delivery</p>
                </div>
              </div>
            </div>

            {/* Right Hero Live Marketplace Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-900/95 backdrop-blur-xl p-6 space-y-4">
                
                {/* Header of Live Preview Card */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Leaf className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Live Farm-Gate Batches</h3>
                      <p className="text-[11px] text-slate-400">Freshly listed directly by local growers</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/90 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified
                  </span>
                </div>

                {/* 3 Live Produce Lot Previews */}
                <div className="space-y-3">
                  {/* Produce Item 1 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=120&q=80"
                        alt="Fresh Tomatoes"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">Hybrid Table Tomatoes</h4>
                        <p className="text-[11px] text-slate-400">Ramesh Kumar • Karnal, Haryana</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded">
                          Grade A • Organic Inspected
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400">₹28 / kg</p>
                      <p className="text-[10px] text-slate-400 line-through">Retail ₹45</p>
                    </div>
                  </div>

                  {/* Produce Item 2 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=120&q=80"
                        alt="Wheat Grain"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">Sharbati Golden Wheat</h4>
                        <p className="text-[11px] text-slate-400">Punjab Kisan Co-op • Ambala</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded">
                          Direct FPO Aggregation
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-amber-400">₹32 / kg</p>
                      <p className="text-[10px] text-slate-400 line-through">Market ₹42</p>
                    </div>
                  </div>

                  {/* Produce Item 3 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=120&q=80"
                        alt="Capsicum"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">Green Bell Peppers</h4>
                        <p className="text-[11px] text-slate-400">Suresh Singh • Panipat</p>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-teal-300 bg-teal-950/80 px-1.5 py-0.2 rounded">
                          Cold-Chain Ready
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-teal-400">₹54 / kg</p>
                      <p className="text-[10px] text-slate-400 line-through">Retail ₹80</p>
                    </div>
                  </div>
                </div>

                {/* Live Card Bottom Action */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <span>QR Batch Traceable</span>
                  </div>
                  <Link
                    to="/marketplace"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                  >
                    View Marketplace <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
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
                  <span>QR code on every crate tracking origin</span>
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
                  <span>Immediate digital escrow payment</span>
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
              Comparing the traditional multi-tier broker markup vs KisanSetu's direct farm-to-table model.
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
                  <span>+ Mandi Broker & Unregulated Cess</span>
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
                  <span>+ Temperature-Controlled Cold-Chain Transit</span>
                  <span className="font-semibold">+₹3.50 / kg</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-slate-600">
                  <span>+ Quality Inspection & QR Trace Packaging</span>
                  <span className="font-semibold">+₹0.50 / kg</span>
                </div>
                <div className="flex items-center justify-between p-2.5 text-emerald-800 font-bold bg-emerald-50/50 rounded-lg px-3">
                  <span>Zero Broker Fees or Middleman Markups</span>
                  <span>₹0.00</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-900/20">
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
              Modern digital tools designed to bring predictability, fairness, and speed to Indian agricultural commerce.
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
                Matches bulk procurement orders with nearby certified farmer inventories based on volume, distance, and quality grades.
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

      {/* 5. FARM-TO-FORK BATCH TRACEABILITY BANNER */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <QrCode className="w-3.5 h-3.5" /> 100% Origin Provenance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Know Exactly Where Your Food Was Harvested
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Every produce crate shipped on KisanSetu comes with a verifiable batch QR code. Scan to view the origin farm location, harvest timestamp, and quality inspection score.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                to="/trace/KS-BATCH-994821"
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Verify a Sample Batch</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-[#061c0e] via-[#0b2f17] to-[#041209] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transparent Agri-Commerce
          </span>
          <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight">
            Ready to Experience Fresh, Fair Agriculture?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of households, farmers, and business buyers transforming India's produce supply chain today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              to="/marketplace"
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Start Shopping Fresh Produce
            </Link>
            <Link
              to={farmerCta.to}
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Sprout className="w-4 h-4 text-emerald-400" /> {farmerCta.label}
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
