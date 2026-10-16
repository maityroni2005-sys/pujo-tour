/**
 * Haversine Distance & Route Calculation Helpers
 * Calculates geodesic distance between user's GPS position and Puja pandals.
 */

/**
 * Calculates the great-circle distance between two points on Earth using Haversine formula.
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return null;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Rounded to 1 decimal place
}

/**
 * Formats distance in km or meters for user-friendly display.
 */
export function formatDistance(distanceInKm) {
  if (distanceInKm === null || distanceInKm === undefined || isNaN(distanceInKm)) {
    return null;
  }
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}

/**
 * Builds a direct Google Maps Directions URL with live origin and destination.
 */
export function getGoogleMapsDirUrl(originLat, originLng, destLat, destLng) {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
}
