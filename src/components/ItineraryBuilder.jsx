import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Share2, 
  Download, 
  ExternalLink, 
  Clock, 
  Footprints, 
  Train, 
  Car, 
  Sparkles,
  WifiOff,
  Edit3,
  Check
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { PandalMap } from './PandalMap';
import { getPujaDayDates, formatDateShort, getTodayIST } from '../lib/dateHelpers';

export const ItineraryBuilder = ({ onOpenShareModal, onOpenCheckInModal }) => {
  const { 
    isOnline,
    pandals, 
    itinerary, 
    removeFromItinerary, 
    toggleVisited, 
    moveItemInItinerary, 
    updateItemNotes,
    clearDayItinerary 
  } = useAppData();

  const [activeDay, setActiveDay] = useState('Saptami');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  // Compute Puja day dates dynamically from today's IST date
  const pujaDates = useMemo(() => getPujaDayDates(), []);

  const days = [
    { key: 'Saptami', label: 'সপ্তমী • Saptami', date: formatDateShort(pujaDates[0]) },
    { key: 'Ashtami', label: 'মহাষ্টমী • Ashtami', date: formatDateShort(pujaDates[1]) },
    { key: 'Navami', label: 'মহানবমী • Navami', date: formatDateShort(pujaDates[2]) },
    { key: 'Dashami', label: 'বিজয়া দশমী • Dashami', date: formatDateShort(pujaDates[3]) },
  ];

  const currentDayItems = itinerary[activeDay] || [];

  // Match items with pandal data
  const populatedItems = currentDayItems.map((item, index) => {
    const p = pandals.find((pan) => pan.id === item.pandalId);
    return {
      ...item,
      pandal: p || {
        id: item.pandalId,
        name: 'Pandal Not Found',
        theme_title: 'Custom Destination',
        zone: 'Kolkata',
        crowd_status: 'moderate'
      },
      sequence: index + 1
    };
  });

  const visitedCount = populatedItems.filter((i) => i.visited).length;

  // Transit mode icons & names
  const transitOptions = [
    { mode: 'walk', icon: '🚶', label: 'Walk' },
    { mode: 'metro', icon: '🚇', label: 'Metro' },
    { mode: 'auto', icon: '🛺', label: 'Auto' },
    { mode: 'cab', icon: '🚕', label: 'Cab' }
  ];

  const handleStartEditNotes = (item) => {
    setEditingNotesId(item.pandalId);
    setTempNotes(item.notes || '');
  };

  const handleSaveNotes = (pandalId) => {
    updateItemNotes(activeDay, pandalId, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Offline PWA Notification Banner */}
      {!isOnline && (
        <div className="bg-amber-950/80 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-200">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                Offline PWA Mode Active
              </p>
              <p className="text-[11px] sm:text-xs text-stone-300">
                Your saved Puja route and notes are cached locally on your device. You can navigate even without an active mobile signal inside pandal queues!
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-black bg-amber-500 text-stone-950 px-2 py-1 rounded">
            Cached
          </span>
        </div>
      )}

      {/* Header and Day Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950 text-amber-300 border border-red-500/30">
              Trip & Group Planner
            </span>
            <span className="text-xs text-stone-400">
              {populatedItems.length} Stops • {visitedCount} Visited
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-100 font-display">
            Custom Puja Day Itinerary
          </h2>
          <p className="text-xs text-stone-400 font-bengali">
            পূজার প্রতিটি দিনের জন্য নিজস্ব রুট সাজান এবং বন্ধুদের সাথে শেয়ার করুন
          </p>
        </div>

        {/* Action Buttons: Share & Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShareModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-800 to-amber-700 hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share with Friends
          </button>
        </div>
      </div>

      {/* Day Tabs (Saptami, Ashtami, Navami, Dashami) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {days.map((day) => {
          const count = (itinerary[day.key] || []).length;
          const isActive = activeDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`p-3 rounded-2xl text-left transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-red-950 to-stone-900 border-amber-500/60 shadow-lg ring-1 ring-amber-500/40'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-800/80 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-amber-400">{day.date}</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300">
                  {count} Pandals
                </span>
              </div>
              <div className={`text-xs sm:text-sm font-bold ${isActive ? 'text-stone-100 font-bengali' : 'text-stone-400'}`}>
                {day.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Route Sequencer, Right Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sequential Stops List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
              {activeDay} Route Order
            </span>
            {populatedItems.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Clear all pandals from ${activeDay} plan?`)) {
                    clearDayItinerary(activeDay);
                  }
                }}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
              >
                Clear Day
              </button>
            )}
          </div>

          {populatedItems.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border-amber-500/20 p-6">
              <Calendar className="w-12 h-12 text-amber-400/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-200 mb-1">
                Your {activeDay} Route is Empty
              </h3>
              <p className="text-xs text-stone-400 mb-4 max-w-sm mx-auto">
                Explore the pandal directory or clone a pre-made curated tour to populate your day plan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {populatedItems.map((item, index) => {
                const { pandal } = item;
                const isFirst = index === 0;
                const isLast = index === populatedItems.length - 1;

                return (
                  <div
                    key={pandal.id}
                    className={`glass-panel p-4 rounded-2xl border transition-all ${
                      item.visited
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Sequence Badge / Visited Checkbox */}
                      <button
                        onClick={() => toggleVisited(activeDay, pandal.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          item.visited
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md shadow-emerald-900/40'
                            : 'bg-stone-900 text-amber-400 border-amber-500/30 hover:border-amber-400'
                        }`}
                        title={item.visited ? "Mark as unvisited" : "Check-in as Visited! (Celebrates)"}
                      >
                        {item.visited ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-black">{item.sequence}</span>
                        )}
                      </button>

                      {/* Details & Notes */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`text-sm sm:text-base font-bold truncate ${item.visited ? 'line-through text-stone-400' : 'text-stone-100'}`}>
                              {pandal.name}
                            </h4>
                            <p className="text-xs text-amber-400/90 font-bengali truncate">
                              {pandal.bengali_name || pandal.zone}
                            </p>
                          </div>

                          {/* Reorder Arrows & Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              disabled={isFirst}
                              onClick={() => moveItemInItinerary(activeDay, index, 'up')}
                              className="p-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                              title="Move Stop Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={isLast}
                              onClick={() => moveItemInItinerary(activeDay, index, 'down')}
                              className="p-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                              title="Move Stop Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeFromItinerary(activeDay, pandal.id)}
                              className="p-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-red-400 transition-colors"
                              title="Remove Stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Transit Mode Pill Selector */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1 bg-stone-900/90 px-2 py-0.5 rounded-lg border border-stone-800 text-[11px]">
                            <span className="text-stone-400 font-medium">To next:</span>
                            {transitOptions.map((t) => (
                              <button
                                key={t.mode}
                                onClick={() => updateItemNotes(activeDay, pandal.id, undefined, t.mode)}
                                className={`px-1.5 py-0.5 rounded ${
                                  item.transitMode === t.mode
                                    ? 'bg-amber-500 text-stone-950 font-bold'
                                    : 'text-stone-400 hover:text-stone-200'
                                }`}
                                title={t.label}
                              >
                                {t.icon}
                              </button>
                            ))}
                          </div>

                          {pandal.nearest_metro && (
                            <span className="text-[11px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800 truncate">
                              🚇 {pandal.nearest_metro.split('(')[0]}
                            </span>
                          )}

                          <a
                            href={pandal.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5"
                          >
                            Map <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        {/* Personal Transit Notes */}
                        <div className="mt-2.5 pt-2 border-t border-stone-800/80">
                          {editingNotesId === pandal.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                placeholder="Add transit tip (e.g. Enter via north gate, meets friends at metro)"
                                className="flex-1 bg-stone-900 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs text-stone-100 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveNotes(pandal.id)}
                                className="px-2.5 py-1 bg-amber-500 text-stone-950 rounded-lg text-xs font-bold"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => handleStartEditNotes(item)}
                              className="group flex items-center justify-between text-xs text-stone-400 cursor-pointer hover:text-amber-300"
                            >
                              <span className="truncate italic">
                                📝 {item.notes || 'Click to add personal notes or meeting spot...'}
                              </span>
                              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-amber-400 ml-2 shrink-0 transition-opacity" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Route Map Preview */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border-amber-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                Route Preview Map
              </span>
              <span className="text-xs text-stone-400">
                Connected by sequential line
              </span>
            </div>
            <PandalMap activeDay={activeDay} />
          </div>

          {/* Quick Route Summary Card */}
          <div className="glass-panel p-4 rounded-2xl border-amber-500/20 space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-stone-300">
              Trip Execution Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[11px]">Total Pandals</span>
                <span className="text-stone-100 font-bold text-base">{populatedItems.length}</span>
              </div>
              <div className="bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
                <span className="text-stone-400 block text-[11px]">Visited So Far</span>
                <span className="text-emerald-400 font-bold text-base">
                  {visitedCount} / {populatedItems.length}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 pt-1">
              Tip: Save your itinerary screenshot or generate a share code for your Puja pandal hopping group.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
