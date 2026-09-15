import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Coins,
  Sparkles,
  Layers,
  Phone,
} from 'lucide-react';

const SchemeCard = ({ scheme }) => {
  const getCategoryTheme = (category) => {
    switch (category?.toLowerCase()) {
      case 'financial support':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', iconColor: 'text-emerald-600' };
      case 'insurance':
        return { bg: 'bg-blue-50 text-blue-800 border-blue-200', iconColor: 'text-blue-600' };
      case 'subsidies':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', iconColor: 'text-amber-600' };
      case 'loans & credit':
      case 'loans':
        return { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', iconColor: 'text-indigo-600' };
      default:
        return { bg: 'bg-teal-50 text-teal-800 border-teal-200', iconColor: 'text-teal-600' };
    }
  };

  const theme = getCategoryTheme(scheme.category);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-agri-dark via-agri-primary to-agri-accent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Category & Verified Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${theme.bg}`}>
            <Layers className={`w-3 h-3 ${theme.iconColor}`} />
            {scheme.category || 'Central Scheme'}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-extrabold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        </div>

        {/* Ministry */}
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">
          {scheme.ministry || 'Government of India'}
        </p>

        {/* Scheme Name */}
        <h3 className="text-lg font-black text-slate-900 group-hover:text-agri-primary transition-colors leading-snug mb-3">
          {scheme.name}
        </h3>

        {/* Key Benefit */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100/90 rounded-2xl mb-3.5 space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-agri-primary">
            <Coins className="w-3.5 h-3.5 text-agri-gold shrink-0" />
            <span>Key Scheme Benefit:</span>
          </div>
          <p className="text-xs font-bold text-slate-800 leading-snug">{scheme.benefit}</p>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 leading-relaxed mb-3.5 line-clamp-2">
          {scheme.shortDescription}
        </p>

        {/* Eligibility Summary */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-snug">
              <span className="font-extrabold text-slate-800">Eligibility: </span>
              {scheme.eligibilitySummary}
            </div>
          </div>
        </div>

        {/* Match reasons (from Scheme Finder) */}
        {scheme.matchReasons && scheme.matchReasons.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {scheme.matchReasons.map((reason, idx) => (
              <span key={idx} className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                {reason}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action — direct link to official portal only, NO popup modal */}
      <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
        {scheme.officialUrl ? (
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary hover:from-agri-primary hover:to-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow group/btn"
          >
            <span>Apply / Visit Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        ) : (
          <span className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
            Visit your nearest CSC / Agriculture Office
          </span>
        )}
        {scheme.helpline && (
          <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400">
            <Phone className="w-3 h-3" />
            Helpline: <span className="text-slate-600">{scheme.helpline}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SchemeCard;
