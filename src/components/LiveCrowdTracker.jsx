import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Users, 
  Clock, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  CheckCircle2, 
  Train, 
  Plus, 
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

export const LiveCrowdTracker = ({ onNavigateToRoute }) => {
  const { pandals, addToItinerary } = useAppData();
  const { isAdmin } = useAuth();
  const [selectedCrowd, setSelectedCrowd] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');

  const crowdStats = useMemo(() => {
    const low = pandals.filter((p) => p.crowd_status === 'low').length;
    const mod = pandals.filter((p) => p.crowd_status === 'moderate').length;
    const heavy = pandals.filter((p) => p.crowd_status === 'heavy').length;
    return { low, mod, heavy, total: pandals.length };
  }, [pandals]);

  const filteredPandals = useMemo(() => {
    return pandals.filter((p) => {
      if (selectedCrowd !== 'All' && p.crowd_status !== selectedCrowd) return false;
      if (selectedZone !== 'All' && p.zone !== selectedZone) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.nearest_metro?.toLowerCase().includes(q) ||
          p.nearest_railway?.toLowerCase().includes(q) ||
          p.zone?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pandals, selectedCrowd, selectedZone, searchFilter]);

  const zones = ['All', 'North Kolkata', 'South Kolkata', 'Salt Lake & Newtown', 'Hooghly-Serampore Line', 'Kalyani & Districts'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 text-xs font-black mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>REAL-TIME CROWD & PARIKRAMA HEATMAP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Live Pandal Crowd Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-bengali">
            ভিড়ের লাইভ আপডেট ও ট্রাফিক নির্দেশিকা দেখে আপনার পূজা পরিক্রমা সাজান
          </p>
        </div>

        {/* High-Contrast Quick Stats */}
        <div className="flex items-center justify-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center">
            <span className="block text-xs font-bold text-emerald-300">Low</span>
            <span className="text-lg font-black text-emerald-400">{crowdStats.low}</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-center">
            <span className="block text-xs font-bold text-amber-300">Moderate</span>
            <span className="text-lg font-black text-amber-400">{crowdStats.mod}</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-center">
            <span className="block text-xs font-bold text-rose-300">Peak / Heavy</span>
            <span className="text-lg font-black text-rose-400">{crowdStats.heavy}</span>
          </div>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-300">
              Peak Hours Advisory (6:30 PM - 12:30 AM)
            </h4>
            <p className="text-xs text-slate-300">
              North Kolkata Sabeki and South mega pandals experience high footfalls after sunset. Morning visits (7 AM - 10 AM) offer shortest queues and hassle-free darshan.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToRoute && onNavigateToRoute()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shrink-0 cursor-pointer transition-transform active:scale-95"
        >
          Build Low-Crowd Route
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl mb-8 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search pandal or station..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Crowd Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCrowd('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCrowd === 'All'
                ? 'bg-slate-700 text-white shadow'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All ({pandals.length})
          </button>
          <button
            onClick={() => setSelectedCrowd('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedCrowd === 'low'
                ? 'bg-emerald-600 text-white shadow ring-2 ring-emerald-400'
                : 'bg-slate-950 text-emerald-400 border border-emerald-900/50 hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Low ({crowdStats.low})
          </button>
          <button
            onClick={() => setSelectedCrowd('moderate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedCrowd === 'moderate'
                ? 'bg-amber-600 text-slate-950 font-black shadow ring-2 ring-amber-400'
                : 'bg-slate-950 text-amber-400 border border-amber-900/50 hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Moderate ({crowdStats.mod})
          </button>
          <button
            onClick={() => setSelectedCrowd('heavy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedCrowd === 'heavy'
                ? 'bg-rose-600 text-white shadow ring-2 ring-rose-400'
                : 'bg-slate-950 text-rose-400 border border-rose-900/50 hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Peak ({crowdStats.heavy})
          </button>
        </div>

        {/* Zone Filter */}
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
        >
          {zones.map((z) => (
            <option key={z} value={z} className="bg-slate-900 text-white">
              {z}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Pandals with Live Crowd Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPandals.map((pandal) => {
          const isLow = pandal.crowd_status === 'low';
          const isMod = pandal.crowd_status === 'moderate';
          const isHeavy = pandal.crowd_status === 'heavy';

          const badgeBg = isLow 
            ? 'bg-emerald-500 text-white' 
            : isMod 
            ? 'bg-amber-500 text-slate-950 font-black' 
            : 'bg-rose-600 text-white font-black';

          const badgeBorder = isLow
            ? 'border-emerald-400'
            : isMod
            ? 'border-amber-400'
            : 'border-rose-400';

          return (
            <div
              key={pandal.id}
              className={`bg-slate-900 border-2 ${badgeBorder} rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition-all hover:-translate-y-1`}
            >
              <div>
                {/* Top Badge & Time */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider font-black shadow ${badgeBg}`}>
                    {pandal.crowd_status} Crowd
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live Radar</span>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-lg font-black text-white leading-tight mb-1">
                  {pandal.name}
                </h3>
                {pandal.bengali_name && (
                  <p className="text-xs text-amber-400 font-bengali mb-3">
                    {pandal.bengali_name}
                  </p>
                )}

                {/* Theme & Details */}
                <p className="text-xs text-slate-300 italic mb-4 line-clamp-2">
                  🎨 {pandal.theme_title}
                </p>

                {/* Transit Info */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Train className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{pandal.nearest_metro || pandal.nearest_railway}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span className="truncate">{pandal.zone}</span>
                  </div>
                  {pandal.traffic_notes && (
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      ℹ️ {pandal.traffic_notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons (WCAG AAA High Contrast) */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => addToItinerary('Saptami', pandal.id, 'Added from Crowd Radar')}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Route</span>
                </button>

                <a
                  href={pandal.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 no-underline transition-transform active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions ↗</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
