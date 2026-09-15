import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

const EmptyState = ({
  title = 'No schemes found',
  message = 'Try clearing your filters or changing your search terms to discover available government programs.',
  onReset,
  resetLabel = 'Reset Filters',
}) => {
  return (
    <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-200 text-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-agri-primary flex items-center justify-center mb-4 border border-emerald-100 shadow-2xs">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-base font-extrabold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
        {message}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-agri-primary hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {resetLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
