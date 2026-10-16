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
  ArrowRight,
  LocateFixed,
  Loader2,
  Navigation,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { PandalCard } from './PandalCard';
import { PandalMap } from './PandalMap';
import { PandalSkeletonGrid } from './PandalSkeletonCard';
import { calculateHaversineDistance } from '../lib/distanceHelper';
import { geocodeWestBengalQuery } from '../lib/geocodingService';

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
  const { 
    pandals, 
    userLocation, 
    isLocating, 
    locationError, 
    locateUser, 
    clearUserLocation, 
    searchedLocation, 
    setSearchedLocation 
  } = useAppData();

  const [viewMode, setViewMode] = useState('both'); // 'both', 'grid', 'map'
  const [selectedMetro, setSelectedMetro] = useState('All');
  const [crowdFilter, setCrowdFilter] = useState('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);

  // Keep searchInput in sync with parent searchQuery
  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  // Extract unique metro/railway/bus stations for transit filter dropdown
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
      if (p.nearest_bus) {
        const bStation = p.nearest_bus.split('(')[0].split('/')[0].trim();
        set.add(bStation);
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [pandals]);

  // Extract distinct zones/districts
  const distinctZones = useMemo(() => {
    const set = new Set();
    pandals.forEach((p) => {
      if (p.zone) set.add(p.zone);
    });
    return ['All', ...Array.from(set).sort()];
  }, [pandals]);

  // Filter and sort pandals
  const filteredPandals = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    const list = pandals.filter((pandal) => {
      // 1. Zone/District filter
      if (selectedZone !== 'All') {
        const pZone = (pandal.zone || '').toLowerCase();
        const selZone = selectedZone.toLowerCase();
        const zoneMatch =
          pZone === selZone ||
          pZone.includes(selZone) ||
          selZone.includes(pZone) ||
          (selZone.includes('contai') && pZone.includes('contai')) ||
          (selZone.includes('barasat') && pZone.includes('24 parganas')) ||
          (selZone.includes('hooghly') && pZone.includes('hooghly')) ||
          (selZone.includes('kalyani') && pZone.includes('kalyani')) ||
          (selZone.includes('salt lake') && pZone.includes('salt lake')) ||
          (selZone.includes('howrah') && pZone.includes('howrah')) ||
          (selZone.includes('durgapur') && pZone.includes('durgapur')) ||
          (selZone.includes('siliguri') && pZone.includes('siliguri'));

        if (!zoneMatch) {
          return false;
        }
      }

      // 2. Search query filter across name, bengali name, zone, metro, railway, bus, theme, desc
      if (q) {
        const matchesName = pandal.name?.toLowerCase().includes(q);
        const matchesBengali = pandal.bengali_name?.toLowerCase().includes(q);
        const matchesZone = pandal.zone?.toLowerCase().includes(q);
        const matchesMetro = pandal.nearest_metro?.toLowerCase().includes(q);
        const matchesRailway = pandal.nearest_railway?.toLowerCase().includes(q);
        const matchesBus = pandal.nearest_bus?.toLowerCase().includes(q);
        const matchesTheme = pandal.theme_title?.toLowerCase().includes(q);
        const matchesDesc = pandal.description?.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesBengali &&
          !matchesZone &&
          !matchesMetro &&
          !matchesRailway &&
          !matchesBus &&
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
          pandal.nearest_railway?.toLowerCase().includes(m) ||
          pandal.nearest_bus?.toLowerCase().includes(m);
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

    // Sort by live GPS distance or searched location distance (Requirement 1 & 3)
    const referenceLoc = userLocation || searchedLocation;
    if (referenceLoc && referenceLoc.lat && referenceLoc.lng) {
      return [...list].sort((a, b) => {
        const distA = calculateHaversineDistance(
          referenceLoc.lat,
          referenceLoc.lng,
          a.latitude,
          a.longitude
        );
        const distB = calculateHaversineDistance(
          referenceLoc.lat,
          referenceLoc.lng,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      });
    }

    return list;
  }, [
    pandals, 
    selectedZone, 
    searchQuery, 
    selectedMetro, 
    crowdFilter, 
    vipOnly, 
    userLocation, 
    searchedLocation
  ]);

  const hasActiveFilters =
    selectedZone !== 'All' ||
    selectedMetro !== 'All' ||
    crowdFilter !== 'All' ||
    vipOnly ||
    (searchQuery || '').trim() !== '' ||
    userLocation !== null;

  const clearAllFilters = () => {
    setSelectedZone('All');
    setSelectedMetro('All');
    setCrowdFilter('All');
    setVipOnly(false);
    setSearchQuery('');
    setSearchInput('');
    clearUserLocation();
    if (setSearchedLocation) setSearchedLocation(null);
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setSearchQuery(val);
  };

  const handleSearchFormSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = (searchInput || '').trim();
    setSearchQuery(query);

    if (!query) {
      if (onSearchSubmit) onSearchSubmit('');
      return;
    }

    // Geocoding fallback
    setIsSearchingGeocode(true);
    try {
      const geo = await geocodeWestBengalQuery(query);
      if (geo && geo.found) {
        if (geo.zone) setSelectedZone(geo.zone);
        if (setSearchedLocation) {
          setSearchedLocation({ lat: geo.lat, lng: geo.lng, name: geo.displayName });
        }
        if (onSelectHub) {
          onSelectHub({
            lat: geo.lat,
            lng: geo.lng,
            zoom: geo.zoom || 13,
            zone: geo.zone || 'All',
          });
        }
        if (onSearchSubmit) {
          onSearchSubmit(query, { lat: geo.lat, lng: geo.lng, zoom: geo.zoom || 13 });
        }
      } else {
        if (onSearchSubmit) onSearchSubmit(query);
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      if (onSearchSubmit) onSearchSubmit(query);
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    if (setSearchedLocation) setSearchedLocation(null);
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  const handleGpsClick = async () => {
    if (userLocation) {
      clearUserLocation();
      return;
    }
    const res = await locateUser();
    if (res.success && res.coords) {
      if (onSelectHub) {
        onSelectHub({
          lat: res.coords.lat,
          lng: res.coords.lng,
          zoom: 14,
          zone: 'All',
        });
      }
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar & Live GPS Button in Explorer Header */}
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* WCAG AAA High Contrast Search Bar */}
        <form
          onSubmit={handleSearchFormSubmit}
          className="flex items-center gap-2 flex-1"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F59E0B] pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by pandal, town (e.g. Contai, Barasat), station, or theme..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#090D16] border-2 border-slate-700 text-white font-bold placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] transition-all shadow-inner"
              style={{ backgroundColor: '#090D16', color: '#FFFFFF' }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearchingGeocode}
            className="min-h-[46px] px-5 py-2.5 bg-[#F59E0B] hover:bg-amber-400 active:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer transition-transform active:scale-95 border border-amber-300"
          >
            {isSearchingGeocode ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Search className="w-4 h-4 text-slate-950 stroke-[3]" />
            )}
            <span className="font-black">Search</span>
          </button>
        </form>

        {/* Emerald Live GPS Locator Button (Requirement 3) */}
        <button
          type="button"
          onClick={handleGpsClick}
          disabled={isLocating}
          className={`min-h-[46px] px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-lg transition-transform active:scale-95 cursor-pointer ${
            userLocation
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:text-slate-950 border border-emerald-400/40'
          }`}
          title="Find Nearest Pandals Near Me (Haversine formula distance sort)"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Locating...</span>
            </>
          ) : userLocation ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>GPS: Sorted Nearest First ✕</span>
            </>
          ) : (
            <>
              <LocateFixed className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>📍 Find Nearest Pandals Near Me</span>
            </>
          )}
        </button>
      </div>

      {/* Searched Location Notice if applicable */}
      {searchedLocation && !userLocation && (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Showing pandals sorted by proximity to: <strong>{searchedLocation.name}</strong>
            </span>
          </div>
          <button
            onClick={() => setSearchedLocation(null)}
            className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
          >
            Clear Proximity
          </button>
        </div>
      )}

      {/* Controls Bar: View Switcher & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 font-display">
            <span>Explore Pandals</span>
            <span className="text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/40 text-amber-300">
              {filteredPandals.length} Found
            </span>
          </h2>
          <p className="text-xs text-slate-300 font-bengali">
            অঞ্চল, জেলা ও রেলওয়ে স্টেশন ফিল্টার করুন
          </p>
        </div>

        {/* View Switcher (Both / Grid / Map) */}
        <div className="flex items-center gap-2">
          <div className="bg-[#090D16] border border-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Split
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Pills Bar */}
      <div className="p-3.5 rounded-2xl border border-amber-500/25 bg-[#090D16] mb-8 flex flex-wrap items-center gap-3">
        {/* District / Zone Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-400 font-bold">District:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
          >
            {distinctZones.map((zone) => (
              <option key={zone} value={zone} className="bg-slate-900 text-white">
                {zone === 'All' ? 'All Districts / Zones' : zone}
              </option>
            ))}
          </select>
        </div>

        {/* Transit Station Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Train className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs text-slate-400 font-bold">Station:</span>
          <select
            value={selectedMetro}
            onChange={(e) => setSelectedMetro(e.target.value)}
            className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
          >
            {transitStations.map((station) => (
              <option key={station} value={station} className="bg-slate-900 text-white">
                {station}
              </option>
            ))}
          </select>
        </div>

        {/* Live Crowd Level Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs text-slate-400 font-bold">Crowd:</span>
          <select
            value={crowdFilter}
            onChange={(e) => setCrowdFilter(e.target.value)}
            className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-white">All Levels</option>
            <option value="low" className="bg-slate-900 text-emerald-400">🟢 Low Only</option>
            <option value="moderate" className="bg-slate-900 text-amber-400">🟡 Moderate Only</option>
            <option value="heavy" className="bg-slate-900 text-rose-400">🔴 Heavy (Peak)</option>
          </select>
        </div>

        {/* VIP Pass Toggle */}
        <button
          type="button"
          onClick={() => setVipOnly(!vipOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
            vipOnly
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Ticket className="w-3.5 h-3.5 text-amber-400" />
          VIP Pass Available
        </button>

        {/* Clear Filter button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="ml-auto text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
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
            <div className="text-center py-16 rounded-2xl border border-amber-500/20 bg-[#090D16]">
              <p className="text-lg font-bold text-white mb-1">No pandals match the selected filters</p>
              <p className="text-xs text-slate-400 mb-4">Try clearing your search query or station filter</p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gradient-to-r from-rose-800 to-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
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
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Click pins for pandal details, route add & live directions
              </span>
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
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-200 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-amber-400" />
                West Bengal Pandal Directory ({filteredPandals.length})
                {userLocation && (
                  <span className="text-[10px] text-emerald-400 font-bold ml-2">
                    (Sorted by live distance)
                  </span>
                )}
              </span>
            </div>

            {filteredPandals.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-amber-500/20 bg-[#090D16]">
                <p className="text-white font-bold mb-2">No pandals found</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
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
