import React, { useState } from 'react';
import { 
  MapPin, 
  Train, 
  Star, 
  Ticket, 
  Clock, 
  Plus, 
  Check, 
  CheckCircle2, 
  ExternalLink, 
  AlertTriangle, 
  Camera, 
  Compass,
  ChevronDown
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export const PandalCard = ({ pandal, onOpenCheckInModal }) => {
  const { itinerary, addToItinerary, removeFromItinerary } = useAppData();
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  const days = ['Saptami', 'Ashtami', 'Navami', 'Dashami'];

  // Check if pandal is currently added to any day
  const addedDays = days.filter((d) => 
    (itinerary[d] || []).some((item) => item.pandalId === pandal.id)
  );

  // Crowd status config
  const getCrowdBadge = (status) => {
    switch (status) {
      case 'low':
        return { label: 'Low Crowd', bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300', dot: 'bg-emerald-400' };
      case 'moderate':
        return { label: 'Moderate Wait', bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300', dot: 'bg-amber-400' };
      case 'heavy':
        return { label: 'Heavy Rush (45m+)', bg: 'bg-red-950/90 border-red-500/50 text-red-300', dot: 'bg-red-500 animate-ping' };
      case 'blocked':
        return { label: 'Route Blocked', bg: 'bg-stone-800 border-red-500/60 text-stone-200', dot: 'bg-stone-400' };
      default:
        return { label: 'Normal', bg: 'bg-stone-800 text-stone-300', dot: 'bg-stone-400' };
    }
  };

  const crowd = getCrowdBadge(pandal.crowd_status);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 flex flex-col group hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-950/30">
      {/* Featured Pandal Image with Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-900">
        <img
          src={pandal.image_url}
          alt={pandal.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Crowd Badge */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1.5 shadow-md ${crowd.bg}`}>
            <span className={`w-2 h-2 rounded-full ${crowd.dot}`} />
            {crowd.label}
          </div>

          {/* VIP Pass Badge */}
          {pandal.vip_pass_available && (
            <div className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/90 text-stone-950 shadow-md flex items-center gap-1">
              <Ticket className="w-3 h-3" />
              VIP Pass
            </div>
          )}
        </div>

        {/* Zone Pill at bottom left of image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-amber-500/20">
            {pandal.zone}
          </span>
          {!pandal.is_route_open && (
            <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white text-[11px] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Restricted
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Pandal Titles */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
              {pandal.name}
            </h3>
            <div className="flex items-center gap-1 bg-stone-900 px-2 py-0.5 rounded-lg border border-stone-800 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-extrabold text-stone-200">
                {pandal.avg_rating || 4.8}
              </span>
            </div>
          </div>

          {pandal.bengali_name && (
            <p className="text-xs font-bengali text-amber-400/90 font-medium mb-2">
              {pandal.bengali_name}
            </p>
          )}

          {/* Theme Title */}
          <div className="mb-3">
            <span className="text-xs font-semibold text-rose-400/90 uppercase tracking-wider block text-[10px]">
              Theme • শিল্প ভাবনা
            </span>
            <p className="text-xs font-medium text-stone-200 line-clamp-1 italic">
              "{pandal.theme_title}"
            </p>
          </div>

          {/* Nearest Transit Info */}
          <div className="space-y-1.5 mb-4 text-xs text-stone-300 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/80">
            {pandal.nearest_metro && (
              <div className="flex items-center gap-2">
                <span className="text-amber-400">🚇</span>
                <span className="truncate">
                  <strong className="text-stone-200">Metro:</strong> {pandal.nearest_metro}
                </span>
              </div>
            )}
            {pandal.nearest_railway && (
              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                <span className="text-stone-400">🚆</span>
                <span className="truncate">
                  <strong className="text-stone-300">Rail:</strong> {pandal.nearest_railway}
                </span>
              </div>
            )}
            {pandal.traffic_notes && (
              <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800 line-clamp-1">
                ⚠️ {pandal.traffic_notes}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {/* Add to Day Itinerary Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  addedDays.length > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-gradient-to-r from-red-800 to-amber-700 text-white hover:brightness-110 shadow-sm'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {addedDays.length > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      In {addedDays.join(', ')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add to Itinerary
                    </>
                  )}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-300 shrink-0" />
              </button>

              {/* Day Selection Popover */}
              {dayDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-stone-900 border border-amber-500/30 rounded-xl shadow-2xl p-2 z-30 space-y-1 animate-fadeIn">
                  <div className="text-[10px] text-stone-400 font-bold px-2 py-0.5 uppercase tracking-wider">
                    Select Puja Day Plan
                  </div>
                  {days.map((day) => {
                    const isAdded = addedDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          if (isAdded) {
                            removeFromItinerary(day, pandal.id);
                          } else {
                            addToItinerary(day, pandal.id);
                          }
                          setDayDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          isAdded
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-stone-200 hover:bg-stone-800'
                        }`}
                      >
                        <span>{day}</span>
                        {isAdded ? (
                          <span className="text-[10px] text-amber-400 font-bold">Remove ✕</span>
                        ) : (
                          <span className="text-[10px] text-stone-400">+ Add</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Check-in & Review Button */}
            <button
              onClick={() => onOpenCheckInModal(pandal)}
              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/30 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Check in and submit review/photos"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Check-in</span>
            </button>

            {/* Google Maps Directions */}
            <a
              href={pandal.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-400 transition-colors"
              title="Open Google Maps Route"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
