import React, { useState } from 'react';
import { 
  MapPin, 
  Train, 
  Bus,
  Star, 
  Ticket, 
  Clock, 
  Plus, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  Camera, 
  Navigation,
  Compass,
  ChevronDown,
  Navigation2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { FALLBACK_PANDAL_IMAGE } from '../data/initialPandals';
import { calculateHaversineDistance, formatDistance, getGoogleMapsDirUrl } from '../lib/distanceHelper';
import { WeatherWidget } from './WeatherWidget';

export const PandalCard = ({ pandal, onOpenCheckInModal }) => {
  const { itinerary, addToItinerary, removeFromItinerary, userLocation } = useAppData();
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(pandal.image_url || FALLBACK_PANDAL_IMAGE);

  const days = ['Saptami', 'Ashtami', 'Navami', 'Dashami'];

  // Check if pandal is currently added to any day
  const addedDays = days.filter((d) => 
    (itinerary[d] || []).some((item) => item.pandalId === pandal.id)
  );

  // Exact distance calculation using Haversine formula
  const distanceKm = userLocation
    ? calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        pandal.latitude,
        pandal.longitude
      )
    : null;

  // Google Maps Direction URL
  const directionsUrl = getGoogleMapsDirUrl(
    userLocation?.lat,
    userLocation?.lng,
    pandal.latitude,
    pandal.longitude
  );

  // Direct Google Maps View Place & Photos URL
  const viewPlaceMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    pandal.name + ' ' + (pandal.bengali_name || '') + ' ' + (pandal.zone || '')
  )}`;

  // Crowd status config
  const getCrowdBadge = (status) => {
    switch (status) {
      case 'low':
        return { 
          label: 'Low Crowd', 
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300', 
          dot: 'bg-emerald-400' 
        };
      case 'moderate':
        return { 
          label: 'Moderate Wait', 
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-300', 
          dot: 'bg-amber-400' 
        };
      case 'heavy':
        return { 
          label: 'Heavy Rush (45m+)', 
          bg: 'bg-rose-950/90 border-rose-500/60 text-rose-300', 
          dot: 'bg-rose-500 animate-ping' 
        };
      case 'blocked':
        return { 
          label: 'Route Blocked', 
          bg: 'bg-slate-800 border-rose-500/60 text-slate-200', 
          dot: 'bg-slate-400' 
        };
      default:
        return { 
          label: 'Normal', 
          bg: 'bg-slate-800 text-slate-300 border-slate-700', 
          dot: 'bg-slate-400' 
        };
    }
  };

  const crowd = getCrowdBadge(pandal.crowd_status);

  return (
    <div className="rounded-2xl overflow-hidden border border-amber-500/25 bg-[#0D121F] hover:border-amber-400/60 transition-all duration-300 flex flex-col group hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-950/20">
      {/* Featured Pandal Image with Overlays */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={imgSrc}
          alt={pandal.name}
          loading="lazy"
          onError={() => {
            if (imgSrc !== FALLBACK_PANDAL_IMAGE) {
              setImgSrc(FALLBACK_PANDAL_IMAGE);
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D121F] via-[#0D121F]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Crowd Badge */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-black border backdrop-blur-md flex items-center gap-1.5 shadow-md ${crowd.bg}`}>
            <span className={`w-2 h-2 rounded-full ${crowd.dot}`} />
            {crowd.label}
          </div>

          {/* Live Distance Badge if GPS detected */}
          {distanceKm !== null && (
            <div className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 border border-emerald-300 shadow-lg flex items-center gap-1 animate-pulse">
              <Navigation className="w-3 h-3 fill-slate-950" />
              <span>📍 {formatDistance(distanceKm)} away from you</span>
            </div>
          )}

          {/* VIP Pass Badge */}
          {pandal.vip_pass_available && (
            <div className="px-2 py-1 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
              <Ticket className="w-3 h-3" />
              VIP Pass
            </div>
          )}
        </div>

        {/* District & Zone Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md text-amber-300 text-xs font-black border border-amber-500/30">
            📍 {pandal.zone}
          </span>
          {pandal.opening_hours && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-900/90 backdrop-blur-md text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              {pandal.opening_hours}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Pandal Titles & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-snug">
              {pandal.name}
            </h3>
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-white">
                {pandal.avg_rating || 4.8}
              </span>
            </div>
          </div>

          {pandal.bengali_name && (
            <p className="text-xs font-bengali text-amber-400 font-bold mb-2">
              {pandal.bengali_name}
            </p>
          )}

          {/* Detailed Theme & Attraction Info */}
          <div className="mb-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block mb-0.5">
              Theme & Attraction • শিল্প ভাবনা
            </span>
            <p className="text-xs font-bold text-slate-200 line-clamp-1 italic">
              "{pandal.theme_title}"
            </p>
            {pandal.description && (
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {pandal.description}
              </p>
            )}
          </div>

          {/* Nearest Railway / Bus / Transit Station */}
          <div className="space-y-1.5 mb-3 text-xs bg-[#090D16] p-2.5 rounded-xl border border-slate-800">
            {pandal.nearest_railway && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sky-400 font-bold">🚆 Rail:</span>
                <span className="truncate text-slate-200 font-medium">
                  {pandal.nearest_railway}
                </span>
              </div>
            )}
            {pandal.nearest_bus && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">🚌 Bus:</span>
                <span className="truncate text-slate-200 font-medium">
                  {pandal.nearest_bus}
                </span>
              </div>
            )}
            {pandal.nearest_metro && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold">🚇 Metro:</span>
                <span className="truncate text-slate-200 font-medium">
                  {pandal.nearest_metro}
                </span>
              </div>
            )}
          </div>

          {/* Live Hyper-Local Weather Widget & 1-Click Share Button (Requirements 4 & 5) */}
          <div className="mb-3">
            <WeatherWidget
              lat={pandal.latitude}
              lng={pandal.longitude}
              pandal={pandal}
              mode="card"
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          {/* Live GPS Route Button if user location detected */}
          {userLocation && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 no-underline cursor-pointer"
            >
              <Navigation2 className="w-3.5 h-3.5 fill-slate-950" />
              <span>Start Live Route on Google Maps ({formatDistance(distanceKm)})</span>
            </a>
          )}

          <div className="flex items-center gap-2">
            {/* Add to Day Itinerary Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                  addedDays.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-gradient-to-r from-rose-700 to-amber-600 text-white hover:brightness-110 shadow-md'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {addedDays.length > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
                      In {addedDays.join(', ')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      Add to Route
                    </>
                  )}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* Day Selection Popover */}
              {dayDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-slate-900 border border-amber-500/30 rounded-xl shadow-2xl p-2 z-30 space-y-1 animate-fadeIn">
                  <div className="text-[10px] text-slate-400 font-bold px-2 py-0.5 uppercase tracking-wider">
                    Select Puja Day Plan
                  </div>
                  {days.map((day) => {
                    const isAdded = addedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            removeFromItinerary(day, pandal.id);
                          } else {
                            addToItinerary(day, pandal.id);
                          }
                          setDayDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          isAdded
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>{day}</span>
                        {isAdded ? (
                          <span className="text-[10px] text-amber-400 font-black">Remove ✕</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">+ Add</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Check-in & Review Button */}
            <button
              type="button"
              onClick={() => onOpenCheckInModal(pandal)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Check in and submit live review/photos"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Check-in</span>
            </button>

            {/* Direct 'View Place & Photos on Google Maps' Button (Requirement 2) */}
            <a
              href={viewPlaceMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#090D16] hover:bg-slate-800 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center cursor-pointer no-underline"
              title="View Place & Photos on Google Maps"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
