import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Coins,
  CheckCircle2,
  FileText,
  HelpCircle,
  ExternalLink,
  PhoneCall,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import GovernmentSourceBadge from './GovernmentSourceBadge';

const SchemeDetailsModal = ({ scheme, onClose }) => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Forest Gradient */}
        <div className="p-6 bg-gradient-to-r from-agri-dark via-agri-primary to-emerald-950 text-white flex items-start justify-between relative">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                {scheme.category || 'Central Scheme'}
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                {scheme.ministry}
              </span>
            </div>
            <h2 className="text-xl font-black text-white leading-snug">
              {scheme.name}
            </h2>
            <p className="text-xs text-emerald-100 font-medium line-clamp-1">
              {scheme.shortDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-6 pt-3 text-xs font-extrabold overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Overview & Benefits', icon: Coins },
            { id: 'ELIGIBILITY', label: 'Eligibility Criteria', icon: CheckCircle2 },
            { id: 'DOCUMENTS', label: 'Required Documents', icon: FileText },
            { id: 'PROCESS', label: 'Application Steps', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-agri-primary text-agri-primary font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800 font-semibold'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl space-y-2">
                <span className="text-[11px] font-black uppercase text-agri-primary tracking-wider">
                  Guaranteed Government Benefit:
                </span>
                <p className="text-sm font-black text-slate-900 leading-snug">
                  {scheme.benefit}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 mb-1.5 text-sm">
                  Scheme Purpose & Scope
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {scheme.shortDescription}
                </p>
              </div>

              {scheme.tags && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Features & Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {scheme.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {scheme.helpline && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-700">
                    National Toll-Free Helpline: <strong>{scheme.helpline}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ELIGIBILITY */}
          {activeTab === 'ELIGIBILITY' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="font-extrabold text-slate-900 block mb-1">
                  Summary:
                </span>
                <p className="text-slate-600">{scheme.eligibilitySummary}</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 mb-2 text-sm">
                  Detailed Eligibility Conditions
                </h4>
                <ul className="space-y-2">
                  {(scheme.eligibilityDetails || [
                    'Valid land record or tenant certificate',
                    'Aadhaar card linked with active bank account',
                    'Citizen of India engaged in agricultural activities',
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Keep the following original or self-attested copies ready before applying:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(scheme.documentsRequired || [
                  'Aadhaar Card',
                  'Land Record (RoR / Khatauni / 7-12)',
                  'Bank Passbook with IFSC',
                  'Mobile Number linked to Aadhaar',
                ]).map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 font-semibold text-slate-800"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROCESS */}
          {activeTab === 'PROCESS' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm">
                How to Apply (Official Procedure)
              </h4>
              <ol className="space-y-3">
                {(scheme.applicationProcess || [
                  'Visit the official portal or your local Common Service Centre (CSC).',
                  'Register with your Aadhaar number and verify OTP.',
                  'Fill in your land details and upload necessary documents.',
                  'Submit the form and record your Application Reference ID.',
                ]).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600">
                    <span className="w-6 h-6 rounded-full bg-agri-primary text-white font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer with Verification Badge & Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <GovernmentSourceBadge
            source={scheme.verifiedSource || scheme.ministry}
            lastUpdated={scheme.lastUpdated}
            verified={true}
          />

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            {scheme.officialUrl && (
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary hover:to-emerald-700 text-white font-extrabold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Open Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetailsModal;
