import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Layers, 
  Compass, 
  MessageSquare, 
  AlertTriangle, 
  Radio, 
  Lock, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { LiveCrowdControl } from './LiveCrowdControl';
import { PandalManager } from './PandalManager';
import { CuratedTourManager } from './CuratedTourManager';
import { ReviewModerator } from './ReviewModerator';

export const AdminDashboard = ({ onOpenAuthModal }) => {
  const { currentUser, isAdmin, switchDemoRole } = useAuth();
  const { pandals, curatedTours, reviews } = useAppData();

  const [activeTab, setActiveTab] = useState('crowd'); // 'crowd', 'pandals', 'curated', 'reviews'

  // Metric counts
  const totalPandals = pandals.length;
  const heavyCrowdCount = pandals.filter((p) => p.crowd_status === 'heavy').length;
  const blockedCount = pandals.filter((p) => !p.is_route_open).length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;

  // RBAC Access Control Guard
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-panel p-8 rounded-3xl border border-red-500/40 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-500/40 inline-block mb-3">
            Role-Based Access Control (RBAC)
          </span>

          <h2 className="text-2xl font-black text-stone-100 font-display mb-2">
            Restricted Admin Portal
          </h2>
          <p className="text-xs text-stone-300 mb-2">
            You are currently signed in as a regular visitor (<code>role: '{currentUser?.role || 'user'}'</code>).
          </p>
          <p className="text-xs text-stone-400 max-w-md mx-auto mb-6">
            Only accounts flagged with <code>role: 'admin'</code> (Durga Puja Committee & Police Dispatchers) can access live crowd throttles, pandal CRUD management, and review moderation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => switchDemoRole('admin')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-amber-600 hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              Switch to Demo Admin Account (1-Click)
            </button>
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold"
            >
              Log in with Admin Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Security Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Kolkata Puja Control Desk • Admin Active</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-100 font-display">
            Puja Traffic & Content Dashboard
          </h2>
          <p className="text-xs text-stone-400 font-bengali">
            প্যান্ডেল তালিকা নিয়ন্ত্রণ, লাইভ ভিড় ট্র্যাকিং এবং কিউরেটেড রুট প্যাকেজ ব্যবস্থাপনা
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stone-300 font-semibold">{currentUser?.full_name}</span>
            <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded uppercase">
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Top Operational Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-2xl border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Total Pandals</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-stone-100">{totalPandals}</div>
          <span className="text-[10px] text-stone-500">Live in Directory</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Heavy Rush</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-400">{heavyCrowdCount}</div>
          <span className="text-[10px] text-stone-500">Peak wait times</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Barricaded Routes</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{blockedCount}</div>
          <span className="text-[10px] text-stone-500">Police Diversions</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-xs font-semibold">Curated Trails</span>
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-300">{curatedTours.length}</div>
          <span className="text-[10px] text-stone-500">Ready for 1-click clone</span>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="border-b border-stone-800 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('crowd')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'crowd'
              ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-300" />
          Live Crowd & Traffic Control
        </button>

        <button
          onClick={() => setActiveTab('pandals')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'pandals'
              ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Pandal Directory CRUD
        </button>

        <button
          onClick={() => setActiveTab('curated')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'curated'
              ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Curated Route Packages
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap relative ${
            activeTab === 'reviews'
              ? 'bg-gradient-to-r from-red-800 to-amber-700 text-white shadow'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Review Moderation
          {reviews.length > 0 && (
            <span className="ml-1 text-[10px] px-1.5 rounded-full bg-stone-800 text-stone-300 font-bold">
              {reviews.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'crowd' && <LiveCrowdControl />}
        {activeTab === 'pandals' && <PandalManager />}
        {activeTab === 'curated' && <CuratedTourManager />}
        {activeTab === 'reviews' && <ReviewModerator />}
      </div>
    </div>
  );
};
