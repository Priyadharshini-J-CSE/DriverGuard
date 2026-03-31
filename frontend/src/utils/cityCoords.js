// Shared city → coordinates mapping
// Single source of truth — used by DisruptionContext, MapComponent, backend fallback

const CITY_COORDS = {
  // Tamil Nadu
  Madurai:        { lat: 9.9252,  lon: 78.1198 },
  Chennai:        { lat: 13.0827, lon: 80.2707 },
  Coimbatore:     { lat: 11.0168, lon: 76.9558 },
  Trichy:         { lat: 10.7905, lon: 78.7047 },
  Salem:          { lat: 11.6643, lon: 78.1460 },
  Namakkal:       { lat: 11.2194, lon: 78.1674 },
  Tirunelveli:    { lat: 8.7139,  lon: 77.7567 },
  Erode:          { lat: 11.3410, lon: 77.7172 },
  Vellore:        { lat: 12.9165, lon: 79.1325 },
  Thoothukudi:    { lat: 8.7642,  lon: 78.1348 },
  Thanjavur:      { lat: 10.7870, lon: 79.1378 },
  Dindigul:       { lat: 10.3624, lon: 77.9695 },
  Tiruppur:       { lat: 11.1085, lon: 77.3411 },
  Kanchipuram:    { lat: 12.8342, lon: 79.7036 },
  Kumbakonam:     { lat: 10.9617, lon: 79.3788 },
  // Other major cities
  Mumbai:         { lat: 19.0760, lon: 72.8777 },
  Delhi:          { lat: 28.6139, lon: 77.2090 },
  Bangalore:      { lat: 12.9716, lon: 77.5946 },
  Hyderabad:      { lat: 17.3850, lon: 78.4867 },
  Pune:           { lat: 18.5204, lon: 73.8567 },
  Kolkata:        { lat: 22.5726, lon: 88.3639 },
  Ahmedabad:      { lat: 23.0225, lon: 72.5714 },
};

const DEFAULT_CITY   = 'Madurai';
const DEFAULT_COORDS = CITY_COORDS[DEFAULT_CITY];

/**
 * Returns coords for a city name (case-insensitive).
 * Falls back to DEFAULT_COORDS if not found.
 */
const getCoordsForCity = (cityName) => {
  if (!cityName) return DEFAULT_COORDS;
  const key = Object.keys(CITY_COORDS).find(
    (k) => k.toLowerCase() === cityName.toLowerCase()
  );
  return key ? CITY_COORDS[key] : DEFAULT_COORDS;
};

/**
 * Returns the canonical city name (correct casing) or null if not found.
 */
const getCanonicalCity = (cityName) => {
  if (!cityName) return null;
  return Object.keys(CITY_COORDS).find(
    (k) => k.toLowerCase() === cityName.toLowerCase()
  ) ?? null;
};

/** True if city is in the supported list. */
const isCitySupported = (cityName) => getCanonicalCity(cityName) !== null;

export { CITY_COORDS, DEFAULT_CITY, DEFAULT_COORDS, getCoordsForCity, getCanonicalCity, isCitySupported };
