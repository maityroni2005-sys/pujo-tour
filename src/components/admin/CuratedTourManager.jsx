import React, { useState } from 'react';
import { Plus, Trash2, Compass, Clock, MapPin, X, Save } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const CuratedTourManager = () => {
  const { curatedTours, pandals, addCuratedTour, deleteCuratedTour } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    bengali_title: '',
    zone: 'North Kolkata',
    badge: 'Curated Heritage',
    estimated_time: '4.0 Hours • Walking & Metro',
    description: '',
    pandal_ids: [],
    highlights: '',
    distance_km: '4.5 km total route',
    image_url: 'https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=1000&q=80'
  });

  const handleTogglePandal = (pandalId) => {
    setFormData((prev) => {
      const exists = prev.pandal_ids.includes(pandalId);
      return {
        ...prev,
        pandal_ids: exists
          ? prev.pandal_ids.filter((id) => id !== pandalId)
          : [...prev.pandal_ids, pandalId]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.pandal_ids.length === 0) {
      alert('Please select at least 1 pandal to include in the tour package.');
      return;
    }

    const hlList = formData.highlights
      ? formData.highlights.split(',').map((h) => h.trim()).filter(Boolean)
      : ['Artistic Idol Darshan', 'Heritage Walkway'];

    addCuratedTour({
      ...formData,
      highlights: hlList
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-100 font-display">
            Recommended Route Packages Manager
          </h3>
          <p className="text-xs text-stone-400">
            Design curated walking trails that users can import into their day itineraries with 1-click.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              bengali_title: '',
              zone: 'North Kolkata',
              badge: 'Curated Heritage',
              estimated_time: '4.0 Hours • Walking & Metro',
              description: '',
              pandal_ids: [],
              highlights: '',
              distance_km: '4.5 km total route',
              image_url: 'https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=1000&q=80'
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Curated Package
        </button>
      </div>

      {/* Existing Curated Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {curatedTours.map((tour) => {
          const tourPandals = (tour.pandal_ids || [])
            .map((pid) => pandals.find((p) => p.id === pid))
            .filter(Boolean);

          return (
            <div
              key={tour.id}
              className="glass-panel p-5 rounded-2xl border border-stone-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tour.badge}
                    </span>
                    <h4 className="text-base font-bold text-stone-100 mt-1">
                      {tour.title}
                    </h4>
                    <p className="text-xs text-amber-400 font-bengali">
                      {tour.bengali_title}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete package "${tour.title}"?`)) {
                        deleteCuratedTour(tour.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-red-400 border border-stone-800"
                    title="Delete Package"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-stone-300 line-clamp-2 mb-3">
                  {tour.description}
                </p>

                <div className="text-xs text-stone-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{tour.estimated_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-red-400" />
                    <span>{tourPandals.length} stops ({tourPandals.map((p) => p.name).join(', ')})</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Tour Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-stone-100 font-display mb-1">
              Create Curated Walking Route Package
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Bundle iconic pandals into an optimized tour for devotees & tourists.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-300 block mb-1">Package Title (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. North Kolkata Heritage & Bonedi Walk"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Bengali Title (বাংলা শিরোনাম)</label>
                <input
                  type="text"
                  value={formData.bengali_title}
                  onChange={(e) => setFormData({ ...formData, bengali_title: e.target.value })}
                  placeholder="যেমন: উত্তর কলকাতা ঐতিহ্য পদযাত্রা"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-bengali focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-300 block mb-1">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="North Kolkata">North Kolkata</option>
                    <option value="South Kolkata">South Kolkata</option>
                    <option value="Salt Lake & Newtown">Salt Lake & Newtown</option>
                    <option value="Kalyani & Districts">Kalyani & Districts</option>
                    <option value="Central & Howrah">Central & Howrah</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-300 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Popular Heritage"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the walking route, atmosphere, and recommendations..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-stone-300 block mb-1.5">
                  Select Pandals to Include ({formData.pandal_ids.length} Selected) *
                </label>
                <div className="max-h-40 overflow-y-auto bg-stone-950/80 border border-stone-800 rounded-xl p-2 space-y-1">
                  {pandals.map((p) => {
                    const isChecked = formData.pandal_ids.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleTogglePandal(p.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-stone-900 text-stone-300'
                        }`}
                      >
                        <span className="font-medium">{p.name} ({p.zone})</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-amber-500 rounded"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 text-white font-bold shadow-md hover:brightness-110 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Route Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
