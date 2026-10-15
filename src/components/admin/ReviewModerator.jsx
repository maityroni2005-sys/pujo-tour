import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Camera, ShieldCheck, Eye } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const ReviewModerator = () => {
  const { reviews, pandals, moderateReview, deleteReview } = useAppData();
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredReviews = reviews.filter((r) => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-100 font-display">
            Community Review & Check-in Moderation
          </h3>
          <p className="text-xs text-stone-400">
            Moderate visitor feedback, idol photography, and live crowd tips submitted by devotees.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 p-1 rounded-xl text-xs">
          {['All', 'Approved', 'Pending', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-stone-800 text-stone-400 text-xs">
          No reviews found under the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const pandal = pandals.find((p) => p.id === rev.pandalId);
            return (
              <div
                key={rev.id}
                className="glass-panel p-4 rounded-2xl border border-stone-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-bold text-stone-200 text-sm">
                        {pandal?.name || 'Pandal Review'}
                      </div>
                      <div className="text-xs text-stone-400">
                        By <span className="text-amber-300 font-medium">{rev.userName}</span> ({rev.userRole})
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      rev.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : rev.status === 'pending'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-red-950 text-red-300 border border-red-500/30'
                    }`}>
                      {rev.status}
                    </span>
                  </div>

                  {/* Star Ratings Summary */}
                  <div className="flex items-center gap-3 text-xs text-stone-300 mb-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold">{rev.rating}/5</span>
                    </div>
                    {rev.idolRating && (
                      <span className="text-[11px] text-stone-400">
                        Idol: {rev.idolRating}★
                      </span>
                    )}
                    {rev.lightingRating && (
                      <span className="text-[11px] text-stone-400">
                        Light: {rev.lightingRating}★
                      </span>
                    )}
                    {rev.crowdReport && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                        Reported: {rev.crowdReport.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-300 italic bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80 mb-2">
                    "{rev.comment}"
                  </p>

                  {/* Photo Thumbnail if attached */}
                  {rev.photoUrl && (
                    <div className="relative h-28 rounded-xl overflow-hidden border border-stone-800">
                      <img src={rev.photoUrl} alt="Review attachment" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-stone-950/80 text-[10px] text-stone-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Camera className="w-3 h-3 text-amber-400" />
                        Attached Photo
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderation Action Buttons */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => moderateReview(rev.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/80 font-bold flex items-center gap-1"
                        title="Approve Review"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => moderateReview(rev.id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 hover:text-red-400 border border-stone-800 font-bold flex items-center gap-1"
                        title="Reject / Hide Review"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Permanently delete review?')) {
                          deleteReview(rev.id);
                        }
                      }}
                      className="p-1 rounded-lg bg-stone-900 text-stone-500 hover:text-red-400 border border-stone-800"
                      title="Permanently Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
