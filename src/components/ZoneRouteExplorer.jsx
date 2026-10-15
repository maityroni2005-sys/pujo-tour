import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Map as MapIcon, 
  Grid, 
  Train, 
  Flame, 
  Ticket, 
  X, 
  Search, 
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { PandalCard } from './PandalCard';
import { PandalMap } from './PandalMap';
import { PandalSkeletonGrid } from './PandalSkeletonCard';

export const ZoneRouteExplorer = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedZone, 
  setSelectedZone, 
  flyToTarget = null,
  flyTrigger = null,
  onSearchSubmit = null,
  onSelectHub = null,
  onOpenCheckInModal 
}) => {
  const { pandals } = useAppData();

  const [viewMode, setViewMode] = useState('both'); // 'both', 'grid', 'map'
  const [selectedMetro, setSelectedMetro] = useState('All');
  const [crowdFilter, setCrowdFilter] = useState('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  // Keep searchInput in sync with parent searchQuery
  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  // Extract unique metro/railway stations for the dropdown
  const transitStations = useMemo(() => {
    const set = new Set();
    pandals.forEach((p) => {
      if (p.nearest_metro) {
        const station = p.nearest_metro.split('(')[0].split('/')[0].trim();
        set.add(station);
      }
      if (p.nearest_railway) {
        const rStation = p.nearest_railway.split('(')[0].split('/')[0].trim();
        set.add(rStation);
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [pandals]);

  // Filtered Pandals across multiple fields simultaneously (case-insensitive):
  // Pandal Name, Zone/District, Nearest Railway/Metro Station, Theme, Bengali Name, Description
  const filteredPandals = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return pandals.filter((pandal) => {
      // 1. Zone/District filter
      if (selectedZone !== 'All') {
        const pZone = (pandal.zone || '').toLowerCase();
        const selZone = selectedZone.toLowerCase();
        const zoneMatch =
          pZone === selZone ||
          pZone.includes(selZone) ||
          selZone.includes(pZone) ||
          (selZone.includes('hooghly') && pZone.includes('hooghly')) ||
          (selZone.includes('kalyani') && pZone.includes('kalyani')) ||
          (selZone.includes('salt lake') && pZone.includes('salt lake'));

        if (!zoneMatch) {
          return false;
        }
      }

      // 2. Search query across multiple fields simultaneously:
      // Pandal Name, Zone/District, Nearest Railway/Metro Station, Theme
      if (q) {
        const matchesName = pandal.name?.toLowerCase().includes(q);
        const matchesBengali = pandal.bengali_name?.toLowerCase().includes(q);
        const matchesZone = pandal.zone?.toLowerCase().includes(q);
        const matchesMetro = pandal.nearest_metro?.toLowerCase().includes(q);
        const matchesRailway = pandal.nearest_railway?.toLowerCase().includes(q);
        const matchesTheme = pandal.theme_title?.toLowerCase().includes(q);
        const matchesDesc = pandal.description?.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesBengali &&
          !matchesZone &&
          !matchesMetro &&
          !matchesRailway &&
          !matchesTheme &&
          !matchesDesc
        ) {
          return false;
        }
      }

      // 3. Station dropdown filter
      if (selectedMetro !== 'All') {
        const m = selectedMetro.toLowerCase();
        const matchesM =
          pandal.nearest_metro?.toLowerCase().includes(m) ||
          pandal.nearest_railway?.toLowerCase().includes(m);
        if (!matchesM) {
          return false;
        }
      }

      // 4. Crowd filter
      if (crowdFilter !== 'All' && pandal.crowd_status !== crowdFilter.toLowerCase()) {
        return false;
      }

      // 5. VIP Pass filter
      if (vipOnly && !pandal.vip_pass_available) {
        return false;
      }

      return true;
    });
  }, [pandals, selectedZone, searchQuery, selectedMetro, crowdFilter, vipOnly]);

  const hasActiveFilters =
    selectedZone !== 'All' ||
    selectedMetro !== 'All' ||
    crowdFilter !== 'All' ||
    vipOnly ||
    (searchQuery || '').trim() !== '';

  const clearAllFilters = () => {
    setSelectedZone('All');
    setSelectedMetro('All');
    setCrowdFilter('All');
    setVipOnly(false);
    setSearchQuery('');
    setSearchInput('');
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setSearchQuery(val); // Real-time filtering
  };

  const handleSearchFormSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(searchInput);
    if (onSearchSubmit) {
      onSearchSubmit(searchInput);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar directly in Explorer */}
      <div className="mb-6">
        <form
          onSubmit={handleSearchFormSubmit}
          className="flex items-center gap-2 max-w-3xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by pandal, station (e.g. Serampore, Dum Dum, Kalighat), zone, or theme..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-stone-900 border border-amber-500/30 text-stone-100 placeholder:text-stone-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-100 bg-stone-800 p-1 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-transform active:scale-95"
          >
            <Search className="w-4 h-4 text-stone-950" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Controls Bar: View Switcher & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-100 flex items-center gap-2 font-display">
            <span>Explore Pandals</span>
            <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-amber-300">
              {filteredPandals.length} Found
            </span>
          </h2>
          <p className="text-xs text-stone-400 font-bengali">
            অঞ্চল, রেলওয়ে ও মেট্রো স্টেশন অনুযায়ী ফিল্টার করুন
          </p>
        </div>

        {/* View Switcher (Both / Grid / Map) */}
        <div className="flex items-center gap-2">
          <div className="bg-stone-900 border border-stone-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Split
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Pills Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border-amber-500/20 mb-8 flex flex-wrap items-center gap-3">
        {/* Transit Station Selector */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800">
          <Train className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-stone-400 font-semibold">Station:</span>
          <select
            value={selectedMetro}
            onChange={(e) => setSelectedMetro(e.target.value)}
            className="bg-transparent text-xs text-stone-200 font-bold focus:outline-none cursor-pointer"
          >
            {transitStations.map((station) => (
              <option key={station} value={station} className="bg-stone-900 text-stone-100">
                {station}
              </option>
            ))}
          </select>
        </div>

        {/* Live Crowd Level Filter */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs text-stone-400 font-semibold">Crowd:</span>
          <select
            value={crowdFilter}
            onChange={(e) => setCrowdFilter(e.target.value)}
            className="bg-transparent text-xs text-stone-200 font-bold focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-stone-900 text-stone-100">All Levels</option>
            <option value="low" className="bg-stone-900 text-emerald-400">🟢 Low Only</option>
            <option value="moderate" className="bg-stone-900 text-amber-400">🟡 Moderate Only</option>
            <option value="heavy" className="bg-stone-900 text-red-400">🔴 Heavy (Peak)</option>
          </select>
        </div>

        {/* VIP Pass Toggle */}
        <button
          onClick={() => setVipOnly(!vipOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
            vipOnly
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-stone-900/90 border-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Ticket className="w-3.5 h-3.5 text-amber-400" />
          VIP Pass Available
        </button>

        {/* Clear Filter button */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="ml-auto text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Main View Display */}
      {viewMode === 'map' ? (
        <div className="w-full">
          <PandalMap 
            selectedZone={selectedZone}
            searchQuery={searchQuery}
            flyToTarget={flyToTarget}
            flyTrigger={flyTrigger}
            onSelectZone={(zone) => setSelectedZone(zone)}
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div>
          {filteredPandals.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border-amber-500/20">
              <p className="text-lg font-bold text-stone-300 mb-1">No pandals match the selected filters</p>
              <p className="text-xs text-stone-500 mb-4">Try clearing your search query or station filter</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gradient-to-r from-red-800 to-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPandals.map((pandal) => (
                <PandalCard
                  key={pandal.id}
                  pandal={pandal}
                  onOpenCheckInModal={onOpenCheckInModal}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Split View: Interactive Map on top, Cards below */
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5" />
                Live Interactive West Bengal Pandal Map (CARTO / OSM)
              </span>
              <span className="text-[11px] text-stone-400">Click pins for pandal details, route add & directions</span>
            </div>
            <PandalMap 
              selectedZone={selectedZone}
              searchQuery={searchQuery}
              flyToTarget={flyToTarget}
              flyTrigger={flyTrigger}
              onSelectZone={(zone) => setSelectedZone(zone)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-stone-300 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-amber-400" />
                Pandal Directory ({filteredPandals.length})
              </span>
            </div>

            {filteredPandals.length === 0 ? (
              <div className="text-center py-12 glass-panel rounded-2xl border-amber-500/20">
                <p className="text-stone-300 font-bold mb-2">No pandals found</p>
                <button
                  onClick={clearAllFilters}
                  className="px-3.5 py-1.5 bg-stone-800 text-stone-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPandals.map((pandal) => (
                  <PandalCard
                    key={pandal.id}
                    pandal={pandal}
                    onOpenCheckInModal={onOpenCheckInModal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
