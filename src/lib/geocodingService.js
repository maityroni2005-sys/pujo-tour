/**
 * OpenStreetMap Nominatim Geocoding Service & West Bengal District Presets
 * Allows users to search any town, village, or district across West Bengal.
 * Falls back to OpenStreetMap Nominatim Geocoding API.
 */

// Instant Local Presets for West Bengal Districts & Hubs (Zero Latency)
export const WB_DISTRICT_PRESETS = [
  {
    id: 'contai',
    names: ['contai', 'kanthi', 'purba medinipur', 'east medinipur', 'digha'],
    displayName: 'Contai / Purba Medinipur (কাঁথি)',
    zone: 'Contai / Purba Medinipur',
    lat: 21.7812,
    lng: 87.7523,
    zoom: 13,
  },
  {
    id: 'u24p',
    names: ['barasat', 'madhyamgram', 'naihati', 'uttar 24 parganas', 'north 24 parganas', 'dum dum'],
    displayName: 'Uttar 24 Parganas (Barasat / Madhyamgram / Naihati)',
    zone: 'Uttar 24 Parganas',
    lat: 22.723,
    lng: 88.482,
    zoom: 13,
  },
  {
    id: 'north-kol',
    names: ['north kolkata', 'shyambazar', 'bagbazar', 'sovabazar', 'kumartuli', 'hatibagan'],
    displayName: 'North Kolkata (উত্তর কলকাতা)',
    zone: 'North Kolkata',
    lat: 22.6,
    lng: 88.37,
    zoom: 14,
  },
  {
    id: 'south-kol',
    names: ['south kolkata', 'chetla', 'kalighat', 'alipore', 'gariahat', 'ballygunge', 'tollygunge'],
    displayName: 'South Kolkata (দক্ষিণ কলকাতা)',
    zone: 'South Kolkata',
    lat: 22.515,
    lng: 88.35,
    zoom: 14,
  },
  {
    id: 'salt-lake',
    names: ['salt lake', 'saltlake', 'newtown', 'new town', 'bidhannagar', 'sector v'],
    displayName: 'Salt Lake & Newtown (সল্টলেক)',
    zone: 'Salt Lake & Newtown',
    lat: 22.5867,
    lng: 88.4171,
    zoom: 14,
  },
  {
    id: 'hooghly',
    names: ['hooghly', 'serampore', 'sreerampur', 'rishra', 'konnagar', 'hind motor', 'hindmotor', 'uttarpara', 'chandannagar', 'chandan nagar', 'bandel'],
    displayName: 'Hooghly (Serampore, Rishra, Konnagar, Hind Motor, Uttarpara, Chandannagar)',
    zone: 'Hooghly-Serampore Line',
    lat: 22.715,
    lng: 88.349,
    zoom: 13,
  },
  {
    id: 'kalyani',
    names: ['kalyani', 'nadia', 'ranaghat', 'krishnanagar'],
    displayName: 'Kalyani & Nadia (কল্যাণী)',
    zone: 'Kalyani & Nadia',
    lat: 22.975,
    lng: 88.4345,
    zoom: 13,
  },
  {
    id: 'howrah',
    names: ['howrah', 'shibpur', 'salkia', 'belur', 'bally', 'santragachi'],
    displayName: 'Central & Howrah (হাওড়া)',
    zone: 'Central & Howrah',
    lat: 22.6,
    lng: 88.32,
    zoom: 13,
  },
  {
    id: 'durgapur',
    names: ['durgapur', 'paschim bardhaman', 'asansol', 'raniganj', 'bardhaman'],
    displayName: 'Durgapur (Paschim Bardhaman)',
    zone: 'Durgapur (Paschim Bardhaman)',
    lat: 23.535,
    lng: 87.312,
    zoom: 13,
  },
  {
    id: 'siliguri',
    names: ['siliguri', 'darjeeling', 'jalpaiguri', 'north bengal'],
    displayName: 'Siliguri (North Bengal)',
    zone: 'Siliguri (North Bengal)',
    lat: 26.716,
    lng: 88.428,
    zoom: 13,
  },
];

/**
 * Searches for a location in West Bengal:
 * 1. Fast match against known district presets
 * 2. Fallback to OpenStreetMap Nominatim Geocoding API
 * 
 * @param {string} query Search input string
 * @returns {Promise<{ found: boolean, lat: number, lng: number, displayName: string, zoom: number, zone?: string } | null>}
 */
export async function geocodeWestBengalQuery(query) {
  if (!query || typeof query !== 'string') return null;
  const cleanQ = query.trim().toLowerCase();
  if (cleanQ.length < 2) return null;

  // 1. Instant check against presets
  for (const preset of WB_DISTRICT_PRESETS) {
    if (preset.names.some((name) => cleanQ.includes(name) || name.includes(cleanQ))) {
      return {
        found: true,
        lat: preset.lat,
        lng: preset.lng,
        zoom: preset.zoom,
        displayName: preset.displayName,
        zone: preset.zone,
        isPreset: true,
      };
    }
  }

  // 2. OpenStreetMap Nominatim Geocoding Fallback
  try {
    const encoded = encodeURIComponent(cleanQ);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}+West+Bengal&countrycodes=in&limit=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Nominatim returned ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const top = data[0];
      const lat = parseFloat(top.lat);
      const lng = parseFloat(top.lon);

      if (!isNaN(lat) && !isNaN(lng)) {
        return {
          found: true,
          lat,
          lng,
          zoom: 13,
          displayName: top.display_name?.split(',').slice(0, 3).join(', ') || query,
          isPreset: false,
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding failed, falling back:', err.message);
  }

  return null;
}
