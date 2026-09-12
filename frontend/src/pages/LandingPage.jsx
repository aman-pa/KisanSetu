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
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  const getFarmerCta = () => {
    if (!user) {
      return {
        to: '/register?role=FARMER',
        label: 'Start Selling as Farmer',
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
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-emerald-950 via-agri-dark to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4E9F3D_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-agri-gold animate-bounce" /> SIH 2026 Problem Statement SIH26033
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Connecting Farms <br />
                <span className="bg-gradient-to-r from-agri-light via-emerald-300 to-agri-gold bg-clip-text text-transparent">
                  Directly to Markets
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                KisanSetu AI provides farmers with verified APMC market intelligence, demand forecasting, and direct buyer connections to optimize farm-gate net realization.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to={farmerCta.to}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-agri-accent to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Sprout className="w-5 h-5" /> {farmerCta.label}
                </Link>
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  Buy Fresh Produce <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Core Feature Pillars */}
              <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/10 text-center lg:text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-agri-light">Mandi AI</p>
                  <p className="text-[11px] text-slate-400">Net Realization Optimizer</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-agri-gold">Direct</p>
                  <p className="text-[11px] text-slate-400">Farm-to-Buyer Connections</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400">QR Trace</p>
                  <p className="text-[11px] text-slate-400">Batch Lot Provenance</p>
                </div>
              </div>
            </div>

            {/* Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh Agricultural Produce"
                  className="w-full h-[420px] object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                {/* Floating AI Quality Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md text-slate-800 shadow-xl border border-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Verified Crop Harvest</p>
                        <p className="text-[11px] text-slate-500">Batch ID: KS-BATCH-994821</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                      Grade A (Sample Lot)
                    </span>
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
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Problem vs Solution
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Eliminating the 5-Layer Middleman Supply Chain
            </h2>
            <p className="text-sm text-slate-600">
              Traditional supply chains force produce through commission agents, local traders, wholesalers, APMC brokers, and retailers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional Model */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-rose-200 pb-4">
                <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" /> Traditional Middleman Chain
                </h3>
                <span className="text-xs font-extrabold bg-rose-200 text-rose-800 px-2.5 py-1 rounded-lg">High Wastage & Inflation</span>
              </div>
              <ul className="space-y-4 text-xs text-rose-950">
                <li className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-rose-100">
                  <span>1. Local Aggregator / Commission Agent</span>
                  <span className="font-bold text-rose-700">+15% Markup</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-rose-100">
                  <span>2. APMC Mandi Broker</span>
                  <span className="font-bold text-rose-700">+18% Fee & Cess</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-rose-100">
                  <span>3. Regional Wholesaler</span>
                  <span className="font-bold text-rose-700">+20% Margin</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-rose-100">
                  <span>4. City Retailer / Store</span>
                  <span className="font-bold text-rose-700">+30% Price Surge</span>
                </li>
              </ul>
              <div className="pt-2 text-xs font-bold text-rose-800 text-center bg-rose-100 p-3 rounded-xl">
                Result: Farmer receives only ₹12/kg while Consumer pays ₹45/kg!
              </div>
            </div>

            {/* KisanSetu AI Direct Model */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> KisanSetu Direct Model
                </h3>
                <span className="text-xs font-extrabold bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg">Direct & Transparent</span>
              </div>
              <ul className="space-y-4 text-xs text-emerald-950">
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-emerald-100 font-medium">
                  <span className="flex items-center gap-2"><Sprout className="w-4 h-4 text-emerald-600" /> Farmer / FPO Listing</span>
                  <span className="font-bold text-emerald-700">Direct Pricing</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-emerald-100 font-medium">
                  <span className="flex items-center gap-2"><Brain className="w-4 h-4 text-agri-accent" /> Mandi Net Realization Model</span>
                  <span className="font-bold text-emerald-700">Estimated Logistics</span>
                </li>
                <li className="flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-emerald-100 font-medium">
                  <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-600" /> Cold-Chain Direct Delivery</span>
                  <span className="font-bold text-emerald-700">Farm-to-Door</span>
                </li>
              </ul>
              <div className="pt-2 text-xs font-bold text-emerald-900 text-center bg-emerald-200/60 p-3.5 rounded-xl">
                Illustrative Scenario: Direct farm-gate listing with transparent estimated transport costs and batch QR tracing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI CAPABILITIES SHOWCASE */}
      <section className="py-20 bg-[#F4F6F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-agri-dark bg-agri-light/60 px-3 py-1 rounded-full">
              Powered by Machine Learning
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              AI Intelligence Built for Indian Agriculture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm hover:shadow-agri-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Demand Forecasting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Time-series ML models predict regional crop demand gaps and supply deficits up to 30 days in advance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm hover:shadow-agri-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Price Recommendation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates optimal farm-gate pricing ranges using mandi trends, crop grade, and distance metrics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm hover:shadow-agri-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Weighted matrix algorithm (Price, Distance, Quality, Quantity, Reliability) matching bulk orders.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm hover:shadow-agri-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Route Optimization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                TSP algorithm optimizing multi-farm pickup routes to reduce logistics costs and transit time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-r from-agri-dark via-agri-primary to-emerald-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to transform produce procurement?</h2>
          <p className="text-sm text-slate-300">Experience KisanSetu AI's role-based platform built for SIH 2026.</p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to={farmerCta.to}
              className="px-8 py-3.5 rounded-xl bg-agri-gold hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              {farmerCta.label}
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
