import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  X, 
  Navigation, 
  Compass, 
  LocateFixed, 
  Loader2,
  CheckCircle2,
  Sun,
  ShieldCheck
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { WeatherWidget } from './WeatherWidget';
import { WB_DISTRICT_PRESETS, geocodeWestBengalQuery } from '../lib/geocodingService';

export const HeroBanner = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedZone, 
  setSelectedZone, 
  onSearchSubmit,
  onSelectHub,
  onPlanNowClick 
}) => {
  const { userLocation, isLocating, locationError, locateUser, clearUserLocation } = useAppData();
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);

  // Keep searchInput synced when searchQuery changes externally
  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setSearchQuery(val); // Real-time filtering trigger
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = (searchInput || '').trim();
    setSearchQuery(query);

    if (!query) {
      if (onSearchSubmit) onSearchSubmit('');
      return;
    }

    // Attempt smart West Bengal geocoding fallback
    setIsSearchingGeocode(true);
    try {
      const geo = await geocodeWestBengalQuery(query);
      if (geo && geo.found) {
        if (geo.zone) {
          setSelectedZone(geo.zone);
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
        if (onSearchSubmit) {
          onSearchSubmit(query);
        }
      }
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      if (onSearchSubmit) onSearchSubmit(query);
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedZone('All');
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  // 10 Requested High-Contrast District Auto-Suggest Pills
  const districtPills = [
    {
      id: 'contai',
      label: 'Contai / Purba Medinipur',
      query: 'Contai',
      zone: 'Contai / Purba Medinipur',
      lat: 21.7812,
      lng: 87.7523,
      zoom: 13,
    },
    {
      id: 'u24p',
      label: 'Uttar 24 Parganas (Barasat / Madhyamgram / Naihati)',
      query: 'Barasat',
      zone: 'Uttar 24 Parganas',
      lat: 22.723,
      lng: 88.482,
      zoom: 13,
    },
    {
      id: 'north-kol',
      label: 'North Kolkata',
      query: 'North Kolkata',
      zone: 'North Kolkata',
      lat: 22.6,
      lng: 88.37,
      zoom: 14,
    },
    {
      id: 'south-kol',
      label: 'South Kolkata',
      query: 'South Kolkata',
      zone: 'South Kolkata',
      lat: 22.515,
      lng: 88.35,
      zoom: 14,
    },
    {
      id: 'salt-lake',
      label: 'Salt Lake',
      query: 'Salt Lake',
      zone: 'Salt Lake & Newtown',
      lat: 22.5867,
      lng: 88.4171,
      zoom: 14,
    },
    {
      id: 'hooghly',
      label: 'Hooghly (Serampore, Rishra, Konnagar, Hind Motor, Uttarpara, Chandannagar)',
      query: 'Hooghly',
      zone: 'Hooghly-Serampore Line',
      lat: 22.715,
      lng: 88.349,
      zoom: 13,
    },
    {
      id: 'kalyani',
      label: 'Kalyani',
      query: 'Kalyani',
      zone: 'Kalyani & Nadia',
      lat: 22.975,
      lng: 88.4345,
      zoom: 13,
    },
    {
      id: 'howrah',
      label: 'Howrah',
      query: 'Howrah',
      zone: 'Central & Howrah',
      lat: 22.6,
      lng: 88.32,
      zoom: 13,
    },
    {
      id: 'durgapur',
      label: 'Durgapur',
      query: 'Durgapur',
      zone: 'Durgapur (Paschim Bardhaman)',
      lat: 23.535,
      lng: 87.312,
      zoom: 13,
    },
    {
      id: 'siliguri',
      label: 'Siliguri',
      query: 'Siliguri',
      zone: 'Siliguri (North Bengal)',
      lat: 26.716,
      lng: 88.428,
      zoom: 13,
    },
  ];

  const handlePillClick = (pill) => {
    setSearchInput(pill.query);
    setSearchQuery(pill.query);
    setSelectedZone(pill.zone);
    if (onSelectHub) {
      onSelectHub({
        lat: pill.lat,
        lng: pill.lng,
        zoom: pill.zoom,
        zone: pill.zone,
      });
    }
    if (onSearchSubmit) {
      onSearchSubmit(pill.query, { lat: pill.lat, lng: pill.lng, zoom: pill.zoom });
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
    <div className="relative overflow-hidden pt-6 pb-10 px-4 sm:px-6 lg:px-8 border-b border-amber-500/20 bg-gradient-to-b from-red-950/40 via-[#0B0F19] to-[#090D16]">
      {/* Background festive ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-80 bg-gradient-to-b from-red-600/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Greetings & Weather Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-900/60 to-amber-900/60 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-md self-start">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-bengali text-sm tracking-wide">
              শুভ দুর্গোৎসব ২০২৬ • All-West Bengal Smart Tour
            </span>
          </div>

          {/* Top 'Weather Where I Stand' Banner (Requirement 4 & 5) */}
          <div className="w-full md:w-auto">
            <WeatherWidget
              lat={userLocation?.lat || 22.5726}
              lng={userLocation?.lng || 88.3639}
              locationName={userLocation ? 'Weather Where I Stand (Live GPS)' : 'Kolkata Autumn Weather'}
              mode="banner"
            />
          </div>
        </div>

        {/* Main Title & Bengali Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display mb-3">
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-rose-400 bg-clip-text text-transparent">
              UtsavHopper
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl text-white font-serif-festive mt-1">
              West Bengal Puja Parikrama & Route Planner
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-200 font-bengali leading-relaxed max-w-2xl mx-auto font-medium">
            কাঁথি, উত্তর ২৪ পরগনা, কলকাতা, শ্রীরামপুর, কল্যাণী, হাওড়া, দুর্গাপুর ও শিলিগুড়ি—সারা বাংলার শ্রেষ্ঠ পূজা পরিক্রমা
          </p>
        </div>

        {/* Action Controls: Live GPS Finder Button + WCAG AAA High Contrast Search Bar */}
        <div className="max-w-4xl mx-auto space-y-4 mb-6">
          {/* Prominent High-Contrast Emerald Button: '📍 Find Nearest Pandals Near Me' (Requirement 3) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGpsClick}
              disabled={isLocating}
              className={`min-h-[48px] px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer transform active:scale-95 ${
                userLocation
                  ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30 font-black'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:text-slate-950 hover:shadow-emerald-900/50'
              }`}
              title="Use GPS to detect coordinates and sort pandals by distance"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>Detecting Your Live GPS Coordinates...</span>
                </>
              ) : userLocation ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>📍 GPS Active: Sorted by Distance (Click to Reset)</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="tracking-wide">📍 Find Nearest Pandals Near Me</span>
                </>
              )}
            </button>

            {locationError && (
              <span className="text-xs text-rose-400 font-bold bg-rose-950/80 px-3 py-1.5 rounded-xl border border-rose-500/40">
                {locationError}
              </span>
            )}
          </div>

          {/* Redesigned WCAG AAA High Contrast Search Bar (Requirement 1) */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F59E0B] pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                placeholder="Search pandals (e.g. Bagbazar, Contai Central), districts, stations (e.g. Serampore, Barasat)..."
                className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl bg-[#090D16] border-2 border-slate-700 text-white font-bold placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] transition-all shadow-2xl"
                style={{ backgroundColor: '#090D16', color: '#FFFFFF' }}
              />

              {/* Clear (X) Reset Button */}
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Glowing Amber Search Button */}
            <button
              type="submit"
              disabled={isSearchingGeocode}
              className="min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#F59E0B] hover:bg-amber-400 active:bg-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-transform active:scale-95 cursor-pointer shrink-0 border border-amber-300"
              title="Search pandals & smoothly fly map"
            >
              {isSearchingGeocode ? (
                <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-950 stroke-[3]" />
              )}
              <span className="font-black">Search</span>
            </button>
          </form>

          {/* Instant Auto-Suggest District Pills (Requirement 1) */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Instant District Quick-Hop:
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {districtPills.map((pill) => {
                const isActive =
                  selectedZone === pill.zone ||
                  (searchInput && searchInput.toLowerCase().includes(pill.query.toLowerCase()));

                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => handlePillClick(pill)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-950/40 ring-2 ring-amber-400/40 font-black'
                        : 'bg-[#090D16] text-slate-200 hover:text-white hover:bg-slate-800 border-slate-700 hover:border-amber-500/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Cultural Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
          <div className="p-3 rounded-2xl text-center bg-[#090D16]/90 border border-amber-500/20 shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-amber-400">40+</div>
            <div className="text-[11px] text-slate-300 font-bold">Famous Pandals</div>
          </div>
          <div className="p-3 rounded-2xl text-center bg-[#090D16]/90 border border-amber-500/20 shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">Live GPS</div>
            <div className="text-[11px] text-slate-300 font-bold">Nearest Distance & Radar</div>
          </div>
          <div className="p-3 rounded-2xl text-center bg-[#090D16]/90 border border-amber-500/20 shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-cyan-400">Open-Meteo</div>
            <div className="text-[11px] text-slate-300 font-bold">Hyper-Local Rain Forecast</div>
          </div>
          <div className="p-3 rounded-2xl text-center bg-[#090D16]/90 border border-amber-500/20 shadow-lg">
            <div className="text-xl sm:text-2xl font-black text-rose-400">WhatsApp</div>
            <div className="text-[11px] text-slate-300 font-bold">1-Click Share With Friends</div>
          </div>
        </div>
      </div>
    </div>
  );
};
