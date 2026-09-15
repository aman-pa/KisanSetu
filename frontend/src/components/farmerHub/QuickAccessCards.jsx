import React from 'react';
import {
  Landmark,
  Coins,
  Newspaper,
  BellRing,
  ArrowUpRight,
} from 'lucide-react';

const QuickAccessCards = ({ onCardClick, translations }) => {
  const cards = [
    {
      id: 'govt-schemes',
      title: translations?.cardGovtSchemes || 'Government Schemes',
      description:
        translations?.cardGovtSchemesDesc ||
        'Find schemes and benefits you may be eligible for.',
      icon: Landmark,
      targetSection: 'featured-schemes',
      filter: 'Schemes',
      badge: 'Central & State',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      gradient: 'from-emerald-50/50 via-white to-white',
      accentBorder: 'hover:border-emerald-300',
    },
    {
      id: 'subsidies',
      title: translations?.cardSubsidies || 'Subsidies & Financial Support',
      description:
        translations?.cardSubsidiesDesc ||
        'Explore subsidies, financial assistance and farmer support programs.',
      icon: Coins,
      targetSection: 'featured-schemes',
      filter: 'Subsidies',
      badge: 'Direct Benefit',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      gradient: 'from-amber-50/40 via-white to-white',
      accentBorder: 'hover:border-amber-300',
    },
    {
      id: 'news',
      title: translations?.cardNews || 'Latest Agriculture News',
      description:
        translations?.cardNewsDesc ||
        'Stay updated with government announcements and agriculture news.',
      icon: Newspaper,
      targetSection: 'farmer-news',
      filter: 'News',
      badge: 'PIB Feed',
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      gradient: 'from-blue-50/40 via-white to-white',
      accentBorder: 'hover:border-blue-300',
    },
    {
      id: 'alerts',
      title: translations?.cardAlerts || 'Important Alerts',
      description:
        translations?.cardAlertsDesc ||
        'Never miss deadlines, application windows or major farmer announcements.',
      icon: BellRing,
      targetSection: 'farmer-alerts',
      filter: 'All',
      badge: 'Deadlines',
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
      gradient: 'from-rose-50/40 via-white to-white',
      accentBorder: 'hover:border-rose-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onCardClick(card.targetSection, card.filter)}
            className={`text-left bg-gradient-to-b ${card.gradient} rounded-3xl p-6 border border-slate-100 ${card.accentBorder} hover:shadow-lg transition-all duration-300 group flex flex-col justify-between cursor-pointer`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform ${card.iconBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {card.badge}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 group-hover:text-agri-primary transition-colors leading-snug mb-2">
                {card.title}
              </h3>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="pt-4 mt-2 flex items-center gap-1 text-xs font-black text-agri-primary group-hover:translate-x-1 transition-transform">
              <span>Explore Section</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickAccessCards;
