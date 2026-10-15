import React, { useState } from 'react';
import { 
  Compass, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  Sparkles, 
  Footprints, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export const CuratedTours = ({ onNavigateToPlanner }) => {
  const { curatedTours, pandals, cloneCuratedTour } = useAppData();
  const [clonedTourId, setClonedTourId] = useState(null);
  const [selectedTargetDay, setSelectedTargetDay] = useState('Saptami');

  const days = ['Saptami', 'Ashtami', 'Navami', 'Dashami'];

  const handleClone = (tourId) => {
    cloneCuratedTour(tourId, selectedTargetDay);
    setClonedTourId(tourId);
    setTimeout(() => {
      setClonedTourId(null);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Expert Recommended Route Packages
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-100 font-display">
            Curated Puja Walking Trails
          </h2>
          <p className="text-sm text-stone-300 font-bengali mt-1">
            কলকাতার সেরা পুজো পরিক্রমা। এক ক্লিকেই সম্পূর্ণ রুট আপনার ট্রিপ প্ল্যানারে যোগ করুন।
          </p>
        </div>

        {/* Target Day Selector */}
        <div className="flex items-center gap-2 bg-stone-900/90 border border-amber-500/30 p-1.5 rounded-2xl">
          <span className="text-xs text-stone-400 font-bold pl-2">Clone into:</span>
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedTargetDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTargetDay === day
                  ? 'bg-gradient-to-r from-red-700 to-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Curated Route Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {curatedTours.map((tour) => {
          // Resolve pandal names
          const tourPandals = (tour.pandal_ids || [])
            .map((pid) => pandals.find((p) => p.id === pid))
            .filter(Boolean);

          const isJustCloned = clonedTourId === tour.id;

          return (
            <div
              key={tour.id}
              className="glass-panel rounded-3xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col group shadow-xl"
            >
              {/* Tour Banner Image */}
              <div className="relative h-56 w-full overflow-hidden bg-stone-900">
                <img
                  src={tour.image_url}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                {/* Badges on Banner */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-stone-950 shadow-lg">
                    {tour.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-950/80 backdrop-blur-md text-stone-200 border border-stone-700">
                    {tour.zone}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-0.5">
                    {tour.title}
                  </h3>
                  {tour.bengali_title && (
                    <p className="text-xs text-amber-300 font-bengali">
                      {tour.bengali_title}
                    </p>
                  )}
                </div>
              </div>

              {/* Tour Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {tour.description}
                  </p>

                  {/* Highlights Bullet List */}
                  {tour.highlights && tour.highlights.length > 0 && (
                    <div className="bg-stone-900/60 rounded-2xl p-3.5 border border-stone-800">
                      <span className="text-[11px] font-extrabold uppercase text-amber-400 block mb-2 tracking-wider">
                        Key Highlights • বিশেষ আকর্ষণ
                      </span>
                      <ul className="space-y-1.5 text-xs text-stone-300">
                        {tour.highlights.map((hl, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Included Pandals Sequential Preview */}
                  <div>
                    <span className="text-[11px] font-extrabold uppercase text-stone-400 block mb-2 tracking-wider">
                      Included Pandals ({tourPandals.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tourPandals.map((p, idx) => (
                        <span
                          key={p.id}
                          className="text-xs px-2.5 py-1 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 flex items-center gap-1.5"
                        >
                          <span className="text-[10px] font-black text-amber-400">#{idx + 1}</span>
                          <span className="truncate max-w-[150px]">{p.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Transit Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2 border-t border-stone-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tour.estimated_time}</span>
                    </div>
                    {tour.distance_km && (
                      <div className="flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{tour.distance_km}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 1-Click Clone Button */}
                <div className="pt-2">
                  <button
                    onClick={() => handleClone(tour.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isJustCloned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-red-700 via-amber-600 to-amber-700 text-white hover:brightness-110 active:scale-[0.99]'
                    }`}
                  >
                    {isJustCloned ? (
                      <>
                        <Check className="w-4 h-4" />
                        Cloned to {selectedTargetDay}! View in Planner ↗
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Clone Package into {selectedTargetDay} Itinerary
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
