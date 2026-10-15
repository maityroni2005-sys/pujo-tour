import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Save, 
  MapPin, 
  Image as ImageIcon, 
  ExternalLink,
  CheckCircle,
  Ticket,
  AlertCircle
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';

export const PandalManager = () => {
  const { pandals, addPandal, updatePandal, deletePandal } = useAppData();
  const { showSuccess, showError, showWarning } = useToast();

  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPandal, setEditingPandal] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Form State
  const initialForm = {
    name: '',
    bengali_name: '',
    zone: 'North Kolkata',
    theme_title: '',
    description: '',
    nearest_metro: '',
    nearest_railway: '',
    latitude: 22.5726,
    longitude: 88.3639,
    google_maps_url: '',
    image_url: 'https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=1000&q=80',
    crowd_status: 'low',
    vip_pass_available: false,
    opening_hours: 'Open 24 Hours',
    traffic_notes: 'Normal traffic flow'
  };

  const [formData, setFormData] = useState(initialForm);

  const zones = [
    'All', 
    'North Kolkata', 
    'South Kolkata', 
    'Salt Lake & Newtown', 
    'Hooghly-Serampore Line', 
    'Kalyani & Districts', 
    'Central & Howrah'
  ];

  const filteredPandals = pandals.filter((p) => {
    if (selectedZone !== 'All' && p.zone !== selectedZone) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.theme_title?.toLowerCase().includes(q) ||
        p.bengali_name?.includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingPandal(null);
    setFormData(initialForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (pandal) => {
    setEditingPandal(pandal);
    setFormData({
      ...pandal,
      latitude: pandal.latitude || 22.5726,
      longitude: pandal.longitude || 88.3639,
      google_maps_url: pandal.google_maps_url || ''
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the database?`)) {
      deletePandal(id);
      showSuccess(`"${name}" removed from database.`);
    }
  };

  // Rigorous Form Validation
  const validateForm = () => {
    const errors = {};

    // 1. Pandal Name validation
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Pandal Name is required.';
    } else {
      // Duplicate detection
      const trimmedName = formData.name.trim().toLowerCase();
      const duplicate = pandals.find(
        (p) => p.name.trim().toLowerCase() === trimmedName && (!editingPandal || p.id !== editingPandal.id)
      );
      if (duplicate) {
        errors.name = `A pandal named "${duplicate.name}" already exists in the directory.`;
      }
    }

    // 2. Theme title validation
    if (!formData.theme_title || !formData.theme_title.trim()) {
      errors.theme_title = 'Theme Title is required.';
    }

    // 3. Map link validation (if provided)
    if (formData.google_maps_url && formData.google_maps_url.trim()) {
      try {
        const url = new URL(formData.google_maps_url.trim());
        if (!url.protocol.startsWith('http')) {
          errors.google_maps_url = 'Map link must be a valid http or https URL.';
        }
      } catch {
        errors.google_maps_url = 'Invalid Google Maps URL. Example: https://maps.google.com/?q=22.6025,88.3672';
      }
    }

    // 4. Coordinate range check (West Bengal latitude: ~21.5 - ~27.5, longitude: ~85.8 - ~89.9)
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || lat < 20.0 || lat > 28.0) {
      errors.latitude = 'Latitude must be between 20.0 and 28.0 (West Bengal region).';
    }
    if (isNaN(lng) || lng < 85.0 || lng > 91.0) {
      errors.longitude = 'Longitude must be between 85.0 and 91.0 (West Bengal region).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please correct the validation errors marked in red.');
      return;
    }

    const lat = parseFloat(formData.latitude) || 22.5726;
    const lng = parseFloat(formData.longitude) || 88.3639;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      theme_title: formData.theme_title.trim(),
      latitude: lat,
      longitude: lng,
      google_maps_url: formData.google_maps_url?.trim() || `https://maps.google.com/?q=${lat},${lng}`
    };

    if (editingPandal) {
      updatePandal(editingPandal.id, payload);
      showSuccess(`Pandal "${payload.name}" updated successfully!`);
    } else {
      addPandal(payload);
      showSuccess(`Pandal "${payload.name}" added to the cloud database!`);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-display">
            Pandal Directory & Cloud Registry
          </h2>
          <p className="text-xs text-slate-400">
            Add, update, or remove pandals in the Supabase PostgreSQL database.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Pandal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pandals by name or theme..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none"
          >
            {zones.map((zone) => (
              <option key={zone} value={zone} className="bg-slate-900 text-white">
                {zone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pandals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Pandal</th>
                <th className="py-3.5 px-4">Zone & Transit</th>
                <th className="py-3.5 px-4">Theme</th>
                <th className="py-3.5 px-4">Crowd</th>
                <th className="py-3.5 px-4">VIP Pass</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPandals.map((pandal) => (
                <tr key={pandal.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={pandal.image_url}
                        alt={pandal.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate max-w-[180px]">
                          {pandal.name}
                        </div>
                        <div className="text-[11px] text-amber-400 font-bengali truncate max-w-[180px]">
                          {pandal.bengali_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-semibold">{pandal.zone}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      🚇 {pandal.nearest_metro?.split('(')[0] || pandal.nearest_railway || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-300 line-clamp-1 max-w-[180px]">
                      {pandal.theme_title}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow ${
                      pandal.crowd_status === 'low'
                        ? 'bg-emerald-600 text-white'
                        : pandal.crowd_status === 'moderate'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-rose-600 text-white'
                    }`}>
                      {pandal.crowd_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {pandal.vip_pass_available ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(pandal)}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                        title="Edit Pandal Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pandal.id, pandal.name)}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Pandal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Pandal Modal with Full Validation */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-white font-display mb-1">
              {editingPandal ? 'Edit Pandal Entry' : 'Add New Pandal to Cloud Directory'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter verified details, coordinates, and transit links. Strict validation ensures zero corrupt records.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Name & Bengali Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Pandal Name (English) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                    }}
                    placeholder="e.g. Bagbazar Sarbojanin"
                    className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white focus:outline-none ${
                      formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:ring-1 focus:ring-amber-500'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Bengali Name (বাংলা নাম)</label>
                  <input
                    type="text"
                    value={formData.bengali_name}
                    onChange={(e) => setFormData({ ...formData, bengali_name: e.target.value })}
                    placeholder="যেমন: বাগবাজার সার্বজনীন"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bengali focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Zone & Theme Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Zone Region *</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="North Kolkata">North Kolkata</option>
                    <option value="South Kolkata">South Kolkata</option>
                    <option value="Salt Lake & Newtown">Salt Lake & Newtown</option>
                    <option value="Hooghly-Serampore Line">Hooghly-Serampore Line</option>
                    <option value="Kalyani & Districts">Kalyani & Districts</option>
                    <option value="Central & Howrah">Central & Howrah</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Theme Title *</label>
                  <input
                    type="text"
                    value={formData.theme_title}
                    onChange={(e) => {
                      setFormData({ ...formData, theme_title: e.target.value });
                      if (formErrors.theme_title) setFormErrors({ ...formErrors, theme_title: null });
                    }}
                    placeholder="e.g. Traditional Sabeki Ekchala"
                    className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white focus:outline-none ${
                      formErrors.theme_title ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:ring-1 focus:ring-amber-500'
                    }`}
                  />
                  {formErrors.theme_title && (
                    <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.theme_title}
                    </p>
                  )}
                </div>
              </div>

              {/* Transit links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Nearest Metro Station</label>
                  <input
                    type="text"
                    value={formData.nearest_metro}
                    onChange={(e) => setFormData({ ...formData, nearest_metro: e.target.value })}
                    placeholder="e.g. Shyambazar (Blue Line) - Gate 1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Nearest Railway / EMU Station</label>
                  <input
                    type="text"
                    value={formData.nearest_railway}
                    onChange={(e) => setFormData({ ...formData, nearest_railway: e.target.value })}
                    placeholder="e.g. Serampore / Bidhannagar Road"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Latitude Coordinate *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="22.6025"
                    className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white focus:outline-none ${
                      formErrors.latitude ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:ring-1 focus:ring-amber-500'
                    }`}
                  />
                  {formErrors.latitude && (
                    <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.latitude}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Longitude Coordinate *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="88.3672"
                    className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white focus:outline-none ${
                      formErrors.longitude ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:ring-1 focus:ring-amber-500'
                    }`}
                  />
                  {formErrors.longitude && (
                    <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.longitude}
                    </p>
                  )}
                </div>
              </div>

              {/* Google Maps Link with Validation */}
              <div>
                <label className="font-bold text-slate-200 block mb-1">
                  Google Maps URL (Direct Navigation Link)
                </label>
                <input
                  type="text"
                  value={formData.google_maps_url}
                  onChange={(e) => {
                    setFormData({ ...formData, google_maps_url: e.target.value });
                    if (formErrors.google_maps_url) setFormErrors({ ...formErrors, google_maps_url: null });
                  }}
                  placeholder="https://maps.google.com/?q=22.6025,88.3672"
                  className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white focus:outline-none ${
                    formErrors.google_maps_url ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
                {formErrors.google_maps_url && (
                  <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.google_maps_url}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="font-bold text-slate-200 block mb-1">Featured Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Crowd & VIP Pass */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-200 block mb-1">Initial Crowd Level</label>
                  <select
                    value={formData.crowd_status}
                    onChange={(e) => setFormData({ ...formData, crowd_status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="low">🟢 Low Crowd</option>
                    <option value="moderate">🟡 Moderate Rush</option>
                    <option value="heavy">🔴 Heavy Rush (Peak)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="vip_pass"
                    checked={formData.vip_pass_available}
                    onChange={(e) => setFormData({ ...formData, vip_pass_available: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="vip_pass" className="font-bold text-slate-200 cursor-pointer">
                    VIP Pass / Digital Pass Available
                  </label>
                </div>
              </div>

              {/* Traffic notes */}
              <div>
                <label className="font-bold text-slate-200 block mb-1">Traffic Notes & Route Restrictions</label>
                <input
                  type="text"
                  value={formData.traffic_notes}
                  onChange={(e) => setFormData({ ...formData, traffic_notes: e.target.value })}
                  placeholder="e.g. Pedestrian walkway from Shyambazar 5-point crossing"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Modal Buttons (WCAG AAA High Contrast) */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPandal ? 'Save Changes' : 'Create Pandal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
