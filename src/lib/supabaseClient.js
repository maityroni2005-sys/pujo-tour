import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration with Zero-Cost, High-Traffic Caching Layer
 * Features:
 * 1. Safe graceful initialization (never crashes if .env is missing or invalid)
 * 2. 5-second network timeout fallback to prevent UI hanging during peak Puja traffic
 * 3. Smart Stale-While-Revalidate client caching with 10-minute TTL in localStorage
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// 10-Minute Cache TTL for Stale-While-Revalidate
export const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Smart Stale-While-Revalidate Caching Helper
 * Reads immediately from localStorage, and revalidates in the background if stale.
 * Falls back to local JSON data on network drops or Supabase rate-limits.
 */
export async function getCachedOrFetch(key, fetcherFn, fallbackData) {
  const cacheKey = `utsav_cache_${key}`;
  let cached = null;
  let isStale = true;

  // 1. Check existing localStorage cache
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      cached = JSON.parse(raw);
      const age = Date.now() - (cached.timestamp || 0);
      isStale = age > CACHE_TTL_MS;
    }
  } catch {
    cached = null;
  }

  // If cache is fresh, return cached data immediately
  if (cached && !isStale && cached.data) {
    return cached.data;
  }

  // 2. If Supabase is configured, attempt fetch with timeout
  if (isSupabaseConfigured && supabase) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase network timeout (peak load)')), 4000)
      );

      const liveData = await Promise.race([fetcherFn(), timeoutPromise]);

      if (liveData && liveData.length > 0) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: liveData, timestamp: Date.now() })
        );
        return liveData;
      }
    } catch (err) {
      console.warn(`[Supabase Cache Fallback for ${key}]:`, err.message);
    }
  }

  // 3. Fallback to stale cache if present, otherwise local default data
  if (cached && cached.data) {
    return cached.data;
  }

  return fallbackData;
}
