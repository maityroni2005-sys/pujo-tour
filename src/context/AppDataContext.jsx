import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialPandals } from '../data/initialPandals';
import { initialCuratedTours } from '../data/initialCuratedTours';
import { supabase, isSupabaseConfigured, getCachedOrFetch } from '../lib/supabaseClient';
import { getTodayIST, getISTTimestamp } from '../lib/dateHelpers';
import confetti from 'canvas-confetti';

const AppDataContext = createContext();

const STORAGE_KEYS = {
  PANDALS: 'utsav_pandals_v1',
  ITINERARY: 'utsav_itinerary_v1',
  REVIEWS: 'utsav_reviews_v1',
  CURATED_TOURS: 'utsav_curated_tours_v1',
};

const DEFAULT_ITINERARY = {
  Saptami: [
    { pandalId: 'pandal-1', visited: false, transitMode: 'walk', notes: 'Start at 7 AM for traditional Sabeki Pratima darshan' },
    { pandalId: 'pandal-7', visited: false, transitMode: 'walk', notes: 'Walk to Kumartuli Park clay sculptors' },
    { pandalId: 'pandal-3', visited: false, transitMode: 'metro', notes: 'Evening Golden illumination at Sreebhumi' }
  ],
  Ashtami: [
    { pandalId: 'pandal-2', visited: false, transitMode: 'metro', notes: 'Morning Anjali at Chetla Agrani' },
    { pandalId: 'pandal-4', visited: false, transitMode: 'auto', notes: 'Suruchi Sangha Dhunuchi naach contest at dusk' },
    { pandalId: 'pandal-10', visited: false, transitMode: 'walk', notes: 'Mudiali eco-art serene pavilion' }
  ],
  Navami: [
    { pandalId: 'pandal-6', visited: false, transitMode: 'metro', notes: 'Afternoon family walk in Salt Lake FD Block' },
    { pandalId: 'pandal-12', visited: false, transitMode: 'walk', notes: 'BJ Block folk baul music session' },
    { pandalId: 'pandal-8', visited: false, transitMode: 'metro', notes: 'Late night laser spectacle at Santosh Mitra Square' }
  ],
  Dashami: [
    { pandalId: 'pandal-11', visited: false, transitMode: 'metro', notes: 'College Square lake reflections & Sindoor Khela' },
    { pandalId: 'pandal-5', visited: false, transitMode: 'cab', notes: 'Ekdalia Evergreen farewell darshan' }
  ]
};

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    pandalId: 'pandal-1',
    userName: 'Debolina Roy',
    userRole: 'Verified Visitor',
    rating: 5,
    idolRating: 5,
    lightingRating: 5,
    crowdReport: 'moderate',
    comment: 'The quintessential traditional sabeki ekchala idol. Standing in front of the Bagbazar deity early morning gives pure goosebumps!',
    photoUrl: 'https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    createdAt: getTodayIST() + 'T18:30:00+05:30'
  },
  {
    id: 'rev-2',
    pandalId: 'pandal-2',
    userName: 'Subhajit Banerjee',
    userRole: 'Heritage Walker',
    rating: 5,
    idolRating: 5,
    lightingRating: 4,
    crowdReport: 'low',
    comment: 'Chetla Agrani has outdone themselves. Terracotta works and village architecture took my breath away.',
    photoUrl: 'https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    createdAt: getTodayIST() + 'T19:15:00+05:30'
  },
  {
    id: 'rev-3',
    pandalId: 'pandal-3',
    userName: 'Priyanka Sen',
    userRole: 'VIP Pass Holder',
    rating: 4,
    idolRating: 5,
    lightingRating: 5,
    crowdReport: 'heavy',
    comment: 'Huge crowd but Chandannagar lighting is world class. Definitely get the VIP pass if traveling with senior citizens.',
    photoUrl: 'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    createdAt: getTodayIST() + 'T19:45:00+05:30'
  }
];

export const AppDataProvider = ({ children }) => {
  // 1. Network Status (Offline PWA detection)
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Pandals state
  const [pandals, setPandals] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PANDALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialPandals;
      }
    }
    return initialPandals;
  });

  // Sync pandals to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PANDALS, JSON.stringify(pandals));
  }, [pandals]);

  // 3. User Itinerary state
  const [itinerary, setItinerary] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITINERARY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ITINERARY;
      }
    }
    return DEFAULT_ITINERARY;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(itinerary));
  }, [itinerary]);

  // 4. Curated Tours state
  const [curatedTours, setCuratedTours] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURATED_TOURS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCuratedTours;
      }
    }
    return initialCuratedTours;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURATED_TOURS, JSON.stringify(curatedTours));
  }, [curatedTours]);

  // 5. Reviews state
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  // 6. Supabase Real-time Sync with Stale-While-Revalidate Caching (10-min TTL)
  useEffect(() => {
    // Immediate Stale-While-Revalidate load
    const loadPandalsWithCache = async () => {
      const data = await getCachedOrFetch(
        'pandals',
        async () => {
          if (!supabase) return null;
          const { data, error } = await supabase.from('pandals').select('*');
          if (error) throw error;
          return data;
        },
        initialPandals
      );
      if (data && data.length > 0) {
        setPandals(data);
      }
    };
    loadPandalsWithCache();

    if (!isSupabaseConfigured || !supabase) return;

    // Subscribe to live crowd status updates
    const channel = supabase
      .channel('public:pandals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pandals' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setPandals((prev) =>
              prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
            );
          } else if (payload.eventType === 'INSERT') {
            setPandals((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setPandals((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ==========================================
  // PANDAL ACTIONS (User & Admin)
  // ==========================================
  const addPandal = (newPandal) => {
    const pandalWithId = {
      ...newPandal,
      id: newPandal.id || `pandal-${Date.now()}`,
      avg_rating: 5.0,
      review_count: 0,
      created_at: getTodayIST() + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }) + '+05:30',
    };
    setPandals((prev) => [pandalWithId, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('pandals').insert([pandalWithId]).catch(console.error);
    }
  };

  const updatePandal = (id, updatedFields) => {
    setPandals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from('pandals').update(updatedFields).eq('id', id).catch(console.error);
    }
  };

  const deletePandal = (id) => {
    setPandals((prev) => prev.filter((p) => p.id !== id));
    // Also remove from all itineraries
    setItinerary((prev) => {
      const updated = {};
      Object.keys(prev).forEach((day) => {
        updated[day] = prev[day].filter((item) => item.pandalId !== id);
      });
      return updated;
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from('pandals').delete().eq('id', id).catch(console.error);
    }
  };

  // Quick One-Tap Live Crowd update for Admins
  const updateCrowdStatus = (id, newStatus) => {
    updatePandal(id, { crowd_status: newStatus });
  };

  // Quick One-Tap Route Blockage / Traffic update for Admins
  const toggleRouteStatus = (id) => {
    const current = pandals.find((p) => p.id === id);
    if (!current) return;
    const isNowOpen = !current.is_route_open;
    updatePandal(id, {
      is_route_open: isNowOpen,
      traffic_notes: isNowOpen ? 'Route open. Traffic moving normally.' : 'Temporarily blocked for pedestrian safety by Kolkata Police.',
      crowd_status: isNowOpen ? 'moderate' : 'blocked'
    });
  };

  // ==========================================
  // ITINERARY ACTIONS (Custom Trip & Group Planner)
  // ==========================================
  const addToItinerary = (day, pandalId, customNotes = '') => {
    setItinerary((prev) => {
      const dayList = prev[day] || [];
      if (dayList.some((item) => item.pandalId === pandalId)) {
        return prev; // already added
      }
      return {
        ...prev,
        [day]: [
          ...dayList,
          {
            pandalId,
            visited: false,
            transitMode: 'walk',
            notes: customNotes || 'Added to puja route'
          }
        ]
      };
    });
  };

  const removeFromItinerary = (day, pandalId) => {
    setItinerary((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((item) => item.pandalId !== pandalId)
    }));
  };

  // Check-in toggle with festive celebration
  const toggleVisited = (day, pandalId) => {
    setItinerary((prev) => {
      const dayList = prev[day] || [];
      let justMarkedVisited = false;
      const updated = dayList.map((item) => {
        if (item.pandalId === pandalId) {
          const nextVal = !item.visited;
          if (nextVal) justMarkedVisited = true;
          return { ...item, visited: nextVal };
        }
        return item;
      });

      if (justMarkedVisited) {
        // Trigger festive firecracker confetti celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#C8102E', '#FDE68A', '#FFFFFF']
        });
      }

      return { ...prev, [day]: updated };
    });
  };

  const moveItemInItinerary = (day, fromIndex, direction) => {
    setItinerary((prev) => {
      const dayList = [...(prev[day] || [])];
      const targetIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
      if (targetIndex < 0 || targetIndex >= dayList.length) return prev;

      const [movedItem] = dayList.splice(fromIndex, 1);
      dayList.splice(targetIndex, 0, movedItem);

      return { ...prev, [day]: dayList };
    });
  };

  const updateItemNotes = (day, pandalId, notes, transitMode) => {
    setItinerary((prev) => {
      const dayList = (prev[day] || []).map((item) => {
        if (item.pandalId === pandalId) {
          return {
            ...item,
            notes: notes !== undefined ? notes : item.notes,
            transitMode: transitMode !== undefined ? transitMode : item.transitMode
          };
        }
        return item;
      });
      return { ...prev, [day]: dayList };
    });
  };

  // Clone pre-made curated tour package with one-click
  const cloneCuratedTour = (tourId, targetDay = 'Saptami') => {
    const tour = curatedTours.find((t) => t.id === tourId);
    if (!tour) return;

    setItinerary((prev) => {
      const currentDayItems = prev[targetDay] || [];
      const newItems = [...currentDayItems];

      tour.pandal_ids.forEach((pid) => {
        if (!newItems.some((item) => item.pandalId === pid)) {
          newItems.push({
            pandalId: pid,
            visited: false,
            transitMode: 'walk',
            notes: `Cloned from "${tour.title}"`
          });
        }
      });

      // Celebration confetti
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#C8102E', '#3B82F6']
      });

      return {
        ...prev,
        [targetDay]: newItems
      };
    });
  };

  const clearDayItinerary = (day) => {
    setItinerary((prev) => ({
      ...prev,
      [day]: []
    }));
  };

  // Generate shareable base64 code / URL param
  const generateShareData = (day) => {
    const items = itinerary[day] || [];
    const payload = {
      d: day,
      p: items.map((i) => ({ id: i.pandalId, m: i.transitMode, n: i.notes })),
      t: Date.now()
    };
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
      return {
        code: `UTSAV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        shareUrl: `${window.location.origin}?plan=${encoded}`,
        encoded
      };
    } catch {
      return { code: 'UTSAV-PUJA', shareUrl: window.location.href };
    }
  };

  // ==========================================
  // REVIEWS & CHECK-IN ACTIONS
  // ==========================================
  const addReview = (reviewData) => {
    const newRev = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: 'approved',
      createdAt: getTodayIST() + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }) + '+05:30'
    };
    setReviews((prev) => [newRev, ...prev]);

    // Recalculate pandal avg rating
    const pandalRevs = [...reviews.filter((r) => r.pandalId === reviewData.pandalId), newRev];
    const avg = (
      pandalRevs.reduce((acc, r) => acc + Number(r.rating || 5), 0) / pandalRevs.length
    ).toFixed(1);
    updatePandal(reviewData.pandalId, {
      avg_rating: Number(avg),
      review_count: pandalRevs.length
    });

    if (isSupabaseConfigured && supabase) {
      supabase.from('reviews').insert([newRev]).catch(console.error);
    }
  };

  const moderateReview = (reviewId, newStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
    );
  };

  const deleteReview = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  // ==========================================
  // CURATED TOURS (Admin Manager)
  // ==========================================
  const addCuratedTour = (newTour) => {
    const tourWithId = {
      ...newTour,
      id: `tour-${Date.now()}`,
      created_at: getTodayIST() + 'T' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }) + '+05:30'
    };
    setCuratedTours((prev) => [tourWithId, ...prev]);
  };

  const deleteCuratedTour = (tourId) => {
    setCuratedTours((prev) => prev.filter((t) => t.id !== tourId));
  };

  return (
    <AppDataContext.Provider
      value={{
        isOnline,
        pandals,
        itinerary,
        curatedTours,
        reviews,
        // Pandal operations
        addPandal,
        updatePandal,
        deletePandal,
        updateCrowdStatus,
        toggleRouteStatus,
        // Itinerary operations
        addToItinerary,
        removeFromItinerary,
        toggleVisited,
        moveItemInItinerary,
        updateItemNotes,
        cloneCuratedTour,
        clearDayItinerary,
        generateShareData,
        // Review operations
        addReview,
        moderateReview,
        deleteReview,
        // Tour operations
        addCuratedTour,
        deleteCuratedTour
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
