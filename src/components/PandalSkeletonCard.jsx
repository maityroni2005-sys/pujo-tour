import React from 'react';

export const PandalSkeletonCard = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden p-4 shadow-xl animate-pulse flex flex-col justify-between">
      <div>
        {/* Skeleton Image Header */}
        <div className="relative w-full h-48 bg-slate-800 rounded-2xl mb-4 overflow-hidden">
          <div className="absolute top-3 right-3 w-20 h-6 bg-slate-700 rounded-full" />
          <div className="absolute top-3 left-3 w-16 h-5 bg-slate-700/80 rounded" />
        </div>

        {/* Skeleton Titles */}
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-slate-800 rounded-lg w-3/4" />
          <div className="h-3.5 bg-slate-800/60 rounded w-1/2" />
        </div>

        {/* Skeleton Theme / Description */}
        <div className="space-y-1.5 mb-5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
          <div className="h-3 bg-slate-800 rounded w-5/6" />
          <div className="h-3 bg-slate-800/60 rounded w-2/3" />
        </div>

        {/* Skeleton Transit Badges */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-slate-800 rounded-lg w-24" />
          <div className="h-6 bg-slate-800 rounded-lg w-28" />
        </div>
      </div>

      {/* Skeleton Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
        <div className="h-10 bg-slate-800 rounded-xl" />
        <div className="h-10 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

export const PandalSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PandalSkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  );
};
