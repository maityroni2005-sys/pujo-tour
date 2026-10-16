/**
 * Open-Meteo Hyper-Local Weather Service (100% Free, No API Key Required)
 * Integrates live temperature, humidity, precipitation, and rain warnings.
 * Includes in-memory caching with a 15-minute TTL and graceful offline fallbacks.
 */

// Cache map: key -> { data, timestamp }
const weatherCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Maps WMO Weather Interpretation Codes to human-readable Bengali & English descriptions.
 */
export function interpretWmoWeatherCode(code) {
  if (code === 0) {
    return {
      description: 'Clear Sky • নির্মল আকাশ',
      shortDesc: 'Clear',
      icon: '☀️',
      isRain: false,
    };
  }
  if (code === 1 || code === 2) {
    return {
      description: 'Partly Cloudy • মনোরম রৌদ্রোজ্জ্বল',
      shortDesc: 'Partly Cloudy',
      icon: '⛅',
      isRain: false,
    };
  }
  if (code === 3) {
    return {
      description: 'Overcast • মেঘলা আকাশ',
      shortDesc: 'Overcast',
      icon: '☁️',
      isRain: false,
    };
  }
  if (code >= 45 && code <= 48) {
    return {
      description: 'Foggy • কুয়াশাচ্ছন্ন',
      shortDesc: 'Foggy',
      icon: '🌫️',
      isRain: false,
    };
  }
  if (code >= 51 && code <= 55) {
    return {
      description: 'Light Drizzle • হালকা গুঁড়ি গুঁড়ি বৃষ্টি',
      shortDesc: 'Drizzle',
      icon: '🌦️',
      isRain: true,
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      description: 'Rain Showers • বর্ষণমুখর',
      shortDesc: 'Rain',
      icon: '🌧️',
      isRain: true,
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      description: 'Heavy Rain Showers • ভারী বৃষ্টি',
      shortDesc: 'Heavy Rain',
      icon: '🌧️',
      isRain: true,
    };
  }
  if (code >= 95) {
    return {
      description: 'Thunderstorm • বজ্রবিদ্যুৎ সহ ঝড়-বৃষ্টি',
      shortDesc: 'Thunderstorm',
      icon: '⛈️',
      isRain: true,
    };
  }
  return {
    description: 'Autumn Breeze • আনন্দঘন শরৎ',
    shortDesc: 'Pleasant',
    icon: '🌤️',
    isRain: false,
  };
}

/**
 * Fetches current weather from Open-Meteo for a given latitude & longitude.
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @returns {Promise<Object>} Weather payload
 */
export async function fetchPandalWeather(lat, lng) {
  if (!lat || !lng) {
    return getDefaultAutumnWeather();
  }

  // Rounded coordinate cache key (reduces duplicate API calls for nearby pandals)
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open-Meteo error: ${res.status}`);
    }

    const json = await res.json();
    const current = json.current;

    if (!current) {
      throw new Error('No current weather in response');
    }

    const weatherCode = current.weather_code ?? 1;
    const wmo = interpretWmoWeatherCode(weatherCode);
    const precipitation = current.precipitation ?? 0;
    const isRain = precipitation > 0.1 || wmo.isRain;

    const weatherData = {
      temperature: Math.round(current.temperature_2m ?? 28),
      humidity: Math.round(current.relative_humidity_2m ?? 65),
      precipitation: parseFloat((precipitation).toFixed(1)),
      windSpeed: Math.round(current.wind_speed_10m ?? 8),
      weatherCode,
      shortDesc: wmo.shortDesc,
      description: wmo.description,
      icon: isRain ? '🌧️' : wmo.icon,
      isRain,
      statusBadge: isRain
        ? '🌧️ Rain Alert: Carry an Umbrella!'
        : '☀️ Great Weather for Pandal Hopping',
      statusClass: isRain
        ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
        : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
      timestamp: now,
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: now });
    return weatherData;
  } catch (err) {
    // Graceful offline/network failure fallback with realistic Bengal Sharod weather
    console.warn('Weather fetch fallback:', err.message);
    const fallback = getDefaultAutumnWeather(lat);
    weatherCache.set(cacheKey, { data: fallback, timestamp: now });
    return fallback;
  }
}

/**
 * Realistic autumn weather default in case device is completely offline.
 */
export function getDefaultAutumnWeather(lat = 22.5) {
  // Slight realistic variation for North vs South Bengal
  const isNorthBengal = lat > 25.5;
  const temp = isNorthBengal ? 25 : 29;

  return {
    temperature: temp,
    humidity: 62,
    precipitation: 0.0,
    windSpeed: 8,
    weatherCode: 1,
    shortDesc: 'Clear',
    description: 'Pleasant Autumn Darshan • শরৎকালীন শুভ্র আকাশ',
    icon: '☀️',
    isRain: false,
    statusBadge: '☀️ Great Weather for Pandal Hopping',
    statusClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
    timestamp: Date.now(),
    isFallback: true,
  };
}

/**
 * 1-Click 'Share Weather & Pandal Status with Best Friend' Handler.
 * Supports native Web Share API (mobile) with automatic WhatsApp web/app fallback.
 * Formats message exactly as requested:
 * "🪔 Pujo Live Update! I am checking out [Pandal Name] ([District]). 🌦️ Current Weather here: [Temp]°C, [Weather Condition - Good to visit / Rain warning!]. 👥 Crowd is [Crowd Level]. 📍 Join me here on Google Maps: [Google Maps Link]"
 */
export async function sharePandalWithFriend(pandal, weather = null) {
  if (!pandal) return;

  const temp = weather?.temperature ? `${weather.temperature}` : '28';
  const weatherCondition = weather?.isRain
    ? 'Rain warning! Carry an umbrella'
    : 'Good to visit, pleasant autumn breeze';
  const crowdLevel = (pandal.crowd_status || 'moderate').toUpperCase();
  const mapsLink =
    pandal.google_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      pandal.name + ' ' + (pandal.zone || '')
    )}`;

  const message = `🪔 Pujo Live Update! I am checking out ${pandal.name} (${pandal.zone}). 🌦️ Current Weather here: ${temp}°C, ${weatherCondition}. 👥 Crowd is ${crowdLevel}. 📍 Join me here on Google Maps: ${mapsLink}`;

  // Try Native Web Share API first (Mobile Android/iOS)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Pujo Live Update: ${pandal.name}`,
        text: message,
        url: mapsLink,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, reason: 'cancelled' };
      }
      // If native share failed for another reason, fallback to WhatsApp
    }
  }

  // Fallback to WhatsApp Web / Mobile app URL
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'whatsapp' };
}

/**
 * Shares current location weather status banner with best friends.
 */
export async function shareCurrentLocationWeather(locationName = 'Kolkata', weather = null) {
  const temp = weather?.temperature ? `${weather.temperature}` : '28';
  const condition = weather?.isRain
    ? 'Rain warning! Keep an umbrella handy'
    : 'Clear autumn sky & perfect weather for pandal hopping!';

  const message = `🪔 Pujo Live Update! Current weather at ${locationName}: ${temp}°C, ${condition}. 📍 Plan your Puja hopping route with UtsavHopper: ${window.location.origin}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Pujo Weather Update: ${locationName}`,
        text: message,
        url: window.location.origin,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') return { success: false, reason: 'cancelled' };
    }
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'whatsapp' };
}
