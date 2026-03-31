const axios = require('axios');

// WMO weather code → description mapping (subset)
const WMO_DESCRIPTIONS = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Heavy thunderstorm',
};

const getWeather = async (lat, lon) => {
  try {
    const { data } = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=rain,temperature_2m,relative_humidity_2m,weather_code` +
      `&forecast_days=1`,
      { timeout: 8000 }
    );

    const current = data.current;
    const rain    = current.rain ?? 0;
    const temp    = current.temperature_2m ?? null;
    const humidity = current.relative_humidity_2m ?? null;
    const condition = WMO_DESCRIPTIONS[current.weather_code] ?? 'Unknown';

    return { temp, humidity, rain, city: `${lat},${lon}`, condition };
  } catch (err) {
    console.error('[WeatherService] Failed:', err.message);
    return { temp: null, humidity: null, rain: 0, city: 'Unknown', condition: '' };
  }
};

module.exports = { getWeather };
