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
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  const getFarmerCta = () => {
    if (!user) {
      return {
        to: '/register?role=FARMER',
        label: 'Register as Farmer / Producer',
      };
    }
    switch (user.role) {
      case 'FARMER':
        return {
          to: '/farmer/dashboard',
          label: 'Farmer Dashboard & Selling',
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
          label: 'Browse Farm Marketplace',
        };
    }
  };

  const farmerCta = getFarmerCta();

  return (
    <MainLayout>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-[#051a0d] via-[#092b15] to-[#041209] text-white">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Next-Generation Direct Agri-Commerce Infrastructure</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Connecting Farms <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Directly to Markets
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Empowering farmers and farmer-producer organizations (FPOs) with real-time APMC market intelligence, predictive price discovery, and transparent direct-to-buyer aggregation.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={farmerCta.to}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Sprout className="w-5 h-5" /> {farmerCta.label}
                </Link>
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Explore Marketplace <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Key Value Metrics */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-emerald-500/20 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">+34%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Higher Farmer Realization</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">0%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Middleman Markups</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Farm-to-Fork Batch Trace</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh Agricultural Harvest"
                  className="w-full h-[440px] object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Floating Top Pill: Real-time Mandi Benchmark */}
                <div className="absolute top-4 left-4 right-4 p-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-white shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-semibold text-slate-200">APMC Live Benchmark</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Active Feed
                  </span>
                </div>

                {/* Floating Bottom Card: Verified Produce Lot */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md text-slate-900 shadow-2xl border border-white/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                        <Award className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Verified Grade A Harvest</p>
                        <p className="text-[11px] text-slate-500 font-medium">Authenticated Farm-Gate Lot</p>
                      </div>
                    </div>
                    <Link
                      to="/trace/KS-BATCH-994821"
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Verify Lot
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE INTERMEDIARY PROBLEM VS KISANSETU SOLUTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Supply Chain Modernization
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
              Eliminating Multi-Tier Intermediary Inefficiencies
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conventional agricultural supply chains impose multiple unstandardized broker markups, leading to high post-harvest transit losses and depressed farm-gate remuneration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional Fragmented Model */}
            <div className="bg-rose-50/60 border border-rose-200/80 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-rose-200 pb-4">
                <h3 className="text-lg font-bold text-rose-950 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" /> Fragmented Multi-Broker Chain
                </h3>
                <span className="text-xs font-bold bg-rose-200 text-rose-800 px-2.5 py-1 rounded-lg">High Wastage & Markups</span>
              </div>
              <ul className="space-y-3 text-xs text-rose-950 font-medium">
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-rose-100">
                  <span>1. Village Aggregators & Commission Agents</span>
                  <span className="font-bold text-rose-700">+12% – 15% Markup</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-rose-100">
                  <span>2. Unregulated Mandi Intermediaries & Cess</span>
                  <span className="font-bold text-rose-700">+15% – 18% Brokerage</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-rose-100">
                  <span>3. Multi-Tier Secondary Wholesalers</span>
                  <span className="font-bold text-rose-700">+18% – 22% Margin</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-rose-100">
                  <span>4. Urban Retail Store Markup</span>
                  <span className="font-bold text-rose-700">+25% – 30% Price Surge</span>
                </li>
              </ul>
              <div className="pt-2 text-xs font-bold text-rose-900 text-center bg-rose-100/90 p-3.5 rounded-xl border border-rose-200">
                Traditional Result: Farmers capture less than 30% of the final consumer price.
              </div>
            </div>

            {/* KisanSetu Unified Direct Infrastructure */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> KisanSetu Direct Agri Network
                </h3>
                <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg">Direct & Transparent</span>
              </div>
              <ul className="space-y-3 text-xs text-emerald-950 font-medium">
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-emerald-100">
                  <span className="flex items-center gap-2"><Sprout className="w-4 h-4 text-emerald-600" /> Direct Producer / FPO Listing</span>
                  <span className="font-bold text-emerald-700">Fair Producer Price</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-emerald-100">
                  <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-teal-600" /> Predictive Mandi Intelligence Engine</span>
                  <span className="font-bold text-emerald-700">Data-Driven Benchmarking</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-emerald-100">
                  <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-600" /> Cold-Chain Aggregation & Routing</span>
                  <span className="font-bold text-emerald-700">Optimized Logistics</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-emerald-100">
                  <span className="flex items-center gap-2"><QrCode className="w-4 h-4 text-teal-600" /> Cryptographic Lot QR Provenance</span>
                  <span className="font-bold text-emerald-700">100% Traceability</span>
                </li>
              </ul>
              <div className="pt-2 text-xs font-bold text-emerald-900 text-center bg-emerald-100/90 p-3.5 rounded-xl border border-emerald-200">
                KisanSetu Impact: Transparent farm-gate pricing with up to 34% increased farmer income.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STAKEHOLDER ECOSYSTEM */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Ecosystem Platform
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
              Purpose-Built for Every Agricultural Stakeholder
            </h2>
            <p className="text-sm text-slate-600">
              A unified digital ecosystem seamlessly connecting producers, aggregators, enterprise buyers, and logistics carriers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stakeholder 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sprout className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Farmers & Growers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                List harvest directly at transparent prices, check mandi rate recommendations, and eliminate distress sales.
              </p>
            </div>

            {/* Stakeholder 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">FPOs & Cooperatives</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aggregate multi-member farm yields, negotiate bulk contracts, and optimize shared cold-storage facilities.
              </p>
            </div>

            {/* Stakeholder 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Bulk & Institutional Buyers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Procure consistent-grade produce with automated procurement contracts, verified provenance, and scheduled delivery.
              </p>
            </div>

            {/* Stakeholder 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6 text-indigo-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Logistics & Cold-Chain</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Algorithmic multi-stop route optimization reduces empty backhauls and ensures farm-to-warehouse quality retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI CAPABILITIES SHOWCASE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
              Enterprise Technology
            </span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight">
              Intelligent Infrastructure for Modern Agriculture
            </h2>
            <p className="text-sm text-slate-600">
              State-of-the-art predictive algorithms that turn volatile market dynamics into actionable decisions.
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
                Predicts commodity demand surges and regional deficit trends up to 30 days in advance to mitigate price crashes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Price Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aggregates real-time mandi rates and freight indices to suggest optimal, highly competitive farm-gate prices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Algorithmic Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-factor scoring algorithm matching bulk buyer specifications with verified farmer inventory in seconds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/70 hover:border-emerald-300 hover:bg-white hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6 text-indigo-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Route Optimization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                TSP route scheduling that clusters multi-farm pickups into consolidated cold-chain delivery corridors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-[#051a0d] via-[#092b15] to-[#041209] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Agricultural Network
          </span>
          <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl tracking-tight">
            Ready to Transform Your Produce Supply Chain?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of progressive farmers, FPO collectives, and procurement enterprises creating a transparent, fair, and efficient agricultural market.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              to={farmerCta.to}
              className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl transition-all"
            >
              {farmerCta.label}
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all"
            >
              Explore Live Marketplace
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
