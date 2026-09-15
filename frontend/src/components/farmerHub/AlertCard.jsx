import React from 'react';
import { AlertTriangle, Clock, ExternalLink, ShieldAlert, Sparkles, Bell } from 'lucide-react';

const AlertCard = ({ alert }) => {
  const getBadgeConfig = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'DEADLINE':
        return {
          icon: Clock,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          indicator: 'bg-rose-500',
        };
      case 'IMPORTANT':
        return {
          icon: ShieldAlert,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          indicator: 'bg-amber-500',
        };
      case 'NEW':
        return {
          icon: Sparkles,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          indicator: 'bg-emerald-500',
        };
      case 'UPDATE':
      default:
        return {
          icon: Bell,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          indicator: 'bg-blue-500',
        };
    }
  };

  const badge = getBadgeConfig(alert.severity);
  const Icon = badge.icon;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black border uppercase tracking-wider ${badge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.indicator} animate-pulse`} />
            <Icon className="w-3 h-3" />
            {alert.severity}
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            {alert.date}
          </span>
        </div>

        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-agri-primary transition-colors leading-snug mb-2">
          {alert.title}
        </h4>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
          {alert.details}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]" title={alert.source}>
          {alert.source}
        </span>
        {alert.actionUrl && (
          <a
            href={alert.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-extrabold text-agri-primary hover:text-emerald-700 transition-colors shrink-0 text-xs"
          >
            <span>{alert.actionLabel || 'Take Action'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
