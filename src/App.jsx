import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ZoneRouteExplorer } from './components/ZoneRouteExplorer';
import { ItineraryBuilder } from './components/ItineraryBuilder';
import { LiveCrowdTracker } from './components/LiveCrowdTracker';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CheckInModal } from './components/CheckInModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { useAppData } from './context/AppDataContext';
import { useAuth } from './context/AuthContext';
import { 
  Compass, 
  Route, 
  Flame, 
  ShieldCheck, 
  Download, 
  WifiOff, 
  Sparkles, 
  Heart,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // 4 Primary Navigation Tabs: 'explore', 'route', 'crowd', 'admin'
  const [activeTab, setActiveTab] = useState('explore'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [flyToTarget, setFlyToTarget] = useState(null);
  const [flyTrigger, setFlyTrigger] = useState(0);

  // Theme State: Dark Mode (Obsidian Slate #0F172A) vs Light Mode (Crisp Alabaster #F8FAFC)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('utsav_theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('utsav_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('utsav_theme', 'light');
    }
  }, [isDarkMode]);

  // Smooth map camera fly trigger
  const handleSearchSubmit = (query, geocodedCoords = null) => {
    setSearchQuery(query);
    if (geocodedCoords && geocodedCoords.lat && geocodedCoords.lng) {
      setFlyToTarget({
        lat: geocodedCoords.lat,
        lng: geocodedCoords.lng,
        zoom: geocodedCoords.zoom || 14,
        timestamp: Date.now(),
      });
    }
    setFlyTrigger((prev) => prev + 1);
  };

  const handleSelectHub = (hub) => {
    if (hub.zone) {
      setSelectedZone(hub.zone);
    }
    setFlyToTarget({
      lat: hub.lat,
      lng: hub.lng,
      zoom: hub.zoom,
      timestamp: Date.now(),
    });
  };

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [checkInPandal, setCheckInPandal] = useState(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const { isOnline, itinerary } = useAppData();
  const { isAdmin } = useAuth();

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // Check URL parameters for shared plan on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(planParam)));
        if (decoded?.d) {
          setActiveTab('route');
        }
      } catch (err) {
        console.warn('Invalid shared plan URL:', err);
      }
    }
  }, []);

  // Total items planned across all days
  const totalPlannedPandals = Object.values(itinerary).reduce(
    (sum, dayItems) => sum + dayItems.length,
    0
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-20 md:pb-0 transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#0F172A] text-slate-100 selection:bg-amber-500 selection:text-slate-950' 
        : 'bg-[#F8FAFC] text-slate-900 selection:bg-rose-500 selection:text-white'
    }`}>
      {/* High-Contrast Offline Banner when connection drops */}
      {!isOnline && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2.5 text-center text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg z-50 border-b-2 border-amber-500">
          <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
          <span>Offline Mode: Showing your saved Puja itinerary.</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenShareModal={() => setShareModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Hero Banner (visible on Explore tab) */}
      {activeTab === 'explore' && (
        <HeroBanner
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
          onSearchSubmit={handleSearchSubmit}
          onSelectHub={handleSelectHub}
          onPlanNowClick={() => setActiveTab('route')}
        />
      )}

      {/* Install PWA Prompt Banner if available */}
      {isInstallable && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Download className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-amber-200">
                  Install UtsavHopper on your Mobile Home Screen
                </h4>
                <p className="text-[11px] text-slate-300">
                  Instant offline access to pandal maps, crowd heatmaps & your saved day route.
                </p>
              </div>
            </div>
            <button
              onClick={handleInstallPWA}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              Install PWA
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Tab 1: Explore */}
        {activeTab === 'explore' && (
          <ZoneRouteExplorer
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            flyToTarget={flyToTarget}
            flyTrigger={flyTrigger}
            onSearchSubmit={handleSearchSubmit}
            onSelectHub={handleSelectHub}
            onOpenCheckInModal={(pandal) => setCheckInPandal(pandal)}
          />
        )}

        {/* Tab 2: My Route */}
        {activeTab === 'route' && (
          <ItineraryBuilder
            onOpenShareModal={() => setShareModalOpen(true)}
            onOpenCheckInModal={(pandal) => setCheckInPandal(pandal)}
          />
        )}

        {/* Tab 3: Live Crowd */}
        {activeTab === 'crowd' && (
          <LiveCrowdTracker
            onNavigateToRoute={() => setActiveTab('route')}
          />
        )}

        {/* Tab 4: Profile / Admin */}
        {activeTab === 'admin' && (
          <AdminDashboard
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      {checkInPandal && (
        <CheckInModal
          pandal={checkInPandal}
          onClose={() => setCheckInPandal(null)}
        />
      )}

      {shareModalOpen && (
        <ShareModal
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* Mobile-First Sticky Bottom Navigation Bar (WCAG AAA: Min 48px Tap Targets) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 dark:bg-slate-900/98 backdrop-blur-2xl border-t-2 border-amber-500/30 px-3 py-1.5 flex items-center justify-around shadow-2xl">
        {/* 1. Explore */}
        <button
          onClick={() => setActiveTab('explore')}
          className={`min-h-[48px] min-w-[48px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'explore' 
              ? 'text-rose-400 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Explore Pandals"
        >
          <Compass className={`w-5 h-5 mb-0.5 ${activeTab === 'explore' ? 'text-rose-400 stroke-[2.5]' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold">Explore</span>
        </button>

        {/* 2. My Route */}
        <button
          onClick={() => setActiveTab('route')}
          className={`min-h-[48px] min-w-[48px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl relative transition-colors cursor-pointer ${
            activeTab === 'route' 
              ? 'text-rose-400 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="My Puja Route"
        >
          <Route className={`w-5 h-5 mb-0.5 ${activeTab === 'route' ? 'text-rose-400 stroke-[2.5]' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold">My Route</span>
          {totalPlannedPandals > 0 && (
            <span className="absolute top-1 right-3 sm:right-6 w-4 h-4 bg-amber-500 text-slate-950 font-black rounded-full text-[10px] flex items-center justify-center shadow">
              {totalPlannedPandals}
            </span>
          )}
        </button>

        {/* 3. Live Crowd */}
        <button
          onClick={() => setActiveTab('crowd')}
          className={`min-h-[48px] min-w-[48px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'crowd' 
              ? 'text-rose-400 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Live Crowd Heatmap"
        >
          <Flame className={`w-5 h-5 mb-0.5 ${activeTab === 'crowd' ? 'text-rose-400 animate-pulse stroke-[2.5]' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold">Live Crowd</span>
        </button>

        {/* 4. Profile / Admin */}
        <button
          onClick={() => setActiveTab('admin')}
          className={`min-h-[48px] min-w-[48px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'admin' 
              ? 'text-amber-400 font-black' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Profile and Admin Dashboard"
        >
          <ShieldCheck className={`w-5 h-5 mb-0.5 ${activeTab === 'admin' ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold">{isAdmin ? 'Admin' : 'Profile'}</span>
        </button>
      </div>

      {/* Cultural Footer */}
      <footer className="border-t border-amber-500/20 bg-slate-950 pt-10 pb-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/pandal-icon.svg" alt="UtsavHopper Logo" className="w-9 h-9" />
            <div>
              <p className="font-black text-slate-200 font-display text-sm tracking-wide">
                UtsavHopper • উৎসবহপার
              </p>
              <p className="text-[11px] text-slate-400 font-bengali">
                বাঙালির শ্রেষ্ঠ দুর্গোৎসবের স্মার্ট ডিজিটাল পরিক্রমা সঙ্গী
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
            <span>Production Zero-Cost Stack:</span>
            <span className="text-amber-400 font-bold">React (Vite)</span>
            <span className="text-amber-400 font-bold">Tailwind CSS</span>
            <span className="text-amber-400 font-bold">Supabase PostgreSQL</span>
            <span className="text-amber-400 font-bold">OpenStreetMap Tiles</span>
            <span className="text-amber-400 font-bold">Offline PWA</span>
          </div>

          <div className="text-slate-400 text-[11px] text-center md:text-right">
            <span>© 2026 UtsavHopper. Crafted with </span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            <span> for Kolkata Sharodutsav.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
