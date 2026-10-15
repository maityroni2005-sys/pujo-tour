import React, { useState } from 'react';
import { X, Star, Camera, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const CheckInModal = ({ pandal, onClose }) => {
  const { addReview } = useAppData();
  const { currentUser } = useAuth();

  const [rating, setRating] = useState(5);
  const [idolRating, setIdolRating] = useState(5);
  const [lightingRating, setLightingRating] = useState(5);
  const [crowdReport, setCrowdReport] = useState('moderate');
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pandal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    addReview({
      pandalId: pandal.id,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.full_name || 'Puja Hopper',
      userRole: currentUser?.role === 'admin' ? 'Kolkata Police / Admin' : 'Devotee / Visitor',
      rating,
      idolRating,
      lightingRating,
      crowdReport,
      comment: comment.trim() || 'Wonderful puja pandal darshan!',
      photoUrl: photoUrl.trim() || pandal.image_url,
    });

    // Festive confetti
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#C8102E', '#10B981']
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Check-in & Pandal Review
          </span>
        </div>
        <h3 className="text-xl font-black text-stone-100 mb-1">
          {pandal.name}
        </h3>
        <p className="text-xs text-amber-400 font-bengali mb-4">
          {pandal.bengali_name} • {pandal.zone}
        </p>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Categories */}
          <div className="space-y-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
            {/* Overall Rating */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-200">
                Overall Experience
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Idol Craftsmanship Rating */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-300">
                Idol Artistry (প্রতিমা ভাস্কর্য)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setIdolRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= idolRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting & Theme */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-300">
                Lighting & Pandal Theme (আলোকসজ্জা)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setLightingRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= lightingRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Crowd Status Report (Live Crowd Contributor) */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-2">
              How is the live crowd right now? (Community Report)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { level: 'low', label: '🟢 Low wait (<10m)', color: 'border-emerald-500/50 text-emerald-300' },
                { level: 'moderate', label: '🟡 Moderate (20m)', color: 'border-amber-500/50 text-amber-300' },
                { level: 'heavy', label: '🔴 Heavy (45m+)', color: 'border-red-500/50 text-red-300' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.level}
                  onClick={() => setCrowdReport(c.level)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    crowdReport === c.level
                      ? `bg-stone-800 ${c.color} ring-1 ring-amber-400`
                      : 'bg-stone-950/50 border-stone-800 text-stone-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review comment */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Your Review & Insider Tips
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share queue tips, best camera angles, bhog timing, or entrance gates..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Photo Link URL */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Upload / Photo URL Link
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or Cloudinary link"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {photoUrl && (
              <div className="mt-2 h-24 rounded-xl overflow-hidden border border-stone-800">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-700 via-amber-600 to-amber-700 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Check-in & Review
          </button>
        </form>
      </div>
    </div>
  );
};
