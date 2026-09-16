import React from 'react';
import {
  Sparkles,
  MapPin,
  Wheat,
  UserCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PersonalizedHeader = ({ user, onOpenProfileModal, translations }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return translations?.goodMorning || 'Good morning';
    if (hour < 18) return translations?.goodAfternoon || 'Good afternoon';
    return translations?.goodEvening || 'Good evening';
  };

  const userName = user?.name || 'Farmer';
  const userState =
    user?.profileDetails?.location?.state ||
    user?.address?.state ||
    user?.profileDetails?.state;
  const cropsGrown = user?.profileDetails?.cropsGrown;
  const cropsText = Array.isArray(cropsGrown)
    ? cropsGrown.join(', ')
    : typeof cropsGrown === 'string'
    ? cropsGrown
    : null;

  const hasProfileInfo = Boolean(userState || cropsText);

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-agri-dark to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      {/* Subtle background ambient graphic */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Greeting & Personalized Context */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-agri-gold" />
            <span>Agri Schemes &amp; Subsidies</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {getGreeting()}, <span className="text-agri-light">{userName}</span>!
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-medium leading-relaxed">
            {translations?.updatesForYou || 'Here are updates relevant to you.'}{' '}
            {hasProfileInfo
              ? 'Our matching engine filtered subsidies and announcements matching your land & crop registration.'
              : 'Discover certified government benefits, subsidies, and timely application windows.'}
          </p>

          {/* Active Profile Context Tags */}
          {hasProfileInfo && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {userState && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/15 text-xs font-bold shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-agri-accent" />
                  <span>
                    {translations?.showingUpdatesFor || 'Showing farmer updates for'}{' '}
                    <strong className="text-agri-light">{userState}</strong>
                  </span>
                </span>
              )}

              {cropsText && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/15 text-xs font-bold shadow-2xs">
                  <Wheat className="w-3.5 h-3.5 text-agri-gold" />
                  <span>
                    {translations?.recommendedFor || 'Recommended schemes for'}{' '}
                    <strong className="text-agri-light">{cropsText}</strong>
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Setup Prompt if missing profile info OR Status Pill */}
        <div className="shrink-0">
          {!hasProfileInfo ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 max-w-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-agri-gold/20 text-agri-gold flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-xs text-emerald-100 font-medium leading-snug">
                  {translations?.completeProfilePrompt ||
                    'Complete your farmer profile to receive personalized scheme recommendations.'}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenProfileModal}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-agri-accent to-emerald-500 hover:opacity-95 text-agri-dark font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{translations?.completeProfileBtn || 'Complete Profile'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 text-right space-y-1">
              <div className="flex items-center justify-end gap-1.5 text-xs font-extrabold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-agri-accent" />
                <span>Farmer Profile Synchronized</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-medium">
                Verified with KisanSetu Escrow Registry
              </p>
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="text-xs text-agri-accent hover:underline font-extrabold mt-1 inline-block cursor-pointer"
              >
                Update Profile Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalizedHeader;
