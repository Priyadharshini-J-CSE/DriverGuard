const { getWeather } = require('../services/weatherService');
const { getAQI }     = require('../services/aqiService');
const { getTraffic } = require('../services/trafficService');
const { analyzeRisk } = require('../services/riskEngine');

// City coordinates — mirrors frontend cityCoords.js
const CITY_COORDS = {
  Madurai:     { lat: 9.9252,  lon: 78.1198 },
  Chennai:     { lat: 13.0827, lon: 80.2707 },
  Coimbatore:  { lat: 11.0168, lon: 76.9558 },
  Trichy:      { lat: 10.7905, lon: 78.7047 },
  Salem:       { lat: 11.6643, lon: 78.1460 },
  Namakkal:    { lat: 11.2194, lon: 78.1674 },
  Tirunelveli: { lat: 8.7139,  lon: 77.7567 },
  Erode:       { lat: 11.3410, lon: 77.7172 },
  Thanjavur:   { lat: 10.7870, lon: 79.1378 },
  Dindigul:    { lat: 10.3624, lon: 77.9695 },
  Tiruppur:    { lat: 11.1085, lon: 77.3411 },
  Mumbai:      { lat: 19.0760, lon: 72.8777 },
  Delhi:       { lat: 28.6139, lon: 77.2090 },
  Bangalore:   { lat: 12.9716, lon: 77.5946 },
};

const DEFAULT = { lat: 9.9252, lon: 78.1198 }; // Madurai

const getCoordsForCity = (cityName) => {
  if (!cityName) return DEFAULT;
  const key = Object.keys(CITY_COORDS).find(
    (k) => k.toLowerCase() === cityName.toLowerCase()
  );
  return key ? CITY_COORDS[key] : DEFAULT;
};

const getLiveData = async (req, res) => {
  const city = req.query.city || null;
  const cityCoords = city ? getCoordsForCity(city) : null;
  const lat = parseFloat(req.query.lat) || cityCoords?.lat || DEFAULT.lat;
  const lon = parseFloat(req.query.lon) || cityCoords?.lon || DEFAULT.lon;
  console.log(`[Monitoring] Request — city: ${city || 'coords'}, lat: ${lat}, lon: ${lon}`);

  try {
    const [weather, aqi, traffic] = await Promise.all([
      getWeather(lat, lon),
      getAQI(lat, lon),
      getTraffic(lat, lon),
    ]);

    // Attach readable city label from AQI service if weather doesn't have one
    if (weather && aqi?.city) weather.city = aqi.city;

    const disruptions = analyzeRisk(weather, aqi, traffic);
    console.log(`[Monitoring] OK — disruptions: ${disruptions.length}`);
    res.json({ weather, aqi, traffic, disruptions });
  } catch (err) {
    console.error('[Monitoring] Unexpected error:', err.message);
    res.status(500).json({
      message: 'Monitoring service temporarily unavailable',
      weather: null, aqi: null, traffic: null, disruptions: [],
    });
  }
};

module.exports = { getLiveData };
