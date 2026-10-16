import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Plus,
  CheckCircle,
  ExternalLink,
  ZoomIn,
  Globe,
  Route,
  Flame,
  Train,
  Sparkles,
  LocateFixed,
  Loader2,
  Clock,
  Navigation2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { WB_MAP_REGIONS } from '../lib/dateHelpers';
import { FALLBACK_PANDAL_IMAGE } from '../data/initialPandals';
import { calculateHaversineDistance, formatDistance, getGoogleMapsDirUrl } from '../lib/distanceHelper';
import { WeatherWidget } from './WeatherWidget';

// =====================================================
// Custom SVG Leaflet Pin — color-coded by crowd status
// (Green = Low Crowd, Amber = Moderate, Red = Heavy)
// Bypasses broken default Leaflet marker icons in Vite
// =====================================================
export const createCustomMarkerIcon = (crowdStatus, isVisited = false, sequenceNumber = null) => {
  let bgColor = '#10B981'; // Green = Low Crowd
  if (crowdStatus === 'moderate') {
    bgColor = '#F59E0B'; // Amber = Moderate
  } else if (crowdStatus === 'heavy') {
    bgColor = '#EF4444'; // Red = Heavy
  } else if (crowdStatus === 'blocked') {
    bgColor = '#64748B'; // Slate
  }

  const numberLabel =
    sequenceNumber !== null
      ? `<span style="position: absolute; top: 4px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 900; color: #fff;">${sequenceNumber}</span>`
      : `<span style="position: absolute; top: 6px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #fff;">🪔</span>`;

  const html = `
    <div style="position: relative; width: 34px; height: 44px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6)); cursor: pointer;">
      <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 28.5 17 44 17 44C17 44 34 28.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="${bgColor}" stroke="#FDFBF7" stroke-width="2"/>
        <circle cx="17" cy="16" r="11" fill="#18181b" opacity="0.95" />
      </svg>
      ${numberLabel}
      ${
        isVisited
          ? `<div style="position: absolute; bottom: 2px; right: -2px; background: #10B981; border: 1.5px solid #fff; border-radius: 9999px; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; font-weight: bold;">✓</div>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: html,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -42],
  });
};

// =====================================================
// Custom Pulsing Blue "You Are Here" Marker DivIcon
// (Requirement 3: Live GPS Radar)
// =====================================================
export const createUserLocationIcon = () => {
  const html = `
    <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <span style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: rgba(59, 130, 246, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      <span style="position: absolute; width: 22px; height: 22px; border-radius: 9999px; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.6);"></span>
      <span style="position: relative; font-size: 11px; color: #FFFFFF; font-weight: 900; line-height: 1;">📍</span>
    </div>
  `;

  return L.divIcon({
    className: 'user-gps-marker',
    html: html,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

const crowdColor = (status) => {
  switch (status) {
    case 'low':
      return '#10B981';
    case 'moderate':
      return '#F59E0B';
    case 'heavy':
      return '#EF4444';
    case 'blocked':
      return '#64748B';
    default:
      return '#6B7280';
  }
};

// =====================================================
// MapFlyToController Component using useMap()
// =====================================================
export function MapFlyToController({ 
  targetLocation, 
  matchingPandals, 
  flyTrigger,
  userLocation
}) {
  const map = useMap();
  const lastTriggerRef = useRef(null);

  // Animate when targetLocation changes (e.g. clicking a Hub button)
  useEffect(() => {
    if (!map) return;
    if (targetLocation && targetLocation.lat && targetLocation.lng) {
      map.flyTo([targetLocation.lat, targetLocation.lng], targetLocation.zoom || 13, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [map, targetLocation]);

  // Animate when Search button or trigger fires
  useEffect(() => {
    if (!map) return;

    if (flyTrigger && flyTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = flyTrigger;

      if (matchingPandals && matchingPandals.length > 0) {
        if (matchingPandals.length === 1) {
          const p = matchingPandals[0];
          map.flyTo([p.latitude, p.longitude], 15, {
            duration: 1.2,
            easeLinearity: 0.25,
          });
        } else {
          const bounds = L.latLngBounds(
            matchingPandals.map((p) => [p.latitude, p.longitude])
          );
          map.flyToBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14,
            duration: 1.2,
          });
        }
      }
    }
  }, [map, flyTrigger, matchingPandals]);

  // Animate when userLocation is first detected
  useEffect(() => {
    if (!map || !userLocation) return;
    map.flyTo([userLocation.lat, userLocation.lng], 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [map, userLocation?.timestamp]);

  return null;
}

// =====================================================
// PandalMap Component — Live Interactive West Bengal Map
// =====================================================
export const PandalMap = ({ 
  selectedZone = 'All', 
  activeDay = 'Saptami', 
  onSelectPandal = null,
  searchQuery = '',
  flyToTarget = null,
  flyTrigger = null,
  onSelectZone = null
}) => {
  const { pandals, itinerary, addToItinerary, userLocation, isLocating, locateUser } = useAppData();
  const [mapMode, setMapMode] = useState('all'); // 'all' or 'route'
  const [activeHub, setActiveHub] = useState('wb');
  const [tileProvider, setTileProvider] = useState('carto'); // 'carto' or 'osm'
  const [localTarget, setLocalTarget] = useState(flyToTarget);

  useEffect(() => {
    if (flyToTarget) {
      setLocalTarget(flyToTarget);
    }
  }, [flyToTarget]);

  // Filter pandals based on selectedZone and searchQuery
  const displayedPandals = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return pandals.filter((p) => {
      // Zone match
      if (selectedZone !== 'All') {
        const pZone = (p.zone || '').toLowerCase();
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
        if (!zoneMatch) return false;
      }

      // Search match across multiple fields
      if (q) {
        const name = (p.name || '').toLowerCase();
        const bengali = (p.bengali_name || '').toLowerCase();
        const zone = (p.zone || '').toLowerCase();
        const metro = (p.nearest_metro || '').toLowerCase();
        const railway = (p.nearest_railway || '').toLowerCase();
        const bus = (p.nearest_bus || '').toLowerCase();
        const theme = (p.theme_title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();

        return (
          name.includes(q) ||
          bengali.includes(q) ||
          zone.includes(q) ||
          metro.includes(q) ||
          railway.includes(q) ||
          bus.includes(q) ||
          theme.includes(q) ||
          desc.includes(q)
        );
      }

      return true;
    });
  }, [pandals, selectedZone, searchQuery]);

  // Pandals in current day's itinerary
  const currentDayItems = itinerary[activeDay] || [];
  const itineraryPandals = useMemo(() => {
    return currentDayItems
      .map((item) => {
        const p = pandals.find((pan) => pan.id === item.pandalId);
        return p
          ? { ...p, sequenceOrder: currentDayItems.indexOf(item) + 1, visited: item.visited }
          : null;
      })
      .filter(Boolean);
  }, [currentDayItems, pandals]);

  const isInItinerary = (pandalId) =>
    currentDayItems.some((item) => item.pandalId === pandalId);

  const pandalsToPlot = mapMode === 'route' ? itineraryPandals : displayedPandals;

  // Route coordinates for polyline
  const routeCoords = useMemo(() => {
    if (mapMode === 'route' && itineraryPandals.length > 1) {
      return itineraryPandals.map((p) => [p.latitude, p.longitude]);
    }
    return [];
  }, [mapMode, itineraryPandals]);

  // All-West Bengal Hub navigation list
  const hubsList = [
    {
      id: 'wb',
      label: 'West Bengal',
      bengali: 'পশ্চিমবঙ্গ',
      zone: 'All',
      lat: 22.65,
      lng: 88.36,
      zoom: 8,
      color: '#F59E0B',
    },
    {
      id: 'contai',
      label: 'Contai (Kanthi)',
      bengali: 'কাঁথি',
      zone: 'Contai / Purba Medinipur',
      lat: 21.7812,
      lng: 87.7523,
      zoom: 13,
      color: '#10B981',
    },
    {
      id: 'u24p',
      label: 'Uttar 24 Pgs (Barasat)',
      bengali: 'বারাসাত',
      zone: 'Uttar 24 Parganas',
      lat: 22.723,
      lng: 88.482,
      zoom: 13,
      color: '#3B82F6',
    },
    {
      id: 'north',
      label: 'North Kolkata',
      bengali: 'উত্তর কলকাতা',
      zone: 'North Kolkata',
      lat: 22.6,
      lng: 88.37,
      zoom: 14,
      color: '#EF4444',
    },
    {
      id: 'south',
      label: 'South Kolkata',
      bengali: 'দক্ষিণ কলকাতা',
      zone: 'South Kolkata',
      lat: 22.515,
      lng: 88.35,
      zoom: 14,
      color: '#F97316',
    },
    {
      id: 'salt-lake',
      label: 'Salt Lake',
      bengali: 'সল্টলেক',
      zone: 'Salt Lake & Newtown',
      lat: 22.5867,
      lng: 88.4171,
      zoom: 14,
      color: '#06B6D4',
    },
    {
      id: 'hooghly-serampore',
      label: 'Hooghly Line',
      bengali: 'শ্রীরামপুর লাইন',
      zone: 'Hooghly-Serampore Line',
      lat: 22.715,
      lng: 88.349,
      zoom: 13,
      color: '#8B5CF6',
    },
    {
      id: 'kalyani',
      label: 'Kalyani',
      bengali: 'কল্যাণী',
      zone: 'Kalyani & Nadia',
      lat: 22.975,
      lng: 88.4345,
      zoom: 13,
      color: '#EC4899',
    },
    {
      id: 'howrah',
      label: 'Howrah',
      bengali: 'হাওড়া',
      zone: 'Central & Howrah',
      lat: 22.6,
      lng: 88.32,
      zoom: 13,
      color: '#EAB308',
    },
    {
      id: 'durgapur',
      label: 'Durgapur',
      bengali: 'দুর্গাপুর',
      zone: 'Durgapur (Paschim Bardhaman)',
      lat: 23.535,
      lng: 87.312,
      zoom: 13,
      color: '#14B8A6',
    },
    {
      id: 'siliguri',
      label: 'Siliguri',
      bengali: 'শিলিগুড়ি',
      zone: 'Siliguri (North Bengal)',
      lat: 26.716,
      lng: 88.428,
      zoom: 13,
      color: '#6366F1',
    },
  ];

  const handleHubClick = (hub) => {
    setActiveHub(hub.id);
    setLocalTarget({
      lat: hub.lat,
      lng: hub.lng,
      zoom: hub.zoom,
      timestamp: Date.now(),
    });

    if (onSelectZone) {
      onSelectZone(hub.zone);
    }
  };

  const resetToWB = () => {
    setActiveHub('wb');
    setLocalTarget({
      lat: 22.65,
      lng: 88.36,
      zoom: 8,
      timestamp: Date.now(),
    });
    if (onSelectZone) {
      onSelectZone('All');
    }
  };

  return (
    <div className="relative w-full h-[560px] md:h-[640px] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#090D16]">
      {/* TOP LEFT — Mode Switcher, Reset Button & Live GPS Trigger */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <div className="bg-[#090D16]/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-1 shadow-lg flex items-center gap-1">
          <button
            onClick={() => setMapMode('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === 'all'
                ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Pandals ({displayedPandals.length})
          </button>
          <button
            onClick={() => setMapMode('route')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === 'route'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-amber-300" />
            {activeDay} Route ({itineraryPandals.length})
          </button>
        </div>

        <button
          onClick={resetToWB}
          className="bg-[#090D16]/95 backdrop-blur-md border border-amber-500/30 text-slate-200 hover:text-amber-400 p-2 rounded-xl shadow-lg transition-colors flex items-center justify-center cursor-pointer"
          title="Reset View to All West Bengal Center"
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* Live GPS Button on Map */}
        <button
          onClick={locateUser}
          disabled={isLocating}
          className={`px-2.5 py-1.5 rounded-xl border shadow-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
            userLocation
              ? 'bg-blue-600 text-white border-blue-400'
              : 'bg-[#090D16]/95 text-slate-200 border-amber-500/30 hover:border-emerald-400 hover:text-emerald-300'
          }`}
          title="Detect live GPS position and show on map"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <LocateFixed className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span>{userLocation ? 'GPS On' : 'My GPS'}</span>
        </button>

        {/* Tile Provider Switcher */}
        <button
          onClick={() => setTileProvider(tileProvider === 'carto' ? 'osm' : 'carto')}
          className="hidden sm:flex bg-[#090D16]/95 backdrop-blur-md border border-amber-500/30 text-slate-300 hover:text-amber-300 px-2.5 py-1.5 rounded-xl shadow-lg text-[10px] font-bold items-center gap-1 cursor-pointer"
          title="Switch Map Tiles (CARTO / OpenStreetMap)"
        >
          <span>Tiles:</span>
          <span className="text-amber-400 uppercase font-black">{tileProvider}</span>
        </button>
      </div>

      {/* TOP RIGHT — Hub Navigation Pills Drawer */}
      <div className="absolute top-3 right-3 z-[1000] max-w-[220px] sm:max-w-[340px]">
        <div className="bg-[#090D16]/95 backdrop-blur-md border border-amber-500/30 rounded-2xl p-2 sm:p-2.5 shadow-xl space-y-1.5">
          <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider flex items-center gap-1 px-1">
            <Compass className="w-3 h-3 text-amber-400" />
            District Hubs:
          </span>
          <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto scrollbar-none">
            {hubsList.map((hub) => (
              <button
                key={hub.id}
                onClick={() => handleHubClick(hub)}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                  activeHub === hub.id
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700'
                }`}
                title={hub.bengali}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: hub.color }}
                />
                <span className="truncate max-w-[120px]">{hub.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT — Crowd Color Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#090D16]/95 backdrop-blur-md border border-amber-500/20 rounded-xl px-3 py-2 text-xs shadow-lg flex items-center gap-3">
        <span className="text-[11px] text-slate-400 font-bold">Crowd:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-200 text-[11px] font-medium">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-200 text-[11px] font-medium">Mod</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-200 text-[11px] font-medium">Peak</span>
        </div>
      </div>

      {/* Real Interactive Leaflet (react-leaflet) Map Container */}
      <MapContainer
        center={[22.65, 88.36]}
        zoom={8}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
      >
        {tileProvider === 'carto' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
            subdomains="abcd"
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        {/* MapFlyToController for smooth animations */}
        <MapFlyToController
          targetLocation={localTarget}
          matchingPandals={displayedPandals}
          flyTrigger={flyTrigger}
          userLocation={userLocation}
        />

        {/* Pulsing Blue "You Are Here" User Location GPS Marker (Requirement 3) */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationIcon()}
          >
            <Popup className="utsav-leaflet-popup" maxWidth={260}>
              <div className="p-2 font-sans text-center text-slate-100 space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-full bg-blue-500 text-white font-black text-xs">
                  📍 You Are Here
                </span>
                <p className="text-xs text-slate-300">
                  Live GPS tracking active. Pandals and routes are sorted by nearest distance.
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Itinerary Route Polyline */}
        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#F59E0B',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '8, 8',
              lineCap: 'round',
            }}
          />
        )}

        {/* Interactive Pandal Markers */}
        {pandalsToPlot.map((pandal) => {
          const isItineraryItem = itineraryPandals.find((ip) => ip.id === pandal.id);
          const seq = isItineraryItem ? isItineraryItem.sequenceOrder : null;
          const visited = isItineraryItem ? isItineraryItem.visited : false;
          const alreadyAdded = isInItinerary(pandal.id);

          const customIcon = createCustomMarkerIcon(
            pandal.crowd_status,
            visited,
            seq
          );

          const distanceKm = userLocation
            ? calculateHaversineDistance(
                userLocation.lat,
                userLocation.lng,
                pandal.latitude,
                pandal.longitude
              )
            : null;

          const directionsUrl = getGoogleMapsDirUrl(
            userLocation?.lat,
            userLocation?.lng,
            pandal.latitude,
            pandal.longitude
          );

          const viewPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            pandal.name + ' ' + (pandal.bengali_name || '') + ' ' + (pandal.zone || '')
          )}`;

          return (
            <Marker
              key={pandal.id}
              position={[pandal.latitude, pandal.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectPandal) onSelectPandal(pandal);
                },
              }}
            >
              <Popup className="utsav-leaflet-popup" maxWidth={310}>
                <div className="w-[270px] p-0.5 font-sans text-slate-100">
                  {/* Pandal Photo & Fallback */}
                  <div className="relative rounded-lg overflow-hidden mb-2 h-28 bg-slate-900">
                    <img
                      src={pandal.image_url || FALLBACK_PANDAL_IMAGE}
                      alt={pandal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_PANDAL_IMAGE;
                      }}
                    />
                    <div
                      className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow"
                      style={{ backgroundColor: crowdColor(pandal.crowd_status) }}
                    >
                      {pandal.crowd_status} crowd
                    </div>
                    {distanceKm !== null && (
                      <div className="absolute bottom-1.5 left-1.5 bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] shadow">
                        📍 {formatDistance(distanceKm)} away
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-white leading-snug mb-0.5">
                    {pandal.name}
                  </h4>
                  {pandal.bengali_name && (
                    <p className="text-xs text-amber-400 font-bengali font-bold mb-1">
                      {pandal.bengali_name}
                    </p>
                  )}

                  {/* Information Details */}
                  <div className="space-y-1 text-xs text-slate-300 mb-2 bg-[#090D16] p-2 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <span>🎨</span>
                      <span className="truncate italic text-slate-300">{pandal.theme_title}</span>
                    </div>
                    {pandal.nearest_railway && (
                      <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                        <span>🚆</span>
                        <span className="truncate">{pandal.nearest_railway}</span>
                      </div>
                    )}
                    {pandal.nearest_bus && (
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <span>🚌</span>
                        <span className="truncate">{pandal.nearest_bus}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>📍</span>
                      <span className="truncate font-bold text-amber-400">{pandal.zone}</span>
                    </div>
                  </div>

                  {/* Live Weather Forecast & 1-Click Friend Share inside Map Popup (Requirements 4 & 5) */}
                  <div className="mb-2">
                    <WeatherWidget
                      lat={pandal.latitude}
                      lng={pandal.longitude}
                      pandal={pandal}
                      mode="card"
                    />
                  </div>

                  {/* Action Buttons: Add to Route, Start Live Directions, View Place on Maps */}
                  <div className="flex flex-col gap-1.5">
                    {alreadyAdded ? (
                      <div className="w-full py-1.5 text-center bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>In Route ({activeDay})</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToItinerary(activeDay, pandal.id, 'Added from Map')}
                        className="w-full py-2 bg-gradient-to-r from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white rounded-lg text-xs font-black shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to {activeDay} Route</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 text-center bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center gap-1 transition-colors no-underline"
                        title="Start live GPS route navigation"
                      >
                        <Navigation2 className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Start Route</span>
                      </a>

                      <a
                        href={viewPlaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 text-center bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors no-underline"
                        title="View Place & Photos on Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Maps</span>
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
