import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  CloudRain, 
  Sun, 
  Droplets, 
  MessageCircle, 
  Check, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchPandalWeather, 
  sharePandalWithFriend, 
  shareCurrentLocationWeather 
} from '../lib/weatherService';

export const WeatherWidget = ({ 
  lat, 
  lng, 
  pandal = null, 
  locationName = 'Kolkata', 
  mode = 'card' // 'card' | 'banner' | 'popup'
}) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchPandalWeather(lat, lng)
      .then((data) => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  const handleShare = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (pandal) {
      await sharePandalWithFriend(pandal, weather);
    } else {
      await shareCurrentLocationWeather(locationName, weather);
    }
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  if (loading) {
    if (mode === 'banner') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs text-slate-400 animate-pulse">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <span>Fetching live weather...</span>
        </div>
      );
    }
    return (
      <div className="py-1 px-2 rounded-lg bg-slate-900/60 text-[11px] text-slate-400 animate-pulse flex items-center gap-1.5">
        <CloudSun className="w-3 h-3 text-amber-400" />
        <span>Loading live weather...</span>
      </div>
    );
  }

  const temp = weather ? `${weather.temperature}°C` : '28°C';
  const humidity = weather ? `${weather.humidity}%` : '65%';
  const precip = weather?.precipitation !== undefined ? `${weather.precipitation} mm` : '0.0 mm';
  const isRain = weather?.isRain || false;

  // Mode 1: Top "Weather Where I Stand" Banner
  if (mode === 'banner') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#090D16] border border-amber-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            {isRain ? (
              <CloudRain className="w-5 h-5 text-rose-400 animate-bounce" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black text-white">{temp}</span>
                <span className="text-xs text-slate-300 font-semibold">• {locationName}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-0.5">
                  <Droplets className="w-3 h-3 text-cyan-400" /> {humidity}
                </span>
                <span>•</span>
                <span>Rain: {precip}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 shadow-md ${
              isRain
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
            }`}
          >
            {isRain ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>🌧️ Rain Alert: Carry an Umbrella!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>☀️ Great Weather for Pandal Hopping</span>
              </>
            )}
          </div>
        </div>

        {/* 1-Click Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-transform active:scale-95 cursor-pointer ml-auto sm:ml-0"
          title="Share live weather and location with friends on WhatsApp or mobile"
        >
          {shared ? (
            <>
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>Shared!</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>💬 Tell a Friend (Share Weather & Location)</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Mode 2: Card compact view (Inside Pandal Card)
  return (
    <div className="space-y-2 py-2 px-2.5 rounded-xl bg-[#090D16]/90 border border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          {isRain ? (
            <CloudRain className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="font-black text-white">{temp}</span>
          <span className="text-[11px] text-slate-400">• {humidity} hum</span>
          <span className="text-[11px] text-slate-400">• {precip} rain</span>
        </div>

        {/* Status badge pill */}
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
            isRain
              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {isRain ? '🌧️ Rain Alert' : '☀️ Ideal Weather'}
        </span>
      </div>

      {/* 1-Click Share Button on Card */}
      <button
        type="button"
        onClick={handleShare}
        className="w-full py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-[11px] font-black flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
        title="Share weather, crowd & Google Maps location with best friend via WhatsApp"
      >
        {shared ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            <span>Update Shared!</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>💬 Tell a Friend (Share Weather & Location)</span>
          </>
        )}
      </button>
    </div>
  );
};
