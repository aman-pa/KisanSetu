import React from 'react';
import { Newspaper, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';

/**
 * Safely parse PIB RSS date strings like "Mon, 10 Mar 2026 14:30:00 IST"
 * JavaScript does not recognise "IST" timezone abbreviation — replace with +0530.
 */
const formatPubDate = (pubDate) => {
  if (!pubDate) return 'Recent';

  // Normalise known timezone abbreviations to UTC offsets
  const normalized = pubDate
    .replace(/\bIST\b/, '+0530')
    .replace(/\bGMT\b/, '+0000')
    .replace(/\bUTC\b/, '+0000');

  const date = new Date(normalized);

  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // Fallback: extract "10 Mar 2026" directly via regex
  const match = pubDate.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (match) return `${match[1]} ${match[2]} ${match[3]}`;

  return 'Recent';
};

const NewsCard = ({ news }) => {
  return (
    <article className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-agri-primary text-[11px] font-extrabold border border-emerald-100 flex items-center gap-1.5">
            <Newspaper className="w-3 h-3 text-emerald-600" />
            {news.category || 'Government Release'}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Calendar className="w-3 h-3" />
            <span>{formatPubDate(news.pubDate)}</span>
          </div>
        </div>

        <h4 className="text-base font-black text-slate-900 group-hover:text-agri-primary transition-colors leading-snug mb-2.5">
          {news.title}
        </h4>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {news.summary}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate max-w-[170px]" title={news.source || 'Press Information Bureau'}>
            {news.source || 'PIB Govt of India'}
          </span>
        </div>

        <a
          href={news.link || 'https://pib.gov.in/'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-black text-agri-primary hover:text-emerald-700 hover:underline underline-offset-4 transition-all"
        >
          <span>Read Full Release</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
};

export default NewsCard;
