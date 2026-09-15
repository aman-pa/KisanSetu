import React from 'react';

const LoadingCard = ({ count = 3, type = 'scheme' }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-slate-200 rounded-full" />
            <div className="h-5 w-20 bg-emerald-100 rounded-full" />
          </div>

          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-2">
            <div className="h-3.5 w-1/3 bg-slate-200 rounded" />
            <div className="h-5 w-full bg-emerald-50 rounded" />
          </div>

          <div className="space-y-2 pt-2">
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 rounded" />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
            <div className="h-10 flex-1 bg-emerald-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingCard;
