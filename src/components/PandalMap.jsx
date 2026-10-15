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
  Sparkles
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { WB_MAP_REGIONS } from '../lib/dateHelpers';

// =====================================================
// Custom SVG Leaflet Pin — color-coded by crowd status
// (Green = Low Crowd, Amber = Moderate, Red = Heavy)
// Bypasses broken default Leaflet marker icons in Vite
// =====================================================
export const createCustomMarkerIcon = (crowdStatus, isVisited = false, sequenceNumber = null) => {
  let bgColor = '#10B981'; // Green = Low Crowd
  let labelText = 'LOW';
  if (crowdStatus === 'moderate') {
    bgColor = '#F59E0B'; // Amber = Moderate
    labelText = 'MOD';
  } else if (crowdStatus === 'heavy') {
    bgColor = '#EF4444'; // Red = Heavy
    labelText = 'PEAK';
  } else if (crowdStatus === 'blocked') {
    bgColor = '#64748B'; // Slate
    labelText = 'OFF';
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

// Crowd badge color helper
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
// Handles smooth map.flyTo() animations when clicking
// Hub buttons or when Search is executed.
// =====================================================
export function MapFlyToController({ 
  targetLocation, 
  matchingPandals, 
  flyTrigger,
  activeHub
}) {
  const map = useMap();
  const lastTriggerRef = useRef(null);

  // Animate when targetLocation changes (e.g. clicking a Hub button)
  useEffect(() => {
    if (!map) return;
    if (targetLocation && targetLocation.lat && targetLocation.lng) {
      map.flyTo([targetLocation.lat, targetLocation.lng], targetLocation.zoom || 14, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [map, targetLocation]);

  // Animate when Search button or station search trigger fires
  useEffect(() => {
    if (!map) return;

    if (flyTrigger && flyTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = flyTrigger;

      if (matchingPandals && matchingPandals.length > 0) {
        if (matchingPandals.length === 1) {
          const p = matchingPandals[0];
          map.flyTo([p.latitude, p.longitude], 16, {
            duration: 1.2,
            easeLinearity: 0.25,
          });
        } else {
          const bounds = L.latLngBounds(
            matchingPandals.map((p) => [p.latitude, p.longitude])
          );
          map.flyToBounds(bounds, {
            padding: [60, 60],
            maxZoom: 15,
            duration: 1.2,
          });
        }
      }
    }
  }, [map, flyTrigger, matchingPandals]);

  return null;
}

// =====================================================
// PandalMap Component — Live Interactive West Bengal Map
// Centered on West Bengal ([22.6500, 88.3600])
// High-contrast CARTO/OpenStreetMap tiles
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
  const { pandals, itinerary, addToItinerary } = useAppData();
  const [mapMode, setMapMode] = useState('all'); // 'all' or 'route'
  const [activeHub, setActiveHub] = useState('wb');
  const [tileProvider, setTileProvider] = useState('carto'); // 'carto' or 'osm'
  const [localTarget, setLocalTarget] = useState(flyToTarget);

  // Sync external flyToTarget prop if passed
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
          (selZone.includes('hooghly') && pZone.includes('hooghly')) ||
          (selZone.includes('kalyani') && pZone.includes('kalyani')) ||
          (selZone.includes('salt lake') && pZone.includes('salt lake'));
        if (!zoneMatch) return false;
      }

      // Search match across multiple fields
      if (q) {
        const name = (p.name || '').toLowerCase();
        const bengali = (p.bengali_name || '').toLowerCase();
        const zone = (p.zone || '').toLowerCase();
        const metro = (p.nearest_metro || '').toLowerCase();
        const railway = (p.nearest_railway || '').toLowerCase();
        const theme = (p.theme_title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();

        return (
          name.includes(q) ||
          bengali.includes(q) ||
          zone.includes(q) ||
          metro.includes(q) ||
          railway.includes(q) ||
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

  // Active pandals to plot
  const pandalsToPlot = mapMode === 'route' ? itineraryPandals : displayedPandals;

  // Route coordinates for polyline
  const routeCoords = useMemo(() => {
    if (mapMode === 'route' && itineraryPandals.length > 1) {
      return itineraryPandals.map((p) => [p.latitude, p.longitude]);
    }
    return [];
  }, [mapMode, itineraryPandals]);

  // Hub buttons definitions as specified in user request:
  // North Kolkata, South Kolkata, Salt Lake, Hooghly-Serampore Line, Kalyani
  const hubsList = [
    {
      id: 'wb',
      label: 'West Bengal',
      bengali: 'পশ্চিমবঙ্গ',
      zone: 'All',
      lat: 22.6500,
      lng: 88.3600,
      zoom: 9,
      color: '#F59E0B',
    },
    {
      id: 'north',
      label: 'North Kolkata',
      bengali: 'উত্তর কলকাতা',
      zone: 'North Kolkata',
      lat: 22.6000,
      lng: 88.3700,
      zoom: 14,
      color: '#EF4444',
    },
    {
      id: 'south',
      label: 'South Kolkata',
      bengali: 'দক্ষিণ কলকাতা',
      zone: 'South Kolkata',
      lat: 22.5150,
      lng: 88.3500,
      zoom: 14,
      color: '#F97316',
    },
    {
      id: 'salt-lake',
      label: 'Salt Lake',
      bengali: 'সল্টলেক ও নিউটাউন',
      zone: 'Salt Lake & Newtown',
      lat: 22.5867,
      lng: 88.4171,
      zoom: 14,
      color: '#3B82F6',
    },
    {
      id: 'hooghly-serampore',
      label: 'Hooghly-Serampore Line',
      bengali: 'হুগলি ও শ্রীরামপুর লাইন',
      zone: 'Hooghly-Serampore Line',
      lat: 22.7150,
      lng: 88.3490,
      zoom: 13,
      color: '#8B5CF6',
    },
    {
      id: 'kalyani',
      label: 'Kalyani',
      bengali: 'কল্যাণী',
      zone: 'Kalyani & Districts',
      lat: 22.9750,
      lng: 88.4345,
      zoom: 13,
      color: '#10B981',
    },
  ];

  // Click handler for Hub buttons
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

  // Reset to West Bengal center ([22.6500, 88.3600])
  const resetToWB = () => {
    setActiveHub('wb');
    setLocalTarget({
      lat: 22.6500,
      lng: 88.3600,
      zoom: 9,
      timestamp: Date.now(),
    });
    if (onSelectZone) {
      onSelectZone('All');
    }
  };

  return (
    <div className="relative w-full h-[540px] md:h-[620px] rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl bg-stone-900">
      {/* TOP LEFT — Mode Switcher & Reset Button */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <div className="bg-stone-900/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-1 shadow-lg flex items-center gap-1">
          <button
            onClick={() => setMapMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === 'all'
                ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Pandals ({displayedPandals.length})
          </button>
          <button
            onClick={() => setMapMode('route')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              mapMode === 'route'
                ? 'bg-gradient-to-r from-amber-600 to-red-700 text-white shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-amber-300" />
            {activeDay} Route ({itineraryPandals.length})
          </button>
        </div>

        <button
          onClick={resetToWB}
          className="bg-stone-900/95 backdrop-blur-md border border-amber-500/30 text-stone-200 hover:text-amber-400 p-2 rounded-xl shadow-lg transition-colors flex items-center justify-center cursor-pointer"
          title="Reset View to West Bengal Center ([22.6500, 88.3600])"
        >
          <Globe className="w-4 h-4" />
        </button>

        {/* Tile Provider Switcher */}
        <button
          onClick={() => setTileProvider(tileProvider === 'carto' ? 'osm' : 'carto')}
          className="bg-stone-900/95 backdrop-blur-md border border-amber-500/30 text-stone-300 hover:text-amber-300 px-2.5 py-1.5 rounded-xl shadow-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
          title="Switch Map Tiles (CARTO / OpenStreetMap)"
        >
          <span>Tiles:</span>
          <span className="text-amber-400 uppercase font-black">{tileProvider}</span>
        </button>
      </div>

      {/* TOP RIGHT — Hub Buttons (North Kolkata, South Kolkata, Salt Lake, Hooghly-Serampore Line, Kalyani) */}
      <div className="absolute top-3 right-3 z-[1000] max-w-[240px] sm:max-w-[310px]">
        <div className="bg-stone-950/95 backdrop-blur-md border border-amber-500/30 rounded-xl p-2.5 shadow-xl space-y-1.5">
          <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1 px-1">
            <Compass className="w-3 h-3" />
            Hub Navigation (Fly To)
          </span>
          <div className="flex flex-wrap gap-1">
            {hubsList.map((hub) => (
              <button
                key={hub.id}
                onClick={() => handleHubClick(hub)}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  activeHub === hub.id
                    ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border-stone-700 hover:border-amber-500/40'
                }`}
                title={hub.bengali}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: hub.color }}
                />
                <span>{hub.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT — Crowd Color Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-stone-950/90 backdrop-blur-md border border-amber-500/20 rounded-xl px-3 py-2 text-xs shadow-lg flex items-center gap-3">
        <span className="text-[11px] text-stone-400 font-medium">Crowd:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-stone-300 text-[11px] font-medium">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="text-stone-300 text-[11px] font-medium">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span className="text-stone-300 text-[11px] font-medium">Heavy</span>
        </div>
      </div>

      {/* Real Interactive Leaflet (react-leaflet) Map Container */}
      <MapContainer
        center={[22.6500, 88.3600]}
        zoom={9}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
      >
        {/* High-contrast CARTO or OpenStreetMap Tiles */}
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

        {/* MapFlyToController for smooth map.flyTo() animations */}
        <MapFlyToController
          targetLocation={localTarget}
          matchingPandals={displayedPandals}
          flyTrigger={flyTrigger}
          activeHub={activeHub}
        />

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

        {/* Interactive Pandal Markers with Custom SVG DivIcon Pins */}
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
              <Popup className="utsav-leaflet-popup" maxWidth={290}>
                <div className="w-[250px] p-0.5 font-sans text-stone-100">
                  {/* Pandal Image & Badges */}
                  <div className="relative rounded-lg overflow-hidden mb-2 h-24 bg-stone-800">
                    <img
                      src={pandal.image_url}
                      alt={pandal.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div
                      className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white shadow"
                      style={{ backgroundColor: crowdColor(pandal.crowd_status) }}
                    >
                      {pandal.crowd_status} crowd
                    </div>
                    {pandal.vip_pass_available && (
                      <div className="absolute top-1.5 left-1.5 bg-stone-900/90 border border-amber-500/50 text-amber-300 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider">
                        VIP PASS
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-stone-100 leading-snug mb-0.5">
                    {pandal.name}
                  </h4>
                  {pandal.bengali_name && (
                    <p className="text-xs text-amber-400 font-bengali mb-1.5">
                      {pandal.bengali_name}
                    </p>
                  )}

                  {/* Information Details */}
                  <div className="space-y-1 text-xs text-stone-300 mb-2.5 bg-stone-900/60 p-2 rounded-lg border border-stone-800">
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <span>🎨</span>
                      <span className="truncate italic text-stone-400">{pandal.theme_title}</span>
                    </div>
                    {pandal.nearest_metro && (
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <span>🚇</span>
                        <span className="truncate">{pandal.nearest_metro}</span>
                      </div>
                    )}
                    {pandal.nearest_railway && (
                      <div className="flex items-center gap-1.5 text-sky-300">
                        <span>🚂</span>
                        <span className="truncate">{pandal.nearest_railway}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <span>📍</span>
                      <span className="truncate font-semibold">{pandal.zone}</span>
                    </div>
                  </div>

                  {/* Actions: Add to Today's Route & Open Google Maps Directions */}
                  <div className="flex flex-col gap-1.5">
                    {alreadyAdded ? (
                      <div className="w-full py-1.5 text-center bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>In Today's Route ({activeDay})</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToItinerary(activeDay, pandal.id, 'Added from Map')}
                        className="w-full py-2 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white rounded-lg text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Today's Route</span>
                      </button>
                    )}

                    <a
                      href={pandal.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 text-center bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700 hover:border-amber-500/50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors no-underline"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>Open Google Maps Directions ↗</span>
                    </a>
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
