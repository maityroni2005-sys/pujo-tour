import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Flame, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  User, 
  LogOut, 
  Menu, 
  X,
  Share2,
  Route,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  onOpenAuthModal, 
  onOpenShareModal,
  isDarkMode = true,
  onToggleTheme 
}) => {
  const { currentUser, isAdmin, switchDemoRole } = useAuth();
  const { isOnline, itinerary } = useAppData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Total pandals in current itinerary
  const totalPlannedPandals = Object.values(itinerary).reduce(
    (sum, dayItems) => sum + dayItems.length,
    0
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/95 dark:bg-slate-900/95 border-b border-amber-500/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Trinetra Motif */}
          <div 
            onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 via-amber-500 to-amber-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                <img 
                  src="/pandal-icon.svg" 
                  alt="UtsavHopper Logo" 
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-rose-400 bg-clip-text text-transparent font-display">
                  UtsavHopper
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-950 text-amber-300 border border-rose-500/40">
                  PWA
                </span>
              </div>
              <p className="text-[11px] font-bengali text-amber-300/80 -mt-0.5 tracking-wide">
                স্মার্ট পূজা পরিক্রমা ও ট্রিপ প্ল্যানার
              </p>
            </div>
          </div>

          {/* Desktop Navigation: 4 Large Touch Targets */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            {/* 1. Explore */}
            <button
              onClick={() => setActiveTab('explore')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Explore</span>
            </button>

            {/* 2. My Route */}
            <button
              onClick={() => setActiveTab('route')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative cursor-pointer ${
                activeTab === 'route'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Route className="w-4 h-4 text-amber-400" />
              <span>My Route</span>
              {totalPlannedPandals > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  {totalPlannedPandals}
                </span>
              )}
            </button>

            {/* 3. Live Crowd */}
            <button
              onClick={() => setActiveTab('crowd')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'crowd'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Live Crowd</span>
            </button>

            {/* 4. Profile/Admin */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : isAdmin
                  ? 'text-amber-400 hover:bg-amber-950/40 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Profile / Admin</span>
              {isAdmin && (
                <span className="text-[9px] px-1 bg-amber-400 text-slate-950 font-black rounded uppercase">
                  Admin
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle (Dark / Light) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center cursor-pointer"
                title={isDarkMode ? 'Switch to Crisp Alabaster (Light Mode)' : 'Switch to Deep Obsidian Slate (Dark Mode)'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Offline PWA Badge */}
            <div 
              title={isOnline ? "Connected to live network" : "Offline mode active: Cached itinerary & maps accessible without network"}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                isOnline 
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                  : 'bg-amber-500 text-slate-950 border-amber-400 font-black animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px]">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-slate-950" />
                  <span className="text-[11px]">Offline PWA</span>
                </>
              )}
            </div>

            {/* Quick RBAC Role Switcher Toggle for instant developer/evaluator testing */}
            <div className="hidden lg:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px]">
              <button
                onClick={() => switchDemoRole('user')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  !isAdmin 
                    ? 'bg-slate-800 text-white font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to regular visitor role"
              >
                Visitor
              </button>
              <button
                onClick={() => {
                  switchDemoRole('admin');
                  setActiveTab('admin');
                }}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isAdmin 
                    ? 'bg-amber-500 text-slate-950 font-black' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Admin role with live crowd control & CRUD"
              >
                <ShieldCheck className="w-3 h-3" />
                Admin
              </button>
            </div>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenShareModal}
                  className="hidden sm:flex p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Share Itinerary"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <div 
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-2 cursor-pointer bg-slate-800 border border-slate-700 hover:border-amber-500/50 px-2.5 py-1.5 rounded-xl transition-all"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full object-cover border border-amber-500/40"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white truncate max-w-[90px]">
                      {currentUser.full_name?.split(' ')[0]}
                    </p>
                    <span className={`text-[9px] block uppercase font-black ${isAdmin ? 'text-amber-400' : 'text-slate-400'}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-h-[48px] min-w-[48px] p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current Role:</span>
              <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-300'}`}>
                {currentUser?.role || 'Guest'}
              </span>
            </div>
            <button
              onClick={() => { switchDemoRole(isAdmin ? 'user' : 'admin'); }}
              className="text-xs font-bold text-amber-400 underline cursor-pointer"
            >
              Switch to {isAdmin ? 'Visitor' : 'Admin'}
            </button>
          </div>

          <button
            onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
            className={`min-h-[48px] w-full text-left px-3 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'explore' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-amber-400" />
              Explore Pandals
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('route'); setMobileMenuOpen(false); }}
            className={`min-h-[48px] w-full text-left px-3 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'route' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <Route className="w-5 h-5 text-amber-400" />
              My Puja Parikrama Route
            </span>
            {totalPlannedPandals > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                {totalPlannedPandals}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('crowd'); setMobileMenuOpen(false); }}
            className={`min-h-[48px] w-full text-left px-3 py-3 rounded-xl text-sm font-bold flex items-center justify-between ${
              activeTab === 'crowd' ? 'bg-rose-600 text-white' : 'text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
              Live Crowd Radar
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
            className={`min-h-[48px] w-full text-left px-3 py-3 rounded-xl text-sm font-bold flex items-center justify-between border ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'border-amber-500/30 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Profile / Admin Portal
            </span>
            <span className="text-[10px] uppercase font-black">
              {isAdmin ? 'Admin' : 'Visitor'}
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
