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
    lat: 22.6500,
    lng: 88.3600,
    zoom: 9,
    color: '#F59E0B',
  },
  {
    id: 'north-kol',
    label: 'North Kolkata',
    bengali: 'উত্তর কলকাতা',
    zone: 'North Kolkata',
    lat: 22.6000,
    lng: 88.3700,
    zoom: 14,
    color: '#EF4444',
  },
  {
    id: 'south-kol',
    label: 'South Kolkata',
    bengali: 'দক্ষিণ কলকাতা',
    zone: 'South Kolkata',
    lat: 22.5150,
    lng: 88.3500,
    zoom: 14,
    color: '#F97316',
  },
  {
    id: 'salt-lake',
    label: 'Salt Lake',
    bengali: 'সল্টলেক ও নিউটাউন',
    zone: 'Salt Lake & Newtown',
    lat: 22.5867,
    lng: 88.4171,
    zoom: 14,
    color: '#3B82F6',
  },
  {
    id: 'hooghly-serampore',
    label: 'Hooghly-Serampore Line',
    bengali: 'হুগলি ও শ্রীরামপুর লাইন',
    zone: 'Hooghly-Serampore Line',
    lat: 22.7150,
    lng: 88.3490,
    zoom: 13,
    color: '#8B5CF6',
  },
  {
    id: 'kalyani',
    label: 'Kalyani',
    bengali: 'কল্যাণী',
    zone: 'Kalyani & Districts',
    lat: 22.9750,
    lng: 88.4345,
    zoom: 13,
    color: '#10B981',
  },
];
