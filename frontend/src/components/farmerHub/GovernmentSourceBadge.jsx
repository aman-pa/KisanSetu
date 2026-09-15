import React from 'react';
import { ShieldCheck, Info, ExternalLink } from 'lucide-react';

const GovernmentSourceBadge = ({
  source = 'Ministry of Agriculture & Farmers Welfare',
  verified = true,
  lastUpdated = 'March 2026',
  officialUrl,
  className = '',
  showDisclaimer = false,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {verified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            Verified Source
          </span>
        )}
        <span className="text-slate-500 font-medium flex items-center gap-1">
          Source: <strong className="text-slate-700 font-semibold">{source}</strong>
        </span>
        {lastUpdated && (
          <span className="text-slate-400 text-[11px]">
            • Updated: {lastUpdated}
          </span>
        )}
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-agri-primary hover:text-emerald-700 font-bold underline underline-offset-2 ml-auto text-[11px]"
          >
            Official Portal <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {showDisclaimer && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2.5 shadow-2xs">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Official Source Verification Notice:</strong> KisanSetu AI provides information aggregated from official government portals (data.gov.in, pib.gov.in, mygov.in, state agriculture departments). Always verify current scheme criteria on the official government portal before applying.
          </p>
        </div>
      )}
    </div>
  );
};

export default GovernmentSourceBadge;
