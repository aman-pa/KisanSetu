import React from 'react';
import { Sprout, ShieldCheck, Cpu, Leaf, HeartHandshake, Truck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0A2412] dark:bg-[#071F10] text-emerald-100 border-t border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                KisanSetu<span className="text-emerald-400">AI</span>
              </span>
            </div>

            <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
              National Agricultural Digital Infrastructure for direct producer-to-market trade, predictive APMC price discovery, and transparent cold-chain logistics.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Direct Farm-to-Market Network
            </div>
          </div>

          {/* Core Platform */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-4">CORE PLATFORM</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-emerald-100/90">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-300 transition-colors">
                  Consumer Marketplace
                </Link>
              </li>
              <li>
                <Link to="/buyer/procurement" className="hover:text-emerald-300 transition-colors">
                  Bulk Procurement Engine
                </Link>
              </li>
              <li>
                <Link to="/trace/KS-BATCH-994821" className="hover:text-emerald-300 transition-colors">
                  Batch QR Traceability
                </Link>
              </li>
              <li>
                <Link to="/logistics/dashboard" className="hover:text-emerald-300 transition-colors">
                  Route Optimization
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Capabilities */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-4">AI CAPABILITIES</h4>
            <ul className="space-y-2.5 text-xs font-medium text-emerald-100/90">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Demand Forecasting ML
              </li>
              <li className="flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Price Recommendation Engine
              </li>
              <li className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> Smart Matching Matrix
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-400" /> TSP Route Optimization
              </li>
            </ul>
          </div>

          {/* Governance & Standards */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-4">STANDARDS & COMPLIANCE</h4>
            <ul className="space-y-2.5 text-xs font-medium text-emerald-100/90">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-Time APMC Mandi Data Sync
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AGMARK Quality Tier Alignment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Aadhaar-Verified Producers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Digital Escrow Settlements
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col md:flex-row items-center justify-between text-xs text-emerald-300/80 font-medium">
          <p>© 2026 KisanSetu AI Network. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0 text-emerald-300/90">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Market Intelligence Sync</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
