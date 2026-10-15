import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Sparkles, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Search, 
  X,
  Compass
} from 'lucide-react';
import { WB_MAP_REGIONS } from '../lib/dateHelpers';

export const HeroBanner = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedZone, 
  setSelectedZone, 
  onSearchSubmit,
  onSelectHub,
  onPlanNowClick 
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  // Keep searchInput synced when searchQuery changes externally (e.g. reset buttons)
  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setSearchQuery(val); // Real-time trigger
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    if (onSearchSubmit) {
      onSearchSubmit(searchInput);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchQuery('');
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  // Hub buttons matching user requirements: North Kolkata, South Kolkata, Salt Lake, Hooghly-Serampore Line, Kalyani
  const hubs = [
    { id: 'all', label: 'All Pandals', zone: 'All' },
    { id: 'north', label: 'North Kolkata', zone: 'North Kolkata' },
    { id: 'south', label: 'South Kolkata', zone: 'South Kolkata' },
    { id: 'salt-lake', label: 'Salt Lake', zone: 'Salt Lake & Newtown' },
    { id: 'hooghly-serampore', label: 'Hooghly-Serampore Line', zone: 'Hooghly-Serampore Line' },
    { id: 'kalyani', label: 'Kalyani', zone: 'Kalyani & Districts' },
    { id: 'central', label: 'Central & Howrah', zone: 'Central & Howrah' },
  ];

  const handleHubClick = (hub) => {
    setSelectedZone(hub.zone);
    if (onSelectHub) {
      const regionData = WB_MAP_REGIONS.find(
        (r) => r.zone === hub.zone || (hub.zone === 'All' && r.id === 'wb')
      );
      if (regionData) {
        onSelectHub(regionData);
      }
    }
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20 bg-gradient-to-b from-red-950/40 via-stone-950 to-stone-950">
      {/* Background festive ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-72 bg-gradient-to-b from-red-600/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Badges: Sharodiya Greetings & Kolkata Autumn Weather */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-900/60 to-amber-900/60 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-bengali text-sm tracking-wide">শুভ দুর্গোৎসব ২০২৬ • Sharodiya Mahotsav</span>
          </div>

          {/* Smart Live Weather Widget */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-amber-500/20 text-xs shadow-sm">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bold text-stone-200">Kolkata: 28°C</span>
              <span className="text-stone-400 ml-1.5 hidden sm:inline">Clear Autumn Evening • Pleasant Breeze</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
        </div>

        {/* Main Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display mb-4">
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-rose-500 bg-clip-text text-transparent">
              UtsavHopper
            </span>
            <span className="block text-2xl sm:text-4xl text-slate-100 font-serif-festive mt-2">
              Smart Puja Parikrama & Trip Planner
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-bengali leading-relaxed max-w-2xl mx-auto">
            বাঙালির শ্রেষ্ঠ উৎসবের স্মার্ট গাইড। লাইভ ভিড় পর্যবেক্ষণ, কিউরেটেড রুট, মেট্রো কানেক্টিভিটি এবং অফলাইন ট্রিপ প্ল্যানার।
          </p>
          <p className="text-xs sm:text-sm text-stone-400 mt-2 font-normal">
            Real-time crowd heatmaps, nearest railway & metro guide, and custom Saptami-to-Dashami bucket lists that work even when mobile network drops.
          </p>
        </div>

        {/* Fully Functional Search Bar with Form & Search Button */}
        <div className="max-w-3xl mx-auto mb-6">
          <form 
            onSubmit={handleFormSubmit}
            className="flex items-center gap-2 mb-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                placeholder="Search pandals (e.g. Bagbazar), stations (e.g. Serampore, Rishra, Dum Dum, Kalighat), zones, themes..."
                className="w-full pl-12 pr-11 py-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-400 transition-all shadow-inner"
              />
              {/* One-click Clear (X) button */}
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-100 bg-stone-800/80 hover:bg-stone-700 p-1 rounded-full transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Prominent Search Button */}
            <button
              type="submit"
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-700 via-amber-600 to-amber-500 text-stone-950 font-black text-sm hover:from-red-600 hover:to-amber-400 shadow-lg shadow-amber-900/30 flex items-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
              title="Search pandals & zoom map"
            >
              <Search className="w-4 h-4 text-stone-950 font-black" />
              <span className="font-bold">Search</span>
            </button>
          </form>

          {/* Hub Selector Pills with Smooth Map Fly-To */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-amber-400/90 font-bold flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5" /> Hubs:
            </span>
            {hubs.map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleHubClick(hub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedZone === hub.zone
                    ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white shadow-md border border-amber-400/40'
                    : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Cultural Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
          <div className="glass-panel p-3 rounded-2xl text-center border-amber-500/15">
            <div className="text-xl sm:text-2xl font-black text-amber-400">18+</div>
            <div className="text-[11px] text-stone-400 font-medium">Famous Pandals</div>
          </div>
          <div className="glass-panel p-3 rounded-2xl text-center border-amber-500/15">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">Live</div>
            <div className="text-[11px] text-stone-400 font-medium">Crowd & VIP Badges</div>
          </div>
          <div className="glass-panel p-3 rounded-2xl text-center border-amber-500/15">
            <div className="text-xl sm:text-2xl font-black text-amber-300">Offline</div>
            <div className="text-[11px] text-stone-400 font-medium">Cached PWA Route</div>
          </div>
          <div className="glass-panel p-3 rounded-2xl text-center border-amber-500/15">
            <div className="text-xl sm:text-2xl font-black text-rose-400">4 Packages</div>
            <div className="text-[11px] text-stone-400 font-medium">Curated Route Walks</div>
          </div>
        </div>
      </div>
    </div>
  );
};
