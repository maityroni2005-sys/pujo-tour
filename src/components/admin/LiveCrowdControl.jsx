import React from 'react';
import { Flame, ShieldAlert, CheckCircle, AlertTriangle, Radio } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const LiveCrowdControl = () => {
  const { pandals, updateCrowdStatus, toggleRouteStatus } = useAppData();

  const crowdLevels = [
    { key: 'low', label: 'Low (<15m)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' },
    { key: 'moderate', label: 'Moderate (30m)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' },
    { key: 'heavy', label: 'Heavy Rush (1hr+)', color: 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30' },
    { key: 'blocked', label: 'Route Blocked', color: 'bg-stone-800 text-stone-200 border-stone-600 hover:bg-stone-700' }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Broadcast Status Banner */}
      <div className="bg-gradient-to-r from-red-950/60 to-stone-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              Kolkata Police & Traffic Control Dispatch Desk
            </h3>
            <p className="text-xs text-stone-400">
              One-tap status updates propagate immediately to visitor heatmaps and offline caches.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-500/30 shrink-0">
          {pandals.length} Pandals Monitored
        </span>
      </div>

      {/* Grid of pandal quick controllers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pandals.map((pandal) => (
          <div
            key={pandal.id}
            className={`glass-panel p-4 rounded-2xl border transition-all ${
              !pandal.is_route_open
                ? 'border-red-500/50 bg-red-950/10'
                : 'border-stone-800 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-100">{pandal.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400">
                    {pandal.zone}
                  </span>
                </div>
                <p className="text-xs text-amber-400 font-bengali">{pandal.bengali_name}</p>
                <p className="text-[11px] text-stone-400 italic mt-0.5 line-clamp-1">
                  Theme: {pandal.theme_title}
                </p>
              </div>

              {/* Police Route Blockage Switch */}
              <button
                onClick={() => toggleRouteStatus(pandal.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 border ${
                  pandal.is_route_open
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                    : 'bg-red-600 text-white border-red-500 shadow-md animate-pulse'
                }`}
                title="Toggle route blockage"
              >
                {pandal.is_route_open ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Route Open
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Barricaded
                  </>
                )}
              </button>
            </div>

            {/* Quick 1-Tap Crowd Level Selector Buttons */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Set Live Crowd Level:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {crowdLevels.map((lvl) => {
                  const isCurrent = pandal.crowd_status === lvl.key;
                  return (
                    <button
                      key={lvl.key}
                      onClick={() => updateCrowdStatus(pandal.id, lvl.key)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        isCurrent
                          ? `${lvl.color} ring-1 ring-amber-400 font-black shadow-md`
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Traffic Notes */}
            <div className="mt-3 pt-2 border-t border-stone-800/80 text-[11px] text-stone-400 flex items-center justify-between">
              <span className="truncate">
                ⚠️ {pandal.traffic_notes || 'Normal vehicular movement'}
              </span>
              <span className="text-stone-500 text-[10px] shrink-0 ml-2">
                🚇 {pandal.nearest_metro?.split('(')[0] || 'Metro'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
