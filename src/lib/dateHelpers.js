/**
 * UtsavRoute IST Date & Time Helpers
 * All dates are computed in Indian Standard Time (Asia/Kolkata) to avoid
 * UTC-offset bugs — users can plan trips starting from TODAY's local IST date.
 */

/**
 * Returns today's date string in YYYY-MM-DD format in IST timezone.
 * This is the canonical "today" used throughout the app for date pickers,
 * itinerary defaults, and review timestamps.
 */
export const getTodayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/**
 * Returns a localized IST timestamp string for database records.
 */
export const getISTTimestamp = () =>
  new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });

/**
 * Returns a Date object representing NOW in IST (as a local Date).
 */
export const getISTDate = () => {
  const now = new Date();
  // Build an IST-local string, then parse it back
  const parts = now.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return new Date(parts);
};

/**
 * Formats a YYYY-MM-DD string to a friendly display like "Oct 15" in IST.
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00+05:30'); // force IST parse
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
};

/**
 * Returns an array of 4 consecutive IST date strings starting from today.
 * Used to map Puja days (Saptami, Ashtami, Navami, Dashami) starting TODAY.
 */
export const getPujaDayDates = () => {
  const today = getTodayIST(); // "YYYY-MM-DD"
  const base = new Date(today + 'T00:00:00+05:30');
  return [0, 1, 2, 3].map((offset) => {
    const d = new Date(base);
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  });
};

/**
 * West Bengal region quick-zoom presets for the interactive map.
 */
export const WB_MAP_REGIONS = [
  {
    id: 'wb',
    label: 'West Bengal',
    bengali: 'পশ্চিমবঙ্গ',
    zone: 'All',
    lat: 22.65,
    lng: 88.36,
    zoom: 8,
    color: '#F59E0B',
  },
  {
    id: 'contai',
    label: 'Contai / Purba Medinipur',
    bengali: 'কাঁথি ও পূর্ব মেদিনীপুর',
    zone: 'Contai / Purba Medinipur',
    lat: 21.7812,
    lng: 87.7523,
    zoom: 13,
    color: '#10B981',
  },
  {
    id: 'u24p',
    label: 'Uttar 24 Parganas (Barasat/Madhyamgram)',
    bengali: 'উত্তর ২৪ পরগনা (বারাসাত/নৈহাটি)',
    zone: 'Uttar 24 Parganas',
    lat: 22.723,
    lng: 88.482,
    zoom: 13,
    color: '#3B82F6',
  },
  {
    id: 'north-kol',
    label: 'North Kolkata',
    bengali: 'উত্তর কলকাতা',
    zone: 'North Kolkata',
    lat: 22.6,
    lng: 88.37,
    zoom: 14,
    color: '#EF4444',
  },
  {
    id: 'south-kol',
    label: 'South Kolkata',
    bengali: 'দক্ষিণ কলকাতা',
    zone: 'South Kolkata',
    lat: 22.515,
    lng: 88.35,
    zoom: 14,
    color: '#F97316',
  },
  {
    id: 'salt-lake',
    label: 'Salt Lake & Newtown',
    bengali: 'সল্টলেক ও নিউটাউন',
    zone: 'Salt Lake & Newtown',
    lat: 22.5867,
    lng: 88.4171,
    zoom: 14,
    color: '#06B6D4',
  },
  {
    id: 'hooghly-serampore',
    label: 'Hooghly Line (Serampore/Rishra/Chandannagar)',
    bengali: 'হুগলি ও শ্রীরামপুর লাইন',
    zone: 'Hooghly-Serampore Line',
    lat: 22.715,
    lng: 88.349,
    zoom: 13,
    color: '#8B5CF6',
  },
  {
    id: 'kalyani',
    label: 'Kalyani & Nadia',
    bengali: 'কল্যাণী ও নদীয়া',
    zone: 'Kalyani & Nadia',
    lat: 22.975,
    lng: 88.4345,
    zoom: 13,
    color: '#EC4899',
  },
  {
    id: 'howrah',
    label: 'Central & Howrah',
    bengali: 'হাওড়া ও মধ্য কলকাতা',
    zone: 'Central & Howrah',
    lat: 22.6,
    lng: 88.32,
    zoom: 13,
    color: '#EAB308',
  },
  {
    id: 'durgapur',
    label: 'Durgapur (Paschim Bardhaman)',
    bengali: 'দুর্গাপুর',
    zone: 'Durgapur (Paschim Bardhaman)',
    lat: 23.535,
    lng: 87.312,
    zoom: 13,
    color: '#14B8A6',
  },
  {
    id: 'siliguri',
    label: 'Siliguri (North Bengal)',
    bengali: 'শিলিগুড়ি',
    zone: 'Siliguri (North Bengal)',
    lat: 26.716,
    lng: 88.428,
    zoom: 13,
    color: '#6366F1',
  },
];

